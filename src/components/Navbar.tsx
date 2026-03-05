"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [session]);

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "COMMITTEE";

  return (
    <nav className="glass-strong border-b border-amber-100/40 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="תפריט ראשי">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="שקדול - עמוד הבית">
            <span className="text-2xl font-bold gradient-text group-hover:scale-105 transition-transform">שקדול</span>
            <span className="text-sm text-gray-400 hidden sm:inline">השפה שהיא רק שלנו</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dictionary" className="text-gray-600 hover:text-amber-600 transition-colors font-medium">
              המילון
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-amber-600 transition-colors font-medium">
              אודות
            </Link>

            {session?.user ? (
              <>
                <Link href="/create" className="btn-primary text-base py-2 px-4">
                  המציאו מילה!
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-amber-600 transition-colors font-medium relative">
                  {session.user.fullName || session.user.name || "הפרופיל שלי"}
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" aria-label={`${unreadCount} התראות חדשות`}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-purple-600 hover:text-purple-800 transition-colors font-medium">
                    ניהול
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                  יציאה
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className="btn-primary text-base py-2 px-4">
                כניסה / הרשמה
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label={menuOpen ? "סגירת תפריט" : "פתיחת תפריט"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden pb-4 border-t border-gray-100 pt-2 animate-slide-up">
            <div className="flex flex-col gap-3">
              <Link href="/dictionary" className="text-gray-600 hover:text-amber-600 py-2" onClick={() => setMenuOpen(false)}>
                המילון
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-amber-600 py-2" onClick={() => setMenuOpen(false)}>
                אודות
              </Link>
              {session?.user ? (
                <>
                  <Link href="/create" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
                    המציאו מילה!
                  </Link>
                  <Link href="/profile" className="text-gray-600 hover:text-amber-600 py-2" onClick={() => setMenuOpen(false)}>
                    הפרופיל שלי
                    {unreadCount > 0 && ` (${unreadCount} התראות)`}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-purple-600 py-2" onClick={() => setMenuOpen(false)}>
                      ניהול
                    </Link>
                  )}
                  <button onClick={() => signOut()} className="text-gray-400 hover:text-gray-600 text-right py-2">
                    יציאה
                  </button>
                </>
              ) : (
                <Link href="/auth/signin" className="btn-primary text-center" onClick={() => setMenuOpen(false)}>
                  כניסה / הרשמה
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
