import Flow from "../models/flow.js";
import express from "express";

const router = express.Router();


/**
 * Returns the user's flow data based on the unique userId (logged in user).
 */
router.get('/', async (req, res) => {
    try {
        const flowData = await Flow.find({
            userId: req.user._id
        });

        res.status(200).json(flowData);
    } catch(err) {
        res.status(500).send(err)
    }
});

/**
 * Returns the cycle prediction of the user using the menstrual cycle API from APIVerve.
 * Creates the user's inital document on the Flow collection that contains the user's cycle data.
 */
router.post('/', async (req, res) => {
  try {
    const { cycleLength, lastPeriod, periodLength, periodDay, flowLevel, periodNotes } = req.body;
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
        lastPeriod: lastPeriod,
        cycleLength: cycleLength,
        periodLength: periodLength,
        periodDates: [
          {
            date: periodDay,
            flowLevel: flowLevel,
            notes: periodNotes
          }
        ],
        apiPrediction: data
    })

    res.status(201).json(flowData);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Updates the flow data to add a new flow day to the calendar.
 */
router.put('/period', async (req, res) => {
  try {
    const { periodDay, flowLevel, periodNotes } = req.body;

    const updateFlow = await Flow.findOne({userId: req.user._id});
    const { lastPeriod, cycleLength, periodLength } = updateFlow;

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

    const updatedFlowData = await Flow.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          periodDates: {
            date: periodDay,
            flowLevel: flowLevel,
            notes: periodNotes
          },
          $set: {
            apiPrediction: data
          }
        }
      },
      {
        new: true
      }
    );

    res.status(200).json(updatedFlowData);
  } catch(err) {
    res.status(500).send(err);
  }
});

/**
 * Updates the latest first day of the current menstrual cycle to update the data from the API.
 */
router.put('/new-cycle', async (req, res) => {
  try {
    const { latestPeriod, periodDay, flowLevel, periodNotes } = req.body;

    const flow = await Flow.findOneAndUpdate(
      {userId: req.user._id},
      {
        $set: {
          lastPeriod: latestPeriod
        }
      },
      {
        new: true
      }
    );

    const newCycle = await Flow.findOne({userId: req.user._id});
    const { lastPeriod, cycleLength, periodLength } = newCycle;

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

    const newCycleData = await Flow.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          periodDates: {
            date: periodDay,
            flowLevel: flowLevel,
            notes: periodNotes
          }
        },
        $set: {
          apiPrediction: data
        }
      },
      {
        new: true
      }
    )

    res.status(200).json(newCycleData)
  } catch(err) {
    res.status(500).send(err)
  }
});

export default router;