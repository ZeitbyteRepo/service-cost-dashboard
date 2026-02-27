# Railway MCP - Agent Log Access

This module provides all agents with access to Railway deployment logs and metrics.

## Configuration

The Railway API token is stored in OpenClaw's config at:
- `~/.openclaw/openclaw.json` → `skills.entries.railway.apiKey`

## Usage for Agents

### Query Project Logs

```typescript
import { getRailwayLogs, getRailwayDeployments, getRailwayMetrics } from '@/lib/railway-mcp';

// Get recent logs
const logs = await getRailwayLogs({ 
  projectId: 'service-cost-dashboard',
  limit: 100 
});

// Get deployment status
const deployments = await getRailwayDeployments('service-cost-dashboard');

// Get metrics
const metrics = await getRailwayMetrics('service-cost-dashboard');
```

### Available Functions

| Function | Description |
|----------|-------------|
| `getRailwayLogs(opts)` | Fetch deployment logs |
| `getRailwayDeployments(projectName)` | List deployments |
| `getRailwayMetrics(projectName)` | Get resource usage |
| `getRailwayServices(projectName)` | List services |
| `triggerDeploy(projectName)` | Trigger new deployment |

## Project ID

Service Cost Dashboard project ID: `18b06516-d432-4a39-b483-3103955073be`

## For Orchestrator

When agents report issues, they can include:
- Recent log snippets
- Deployment status
- Error patterns

This enables faster debugging without context switching.
