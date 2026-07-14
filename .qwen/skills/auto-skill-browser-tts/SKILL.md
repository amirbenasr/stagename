---
name: browser-tts
description: Modular TTS — ElevenLabs official SDK (free-tier voice) as primary, browser SpeechSynthesis as fallback, with provider abstraction for swapping
source: auto-skill
extracted_at: '2026-07-13T16:55:24.993Z'
---

# Modular Text-to-Speech Architecture

Two-tier TTS: **ElevenLabs official SDK** (pay-as-you-go, free-tier voice) as primary via server API, **browser SpeechSynthesis** as client-side fallback. Provider abstraction (`lib/tts/`) mirrors `lib/payments/` pattern.

## Architecture

```
app/components/SpeakButton  — tries /api/tts first, falls back to browser TTS
lib/tts/types.ts            — TTSProvider interface (synthesize → audio buffer)
lib/tts/elevenlabs.ts       — Official @elevenlabs/elevenlabs-js SDK
lib/tts/index.ts            — getTTSProvider() factory, reads TTS_PROVIDER env var
app/api/tts/route.ts        — Server-side TTS endpoint (returns audio blob)
```

## ElevenLabs Setup

### Package: `@elevenlabs/elevenlabs-js` (NOT the deprecated `elevenlabs`)

```bash
npm install @elevenlabs/elevenlabs-js
```

### Provider implementation:

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

const audioStream = await client.textToSpeech.convert(voiceId, {
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

// Collect stream chunks (use getReader() — for-await causes TS build error)
const chunks: Uint8Array[] = [];
const reader = audioStream.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  chunks.push(value);
}
```

**Note:** SDK uses camelCase params (`modelId`, `voiceSettings`, `outputFormat`) — NOT snake_case.

### Env vars:

```
TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb  # optional, defaults to George
```

## ElevenLabs Free Tier Gotchas

1. **Library voices require paid plan** — API returns 402 `paid_plan_required` for most pre-made voices
2. **Some pre-made voices work on free tier** — `JBFqnCBsd6RMkjVDRZzb` (George) confirmed working
3. **Use `api.elevenlabs.io`** — NOT `api.us.elevenlabs.io` (US region endpoint also gives 402 for free users)
4. **Website vs API difference** — voices that work on elevenlabs.io dashboard may NOT work via API on free tier
5. **Test voices in the dashboard API playground** before hardcoding — the 402 error message is misleading

## Fallback: Browser SpeechSynthesis

```typescript
function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const chosenVoice =
    voices.find((v) => v.name.includes("Microsoft Mark")) ||
    voices.find((v) => v.name.includes("Google US English")) ||
    voices.find((v) => v.name.includes("Samantha")) ||
    voices.find((v) => v.name.includes("Natural")) ||
    voices.find((v) => v.name.includes("Neural")) ||
    voices.find((v) => v.lang.startsWith("en") && v.localService === false) ||
    voices.find((v) => v.lang.startsWith("en"));
  return chosenVoice || null;
}
```

### Browser TTS gotchas:
- Voices load async — call `speechSynthesis.getVoices()` in useEffect
- Always call `cancel()` before new utterance to prevent overlap
- Rate 0.95, pitch 1.0 — optimized for natural speech
- Preprocess text: replace `/` and `|` with `, ` for natural pauses

## SpeakButton Pattern (dual-provider with fallback)

```tsx
const speak = useCallback(async (e: React.MouseEvent) => {
  e.stopPropagation();
  stopRef.current?.();

  // Try ElevenLabs API first
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      // ... set up onended/onerror callbacks
      audio.play();
      return;
    }
  } catch { /* fall through to browser TTS */ }

  // Fallback to browser TTS
  const handle = speakBrowser(text);
  stopRef.current = handle.stop;
  handle.onEnd(() => setSpeaking(false));
  setSpeaking(true);
}, [text]);
```

## Adding New TTS Providers

Mirrors the `lib/payments/` pattern:

1. Implement `TTSProvider` interface in `lib/tts/<provider>.ts`
2. Add to `providers` map in `lib/tts/index.ts`
3. Set `TTS_PROVIDER=<name>` env var
4. No component changes needed — SpeakButton calls `/api/tts` which uses the factory

## Multi-Voice Support (voiceId parameter)

The `/api/tts` route accepts an optional `voiceId` in the request body. The `TTSProvider.synthesize()` interface takes `(text: string, voiceId?: string)`. This enables multi-voice scenarios (e.g., podcast with different speakers):

```typescript
// Server-side
const { audio } = await provider.synthesize(text, "JBFqnCBsd6RMkjVDRZzb");

// Client-side
const res = await fetch("/api/tts", {
  method: "POST",
  body: JSON.stringify({ text, voiceId: "TxGEqnHWrfWFTfGW9XjX" }),
});
```

If `voiceId` is omitted, falls back to `ELEVENLABS_VOICE_ID` env var or default voice.
