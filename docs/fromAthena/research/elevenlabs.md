# ElevenLabs API Research

## Key Status
- Env var: `ELEVENLABS_API_KEY`
- Permissions: API key for TTS/STT (may need permission fix per brief)
- Tested: Key needs permission fix - explore docs

## Available Endpoints

Base URL: `https://api.elevenlabs.io`

### Text-to-Speech Endpoints
- `POST /v1/text-to-speech/{voice_id}` - Generate speech
- `POST /v1/text-to-speech/{voice_id}/stream` - Stream speech

### Speech-to-Text Endpoints
- `POST /v1/speech-to-text` - Transcribe audio

### Voice Endpoints
- `GET /v1/voices` - List all voices
- `POST /v1/voices` - Create voice
- `GET /v1/voices/{id}` - Get voice details
- `DELETE /v1/voices/{id}` - Delete voice

### Model Endpoints
- `GET /v1/models` - List available models

### User/Usage Endpoints
- `GET /v1/user` - Get user info
- `GET /v1/user/subscription` - Subscription details
- `GET /v1/usage` - Usage statistics

### History Endpoints
- `GET /v1/history` - Generation history
- `GET /v1/history/{id}` - Get history item

### Workspace Endpoints
- `GET /v1/workspace` - Workspace info
- `GET /v1/workspace/usage` - Workspace usage

## Cost Drivers

1. **Characters Generated** - Per-character TTS pricing
2. **Voice Model** - Different rates per model quality
3. **Audio Duration** - STT billed by duration
4. **Custom Voices** - Voice cloning costs
5. **API Tier** - Subscription level

### Pricing by Tier
| Plan | Characters/month | Price |
|------|------------------|-------|
| Free | 10,000 | $0 |
| Starter | 30,000 | $5/mo |
| Creator | 100,000 | $22/mo |
| Pro | 500,000 | $99/mo |
| Scale | Custom | Custom |

### Overage Pricing
- ~$0.30 per 1,000 characters (varies by plan)

### Character Costs
- Response headers include `x-character-count`
- Track per-request costs

## Card Proposal (Dashboard)

### Primary Metric
- **Characters Used** - Total this month

### Secondary Metrics
- **Character Limit** - Plan allowance
- **Usage Percentage** - % of limit used
- **API Calls** - Request count
- **Audio Generated** - Duration estimate

### Uptime Indicator
- No dedicated status API
- Monitor via API health

## Sub-Page Proposal (Detail View)

### Section 1: Usage Overview
- Character consumption chart
- Daily/hourly usage pattern
- Projected usage vs limit

### Section 2: Voice Analytics
- Voices used
- Most used voices
- Custom voice usage

### Section 3: Model Breakdown
- Usage by model
- Quality tier distribution
- Latency metrics

### Section 4: History
- Recent generations
- Failed requests
- Average audio length

### Section 5: Subscription
- Current plan
- Billing cycle
- Overage costs

### Object Lists
- Voices (all available)
- Models (TTS/STT models)
- History items (generations)
- Workspace users

## Sample API Response

```json
GET /v1/user/subscription

{
  "tier": "creator",
  "character_count": 45000,
  "character_limit": 100000,
  "can_extend_character_limit": true,
  "allowed_to_extend_character_limit": true,
  "max_characters_per_month": 100000
}
```

```json
POST /v1/text-to-speech/{voice_id}

Headers:
x-character-count: 150
request-id: abc123

Response: [audio binary]
```

```json
GET /v1/voices

{
  "voices": [
    {
      "voice_id": "abc123",
      "name": "Rachel",
      "samples": [...],
      "category": "premade"
    }
  ]
}
```

## Notes
- Character counting via response headers
- WebSocket streaming available
- Rate limits vary by plan
- Voice cloning requires consent
- MCP server available for integration
