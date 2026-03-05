"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface WordOption {
  word: string;
  meaning: string;
}

interface SentenceData {
  id: number;
  text: string;
  meaning: string;
  wordsUsed: string[];
  likes: number;
  createdAt: string;
  submittedBy: { fullName: string; serialNumber: number } | null;
}

export default function SentencesPage() {
  const { data: session } = useSession();
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [meaning, setMeaning] = useState("");
  const [availableWords, setAvailableWords] = useState<WordOption[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch sentences
  useEffect(() => {
    fetch("/api/sentences")
      .then((r) => r.json())
      .then((data) => {
        setSentences(data.sentences || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch available words when form opens
  useEffect(() => {
    if (showForm) {
      fetch("/api/words?limit=200")
        .then((r) => r.json())
        .then((data) => setAvailableWords(data.words || []))
        .catch(() => {});
    }
  }, [showForm]);

  function toggleWord(word: string) {
    setSelectedWords((prev) =>
      prev.includes(word)
        ? prev.filter((w) => w !== word)
        : [...prev, word]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          meaning: meaning.trim(),
          wordsUsed: selectedWords,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setSubmitting(false);
        return;
      }

      setMessage(data.message);
      setText("");
      setMeaning("");
      setSelectedWords([]);
      setShowForm(false);
      setSubmitting(false);
    } catch {
      setError("שגיאה בשליחה. נסו שוב.");
      setSubmitting(false);
    }
  }

  // Highlight shakdol words in a sentence
  function highlightWords(text: string, words: string[]) {
    if (words.length === 0) return text;

    const parts: { text: string; isWord: boolean }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      let earliestIndex = remaining.length;
      let matchedWord = "";

      for (const word of words) {
        const idx = remaining.indexOf(word);
        if (idx !== -1 && idx < earliestIndex) {
          earliestIndex = idx;
          matchedWord = word;
        }
      }

      if (matchedWord) {
        if (earliestIndex > 0) {
          parts.push({ text: remaining.slice(0, earliestIndex), isWord: false });
        }
        parts.push({ text: matchedWord, isWord: true });
        remaining = remaining.slice(earliestIndex + matchedWord.length);
      } else {
        parts.push({ text: remaining, isWord: false });
        remaining = "";
      }
    }

    return parts;
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          <span className="gradient-text-fun">משפטים בשקדולית</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          כאן הקהילה כותבת משפטים בשפת שקדול. מהמשפטים האלה נלמד את הדקדוק של השפה!
        </p>
      </div>

      {/* Write sentence CTA */}
      {session?.user && !showForm && (
        <div className="text-center mb-10">
          <button onClick={() => setShowForm(true)} className="btn-primary text-lg py-4 px-8">
            כתבו משפט בשקדולית!
          </button>
        </div>
      )}

      {/* Success/error messages */}
      {message && (
        <div className="card border-emerald-200 bg-emerald-50/50 text-center mb-8 animate-scale-in">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-emerald-700 font-medium">{message}</p>
        </div>
      )}

      {error && !showForm && (
        <div className="card border-red-200 bg-red-50/50 text-center mb-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="card mb-10 animate-scale-in">
          <h2 className="text-xl font-bold mb-6">כתבו משפט חדש</h2>

          {/* Word picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              בחרו מילים מהמילון לשלב במשפט:
            </label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
              {availableWords.length === 0 ? (
                <p className="text-gray-400 text-sm">טוענים מילים...</p>
              ) : (
                availableWords.map((w) => (
                  <button
                    key={w.word}
                    type="button"
                    onClick={() => toggleWord(w.word)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedWords.includes(w.word)
                        ? "bg-gradient-to-l from-orange-500 to-pink-500 text-white shadow-md scale-105"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                    }`}
                    title={w.meaning}
                  >
                    {w.word}
                  </button>
                ))
              )}
            </div>
            {selectedWords.length > 0 && (
              <p className="text-sm text-orange-500 mt-2 font-medium">
                נבחרו: {selectedWords.join(", ")}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="sentence-text" className="block text-sm font-medium text-gray-500 mb-1">
                המשפט (שלבו את המילים שבחרתם):
              </label>
              <textarea
                id="sentence-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input-field resize-none"
                placeholder='לדוגמא: "אתה ממש עורקלים היום"'
                rows={2}
                maxLength={200}
                disabled={submitting}
              />
              <p className="text-xs text-gray-300 mt-1">{text.length}/200</p>
            </div>

            <div>
              <label htmlFor="sentence-meaning" className="block text-sm font-medium text-gray-500 mb-1">
                מה המשפט אומר?
              </label>
              <textarea
                id="sentence-meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="input-field resize-none"
                placeholder='לדוגמא: "אתה ממש מיושן היום"'
                rows={2}
                maxLength={300}
                disabled={submitting}
              />
              <p className="text-xs text-gray-300 mt-1">{meaning.length}/300</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>
            )}

            {!submitting && text.trim() && meaning.trim() && selectedWords.length === 0 && (
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl text-sm font-medium">
                כדי לשלוח משפט, צריך לבחור לפחות מילה אחת מהמילון למעלה
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !text.trim() || !meaning.trim() || selectedWords.length === 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "שולחים..." : "שלחו את המשפט!"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); }}
                className="btn-outline"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sentences list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">טוענים משפטים...</p>
        </div>
      ) : sentences.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold mb-3">עדיין אין משפטים</h2>
          <p className="text-gray-400 mb-6">היו הראשונים לכתוב משפט בשקדולית!</p>
          {!session?.user && (
            <Link href="/auth/signin" className="btn-primary">
              התחברו כדי לכתוב
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sentences.map((s) => {
            const parts = highlightWords(s.text, s.wordsUsed);
            return (
              <div key={s.id} className="card-hover group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white text-xl">💬</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-medium text-gray-800 leading-relaxed mb-2">
                      &quot;{typeof parts === "string" ? parts : parts.map((p, i) =>
                        p.isWord ? (
                          <span key={i} className="font-bold text-orange-500 bg-orange-50 px-1 rounded">
                            {p.text}
                          </span>
                        ) : (
                          <span key={i}>{p.text}</span>
                        )
                      )}&quot;
                    </p>
                    <p className="text-gray-400 text-sm mb-3">
                      &#x2190; {s.meaning}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-300">
                      <span>
                        נכתב ע&quot;י: {s.submittedBy?.fullName || "אנונימי/ת"}
                      </span>
                      <span>
                        מילים: {s.wordsUsed.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Link to grammar */}
      <div className="text-center mt-16 mb-8">
        <div className="card bg-gradient-to-l from-purple-50/80 to-indigo-50/80 border-purple-200/40">
          <div className="text-4xl mb-3">📐</div>
          <h3 className="text-xl font-bold mb-2">חוקי הדקדוק של שקדולית</h3>
          <p className="text-gray-400 mb-4">כללים שנלמדו מהמשפטים שהקהילה כותבת</p>
          <Link href="/grammar" className="btn-primary">
            צפו בחוקי השפה
          </Link>
        </div>
      </div>
    </div>
  );
}
