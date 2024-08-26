import { Router } from "express";
import MiscController from "../controllers/misc/misc";
import routeConf from "../configs/routes";
import authRoute from "./auth";
import prospectRoute from "./prospect";

const testRouter = Router();

testRouter.all(routeConf.home, MiscController.home);

const invalidRoutes = Router();
invalidRoutes.all(routeConf.wildCard, MiscController.invalidRoute);

const v1Router: Router[] = [testRouter, authRoute, prospectRoute, invalidRoutes];
export default v1Router;
