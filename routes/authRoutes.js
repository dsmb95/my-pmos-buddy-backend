import User from "../models/auth.js";
import express from "express";
import bcrypt from "bcrypt";
import passport from "passport";

const router = express.Router();

router.get("/", async(req, res) => {
  try {
    const nameUser = await User.findOne({userId: req.user._id})

    res.status(200).json(nameUser.name);
  } catch(err) {
    res.status(500).send(err)
  }
})

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: "Something went wrong during login",
      });
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid username or password",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          message: "Could not log in user",
        });
      }

      return res.status(200).json({
        message: "Login successful",
        redirectTo: "/home",
        user: {
          id: user._id,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

/**
 * Logs the user out.
 */
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.status(200).json({
        message: "You have logged out successfully",
        redirectTo: "/login",
      });
    });
  });
});

/**
 * Creates a user document on the auth collection.
 * Creates a user profile to be attached to PMOS data specific to each user.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name,
      email: email,
      password: hash,
    });

    res.status(201).json({
      message: 'User registered successfully',
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;
