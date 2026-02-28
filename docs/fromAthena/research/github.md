# GitHub API Research

## Key Status
- Env var: `GITHUB_TOKEN` (Personal Access Token or GitHub App)
- Permissions: Varies by token scopes
- Tested: Working key

## Available Endpoints

Base URL: `https://api.github.com`

### Usage & Billing Endpoints
- `GET /orgs/{org}/settings/billing/actions` - Actions minutes usage
- `GET /orgs/{org}/settings/billing/packages` - Packages storage
- `GET /orgs/{org}/settings/billing/shared-storage` - Shared storage
- `GET /orgs/{org}/settings/billing/advanced-security` - GHAS usage

### Core API Endpoints
- `GET /user` - Current user info
- `GET /user/repos` - List repositories
- `GET /orgs/{org}` - Organization info
- `GET /orgs/{org}/repos` - Org repositories

### Actions Endpoints
- `GET /repos/{owner}/{repo}/actions/runs` - Workflow runs
- `GET /repos/{owner}/{repo}/actions/workflows` - Workflows
- `GET /repos/{owner}/{repo}/actions/jobs` - Jobs

### Packages Endpoints
- `GET /user/packages` - User packages
- `GET /orgs/{org}/packages` - Org packages

## Cost Drivers

1. **Actions Minutes** - CI/CD compute time
2. **Storage** - Packages, artifacts, releases
3. **Advanced Security** - GHAS committers
4. **Copilot** - Copilot seats
5. **Codespaces** - Development environments

### Pricing Model
| Feature | Free | Team | Enterprise |
|---------|------|------|------------|
| Actions minutes | 2,000/mo | 3,000/mo | 50,000/mo |
| Storage | 500MB | 2GB | 50GB |
| GHAS | - | - | $21/user/mo |

### Actions Pricing (overage)
- Linux: $0.008/minute
- Windows: $0.016/minute
- macOS: $0.08/minute

### GitHub Copilot
- Individual: $10/month
- Business: $19/month
- Enterprise: $39/month

## Card Proposal (Dashboard)

### Primary Metric
- **Actions Minutes Used** - This month's usage

### Secondary Metrics
- **Storage Used** - GB stored
- **Workflow Runs** - Count this month
- **Active Repos** - Repository count
- **GHAS Committers** - Security seats

### Uptime Indicator
- Yes - Status page at `https://www.githubstatus.com`
- API: `GET /meta` for service status

## Sub-Page Proposal (Detail View)

### Section 1: Actions Overview
- Minutes used by OS type
- Workflow run history
- Most active workflows
- Runner usage

### Section 2: Storage Breakdown
- Artifacts storage
- Packages storage
- Releases storage
- LFS storage

### Section 3: Repository Metrics
- Repository list with stats
- Commit activity
- Issue/PR counts
- Code frequency

### Section 4: Security
- GHAS usage
- Code scanning alerts
- Secret scanning results
- Dependabot alerts

### Section 5: Copilot Usage
- Active seats
- Suggestions accepted rate
- Usage by language

### Object Lists
- Repositories (all repos)
- Workflows (CI/CD)
- Workflow Runs (execution history)
- Packages (published packages)
- Releases (version releases)
- Issues (all issues)
- Pull Requests (all PRs)

## Sample API Response

```json
GET /orgs/{org}/settings/billing/actions

{
  "total_minutes_used": 12345,
  "total_paid_minutes_used": 0,
  "included_minutes": 3000,
  "minutes_used_breakdown": {
    "UBUNTU": 10000,
    "MACOS": 500,
    "WINDOWS": 1845
  }
}
```

```json
GET /repos/{owner}/{repo}/actions/runs

{
  "total_count": 150,
  "workflow_runs": [
    {
      "id": 12345,
      "name": "CI",
      "status": "completed",
      "conclusion": "success",
      "created_at": "2026-02-15T10:00:00Z",
      "run_started_at": "2026-02-15T10:00:00Z",
      "run_attempt": 1
    }
  ]
}
```

## Notes
- Rate limit: 5,000 requests/hour (authenticated)
- ETags for caching
- GraphQL API also available
- Fine-grained PATs for granular access
