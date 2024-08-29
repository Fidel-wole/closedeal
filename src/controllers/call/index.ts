import { Request, Response } from "express";
import CallService from "../../services/call";
import dispatcher from "../../utils/dispatcher";
import { ICall } from "../../interfaces/call";
import { CustomRequest } from "../../interfaces/custom-request";
class CallController {
  async startCall(req: Request, res: Response) {
    const { body } = req;
    const callData: ICall = {
      userId: (req as CustomRequest).userId,
      prospectId:body.prospectId,
      startTime: new Date()
    };
    try {
      const call = await CallService.startCall(callData);
      dispatcher.DispatchSuccessMessage(res, "Call has started", call);
    } catch (err: any) {
      dispatcher.DispatchErrorMessage(res, err.message);
    }
  }

  async getCall(req: Request, res: Response) {
    try {
      const call = await CallService.getCall(req.params.id);
      res.json(call);
    } catch (err: any) {
      dispatcher.DispatchErrorMessage(res, err.message);
    }
  }

  async endCall(req:Request, res:Response){
    const {callId} = req.params;
    try{
      const endCall = await CallService.endCall(callId);
      dispatcher.DispatchSuccessMessage(res, "Call ended sucessfully", endCall)
    }catch(err:any){
      dispatcher.DispatchErrorMessage(res, err.message)
    }
  }
}

export default new CallController();
