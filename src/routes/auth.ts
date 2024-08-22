import { Router } from "express";
import { AuthController } from "../controllers/auth";

const authRoute = Router()

authRoute.post("/auth/signup", AuthController.addUser);
authRoute.post("/auth/signin", AuthController.signUserIn)
export default authRoute