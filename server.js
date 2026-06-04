import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import {
    ensureAuthentication,
    setUpLocalStrategy,
    serializeUsers,
    deserializeUsers
} from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import flowRoutes from './routes/flowRoutes.js';
import skinRoutes from './routes/skinRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import weightRoutes from './routes/weightRoutes.js';

dotenv.config();

const requiredEnv = ['MONGO_URI', 'SESSION_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
    process.exit(1);
}

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Trust Render's proxy so secure cookies work correctly in production.
app.set("trust proxy", 1);

// Session set up
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: 'sessions',
            ttl: 14 * 24 * 60 * 60
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, 
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }
    })
);

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(serializeUsers);
passport.deserializeUser(deserializeUsers);
passport.use(new LocalStrategy({ usernameField: 'email'}, setUpLocalStrategy));

app.use(express.json());

// Test route
app.get('/', (req, res,) => {
    res.json({message: 'Server is running.'});
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flow', ensureAuthentication, flowRoutes);
app.use('/api/skin', ensureAuthentication, skinRoutes);
app.use('/api/medication', ensureAuthentication, medicationRoutes);
app.use('/api/weight', ensureAuthentication, weightRoutes);

// Database connection
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on ${PORT}.`));
    })
    .catch((err) => {
        console.error("MongoDB connection error: ", err);
        process.exit(1);
    });
