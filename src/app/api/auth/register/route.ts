import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, email, age, termsAccepted } = body;

  if (!firstName || !lastName || !email || !age) {
    return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 });
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: "צריך לאשר את התקנון" }, { status: 400 });
  }

  if (age < 5 || age > 120) {
    return NextResponse.json({ error: "גיל לא תקין" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json({ error: "כתובת האימייל הזו כבר רשומה. נסו להיכנס." }, { status: 409 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: normalizedEmail,
        age,
        termsAcceptedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, userId: user.id, serialNumber: user.serialNumber });
  } catch (err: unknown) {
    if (
      typeof err === "object" && err !== null && "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "כתובת האימייל הזו כבר רשומה. נסו להיכנס." }, { status: 409 });
    }
    throw err;
  }
}
