import { ApplicationStatus, UserRole } from "@prisma/client";
import { prisma } from "../prisma";
import { config } from "../config";
import { conflict, forbidden, notFound } from "../errors";
import { sendApplicationConfirmationEmail, sendApplicationStatusEmail } from "./emailService";

export async function closeExpiredInternships(now = new Date()) {
  const result = await prisma.internship.updateMany({
    where: { isActive: true, applicationDeadline: { lte: now } },
    data: { isActive: false }
  });
  return result.count;
}

export async function createInternship(companyId: string, input: {
  title: string; description: string; location?: string; applicationDeadline: string;
}) {
  await closeExpiredInternships();
  const activeCount = await prisma.internship.count({
    where: { companyId, isActive: true, applicationDeadline: { gt: new Date() } }
  });
  if (activeCount >= config.maxActivePostings) {
    throw conflict("Company has reached the configured active posting limit", "MAX_ACTIVE_POSTINGS_REACHED");
  }
  const deadline = new Date(input.applicationDeadline);
  if (Number.isNaN(deadline.valueOf()) || deadline <= new Date()) {
    throw conflict("Application deadline must be in the future", "INVALID_DEADLINE");
  }
  return prisma.internship.create({
    data: {
      companyId,
      title: input.title,
      description: input.description,
      location: input.location,
      applicationDeadline: deadline
    }
  });
}

export async function listInternships() {
  await closeExpiredInternships();
  return prisma.internship.findMany({
    where: { isActive: true, applicationDeadline: { gt: new Date() } },
    include: { company: true },
    orderBy: { applicationDeadline: "asc" }
  });
}

export async function createApplication(studentId: string, internshipId: string) {
  await closeExpiredInternships();
  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    include: { company: true }
  });
  if (!internship) throw notFound("Internship not found");
  if (!internship.isActive || internship.applicationDeadline <= new Date()) {
    throw conflict("Applications are closed for this internship", "APPLICATION_DEADLINE_PASSED");
  }

  const existing = await prisma.application.findUnique({
    where: { studentId_internshipId: { studentId, internshipId } }
  });
  if (existing) throw conflict("Student has already applied", "DUPLICATE_APPLICATION");

  const application = await prisma.application.create({ data: { studentId, internshipId } });
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (student) {
    void sendApplicationConfirmationEmail(student.email, application.id, internship.title)
      .then((result) => console.info("[workflow] confirmation email", result))
      .catch((error) => console.error("[workflow] confirmation email failed", error));
  }
  return application;
}

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  SUBMITTED: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
  UNDER_REVIEW: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: []
};

export async function updateApplicationStatus(actorUserId: string, applicationId: string, nextStatus: ApplicationStatus) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { internship: { include: { company: true } }, student: true }
  });
  if (!application) throw notFound("Application not found");

  const actor = await prisma.user.findUnique({ where: { id: actorUserId } });
  if (!actor) throw forbidden("Actor not found");

  const ownerAllowed = application.internship.company.userId === actorUserId;
  if (actor.role !== UserRole.ADMIN && (actor.role !== UserRole.COMPANY || !ownerAllowed)) {
    throw forbidden("Only the owning company or an admin may change status");
  }

  if (!transitions[application.status].includes(nextStatus)) {
    throw conflict("Invalid application status transition", "INVALID_STATUS_TRANSITION");
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: nextStatus }
  });

  void sendApplicationStatusEmail(
    application.student.email,
    application.id,
    application.internship.title,
    nextStatus
  ).then((result) => console.info("[workflow] status email", result))
   .catch((error) => console.error("[workflow] status email failed", error));

  return updated;
}
