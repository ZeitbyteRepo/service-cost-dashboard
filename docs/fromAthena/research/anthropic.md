# Anthropic API Research

## Key Status
- Env var: `ANTHROPIC_API_KEY`
- Permissions: API key for Messages API (brief says key invalid)
- Tested: Key invalid - explore docs only

## Available Endpoints

Base URL: `https://api.anthropic.com/v1`

### Core API Endpoints
- `POST /messages` - Create a message (main chat endpoint)
- `POST /messages/count_tokens` - Count tokens for a message
- `GET /models` - List available models

### Admin API Endpoints
- `GET /organizations/users` - List organization users
- `GET /organizations/workspaces` - List workspaces
- `GET /organizations/api_keys` - List API keys
- `GET /usage` - Usage and cost data (Usage and Cost API)

### Files API
- `POST /files` - Upload files
- `GET /files` - List files
- `GET /files/{id}` - Get file info
- `DELETE /files/{id}` - Delete file

## Cost Drivers

1. **Input Tokens** - Tokens in the prompt (system + user messages)
2. **Output Tokens** - Tokens in the assistant response
3. **Context Caching** - Cached tokens (discounted)
4. **Tool Use** - Tool definitions count as input
5. **Extended Thinking** - Additional thinking tokens (Claude 4)

### Pricing by Model (per 1M tokens)
| Model | Input | Output | Cached Input |
|-------|-------|--------|--------------|
| Claude 4.6 Sonnet | $3.00 | $15.00 | $0.30 |
| Claude 4.5 Sonnet | $3.00 | $15.00 | $0.30 |
| Claude 4 Opus | $15.00 | $75.00 | $1.50 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | $0.30 |
| Claude 3.5 Haiku | $0.80 | $4.00 | $0.08 |

### Extended Thinking Pricing
- Thinking tokens charged at input rate
- Additional compute for reasoning

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Token Cost** - Total spend

### Secondary Metrics
- **Input Tokens** - Total prompt tokens
- **Output Tokens** - Total response tokens
- **Cache Hit Rate** - Percentage of cached tokens
- **API Calls** - Request count

### Uptime Indicator
- Yes - Status page at `https://status.anthropic.com`
- No health API endpoint

## Sub-Page Proposal (Detail View)

### Section 1: Usage by Model
- Token breakdown per Claude model
- Cost per model
- Request distribution

### Section 2: Usage Trends
- Daily token consumption
- Input/output ratio
- Cache efficiency

### Section 3: Feature Usage
- Tool use frequency
- Vision usage
- Extended thinking costs

### Section 4: Workspace Analytics
- Per-workspace usage
- API key usage breakdown
- User activity

### Object Lists
- Models (list available)
- Files (uploaded files)
- Workspaces (admin API)
- API Keys (admin API)
- Users (admin API)

## Sample API Response

```json
POST /messages

{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}

Response:
{
  "id": "msg_01XYZ",
  "type": "message",
  "role": "assistant",
  "content": [...],
  "model": "claude-sonnet-4-20250514",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 25
  }
}
```

## Notes
- Key is currently invalid per brief
- Admin API requires organization setup
- Usage API endpoint for billing data
- Prompt caching can reduce costs significantly
