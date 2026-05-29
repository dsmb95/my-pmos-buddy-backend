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
 * Creates a new document on the Flow collection that contains the user's cycle data.
 */
router.post("/", async (req, res) => {
  try {
    const { cycle_length, last_period, period_length } = req.body;
    const response = await fetch(
      `https://api.apiverve.com/v1/menstrualcycle?last_period=${last_period}&cycle_length=${cycle_length}&period_length=${period_length}&cycles=3`,
      {
        method: "GET",
        headers: {
          "X-API-Key": process.env.API_VERVE,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.json();
    console.log(data);

    const flowData = await Flow.create({
        userId: req.user._id,
        cycleLength: cycle_length,
        apiPrediction: data
    })

    res.status(201).json(flowData);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;