import bcrypt from "bcryptjs";
import appConfig from "../configs/app";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { JWT_ACCESS_SECRET } from "../configs/env";
import { ZodError } from "zod";


export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, appConfig.constants.SALT_ROUNDS);
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function jsonwebtoken(userId: string, email: string): string {
  const secret = JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT access secret is not defined in the environment.");
  }

  return jwt.sign(
    {
      userId: userId,
      email: email,
    },
    secret,
    {
      expiresIn: "24h",
    }
  );
}

export const errorParser = (error: any) => {
  const DEFAULT_ERROR = "An error occurred";
  if (error instanceof ZodError) {
    return error.errors.map(err => err.message);
  }
  if (error instanceof Error) {
    return [error.message];
  }
  if (typeof error === "string") {
    return [error];
  }
  return [DEFAULT_ERROR];
};
