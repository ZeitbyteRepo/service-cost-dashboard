# Teamwork Plan — Service Cost Dashboard

This document explains how our multi-agent team works together.

**Last Updated:** 2026-02-27 2:20 PM CST

---

## Current Project Status

**Live URL:** https://service-cost-dashboard-production.up.railway.app
**GitHub:** https://github.com/ZeitbyteRepo/service-cost-dashboard
**Latest Commit:** `86f1403` (Mistral UI redesign)

### Provider Status

| Provider | Status | Notes |
|----------|--------|-------|
| Railway | 🟢 Healthy | ~$41/mo |
| Stripe | 🟢 Healthy | $0.00 |
| LemonSqueezy | 🟢 Healthy | $160.00 |
| DeepSeek | 🟢 Healthy | $0.00 (4.98 balance) |
| GitHub | 🟢 Healthy | Fixed by Hephaestus |
| OpenAI | 🔴 Error | Key needs `api.usage.read` scope |
| Anthropic | 🔴 Error | Invalid API key |
| ElevenLabs | 🔴 Error | Key needs `user_read` permission |
| Groq | ⚪ Unknown | Dashboard only (est.) |
| Hugging Face | ⚪ Unknown | Dashboard only (est.) |
| Google/Gemini | ⚪ Unknown | Dashboard only (est.) |
| Supabase | ⚪ Unknown | No API key |
| Brave Search | ⚪ Unknown | Dashboard only (est.) |

**UI:** Mistral/cassette-futurism theme deployed (compact, Fold 6 responsive)

---

## The System

- **DISPATCH-INDEX.md is the brain** — One file tracks everything: pending tasks, active sessions, unread mail, completion history
- **Orchestrator** (Mr. Claw) reads the index, spawns agents, updates status
- **Git is persistence** — commit often, push always
- **CI is the gate** — no handoff until builds pass
- **Dispatches are checkpoints** — handoff records at phase boundaries

### How The Index Works

| Section | What It Means | Who Acts |
|---------|---------------|----------|
| **Pending** | Agents to spawn | Orchestrator reads, spawns agents |
| **Active** | Currently running | Orchestrator monitors, agents report |
| **Unread Dispatches** | New mail for agents | Agents read on spawn, then mark read |
| **Recent Complete** | Finished work | Audit trail, handoff history |

**The index IS the truth.** If it's not in the index, it doesn't exist.

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

## Spawn & Resume Protocol

### Orchestrator (On Heartbeat)

1. Read `DISPATCH-INDEX.md`
2. Check **Pending** section for agents to spawn
3. Spawn agent with: "Read DISPATCH-INDEX.md, check your unread dispatches, do the task"
4. Move entry from Pending → Active
5. Monitor until complete

### Agent (On Spawn)

1. Read `DISPATCH-INDEX.md`
2. Check **Unread Dispatches** for your name
3. Read any dispatches listed, mark them read (move to Reference)
4. Check **fromMain/state-of-project.md** for full context
5. Work
6. On complete: write dispatch if needed, update index (Active → Complete)

### After Crash/Disconnect

1. Read `DISPATCH-INDEX.md` to see what was running
2. Check **Active** section for last known state
3. Spawn agent with: "Continue from last checkpoint"
4. Agent reads index, recovers context, continues

**Goal:** Zero context loss. The index IS the memory.

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
| `docs/DISPATCH-INDEX.md` | **Central nervous system** — tracks everything |
| `docs/TEAMWORKPLAN.md` | This file — how the team works |
| `docs/fromMain/` | Orchestrator's persistent context |
| `docs/IDENTITY-heph.md` | Hephaestus persona |
| `docs/IDENTITY-athena.md` | Athena persona |
| `docs/IDENTITY-research.md` | Research persona |
| `src/lib/providers/registry.ts` | All provider fetch functions |
| `src/app/page.tsx` | Dashboard UI (Mistral theme) |
| `src/app/globals.css` | Styling (cassette-futurism) |

---

## Not Yet Implemented

- [x] ~~Fix OpenAI, Anthropic, ElevenLabs API errors~~ → Diagnosed, need human to regenerate keys
- [ ] Historical data tracking
- [ ] Rate card estimation for dashboard-only providers
- [ ] Tests (Athena's job)

---

*This project uses the Multi-Agent Orchestration System v2.0*
