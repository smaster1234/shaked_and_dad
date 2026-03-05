"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserWord {
  id: number;
  word: string;
  meaning: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote?: string;
  createdAt: string;
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [words, setWords] = useState<UserWord[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      Promise.all([
        fetch("/api/profile/words").then((r) => r.json()),
        fetch("/api/notifications").then((r) => r.json()),
      ]).then(([wordsData, notifData]) => {
        setWords(wordsData.words || []);
        setNotifications(notifData.notifications || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [session]);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  if (status === "loading" || loading) {
    return <div className="page-container text-center mt-12"><p className="text-gray-500">טוענים...</p></div>;
  }

  if (!session) return null;

  const statusLabels: Record<string, { text: string; color: string }> = {
    PENDING: { text: "ממתינה לאישור", color: "bg-amber-100 text-amber-700" },
    APPROVED: { text: "מאושרת!", color: "bg-emerald-100 text-emerald-700" },
    REJECTED: { text: "נדחתה", color: "bg-red-100 text-red-700" },
  };

  const approvedCount = words.filter((w) => w.status === "APPROVED").length;
  const pendingCount = words.filter((w) => w.status === "PENDING").length;

  return (
    <div className="page-container max-w-3xl mx-auto">
      {/* Header */}
      <div className="card mb-6 bg-gradient-to-l from-amber-50/80 to-white/80">
        <h1 className="text-2xl font-bold gradient-text">{session.user.fullName || session.user.name}</h1>
        <p className="text-sm text-gray-300 font-mono mt-1">#{session.user.serialNumber}</p>
        <p className="text-gray-400 text-sm">{session.user.email}</p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 rounded-xl bg-amber-50/80">
            <div className="text-3xl font-bold text-amber-600">{words.length}</div>
            <div className="text-xs text-gray-400 mt-1">סה&quot;כ מילים</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-emerald-50/80">
            <div className="text-3xl font-bold text-emerald-500">{approvedCount}</div>
            <div className="text-xs text-gray-400 mt-1">מאושרות</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50/80">
            <div className="text-3xl font-bold text-gray-400">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-1">ממתינות</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">התראות</h2>
            <button onClick={markAllRead} className="text-sm text-amber-600 hover:underline">
              סמנו הכל כנקרא
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`card py-3 ${!n.isRead ? "border-amber-300 bg-amber-50/50" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{n.title}</h3>
                    <p className="text-gray-600 text-sm">{n.message}</p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-1"></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Words list */}
      <h2 className="text-xl font-bold mb-3">המילים שלי</h2>
      {words.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">עדיין לא המצאתם מילים. </p>
          <button onClick={() => router.push("/create")} className="btn-primary mt-4">
            בואו נמציא מילה!
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {words.map((w) => (
            <div key={w.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{w.word}</h3>
                  <p className="text-gray-600 text-sm">{w.meaning}</p>
                  {w.reviewNote && (
                    <p className="text-sm text-gray-400 mt-1">הערה: {w.reviewNote}</p>
                  )}
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusLabels[w.status].color}`}>
                  {statusLabels[w.status].text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
