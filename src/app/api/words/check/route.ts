import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ exists: false });
  }

  const existing = await prisma.word.findUnique({
    where: { word: word.trim() },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    exists: !!existing,
    status: existing?.status,
  });
}
