import mongoose from 'mongoose';

const flowSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    flowData: {
        date: {type: Date, default: Date.now},
        lastPeriod: Date,
        cycleLength: Number,
        periodLength: Number,
        symptoms: [
            {
                date: {type: Date, default: Date.now},
                symptomList: [String],
                additionalNotes: String
            }
        ],
        periodDates: [
            {
                periodDay: Date,
                firstDay: Boolean,
                flowLevel: {
                    type: String,
                    enum: ["light", "medium", "heavy"]
                },
                periodNotes: String
            }
        ],
        apiPrediction: { type: mongoose.Schema.Types.Mixed }
           
       
    }
    
});

export default mongoose.model('Flow', flowSchema);