import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [wordCount, userCount, recentWords] = await Promise.all([
      prisma.word.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
      prisma.word.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { submittedBy: { select: { fullName: true } } },
      }),
    ]);
    return { wordCount, userCount, recentWords };
  } catch {
    return { wordCount: 0, userCount: 0, recentWords: [] };
  }
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50/30 to-amber-100/50 py-20 md:py-32">
        {/* Decorative floating elements */}
        <div className="absolute top-20 right-[10%] w-20 h-20 bg-amber-200/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 left-[15%] w-32 h-32 bg-orange-200/20 rounded-full blur-2xl animate-float-delay" />
        <div className="absolute bottom-10 right-[30%] w-24 h-24 bg-emerald-200/20 rounded-full blur-xl animate-float" />

        <div className="page-container text-center relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
              ברוכים הבאים ל<span className="gradient-text">שקדול</span>!
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              השפה החדשה שהיא רק שלנו!
              <br />
              בואו נמציא מילים ונבנה שפה ביחד.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/create" className="btn-primary text-xl py-4 px-10 animate-glow-pulse">
              בואו נמציא מילה!
            </Link>
            <Link href="/dictionary" className="btn-secondary text-xl py-4 px-10">
              צפו במילון
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 relative -mt-6">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
            <div className="card hover:shadow-lg hover:shadow-amber-200/30 hover:-translate-y-1 hover:border-amber-200/80 text-center group transition-all duration-300">
              <div className="text-5xl font-bold gradient-text group-hover:scale-110 transition-transform">{stats.wordCount}</div>
              <div className="text-gray-400 mt-2 text-lg">מילים במילון</div>
            </div>
            <div className="card hover:shadow-lg hover:shadow-emerald-200/30 hover:-translate-y-1 hover:border-emerald-200/80 text-center group transition-all duration-300">
              <div className="text-5xl font-bold text-emerald-500 group-hover:scale-110 transition-transform">{stats.userCount}</div>
              <div className="text-gray-400 mt-2 text-lg">ממציאים ומציאניות</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="page-container">
          <h2 className="section-title text-center">איך זה עובד?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-4xl">🎲</span>
              </div>
              <h3 className="text-lg font-bold mb-2">1. מקבלים אות</h3>
              <p className="text-gray-500">המחשב מגריל לכם אות מהאלף-בית העברי</p>
            </div>
            <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-4xl">✍️</span>
              </div>
              <h3 className="text-lg font-bold mb-2">2. ממציאים מילה</h3>
              <p className="text-gray-500">יש לכם 60 שניות להמציא מילה חדשה ולהסביר מה היא אומרת</p>
            </div>
            <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <span className="text-4xl">⭐</span>
              </div>
              <h3 className="text-lg font-bold mb-2">3. נכנסים למילון</h3>
              <p className="text-gray-500">ועדת השפה בודקת את המילה, ואם היא מאושרת - היא נכנסת למילון!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent words */}
      <section className="py-16 bg-gradient-to-b from-transparent to-amber-50/50">
        <div className="page-container">
          <h2 className="section-title text-center">מילים אחרונות שנכנסו למילון</h2>
          {stats.recentWords.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
              {stats.recentWords.map((w) => (
                <div key={w.id} className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-xl">{w.startingLetter}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{w.word}</h3>
                  </div>
                  <p className="text-gray-500">{w.meaning}</p>
                  <p className="text-sm text-gray-300 mt-3">
                    המציא/ה: {w.submittedBy?.fullName || "אנונימי/ת"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-8 text-lg">
              המילון עדיין ריק - היו הראשונים להמציא מילה!
            </p>
          )}
          {stats.recentWords.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/dictionary" className="text-amber-600 hover:text-amber-700 font-medium text-lg hover:underline transition-colors">
                לכל המילון &larr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-b from-amber-50/50 to-amber-100/70">
        <div className="page-container text-center">
          <h2 className="text-4xl font-bold mb-4">מוכנים להמציא?</h2>
          <p className="text-gray-500 mb-8 text-xl max-w-md mx-auto">ההשתתפות חינמית לגמרי. כל מה שצריך זה דמיון!</p>
          <Link href="/auth/register" className="btn-primary text-xl py-4 px-10 animate-glow-pulse">
            הצטרפו עכשיו - בחינם!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right">
              <span className="text-2xl font-bold text-amber-400">שקדול</span>
              <p className="text-sm mt-1 text-gray-500">השפה שאנחנו בונים יחד</p>
            </div>
            <div className="flex gap-8 text-sm">
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
