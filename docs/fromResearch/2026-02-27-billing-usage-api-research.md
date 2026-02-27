# Research: Billing/Usage APIs for Samuel's Providers

## Summary
This dispatch maps billing/usage API surfaces for 13 providers, starting with the current Railway pattern used in this repo. For each provider, it documents endpoint(s), auth, rate limits, response shape, and extractable fields (cost/usage/limits) so Hephaestus can implement integrations consistently.

## Railway (Template - already integrated)

### Current pattern in this repo
- File: `src/lib/railway.ts`
- Transport: GraphQL POST to `https://backboard.railway.app/graphql/v2`
- Auth: `Authorization: Bearer ${RAILWAY_API_TOKEN}`
- Existing queries:
  - `projects { edges { node { id name ... } } }`
  - `estimatedUsage { estimatedUsage projectedCost }`

### Billing/usage endpoint
- `POST https://backboard.railway.app/graphql/v2`
- Query used for billing-like metric:
  - `estimatedUsage { estimatedUsage projectedCost }`

### Authentication
- Bearer token in `Authorization` header.

### Rate limits
- Railway docs indicate plan-based API limits:
  - Free: 100 requests/hour
  - Hobby: 1000 requests/hour, 10 requests/second
  - Pro: 10000 requests/hour, 50 requests/second

### Example response structure
```json
{
  "data": {
    "estimatedUsage": {
      "estimatedUsage": 12345,
      "projectedCost": 67.89
    }
  }
}
```

### Extractable data
- Cost: `projectedCost`
- Usage proxy: `estimatedUsage`
- Limits: from plan tier/rate limits (not returned by query)

---

## OpenAI

### Billing/usage endpoints
- Usage (org-level):
  - `GET /v1/organization/usage/completions`
  - `GET /v1/organization/usage/{images|audio|embeddings|moderations|vector_stores|code_interpreter_sessions}`
- Costs:
  - `GET /v1/organization/costs`

### Authentication
- Bearer API key.
- Organization owner/admin access is required in practice for org-level billing/usage visibility.

### Rate limits
- Org/project/model tier based; limits shown in OpenAI limits UI and returned via rate-limit headers.
- Usage limits (monthly spend caps) are tiered.

### Example response structure (shape)
```json
{
  "object": "list",
  "data": [
    {
      "start_time": 1735689600,
      "end_time": 1735776000,
      "results": [
        {
          "model": "gpt-5",
          "input_tokens": 12345,
          "output_tokens": 6789
        }
      ]
    }
  ],
  "has_more": false
}
```

### Extractable data
- Cost: from `/v1/organization/costs` (invoice-line-item/project grouped spend)
- Usage: token/request/session usage by endpoint/model/project/key/user
- Limits: rate-limit headers + org tier limits

---

## Anthropic

### Billing/usage endpoints
- Usage report (messages):
  - `GET /v1/organizations/usage_report/messages`
- Cost report:
  - `GET /v1/organizations/cost_report`

### Authentication
- Admin API key required (`sk-ant-admin...`), header `x-api-key`.
- Also include `anthropic-version` header.

### Rate limits
- Anthropic org/model tier rate limits apply (RPM/ITPM/OTPM + spend limits).
- Response headers expose remaining/reset values.

### Example response structure
```json
{
  "data": [
    {
      "starting_at": "2025-08-01T00:00:00Z",
      "ending_at": "2025-08-02T00:00:00Z",
      "results": [
        {
          "uncached_input_tokens": 1500,
          "cache_read_input_tokens": 200,
          "output_tokens": 500,
          "workspace_id": "wrkspc_x",
          "model": "claude-sonnet-4-20250514"
        }
      ]
    }
  ],
  "has_more": false,
  "next_page": null
}
```

Cost report item shape includes `currency`, `amount`, `cost_type`, `description`, `model`, `service_tier`, etc.

### Extractable data
- Cost: `amount` (USD decimal string), grouped by workspace/description/model/cost_type
- Usage: input/output/cache token breakdown and dimensions
- Limits: via Anthropic tier limits and rate-limit headers

---

## Groq

### Billing/usage endpoints
- No general public billing REST endpoint for standard plans documented.
- Documented usage telemetry endpoint (Enterprise):
  - Base: `https://api.groq.com/v1/metrics/prometheus`
  - Paths: `/api/v1/query`, `/api/v1/query_range`, etc. (Prometheus API)

### Authentication
- Bearer key: `Authorization: Bearer <GROQ_API_KEY>`.

