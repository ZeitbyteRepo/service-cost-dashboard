# HuggingFace API Research

## Key Status
- Env var: `HF_TOKEN` (likely)
- Permissions: Hub API access (brief says dashboard only)
- Tested: Check for API access

## Available Endpoints

### Hub API
Base URL: `https://huggingface.co/api`

OpenAPI spec at: `https://huggingface.co/.well-known/openapi.json`

### Core Endpoints
- `GET /models` - List models
- `GET /models/{model_id}` - Get model info
- `GET /datasets` - List datasets
- `GET /datasets/{dataset_id}` - Get dataset info
- `GET /spaces` - List Spaces
- `GET /users/{username}` - User info

### Inference API
Base URL: `https://api-inference.huggingface.co/models/{model_id}`

- `POST /models/{model_id}` - Run inference
- `GET /status/{model_id}` - Model loading status

### Repository Endpoints
- `GET /{repo_type}/{repo_id}` - Repo info
- `GET /{repo_type}/{repo_id}/commits/main` - Commit info
- `GET /{repo_type}/{repo_id}/tree/main` - File tree

## Cost Drivers

1. **Inference Calls** - API requests to models
2. **Compute** - Spaces and Endpoints
3. **Storage** - Model/dataset storage
4. **Bandwidth** - Downloads
5. **PRO Plan** - Enhanced features

### Pricing Model

#### Free Tier
- Limited inference API
- Public Spaces
- Basic storage

#### PRO Plan ($9/month)
- Higher rate limits
- Private Spaces
- Priority inference
- ZeroGPU access

#### Enterprise
- Dedicated endpoints
- Custom compute
- SLA guarantees
- Volume discounts

### Inference Endpoints (Dedicated)
- GPU instances: $0.60-$4.50/hour
- CPU instances: $0.05-$0.40/hour

### Spaces GPU
- ZeroGPU: Free (PRO required for priority)
- Dedicated GPU: $0.60-$4.50/hour

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly API Calls** - Inference requests

### Secondary Metrics
- **Models Used** - Count of models accessed
- **Storage Used** - GB stored
- **Bandwidth** - Downloads
- **Spaces Active** - Running spaces

### Uptime Indicator
- No dedicated status API
- Monitor via API response

## Sub-Page Proposal (Detail View)

### Section 1: Inference Usage
- API call count
- By model breakdown
- Error rates
- Latency metrics

### Section 2: Models & Datasets
- Published models
- Published datasets
- Download counts
- Stars/likes

### Section 3: Spaces
- Active Spaces
- Compute usage
- Memory usage
- GPU hours

### Section 4: Storage
- Repository sizes
- LFS storage
- Bandwidth usage

### Section 5: Organization
- Team members
- API tokens
- Access tokens

### Object Lists
- Models (all accessible)
- Datasets (all accessible)
- Spaces (all running)
- Repositories (owned)
- API Tokens (management)
- Organizations (membership)

## Sample API Response

```json
GET /api/models

[
  {
    "modelId": "meta-llama/Llama-2-7b-hf",
    "author": "meta-llama",
    "sha": "abc123",
    "lastModified": "2024-01-15T10:00:00Z",
    "private": false,
    "downloads": 1000000,
    "likes": 500,
    "tags": ["transformers", "pytorch", "llama"]
  }
]
```

```json
POST /models/{model_id}

Headers:
Authorization: Bearer {HF_TOKEN}

Response: [inference result]
```

## Notes
- OpenAPI spec available
- Rate limits apply (see rate-limits docs)
- huggingface_hub Python library
- huggingface.js JavaScript library
- Hub API is comprehensive
