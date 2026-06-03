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
            weightData: [
                {
                    unit: unit,
                    weight: weight
                }
            ]
        });
        res.status(201).json(weightData);
    } catch(err) {
        res.status(500).send(err)
    }
});

router.put('/', async (req, res) => {
    try {
        const { unit, weight } = req.body;
        const addWeightData = await Weight.findOneAndUpdate(
            { userId: req.user._id },
            {
                $push: {
                    weightData: {
                        unit: unit,
                        weight: weight
                    }
                }
            },
            {
                new: true
            }
        );
        res.status(200).json(addWeightData);
    } catch(err) {
        res.status(500).send(err)
    }

});

export default router;