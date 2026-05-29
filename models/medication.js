import mongoose from 'mongoose';

const medicationData = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medication: {type: String, required: true},
    dosage: String,
    frequency: String
});

export default mongoose.model('Medication', medicationData);