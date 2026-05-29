import Weight from '../models/weight.js';
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const weightData = await Weight.find({
            userId: req.user._id
        })

        res.status(200).json(weightData);
    } catch(err) {
        res.status(500).send(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const { weight, unit } = req.body;
        const weightData = await Weight.create({
            userId: req.user._id,
            unit: unit,
            weight: weight
        });
        res.status(201).json(weightData);
    } catch(err) {
        res.status(500).send(err)
    }
});

export default router;