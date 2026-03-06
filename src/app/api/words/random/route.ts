import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = Math.min(parseInt(searchParams.get("count") || "4"), 10);

  // Get total approved words count
  const total = await prisma.word.count({ where: { status: "APPROVED" } });

  if (total === 0) {
    return NextResponse.json({ words: [] });
  }

  // Pick random offsets
  const offsets = new Set<number>();
  const maxPicks = Math.min(count, total);
  while (offsets.size < maxPicks) {
    offsets.add(Math.floor(Math.random() * total));
  }

  // Fetch words at random offsets
  const words = await Promise.all(
    Array.from(offsets).map((offset) =>
      prisma.word.findMany({
        where: { status: "APPROVED" },
        skip: offset,
        take: 1,
        include: { submittedBy: { select: { fullName: true } } },
      })
    )
  );

  return NextResponse.json({
    words: words.flat(),
  });
}
