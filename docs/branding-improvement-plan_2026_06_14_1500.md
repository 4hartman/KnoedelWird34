# Unwrap — Branding Analysis & Improvement Plan
*Created 2026-06-14 · Source: `BRANDING.md`*

## 0. How to read this document
Each recommendation is tagged with the **proven principle** it rests on (behavioral
science or brand/marketing practice) and an **actionable** change. Effort/impact is
marked `[Quick win]`, `[Medium]`, or `[Bet]`.

---

## 1. What the current brand gets right (keep these)
The `BRANDING.md` is already above the bar for an indie product. Don't lose:

- **Clear white-space positioning.** The "gap between quiz makers and gift-reveal
  apps" framing is genuinely defensible and rare. Most products can't articulate
  their wedge this cleanly.
- **One emotional payoff named in the name.** "Unwrap" = the literal dopamine
  moment. Names that encode the core benefit (vs. abstract coinages) reduce the
  cognitive cost of understanding the product — lower "time-to-comprehension."
- **A coherent visual personality** ("warm & handmade") with a real palette, type
  pairing, and gradient. It is *anti-SaaS*, which matches the emotional category.
- **Voice table** (feature → human moment). This is the single most valuable asset
  for consistency; expand it, don't replace it.

The gaps below are about **conversion, differentiation depth, and trust** — not a
rebrand.

---

## 2. Psychological analysis — the product's hidden superpower
The branding sells "warm & handmade," but the *mechanism* that makes Unwrap special
is psychological, and the brand currently under-states it. The reveal experience
quietly stacks **five** well-documented effects. Naming them lets you design for
them deliberately and market them credibly.

| Effect | What it is | Where Unwrap uses it | Lever to pull |
|---|---|---|---|
| **Peak–End rule** (Kahneman) | People judge an experience by its emotional peak and its ending, not the average | The reveal *is* a deliberately engineered peak + end | Make the reveal moment longer, louder, re-watchable. This is the whole ballgame. |
| **Zeigarnik effect** | Unfinished tasks create tension that demands resolution | Answering questions to "earn" the reveal | Show a progress arc ("3 questions until your surprise") to amplify pull-through |
| **Labor/IKEA effect** | We value outcomes more when we invest effort | The gift is *earned*, not tapped | Lean into it in copy: "You unlocked this." |
| **Social proof + shared joy** | Emotions amplify when witnessed; group presence raises stakes | Live friend voting | The live audience is a *retention + virality* engine, not a feature footnote |
| **Variable reward / anticipation** | Uncertainty before reward spikes dopamine more than the reward itself | "What will it be?" build-up | Pace the reveal; never show everything at once |

**Strategic implication:** Unwrap's moat is not "warm visuals" — those are
copyable. The moat is being **the best-engineered emotional peak in the gifting
category.** Brand, copy, and feature priorities should all point at *protecting and
amplifying the reveal moment.*

---

## 3. Industry-standard gaps in the current brand doc
Measured against standard brand-system and DTC/SaaS go-to-market practice, these
are missing:

1. **No audience definition / personas.** Who is the gifter? (Birthday-for-a-friend,
   the indecisive voucher-giver, the long-distance partner, the team Secret Santa.)
   Brand voice and marketing can't be tuned without this.
2. **No accessibility commitment.** Warm low-contrast palettes are a real WCAG risk
   (see §4). For a product whose whole value is "everyone can join, no signup," this
   is on-brand *and* a legal/quality baseline.
3. **No emotional-arc / experience principles.** The doc covers static identity
   (color, type, logo) but not the *experience* the brand is actually selling.
4. **No trust layer.** Gifting = money + personal data + a one-shot emotional event.
   Nothing addresses privacy, "will it work on the day," or reliability.
5. **No measurable brand goals.** No definition of what "stand out" means
   (recognition, NPS, share rate, reveal-completion rate).
6. **Sound is absent.** The reveal is a peak moment delivered silently. Audio is the
   cheapest high-impact upgrade to an emotional peak (see §6).

---

