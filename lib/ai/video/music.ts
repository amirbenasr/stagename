import type { VideoMusicSource } from "../../types";

// ============================================================
// Music Resolution — what soundtrack does the First Take use?
// ============================================================
//
// Priority:
//  1. The track the artist uploaded with their quiz (they own it).
//  2. A licensed bed from the genre library configured in MUSIC_LIBRARY_JSON.
//  3. Nothing — the video model's own generated audio is kept.
//
// MUSIC_LIBRARY_JSON is a JSON object of genre -> public audio URL, e.g.
//   {"hip-hop":"https://cdn.example.com/booth-90bpm.mp3","default":"..."}
// Values may also be objects: {"url":"...","title":"Booth 90"}.

export interface MusicSelection {
  url: string;
  source: VideoMusicSource;
  title: string;
}

interface LibraryEntry {
  url: string;
  title?: string;
}

type LibraryMap = Record<string, LibraryEntry>;

let cachedLibrary: LibraryMap | null = null;

function loadLibrary(): LibraryMap {
  if (cachedLibrary) return cachedLibrary;

  const raw = process.env.MUSIC_LIBRARY_JSON;
  if (!raw) {
    cachedLibrary = {};
    return cachedLibrary;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string | LibraryEntry>;
    const normalized: LibraryMap = {};

    for (const [genre, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim()) {
        normalized[genre.toLowerCase().trim()] = { url: value.trim() };
      } else if (value && typeof value === "object" && value.url) {
        normalized[genre.toLowerCase().trim()] = {
          url: value.url,
          title: value.title,
        };
      }
    }

    cachedLibrary = normalized;
    return cachedLibrary;
  } catch (err) {
    console.error("MUSIC_LIBRARY_JSON is not valid JSON — ignoring music library:", err);
    cachedLibrary = {};
    return cachedLibrary;
  }
}

export function resolveMusic(
  uploadedUrl: string | undefined,
  genre: string
): MusicSelection | null {
  if (uploadedUrl && uploadedUrl.trim()) {
    return { url: uploadedUrl.trim(), source: "artist", title: "Your track" };
  }

  const library = loadLibrary();
  const keys = Object.keys(library);
  if (keys.length === 0) return null;

  const g = (genre || "").toLowerCase().trim();

  const exact = library[g];
  if (exact) {
    return { url: exact.url, source: "library", title: exact.title ?? "Studio bed" };
  }

  const matchKey = keys.find((key) => key !== "default" && g.includes(key));
  if (matchKey) {
    const entry = library[matchKey]!;
    return { url: entry.url, source: "library", title: entry.title ?? "Studio bed" };
  }

  const fallback = library.default;
  if (fallback) {
    return {
      url: fallback.url,
      source: "library",
      title: fallback.title ?? "Studio bed",
    };
  }

  return null;
}
