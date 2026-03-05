"use client";

import { useState, useEffect } from "react";

interface AdminWord {
  id: number;
  word: string;
  meaning: string;
  startingLetter: string;
  status: string;
  submittedBy: { id: string; fullName: string; email: string };
  submissionTime: number;
  createdAt: string;
}

interface SimpleUser {
  id: string;
  fullName: string;
}

export default function AdminWordsPage() {
  const [words, setWords] = useState<AdminWord[]>([]);
  const [filter, setFilter] = useState<string>("PENDING");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [reassignWordId, setReassignWordId] = useState<number | null>(null);

  useEffect(() => {
    fetchWords();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => {
      setUsers((d.users || []).map((u: SimpleUser) => ({ id: u.id, fullName: u.fullName })));
    }).catch(() => {});
  }, []);

  async function fetchWords() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/words?status=${filter}`);
      const data = await res.json();
      setWords(data.words || []);
    } catch {
      setWords([]);
    }
    setLoading(false);
  }

  async function handleAction(wordId: number, action: "approve" | "reject", reviewNote?: string) {
    try {
      await fetch("/api/admin/words", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, action, reviewNote }),
      });
      fetchWords();
    } catch {
      alert("שגיאה בביצוע הפעולה");
    }
  }

  async function handleReassign(wordId: number, newSubmitterId: string) {
    try {
      await fetch("/api/admin/words", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId, action: "reassign", newSubmitterId }),
      });
      setReassignWordId(null);
      fetchWords();
    } catch {
      alert("שגיאה בשינוי המגיש");
    }
  }

  async function handleDelete(wordId: number) {
    if (!confirm("בטוחים שרוצים למחוק את המילה?")) return;
    try {
      await fetch("/api/admin/words", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
      fetchWords();
    } catch {
      alert("שגיאה במחיקה");
    }
  }

  return (
    <div>
      <h1 className="section-title">ניהול מילים</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "PENDING", label: "ממתינות" },
          { value: "APPROVED", label: "מאושרות" },
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
      ) : words.length === 0 ? (
        <p className="text-gray-400">אין מילים בסטטוס הזה</p>
      ) : (
        <div className="flex flex-col gap-3">
          {words.map((w) => (
            <div key={w.id} className="card">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                      {w.startingLetter}
                    </span>
                    <h3 className="text-lg font-bold">{w.word}</h3>
                  </div>
                  <p className="text-gray-600 mt-1">{w.meaning}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400 items-center">
                    <span>הגיש/ה: {w.submittedBy.fullName}</span>
                    <button
                      onClick={() => setReassignWordId(reassignWordId === w.id ? null : w.id)}
                      className="text-purple-500 hover:text-purple-700 underline"
                    >
                      שנה מגיש
                    </button>
                    <span>זמן: {w.submissionTime} שניות</span>
                    <span>{new Date(w.createdAt).toLocaleDateString("he-IL")}</span>
                  </div>

                  {/* Reassign dropdown */}
                  {reassignWordId === w.id && (
                    <div className="mt-2 p-3 bg-purple-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-1">בחרו משתמש חדש:</label>
                      <select
                        className="input-field text-sm"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleReassign(w.id, e.target.value);
                        }}
                      >
                        <option value="" disabled>בחרו משתמש...</option>
                        {users.filter(u => u.id !== w.submittedBy.id).map(u => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {filter === "PENDING" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(w.id, "approve")}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                    >
                      אישור
                    </button>
                    <button
                      onClick={() => {
                        const note = prompt("סיבת הדחייה:");
                        if (note !== null) handleAction(w.id, "reject", note);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      דחייה
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(w.id)}
                  className="text-gray-300 hover:text-red-500 text-sm"
                  title="מחק"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
