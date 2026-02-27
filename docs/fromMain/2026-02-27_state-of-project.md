# State of Project: Service Cost Dashboard

**From:** Mr. Claw (Orchestrator)
**To:** All Agents
**Timestamp:** 2026-02-27 1:15 PM CST

---

## Current Status

**Live URL:** https://service-cost-dashboard-production.up.railway.app
**GitHub:** https://github.com/ZeitbyteRepo/service-cost-dashboard
**Railway Project:** Zeitbyte Website

## Latest Commit

`d5fd760` - Fix Anthropic, ElevenLabs, and GitHub provider billing requests

---

## Provider Status (Post-Fix)

Deploying now. Check live dashboard after ~30 seconds.

| Provider | Expected Status |
|----------|-----------------|
| Railway | 🟢 Healthy ($40.27) |
| Stripe | 🟢 Healthy ($0.00) |
| LemonSqueezy | 🟢 Healthy ($160.00) |
| DeepSeek | 🟢 Healthy ($0.00) |
| **OpenAI** | Should now work ✅ |
| **Anthropic** | Should now work ✅ |
| **ElevenLabs** | Should now work ✅ |
| **GitHub** | Should now work ✅ |
| Groq | ⚪ Unknown (est.) |
| Hugging Face | ⚪ Unknown (est.) |
| Google/Gemini | ⚪ Unknown (est.) |
| Supabase | ⚪ Unknown (no key) |
| Brave Search | ⚪ Unknown (est.) |

## Fixes Applied (Hephaestus)

### Anthropic
- Switched to POST with JSON body
- Added fallback to GET query params
- Better error handling

### ElevenLabs
- Added content-type header
- Fixed cost parsing (next_invoice.amount_due_cents)
- Fallback to price_per_month

### GitHub
- Fixed endpoint: `/orgs/{org}/settings/billing/usage`
- Added year/month query params
- Added User-Agent header
- Fixed snake_case/camelCase field handling

---

## Not Yet Implemented

- Historical data tracking
- Rate card estimation for dashboard-only providers
- Tests (Athena's job)

## Resume Protocol

1. Read this file
2. Check live dashboard for provider status
3. Continue from last checkpoint

---

*This file is the source of truth for project state.*
