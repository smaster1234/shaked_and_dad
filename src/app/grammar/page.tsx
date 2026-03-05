"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface GrammarRuleData {
  id: number;
  title: string;
  description: string;
  examples: string[];
  category: string;
}

const categoryIcons: Record<string, string> = {
  "מטאפורות": "🌀",
  "נטיות": "🔄",
  "תחביר": "📐",
  "ביטויים": "💎",
  "כללי": "📖",
};

const categoryColors: Record<string, string> = {
  "מטאפורות": "from-orange-400 to-pink-500",
  "נטיות": "from-emerald-400 to-teal-500",
  "תחביר": "from-blue-400 to-indigo-500",
  "ביטויים": "from-purple-400 to-violet-500",
  "כללי": "from-gray-400 to-gray-500",
};

export default function GrammarPage() {
  const [grouped, setGrouped] = useState<Record<string, GrammarRuleData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/grammar")
      .then((r) => r.json())
      .then((data) => {
        setGrouped(data.grouped || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = Object.keys(grouped);

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          <span className="gradient-text-fun">חוקי השפה השקדולית</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          הכללים האלה נלמדו מהמשפטים שהקהילה כותבת.
          ככל שנכתוב יותר - נגלה יותר חוקים!
        </p>
      </div>

      {/* How it works */}
      <div className="card bg-gradient-to-l from-amber-50/80 to-orange-50/80 border-amber-200/40 mb-12">
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">🤖</div>
          <div>
            <h3 className="text-lg font-bold mb-2">איך נוצרים חוקי השפה?</h3>
            <p className="text-gray-500 leading-relaxed">
              אנשי הקהילה כותבים משפטים בשקדולית.
              מתוך התבניות של המשפטים האלה, אנחנו מזהים חוקי דקדוק שחוזרים על עצמם.
              ככה, השפה בונה את עצמה - מלמטה למעלה!
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">טוענים חוקים...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📐</div>
          <h2 className="text-2xl font-bold mb-3">עדיין אין חוקי דקדוק</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            כשיהיו מספיק משפטים בשקדולית, נתחיל לזהות חוקים ותבניות.
            בינתיים - כתבו משפטים!
          </p>
          <Link href="/sentences" className="btn-primary">
            כתבו משפט בשקדולית
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((category) => {
            const icon = categoryIcons[category] || "📖";
            const gradient = categoryColors[category] || "from-gray-400 to-gray-500";
            const rules = grouped[category];

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                    <span className="text-lg">{icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{category}</h2>
                </div>

                <div className="flex flex-col gap-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="card-hover">
                      <h3 className="text-xl font-bold mb-3 text-gray-800">{rule.title}</h3>
                      <p className="text-gray-500 mb-4 leading-relaxed">{rule.description}</p>

                      {rule.examples.length > 0 && (
                        <div className="bg-gray-50/80 rounded-xl p-4">
                          <span className="text-xs font-medium text-gray-400 block mb-2">דוגמאות:</span>
                          <div className="flex flex-col gap-2">
                            {rule.examples.map((ex, i) => (
                              <p key={i} className="text-gray-600 font-medium">
                                &quot;{ex}&quot;
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-16 mb-8">
        <p className="text-gray-400 mb-4">רוצים לעזור לבנות את השפה?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sentences" className="btn-primary">
            כתבו משפט בשקדולית
          </Link>
          <Link href="/create" className="btn-secondary">
            המציאו מילה חדשה
          </Link>
        </div>
      </div>
    </div>
  );
}
