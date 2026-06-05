import Flow from "../models/flow.js";
import express from "express";

const router = express.Router();

/**
 * Returns the user's flow data based on the unique userId (logged in user).
 */
router.get("/", async (req, res) => {
  try {
    const flowData = await Flow.find({
      userId: req.user._id,
    });

    res.status(200).json(flowData);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Returns the cycle prediction of the user using the menstrual cycle API from APIVerve.
 * Creates the user's inital document on the Flow collection that contains the user's cycle data.
 */
router.post("/", async (req, res) => {
  try {
    const {
      cycleLength,
      lastPeriod,
      periodLength,
      periodDay,
      firstDay,
      flowLevel,
      periodNotes,
      symptomList,
      additionalNotes,
    } = req.body;
    const response = await fetch(
      `https://api.apiverve.com/v1/menstrualcycle?last_period=${lastPeriod}&cycle_length=${cycleLength}&period_length=${periodLength}&cycles=3`,
      {
        method: "GET",
        headers: {
          "X-API-Key": process.env.API_VERVE,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();

    const flowData = await Flow.create({
      userId: req.user._id,
      flowData: {
        lastPeriod: lastPeriod,
        cycleLength: cycleLength,
        periodLength: periodLength,
        symptoms: [
          {
            symptomList: symptomList,
            additionalNotes: additionalNotes,
          },
        ],
        periodDates: [
          {
            periodDay,
            firstDay,
            flowLevel,
            periodNotes,
          },
        ],
        apiPrediction: data,
      },
    });

    res.status(201).json(flowData);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Updates the flow data to add a new flow day to the calendar.
 */
router.put("/", async (req, res) => {
  try {
    const {
      updateCycleLength,
      updateLastPeriod,
      updatePeriodLength,
      periodDay,
      firstDay,
      flowLevel,
      periodNotes,
      symptomList,
      additionalNotes,
    } = req.body;

    const flow = await Flow.findOne({ userId: req.user._id });

    if (!flow || !flow.flowData) {
      return res.status(404).json({ message: "Flow data not found." });
    }

    const { cycleLength, lastPeriod, periodLength } = flow.flowData;

    const apiLastPeriod = updateLastPeriod ?? lastPeriod;
    const apiCycleLength = updateCycleLength ?? cycleLength;
    const apiPeriodLength = updatePeriodLength ?? periodLength;

    const response = await fetch(
      `https://api.apiverve.com/v1/menstrualcycle?last_period=${apiLastPeriod}&cycle_length=${apiCycleLength}&period_length=${apiPeriodLength}&cycles=3`,
      {
        method: "GET",
        headers: {
          "X-API-Key": process.env.API_VERVE,
          "Content-Type": "application/json",
        },
      },
    );

    const apiData = await response.json();

    const update = {
      $set: {
        "flowData.lastPeriod": apiLastPeriod,
        "flowData.cycleLength": apiCycleLength,
        "flowData.periodLength": apiPeriodLength,
        "flowData.apiPrediction": apiData,
      },
    };

    if (symptomList?.length || additionalNotes) {
      update.$push = {
        ...update.$push,
        "flowData.symptoms": {
          symptomList: symptomList || [],
          additionalNotes: additionalNotes || "",
        },
      };
    }

    if (periodDay) {
      update.$push = {
        ...update.$push,
        "flowData.periodDates": {
          periodDay,
          firstDay,
          flowLevel,
          periodNotes: periodNotes || "",
        },
      };
    }

    const updatedFlowData = await Flow.findOneAndUpdate(
      { userId: req.user._id },
      update,
      {
        new: true,
      },
    );

    res.status(200).json(updatedFlowData);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
