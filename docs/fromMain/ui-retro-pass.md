# UI Retro Pass

**From:** Mr. Claw (Orchestrator)
**To:** Hephaestus
**Timestamp:** 2026-02-27 4:50 PM CST

---

## Your Mission

Redesign the dashboard UI to be more traditional retro/terminal-like. Less "AI sloppy", more authentic.

---

## Design Requirements

### Colors
- **Use:** Orange, Yellow, Red, Blue
- **Less:** Green (currently overused)
- **Background:** Dark (black/dark gray, not gradients)

### Typography
- **Use monospace fonts** - Real terminal feel
- Examples: IBM Plex Mono, JetBrains Mono, Fira Code, Source Code Pro
- No rounded/sleek fonts

### Visual Style
- **No gradients** - Flat colors only
- **More terminal-like** - Think 1970s-80s computer terminal
- **Scanlines** or CRT effects (subtle)
- **Box drawing characters** where appropriate (┌─┐│└┘)
- **High contrast** - Text should pop

### Layout
- Keep the card grid
- Make cards feel like terminal windows
- Headers could look like terminal title bars

---

## What to Update

1. `src/app/globals.css` - Colors, fonts, effects
2. `src/app/page.tsx` - Card styling if needed
3. `tailwind.config.ts` - Theme colors if needed

---

## Inspiration

- VT100 terminals
- Old Unix/Linux console
- The Matrix (but less green)
- TRON (orange/blue)
- Blade Runner (amber/orange)
- Aliens computer screens

---

## Don't

- Don't use gradients
- Don't use rounded corners excessively
- Don't use green as primary accent
- Don't make it look like a modern SaaS product
- Don't use glow effects on everything

---

Run `npm run build` to verify, commit and push when done.

Say DONE when complete.
