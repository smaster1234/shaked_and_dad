"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Timer from "@/components/Timer";
import LetterWheel from "@/components/LetterWheel";

type GameState = "idle" | "playing" | "submitting" | "success" | "expired" | "error";

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [gameState, setGameState] = useState<GameState>("idle");
  const [sessionId, setSessionId] = useState("");
  const [letter, setLetter] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [wordExists, setWordExists] = useState(false);
  const [checkingWord, setCheckingWord] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Check word duplicates in real-time
  useEffect(() => {
    if (word.trim().length < 2) {
      setWordExists(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setCheckingWord(true);
      try {
        const res = await fetch(`/api/words/check?word=${encodeURIComponent(word.trim())}`);
        const data = await res.json();
        setWordExists(data.exists);
      } catch {
        // ignore
      }
      setCheckingWord(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [word]);

  async function startGame() {
    setError("");
    try {
      const res = await fetch("/api/words/session", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setGameState("error");
        return;
      }

      setSessionId(data.sessionId);
      setLetter(data.letter);
      setExpiresAt(data.expiresAt);
      setWord("");
      setMeaning("");
      setGameState("playing");
    } catch {
      setError("שגיאה בהתחלת המשחק. נסו שוב.");
      setGameState("error");
    }
  }

  const handleExpired = useCallback(() => {
    setGameState("expired");
  }, []);

  async function handleSubmit(e: React.FormEvent, skipSuggestion = false) {
    e.preventDefault();
    if (gameState !== "playing") return;

    setError("");
    setShowSuggestion(false);
    setGameState("submitting");

    try {
      const res = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.trim(),
          meaning: meaning.trim(),
          sessionId,
          skipSuggestion,
        }),
      });

      const data = await res.json();

      // Handle definition suggestion (returned as 200 with type)
      if (data.type === "definition_suggestion" && data.suggestion) {
        setSuggestion(data.suggestion);
        setShowSuggestion(true);
        setGameState("playing");
        return;
      }

      if (!res.ok) {
        setError(data.error);
        setGameState(data.type === "moderation" ? "error" : "playing");
        return;
      }

      setSuccessMessage(data.message);
      setGameState("success");
    } catch {
      setError("שגיאה בשליחת המילה. נסו שוב.");
      setGameState("playing");
    }
  }

  function acceptSuggestion() {
    setMeaning(suggestion);
    setSuggestion("");
    setShowSuggestion(false);
  }

  function rejectSuggestion() {
    setShowSuggestion(false);
    // Resubmit with skipSuggestion=true
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(fakeEvent, true);
  }

  if (status === "loading") {
    return (
      <div className="page-container text-center mt-12">
        <p className="text-gray-500 text-lg">טוענים...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="page-container max-w-xl mx-auto mt-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span className="gradient-text">המציאו מילה חדשה!</span>
      </h1>

      {/* Idle state */}
      {gameState === "idle" && (
        <div className="card text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎯</div>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            מוכנים? תקבלו אות אקראית ויהיו לכם 60 שניות להמציא מילה חדשה שמתחילה באות הזו!
          </p>
          <button onClick={startGame} className="btn-primary text-xl py-4 px-10 animate-glow-pulse">
            יאללה, בואו נתחיל!
          </button>
        </div>
      )}

      {/* Playing state */}
      {(gameState === "playing" || gameState === "submitting") && (
        <div className="card">
          <div className="flex flex-col md:flex-row items-center justify-around gap-6 mb-8">
            <LetterWheel letter={letter} />
            <Timer expiresAt={expiresAt} onExpired={handleExpired} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
                המילה החדשה (עד 12 אותיות)
              </label>
              <input
                id="word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className={`input-field ${wordExists ? "border-red-400" : ""}`}
                placeholder={`מילה שמתחילה ב-${letter}...`}
                maxLength={12}
                disabled={gameState === "submitting"}
                autoFocus
              />
              {checkingWord && (
                <p className="text-sm text-gray-400 mt-1">בודקים...</p>
              )}
              {wordExists && (
                <p className="text-sm text-red-500 mt-1">המילה הזו כבר קיימת! נסו מילה אחרת.</p>
              )}
            </div>

            <div>
              <label htmlFor="meaning" className="block text-sm font-medium text-gray-700 mb-1">
                מה המילה אומרת? (עד 2 משפטים)
              </label>
              <textarea
                id="meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                className="input-field resize-none"
                placeholder="הסבירו את המשמעות של המילה..."
                rows={3}
                maxLength={200}
                disabled={gameState === "submitting"}
              />
              <p className="text-xs text-gray-400 mt-1">{meaning.length}/200 תווים</p>
            </div>

            {error && (
              <div role="alert" className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">{error}</div>
            )}

            {showSuggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-700 mb-2">יש לנו הצעה לשיפור ההגדרה:</p>
                <p className="text-blue-800 bg-white rounded-lg p-3 mb-3 text-sm leading-relaxed">{suggestion}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={acceptSuggestion}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    קבלו את ההצעה
                  </button>
                  <button
                    type="button"
                    onClick={rejectSuggestion}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200"
                  >
                    נשאר עם ההגדרה שלי
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={
                gameState === "submitting" ||
                !word.trim() ||
                !meaning.trim() ||
                wordExists
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gameState === "submitting" ? "שולחים..." : "שלחו את המילה!"}
            </button>
          </form>
        </div>
      )}

      {/* Success state */}
      {gameState === "success" && (
        <div className="card text-center animate-scale-in">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-emerald-500 mb-4">מעולה!</h2>
          <p className="text-gray-500 mb-8 text-lg">{successMessage}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => { setGameState("idle"); setError(""); }} className="btn-primary">
              המציאו עוד מילה!
            </button>
            <button onClick={() => router.push("/profile")} className="btn-secondary">
              ראו את המילים שלכם
            </button>
          </div>
        </div>
      )}

      {/* Expired state */}
      {gameState === "expired" && (
        <div className="card text-center animate-scale-in">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-3xl font-bold text-amber-500 mb-4">אוי, נגמר הזמן!</h2>
          <p className="text-gray-500 mb-8 text-lg">לא נורא, אפשר לנסות שוב!</p>
          <button onClick={() => { setGameState("idle"); setError(""); }} className="btn-primary">
            ננסה שוב!
          </button>
        </div>
      )}

      {/* Error state */}
      {gameState === "error" && (
        <div className="card text-center animate-scale-in">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-3xl font-bold text-red-500 mb-4">אופס</h2>
          <p className="text-gray-500 mb-8 text-lg">{error}</p>
          <button onClick={() => { setGameState("idle"); setError(""); }} className="btn-primary">
            חזרה
          </button>
        </div>
      )}
    </div>
  );
}
