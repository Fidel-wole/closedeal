import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dispatcher from "../utils/dispatcher";
import { JWT_ACCESS_SECRET } from "../configs/env";
import { CustomRequest } from "../interfaces/custom-request";
import AuthService from "../services/auth";

const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return dispatcher.SendUnAuthorizedMessage(res);
  }
  const token = authHeader?.split(" ")[1];
  try {
    const decodedUser = jwt.verify(token!, JWT_ACCESS_SECRET!);

    if (!decodedUser) {
      return dispatcher.SendUnAuthorizedMessage(res);
    }
    const user = await AuthService.findUserById(
      (decodedUser as JwtPayload).userId
    );

    (req as CustomRequest).userId = (decodedUser as JwtPayload).userId;
    (req as CustomRequest).email = (decodedUser as JwtPayload).email;
    next();
  } catch (err) {
    console.log(err);

    return dispatcher.SendUnAuthorizedMessage(res);
  }
};

export default authMiddleWare;