## 4. Design & color — actionable
- **`[Quick win]` Audit contrast for WCAG AA.** Run every text/background pair
  (`--ink` on `--cream`/`--sand`, white on `--gold`, white on `--terracotta`)
  through a contrast checker. `--gold #e0a23c` with white text will almost
  certainly fail (needs ≥ 4.5:1 for body). Define an *accessible* foreground for
  each surface token rather than leaving it to chance. *Principle: usability
  heuristics + legal baseline; low contrast also reads as "amateur."*
- **`[Quick win]` Add semantic tokens, not just raw colors.** Map
  `--color-primary`, `--color-surface`, `--color-text`, `--color-success` on top of
  the palette names. Makes theming + the existing "adjustable fonts/theme" features
  cleaner and prevents `--gold` being used for both "highlight" and "warning." (Your
  CLAUDE.md rule: data-driven, not hardcoded — this enforces it.)
- **`[Medium]` Define a dark / "evening" theme.** Reveals often happen at a party,
  at night, on a phone passed around. A warm dark variant (deep ember/ink ground,
  cream text) is both practical and *more cinematic for the peak moment.*
- **`[Medium]` Motion guidelines.** "Warm & handmade" needs a motion personality:
  gentle ease-out, slight overshoot (bouncy, not snappy-corporate), paper/ribbon
  physics on the unwrap. Document timing tokens. *Principle: motion is brand;
  consistent easing is recognized subconsciously.*
- **`[Quick win]` Texture, used sparingly.** The doc mentions "gentle textures" but
  defines none. Add one signature paper-grain/noise overlay token so "handmade"
  is real, not aspirational.

---

## 5. Texts & voice — actionable
- **`[Quick win]` 10x the voice table.** Cover the *whole* funnel, not just app
  buttons: empty states, errors ("Hmm, that didn't send — let's try again"),
  loading, the share screen, the QR card, transactional emails, the 404. Consistency
  across edges is what makes a voice feel like a *person*. *Principle: brand is the
  sum of micro-interactions.*
- **`[Quick win]` Write the reveal-moment copy as a script, not a string.** This is
  the peak — it deserves a beat sheet: build-up line → pause → reveal → celebration
  → "what now." Currently undefined.
- **`[Medium]` Name the recipient's role.** The gifter sends "an Unwrap"; what does
  the recipient *do*? Coin a verb ("you're about to unwrap," "you unwrapped it").
  Owning a verb is elite brand positioning (Google it).
- **`[Quick win]` Tighten the tagline shortlist with a test.** "A gift you open by
  playing" is good but slightly abstract. Test against benefit-forward variants:
  *"Can't decide what to gift? Let them unwrap the choice."* — this directly names
  the voucher/indecision use case, which is your stated core wedge but is *absent
  from the brand doc.*

---

## 6. Features — actionable (ranked by emotional ROI)
1. **`[Bet]` Sound design for the reveal.** A short, warm "unwrap" sound + optional
   gifter voice note. Highest-impact emotional upgrade per §2 Peak–End. Make it
   opt-in and mutable.
2. **`[Medium]` Make the *indecision* use case a first-class feature.** Your goal
   statement ("budget allows only one of several gift ideas; the recipient chooses")
   is the strongest, most concrete value prop you have — and it's not in the brand.
   Ship a **"Gift Picker"** template: gifter loads 2–4 options, the journey's
   answers + live votes steer which one the recipient lands on. This *is* the killer
   demo. Name it, template it, lead marketing with it.
3. **`[Medium]` Re-watchable / shareable reveal recap.** Auto-generate a short
   recap (their answers, the votes, the reveal) they can keep and re-share. Extends
   the "end" of Peak–End and creates organic distribution. *Principle: the artifact
   that outlives the moment drives word-of-mouth.*
4. **`[Quick win]` Progress + anticipation UI.** "2 questions until your surprise."
   Pulls people through (Zeigarnik) and raises reveal value.
5. **`[Quick win]` Live reactions for the audience.** Emoji/confetti taps during
   voting — cheap, raises the "shared moment" stakes and gives non-voters something
   to do.
6. **`[Medium]` Trust & reliability surface.** A pre-send "preview as recipient"
   and a "test the link" step. One broken reveal on a birthday is a churned user
   forever; reliability *is* brand here.

---

