"use client";

interface LetterWheelProps {
  letter: string;
}

export default function LetterWheel({ letter }: LetterWheelProps) {
  return (
    <div className="flex flex-col items-center gap-3 animate-scale-in">
      <span className="text-lg text-gray-400 font-medium">האות שלכם היא:</span>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-xl opacity-40 animate-glow-pulse" />
        <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-300/50">
          <span className="text-7xl font-bold text-white drop-shadow-lg">{letter}</span>
        </div>
      </div>
      <span className="text-sm text-gray-400">
        המציאו מילה שמתחילה באות הזו!
      </span>
    </div>
  );
}
