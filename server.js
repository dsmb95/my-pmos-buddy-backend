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

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
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
            secure: false,
            sameSite: 'lax'
        }
    })
);

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(serializeUsers);
passport.deserializeUser(deserializeUsers);
passport.use(new LocalStrategy({ usernameField: 'email'},setUpLocalStrategy));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flow', ensureAuthentication, flowRoutes);
app.use('/api/skin', ensureAuthentication, skinRoutes);
app.use('/api/medication', ensureAuthentication, medicationRoutes);
app.use('/api/weight', ensureAuthentication, weightRoutes);

// Test route
app.get('/', (req, res,) => {
    res.json({message: 'Server is running.'});
});

// Database connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error("MongoDB connection error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}.`))

