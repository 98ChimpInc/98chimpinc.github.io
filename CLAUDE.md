# 98chimp.com — Marketing Landing Page

> **CLAUDE.md** — Project context for Claude Code autonomous development
> Global engineering principles, workflow, and git conventions live in ~/.claude/CLAUDE.md

---

## Project Overview

Single-file HTML marketing site for the 98%Chimp brand. Showcases four
neuroscience-grounded products by Shahin Zangenehpour. No framework, no build
step — vanilla HTML, CSS, and JS only.

### Site Thesis
"The brain is not a fixed thing. Neither are you."

### Brand Positioning
98%Chimp builds neuroscience-grounded tools for every stage of self-awareness.
Not all products are games — all are tools rooted in the science of the brain
and mind. Never use the word "games" to describe the portfolio.

---

## Technical Stack

- Single HTML file — no framework, no build process
- Vanilla CSS with custom properties
- Vanilla JS (minimal — font switcher, smooth scroll)
- Google Fonts via `<link>` import
- Inline SVG for all logo assets

---

## Design Tokens

### Colors
```css
--cream: #F5F1EB;        /* Page background */
--orange: #FF4600;       /* Brand primary */
--dark: #2C2C2C;         /* Footer background */
--text: #1a1a1a;         /* Body text */
--muted: #888;           /* Secondary text */
```

### Typography
- Headings: Cormorant Garamond (Google Fonts)
- Body: DM Sans (Google Fonts)
- Custom property: `--font-primary` (swappable via font switcher)

### Logo — Inline SVG
- Source: Figma export, `viewBox="0 0 560 142"`
- Nav: height 38px, fill `#FF4600`
- Footer: height 24px, paths use `currentColor` (renders white)
- Contains 3 paths: chimp mark, wordmark, tagline text
- Do not replace with an img tag — keep inline for color control

---

## Site Structure

```
index.html (98chimp.html)
├── Nav — logo + navigation links
├── Hero — headline, sub, CTA
├── Products — four product cards
│   ├── DK Derby
│   ├── BrainFit
│   ├── Unison
│   └── Loomi
├── About — founder section
└── Footer — links, logo, tagline
```

---

## Product Cards

Each card follows this pattern:
- Emoji icon
- Tag (status + category)
- Title
- ~3 sentence copy in conversational, science-grounded voice
- CTA linking to product or external site
- `data-bg` attribute for visual panel color

### Product Positioning

| Product | Gap it closes |
|---------|---------------|
| DK Derby | Between what you *think* you know and what you *actually* know |
| BrainFit | Between what you *feel* and what you *understand* about what you feel |
| Unison | Between what you *hear* in your head and what *comes out* |
| Loomi | Builds the foundation *before* those gaps form (children 0–6) |

### Loomi Card Specifics
- Use Option C copy: *"Stories that build confidence while they lull to sleep.
  Positive affirmations dissolved into bedtime narratives, played over soft
  melodies... designed to be started and forgotten. Neuroscience has never
  sounded this much like a lullaby."*
- Tag: "Now in Beta · Children's Sleep & Development"
- Emoji: 🌙
- Visual panel: deep navy or dark purple (`data-bg="LM"`)
- CTA: "Explore Loomi →" linking to https://www.loomi.kids
- Do not try to contain Loomi content on this page — link out

---

## About Section

- Feature Shahin as the founder of DK Derby, BrainFit, and Unison
- Add one line acknowledging brothers for Loomi:
  *"Loomi is built with my brothers Soushiant (social scientist) and Shawn
  (business strategist) — three dads who asked: what if technology could
  nurture our kids instead of distracting them?"*
- Mention The Falcon & The Whale podcast as a creative dimension — one line,
  link to the podcast landing page. No product card for it.

---

## Font Switcher (Experimental)

Sticky bar pinned to top of page for typography evaluation. Does not affect
layout, colors, or any non-typographic styles.

```javascript
// Mechanism
document.body.setAttribute('data-font', key);

// CSS
[data-font="current"]  { --font-primary: 'Cormorant Garamond', serif; }
[data-font="fraunces"] { --font-primary: 'Fraunces', serif; }
[data-font="dm-serif"] { --font-primary: 'DM Serif Display', serif; }
[data-font="syne"]     { --font-primary: 'Syne', sans-serif; }
[data-font="literata"] { --font-primary: 'Literata', serif; }
```

All 4 Google Fonts must be imported in `<head>`. Default is `current` so
the page loads identically without the switcher.

---

## Pending Assets

- Chimp handprint SVG — for hero watermark (placeholder in place)
- Human handprint SVG — for section dividers (placeholder in place)
- These are brand assets, not decorative — do not substitute with generic icons

---

## Deployment

- Target: `98chimp.com/dkderby` subdirectory
- Future: dedicated domain, 301 redirect strategy TBD
- Privacy policy needed before launch (Firebase analytics disclosure)

---

*Last updated: February 2026*
