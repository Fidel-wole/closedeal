import { Schema, model } from 'mongoose';
import { IZoomMeeting } from '../interfaces/zoomMeeting';

const ZoomSchema = new Schema<IZoomMeeting>({
    id: { type: String, required: true },
    topic: { type: String, required: true },
    start_time: { type: Date, required: true },
    duration: { type: Number, required: true }
});

export default model<IZoomMeeting>('ZoomMeeting', ZoomSchema);
