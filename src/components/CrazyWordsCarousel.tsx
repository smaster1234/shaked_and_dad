"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface CrazyWord {
  id: number;
  word: string;
  meaning: string;
  startingLetter: string;
  isFeatured: boolean;
  submittedBy: { fullName: string } | null;
}

const colors = [
  "from-orange-400 via-red-500 to-pink-500",
  "from-purple-400 via-pink-500 to-rose-500",
  "from-emerald-400 via-teal-500 to-cyan-500",
  "from-blue-400 via-indigo-500 to-purple-500",
];
const rotations = ["rotate-1", "-rotate-1", "rotate-2", "-rotate-2"];

export default function CrazyWordsCarousel({ initialWords }: { initialWords: CrazyWord[] }) {
  const [words, setWords] = useState<CrazyWord[]>(initialWords.slice(0, 4));
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const shuffle = useCallback(async () => {
    if (loading) return;
    setAnimating(true);
    setLoading(true);

    try {
      const res = await fetch("/api/words/random?count=4");
      const data = await res.json();
      if (data.words && data.words.length > 0) {
        // Small delay for exit animation
        setTimeout(() => {
          setWords(data.words);
          setAnimating(false);
        }, 200);
      } else {
        setAnimating(false);
      }
    } catch {
      setAnimating(false);
    }
    setLoading(false);
  }, [loading]);

  if (words.length === 0) return null;

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/40 to-transparent" />
      <div className="absolute top-10 left-[5%] text-8xl opacity-10 animate-float select-none">🤪</div>
      <div className="absolute bottom-10 right-[5%] text-8xl opacity-10 animate-float-delay select-none">🔥</div>
      <div className="absolute top-20 right-[15%] text-6xl opacity-10 animate-float select-none">💥</div>
      <div className="page-container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            <span className="gradient-text-fun">השיגעון</span> כבר התחיל
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            אין חוקים. אין גבולות. רק הדמיון שלכם.
            <br />
            <span className="font-bold text-gray-700">תראו מה המציאו פה:</span>
          </p>
        </div>

        {/* Carousel with arrows */}
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          {/* Right arrow (RTL - this is "previous") */}
          <button
            onClick={shuffle}
            disabled={loading}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="עוד מילים"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Words grid */}
          <div className={`flex-1 grid sm:grid-cols-2 gap-6 transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            {words.map((w, i) => (
              <div
                key={`${w.id}-${i}`}
                className={`card-hover group relative overflow-hidden ${rotations[i % rotations.length]} hover:rotate-0 transition-all duration-500`}
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-l ${colors[i % colors.length]}`} />
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 flex-shrink-0`}>
                    <span className="text-white font-black text-3xl">{w.startingLetter}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-black text-gray-800 mb-1">{w.word}</h3>
                    <p className="text-gray-500 leading-relaxed text-lg">{w.meaning}</p>
                    <p className="text-xs text-gray-300 mt-2">המציא/ה: {w.submittedBy?.fullName || "אנונימי/ת"}</p>
                  </div>
                </div>
                {w.isFeatured && (
                  <div className="absolute top-3 left-3 bg-gradient-to-l from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    בחירת הועדה
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Left arrow (RTL - this is "next") */}
          <button
            onClick={shuffle}
            disabled={loading}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-gray-400 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="עוד מילים"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        <div className="text-center mt-10">
          <Link href="/create" className="btn-primary text-xl py-5 px-12 rounded-3xl animate-glow-pulse">
            גם אני רוצה להשתגע!
          </Link>
        </div>
      </div>
    </section>
  );
}
