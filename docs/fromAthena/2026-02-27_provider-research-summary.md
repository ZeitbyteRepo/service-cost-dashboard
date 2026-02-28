# Provider API Research Summary

**Date:** 2026-02-27
**Prepared by:** Athena

## Validation Status

All 13 provider research documents have been validated and contain all required sections:
- Key Status
- Available Endpoints
- Cost Drivers
- Card Proposal
- Sub-Page Proposal

---

## Provider Overview

| Provider | Category | Primary Cost Driver | Key Status |
|----------|----------|---------------------|------------|
| Anthropic | AI/LLM | Input/output tokens ($3-15/1M input, $15-75/1M output) | Invalid - needs fix |
| Brave | Search | Search requests ($5/1K), Answers API tokens | Check for API |
| DeepSeek | AI/LLM | Input/output tokens ($0.28/1M input, $0.42/1M output) | Working |
| ElevenLabs | Audio/TTS | Characters generated (~$0.30/1K chars) | Needs permission fix |
| GitHub | DevOps | Actions minutes ($0.008-0.08/min), storage | Working |
| Google/Gemini | AI/LLM | Input/output tokens ($0.10-4/1M input), image/video gen | Check BigQuery export |
| Groq | AI/LLM | Input/output tokens ($0.05-1/1M input, $0.08-3/1M output) | Has API access |
| HuggingFace | ML Platform | Inference calls, compute hours ($0.05-4.50/hr) | Dashboard only |
| LemonSqueezy | Payments | Transaction fees (5% + 50c per transaction) | Working |
| OpenAI | AI/LLM | Input/output tokens ($0.15-15/1M input, $0.60-60/1M output) | May need scope fix |
| Railway | Infrastructure | CPU/memory usage, storage, bandwidth | Working (integrated) |
| Stripe | Payments | Transaction fees (2.9% + $0.30 per transaction) | Working |
| Supabase | Database | Database size, compute ($0.125/GB overage), bandwidth | Not configured |

---

## API Key Status Summary

### Working Keys (5)
- **DeepSeek** - Working key with balance
- **GitHub** - Working key
- **LemonSqueezy** - Working key
- **Railway** - Working (already integrated in dashboard)
- **Stripe** - Working key

### Needs Configuration/Fix (5)
- **Anthropic** - Key invalid
- **ElevenLabs** - Key needs permission fix
- **OpenAI** - May need scope adjustment
- **Supabase** - Not configured
- **Brave** - Dashboard only, check for API access

### Needs Exploration (3)
- **Google/Gemini** - Brief mentions BigQuery export, explore options
- **Groq** - Has API (OpenAI compatible), verify full access
- **HuggingFace** - Dashboard only per brief, check for API

---

## Key Findings & Patterns

### 1. AI/LLM Providers Dominate
5 of 13 providers are AI/LLM services (Anthropic, DeepSeek, Google, Groq, OpenAI). All use token-based pricing with:
- Input tokens (prompt)
- Output tokens (completion)
- Context caching discounts (DeepSeek: 10x, Anthropic/Google: ~5x)

### 2. Payment Processing Parity
Both LemonSqueezy and Stripe are configured with working keys:
- **Stripe**: 2.9% + $0.30 per card transaction
- **LemonSqueezy**: 5% + $0.50 but handles taxes globally (MoR)

### 3. OpenAI SDK Compatibility
Multiple providers are OpenAI SDK compatible:
- Groq (base URL: `api.groq.com/openai/v1`)
- DeepSeek (base URL: `api.deepseek.com`)
- Brave Answers API

### 4. GraphQL vs REST
- **Railway** uses GraphQL exclusively
- All others use REST APIs

### 5. Usage/Billing API Availability
Most providers offer usage endpoints:
- **OpenAI**: Admin API with detailed usage endpoints
- **DeepSeek**: `/user/balance` endpoint
- **GitHub**: Billing endpoints under `/orgs/{org}/settings/billing/`
- **ElevenLabs**: `/v1/user/subscription` and `/v1/usage`
- **Supabase**: `/projects/{id}/usage` and `/projects/{id}/billing/usage`

### 6. Status Page Availability
Providers with dedicated status pages:
- Anthropic: `status.anthropic.com`
- DeepSeek: `status.deepseek.com`
- GitHub: `githubstatus.com`
- OpenAI: `status.openai.com`
- Railway: `status.railway.app`
- Stripe: `status.stripe.com`
- Supabase: `status.supabase.com`

### 7. Cost Efficiency Leaders
- **DeepSeek**: Lowest LLM pricing at $0.28/1M input tokens
- **Groq**: Fastest inference with competitive pricing
- **Railway**: Usage-based with granular resource tracking

---

## Recommended Implementation Priority

### Phase 1: Working Keys (Immediate)
1. Railway (already integrated)
2. Stripe
3. LemonSqueezy
4. GitHub
5. DeepSeek

### Phase 2: Fix Configuration
1. Anthropic (high value, key invalid)
2. OpenAI (may need scope fix)
3. ElevenLabs (needs permission fix)
4. Supabase (needs configuration)

### Phase 3: Explore Options
1. Google/Gemini (BigQuery export)
2. Groq (verify full access)
3. Brave (check API access)
4. HuggingFace (check API access)

---

## Next Steps

1. Fix invalid/missing API keys for Phase 2 providers
2. Verify API scopes for OpenAI and ElevenLabs
3. Configure Supabase API key
4. Test Brave and HuggingFace API access
5. Begin dashboard card implementation for Phase 1 providers
