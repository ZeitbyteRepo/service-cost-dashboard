# Dispatch Index

**The central nervous system for multi-agent coordination.**

Last Updated: 2026-02-27 14:15 PM CST

---

## How This Works

| Section | What It Means | Who Acts |
|---------|---------------|----------|
| **Pending** | Agents to spawn | Orchestrator reads, spawns agents |
| **Active** | Currently running | Orchestrator monitors, agents report |
| **Unread Dispatches** | New mail for agents | Agents read on spawn, then mark read |
| **Recent Complete** | Finished work | Audit trail, handoff history |

---

## Pending (Spawn These)

| Agent | Dispatch | Task Summary |
|-------|----------|--------------|
| *(none)* | - | - |

---

## Active Sessions

| Agent | Task | Started | Status |
|-------|------|---------|--------|
| *(none)* | - | - | - |

---

## Unread Dispatches

| For | File | Summary |
|-----|------|---------|
| All | `fromMain/2026-02-27_state-of-project.md` | 5/13 providers working, 3 need key fixes, UI redesigned |

---

## Recent Complete

| Agent | Dispatch | Completed | Result |
|-------|----------|-----------|--------|
| Hephaestus | `fromMain/ui-redesign-request.md` (implicit) | 2026-02-27 13:54 | Mistral/cassette-futurism UI deployed |
| Hephaestus | API investigation | 2026-02-27 13:22 | Diagnosed 3 permission errors |
| Hephaestus | Provider registry | 2026-02-27 10:30 | Built 13-provider system |
| Research | `fromResearch/2026-02-27-billing-usage-api-research.md` | 2026-02-27 09:00 | Documented 13 provider APIs |

---

## Reference Dispatches (Always Available)

| File | Purpose |
|------|---------|
| `fromMain/2026-02-27_state-of-project.md` | Current project state |
| `fromResearch/2026-02-27-billing-usage-api-research.md` | Provider API documentation |

---

## Rules

1. **Orchestrator**: On heartbeat, check Pending. If entry exists, spawn agent and move to Active.
2. **Agent**: On spawn, read Unread Dispatches for your name, then mark read (move to Reference).
3. **Agent**: On complete, move your Active entry to Recent Complete, write dispatch if needed.
4. **All**: The index IS the truth. If it's not here, it doesn't exist.

---

## Status Legend

- `pending` = Ready to spawn
- `running` = Agent working
- `blocked` = Needs human input
- `complete` = Done
