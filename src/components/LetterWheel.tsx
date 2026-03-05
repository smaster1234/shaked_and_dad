"use client";

interface LetterWheelProps {
  letter: string;
}

export default function LetterWheel({ letter }: LetterWheelProps) {
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      <span className="text-lg text-gray-500">האות שלכם היא:</span>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
        <span className="text-6xl font-bold text-white">{letter}</span>
      </div>
      <span className="text-sm text-gray-400">
        המציאו מילה שמתחילה באות הזו!
      </span>
    </div>
  );
}
