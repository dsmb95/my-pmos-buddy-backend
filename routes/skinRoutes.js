import Skin from '../models/skin.js';
import SkinRoutine from '../models/skinRoutine.js';
import express from 'express';

const router = express.Router();

/**
 * Returns the user's skin data.
 */
router.get('/', async (req, res) => {
    try {
        const skinData = await Skin.find({
            userId: req.user._id
        })
        res.status(200).json(skinData)
    } catch(err) {
        res.status(500).send(err);
    }
});

/**
 * Creates a new document on the Skin collection to store the user's skin data.
 */
router.post('/', async (req, res) => {
    try {
        const { photos, skinLog, skinNotes } = req.body;
        const skinData = await Skin.create({
            userId: req.user._id,
            skinData: [
                {
                    skinLog: skinLog,
                    skinNotes: skinNotes,
                    photos: photos
                }
            ]
        });
        res.status(201).json(skinData);
    } catch(err) {
        res.status(500).send(err);
    }
});

/**
 * Updates the skinData property for each user.
 */
router.put('/', async (req, res) => {
    try {
        const { skinLog, skinNotes, photos } = req.body;
        const addSkinData = await Skin.findOneAndUpdate(
            { userId: req.user._id },
            { 
                $push: {
                    skinData: {
                        skinLog: skinLog,
                        skinNotes: skinNotes,
                        photos: photos
                    }
                }
            },
            {
                new: true
            }
        )

        res.status(200).json(addSkinData);
    } catch(err) {
        res.status(500).send(err);
    }
});

/**
 * Returns the user's list of skin care products.
 */
router.get('/routine', async(req, res) => {
    try {
        const routine = await SkinRoutine.find({
            userId: req.user._id
        });

        res.status(200).json(routine);
    } catch(err) {
        res.status(500).send(err)
    }
});

/**
 * Creates a new document for the user's current skin care routine.
 */
router.post('/routine', async(req, res) => {
    try {
        const { am, pm } = req.body;
        const routine = await SkinRoutine.create({
            userId: req.user._id,
            amProducts: am,
            pmProducts: pm
        });

        res.status(201).json(routine);
    } catch(err) {
        res.status(500).send(err)
    }
});

/**
 * Updates the user's skin care routine.
 */
router.put('/routine', async(req, res) => {
    try {
        const { am, pm } = req.body;

        const updates = {};

        if (am) {
            updates.amProducts = am;
        }

        if (pm) {
            updates.pmProducts = pm;
        }
        
        const updatedRoutine = await SkinRoutine.findOneAndUpdate({userId: req.user._id},
            {
                $set: updates
            },
            {
                new: true
            }
        );

        res.status(200).json(updatedRoutine);
    } catch(err) {
        res.status(500).send(err)
    }
});

export default router;