# Railway API Research

## Key Status
- Env var: `RAILWAY_TOKEN` (likely workspace or project token)
- Permissions: Full GraphQL API access based on token type
- Tested: Working (already integrated in dashboard)

## Available Endpoints

Railway uses a **GraphQL API** at `https://backboard.railway.app/graphql/v2`

### Key Query Types
- `me` - Current user info
- `workspace` - Workspace details
- `project` - Project details, services, environments
- `service` - Service metrics, deployments, logs
- `deployment` - Deployment status, logs
- `usage` - Resource usage data

### Management Endpoints
- `projects` - List all projects
- `services` - List services in project
- `environments` - List environments
- `deployments` - List deployments
- `variables` - Environment variables
- `domains` - Custom domains
- `volumes` - Storage volumes

## Cost Drivers

1. **Compute Usage** - CPU time, measured in vCPU-hours
2. **Memory Usage** - RAM allocation and usage duration
3. **Storage** - Database size and volume storage (GB)
4. **Bandwidth** - Outbound network transfer
5. **Executions** - Function invocations (serverless)

### Pricing Model
- Usage-based billing
- Per-project resource limits
- Hobby: $5/month base, then usage
- Pro: $20/month base, then usage

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Spend** - Current billing cycle total

### Secondary Metrics
- **CPU Usage** - vCPU-hours this month
- **Memory Usage** - GB-hours this month
- **Storage Used** - Current GB stored
- **Bandwidth** - Outbound GB this month

### Uptime Indicator
- Yes - Deployment health status from `deployment` queries
- Status page: `https://status.railway.app`

## Sub-Page Proposal (Detail View)

### Section 1: Projects Overview
- List all projects with costs
- Resource allocation per project
- Active environments

### Section 2: Services Breakdown
- Per-service CPU/memory usage
- Deployment frequency
- Error rates from logs

### Section 3: Database & Storage
- Database sizes
- Volume usage
- Backup status

### Section 4: Cost Trends
- Daily/weekly spend chart
- Projected monthly cost
- Cost by resource type

### Object Lists
- Projects (enumerate all)
- Services (per project)
- Deployments (per service)
- Environments (per project)
- Volumes (per project)
- Domains (per project)

## Sample API Response

```graphql
query GetProjectUsage {
  project(id: "18b06516-d432-4a39-b483-3103955073be") {
    name
    services {
      edges {
        node {
          name
          usage {
            cpu
            memory
            network
          }
        }
      }
    }
  }
}
```

## Notes
- Rate limits: 100-10,000 RPH based on plan
- GraphQL introspection available
- GraphiQL playground at railway.com/graphiql
