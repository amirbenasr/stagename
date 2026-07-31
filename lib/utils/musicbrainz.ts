const MUSICBRAINZ_API = "https://musicbrainz.org/ws/2/artist";

export async function existsInMusicBrainz(name: string): Promise<boolean> {
  try {
    const url = `${MUSICBRAINZ_API}?query=${encodeURIComponent(name)}&fmt=json`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "StageNameClub/1.0 (https://stagename.club)" },
    });
    if (!res.ok) return false;

    const data = await res.json();
    const artists = data.artists ?? [];

    return artists.some(
      (a: { name: string }) => a.name.toLowerCase() === name.toLowerCase()
    );
  } catch {
    return false;
  }
}

const VOWELS = ["a", "e", "i", "o", "u"];
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";

function doubleLastConsonant(name: string): string {
  const last = name[name.length - 1];
  if (CONSONANTS.includes(last.toLowerCase())) {
    return name + last;
  }
  return name + "z";
}

function appendVowel(name: string): string {
  const vowel = VOWELS[name.length % VOWELS.length];
  return name + vowel;
}

function swapMiddleVowel(name: string): string {
  const chars = name.split("");
  for (let i = 1; i < chars.length - 1; i++) {
    if (VOWELS.includes(chars[i].toLowerCase())) {
      const idx = VOWELS.indexOf(chars[i].toLowerCase());
      const next = VOWELS[(idx + 1) % VOWELS.length];
      chars[i] = chars[i] === chars[i].toUpperCase() ? next.toUpperCase() : next;
      break;
    }
  }
  return chars.join("");
}

const MODIFIERS = [doubleLastConsonant, appendVowel, swapMiddleVowel];

export async function makeUnique(name: string): Promise<string> {
  let current = name;

  for (const modifier of MODIFIERS) {
    current = modifier(current);
    const exists = await existsInMusicBrainz(current);
    if (!exists) return current;
  }

  return current;
}
