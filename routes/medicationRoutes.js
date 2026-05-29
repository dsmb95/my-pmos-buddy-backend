import Medication from "../models/medication.js";
import express from "express";

const router = express.Router();

/**
 * Returns the user's medications from the database.
 */
router.get('/', async (req, res) => {
  try {
    const medData = await Medication.find({
      userId: req.user._id,
    });

    res.status(200).json(medData);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Creates a new document for the Medicaiton collection in the database.
 * Allows user to submit each medication they use.
 */
router.post('/', async (req, res) => {
    try {
        const { medication, dosage, frequency } = req.body;
        const medData = await Medication.create({
            userId: req.user._id,
            medication: medication,
            dosage: dosage,
            frequency: frequency
        });

        res.status(201).json(medData);
    } catch(err) {
        res.status(500).send(err)
    }
});

export default router;