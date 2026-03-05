"use client";

import { useState, useEffect, useCallback } from "react";

interface TimerProps {
  expiresAt: string;
  onExpired: () => void;
}

export default function Timer({ expiresAt, onExpired }: TimerProps) {
  const calculateTimeLeft = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  }, [expiresAt]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpired();
      return;
    }

    const interval = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      if (newTime <= 0) {
        onExpired();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, calculateTimeLeft, onExpired]);

  const percentage = (timeLeft / 60) * 100;
  const isUrgent = timeLeft <= 10;
  const isWarning = timeLeft <= 20 && !isUrgent;

  const colorClass = isUrgent
    ? "text-red-500"
    : isWarning
    ? "text-amber-500"
    : "text-emerald-500";

  const bgColorClass = isUrgent
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className="flex flex-col items-center gap-3" role="timer" aria-live="polite" aria-label={`נותרו ${timeLeft} שניות`}>
      <div className={`relative w-24 h-24 ${isUrgent ? "animate-timer-pulse" : ""}`}>
        {/* Circle background */}
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={bgColorClass}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        {/* Time text */}
        <div className={`absolute inset-0 flex items-center justify-center ${colorClass} font-bold text-2xl`}>
          {timeLeft}
        </div>
      </div>
      <span className="text-sm text-gray-500">
        {isUrgent ? "מהרו!" : isWarning ? "הזמן אוזל..." : "שניות נותרו"}
      </span>
    </div>
  );
}
