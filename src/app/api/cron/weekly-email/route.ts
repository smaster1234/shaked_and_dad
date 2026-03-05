import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Get all active users with their contribution stats
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE", email: { not: null } },
    select: {
      id: true,
      email: true,
      firstName: true,
      fullName: true,
    },
  });

  // Get weekly stats
  const [newWordsCount, newSentencesCount, totalWords] = await Promise.all([
    prisma.word.count({ where: { status: "APPROVED", createdAt: { gte: oneWeekAgo } } }),
    prisma.sentence.count({ where: { status: "APPROVED", createdAt: { gte: oneWeekAgo } } }),
    prisma.word.count({ where: { status: "APPROVED" } }),
  ]);

  let sentCount = 0;
  let errorCount = 0;

  for (const user of users) {
    if (!user.email) continue;

    // Get this user's personal stats
    const [userWords, userSentences] = await Promise.all([
      prisma.word.count({ where: { submittedById: user.id, status: "APPROVED" } }),
      prisma.sentence.count({ where: { submittedById: user.id, status: "APPROVED" } }),
    ]);

    const firstName = user.firstName || user.fullName || "שקדוליסט/ית";

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "shaked@shakedol.org",
        to: user.email,
        subject: `עדכון שבועי מעולם השקדולית`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa; border-radius: 16px;">
            <h2 style="color: #333; margin-bottom: 8px;">שלום ${firstName}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">הנה הסיכום השבועי שלך מעולם השקדולית:</p>

            <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #eee;">
              <h3 style="color: #f97316; margin-top: 0;">התרומה שלך</h3>
              <p style="color: #555; font-size: 15px; margin: 4px 0;">מילים שתרמת: <strong>${userWords}</strong></p>
              <p style="color: #555; font-size: 15px; margin: 4px 0;">משפטים שתרמת: <strong>${userSentences}</strong></p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 1px solid #eee;">
              <h3 style="color: #8b5cf6; margin-top: 0;">מה קרה בשקדולית השבוע?</h3>
              <p style="color: #555; font-size: 15px; margin: 4px 0;">מילים חדשות שאושרו: <strong>${newWordsCount}</strong></p>
              <p style="color: #555; font-size: 15px; margin: 4px 0;">משפטים חדשים שאושרו: <strong>${newSentencesCount}</strong></p>
              <p style="color: #555; font-size: 15px; margin: 4px 0;">סה"כ מילים במילון: <strong>${totalWords}</strong></p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <p style="color: #555; font-size: 16px; margin-bottom: 16px;">השפה גדלה בזכותכם! בואו להמשיך לבנות את השקדולית:</p>
              <a href="${process.env.NEXTAUTH_URL || "https://shakedol.org"}/create" style="display: inline-block; background: linear-gradient(to left, #f97316, #ec4899); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 4px;">
                המציאו מילה חדשה
              </a>
              <a href="${process.env.NEXTAUTH_URL || "https://shakedol.org"}/sentences" style="display: inline-block; background: linear-gradient(to left, #8b5cf6, #6366f1); color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 4px;">
                כתבו משפט בשקדולית
              </a>
            </div>

            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
              קיבלתם את המייל הזה כי אתם רשומים לשקדול.
            </p>
          </div>
        `,
      });

      sentCount++;

      await prisma.emailLog.create({
        data: {
          to: user.email,
          subject: "עדכון שבועי מעולם השקדולית",
          type: "weekly_digest",
          estimatedCost: 0.001,
        },
      }).catch(() => {});
    } catch {
      errorCount++;
    }
  }

  return NextResponse.json({
    success: true,
    sent: sentCount,
    errors: errorCount,
    totalUsers: users.length,
  });
}
