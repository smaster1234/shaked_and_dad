interface WordCardProps {
  word: string;
  meaning: string;
  author: string;
  letter: string;
}

const letterColors: Record<string, string> = {
  "א": "from-amber-400 to-orange-500",
  "ב": "from-blue-400 to-blue-600",
  "ג": "from-emerald-400 to-emerald-600",
  "ד": "from-purple-400 to-purple-600",
  "ה": "from-pink-400 to-pink-600",
  "ו": "from-cyan-400 to-cyan-600",
  "ז": "from-red-400 to-red-600",
  "ח": "from-indigo-400 to-indigo-600",
  "ט": "from-teal-400 to-teal-600",
  "י": "from-yellow-400 to-yellow-600",
  "כ": "from-lime-500 to-green-600",
  "ל": "from-orange-400 to-amber-600",
  "מ": "from-violet-400 to-violet-600",
  "נ": "from-fuchsia-400 to-fuchsia-600",
  "ס": "from-sky-400 to-sky-600",
  "ע": "from-rose-400 to-rose-600",
  "פ": "from-emerald-400 to-teal-600",
  "צ": "from-amber-500 to-red-500",
  "ק": "from-blue-500 to-indigo-600",
  "ר": "from-pink-500 to-purple-600",
  "ש": "from-orange-500 to-red-600",
  "ת": "from-teal-500 to-emerald-600",
};

export default function WordCard({ word, meaning, author, letter }: WordCardProps) {
  const gradient = letterColors[letter] || "from-amber-400 to-orange-500";

  return (
    <div className="card group hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-1 hover:border-amber-200/60 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-white font-bold text-xl">{letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition-colors">{word}</h3>
          <p className="text-gray-500 mt-1 leading-relaxed">{meaning}</p>
          <p className="text-sm text-gray-300 mt-3">המציא/ה: {author}</p>
        </div>
      </div>
    </div>
  );
}
