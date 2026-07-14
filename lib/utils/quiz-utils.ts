import type { QuizAnswers, SemanticQuizAnswers } from "../types";

const QUIZ_KEY_MAP: Record<string, string> = {
  "1": "realName",
  "2": "culturePreference",
  "3": "genre",
  "4": "influences",
  "5": "origin",
  "6": "vibe",
  "7": "platforms",
  "8": "languages",
};

export function mapQuizAnswers(answers: QuizAnswers): SemanticQuizAnswers {
  const mapped: SemanticQuizAnswers = {};

  for (const [key, value] of Object.entries(answers)) {
    const semanticKey = QUIZ_KEY_MAP[key] ?? key;

    if (typeof value === "string") {
      mapped[semanticKey] = value;
    } else if (Array.isArray(value)) {
      mapped[semanticKey] = value;
    }
  }

  return mapped;
}

export function buildArtistContext(answers: SemanticQuizAnswers): string {
  const parts: string[] = [];

  if (answers.realName) parts.push(`Real name: ${answers.realName}`);
  if (answers.culturePreference) parts.push(`Culture in name: ${answers.culturePreference}`);
  if (answers.genre) parts.push(`Music genre: ${answers.genre}`);
  if (answers.influences) {
    const influences = Array.isArray(answers.influences)
      ? answers.influences.join(", ")
      : answers.influences;
    parts.push(`Musical influences: ${influences}`);
  }
  if (answers.origin) parts.push(`From: ${answers.origin}`);

  if (answers.platforms) {
    const platforms = Array.isArray(answers.platforms)
      ? answers.platforms.join(", ")
      : answers.platforms;
    parts.push(`Platforms: ${platforms}`);
  }

  if (answers.vibe) parts.push(`Vibe/Energy: ${answers.vibe}`);

  if (answers.languages) {
    const languages = Array.isArray(answers.languages)
      ? answers.languages.join(", ")
      : answers.languages;
    parts.push(`Languages: ${languages}`);
  }

  return parts.join("\n");
}
