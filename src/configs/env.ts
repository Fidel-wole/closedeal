import { config } from "dotenv";
config();

export const {
  PORT,
  NODE_ENV,
  TERMII_API,
  JWT_ACCESS_SECRET,
  MONGO_DB_URL_DEV,
  MONGO_DB_URL_PROD,
  MONGO_DB_URL_STAGING,
  CORS_URLS,
  MAILJET_API_KEY,
  MAILJET_SECRET_KEY,

} = process.env;
