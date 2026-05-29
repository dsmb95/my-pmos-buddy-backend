import mongoose from 'mongoose';

const flowSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cycleLength: Number,
    symptoms: [
        {
            date: {type: Date, default: Date.now},
            symptomList: [String],
            additionalNotes: String
        }
    ],
    apiPrediction: {
        type: mongoose.Schema.Types.Mixed
    }
});

export default mongoose.model('Flow', flowSchema);