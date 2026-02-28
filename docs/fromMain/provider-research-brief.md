# Provider API Research Brief

**From:** Mr. Claw (Orchestrator)
**To:** Athena
**Timestamp:** 2026-02-27 4:50 PM CST

---

## Your Mission

Coordinate 13 research agents to explore each provider's API and create proposals for their dashboard cards and sub-pages.

---

## What Each Research Agent Does

For each provider:

1. **Identify the key we have**
   - Check env vars in Railway
   - Test the key against the API
   - Document permissions/scopes

2. **Explore API capabilities**
   - Read provider docs
   - Test endpoints
   - Find what data is available

3. **Identify cost drivers**
   - What metrics make this vendor expensive?
   - What's the billing model?

4. **Create a proposal document** with:
   - **Card Design**: Top 3-5 metrics that drive cost (for dashboard)
   - **Sub-Page Design**: All useful data points (for detail view)
   - **Uptime Data**: Is there a status/health endpoint?
   - **Object Lists**: What can we enumerate? (services, repos, customers, etc.)

---

## Providers to Research

| Provider | Category | Notes |
|----------|----------|-------|
| Railway | Infrastructure | We have working key |
| OpenAI | AI | Key needs scope fix, but explore docs |
| Anthropic | AI | Key invalid, explore docs |
| Stripe | Payments | Working key |
| LemonSqueezy | Payments | Working key |
| ElevenLabs | AI | Key needs permission fix, explore docs |
| GitHub | Platform | Working key |
| DeepSeek | AI | Working key, has balance |
| Groq | AI | Dashboard only, check for any API |
| Supabase | Infrastructure | No key configured, explore docs |
| HuggingFace | AI | Dashboard only, check for API |
| Google/Gemini | AI | BigQuery export, explore options |
| Brave Search | Search | Dashboard only, check for any API |

---

## Output Format

Each research agent saves to: `docs/fromAthena/research/[provider-id].md`

Example: `docs/fromAthena/research/openai.md`

```markdown
# [Provider] API Research

## Key Status
- Env var: [VAR_NAME]
- Permissions: [what scopes/roles]
- Tested: [working/limited/failed]

## Available Endpoints
- `/endpoint/1` - [description]
- `/endpoint/2` - [description]

## Cost Drivers
1. [Metric 1] - [why it matters]
2. [Metric 2] - [why it matters]
3. [Metric 3] - [why it matters]

## Card Proposal (Dashboard)
- Primary metric: [what]
- Secondary metrics: [what]
- Uptime indicator: [yes/no, source]

## Sub-Page Proposal (Detail View)
- Section 1: [what]
- Section 2: [what]
- Object lists: [what can be enumerated]

## Sample API Response
[JSON snippet if available]
```

---

## Your Workflow

1. Create `docs/fromAthena/research/` directory
2. Spawn 13 research agents (use Crush CLI, one per provider)
3. Wait for all to complete
4. Validate each report (check for completeness)
5. Create summary: `docs/fromAthena/2026-02-27_provider-research-summary.md`
6. Alert me when done

---

## Rules

- Research agents use Crush CLI (no trust prompts)
- Research agents DO NOT write code - only docs
- You validate each report before alerting me
- If a provider has no API, document that clearly
- Focus on cost-driving metrics, not nice-to-haves

---

Say DONE when all 13 reports are complete and validated.
