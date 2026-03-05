"use client";

interface LetterWheelProps {
  letter: string;
}

export default function LetterWheel({ letter }: LetterWheelProps) {
  return (
    <div className="flex flex-col items-center gap-4 animate-scale-in">
      <span className="text-lg text-gray-400 font-medium">האות שלכם היא:</span>
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-[-12px] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full blur-2xl opacity-30 animate-glow-pulse" />
        {/* Inner ring */}
        <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 shadow-2xl">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <span className="text-8xl font-black gradient-text-fun">{letter}</span>
          </div>
        </div>
      </div>
      <span className="text-sm text-gray-400">
        המציאו מילה שמתחילה באות הזו!
      </span>
    </div>
  );
}
