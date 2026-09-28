import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { config } from "../config";
import { prisma } from "../prisma";

export type AuthUser = { id: string; role: UserRole; email: string; name: string };
export type AuthedRequest = Request & { user?: AuthUser };

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub?: string };
    if (!payload.sub) throw new Error("missing subject");
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "User is inactive or missing" } });
    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch {
    res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid or expired access token" } });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient role" } });
    next();
  };
}
