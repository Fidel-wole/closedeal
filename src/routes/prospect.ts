import { Router } from "express";
import ProspectController from "../controllers/prospect";
import authMiddleWare from "../middlewares/authMiddleware";

const prospectRoute = Router();
prospectRoute.post("/prospect/add-prospect", authMiddleWare, ProspectController.addProspect);
prospectRoute.get("/prospect", authMiddleWare, ProspectController.getProspects);
export default prospectRoute;