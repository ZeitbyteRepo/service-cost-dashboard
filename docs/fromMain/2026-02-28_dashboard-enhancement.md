# Dashboard Enhancement - Phase 2

**From:** Mr. Claw (Orchestrator)
**To:** Hephaestus
**Timestamp:** 2026-02-28 1:05 PM CST

---

## Your Mission

Enhance the Service Cost Dashboard with real data fetching, historical tracking, and improved provider cards.

---

## Phase 1: Detailed Fetch Functions

**Goal:** Make each provider card show ACTUAL data from APIs, not placeholders.

Read the research docs in `docs/fromAthena/research/*.md` - each has:
- Available endpoints
- Cost drivers
- Card proposal (what to show)

### Working Providers (Start Here)

Implement detailed fetches for these 5 (they have working API keys):

| Provider | Fetch These Metrics |
|----------|---------------------|
| **Railway** | Services list, CPU/memory per service, bandwidth, project info |
| **Stripe** | Customer count, transaction count, MRR, recent charges |
| **LemonSqueezy** | Order count, subscription count, product breakdown |
| **GitHub** | Actions minutes used, repo count, storage used, copilot seats |
| **DeepSeek** | Token usage (if available), burn rate from balance |

### Update Registry

In `src/lib/providers/registry.ts`, enhance each `fetchXxx()` function to:
1. Call additional API endpoints
2. Parse the response into the metrics
3. Return rich `ProviderData` with usage and extended fields

### Update Cards

In `src/components/cards/`, update each card to display the new metrics.

---

## Phase 2: Historical Data Tracking

**Goal:** Store daily snapshots and show trends.

### Storage

Create `data/costs/` directory with JSON files:

```
data/costs/
├── 2026-02-28.json
├── 2026-03-01.json
└── ...
```

Each file:
```json
{
  "date": "2026-02-28",
  "providers": {
    "railway": { "cost": 41.99, "usage": { ... } },
    "stripe": { "cost": 0, "usage": { ... } },
    ...
  }
}
```

### API Route

Create `/api/costs/history?days=30` to return historical data.

### UI

Add a "7-Day Trend" section to each provider card showing:
- Sparkline of daily costs
- % change from last week

---

## Phase 3: Rate Card Estimation

**Goal:** Estimate costs for providers without billing APIs.

### Providers Needing Estimation

| Provider | Approach |
|----------|----------|
| **Groq** | Fetch token usage, multiply by $0.20/1M tokens (input) |
| **HuggingFace** | Fetch inference calls, estimate per-call cost |
| **Google/Gemini** | Skip for now (requires BigQuery export) |
| **Brave Search** | Skip (no usage API) |

### Implementation

Create `src/lib/providers/estimation.ts`:

```typescript
export function estimateCost(provider: string, usage: UsageData): number {
  const rateCards = {
    groq: { inputToken: 0.20 / 1_000_000, outputToken: 0.60 / 1_000_000 },
    huggingface: { inferenceCall: 0.001 },
  };
  // Calculate based on usage
}
```

Mark estimated costs with `(est.)` badge in UI.

---

## Phase 4: Uptime Monitoring (Optional)

If time permits, add health checks using provider status pages:
- GitHub: status.github.com/api
- Railway: status.railway.app
- OpenAI: status.openai.com/api/v2

---

## Constraints

- Run `npm run build` after each phase
- Commit and push after each phase
- Do NOT break existing functionality
- Keep the retro terminal aesthetic

---

## Files to Modify

- `src/lib/providers/registry.ts` - Add detailed fetch logic
- `src/lib/providers/types.ts` - Add new metric types if needed
- `src/components/cards/*.tsx` - Display new metrics
- `src/app/api/costs/history/route.ts` - New API route (create)
- `src/lib/providers/estimation.ts` - New file (create)
- `data/costs/*.json` - Historical data files (create)

---

## Done Criteria

- [ ] Railway card shows services list + resource usage
- [ ] Stripe card shows customer count + MRR
- [ ] LemonSqueezy card shows orders + subscriptions
- [ ] GitHub card shows actions minutes + repo count
- [ ] DeepSeek card shows balance + burn rate
- [ ] Historical data stored daily
- [ ] 7-day trend visible on cards
- [ ] Estimated costs show for Groq/HuggingFace

---

Say DONE when all phases complete. Commit and push your work.
