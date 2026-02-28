# Supabase API Research

## Key Status
- Env var: Not configured (per brief)
- Permissions: Need to configure key
- Tested: No key - explore docs only

## Available Endpoints

### Management API
Base URL: `https://api.supabase.com/v1`

- `GET /projects` - List all projects
- `GET /projects/{id}` - Get project details
- `GET /projects/{id}/usage` - Project usage stats
- `GET /projects/{id}/billing/usage` - Billing usage

### PostgREST API (Per Project)
Base URL: `https://{project}.supabase.co/rest/v1`

- `GET /` - API root
- `GET /{table}` - Query table
- `POST /{table}` - Insert rows
- `PATCH /{table}` - Update rows
- `DELETE /{table}` - Delete rows

### Auth API
- `POST /auth/v1/signup` - Sign up
- `POST /auth/v1/token` - Get token
- `GET /auth/v1/user` - Get user

### Storage API
- `GET /storage/v1/bucket` - List buckets
- `POST /storage/v1/object` - Upload file

## Cost Drivers

1. **Database Size** - PostgreSQL storage (GB)
2. **Compute** - CPU/RAM allocation
3. **Bandwidth** - Data transfer out
4. **Storage** - File storage buckets
5. **Edge Functions** - Function invocations
6. **Auth Users** - Monthly active users

### Pricing Model
| Plan | Price | Compute | Database | Storage |
|------|-------|---------|----------|---------|
| Free | $0 | Shared | 500MB | 1GB |
| Pro | $25/mo | 2GB RAM | 8GB | 100GB |
| Team | $599/mo | 4GB RAM | 8GB | 100GB |

### Overage Pricing
- Database: $0.125/GB
- Storage: $0.021/GB
- Bandwidth: $0.09/GB
- MAUs: $0.00325/MAU over 50k

### Compute Add-ons
- Small: $10/mo (2GB RAM)
- Medium: $40/mo (4GB RAM)
- Large: $110/mo (8GB RAM)
- XL: $210/mo (16GB RAM)

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Cost** - Total spend

### Secondary Metrics
- **Database Size** - GB used
- **Storage Used** - File storage
- **Bandwidth** - Transfer this month
- **MAUs** - Monthly active users

### Uptime Indicator
- Yes - Status page at `https://status.supabase.com`
- Health check via API

## Sub-Page Proposal (Detail View)

### Section 1: Project Overview
- List all projects
- Per-project costs
- Resource allocation

### Section 2: Database Metrics
- Database size per project
- Connection count
- Query performance
- Index usage

### Section 3: Storage & Bandwidth
- Bucket usage
- File count
- Bandwidth by project
- CDN metrics

### Section 4: Auth & Functions
- User count
- MAU trend
- Function invocations
- Edge function errors

### Section 5: Backups
- Backup status
- Retention period
- Point-in-time recovery

### Object Lists
- Projects (all projects)
- Tables (per project)
- Buckets (storage)
- Functions (edge functions)
- Users (auth)
- Branches (branching)

## Sample API Response

```json
GET /v1/projects

{
  "data": [
    {
      "id": "abc123",
      "name": "my-project",
      "status": "ACTIVE_HEALTHY",
      "database": {
        "type": "postgres",
        "host": "db.abc123.supabase.co"
      },
      "subscription_id": "sub_123"
    }
  ]
}
```

```json
GET /v1/projects/{id}/usage

{
  "database_size": {
    "usage": 2.5,
    "limit": 8,
    "unit": "GB"
  },
  "storage_size": {
    "usage": 10.2,
    "limit": 100,
    "unit": "GB"
  },
  "bandwidth": {
    "usage": 50,
    "unit": "GB"
  }
}
```

## Notes
- Management API needs service role key
- PostgREST for database queries
- Real-time subscriptions available
- Row Level Security supported
- No key currently configured
