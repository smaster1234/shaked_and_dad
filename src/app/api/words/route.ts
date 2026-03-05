import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateWord, validateMeaning } from "@/lib/hebrew-validation";
import { checkContentSafety, checkPronounceability } from "@/lib/gemini";
import { handleViolation, checkUserCanSubmit } from "@/lib/moderation";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "יש להתחבר כדי להמציא מילה" }, { status: 401 });
  }

  const userId = session.user.id;

  // Check if user can submit
  const canSubmit = await checkUserCanSubmit(userId);
  if (!canSubmit.canSubmit) {
    return NextResponse.json({ error: canSubmit.reason }, { status: 403 });
  }

  const body = await req.json();
  const { word, meaning, sessionId } = body;

  // Validate WordSession
  if (!sessionId) {
    return NextResponse.json({ error: "חסר מזהה סשן" }, { status: 400 });
  }

  const wordSession = await prisma.wordSession.findUnique({
    where: { id: sessionId },
  });

  if (!wordSession || wordSession.userId !== userId) {
    return NextResponse.json({ error: "סשן לא תקין" }, { status: 400 });
  }

  if (wordSession.used) {
    return NextResponse.json({ error: "כבר שלחתם מילה בסשן הזה" }, { status: 400 });
  }

  if (new Date() > wordSession.expiresAt) {
    return NextResponse.json({ error: "נגמר הזמן! נסו שוב עם מילה חדשה" }, { status: 400 });
  }

  // Get settings
  const maxWordLength = await getSettingValue("maxWordLength", "12");
  const maxSentences = await getSettingValue("maxMeaningSentences", "2");

  // Validate word
  const wordValidation = validateWord(word, wordSession.letter, parseInt(maxWordLength));
  if (!wordValidation.valid) {
    return NextResponse.json({ error: wordValidation.error }, { status: 400 });
  }

  // Validate meaning
  const meaningValidation = validateMeaning(meaning, parseInt(maxSentences));
  if (!meaningValidation.valid) {
    return NextResponse.json({ error: meaningValidation.error }, { status: 400 });
  }

  // Check for duplicates
  const existingWord = await prisma.word.findUnique({
    where: { word: word.trim() },
  });
  if (existingWord) {
    return NextResponse.json({ error: "המילה הזו כבר קיימת במילון! נסו מילה אחרת." }, { status: 409 });
  }

  // Check pronounceability with Gemini
  const pronounceCheck = await checkPronounceability(word.trim());
  if (!pronounceCheck.pronounceable) {
    return NextResponse.json({
      error: `המילה לא נשמעת כמו מילה שאפשר לבטא. ${pronounceCheck.suggestion}`,
      type: "pronounceability",
    }, { status: 400 });
  }

  // Check content safety with Gemini
  const safetyCheck = await checkContentSafety(word.trim(), meaning.trim());
  if (!safetyCheck.safe) {
    const result = await handleViolation(userId, word.trim(), meaning.trim(), safetyCheck.reason);
    return NextResponse.json({
      error: result.message,
      type: "moderation",
      action: result.action,
    }, { status: 403 });
  }

  // Calculate submission time
  const submissionTime = Math.round(
    (Date.now() - wordSession.startedAt.getTime()) / 1000
  );

  // Save word
  const newWord = await prisma.word.create({
    data: {
      word: word.trim(),
      meaning: meaning.trim(),
      startingLetter: wordSession.letter,
      submittedById: userId,
      submissionTime,
      sessionToken: sessionId,
    },
  });

  // Mark session as used
  await prisma.wordSession.update({
    where: { id: sessionId },
    data: { used: true },
  });

  // Update daily submission count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isNewDay = !user?.lastSubmissionDate || user.lastSubmissionDate < today;

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailySubmissions: isNewDay ? 1 : { increment: 1 },
      lastSubmissionDate: new Date(),
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: "GENERAL",
      title: "המילה נשלחה!",
      message: `המילה "${newWord.word}" נשלחה לאישור ועדת השפה. נעדכן אותך כשתהיה תשובה!`,
      wordId: newWord.id,
    },
  });

  return NextResponse.json({
    success: true,
    message: "המילה נשלחה לאישור! נעדכן אותך כשתהיה תשובה.",
    word: newWord,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const letter = searchParams.get("letter");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { status: "APPROVED" };

  if (letter) {
    where.startingLetter = letter;
  }

  if (search) {
    where.OR = [
      { word: { contains: search, mode: "insensitive" } },
      { meaning: { contains: search, mode: "insensitive" } },
    ];
  }

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      where,
      include: {
        submittedBy: {
          select: { fullName: true, serialNumber: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.word.count({ where }),
  ]);

  return NextResponse.json({
    words,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function getSettingValue(key: string, defaultValue: string): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({
    where: { key },
  });
  return setting?.value ?? defaultValue;
}
