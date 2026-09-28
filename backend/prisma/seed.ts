import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass1!", 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@example.com" }, update: { passwordHash }, create: { email: "admin@example.com", name: "Admin", passwordHash, role: UserRole.ADMIN } });
  const company = await prisma.user.upsert({ where: { email: "company@example.com" }, update: { passwordHash }, create: { email: "company@example.com", name: "Demo Company", passwordHash, role: UserRole.COMPANY } });
  const student = await prisma.user.upsert({ where: { email: "student@example.com" }, update: { passwordHash }, create: { email: "student@example.com", name: "Demo Student", passwordHash, role: UserRole.STUDENT } });
  await prisma.company.upsert({ where: { userId: company.id }, update: {}, create: { userId: company.id, companyName: "TalentBridge Demo Co." } });
  await prisma.student.upsert({ where: { userId: student.id }, update: {}, create: { userId: student.id, university: "Demo University" } });
  console.info("Seeded:", admin.email, company.email, student.email);
}
main().finally(() => prisma.$disconnect());
