# Groq API Research

## Key Status
- Env var: `GROQ_API_KEY`
- Permissions: API access (brief says dashboard only, check for API)
- Tested: Has API - OpenAI compatible

## Available Endpoints

Base URL: `https://api.groq.com/openai/v1`

### Core API Endpoints (OpenAI Compatible)
- `POST /chat/completions` - Chat completions
- `POST /audio/transcriptions` - Whisper transcription
- `POST /audio/translations` - Audio translation
- `GET /models` - List available models

### Management
- Dashboard at console.groq.com
- API keys management
- Usage tracking via dashboard

## Cost Drivers

1. **Input Tokens** - Prompt tokens
2. **Output Tokens** - Generated tokens
3. **Audio Duration** - Whisper transcription
4. **Tool Usage** - Web search, code execution
5. **TTS Characters** - Text-to-speech

### LLM Pricing (per 1M tokens)
| Model | Input | Output | Speed |
|-------|-------|--------|-------|
| Llama 3.3 70B | $0.59 | $0.79 | 394 TPS |
| Llama 3.1 8B | $0.05 | $0.08 | 840 TPS |
| Llama 4 Scout | $0.11 | $0.34 | 594 TPS |
| Llama 4 Maverick | $0.20 | $0.60 | 562 TPS |
| GPT-OSS 20B | $0.075 | $0.30 | 1000 TPS |
| GPT-OSS 120B | $0.15 | $0.60 | 500 TPS |
| Qwen3 32B | $0.29 | $0.59 | 662 TPS |
| Kimi K2 | $1.00 | $3.00 | 200 TPS |

### ASR Pricing (Whisper)
| Model | Price per Hour |
|-------|---------------|
| Whisper V3 Large | $0.111 |
| Whisper Large v3 Turbo | $0.04 |

### TTS Pricing
| Model | Price per M Characters |
|-------|----------------------|
| Orpheus English | $22.00 |
| Orpheus Arabic Saudi | $40.00 |

### Tool Pricing
| Tool | Price |
|------|-------|
| Basic Search | $5/1000 requests |
| Advanced Search | $8/1000 requests |
| Code Execution | $0.18/hour |
| Browser Automation | $0.08/hour |

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Token Cost** - Total spend

### Secondary Metrics
- **Input Tokens** - Total prompts
- **Output Tokens** - Total completions
- **Requests** - API call count
- **Average Latency** - Response time

### Uptime Indicator
- No dedicated status API
- Monitor via API response times

## Sub-Page Proposal (Detail View)

### Section 1: Usage Overview
- Token consumption chart
- Cost by model
- Daily usage pattern

### Section 2: Model Analytics
- Usage by model
- Performance comparison
- Speed metrics (TPS achieved)

### Section 3: Audio Services
- Transcription minutes
- TTS characters
- Audio quality metrics

### Section 4: Tool Usage
- Web search calls
- Code execution hours
- Browser automation usage

### Section 5: Performance
- Average latency
- Tokens per second
- Error rates

### Object Lists
- Models (available LLMs, ASR, TTS)
- API Keys (via dashboard)
- Usage History (dashboard)

## Sample API Response

```json
POST /openai/v1/chat/completions

{
  "model": "llama-3.3-70b-versatile",
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}

Response:
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1709078400,
  "model": "llama-3.3-70b-versatile",
  "choices": [...],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 25,
    "total_tokens": 35
  },
  "system_fingerprint": "fp_..."
}
```

## Notes
- OpenAI SDK compatible
- Extremely fast inference (LPU architecture)
- Free tier available
- Rate limits vary by plan
- Batch API with 50% discount
- Prompt caching available
