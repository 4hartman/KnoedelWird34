# Unwrap — Brand Concept

## The idea in one line
**Unwrap** turns a gift into a shared, playful journey — the recipient *earns*
the surprise by answering personal questions, while friends watch and vote along
live. A gift you open by playing, together.

## Positioning

There are two adjacent markets, and Unwrap sits in the gap between them:

| Category | Examples | What they do | What they miss |
|---|---|---|---|
| Quiz makers | Typeform/Interact, Jotform, Genially | Quiz logic, personality results | Corporate, lead-gen; no emotion, no gifting, no shared moment |
| Surprise-gift makers | Surprises.Gift, GiftsQR, Gifft.me, GiftFeels, 2-LUV | Scratch cards, gift boxes, QR/password reveals | Passive single-tap reveals; no journey, no group play |

**Unwrap's defensible white space — three things nobody combines:**
1. **The journey *is* the gift.** Answers steer the outcome; the reveal is earned, not tapped.
2. **A shared, *live* moment.** Real-time group voting makes it a party experience.
3. **Zero-friction for recipients.** No signup, instant, QR-shareable.

**One-line positioning:** *The surprise you unwrap together, by playing.*

## Name

**Unwrap.** A clean gifting metaphor — modern, warm, instantly understood, works
in German and English. It names the core emotional payoff (opening the gift)
while implying the layered, step-by-step reveal the product is built around.

- Product/brand: **Unwrap**
- A single gift/experience: **an Unwrap** ("send them an Unwrap")
- Suggested domains: `unwrap.gift`, `unwrap.app`, `getunwrap.com`
- Tagline: **"A gift you open by playing."**
- Alt taglines: "Unwrap the surprise, together." · "Every answer brings them closer."

## Visual personality — Warm & handmade

Heartfelt, cozy, personal — like a gift wrapped by someone who cares. Soft warm
tones, a characterful serif paired with a friendly rounded sans, gentle textures
and rounded shapes. The opposite of a cold SaaS dashboard.

### Color palette

| Token | Hex | Use |
|---|---|---|
| `--terracotta` | `#cf6a45` | Primary — buttons, key accents |
| `--gold` | `#e0a23c` | Secondary warm accent, highlights |
| `--ember` | `#b6432b` | Deep accent, hover, emphasis |
| `--ink` | `#3a2a1c` | Text, headings |
| `--cream` | `#fdf4e6` | Surfaces, cards |
| `--sand` | `#f3e3c9` | Background base, dividers |
| `--sage` | `#7c8a6a` | Cool counter-accent (fresh, sparing use) |

Signature gradient (backgrounds, the mark): `linear-gradient(135deg, #e0a23c 0%, #cf6a45 55%, #b6432b 100%)`.

### Typography

- **Display / headings & wordmark: _Fraunces_** — a soft, characterful serif that
  carries the handmade warmth. (Fallback: Playfair Display, serif.)
- **UI / body: _Quicksand_** — friendly, rounded humanist sans; clean but not cold.
  (Already in use; keeps the runtime light.)

### Logo

A gift box with its lid lifting and a spark escaping — the literal moment of
*unwrapping*. Rendered in the warm gradient with a cream ribbon.

- `brand/unwrap-mark.svg` — icon only (transparent)
- `brand/unwrap-icon.svg` — icon on a rounded warm tile (favicon / app icon)
- `brand/unwrap-logo.svg` — icon + "Unwrap" wordmark (Fraunces)
- In the app, the same mark is the React `Logo` component (`editor/src/brand/Logo.tsx`).

Clear-space: keep at least the height of the box around the mark. Don't recolor
the mark outside the warm palette; don't stretch or add shadows.

## Voice & tone

Warm, personal, a little whimsical — never corporate. Second person. Short.
Celebrates the human moment, not the feature.

| Instead of | Say |
|---|---|
| "Create a new project" | "Start a new surprise" |
| "Publish" | "Send it off" / "Go live" |
| "Configuration saved" | "Saved — looking good ✨" |
| "Quiz" | "the journey" / "the reveal" |

## Where it shows up
- **Editor**: logo in the login + header, warm palette, Fraunces headings.
- **Runtime (the gift)**: the warm default theme; an optional subtle "Made with
  Unwrap" footer on the reveal (off by a flag so gifts can feel fully personal).
- **Published URL + QR**: the shareable artifact carries the brand.
