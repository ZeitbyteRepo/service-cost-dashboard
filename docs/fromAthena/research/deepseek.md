# DeepSeek API Research

## Key Status
- Env var: `DEEPSEEK_API_KEY`
- Permissions: Full API access
- Tested: Working key, has balance

## Available Endpoints

Base URL: `https://api.deepseek.com`

### Core API Endpoints
- `POST /chat/completions` - Chat completions (OpenAI compatible)
- `POST /completions` - Legacy completions
- `POST /beta/chat/completions` - Beta features

### Balance & Usage Endpoints
- `GET /user/balance` - Get account balance
- Dashboard at platform.deepseek.com for usage history

### Model Endpoints
- `GET /models` - List available models

## Cost Drivers

1. **Input Tokens** - Prompt tokens (cache miss)
2. **Output Tokens** - Generated tokens
3. **Cache Hits** - Discounted input tokens
4. **Thinking Tokens** - Reasoning model overhead

### Pricing by Model (per 1M tokens)
| Model | Input (Cache Miss) | Input (Cache Hit) | Output |
|-------|-------------------|-------------------|--------|
| deepseek-chat | $0.28 | $0.028 | $0.42 |
| deepseek-reasoner | $0.28 | $0.028 | $0.42 |

### Model Details
- **deepseek-chat**: DeepSeek-V3.2 (128K context, non-thinking)
- **deepseek-reasoner**: DeepSeek-V3.2 (128K context, thinking mode)
- Max output: 4K default, 8K max
- Thinking mode: 32K default, 64K max

### Context Caching
- 10x discount on cache hits
- Automatic caching of repeated prompts

## Card Proposal (Dashboard)

### Primary Metric
- **Account Balance** - Current remaining balance

### Secondary Metrics
- **Tokens Used** - Total this month
- **Input Tokens** - Prompt consumption
- **Output Tokens** - Generation count
- **Cache Hit Rate** - Efficiency metric

### Uptime Indicator
- Yes - Status page at `https://status.deepseek.com`
- API status check via balance endpoint

## Sub-Page Proposal (Detail View)

### Section 1: Balance Overview
- Current balance
- Usage rate (balance burn rate)
- Projected depletion date

### Section 2: Token Usage
- Daily token consumption
- Input/output ratio
- By model breakdown

### Section 3: Cache Performance
- Cache hit rate
- Savings from caching
- Cache miss analysis

### Section 4: Model Usage
- Usage by model type
- Thinking vs non-thinking
- Feature usage (JSON, tools)

### Section 5: Request Analytics
- Request count
- Average tokens per request
- Error rate

### Object Lists
- Models (available models)
- Balance (account status)
- API Keys (via dashboard)

## Sample API Response

```json
GET /user/balance

{
  "is_available": true,
  "balance_infos": [
    {
      "currency": "CNY",
      "total_balance": "100.00",
      "granted_balance": "10.00",
      "topped_up_balance": "90.00"
    }
  ]
}
```

```json
POST /chat/completions

{
  "model": "deepseek-chat",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": false
}

Response:
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1709078400,
  "model": "deepseek-chat",
  "choices": [...],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 25,
    "total_tokens": 35,
    "prompt_cache_hit_tokens": 0,
    "prompt_cache_miss_tokens": 10
  }
}
```

## Notes
- OpenAI SDK compatible
- Prepaid balance model
- Context caching automatic
- Tool calling supported
- JSON mode available
