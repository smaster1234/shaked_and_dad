"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CompleteProfilePage() {
  const { update } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) {
      setError("אנא הכניסו שם פרטי");
      return;
    }
    if (!lastName.trim()) {
      setError("אנא הכניסו שם משפחה");
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 120) {
      setError("אנא הכניסו גיל תקין");
      return;
    }
    if (!termsAccepted) {
      setError("צריך לאשר את התקנון כדי להמשיך");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          age: parseInt(age),
          termsAccepted: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה בשמירת הפרטים");
        return;
      }

      // Refresh the session to get updated token
      await update();
      window.location.href = "/create";
    } catch {
      setError("שגיאה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-2">השלימו את הפרופיל</h1>
        <p className="text-center text-gray-500 mb-4">
          רק עוד כמה פרטים קטנים ואתם בפנים!
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
          <strong>שימו לב:</strong> השם שלכם יופיע כקרדיט קבוע על כל מילה שתכניסו לשפה. ודאו שאתם רושמים את שמכם האמיתי - זה לא ישתנה.
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                שם פרטי
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="שם פרטי"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                שם משפחה
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="שם משפחה"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              גיל
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field"
              placeholder="הגיל שלכם"
              min="5"
              max="120"
              required
            />
          </div>

          <div className="flex items-start gap-3 mt-2">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-600"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              קראתי ואני מסכים/ה ל<Link href="/terms" className="text-amber-600 underline" target="_blank">תקנון האתר</Link> ולכללי הקהילה
            </label>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "שומרים..." : "סיימתי, קדימה!"}
          </button>
        </form>
      </div>
    </div>
  );
}
