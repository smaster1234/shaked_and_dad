import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [wordCount, userCount] = await Promise.all([
      prisma.word.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
    ]);
    return { wordCount, userCount };
  } catch {
    return { wordCount: 0, userCount: 0 };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 to-amber-100/50 py-16 md:py-24">
        <div className="page-container text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 animate-fade-in">
            ברוכים הבאים ל<span className="text-amber-600">שקדול</span>!
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            השפה החדשה שהיא רק שלנו!
            <br />
            בואו נמציא מילים ונבנה שפה ביחד.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create" className="btn-primary text-xl py-4 px-8">
              בואו נמציא מילה!
            </Link>
            <Link href="/dictionary" className="btn-secondary text-xl py-4 px-8">
              צפו במילון
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="card text-center">
              <div className="text-4xl font-bold text-amber-600">{stats.wordCount}</div>
              <div className="text-gray-500 mt-1">מילים במילון</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl font-bold text-emerald-600">{stats.userCount}</div>
              <div className="text-gray-500 mt-1">ממציאים ומציאניות</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-amber-50/30">
        <div className="page-container">
          <h2 className="section-title text-center">איך זה עובד?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎲</span>
              </div>
              <h3 className="text-lg font-bold mb-2">1. מקבלים אות</h3>
              <p className="text-gray-600">המחשב מגריל לכם אות מהאלף-בית העברי</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✍️</span>
              </div>
              <h3 className="text-lg font-bold mb-2">2. ממציאים מילה</h3>
              <p className="text-gray-600">יש לכם 60 שניות להמציא מילה חדשה ולהסביר מה היא אומרת</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-lg font-bold mb-2">3. נכנסים למילון</h3>
              <p className="text-gray-600">ועדת השפה בודקת את המילה, ואם היא מאושרת - היא נכנסת למילון!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples placeholder */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <h2 className="section-title text-center">דוגמאות ממילון השקדול</h2>
          <p className="text-center text-gray-500 mt-4 text-lg">
            דוגמאות מילים יתווספו בקרוב...
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-amber-100/50 to-amber-50">
        <div className="page-container text-center">
          <h2 className="text-3xl font-bold mb-4">מוכנים להמציא?</h2>
          <p className="text-gray-600 mb-6 text-lg">ההשתתפות חינמית לגמרי. כל מה שצריך זה דמיון!</p>
          <Link href="/auth/register" className="btn-primary text-xl py-4 px-8">
            הצטרפו עכשיו - בחינם!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-right">
              <span className="text-xl font-bold text-amber-400">שקדול</span>
              <p className="text-sm mt-1">השפה שאנחנו בונים יחד</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="hover:text-amber-400 transition-colors">אודות</Link>
              <Link href="/terms" className="hover:text-amber-400 transition-colors">תקנון</Link>
              <Link href="/dictionary" className="hover:text-amber-400 transition-colors">המילון</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
