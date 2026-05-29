import SkinRoutine from '../models/skinRoutine.js';
import express from 'express';

const router = express.Router();

/**
 * Returns the skinRoutine data of the user.
 */
router.get('/', async (req, res) => {
    try {
        const routine = await SkinRoutine.find({ 
            userId: req.user._id 
        });
        res.status(200).json(routine);
    } catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
});

/**
 * Creates a new document in the skinRoutine collection in the database.
 */
router.post('/', async (req, res) => {
    try {
        const { amProducts, pmProducts } = req.body;
        const routine = await SkinRoutine.create({
            userId: req.user._id,
            amProducts: amProducts,
            pmProducts: pmProducts
        })
        res.status(201).json(routine);
    } catch(err) {
        res.status(500).json({
            message: err.message
        });
    }
});

export default router;