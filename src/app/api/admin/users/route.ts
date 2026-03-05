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
      serialNumber: true,
      firstName: true,
      lastName: true,
      fullName: true,
      email: true,
      age: true,
      role: true,
      status: true,
      warningCount: true,
      suspendedUntil: true,
      createdAt: true,
      _count: { select: { submittedWords: true } },
      submittedWords: {
        select: { status: true },
      },
    },
  });

  const usersWithStats = users.map((u) => {
    const approved = u.submittedWords.filter((w) => w.status === "APPROVED").length;
    const pending = u.submittedWords.filter((w) => w.status === "PENDING").length;
    const rejected = u.submittedWords.filter((w) => w.status === "REJECTED").length;
    const { submittedWords: _, ...rest } = u; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { ...rest, wordStats: { total: u._count.submittedWords, approved, pending, rejected } };
  });

  return NextResponse.json({ users: usersWithStats });
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { userId, action, firstName, lastName } = body;

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
    case "rename":
      if (!firstName?.trim() || !lastName?.trim()) {
        return NextResponse.json({ error: "שם פרטי ושם משפחה חובה" }, { status: 400 });
      }
      updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
      };
      auditAction = "RENAME_USER";
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
      action: auditAction as "BAN_USER" | "UNSUSPEND_USER" | "SUSPEND_USER" | "CHANGE_USER_ROLE" | "RENAME_USER",
      targetType: "USER",
      targetId: userId,
      details: { action, ...(action === "rename" ? { firstName, lastName } : {}) },
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "צריך לספק אימייל" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, fullName: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  if (user.role === "ADMIN") {
    return NextResponse.json({ error: "לא ניתן למחוק מנהל" }, { status: 403 });
  }

  // Audit log before deletion
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "DELETE_USER",
      targetType: "USER",
      targetId: user.id,
      details: { email: user.email, fullName: user.fullName },
    },
  });

  // Delete the user - words keep their submitterName/submitterEmail,
  // and submittedById is set to null via onDelete: SetNull
  await prisma.user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ success: true });
}
