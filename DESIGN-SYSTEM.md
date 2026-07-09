# Design System — stagename.club

> Single source of truth for UI patterns. Use this when building new pages or components.

---

## Colors

### Brand Palette

| Token | Value | Tailwind class | Usage |
|-------|-------|----------------|-------|
| `--color-foreground` | `#1C1D1F` | `text-foreground` | Primary text, borders, dark surfaces |
| `--color-beige` | `#F7F4EF` | `bg-beige` | Page background, warm canvas |
| `--color-beige-dark` | `#E8E4DF` | `bg-beige-dark` | Card icon backgrounds, subtle dividers |
| `--color-coral` | `#F15A38` | `bg-coral`, `text-coral` | **Primary brand color** — CTAs, accents, links |
| `--color-slate` | `#656B73` | `text-slate` | Secondary text, muted accents |

### Legacy Aliases (keep working)

| Legacy class | Maps to |
|--------------|---------|
| `text-pink-accent` | Coral `#F15A38` |
| `text-cyan-accent` | Slate `#656B73` |

### Opacity Variants

Use Tailwind opacity modifier for foreground color:
- `text-foreground/40` — placeholder text, fine print
- `text-foreground/50` — secondary descriptions, subtitles
- `text-foreground/60` — tertiary text
- `text-foreground/70` — section labels, nav links
- `border-foreground/10` — card borders, dividers
- `border-foreground/20` — input borders
- `bg-white/60` — card backgrounds (semi-transparent over beige)

---

## Typography

### Fonts

| Token | Value | Tailwind class |
|-------|-------|----------------|
| Serif | Georgia, "Times New Roman", serif | `font-serif` |
| Script | Dancing Script, cursive | `font-script` |

### Usage Rules

| Element | Style |
|---------|-------|
| Body text | `font-serif` (default) |
| Headings | `font-serif`, uppercase, `tracking-wider` |
| Accent/emphasis words | `font-script`, lowercase, `text-coral` |
| Nav links | `font-serif`, `text-sm`, `text-foreground/70` |
| Section labels | `font-serif`, `uppercase`, `tracking-[0.3em]`, `text-sm` |
| Fine print | `font-serif`, `text-xs`, `text-foreground/40` |
| Prices | `font-serif`, `font-bold`, `holographic-text` |

### Pattern: Mixed Script Headline

```tsx
<h1 className="text-4xl sm:text-5xl font-serif">
  <span className="uppercase tracking-wider">YOUR </span>
  <span className="font-script text-coral text-5xl lowercase">perfect</span>
  <span className="uppercase tracking-wider"> ARTIST NAME</span>
</h1>
```

Alternate between uppercase serif and lowercase script for emotional words.

---

## Buttons

### Primary CTA (Coral Gradient)

```tsx
<button className="holographic holographic-shadow rounded-full px-6 py-3 text-white font-serif uppercase tracking-wider text-sm font-bold hover:scale-105 transition-all duration-300">
  FIND MY STAGE NAME
</button>
```

- Always `rounded-full`
- Always `holographic` + `holographic-shadow`
- White text, uppercase, `font-serif`
- Hover: `hover:scale-105`

### Secondary / Outline

```tsx
<Link className="border-2 border-foreground rounded-full px-5 py-1.5 text-sm font-serif uppercase tracking-wider hover:bg-foreground hover:text-beige transition-all duration-300">
  JOIN THE CLUB
</Link>
```

- `border-2 border-foreground`
- Hover fills with `bg-foreground`, text becomes `text-beige`
- Smaller padding than primary

### Disabled State

```tsx
disabled:opacity-50 disabled:scale-100
```

---

## Cards

### Standard Card

```tsx
<div className="bg-white/60 border border-foreground/10 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
  {/* Icon container */}
  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-beige-dark flex items-center justify-center">
    {/* SVG icon */}
  </div>
  <h3 className="text-sm font-serif uppercase tracking-[0.3em] text-foreground/70 mb-2">LABEL</h3>
  <p className="text-sm font-serif text-foreground/50">Description.</p>
</div>
```

