interface WordCardProps {
  word: string;
  meaning: string;
  author: string;
  letter: string;
}

export default function WordCard({ word, meaning, author, letter }: WordCardProps) {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-700 font-bold text-lg">{letter}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-gray-800">{word}</h3>
          <p className="text-gray-600 mt-1">{meaning}</p>
          <p className="text-sm text-gray-400 mt-2">המציא/ה: {author}</p>
        </div>
      </div>
    </div>
  );
}
