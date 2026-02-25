# 98chimp.com — Marketing Landing Page

> **CLAUDE.md** — Project context for Claude Code autonomous development
> Global engineering principles, workflow, and git conventions live in ~/.claude/CLAUDE.md

---

## Project Overview

Single-file HTML marketing site for the 98%Chimp brand. Showcases five
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
- Vanilla JS (minimal — font switcher, smooth scroll, SVG injection)
- Google Fonts via `<link>` import
- External SVG logo (`assets/logo.svg`) injected via `fetch()` at runtime

### Local Development

The site uses `fetch()` to inject the SVG logo, which is blocked by browser
CORS policy when opening `index.html` directly as a `file://` URL. To preview
locally, serve via HTTP:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

The live site at `98chimp.com` (GitHub Pages) works without this limitation.

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

### Logo — External SVG (`assets/logo.svg`)
- Source: Figma export, `viewBox="0 0 560 142"`
- Single file, injected twice via JS `fetch()` into placeholder `<div>`s
- All 6 paths use `fill="currentColor"` for CSS color control
- Nav container sets `color: #FF4600` (orange); footer inherits white
- Path 5 is a knockout shape with `class="knockout-path"` — CSS overrides
  its fill to match the section background (`--cream` in nav, `--dark` in footer)
- Paths 2–3 have `class="wordmark-path"`, paths 4–6 have `class="tagline-path"`
  — used by scroll-shrink JS to fade wordmark/tagline on scroll
- Nav: height 99px (shrinks to 67px desktop / 53px mobile on scroll)
- Footer: height 72px
- Do NOT inline the SVG back into `index.html` — see Token-Conscious File
  Hygiene in global CLAUDE.md

---

## Site Structure

```
index.html
├── Font Switcher — experimental typeface toggle bar
├── Nav — logo (injected SVG) + navigation links
├── Hero — headline, sub, CTA
├── Pull Quote — prefrontal cortex typographic moment
├── Thesis — "Our Raison d'Être" two-column section
├── Pillars — Adapt / Evolve / Thrive with handprint dividers
├── Products — five product cards
│   ├── DK Derby
│   ├── BrainFit
│   ├── Unison
│   ├── Loomi
│   └── Meelo
├── Science Quote — Nathaniel Branden quote block
├── About — founder section with headshot
├── Beta CTA — email signup for TestFlight
└── Footer — logo (injected SVG), copyright, Privacy/Terms links
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

- Hosted on GitHub Pages via `98ChimpInc/98chimpinc.github.io` org repo
- Custom domain: `98chimp.com` (GoDaddy DNS → GitHub Pages A records)
- HTTPS enforced via GitHub Pages settings
- Product landing pages (e.g. DK Derby) go in separate repos under
  `98ChimpInc` org — auto-route to `98chimp.com/<repo-name>`
- Privacy policy and Terms of Use pages still needed

---

*Last updated: February 2026*
