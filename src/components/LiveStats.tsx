"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  wordCount: number;
  sentenceCount: number;
  userCount: number;
}

export default function LiveStats({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.wordCount !== undefined) {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-16 relative z-10">
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
          <Link href="/sentences" className="group">
            <div className="card-colorful border-purple-200/60 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-2 text-center p-8 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200/50 group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-300">
                <span className="text-3xl">💬</span>
              </div>
              <div className="text-6xl font-black text-purple-500 mb-2">{stats.sentenceCount}</div>
              <div className="text-gray-400 text-lg font-medium">משפטים בשקדולית</div>
              <div className="mt-3 text-sm text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                לחצו לצפייה במשפטים &larr;
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
  );
}
