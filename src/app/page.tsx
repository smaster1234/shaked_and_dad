import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Logo from "@/components/Logo";

async function getStats() {
  try {
    const [wordCount, userCount, recentWords] = await Promise.all([
      prisma.word.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
      prisma.word.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 6,
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
      <section className="relative overflow-hidden hero-mesh py-24 md:py-36">
        {/* Animated decorative blobs */}
        <div className="absolute top-10 right-[5%] w-40 h-40 bg-orange-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-32 left-[8%] w-56 h-56 bg-purple-300/15 rounded-full blur-3xl animate-float-delay" />
        <div className="absolute bottom-20 right-[25%] w-48 h-48 bg-emerald-300/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-[20%] w-32 h-32 bg-pink-300/15 rounded-full blur-2xl animate-float-delay" />

        {/* Scattered Hebrew letters decoration */}
        <div className="absolute top-16 right-[15%] text-6xl text-orange-200/30 font-black rotate-12 select-none animate-float">א</div>
        <div className="absolute top-28 left-[12%] text-5xl text-purple-200/25 font-black -rotate-6 select-none animate-float-delay">מ</div>
        <div className="absolute bottom-24 right-[10%] text-7xl text-emerald-200/20 font-black rotate-[-15deg] select-none animate-float">ש</div>
        <div className="absolute bottom-32 left-[18%] text-4xl text-pink-200/25 font-black rotate-6 select-none animate-float-delay">ל</div>

        <div className="page-container text-center relative z-10">
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <Logo size="xl" />
            </div>
            <p className="text-xl md:text-2xl text-gray-500 mb-4 max-w-xl mx-auto leading-relaxed font-medium">
              השפה החדשה שהיא רק שלנו!
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-lg mx-auto">
              בואו נמציא מילים, נבנה שפה, ונכניס אותן למילון - ביחד.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/create" className="btn-primary text-xl py-5 px-12 rounded-3xl animate-glow-pulse">
              בואו נמציא מילה!
            </Link>
            <Link href="/dictionary" className="btn-outline text-xl py-5 px-12 rounded-3xl">
              צפו במילון
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - linked to pages */}
      <section className="py-16 relative -mt-8 z-10">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/dictionary" className="group">
              <div className="card-colorful border-orange-200/60 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-2 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-3xl">📖</span>
                </div>
                <div className="text-6xl font-black gradient-text mb-2">{stats.wordCount}</div>
                <div className="text-gray-400 text-lg font-medium">מילים במילון</div>
                <div className="mt-3 text-sm text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  לחצו לצפייה במילון &larr;
                </div>
              </div>
            </Link>
            <div className="card-colorful border-emerald-200/60 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-2 text-center p-8 transition-all duration-300 group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200/50 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300">
                <span className="text-3xl">👥</span>
              </div>
              <div className="text-6xl font-black text-emerald-500 mb-2">{stats.userCount}</div>
              <div className="text-gray-400 text-lg font-medium">ממציאות וממציאים</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="page-container">
          <h2 className="section-title text-center">
            איך זה עובד?
          </h2>
          <p className="text-center text-gray-400 mb-12 text-lg">שלושה צעדים פשוטים להמציא מילה חדשה</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-hover text-center group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-orange-400 to-amber-400" />
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                <span className="text-5xl">🎲</span>
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm mb-3">1</div>
              <h3 className="text-xl font-bold mb-3">מקבלים אות</h3>
              <p className="text-gray-400 leading-relaxed">המחשב מגריל לכם אות מהאלף-בית העברי</p>
            </div>
            <div className="card-hover text-center group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-emerald-400 to-teal-400" />
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-500 shadow-sm">
                <span className="text-5xl">✍️</span>
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-sm mb-3">2</div>
              <h3 className="text-xl font-bold mb-3">ממציאים מילה</h3>
              <p className="text-gray-400 leading-relaxed">יש לכם 60 שניות להמציא מילה חדשה ולהסביר מה היא אומרת</p>
            </div>
            <div className="card-hover text-center group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-purple-400 to-violet-400" />
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                <span className="text-5xl">⭐</span>
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500 text-white font-bold text-sm mb-3">3</div>
              <h3 className="text-xl font-bold mb-3">נכנסים למילון</h3>
              <p className="text-gray-400 leading-relaxed">ועדת השפה בודקת את המילה, ואם היא מאושרת - היא נכנסת למילון!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent words */}
      <section className="py-20 bg-gradient-to-b from-transparent via-orange-50/30 to-transparent">
        <div className="page-container">
          <h2 className="section-title text-center">מילים אחרונות שנכנסו למילון</h2>
          <p className="text-center text-gray-400 mb-10 text-lg">המילים הכי טריות שהומצאו</p>
          {stats.recentWords.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {stats.recentWords.map((w) => (
                <div key={w.id} className="card-hover group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-500">
                      <span className="text-white font-black text-2xl">{w.startingLetter}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{w.word}</h3>
                      <p className="text-xs text-gray-300">המציא/ה: {w.submittedBy?.fullName || "אנונימי/ת"}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 leading-relaxed">{w.meaning}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🌟</div>
              <p className="text-gray-400 text-lg mb-6">
                המילון עדיין ריק - היו הראשונים להמציא מילה!
              </p>
              <Link href="/create" className="btn-primary">
                בואו נתחיל!
              </Link>
            </div>
          )}
          {stats.recentWords.length > 0 && (
            <div className="text-center mt-10">
              <Link href="/dictionary" className="btn-outline py-3 px-8">
                לכל המילון &larr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh" />
        <div className="absolute top-10 right-[20%] w-32 h-32 bg-orange-300/15 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-10 left-[15%] w-40 h-40 bg-purple-300/10 rounded-full blur-3xl animate-float-delay" />
        <div className="page-container text-center relative z-10">
          <h2 className="text-5xl font-black mb-6">
            מוכנים <span className="gradient-text-fun">להמציא</span>?
          </h2>
          <p className="text-gray-400 mb-10 text-xl max-w-md mx-auto">ההשתתפות חינמית לגמרי. כל מה שצריך זה דמיון!</p>
          <Link href="/auth/register" className="btn-primary text-xl py-5 px-12 rounded-3xl animate-glow-pulse">
            הצטרפו עכשיו - בחינם!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right">
              <span className="text-3xl font-black text-orange-400">שקדול</span>
              <p className="text-sm mt-2 text-gray-500">השפה שאנחנו בונים יחד</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/about" className="hover:text-orange-400 transition-colors">אודות</Link>
              <Link href="/terms" className="hover:text-orange-400 transition-colors">תקנון</Link>
              <Link href="/dictionary" className="hover:text-orange-400 transition-colors">המילון</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
