import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { config } from "../config";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body?.email } });
    if (!user || !user.isActive || !(await bcrypt.compare(req.body?.password ?? "", user.passwordHash))) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Invalid credentials" } });
    }
    const token = jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: "15m" });
    res.json({ accessToken: token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { next(e); }
});
