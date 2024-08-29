import mongoose, { Schema, model } from 'mongoose';
import { ICall } from '../interfaces/call';

const CallSchema = new Schema<ICall>({
    userId: { type: String, required: true },
    prospectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prospect', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number }, 
});

export default model<ICall>('Call', CallSchema);
                        