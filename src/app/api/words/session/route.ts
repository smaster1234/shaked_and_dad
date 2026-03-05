import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRandomLetter } from "@/lib/hebrew-validation";
import { checkUserCanSubmit } from "@/lib/moderation";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר כדי להמציא מילה" }, { status: 401 });
  }

  // Check if user can submit
  const canSubmit = await checkUserCanSubmit(session.user.id);
  if (!canSubmit.canSubmit) {
    return NextResponse.json({ error: canSubmit.reason }, { status: 403 });
  }

  // Get timer duration from settings
  const timerSetting = await prisma.siteSettings.findUnique({
    where: { key: "timerDuration" },
  });
  const timerDuration = parseInt(timerSetting?.value || "60");

  const letter = getRandomLetter();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + timerDuration * 1000);

  const wordSession = await prisma.wordSession.create({
    data: {
      userId: session.user.id,
      letter,
      startedAt: now,
      expiresAt,
    },
  });

  return NextResponse.json({
    sessionId: wordSession.id,
    letter,
    expiresAt: wordSession.expiresAt.toISOString(),
    timerDuration,
  });
}
