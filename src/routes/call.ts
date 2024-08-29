import { Router } from "express";
import CallController from "../controllers/call"
import authMiddleWare from "../middlewares/authMiddleware";
const callRoute = Router();

callRoute.post("/call/start", authMiddleWare, CallController.startCall);
callRoute.post("/call/end/:callId", authMiddleWare, CallController.endCall);
callRoute.get("/call", authMiddleWare, CallController.getCall)

export default callRoute