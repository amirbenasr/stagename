import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { TTSProvider, SynthesizeResult } from "./types";

function getClient(): ElevenLabsClient {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  return new ElevenLabsClient({ apiKey: key });
}

function getVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID || "JBFqnCBsd6RMkjVDRZzb";
}

export const elevenLabsProvider: TTSProvider = {
  name: "elevenlabs",

  async synthesize(text: string, voiceId?: string): Promise<SynthesizeResult> {
    const client = getClient();
    const voice = voiceId || getVoiceId();

    const audioStream = await client.textToSpeech.convert(voice, {
      text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.0,
        useSpeakerBoost: true,
      },
    });

    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    return {
      audio: Buffer.from(Buffer.concat(chunks)),
      contentType: "audio/mpeg",
    };
  },
};
