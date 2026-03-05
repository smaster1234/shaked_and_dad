"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("אנא הכניסו כתובת אימייל");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("email", {
        email: email.trim(),
        callbackUrl: "/create",
        redirect: false,
      });

      if (res?.error) {
        setError("שגיאה בשליחת הקישור. נסו שוב.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("שגיאה. נסו שוב.");
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
    <div className="page-container max-w-md mx-auto mt-12">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-2">כניסה לשקדול</h1>
        <p className="text-center text-gray-500 mb-6">נשלח לכם קישור לאימייל</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "שולחים..." : "שלחו לי קישור כניסה"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-4">
          עדיין לא רשומים?{" "}
          <Link href="/auth/register" className="text-amber-600 underline">
            הירשמו כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