- `bg-white/60` — semi-transparent white
- `border-foreground/10` — subtle border
- `rounded-3xl` — generous border radius
- Icon: `w-16 h-16`, `rounded-2xl`, `bg-beige-dark`
- Section label: `tracking-[0.3em]`
- Description: `text-foreground/50`

### Pricing / Featured Card

```tsx
<div className="relative bg-white/60 border border-foreground/10 rounded-3xl p-8 sm:p-10 shadow-lg">
  {/* Content */}
</div>
```

- Same as standard but `shadow-lg` and larger padding

---

## Layout

### Container

```tsx
<section className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
```

- Max width: `max-w-5xl`
- Horizontal padding: `px-6`
- Vertical padding: `py-12` (mobile) / `sm:py-16` (desktop)

### Navbar

```tsx
<nav className="border-b border-black/10 bg-beige/90 backdrop-blur-sm sticky top-0 z-20">
  <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
```

- Sticky top, backdrop blur
- `border-black/10` bottom border

### Grid

- Features: `grid grid-cols-1 sm:grid-cols-3 gap-8`
- Trust indicators: `grid grid-cols-2 sm:grid-cols-4 gap-6`

### Footer

```tsx
<footer className="max-w-5xl mx-auto px-6 py-8 border-t border-foreground/10">
```

- Top border, same container pattern

---

## Special Effects

### `.holographic` — Coral gradient background
```css
background: linear-gradient(135deg, #F15A38 0%, #f47a5f 30%, #F15A38 60%, #d4451f 100%);
```

### `.holographic-text` — Coral gradient text
```css
background: linear-gradient(135deg, #F15A38 0%, #f47a5f 40%, #F15A38 70%, #d4451f 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### `.holographic-shadow` — Coral glow shadow
```css
box-shadow: 0 4px 20px rgba(241, 90, 56, 0.35), 0 0 40px rgba(241, 90, 56, 0.12);
```

### `.holographic-border` — Coral gradient border
Uses `border-image` with coral gradient.

### `.aura-glow` — Extra coral glow
```css
box-shadow: 0 0 30px rgba(241, 90, 56, 0.35), 0 0 60px rgba(241, 90, 56, 0.15);
```

---

## SVG Icons

- Platform logos (Spotify, Instagram, TikTok, Facebook): inline SVG, `w-7 h-7`, `fill="white"`
- Feature icons: `w-8 h-8`, `stroke="currentColor"`, `strokeWidth="1.5"`, `fill="none"`
- Social icons in footer: `w-6 h-6`, `fill="currentColor"`
- Icon color: `text-coral`, `text-slate`, or contextual

---

## Spacing Scale

| Context | Vertical | Horizontal |
|---------|----------|------------|
| Section gap | `py-12` / `sm:py-16` | `px-6` |
| Hero | `pt-16 sm:pt-24 pb-12` | `px-6` |
| Card | `p-8` / `sm:p-10` | — |
| Feature icon | `mb-4` below icon | `mx-auto` |
| Button | `px-6 py-3` (primary), `px-5 py-1.5` (secondary) | — |
| Nav | `py-4` | `px-6` |

---

## Responsive Breakpoints

- Mobile: default
- Tablet+: `sm:` (640px+)
- Desktop: `lg:` (1024px+)

Common patterns:
- `text-4xl sm:text-5xl lg:text-6xl`
- `grid-cols-1 sm:grid-cols-3`
- `grid-cols-2 sm:grid-cols-4`
- `hidden sm:flex` (mobile hide)
- `w-64 sm:w-80`

---

## Print Styles

- Backgrounds forced to white
- `holographic-text` → solid `#F15A38`
- Images preserve color via `print-color-adjust: exact`
- Page size: A4, 1.5cm margins
