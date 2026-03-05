import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fullName, email, age, termsAccepted } = body;

  if (!fullName || !email || !age) {
    return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 });
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: "צריך לאשר את התקנון" }, { status: 400 });
  }

  if (age < 5 || age > 120) {
    return NextResponse.json({ error: "גיל לא תקין" }, { status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: email.trim() },
  });

  if (existing) {
    return NextResponse.json({ error: "כתובת האימייל הזו כבר רשומה. נסו להיכנס." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      email: email.trim(),
      age,
      termsAcceptedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, userId: user.id });
}
