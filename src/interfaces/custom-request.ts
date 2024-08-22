import { Request } from "express";
import { User } from "./user";

export interface CustomRequest extends Request {
  userId: string;
  email: string;
  user: any;
}

export interface AuthenticatedRequest<T extends User = User> extends Request {
  user: T;
}
