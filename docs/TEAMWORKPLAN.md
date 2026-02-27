# Teamwork Plan

This document explains how our multi-agent team works together.

## The System

- **Orchestrator** (Mr. Claw) watches agents work in real-time via PTY
- **Git is persistence** — commit often, push always
- **CI is the gate** — no handoff until builds pass
- **Dispatches are checkpoints** — handoff records at phase boundaries

## Agent Roles

| Agent | Role | Writes to |
|-------|------|-----------|
| Hephaestus | Developer — writes code, creates plans | `docs/fromHep/` |
| Athena | Tester — reviews code, writes tests | `docs/fromAth/` |

### Role Boundaries

- Developers don't write tests
- Testers don't write production code
- No one edits another agent's journal

## The Workflow

1. **Orchestrator spawns agent via PTY** → watches real-time stream
2. **Agent works** → orchestrator steers if direction drifts
3. **Agent signals done** → "commit and push"
4. **Wait for CI** → green = continue, red = fix
5. **"Make the dispatch"** → agent writes handoff record
6. **Commit dispatch** → push
7. **Route to next agent** → repeat

## Git Rules

- Commit every meaningful progress
- Push immediately after commit
- Wait for CI before handoff
- If red, fix before proceeding

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

## Communication Rules

- Orchestrator watches via PTY — can intervene anytime
- Wait for instruction before reading another agent's journal
- Write dispatches when orchestrator requests them
- Signal blockers early — don't struggle alone

---
*This project uses the Multi-Agent Orchestration System v2.0*
