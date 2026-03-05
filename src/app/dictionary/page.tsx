"use client";

import { useState, useEffect } from "react";
import WordCard from "@/components/WordCard";
import { HEBREW_ALPHABET } from "@/lib/hebrew-validation";

interface WordData {
  id: number;
  word: string;
  meaning: string;
  startingLetter: string;
  submittedBy: { fullName: string; serialNumber: number };
}

export default function DictionaryPage() {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchWords();
  }, [selectedLetter, search, page]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchWords() {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedLetter) params.set("letter", selectedLetter);
    if (search) params.set("search", search);
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/words?${params}`);
      const data = await res.json();
      setWords(data.words || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      setWords([]);
    }
    setLoading(false);
  }

  return (
    <div className="page-container">
      <h1 className="section-title text-center">מילון השקדול</h1>
      <p className="text-center text-gray-500 mb-8">כל המילים שהומצאו ואושרו</p>

      {/* Search */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field"
          placeholder="חפשו מילה..."
        />
      </div>

      {/* Letter filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => { setSelectedLetter(null); setPage(1); }}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            !selectedLetter
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          הכל
        </button>
        {HEBREW_ALPHABET.map((l) => (
          <button
            key={l}
            onClick={() => { setSelectedLetter(l); setPage(1); }}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              selectedLetter === l
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Words grid */}
      {loading ? (
        <p className="text-center text-gray-400 text-lg">טוענים מילים...</p>
      ) : words.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-gray-500 text-lg">
            {search || selectedLetter
              ? "לא נמצאו מילים. נסו חיפוש אחר."
              : "המילון עדיין ריק. היו הראשונים להמציא מילה!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {words.map((w) => (
              <WordCard
                key={w.id}
                word={w.word}
                meaning={w.meaning}
                author={`${w.submittedBy.fullName} (#${w.submittedBy.serialNumber})`}
                letter={w.startingLetter}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                הקודם
              </button>
              <span className="px-4 py-2 text-gray-600">
                עמוד {page} מתוך {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                הבא
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
