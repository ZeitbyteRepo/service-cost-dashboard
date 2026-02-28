# Google/Gemini API Research

## Key Status
- Env var: `GOOGLE_API_KEY` or `GEMINI_API_KEY`
- Permissions: API access via AI Studio or Vertex AI
- Tested: Brief mentions BigQuery export - explore options

## Available Endpoints

### Gemini Developer API
Base URL: `https://generativelanguage.googleapis.com/v1beta`

- `POST /models/{model}:generateContent` - Generate content
- `POST /models/{model}:streamGenerateContent` - Stream content
- `POST /models/{model}:countTokens` - Count tokens
- `GET /models` - List models
- `GET /models/{model}` - Get model info

### Files API
- `POST /upload/v1beta/files` - Upload file
- `GET /upload/v1beta/files` - List files
- `GET /upload/v1beta/files/{id}` - Get file
- `DELETE /upload/v1beta/files/{id}` - Delete file

### Vertex AI (Enterprise)
- Full GCP integration
- BigQuery export available
- Cloud billing reports

### Available Models
| Model | Type | Context |
|-------|------|---------|
| gemini-3.1-pro-preview | Text | 128K |
| gemini-3-flash-preview | Text | 128K |
| gemini-2.5-pro | Text | 1M |
| gemini-2.5-flash | Text | 1M |
| gemini-2.0-flash | Text | 1M |
| imagen-4 | Image | - |
| veo-3 | Video | - |

## Cost Drivers

1. **Input Tokens** - Text/image/video/audio input
2. **Output Tokens** - Generated text (including thinking)
3. **Image Generation** - Per-image pricing
4. **Video Generation** - Per-second pricing
5. **Context Caching** - Storage fees
6. **Grounding** - Search grounding fees

### Pricing (Paid Tier, per 1M tokens)
| Model | Input | Output | Cached |
|-------|-------|--------|--------|
| Gemini 3.1 Pro | $2.00/$4.00* | $12.00/$18.00* | $0.20/$0.40* |
| Gemini 3 Flash | $0.50 | $3.00 | $0.05 |
| Gemini 2.5 Pro | $1.25/$2.50* | $10.00/$15.00* | $0.125/$0.25* |
| Gemini 2.5 Flash | $0.30 | $2.50 | $0.03 |
| Gemini 2.0 Flash | $0.10 | $0.40 | $0.025 |

*Higher price for prompts > 200k tokens

### Image Pricing
- Imagen 4 Fast: $0.02/image
- Imagen 4 Standard: $0.04/image
- Imagen 4 Ultra: $0.06/image

### Video Pricing
- Veo 3 Standard: $0.40/second
- Veo 3 Fast: $0.15/second

### Audio Pricing
- Input audio: $1.00/1M tokens
- Output audio (Live API): $12.00/1M tokens

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Token Cost** - Total spend

### Secondary Metrics
- **Input Tokens** - Total prompts
- **Output Tokens** - Total generations
- **Cache Hit Rate** - Efficiency
- **API Calls** - Request count

### Uptime Indicator
- Yes - Status page for GCP
- API health check via models endpoint

## Sub-Page Proposal (Detail View)

### Section 1: Usage Overview
- Token consumption by model
- Cost breakdown
- Daily usage trend

### Section 2: Model Analytics
- Usage per Gemini model
- Image generation count
- Video generation duration

### Section 3: Features Used
- Thinking tokens
- Grounding (Search/Maps)
- Code execution
- File uploads

### Section 4: Context Caching
- Cache hit rate
- Storage costs
- Cache efficiency

### Section 5: BigQuery Export
- Usage data export
- Historical analysis
- Custom queries

### Object Lists
- Models (available models)
- Files (uploaded files)
- Cached Content (context caches)
- Tuned Models (fine-tuned)

## Sample API Response

```json
POST /v1beta/models/gemini-2.5-flash:generateContent

{
  "contents": [
    {
      "parts": [
        {"text": "Hello"}
      ]
    }
  ]
}

Response:
{
  "candidates": [
    {
      "content": {
        "parts": [
          {"text": "Hello! How can I help you?"}
        ],
        "role": "model"
      }
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 2,
    "candidatesTokenCount": 8,
    "totalTokenCount": 10
  }
}
```

## Notes
- Free tier available with limits
- BigQuery export for enterprise billing
- Vertex AI for production workloads
- Context caching reduces costs
- Grounding adds extra fees