### Rate limits
- Model/plan limits documented (RPM/RPD/TPM/TPD/etc).
- Spend limits configurable in dashboard; dashboard spend is near-real-time with delay.

### Example response structure (Prometheus query)
```json
{
  "status": "success",
  "data": {
    "resultType": "vector",
    "result": [
      {
        "metric": {"model": "llama-3.3-70b-versatile"},
        "value": [1735689600, "123.45"]
      }
    ]
  }
}
```

### Extractable data
- Cost: not directly documented as public API for standard accounts
- Usage: token/request metrics via Enterprise Prometheus endpoint
- Limits: plan/model limits from Groq limits docs

---

## DeepSeek

### Billing/usage endpoints
- Account balance:
  - `GET /user/balance`
- Per-request usage is returned in completion response `usage` fields (OpenAI-compatible API format).

### Authentication
- Bearer auth (`Authorization: Bearer <DEEPSEEK_API_KEY>`).

### Rate limits
- DeepSeek docs currently state no explicit hard user rate limit; dynamic traffic handling and long scheduling waits may occur.

### Example response structure
`GET /user/balance`:
```json
{
  "is_available": true,
  "balance_infos": [
    {
      "currency": "USD",
      "total_balance": "123.45",
      "granted_balance": "10.00",
      "topped_up_balance": "113.45"
    }
  ]
}
```

### Extractable data
- Cost: inferred from token usage * pricing table; direct spend history endpoint not documented
- Usage: `usage` per completion + dashboard export
- Limits: balance sufficiency + dynamic platform behavior (no static public RPM table)

---

## Google/Gemini (Cloud Console billing APIs)

### Billing/usage endpoints
- Cloud Billing account APIs:
  - `GET https://cloudbilling.googleapis.com/v1/billingAccounts`
  - `GET https://cloudbilling.googleapis.com/v1/{name=billingAccounts/*}`
- Budget APIs:
  - `GET/POST/PATCH/DELETE https://billingbudgets.googleapis.com/v1/{billingAccounts/*/budgets...}`
- Pricing APIs:
  - `GET https://cloudbilling.googleapis.com/v2beta/services`
  - `GET https://cloudbilling.googleapis.com/v2beta/services/{service}/skus`
- Actual granular usage/cost data: export to BigQuery tables (`gcp_billing_export_v1_*`, `gcp_billing_export_resource_v1_*`).

### Authentication
- Google OAuth2 / service account with Cloud Billing scopes:
  - `cloud-billing.readonly` (or broader cloud-platform)

### Rate limits
- Cloud Billing API quotas (per docs):
  - Cloud Billing API: 300 calls/min per project (org default 975/min)
  - Budget API: reads 800/min, writes 100/min

### Example response structure (billing account)
```json
{
  "name": "billingAccounts/012345-567890-ABCDEF",
  "open": true,
  "displayName": "Prod Billing"
}
```

### Extractable data
- Cost: from BigQuery billing export tables (invoice/month/resource-level costs)
- Usage: from detailed usage export (SKU/service/resource usage)
- Limits: budget thresholds + API quota limits

---

## ElevenLabs

### Billing/usage endpoints
- Subscription/usage info:
  - `GET /v1/user/subscription`
  - Also available nested via `GET /v1/user`

### Authentication
- Header: `xi-api-key: <ELEVENLABS_API_KEY>`

### Rate limits
- No single universal numeric table in API reference; limits vary by plan/endpoint.
- API keys can have scoped endpoint access and credit quota restrictions.

### Example response structure
```json
{
  "tier": "starter",
  "character_count": 3500,
  "character_limit": 15000,
  "status": "active",
  "currency": "usd",
  "billing_period": "monthly_period",
  "open_invoices": [
    {"amount_due_cents": 1200}
  ]
}
```

### Extractable data
- Cost: open invoice amounts, next invoice details
- Usage: character/audio usage counters and limits
- Limits: `character_limit`, voice limits, plan metadata

---

## Stripe

### Billing/usage endpoints
- Record usage for metered billing:
  - `POST /v1/billing/meter_events`
- Read aggregated usage:
  - Meter event summaries object/endpoints (`billing.meter_event_summary`)
- Cost/billing totals generally derived from:
  - Invoices (`/v1/invoices`), upcoming invoice, invoice line items, balance transactions

### Authentication
- Secret API key (Basic auth with key as username; or Bearer in SDKs).

### Rate limits
- Global/request class limits apply.
- Meter events endpoint documented at up to 1000 req/s in live mode (higher via streams API v2).

