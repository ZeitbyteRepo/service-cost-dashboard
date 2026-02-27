# State of Project: Service Cost Dashboard

**From:** Mr. Claw (Orchestrator)
**To:** All Agents
**Timestamp:** 2026-02-27 12:35 PM CST

---

## Current Status

**Live URL:** https://service-cost-dashboard-production.up.railway.app
**GitHub:** https://github.com/ZeitbyteRepo/service-cost-dashboard
**Railway Project:** Zeitbyte Website

## What's Working

| Provider | Status | Data |
|----------|--------|------|
| Railway | 🟢 Healthy | $40.27/mo |
| Stripe | 🟢 Healthy | $0.00 |
| LemonSqueezy | 🟢 Healthy | $160.00 |
| DeepSeek | 🟢 Healthy | $0.00 (4.98 balance) |

## Current Issue (Hephaestus Fixing)

These providers are returning **Error** status:
- OpenAI - `/v1/organization/costs` failing
- Anthropic - `/v1/organizations/cost_report` failing
- ElevenLabs - `/v1/user/subscription` failing
- GitHub - billing endpoint failing

**Root cause:** Likely API endpoint format or header issues in `src/lib/providers/registry.ts`

**Env vars are confirmed set** in Railway - not an auth problem.

## Dashboard-Only Providers (No Billing API)

These correctly show as Unknown with "(est.)" badge:
- Groq
- Hugging Face
- Google/Gemini
- Brave Search

## Architecture

```
src/
├── app/
│   ├── page.tsx          ← Dashboard UI (card grid, refresh)
│   └── api/
│       └── providers/
│           └── route.ts  ← Returns all providers
└── lib/
    └── providers/
        ├── types.ts      ← ProviderData interface
        └── registry.ts   ← 13 provider fetch functions
```

## Key Files

- `docs/IDENTITY-heph.md` - Hephaestus persona (Codex)
- `docs/IDENTITY-athena.md` - Athena persona (Crush)
- `docs/IDENTITY-research.md` - Research persona (Crush)

## Env Vars (Set in Railway)

All API keys are configured:
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `LEMONSQUEEZY_API_KEY`
- `ELEVENLABS_API_KEY`
- `GITHUB_TOKEN` / `GITHUB_ORG`
- `DEEPSEEK_API_KEY`
- `GROQ_API_KEY`
- `HF_TOKEN`
- `RAILWAY_API_TOKEN`

## Not Yet Implemented

- Historical data tracking
- Rate card estimation for dashboard-only providers
- Tests (Athena's job)

## How to Resume

1. Read this file
2. Check `docs/fromHep/` for latest dev dispatch
3. Check `docs/fromAth/` for latest test dispatch
4. Continue from last checkpoint

---

*This file is the source of truth for project state. Update when context changes.*
