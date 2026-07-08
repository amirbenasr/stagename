import type { QuizAnswers, SemanticQuizAnswers } from "../types";

const QUIZ_KEY_MAP: Record<string, string> = {
  "1": "artistName",
  "2": "genre",
  "3": "origin",
  "4": "platforms",
  "5": "vibe",
  "6": "persona",
  "7": "drive",
  "8": "visualWorld",
  "9": "languages",
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

  if (answers.artistName) parts.push(`Artist goes by: ${answers.artistName}`);
  if (answers.genre) parts.push(`Music genre: ${answers.genre}`);
  if (answers.origin) parts.push(`From: ${answers.origin}`);

  if (answers.platforms) {
    const platforms = Array.isArray(answers.platforms)
      ? answers.platforms.join(", ")
      : answers.platforms;
    parts.push(`Platforms: ${platforms}`);
  }

  if (answers.vibe) parts.push(`Vibe/Energy: ${answers.vibe}`);
  if (answers.persona) parts.push(`On-stage persona: ${answers.persona}`);
  if (answers.drive) parts.push(`Artistic drive: ${answers.drive}`);
  if (answers.visualWorld) parts.push(`Visual world: ${answers.visualWorld}`);

  if (answers.languages) {
    const languages = Array.isArray(answers.languages)
      ? answers.languages.join(", ")
      : answers.languages;
    parts.push(`Languages: ${languages}`);
  }

  return parts.join("\n");
}
