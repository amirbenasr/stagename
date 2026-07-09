---
name: sharp-image-overlay
description: Server-side image overlay pattern using sharp — composites SVG overlays with text and social stats onto AI-generated images before Firebase Storage upload
source: auto-skill
extracted_at: '2026-07-08T17:54:58.357Z'
---

## Pattern: Server-side SVG overlay on generated images

When AI-generated images need branded overlays (text + icons + stats), use `sharp` to composite an SVG overlay onto the image buffer **before** saving to Firebase Storage.

### Setup
```bash
npm install sharp
```

### Core approach

1. **Download** raw image as `Buffer`
2. **Build SVG string** with overlay elements (text, icons, gradient background)
3. **Composite** via `sharp(buffer).composite([{ input: svgBuffer }]).toBuffer()`
4. **Save** resulting buffer to storage

### SVG overlay design

- Use a **linear gradient** rect (transparent → semi-transparent black) at the bottom 25% of the image
- Center the **artist name** in serif font at the top of the overlay zone
- Place **social media emoji icons** evenly spaced below the name
- Add **follower count labels** under each icon

```typescript
function buildOverlaySvg(options, width, height) {
  const overlayTop = height * 0.75;
  return `<svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${overlayTop}" width="${width}" height="${height - overlayTop}" fill="url(#g)"/>
    <text x="${width/2}" y="${overlayTop + 30}" text-anchor="middle" font-size="36" font-family="serif" font-weight="bold" fill="white">${escapeXml(artistName)}</text>
    <!-- icons + labels here -->
  </svg>`;
}
```

### Two-mode design

- **"starting" mode**: all follower counts = "0" (new artist, humble beginnings)
- **"famous" mode**: randomized high counts (Spotify 500K-2M, Instagram 800K-3M, TikTok 1M-5M, Facebook 300K-1.5M)

### Integration point

Call `applyOverlay(buffer, { artistName, mode })` in the image persistence step, **after** downloading from the AI provider and **before** uploading to Firebase Storage. Process all images in parallel via `Promise.all`.

### Gotchas

- Always call `sharp(imageBuffer).metadata()` first to get actual dimensions for SVG sizing
- Use `escapeXml()` on text content to prevent SVG injection
- Wrap in try/catch — fallback to original buffer on failure
- SVG `font-family` may render differently across systems; stick to `serif`/`sans-serif` for portability
- No `@types/sharp` needed — sharp v0.33+ ships its own types
