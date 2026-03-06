import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateSentenceContent } from "@/lib/gemini";

export const dynamic = "force-dynamic";

// GET - fetch approved sentences
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [sentences, total] = await Promise.all([
    prisma.sentence.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        submittedBy: { select: { fullName: true, serialNumber: true } },
      },
    }),
    prisma.sentence.count({ where: { status: "APPROVED" } }),
  ]);

  return NextResponse.json({
    sentences,
    total,
    pages: Math.ceil(total / limit),
  });
}

// POST - submit a new sentence
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "יש להתחבר כדי לכתוב משפט" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { text, meaning, wordsUsed } = body;

  if (!text || !meaning) {
    return NextResponse.json(
      { error: "חסר משפט או הסבר" },
      { status: 400 }
    );
  }

  if (text.length > 200) {
    return NextResponse.json(
      { error: "המשפט ארוך מדי (עד 200 תווים)" },
      { status: 400 }
    );
  }

  if (meaning.length > 300) {
    return NextResponse.json(
      { error: "ההסבר ארוך מדי (עד 300 תווים)" },
      { status: 400 }
    );
  }

  // Verify at least one shakdol word is used
  if (!wordsUsed || wordsUsed.length === 0) {
    return NextResponse.json(
      { error: "צריך להשתמש לפחות במילה אחת מהמילון" },
      { status: 400 }
    );
  }

  // Verify words exist in dictionary
  const approvedWords = await prisma.word.findMany({
    where: { word: { in: wordsUsed }, status: "APPROVED" },
    select: { word: true },
  });

  const validWords = approvedWords.map((w) => w.word);
  if (validWords.length === 0) {
    return NextResponse.json(
      { error: "אף מילה מהמילון לא נמצאה במשפט" },
      { status: 400 }
    );
  }

  // Validate sentence content with Gemini
  const validation = await validateSentenceContent(text.trim(), meaning.trim(), validWords);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.reason || "המשפט לא עבר בדיקה" },
      { status: 400 }
    );
  }

  const sentence = await prisma.sentence.create({
    data: {
      text: text.trim(),
      meaning: meaning.trim(),
      wordsUsed: validWords,
      submittedById: session.user.id,
    },
  });

  return NextResponse.json({
    message: "המשפט נשלח לבדיקה! תודה.",
    sentence,
  });
}
