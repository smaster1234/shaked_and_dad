import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Cost per million tokens for Gemini models (USD)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "gemini-2.0-flash-lite": { input: 0.075, output: 0.3 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
  "gemini-1.5-pro": { input: 1.25, output: 5.0 },
};

async function getModelName(): Promise<string> {
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key: "geminiModel" } });
    return setting?.value || "gemini-2.0-flash-lite";
  } catch {
    return "gemini-2.0-flash-lite";
  }
}

async function logUsage(modelName: string, operation: string, inputTokens: number, outputTokens: number) {
  try {
    const costs = MODEL_COSTS[modelName] || { input: 0.1, output: 0.4 };
    const estimatedCost = (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
    await prisma.llmUsageLog.create({
      data: {
        model: modelName,
        operation,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        estimatedCost,
      },
    });
  } catch (error) {
    console.error("Failed to log LLM usage:", error);
  }
}

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
    const modelName = await getModelName();
    const model = genAI.getGenerativeModel({ model: modelName });

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
    const response = result.response;
    const text = response.text().trim();

    // Log usage
    const usage = response.usageMetadata;
    if (usage) {
      await logUsage(modelName, "content_safety", usage.promptTokenCount || 0, usage.candidatesTokenCount || 0);
    }

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
    const modelName = await getModelName();
    const model = genAI.getGenerativeModel({ model: modelName });

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
    const response = result.response;
    const text = response.text().trim();

    // Log usage
    const usage = response.usageMetadata;
    if (usage) {
      await logUsage(modelName, "pronounceability", usage.promptTokenCount || 0, usage.candidatesTokenCount || 0);
    }

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
