import mongoose from 'mongoose';

const skinRoutine = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amProducts: [ String ],
    pmProducts: [ String ]
});

export default mongoose.model('SkinRoutine', skinRoutine);