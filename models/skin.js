import mongoose from 'mongoose';

const skinData = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: { type: Date, default: Date.now },
    skinLog: [ String ],
    skinNotes: String,
    photos: [
        {
            url: { type: String}
        }
    ]
});

export default mongoose.model('Skin', skinData);