import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../../../config/index.js";

export function auth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Authorization header is missing. Please log in to continue." });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token not found. Use format: Bearer <token>." });
  }
  try {
    const decoded: { id: number } = jwt.verify(
      token,
      config.jwt_secret as string,
    ) as { id: number };
    if (!req.body || typeof req.body !== "object") req.body = {};
    req.body.userId = decoded.id;
    (req as Request & { userId: number }).userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}
