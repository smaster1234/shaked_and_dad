import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSimilarity } from "@/lib/gemini";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "COMMITTEE")) {
    return null;
  }
  return session;
}

// POST - check similarity for a specific word
export async function POST(req: NextRequest) {
  const session = await checkAdmin();
  if (!session) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { word, meaning } = await req.json();
  if (!word) return NextResponse.json({ error: "חסרה מילה" }, { status: 400 });

  // Get all approved words for comparison
  const existingWords = await prisma.word.findMany({
    where: { status: "APPROVED" },
    select: { word: true, meaning: true },
  });

  const result = await checkSimilarity(word, meaning, existingWords);

  return NextResponse.json(result);
}
