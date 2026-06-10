import Skin from "../models/skin.js";
import SkinRoutine from "../models/skinRoutine.js";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function configureCloudinary() {
  const requiredEnv = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  if (missingEnv.length) {
    const error = new Error(
      `Missing Cloudinary environment variable(s): ${missingEnv.join(", ")}`,
    );
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadToCloudinary(file) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "my-pmos-buddy/skin" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(file.buffer);
  });
}

function sendSkinError(res, err) {
  console.error("Skin route error:", err);

  res.status(err.statusCode || 500).json({
    message: err.message || "Unable to save skin data.",
  });
}

/**
 * Returns the user's skin data.
 */
router.get("/", async (req, res) => {
  try {
    const skinData = await Skin.find({
      userId: req.user._id,
    });
    res.status(200).json(skinData);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Creates a new document on the Skin collection to store the user's skin data.
 */
router.post("/", upload.array("photos"), async (req, res) => {
  try {
    const { skinNotes } = req.body;

    const skinLog = Array.isArray(req.body.skinLog)
      ? req.body.skinLog
      : [req.body.skinLog].filter(Boolean);

    const uploadedPhotos = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file)),
    );

    const photos = uploadedPhotos.map((photo) => ({
      url: photo.secure_url,
      publicId: photo.public_id,
    }));

    const skinData = await Skin.create({
      userId: req.user._id,
      skinData: [
        {
          skinLog,
          skinNotes,
          photos,
        },
      ],
    });
    res.status(201).json(skinData);
  } catch (err) {
    sendSkinError(res, err);
  }
});

/**
 * Updates the skinData property for each user.
 */
router.put("/", upload.array("photos"), async (req, res) => {
  try {
    const { skinNotes } = req.body;

    const skinLog = Array.isArray(req.body.skinLog)
      ? req.body.skinLog
      : [req.body.skinLog].filter(Boolean);

    const uploadedPhotos = await Promise.all(
      (req.files || []).map((file) => uploadToCloudinary(file)),
    );

    const photos = uploadedPhotos.map((photo) => ({
      url: photo.secure_url,
      publicId: photo.public_id,
    }));

    const addSkinData = await Skin.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          skinData: {
            skinLog: skinLog,
            skinNotes: skinNotes,
            photos: photos,
          },
        },
      },
      {
        new: true,
      },
    );

    if (!addSkinData) {
      return res.status(404).json({
        message: "Skin data not found. Create initial skin data first.",
      });
    }

    res.status(200).json(addSkinData);
  } catch (err) {
    sendSkinError(res, err);
  }
});

/**
 * Returns the user's list of skin care products.
 */
router.get("/routine", async (req, res) => {
  try {
    const routine = await SkinRoutine.find({
      userId: req.user._id,
    });

    res.status(200).json(routine);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Creates a new document for the user's current skin care routine.
 */
router.post("/routine", async (req, res) => {
  try {
    const { am, pm } = req.body;
    const routine = await SkinRoutine.create({
      userId: req.user._id,
      amProducts: am,
      pmProducts: pm,
    });

    res.status(201).json(routine);
  } catch (err) {
    res.status(500).send(err);
  }
});

/**
 * Updates the user's skin care routine.
 */
router.put("/routine", async (req, res) => {
  try {
    const { am, pm } = req.body;

    const updates = {};

    if (am) {
      updates.amProducts = am;
    }

    if (pm) {
      updates.pmProducts = pm;
    }

    const updatedRoutine = await SkinRoutine.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: updates,
      },
      {
        new: true,
      },
    );

    res.status(200).json(updatedRoutine);
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
