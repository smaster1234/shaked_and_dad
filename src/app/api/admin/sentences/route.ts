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

  const sentences = await prisma.sentence.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      submittedBy: { select: { id: true, serialNumber: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ sentences });
}

export async function PATCH(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { sentenceId, action, reviewNote } = body;

  if (!sentenceId || !action) {
    return NextResponse.json({ error: "חסרים פרטים" }, { status: 400 });
  }

  const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

  const sentence = await prisma.sentence.update({
    where: { id: sentenceId },
    data: {
      status: newStatus,
      reviewedById: session.user.id,
      reviewNote: reviewNote || null,
    },
  });

  // Create notification for user
  if (sentence.submittedById) {
    await prisma.notification.create({
      data: {
        userId: sentence.submittedById,
        type: action === "approve" ? "SENTENCE_APPROVED" : "SENTENCE_REJECTED",
        title: action === "approve" ? "המשפט אושר!" : "המשפט נדחה",
        message: action === "approve"
          ? `המשפט "${sentence.text}" אושר ופורסם!`
          : `המשפט "${sentence.text}" נדחה. ${reviewNote ? `סיבה: ${reviewNote}` : ""}`,
      },
    });
  }

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: action === "approve" ? "APPROVE_SENTENCE" : "REJECT_SENTENCE",
      targetType: "SENTENCE",
      targetId: sentenceId.toString(),
      details: { text: sentence.text, reviewNote },
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { sentenceId } = body;

  const sentence = await prisma.sentence.findUnique({ where: { id: sentenceId } });
  if (!sentence) return NextResponse.json({ error: "משפט לא נמצא" }, { status: 404 });

  await prisma.sentence.delete({ where: { id: sentenceId } });

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "DELETE_SENTENCE",
      targetType: "SENTENCE",
      targetId: sentenceId.toString(),
      details: { text: sentence.text, meaning: sentence.meaning },
    },
  });

  return NextResponse.json({ success: true });
}
