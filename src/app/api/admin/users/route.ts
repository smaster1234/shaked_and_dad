import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserStatus, UserRole } from "@prisma/client";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMITTEE")) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      age: true,
      role: true,
      status: true,
      warningCount: true,
      suspendedUntil: true,
      createdAt: true,
      _count: { select: { submittedWords: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  let updateData: Record<string, unknown> = {};
  let auditAction: string;

  switch (action) {
    case "ban":
      updateData = { status: UserStatus.BANNED, suspendedUntil: null };
      auditAction = "BAN_USER";
      break;
    case "activate":
      updateData = { status: UserStatus.ACTIVE, suspendedUntil: null, warningCount: 0 };
      auditAction = "UNSUSPEND_USER";
      break;
    case "suspend_24h":
      updateData = {
        status: UserStatus.SUSPENDED,
        suspendedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      auditAction = "SUSPEND_USER";
      break;
    case "suspend_10d":
      updateData = {
        status: UserStatus.SUSPENDED,
        suspendedUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      };
      auditAction = "SUSPEND_USER";
      break;
    case "make_committee":
      updateData = { role: UserRole.COMMITTEE };
      auditAction = "CHANGE_USER_ROLE";
      break;
    case "make_user":
      updateData = { role: UserRole.USER };
      auditAction = "CHANGE_USER_ROLE";
      break;
    default:
      return NextResponse.json({ error: "פעולה לא מוכרת" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: auditAction as "BAN_USER" | "UNSUSPEND_USER" | "SUSPEND_USER" | "CHANGE_USER_ROLE",
      targetType: "USER",
      targetId: userId,
      details: { action },
    },
  });

  return NextResponse.json({ success: true });
}
