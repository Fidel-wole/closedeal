import { Request } from "express";

export type RequestWithBody<T = null> = Request<any, any, T>;

export type FilterParams<T = {}> = {
  search?: string;
  page?: string;
  limit?: string;
} & T;
