// ============================================================
// Podcast Script Prompts — Late-Night Show Writer
// ============================================================

export interface PodcastContext {
  stageName: string;
  nameReason: string;
  genre: string;
  vibe: string;
  origin?: string;
  influences?: string;
  persona?: string;
  drive?: string;
  visualWorld?: string;
  realName?: string;
  languages?: string;
}

export interface PodcastSegment {
  type: "host" | "artist" | "audience" | "music";
  text: string;
}

const SYSTEM_PROMPT = `You are the head writer for "The Stage Name Club Show" — a fictional late-night TV show in the style of Jimmy Fallon / Saturday Night Live. Your job is to write a high-energy, fun, slightly comedic interview script for a brand-new artist making their debut on the show.

RULES:
- Write 10-14 segments that alternate between host, artist, and audience
- The HOST is enthusiastic, witty, and hypes the artist up — think Jimmy Fallon energy
- The ARTIST is cool, confident, but humble — they speak in short punchy lines
- The AUDIENCE screams short reactions: "WOOOO!", "YEAH!", "LET'S GO!", screams the artist's name, etc.
- The first segment MUST be type "music" — this is the artist's theme song playing as intro
- The last segment MUST be type "music" — outro music
- Include at least 2 audience reaction segments spread throughout
- Reference SPECIFIC details from the artist's background (where they're from, their influences, their persona, their visual world)
- Make it feel personal — the host should mention something unique about THIS artist, not generic hype
- Keep each segment SHORT (1-3 sentences max) — this is a fast-paced TV show, not a documentary
- Be fun and slightly over-the-top, but not cringe
- Do NOT use any markdown, emojis, or stage directions in the text — just the spoken words

OUTPUT FORMAT: Return a JSON array of segments. Each segment has:
- "type": "host" | "artist" | "audience" | "music"
- "text": the spoken text (or "THEME MUSIC" / "OUTRO MUSIC" for music segments)

Example:
[
  {"type": "music", "text": "THEME MUSIC"},
  {"type": "host", "text": "Ladies and gentlemen, our next guest is someone I have been DYING to meet..."},
  {"type": "audience", "text": "WOOOOOO!"},
  ...
  {"type": "music", "text": "OUTRO MUSIC"}
]

Return ONLY the JSON array, no explanation.`;

export function buildPodcastSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildPodcastUserPrompt(ctx: PodcastContext): string {
  const details: string[] = [
    `Stage name: ${ctx.stageName}`,
    `Why this name: ${ctx.nameReason}`,
    `Genre: ${ctx.genre}`,
    `Vibe/energy: ${ctx.vibe}`,
  ];

  if (ctx.realName) details.push(`Real name: ${ctx.realName}`);
  if (ctx.origin) details.push(`From: ${ctx.origin}`);
  if (ctx.influences) details.push(`Musical influences: ${ctx.influences}`);
  if (ctx.persona) details.push(`On-stage persona: ${ctx.persona}`);
  if (ctx.drive) details.push(`Artistic drive: ${ctx.drive}`);
  if (ctx.visualWorld) details.push(`Visual world: ${ctx.visualWorld}`);
  if (ctx.languages) details.push(`Languages in music: ${ctx.languages}`);

  return `Write the debut episode script for this artist:\n\n${details.join("\n")}`;
}
