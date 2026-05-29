import User from '../models/auth.js';
import bcrypt from 'bcrypt';

/**
 * Ensures the user is authenticated before accessing authorized routes.
 */
export const ensureAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(403).json({ message: "You're not authorized to view this page." });
    }
};

/* PASSPORT SETUP */

/**
 * Setup Local Strategy
 */
export const setUpLocalStrategy = async (email, password, done) => {
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) return done (null, false);
        
        const matchedPassword = await bcrypt.compare(password, user.password);
        if (!matchedPassword) return done(null, false);

        done(null, user);
    } catch(err) {
        done(err);
    }
};

/**
 * Serialize user into a session
 */
export const serializeUsers = (user, done) => {
    done(null, user.id);
};

/**
 * Deserialize user into a full user object.
 */
export const deserializeUsers = async(id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err);
    }
};