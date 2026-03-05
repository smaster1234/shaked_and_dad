import { prisma } from "./prisma";
import { ModerationAction, UserStatus } from "@prisma/client";

export interface ModerationResult {
  allowed: boolean;
  action?: ModerationAction;
  message: string;
}

export async function handleViolation(
  userId: string,
  wordAttempt: string,
  meaningAttempt: string,
  reason: string
): Promise<ModerationResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { allowed: false, message: "משתמש לא נמצא." };
  }

  const newWarningCount = user.warningCount + 1;
  let action: ModerationAction;
  let suspendedUntil: Date | null = null;
  let status: UserStatus = user.status;
  let message: string;

  if (newWarningCount === 1) {
    action = ModerationAction.WARNING;
    status = UserStatus.WARNED;
    message = "שימו לב! המילה או ההסבר שכתבתם לא מתאימים. זו אזהרה ראשונה ואחרונה.";
  } else if (newWarningCount === 2) {
    action = ModerationAction.SUSPEND_24H;
    status = UserStatus.SUSPENDED;
    suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
    message = "בגלל שניסיתם שוב להכניס תוכן לא מתאים, החשבון שלכם מושעה ל-24 שעות.";
  } else if (newWarningCount === 3) {
    action = ModerationAction.SUSPEND_10D;
    status = UserStatus.SUSPENDED;
    suspendedUntil = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    message = "החשבון שלכם מושעה ל-10 ימים. בבקשה שמרו על שפה נקייה.";
  } else {
    action = ModerationAction.BAN;
    status = UserStatus.BANNED;
    message = "החשבון שלכם נחסם לצמיתות בגלל הפרות חוזרות.";
  }

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      warningCount: newWarningCount,
      status,
      suspendedUntil,
    },
  });

  // Log moderation action
  await prisma.moderationLog.create({
    data: {
      userId,
      wordAttempt,
      meaningAttempt,
      reason,
      actionTaken: action,
    },
  });

  // Create notification
  const notificationTitles: Record<ModerationAction, string> = {
    WARNING: "אזהרה",
    SUSPEND_24H: "השעיה ל-24 שעות",
    SUSPEND_10D: "השעיה ל-10 ימים",
    BAN: "חסימת חשבון",
  };

  await prisma.notification.create({
    data: {
      userId,
      type: action === ModerationAction.BAN ? "BAN" :
            action === ModerationAction.WARNING ? "WARNING" : "SUSPENSION",
      title: notificationTitles[action],
      message,
    },
  });

  return { allowed: false, action, message };
}

export async function checkUserCanSubmit(userId: string): Promise<{
  canSubmit: boolean;
  reason?: string;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { canSubmit: false, reason: "משתמש לא נמצא." };
  }

  if (user.status === UserStatus.BANNED) {
    return { canSubmit: false, reason: "החשבון שלכם נחסם ולא ניתן להגיש מילים." };
  }

  if (user.status === UserStatus.SUSPENDED && user.suspendedUntil) {
    if (new Date() < user.suspendedUntil) {
      const timeLeft = Math.ceil(
        (user.suspendedUntil.getTime() - Date.now()) / (1000 * 60 * 60)
      );
      return {
        canSubmit: false,
        reason: `החשבון שלכם מושעה. תוכלו לחזור בעוד ${timeLeft > 24 ? Math.ceil(timeLeft / 24) + " ימים" : timeLeft + " שעות"}.`,
      };
    }
    // Suspension expired, reactivate
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE, suspendedUntil: null },
    });
  }

  // Check daily submission limit
  const maxDaily = await getSettingValue("maxDailySubmissions", "10");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (
    user.lastSubmissionDate &&
    user.lastSubmissionDate >= today &&
    user.dailySubmissions >= parseInt(maxDaily)
  ) {
    return {
      canSubmit: false,
      reason: `הגעתם למקסימום ${maxDaily} מילים להיום! חזרו מחר 😊`,
    };
  }

  return { canSubmit: true };
}

async function getSettingValue(key: string, defaultValue: string): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key },
  });
  return setting?.value ?? defaultValue;
}