### Example response structure (meter event summary object)
```json
{
  "id": "mtrusg_...",
  "object": "billing.meter_event_summary",
  "aggregated_value": 10,
  "start_time": 1711656000,
  "end_time": 1711659600,
  "meter": "mtr_..."
}
```

### Extractable data
- Cost: invoice totals, line items, taxes, discounts
- Usage: meter event totals and dimensions
- Limits: rate-limit headers and account limits

---

## LemonSqueezy

### Billing/usage endpoints
- Usage-based billing:
  - `POST /v1/usage-records`
  - `GET /v1/usage-records`
  - `GET /v1/subscription-items/:id/current-usage`
- Broader billing data via subscriptions/orders endpoints.

### Authentication
- `Authorization: Bearer <api_key>`
- JSON:API headers required (`Accept: application/vnd.api+json`, etc.)

### Rate limits
- Main LemonSqueezy API: 300 calls/min.

### Example response structure
```json
{
  "meta": {
    "period_start": "2023-08-10T13:08:16+00:00",
    "period_end": "2023-09-10T13:03:16+00:00",
    "quantity": 5,
    "interval_unit": "month",
    "interval_quantity": 1
  }
}
```

### Extractable data
- Cost: from subscriptions/orders/invoices (outside usage-record object itself)
- Usage: `quantity` per billing period
- Limits: API rate-limit headers

---

## Supabase

### Billing/usage endpoints
- Usage analytics endpoints (Management API):
  - `GET /v1/projects/{ref}/analytics/endpoints/usage.api-counts`
  - `GET /v1/projects/{ref}/analytics/endpoints/usage.api-requests-count`
- Billing metadata endpoint:
  - `GET /v1/projects/{ref}/billing/addons` (includes active addons and pricing metadata)

### Authentication
- Management API bearer token (`Authorization: Bearer <access_token>`)
- PAT or OAuth2 token.

### Rate limits
- Standard: 120 requests/min per user per scope (project/org).
- Some usage analytics endpoints have stricter limits (e.g., 30/min).

### Example response structure
```json
{
  "result": [
    {
      "timestamp": "2021-12-31T23:34:00Z",
      "total_auth_requests": 42,
      "total_realtime_requests": 42,
      "total_rest_requests": 42,
      "total_storage_requests": 42
    }
  ],
  "error": null
}
```

### Extractable data
- Cost: via billing addon pricing metadata + plan configuration (not full invoice ledger endpoint documented in source set)
- Usage: API request counts by service over time
- Limits: Management API quota headers and per-endpoint limits

---

## Hugging Face

### Billing/usage endpoints
- No clear public programmatic billing usage endpoint found in official docs for full account spend export.
- Official docs emphasize Billing Dashboard and invoices in web UI.

### Authentication
- HF token for API access generally (`Authorization: Bearer <HF_TOKEN>`), but billing dashboard is UI-centric.

### Rate limits
- Hub/API rate limits are documented; usage shown in billing page gauges.

### Example response structure
- Not applicable for billing usage API (dashboard-first).

### Extractable data
- Cost: from billing dashboard/invoices (manual/UI)
- Usage: from dashboard metrics and service-specific product pages
- Limits: Hub/API request limit tiers

Implementation note: treat Hugging Face as "no official billing usage API found" and use fallback/manual ingestion unless a private/internal endpoint is approved.

---

## GitHub (Actions billing)

### Billing/usage endpoints
- New enhanced billing endpoints (recommended):
  - `GET /organizations/{org}/settings/billing/usage`
  - `GET /organizations/{org}/settings/billing/usage/summary`
  - Also user-level analogs.
- For Actions-specific reporting, usage items include `product: "Actions"` and Actions SKUs.

### Authentication
- Fine-grained PAT or GitHub App token with org administration read perms.
- Include `X-GitHub-Api-Version` header.

### Rate limits
- Standard GitHub REST API rate limits apply by token type.

### Example response structure
```json
{
  "timePeriod": {"year": 2025},
  "organization": "GitHub",
  "usageItems": [
    {
      "product": "Actions",
      "sku": "actions_linux",
      "unitType": "minutes",
      "pricePerUnit": 0.008,
      "grossQuantity": 1000,
      "netAmount": 8
    }
  ]
}
```

### Extractable data
- Cost: `grossAmount`, `discountAmount`, `netAmount`
- Usage: minutes/storage by SKU/product/date/repo
- Limits: GitHub REST rate limits and plan entitlements

---

## Brave Search

### Billing/usage endpoints
- Search API endpoint:
  - `GET https://api.search.brave.com/res/v1/web/search`
