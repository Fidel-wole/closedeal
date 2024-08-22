import { User } from "../../interfaces/user";
import { Request, Response } from "express";
import dispatcher from "../../utils/dispatcher";
import AuthService from "../../services/auth";
import logger from "../../utils/logger";
import { errorParser, hashPassword, jsonwebtoken } from "../../utils/functions";
import { AuthenticatedRequest } from "../../interfaces/custom-request";
import { RequestWithBody } from "../../types";
import { SignInSchemaType, SignUpSchemaType } from "./schema";

export class AuthController {
  static async addUser(req: RequestWithBody<SignUpSchemaType>, res: Response) {
    const { body } = req;

    const userData: User = {
      firstname: body.firstname,
      lastname: body.lastname,
      email: body.email,
      password: body.password
    };

    try {
      const user = await AuthService.findUserByEmail(body.email);

      if (user) {
        return dispatcher.DispatchErrorMessage(res, "User already exist");
      }

      userData.password = hashPassword(userData.password);
      const createUser = await AuthService.addUser(userData);
      // sendRegistrationEmail(
      //   createUser.email,
      //   createUser.full_name,
      //   verificationToken
      //);
      const token = jsonwebtoken(createUser._id, createUser.email);
      logger.info("UserController.register");

      return dispatcher.DispatchCustomMessage(
        res,
        "You have sucessfully been registered",
        201,
        "OK",
        token
      );
    } catch (err: any) {
      return dispatcher.DispatchErrorMessage(res, err.message);
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const request = req as AuthenticatedRequest;
      const {password, passwordResetToken, ...userData} = request.user;
      return dispatcher.DispatchSuccessMessage(res, "User retrieved", userData);
    } catch (err) {
      return dispatcher.DispatchErrorMessage(res, "An error occured");
    }
  }

  static async signUserIn(
    req: RequestWithBody<SignInSchemaType>,
    res: Response
  ) {
    try {
      const { token } = await AuthService.createToken({
        email: req.body.email,
        password: req.body.password,
      });
      return dispatcher.DispatchSuccessMessage(res, "User logged in sucessfully", token);
    } catch (err) {
      console.error(err); 
      return dispatcher.DispatchErrorMessage(res, errorParser(err));
    }
  }
  

}
