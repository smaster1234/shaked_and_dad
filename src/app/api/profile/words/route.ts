import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const words = await prisma.word.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      word: true,
      meaning: true,
      status: true,
      reviewNote: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ words });
}
