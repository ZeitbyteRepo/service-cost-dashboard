# Provider API Research Complete

**From:** Athena
**To:** Hephaestus (next), Orchestrator
**Timestamp:** 2026-02-27 8:45 PM CST

---

## Summary

Completed research on all 13 provider APIs. Each provider now has a detailed research document with:
- Key Status (working/config needed)
- Available Endpoints
- Cost Drivers
- Card Proposal (dashboard metrics)
- Sub-Page Proposal (detail view)

---

## Research Files

All files in `docs/fromAthena/research/`:

| Provider | Key Status | Primary Cost Driver |
|----------|------------|---------------------|
| Railway | ✅ Working | CPU/RAM hours, bandwidth |
| OpenAI | ❌ Scope issue | Token usage by model |
| Anthropic | ❌ Invalid key | Token usage, prompt caching |
| Stripe | ✅ Working | Transaction volume |
| LemonSqueezy | ✅ Working | Order/subscription count |
| ElevenLabs | ❌ Scope issue | Character usage |
| GitHub | ✅ Working | Actions minutes, storage |
| DeepSeek | ✅ Working | Token usage, balance |
| Groq | ⚠️ No billing API | Token usage (dashboard) |
| Supabase | ❌ No key | Database/storage/bandwidth |
| HuggingFace | ⚠️ No billing API | Inference requests |
| Google/Gemini | ⚠️ BigQuery export | Token usage, media |
| Brave | ⚠️ No billing API | Search requests |

---

## Key Findings

### Working Keys (5/13)
- DeepSeek, GitHub, LemonSqueezy, Railway, Stripe
- These can show real data immediately

### Need Configuration (5/13)
- Anthropic - key is invalid
- ElevenLabs - missing `user_read` scope
- OpenAI - missing `api.usage.read` scope
- Supabase - no key configured
- Brave - needs key check

### No Billing API (3/13)
- Groq, HuggingFace - usage only, dashboard for costs
- Google/Gemini - BigQuery export required

---

## For Hephaestus

**Your task:** Build provider-specific cards and sub-pages based on this research.

Each research file has:
- `## Card Proposal` - what to show on dashboard (3-5 metrics)
- `## Sub-Page Proposal` - what to show on detail view

**Start with the 5 working providers** (Railway, Stripe, LemonSqueezy, GitHub, DeepSeek) since they can show real data immediately.

**Pattern to follow:**
1. Create `/src/components/cards/[Provider]Card.tsx` for each
2. Create `/src/app/providers/[id]/page.tsx` for sub-pages
3. Update registry to fetch additional data per provider

---

## Files Changed

- Created: 13 research files in `docs/fromAthena/research/`
- Created: `docs/fromAthena/2026-02-27_provider-research-summary.md`
- Commit: `8703ff2`

---

**Next:** Hephaestus reads research files, builds unique cards per provider.
