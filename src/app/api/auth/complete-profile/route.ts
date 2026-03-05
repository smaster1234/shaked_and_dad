import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "לא מחוברים" }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, age, termsAccepted } = body;

  if (!firstName || !lastName || !age) {
    return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 });
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: "צריך לאשר את התקנון" }, { status: 400 });
  }

  if (age < 5 || age > 120) {
    return NextResponse.json({ error: "גיל לא תקין" }, { status: 400 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      age,
      termsAcceptedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
