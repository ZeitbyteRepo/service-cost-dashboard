# Teamwork Plan — Service Cost Dashboard

This document explains how our multi-agent team works together.

**Last Updated:** 2026-02-27 1:17 PM CST

---

## Current Project Status

**Live URL:** https://service-cost-dashboard-production.up.railway.app
**GitHub:** https://github.com/ZeitbyteRepo/service-cost-dashboard
**Latest Commit:** `68ab376`

### Provider Status

| Provider | Status | Notes |
|----------|--------|-------|
| Railway | 🟢 Healthy | $40.14/mo |
| Stripe | 🟢 Healthy | $0.00 |
| LemonSqueezy | 🟢 Healthy | $160.00 |
| DeepSeek | 🟢 Healthy | $0.00 |
| GitHub | 🟢 Healthy | Fixed by Hephaestus |
| OpenAI | 🔴 Error | Under investigation |
| Anthropic | 🔴 Error | Under investigation |
| ElevenLabs | 🔴 Error | Under investigation |
| Groq | ⚪ Unknown | Dashboard only (est.) |
| Hugging Face | ⚪ Unknown | Dashboard only (est.) |
| Google/Gemini | ⚪ Unknown | Dashboard only (est.) |
| Supabase | ⚪ Unknown | No API key |
| Brave Search | ⚪ Unknown | Dashboard only (est.) |

---

## The System

- **Orchestrator** (Mr. Claw) watches agents work in real-time via PTY
- **Git is persistence** — commit often, push always
- **CI is the gate** — no handoff until builds pass
- **Dispatches are checkpoints** — handoff records at phase boundaries

---

## Agent Roles

| Agent | Role | CLI Tool | Writes to |
|-------|------|----------|-----------|
| **Mr. Claw** | Orchestrator — coordinates, monitors, steers | — | `docs/fromMain/` |
| **Hephaestus** | Developer — writes code, creates plans | Codex | `docs/fromHep/` |
| **Athena** | Tester — reviews code, writes tests | Crush | `docs/fromAth/` |
| **Research** | Investigator — researches APIs, documents findings | Crush | `docs/fromResearch/` |

### Role Boundaries

- Developers don't write tests
- Testers don't write production code
- Research doesn't write production code — only specs
- No one edits another agent's journal

### CLI Assignments

| Agent | CLI | Config Dir | Why |
|-------|-----|------------|-----|
| Hephaestus | Codex | `.codex/` | Trust prompts give oversight on code changes |
| Athena | Crush | `.crush/` | Auto-approved writes for faster test iteration |
| Research | Crush | `.crush/` | No trust prompts, smoother investigation work |

---

## Dispatch Directories

```
docs/
├── fromMain/      ← Orchestrator → All Agents (persistent context)
├── fromHep/       ← Hephaestus → Others (dev handoffs)
├── fromAth/       ← Athena → Others (test handoffs)
└── fromResearch/  ← Research → Others (findings, specs)
```

**fromMain is special:** The orchestrator writes persistent context here that survives session restarts. Agents read it on spawn to recover state immediately.

---

## Resume Protocol

When spawning an agent after a disconnect/crash:

1. **Orchestrator reads** `fromMain/` latest dispatch to recover project state
2. **Agent spawns** with instruction: "Read fromMain/latest, continue from last checkpoint"
3. **Agent reads** `fromMain/` + their own latest dispatch
4. **Agent continues** immediately without asking questions

**Goal:** Zero context loss. Pick up exactly where we left off.

---

## The Workflow

1. **Orchestrator spawns agent via PTY** → watches real-time stream
2. **Agent works** → orchestrator steers if direction drifts
3. **Agent signals done** → "commit and push"
4. **Wait for CI** → green = continue, red = fix
5. **"Make the dispatch"** → agent writes handoff record
6. **Commit dispatch** → push
7. **Route to next agent** → repeat

---

## Git Rules

- Commit every meaningful progress
- Push immediately after commit
- Wait for CI before handoff
- If red, fix before proceeding

---

## Dispatch Format

```markdown
# [Type]: [Brief Title]

**From:** [Agent Name]
**To:** [Next Agent | Orchestrator | All]
**Timestamp:** YYYY-MM-DD HH:MM

## Summary
[1-2 sentences]

## What I Did
[Bullet list of changes]

## For You
[What the next agent needs to know]

## Questions / Blockers
[Anything that needs clarification]
```

---

## Communication Rules

- Orchestrator watches via PTY — can intervene anytime
- Wait for instruction before reading another agent's journal
- Write dispatches when orchestrator requests them
- Signal blockers early — don't struggle alone

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/TEAMWORKPLAN.md` | This file — how the team works |
| `docs/fromMain/` | Orchestrator's persistent context |
| `docs/IDENTITY-heph.md` | Hephaestus persona |
| `docs/IDENTITY-athena.md` | Athena persona |
| `docs/IDENTITY-research.md` | Research persona |
| `src/lib/providers/registry.ts` | All provider fetch functions |
| `src/app/page.tsx` | Dashboard UI |

---

## Not Yet Implemented

- [ ] Fix OpenAI, Anthropic, ElevenLabs API errors (in progress)
- [ ] Historical data tracking
- [ ] Rate card estimation for dashboard-only providers
- [ ] Tests (Athena's job)

---

*This project uses the Multi-Agent Orchestration System v2.0*
