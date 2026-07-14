import type { TTSProvider } from "./types";
import { elevenLabsProvider } from "./elevenlabs";

const providers: Record<string, TTSProvider> = {
  elevenlabs: elevenLabsProvider,
};

export function getTTSProvider(): TTSProvider | null {
  const name = (process.env.TTS_PROVIDER || "browser").toLowerCase();
  if (name === "browser") return null;

  const provider = providers[name];
  if (!provider) {
    throw new Error(
      `Unknown TTS provider: "${name}". Available: ${Object.keys(providers).join(", ")}`
    );
  }
  return provider;
}

export type { TTSProvider, SynthesizeResult } from "./types";
