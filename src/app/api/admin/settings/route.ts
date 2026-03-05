import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const allSettings = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  allSettings.forEach((s) => (settings[s.key] = s.value));

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const body = await req.json();
  const { settings } = body;

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 });
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }

  // Audit log
  await prisma.adminAuditLog.create({
    data: {
      adminId: session.user.id,
      action: "CHANGE_SETTING",
      targetType: "SETTING",
      targetId: "all",
      details: settings as Record<string, string>,
    },
  });

  return NextResponse.json({ success: true });
}
