import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMITTEE")) {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const words = await prisma.word.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      submittedBy: { select: { id: true, serialNumber: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ words });
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { wordId, action, reviewNote, newSubmitterId } = body;

  if (!wordId || !action) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  // Reassign word to a different user
  if (action === "reassign") {
    if (!newSubmitterId) {
      return NextResponse.json({ error: "חסר מזהה משתמש חדש" }, { status: 400 });
    }
    const targetUser = await prisma.user.findUnique({ where: { id: newSubmitterId } });
    if (!targetUser) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }
    const word = await prisma.word.update({
      where: { id: wordId },
      data: { submittedById: newSubmitterId },
    });
    await prisma.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        action: "APPROVE_WORD",
        targetType: "WORD",
        targetId: wordId.toString(),
        details: { action: "reassign", word: word.word, newSubmitter: targetUser.fullName },
      },
    });
    return NextResponse.json({ success: true });
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  const word = await prisma.word.update({
    where: { id: wordId },
    data: {
      status: newStatus,
      reviewedById: session.user.id,
      reviewNote: reviewNote || null,
    },
  });

  // Create notification for user
  await prisma.notification.create({
    data: {
      userId: word.submittedById,
      type: action === "approve" ? "WORD_APPROVED" : "WORD_REJECTED",
      title: action === "approve" ? "המילה אושרה!" : "המילה נדחתה",
      message: action === "approve"
        ? `המילה "${word.word}" אושרה ונכנסה למילון השקדול!`
        : `המילה "${word.word}" נדחתה. ${reviewNote ? `סיבה: ${reviewNote}` : ""}`,
      wordId: word.id,
    },
  });

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: action === "approve" ? "APPROVE_WORD" : "REJECT_WORD",
      targetType: "WORD",
      targetId: wordId.toString(),
      details: { word: word.word, reviewNote },
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { wordId } = body;

  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) return NextResponse.json({ error: "מילה לא נמצאה" }, { status: 404 });

  // Delete related notifications first
  await prisma.notification.deleteMany({ where: { wordId } });
  await prisma.word.delete({ where: { id: wordId } });

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "DELETE_WORD",
      targetType: "WORD",
      targetId: wordId.toString(),
      details: { word: word.word, meaning: word.meaning },
    },
  });

  return NextResponse.json({ success: true });
}
