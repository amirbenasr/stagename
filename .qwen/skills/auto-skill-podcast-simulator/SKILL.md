---
name: podcast-simulator
description: Multi-voice podcast/audio drama generator — script generation, per-segment TTS with different voices, sequential playback with live transcript UI (project)
source: auto-skill
extracted_at: '2026-07-13T17:20:34.072Z'
---

# Podcast Interview Simulator

Generate multi-voice audio content (podcast intros, interviews, audio dramas) with per-segment voice assignment and sequential playback. Built on top of the modular TTS architecture (`lib/tts/`).

## Architecture

```
app/api/podcast/route.ts     — Script generation (returns array of {speaker, text} segments)
app/components/PodcastPlayer  — Client component: generates audio per segment, plays sequentially
app/api/tts/route.ts          — Reused TTS endpoint with voiceId parameter for multi-voice
```

## Script Generation Pattern

Server-side script generator returns typed segments:

```typescript
interface PodcastSegment {
  speaker: "host" | "artist" | "audience";
  text: string;
}

// Map speakers to ElevenLabs voice IDs
function getVoiceForSpeaker(speaker: string): string {
  switch (speaker) {
    case "host": return "JBFqnCBsd6RMkjVDRZzb";   // George
    case "artist": return "TxGEqnHWrfWFTfGW9XjX"; // Josh
    case "audience": return "JBFqnCBsd6RMkjVDRZzb";
    default: return "JBFqnCBsd6RMkjVDRZzb";
  }
}
```

## Client-Side Sequential Playback

Generate audio for each segment, then play in sequence:

```typescript
// 1. Generate script
const { script } = await fetch("/api/podcast", { body: JSON.stringify(params) });

// 2. Generate audio per segment (with different voices)
const urls: string[] = [];
for (const segment of script) {
  const voiceId = getVoiceForSpeaker(segment.speaker);
  const res = await fetch("/api/tts", {
    body: JSON.stringify({ text: segment.text, voiceId }),
  });
  const blob = await res.blob();
  urls.push(URL.createObjectURL(blob));
}

// 3. Play sequentially with recursive promise chain
async function playSegment(index: number) {
  if (index >= urls.length) { setPlaying(false); return; }
  setCurrentSegment(index); // highlight in transcript
  
  const audio = new Audio(urls[index]);
  audio.onended = () => playSegment(index + 1);
  audio.play();
}
```

## UI Pattern: Live Transcript

Show transcript with highlighted current segment:

```tsx
{segments.map((segment, i) => (
  <div className={`transition-all ${i === currentSegment ? "scale-105" : "opacity-60"}`}>
    <p className="text-xs uppercase tracking-wider">{getSpeakerLabel(segment.speaker)}</p>
    <p className={getSpeakerStyle(segment.speaker)}>{segment.text}</p>
  </div>
))}
```

## Key Design Decisions

1. **Lazy generation** — audio only generated when user clicks play, not on page load
2. **Progressive loading** — audio generated segment-by-segment, UI shows progress
3. **Voice per speaker** — each speaker gets a distinct ElevenLabs voice via voiceId param
4. **Sequential playback** — recursive promise chain ensures segments play in order
5. **Cleanup** — revoke object URLs on unmount and stop to prevent memory leaks

## Extending the Pattern

- **AI-generated scripts** — Replace static script with fal.ai text generation based on user data
- **Sound effects** — Add "sfx" speaker type with pre-loaded audio samples
- **Background music** — Play ambient track underneath speech segments
- **Pause/resume** — Track current playback position for mid-podcast pause
- **Download** — Concatenate audio blobs for downloadable podcast file
