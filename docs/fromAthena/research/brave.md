# Brave Search API Research

## Key Status
- Env var: `BRAVE_SEARCH_API_KEY`
- Permissions: API access for search
- Tested: Dashboard only per brief - check for API

## Available Endpoints

Base URL: `https://api.search.brave.com/res/v1`

### Search Endpoints
- `GET /web/search` - Web search results
- `GET /images/search` - Image search
- `GET /videos/search` - Video search
- `GET /news/search` - News search

### AI Endpoints
- `GET /llm/context` - LLM context for grounding
- `POST /chat/completions` - Answers API (OpenAI compatible)

### Utility Endpoints
- `GET /suggest/search` - Search suggestions
- `GET /spellcheck/search` - Spell check

## Cost Drivers

1. **Search Requests** - Per-request pricing
2. **LLM Context** - Context generation for AI
3. **Answers API** - Token-based pricing
4. **Storage Rights** - For training data storage

### Pricing Model

#### Search API
| Plan | Price |
|------|-------|
| Free | $5/month credits included |
| Standard | $5 per 1,000 requests |
| Enterprise | Custom pricing |

#### Answers API
- $4 per 1,000 requests
- + $5 per million input/output tokens

#### Free Tier
- $5 in free credits every month
- Automatically applied

### Rate Limits
| Tier | Search QPS | Answers QPS |
|------|-----------|-------------|
| Standard | 50 QPS | 2 QPS |
| Enterprise | Custom | Custom |

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly API Requests** - Total searches

### Secondary Metrics
- **Search Requests** - Web searches
- **LLM Context Requests** - AI grounding calls
- **Answers Requests** - Chat completions
- **Tokens Used** - For Answers API

### Uptime Indicator
- No dedicated status API
- Monitor via API response times

## Sub-Page Proposal (Detail View)

### Section 1: Usage Overview
- Request count chart
- By endpoint breakdown
- Daily usage pattern

### Section 2: Search Analytics
- Search type distribution
- Query categories
- Geographic distribution

### Section 3: AI Usage
- LLM context requests
- Answers API usage
- Token consumption

### Section 4: Cost Breakdown
- Search costs
- Answers costs
- Free credit usage

### Section 5: Performance
- Average latency
- Error rates
- Cache hit rate

### Object Lists
- Search Results (queries)
- LLM Context (grounding data)
- Suggestions (autocomplete)
- Usage History (billing)

## Sample API Response

```json
GET /res/v1/web/search?q=greek+restaurants+in+san+francisco

Headers:
X-Subscription-Token: <API_KEY>

{
  "type": "search",
  "web": {
    "type": "search",
    "results": [
      {
        "title": "THE 10 BEST Greek Restaurants in San Francisco",
        "url": "https://www.tripadvisor.com/...",
        "description": "Best Greek Restaurants in San Francisco...",
        "profile": {
          "name": "Tripadvisor",
          "url": "https://www.tripadvisor.com/...",
          "long_name": "tripadvisor.com"
        }
      }
    ]
  }
}
```

```json
GET /res/v1/llm/context?q=what+is+tallest+mountain

{
  "grounding": {
    "generic": [
      {
        "url": "https://en.wikipedia.org/wiki/...",
        "title": "List of tallest mountains",
        "snippets": [...]
      }
    ]
  },
  "sources": {...}
}
```

```json
POST /res/v1/chat/completions (OpenAI compatible)

{
  "model": "brave",
  "messages": [
    {"role": "user", "content": "What is the highest mountain?"}
  ]
}

Response:
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The highest mountain is Mount Everest..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 7275,
    "completion_tokens": 305,
    "total_tokens": 7580
  }
}
```

## Notes
- Independent web index (not Google/Bing)
- SOC 2 Type II attested
- Zero Data Retention available
- OpenAI SDK compatible for Answers
- MCP server available
- $5 free credits monthly
