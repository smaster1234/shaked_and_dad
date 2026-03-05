import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMITTEE")) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "moderation";

  if (type === "moderation") {
    const logs = await prisma.moderationLog.findMany({
      include: { user: { select: { fullName: true, serialNumber: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ logs });
  } else {
    const logs = await prisma.adminAuditLog.findMany({
      include: { admin: { select: { fullName: true, serialNumber: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ logs });
  }
}
