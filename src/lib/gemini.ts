import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ModerationResult {
  safe: boolean;
  reason: string;
}

export interface PronounceabilityResult {
  pronounceable: boolean;
  suggestion: string;
}

export async function checkContentSafety(
  word: string,
  meaning: string
): Promise<ModerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `אתה מנגנון סינון תוכן לאתר ילדים בעברית.
בדוק אם הטקסט הבא מכיל:
- ביטויים גזעניים
- הפליה בין המינים
- כינויי גנאי
- שמות או תיאורים פוגעניים
- תוכן לא חינוכי או לא ראוי לילדים
- קללות או ביטויים וולגריים

טקסט לבדיקה:
מילה: "${word}"
משמעות: "${meaning}"

החזר תשובה בפורמט JSON בלבד, בלי markdown:
{"safe": true, "reason": ""}
או
{"safe": false, "reason": "סיבה בעברית"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON from response, handling possible markdown wrapping
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ModerationResult;
    }

    // Default to safe if can't parse
    return { safe: true, reason: "" };
  } catch (error) {
    console.error("Gemini content check error:", error);
    // On error, default to safe to not block users, but log it
    return { safe: true, reason: "" };
  }
}

export async function checkPronounceability(
  word: string
): Promise<PronounceabilityResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `אתה בודק אם מילה בעברית ניתנת לביטוי.
מילה ניתנת לביטוי אם:
1. יש בה שילוב של עיצורים ותנועות שאפשר להגות
2. אין בה רצף של יותר מ-3 עיצורים ללא תנועה
3. היא לא מורכבת מאותיות אקראיות חסרות הגיון פונטי

המילה: "${word}"

החזר תשובה בפורמט JSON בלבד, בלי markdown:
{"pronounceable": true, "suggestion": ""}
או
{"pronounceable": false, "suggestion": "הסבר קצר בעברית"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as PronounceabilityResult;
    }

    return { pronounceable: true, suggestion: "" };
  } catch (error) {
    console.error("Gemini pronounceability check error:", error);
    return { pronounceable: true, suggestion: "" };
  }
}
