import Medication from "../models/medication.js";
import express from "express";

const router = express.Router();

/**
 * Returns the user's medications from the database.
 */
router.get('/', async (req, res) => {
  try {
    const medData = await Medication.findOne({
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
        const { name, dosage, frequency } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Medication name is required" });
        }
        
        const medData = await Medication.findOneAndUpdate(
            {userId: req.user._id},
            {
                $push: {
                    medications: {
                        name: name,
                        dosage: dosage,
                        frequency, frequency
                    }
                }
            },
            {
                new: true,
                upsert: true
            }
        )

        res.status(201).json(medData);
    } catch(err) {
        res.status(500).send(err)
    }
});

export default router;