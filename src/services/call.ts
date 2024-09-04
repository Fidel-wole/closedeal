import { ICall } from '../interfaces/call';
import CallModel from '../models/call';
import { Prospect } from '../models/prospect';
class CallService {
    async startCall(data: ICall) {
        const call = new CallModel(data);
        return await call.save();
    }

    async getCall(id: string) {
        return await CallModel.findById(id);
    }
    async endCall(callId: string) {
        const call = await CallModel.findById(callId);
        if (call) {
            call.endTime = new Date();
            call.duration = (call.endTime.getTime() - call.startTime.getTime()) / 1000; // Convert to seconds
            await call.save();
    
            // Update Prospect with total call duration and count
         await Prospect.findByIdAndUpdate(call.prospectId, {
                 $inc: { totalCalls: 1, totalDuration: call.duration },
             });
         }
        return call
    }
}

export default new CallService();
