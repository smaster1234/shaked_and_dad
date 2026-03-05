"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("אנא הכניסו את השם המלא שלכם");
      return;
    }
    if (!email.trim()) {
      setError("אנא הכניסו כתובת אימייל");
      return;
    }
    if (!age || parseInt(age) < 5 || parseInt(age) > 120) {
      setError("אנא הכניסו גיל תקין");
      return;
    }
    if (!termsAccepted) {
      setError("צריך לאשר את התקנון כדי להירשם");
      return;
    }

    setLoading(true);
    try {
      // First register the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          age: parseInt(age),
          termsAccepted: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "שגיאה בהרשמה");
        return;
      }

      // Then sign in with email
      await signIn("email", {
        email: email.trim(),
        callbackUrl: "/create",
        redirect: false,
      });

      setSuccess(true);
    } catch {
      setError("שגיאה בהרשמה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page-container max-w-md mx-auto mt-12 text-center">
        <div className="card">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-4">בדקו את האימייל!</h2>
          <p className="text-gray-600">
            שלחנו לכם קישור לכתובת <strong>{email}</strong>.
            <br />
            לחצו על הקישור כדי להיכנס.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-2">הרשמה לשקדול</h1>
        <p className="text-center text-gray-500 mb-6">בחינם לגמרי!</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              שם מלא
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="השם שלכם"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              כתובת אימייל
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="email@example.com"
              dir="ltr"
              required
            />
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
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "נרשמים..." : "הירשמו בחינם!"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          כבר רשומים?{" "}
          <Link href="/auth/signin" className="text-amber-600 underline">
            היכנסו כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
