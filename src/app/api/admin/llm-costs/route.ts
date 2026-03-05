import { NextResponse } from "next/server";
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

  // Get all-time stats
  const allTimeLogs = await prisma.llmUsageLog.aggregate({
    _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
    _count: true,
  });

  // Get last 30 days stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const last30DaysLogs = await prisma.llmUsageLog.aggregate({
    where: { createdAt: { gte: thirtyDaysAgo } },
    _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
    _count: true,
  });

  // Get today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayLogs = await prisma.llmUsageLog.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { inputTokens: true, outputTokens: true, totalTokens: true, estimatedCost: true },
    _count: true,
  });

  // Get breakdown by operation
  const byOperation = await prisma.llmUsageLog.groupBy({
    by: ["operation"],
    _sum: { totalTokens: true, estimatedCost: true },
    _count: true,
  });

  // Get breakdown by model
  const byModel = await prisma.llmUsageLog.groupBy({
    by: ["model"],
    _sum: { totalTokens: true, estimatedCost: true },
    _count: true,
  });

  // Recent logs
  const recentLogs = await prisma.llmUsageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Email (Resend) costs
  const emailAllTime = await prisma.emailLog.aggregate({
    _sum: { estimatedCost: true },
    _count: true,
  });

  const emailLast30Days = await prisma.emailLog.aggregate({
    where: { createdAt: { gte: thirtyDaysAgo } },
    _sum: { estimatedCost: true },
    _count: true,
  });

  const emailToday = await prisma.emailLog.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { estimatedCost: true },
    _count: true,
  });

  const emailByType = await prisma.emailLog.groupBy({
    by: ["type"],
    _sum: { estimatedCost: true },
    _count: true,
  });

  return NextResponse.json({
    allTime: {
      totalCalls: allTimeLogs._count,
      totalTokens: allTimeLogs._sum.totalTokens || 0,
      inputTokens: allTimeLogs._sum.inputTokens || 0,
      outputTokens: allTimeLogs._sum.outputTokens || 0,
      estimatedCost: allTimeLogs._sum.estimatedCost || 0,
    },
    last30Days: {
      totalCalls: last30DaysLogs._count,
      totalTokens: last30DaysLogs._sum.totalTokens || 0,
      estimatedCost: last30DaysLogs._sum.estimatedCost || 0,
    },
    today: {
      totalCalls: todayLogs._count,
      totalTokens: todayLogs._sum.totalTokens || 0,
      estimatedCost: todayLogs._sum.estimatedCost || 0,
    },
    byOperation,
    byModel,
    recentLogs,
    email: {
      allTime: { totalEmails: emailAllTime._count, estimatedCost: emailAllTime._sum.estimatedCost || 0 },
      last30Days: { totalEmails: emailLast30Days._count, estimatedCost: emailLast30Days._sum.estimatedCost || 0 },
      today: { totalEmails: emailToday._count, estimatedCost: emailToday._sum.estimatedCost || 0 },
      byType: emailByType,
    },
  });
}
