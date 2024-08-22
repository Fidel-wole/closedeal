import logger from "../../utils/logger";
import routeConf from "../../configs/routes";
import dispatcher from "../../utils/dispatcher";

export default class MiscController {
  static home(_: any, res: any) {
    const message = "Welcome to Closedeal Backend Service";
    logger.info(routeConf.home, message);

    return dispatcher.DispatchSuccessMessage(res, message);
  }

  static async invalidRoute(req: Request, res: any) {
    logger.error(req.url, null);
    return dispatcher.SendNotImplementedError(res);
  }
}