## 7. Marketing & positioning — actionable
- **`[Quick win]` Lead with the problem, not the mechanic.** Current positioning
  ("the surprise you unwrap together, by playing") describes the *how*. The
  *why-buy* is: **"Stop agonizing over what to gift. Send a few ideas — let them
  unwrap the one they love."** Problem-first messaging converts better than
  feature-first. Keep the poetic line as the brand line; use the problem line in ads.
- **`[Medium]` Define 3 personas + a use-case matrix.** Birthday-from-afar ·
  indecisive voucher-gifter · couples/anniversary · team/group gift. Each gets its
  own landing section + template. *Principle: specificity converts; "for everyone"
  converts no one.*
- **`[Medium]` Occasion-based SEO/landing pages.** People search *occasions*
  ("birthday gift ideas for best friend," "long distance anniversary surprise"), not
  "interactive gift quiz." Build occasion landing pages that funnel to templates.
- **`[Bet]` Built-in virality loop.** Every reveal ends with "Made with Unwrap" (you
  already have the flag) + a one-tap "make one back." The product is *inherently*
  shared with exactly the audience most likely to convert (people who just felt the
  emotional payoff). Instrument and optimize this loop — it's cheaper than paid.
- **`[Quick win]` Social proof assets.** Capture reaction reactions/testimonials
  ("she cried 😭"). Emotional UGC is the native ad unit for this category.

---

## 8. Website & presentation — actionable
- **`[Medium]` The homepage must *show the peak*, not describe it.** Above the fold:
  an autoplaying, muted, looping micro-reveal (the unwrap animation + a vote). Sell
  the feeling in 3 seconds. *Principle: for emotional products, demonstrate don't
  describe.*
- **`[Quick win]` A live, no-signup demo Unwrap.** Let visitors *be the recipient*
  of a sample gift on the homepage. Experiencing the peak once is the best possible
  conversion event. Matches your "zero-friction for recipients" promise.
- **`[Quick win]` Three-step "how it works"** (Build → Send a link/QR → They unwrap,
  friends vote). Reduce perceived setup effort — "easy to set up" is a stated goal
  but a friction fear for gifters.
- **`[Medium]` Template gallery as the hook.** People buy the *outcome they can
  picture.* Show finished example Unwraps by occasion (your `60/` example is the
  seed of this). Templates lower the blank-canvas barrier — the #1 killer of
  creation-tool activation.
- **`[Quick win]` Trust footer.** "No signup for them · Works on any phone · Your
  data stays private." Addresses the three silent objections of a gifting purchase.

---

## 9. What would make Unwrap *truly* stand out (the big bets)
1. **Own the reveal as a craft.** Be obsessively, visibly better than anyone at the
   *moment of opening* — sound, motion, pacing, recap. Competitors do "scratch and
   see." Unwrap does *a tiny piece of theatre.* That's the un-copyable moat.
2. **Own the indecision problem.** No competitor frames gifting as "let them choose
   from your shortlist." It's a real, frequent, emotionally-charged problem
   (especially for vouchers). Make it the headline use case.
3. **Make every gift a recruiting event.** The live audience + recap + "make one
   back" turns one purchase into N impressions among pre-qualified buyers. Design the
   loop, don't leave it to chance.

---

## 10. Suggested additions to `BRANDING.md`
Add these sections so the brand doc covers experience + go-to-market, not just
identity:
- `## Audience & personas`
- `## Experience principles` (the Peak–End / anticipation / shared-joy doctrine)
- `## Accessibility` (WCAG AA commitment + accessible token pairs)
- `## Motion & sound` (easing tokens, the unwrap sound, reduced-motion fallback)
- `## Brand goals & metrics` (reveal-completion %, share rate, NPS, recognition)
- Expand `## Voice & tone` to full-funnel + the reveal script

---

## 11. Prioritized first sprint (highest impact, lowest effort)
1. Contrast audit + accessible token pairs `[Quick win]`
2. Problem-first headline + tagline test ("let them unwrap the choice") `[Quick win]`
3. Homepage: live no-signup sample reveal `[Quick win/Medium]`
4. Reveal sound + anticipation progress UI `[Quick win → Bet]`
5. Expand the voice table to errors/empty/share/email `[Quick win]`
6. Ship + name the "Gift Picker" indecision template `[Medium]`