- No dedicated public "billing usage report" endpoint found in docs set.
- Consumption observability is exposed through response headers + dashboard pricing/plan pages.

### Authentication
- Header: `X-Subscription-Token: <BRAVE_SEARCH_API_KEY>`

### Rate limits
- Enforced with sliding window.
- Response headers include:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Policy`
- Plan pricing pages specify request/second and monthly quotas by plan.

### Example response structure (rate-limit relevant headers)
```http
X-RateLimit-Limit: 1, 15000
X-RateLimit-Policy: 1;w=1, 15000;w=2592000
```

### Extractable data
- Cost: inferred from request count * plan pricing (no official public spend endpoint found)
- Usage: request volume inferred from app-side counters + rate-limit headers
- Limits: direct from rate-limit headers and plan definitions

---

## Sources
- Railway API docs: https://docs.railway.com/integrations/api
- Railway integration file: `src/lib/railway.ts`
- OpenAI usage reference: https://platform.openai.com/docs/api-reference/usage/completions
- OpenAI usage/cost article: https://help.openai.com/en/articles/8554956-understanding-your-api-usage/
- Anthropic Usage & Cost API: https://docs.anthropic.com/en/api/data-usage-cost-api
- Anthropic usage endpoint ref: https://docs.anthropic.com/en/api/admin-api/usage-cost/get-messages-usage-report
- Anthropic cost endpoint ref: https://docs.anthropic.com/en/api/admin-api/usage-cost/get-cost-report
- Anthropic rate limits: https://docs.anthropic.com/en/api/rate-limits
- Groq rate limits: https://console.groq.com/docs/rate-limits
- Groq spend limits: https://console.groq.com/docs/spend-limits
- Groq metrics endpoint: https://console.groq.com/docs/prometheus-metrics
- DeepSeek auth/start: https://api-docs.deepseek.com/
- DeepSeek balance endpoint: https://api-docs.deepseek.com/api/get-user-balance/
- DeepSeek rate limits: https://api-docs.deepseek.com/quick_start/rate_limit/
- Gemini billing (Cloud Billing requirement): https://ai.google.dev/gemini-api/docs/billing/
- Cloud Billing REST: https://cloud.google.com/billing/docs/reference/rest
- Cloud Billing Budget API: https://cloud.google.com/billing/docs/reference/budget/rest
- Cloud Billing quotas: https://docs.cloud.google.com/billing/quotas
- Cloud Billing export to BigQuery: https://cloud.google.com/billing/docs/how-to/export-data-bigquery
- ElevenLabs auth: https://elevenlabs.io/docs/api-reference/authentication
- ElevenLabs subscription endpoint: https://elevenlabs.io/docs/api-reference/user/subscription/get
- Stripe keys/auth: https://docs.stripe.com/keys
- Stripe rate limits: https://docs.stripe.com/rate-limits
- Stripe usage-based billing: https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api
- Stripe meter event summary object: https://docs.stripe.com/api/billing/meter-event_summary/object
- LemonSqueezy API reference: https://docs.lemonsqueezy.com/api
- LemonSqueezy usage records: https://docs.lemonsqueezy.com/api/usage-records/list-all-usage-records
- LemonSqueezy current usage endpoint: https://docs.lemonsqueezy.com/api/subscription-items/retrieve-subscription-item-current-usage
- Supabase Management API reference: https://supabase.com/docs/reference/api/start
- Supabase endpoint showing usage analytics paths: https://supabase.com/docs/reference/api/create-a-project
- Supabase management rate limits: https://supabase.com/docs/reference/api/v1-get-security-advisors
- GitHub billing REST: https://docs.github.com/en/rest/billing
- GitHub billing usage endpoints: https://docs.github.com/en/rest/billing/usage
- Brave Search API docs (rate limiting): https://api-dashboard.search.brave.com/documentation/guides/rate-limiting
- Brave pricing/docs: https://api-dashboard.search.brave.com/documentation/pricing

## Notes for Hephaestus
- Prioritize providers with explicit programmatic spend endpoints first: Railway, OpenAI, Anthropic, Stripe, GitHub, DeepSeek(balance + request usage), Supabase(usage + billing metadata), LemonSqueezy(usage-based records).
- Treat Groq/HuggingFace/Brave as mixed capability integrations where billing may be dashboard-first unless enterprise/private APIs are available.
- For Google/Gemini, production-grade cost ingestion is usually BigQuery billing export + periodic query jobs, not a single "usage endpoint" call.
