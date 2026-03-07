"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "sending" | "done">("form");

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
      // Step 1: Create the user
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          age: parseInt(age),
          termsAccepted: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("כתובת האימייל הזו כבר רשומה. אפשר להיכנס עם קישור באימייל.");
        } else {
          setError(data.error || "שגיאה בהרשמה");
        }
        return;
      }

      // Step 2: Send magic link
      setStep("sending");

      const signInRes = await signIn("email", {
        email: email.trim(),
        callbackUrl: "/create",
        redirect: false,
      });

      if (signInRes?.error) {
        setError("ההרשמה הצליחה אבל יש בעיה בשליחת הקישור. נסו להיכנס מדף הכניסה.");
        setStep("form");
        return;
      }

      setStep("done");
    } catch {
      setError("שגיאה בהרשמה. נסו שוב.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  }

  // Success screen
  if (step === "done") {
    return (
      <div className="page-container max-w-md mx-auto mt-12 text-center">
        <div className="card">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">נרשמתם בהצלחה!</h2>
          <p className="text-gray-600 mb-4">
            שלחנו קישור כניסה לכתובת <strong dir="ltr">{email}</strong>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-right mb-4">
            <p className="text-sm font-bold text-blue-700 mb-2">מה עכשיו?</p>
            <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
              <li>פתחו את האימייל שלכם</li>
              <li>חפשו מייל מ-&quot;שקדול&quot;</li>
              <li>לחצו על הכפתור &quot;התחבר עכשיו&quot;</li>
              <li>תגיעו ישר לדף ההמצאה!</li>
            </ol>
          </div>

          <p className="text-gray-400 text-xs">
            לא קיבלתם? בדקו בתיקיית הספאם, או{" "}
            <Link href="/auth/signin" className="text-amber-600 underline">
              נסו להיכנס שוב
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Sending screen
  if (step === "sending") {
    return (
      <div className="page-container max-w-md mx-auto mt-12 text-center">
        <div className="card">
          <div className="text-5xl mb-4 animate-bounce-gentle">📧</div>
          <h2 className="text-2xl font-bold mb-2">שולחים קישור...</h2>
          <p className="text-gray-500">רגע אחד, שולחים לכם אימייל עם קישור כניסה</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-md mx-auto mt-8">
      <div className="card">
        <h1 className="text-3xl font-bold text-center mb-2">הרשמה לשקדול</h1>
        <p className="text-center text-gray-500 mb-4">בחינם לגמרי!</p>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-xs text-amber-600 font-medium">מלאו פרטים</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-xs text-gray-400">אישור באימייל</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-xs text-gray-400">המציאו!</span>
          </div>
        </div>

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
            <p className="text-xs text-gray-400 mt-1">לכתובת הזו נשלח קישור כניסה</p>
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
              {error.includes("להיכנס") && (
                <Link href="/auth/signin" className="block mt-2 text-amber-600 underline font-medium">
                  לחצו כאן לכניסה
                </Link>
              )}
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
