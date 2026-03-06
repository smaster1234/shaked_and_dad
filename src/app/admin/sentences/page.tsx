"use client";

import { useState, useEffect } from "react";

interface AdminSentence {
  id: number;
  text: string;
  meaning: string;
  wordsUsed: string[];
  status: string;
  isFeatured: boolean;
  submittedBy: { id: string; fullName: string; serialNumber: number; email: string } | null;
  createdAt: string;
}

export default function AdminSentencesPage() {
  const [sentences, setSentences] = useState<AdminSentence[]>([]);
  const [filter, setFilter] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSentences();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchSentences() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sentences?status=${filter}`, { cache: "no-store" });
      const data = await res.json();
      setSentences(data.sentences || []);
    } catch {
      setSentences([]);
    }
    setLoading(false);
  }

  async function handleAction(sentenceId: number, action: "approve" | "reject", reviewNote?: string) {
    try {
      await fetch("/api/admin/sentences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentenceId, action, reviewNote }),
      });
      fetchSentences();
    } catch {
      alert("שגיאה בביצוע הפעולה");
    }
  }

  async function handleToggleFeatured(sentenceId: number, currentValue: boolean) {
    try {
      await fetch("/api/admin/sentences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentenceId, action: "toggleFeatured", isFeatured: !currentValue }),
      });
      fetchSentences();
    } catch {
      alert("שגיאה בעדכון");
    }
  }

  async function handleDelete(sentenceId: number) {
    if (!confirm("בטוחים שרוצים למחוק את המשפט?")) return;
    try {
      await fetch("/api/admin/sentences", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentenceId }),
      });
      fetchSentences();
    } catch {
      alert("שגיאה במחיקה");
    }
  }

  return (
    <div>
      <h1 className="section-title">ניהול משפטים</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "PENDING", label: "ממתינים" },
          { value: "APPROVED", label: "מאושרים" },
          { value: "REJECTED", label: "נדחו" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.value
                ? "bg-purple-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">טוענים...</p>
      ) : sentences.length === 0 ? (
        <p className="text-gray-400">אין משפטים בסטטוס הזה</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sentences.map((s) => (
            <div key={s.id} className="card">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">&quot;{s.text}&quot;</h3>
                    {s.isFeatured && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        בחירת הועדה
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{s.meaning}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {s.wordsUsed.map((word) => (
                      <span
                        key={word}
                        className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                    <span>הגיש/ה: {s.submittedBy?.fullName || "אנונימי/ת"} {s.submittedBy ? `(#${s.submittedBy.serialNumber})` : ""}</span>
                    <span>{new Date(s.createdAt).toLocaleDateString("he-IL")}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                  {filter === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(s.id, "approve")}
                        className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                      >
                        אישור
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt("סיבת הדחייה:");
                          if (note !== null) handleAction(s.id, "reject", note);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        דחייה
                      </button>
                    </div>
                  )}
                  {filter === "APPROVED" && (
                    <button
                      onClick={() => handleToggleFeatured(s.id, s.isFeatured)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        s.isFeatured
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "bg-gray-100 text-gray-600 hover:bg-amber-100"
                      }`}
                    >
                      {s.isFeatured ? "הסר מבחירת הועדה" : "בחירת הועדה"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-gray-300 hover:text-red-500 text-sm"
                    title="מחק"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
