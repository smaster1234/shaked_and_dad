import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [wordCount, sentenceCount, userCount] = await Promise.all([
      prisma.word.count({ where: { status: "APPROVED" } }),
      prisma.sentence.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
    ]);

    return NextResponse.json({ wordCount, sentenceCount, userCount });
  } catch {
    return NextResponse.json({ wordCount: 0, sentenceCount: 0, userCount: 0 });
  }
}
