import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - fetch all grammar rules grouped by category
export async function GET() {
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
}
