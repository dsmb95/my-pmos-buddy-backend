import mongoose from 'mongoose';

const weightData = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weightData: [
        {
            date: { type: Date, default: Date.now },
            unit: String,
            weight: Number
        }
    ]
    
});

export default mongoose.model('Weight', weightData);