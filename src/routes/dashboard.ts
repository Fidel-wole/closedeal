import { Router } from "express";
import DashboardController from "../controllers/dashboard";
import authMiddleWare from "../middlewares/authMiddleware";

const dashboardRoute = Router();

dashboardRoute.get("/dashboard/stats", authMiddleWare, DashboardController.getDashboardStats);

export default dashboardRoute;
