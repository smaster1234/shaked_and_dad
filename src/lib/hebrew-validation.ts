// Hebrew final letters (sofit) - only allowed at end of word
const FINAL_LETTERS = ["ם", "ן", "ף", "ץ", "ך"];

// All Hebrew letters (alef to tav + final letters)
const HEBREW_LETTERS_REGEX = /^[\u05D0-\u05EA]+$/;

// Hebrew alphabet for random letter generation (non-final only)
export const HEBREW_ALPHABET = [
  "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י",
  "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר",
  "ש", "ת",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateWord(word: string, requiredLetter: string, maxLength: number = 12): ValidationResult {
  if (!word || word.trim().length === 0) {
    return { valid: false, error: "צריך לכתוב מילה!" };
  }

  const trimmed = word.trim();

  if (trimmed.length > maxLength) {
    return { valid: false, error: `המילה ארוכה מדי! מקסימום ${maxLength} אותיות.` };
  }

  if (trimmed.length < 2) {
    return { valid: false, error: "המילה חייבת להכיל לפחות 2 אותיות." };
  }

  if (!HEBREW_LETTERS_REGEX.test(trimmed)) {
    return { valid: false, error: "המילה חייבת להכיל רק אותיות בעברית, בלי רווחים או סימנים." };
  }

  // Check final letters not at end
  for (let i = 0; i < trimmed.length - 1; i++) {
    if (FINAL_LETTERS.includes(trimmed[i])) {
      return {
        valid: false,
        error: `האות "${trimmed[i]}" היא אות סופית ויכולה להופיע רק בסוף המילה.`,
      };
    }
  }

  // Check that word starts with the required letter
  // Also allow the final form if applicable
  const letterMapping: Record<string, string> = {
    "כ": "ך", "מ": "ם", "נ": "ן", "פ": "ף", "צ": "ץ",
  };
  const firstChar = trimmed[0];
  if (firstChar !== requiredLetter && firstChar !== letterMapping[requiredLetter]) {
    return {
      valid: false,
      error: `המילה חייבת להתחיל באות "${requiredLetter}"!`,
    };
  }

  return { valid: true };
}

export function validateMeaning(meaning: string, maxSentences: number = 2): ValidationResult {
  if (!meaning || meaning.trim().length === 0) {
    return { valid: false, error: "צריך לכתוב הסבר למילה!" };
  }

  const trimmed = meaning.trim();

  if (trimmed.length > 200) {
    return { valid: false, error: "ההסבר ארוך מדי! נסו לקצר קצת." };
  }

  if (trimmed.length < 5) {
    return { valid: false, error: "ההסבר קצר מדי! כתבו לפחות כמה מילים." };
  }

  // Count sentences (by period, exclamation, or question mark)
  const sentences = trimmed.split(/[.!?؟]/).filter((s) => s.trim().length > 0);
  if (sentences.length > maxSentences) {
    return {
      valid: false,
      error: `ההסבר יכול להכיל עד ${maxSentences} משפטים בלבד.`,
    };
  }

  return { valid: true };
}

export function getRandomLetter(): string {
  return HEBREW_ALPHABET[Math.floor(Math.random() * HEBREW_ALPHABET.length)];
}
