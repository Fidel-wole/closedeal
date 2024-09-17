import { Request, Response } from "express";
import { CustomRequest } from "../../interfaces/custom-request";
import DashboardService from "../../services/dashboard";
import Dispatcher from "../../utils/dispatcher";

export default class DashboardController {
    static async getDashboardStats(req: Request, res: Response) {
        const { userId } = req as CustomRequest;

        try {
            const dashboardStats = await DashboardService.getDashboardStats(userId);
            Dispatcher.DispatchSuccessMessage(res, "Dashboard stats fetched successfully", dashboardStats);
        } catch (err: any) {
            Dispatcher.DispatchErrorMessage(res, err.message);
        }
    }
}
