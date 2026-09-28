import { Router } from "express";
import { ApplicationStatus, UserRole } from "@prisma/client";
import { AuthedRequest, requireAuth, requireRole } from "../middleware/auth";
import { prisma } from "../prisma";
import { createApplication, createInternship, listInternships, updateApplicationStatus } from "../services/workflowService";
import { conflict, notFound } from "../errors";

export const api = Router();

api.get("/health", (_req, res) => res.json({ ok: true }));

api.get("/internships", async (_req, res, next) => {
  try { res.json({ data: await listInternships() }); } catch (e) { next(e); }
});

api.post("/internships", requireAuth, requireRole(UserRole.COMPANY, UserRole.ADMIN), async (req: AuthedRequest, res, next) => {
  try {
    const company = req.user!.role === UserRole.ADMIN
      ? await prisma.company.findUnique({ where: { id: req.body.companyId } })
      : await prisma.company.findUnique({ where: { userId: req.user!.id } });
    if (!company) throw notFound("Company profile not found");
    const result = await createInternship(company.id, req.body);
    res.status(201).json({ data: result });
  } catch (e) { next(e); }
});

api.get("/internships/mine", requireAuth, requireRole(UserRole.COMPANY, UserRole.ADMIN), async (req: AuthedRequest, res, next) => {
  try {
    const where = req.user!.role === UserRole.ADMIN ? {} : { company: { userId: req.user!.id } };
    res.json({ data: await prisma.internship.findMany({ where, orderBy: { createdAt: "desc" } }) });
  } catch (e) { next(e); }
});

api.post("/applications", requireAuth, requireRole(UserRole.STUDENT), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.body?.internshipId) throw conflict("internshipId is required", "VALIDATION_ERROR");
    const application = await createApplication(req.user!.id, req.body.internshipId);
    res.status(201).json({ data: application, notification: "Confirmation email queued best-effort." });
  } catch (e) { next(e); }
});

api.get("/applications", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const where = req.user!.role === UserRole.ADMIN
      ? {}
      : req.user!.role === UserRole.STUDENT
        ? { studentId: req.user!.id }
        : { internship: { company: { userId: req.user!.id } } };
    const data = await prisma.application.findMany({
      where,
      include: { internship: true, student: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data });
  } catch (e) { next(e); }
});

api.patch("/applications/:id/status", requireAuth, requireRole(UserRole.COMPANY, UserRole.ADMIN), async (req: AuthedRequest, res, next) => {
  try {
    const status = req.body?.status as ApplicationStatus;
    if (!Object.values(ApplicationStatus).includes(status)) throw conflict("Invalid application status", "VALIDATION_ERROR");
    const result = await updateApplicationStatus(req.user!.id, req.params.id, status);
    res.json({ data: result, notification: "Status saved; student notification queued best-effort." });
  } catch (e) { next(e); }
});

api.post("/internships/expire", requireAuth, requireRole(UserRole.ADMIN), async (_req, res, next) => {
  try {
    const { closeExpiredInternships } = await import("../services/workflowService");
    res.json({ closed: await closeExpiredInternships() });
  } catch (e) { next(e); }
});
