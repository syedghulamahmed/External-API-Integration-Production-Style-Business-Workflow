import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof HttpError) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  console.error("[api] unhandled error", error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
}
