import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - fetch all grammar rules grouped by category
export async function GET() {
  try {
    const rules = await prisma.grammarRule.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    });

    // Group by category
    const grouped: Record<string, typeof rules> = {};
    for (const rule of rules) {
      if (!grouped[rule.category]) {
        grouped[rule.category] = [];
      }
      grouped[rule.category].push(rule);
    }

    return NextResponse.json({ rules, grouped });
  } catch {
    return NextResponse.json({ rules: [], grouped: {} }, { status: 503 });
  }
}
