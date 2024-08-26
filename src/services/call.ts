import CallModel from '../models/call';

class CallService {
    async startCall(data: any) {
        const call = new CallModel(data);
        return await call.save();
    }

    async getCall(id: string) {
        return await CallModel.findById(id);
    }
}

export default new CallService();
