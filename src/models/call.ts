import { Schema, model } from 'mongoose';
import { ICall } from '../interfaces/call';

const CallSchema = new Schema<ICall>({
    userId: { type: String, required: true },
    startTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    transcript: { type: String }
});

export default model<ICall>('Call', CallSchema);
