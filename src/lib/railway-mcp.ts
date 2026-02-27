/**
 * Railway MCP - Multi-Agent Log Access
 * 
 * Provides all agents with access to Railway deployment logs, metrics, and status.
 * Uses the Railway API token from OpenClaw config.
 */

const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';

// Get token from environment (set by orchestrator)
const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function railwayQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!RAILWAY_API_TOKEN) {
    throw new Error('RAILWAY_API_TOKEN not configured. Set it in environment.');
  }

  const response = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RAILWAY_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Railway API error: ${response.status}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL error: ${json.errors.map(e => e.message).join(', ')}`);
  }

  if (!json.data) {
    throw new Error('No data returned from Railway API');
  }

  return json.data;
}

// Project IDs (cached)
const PROJECT_CACHE: Record<string, string> = {
  'service-cost-dashboard': '18b06516-d432-4a39-b483-3103955073be',
};

export interface LogOptions {
  projectId?: string;
  projectName?: string;
  serviceId?: string;
  limit?: number;
  filter?: string;
}

export interface DeploymentInfo {
  id: string;
  status: string;
  createdAt: string;
  environment: string;
  service: { name: string };
}

export interface LogEntry {
  timestamp: string;
  message: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}

/**
 * Get recent logs for a project/service
 */
export async function getRailwayLogs(opts: LogOptions): Promise<LogEntry[]> {
  const projectId = opts.projectId || PROJECT_CACHE[opts.projectName || 'service-cost-dashboard'];
  
  if (!projectId) {
    throw new Error('Project ID or name required');
  }

  const query = `
    query($projectId: String!, $limit: Int) {
      project(id: $projectId) {
        services {
          edges {
            node {
              id
              name
              logs(limit: $limit) {
                edges {
                  node {
                    timestamp
                    message
                    severity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      project: {
        services: {
          edges: Array<{
            node: {
              id: string;
              name: string;
              logs: {
                edges: Array<{
                  node: {
                    timestamp: string;
                    message: string;
                    severity: string;
                  }
                }>
              }
            }
          }>
        }
      }
    }>(query, { projectId, limit: opts.limit || 100 });

    const logs: LogEntry[] = [];
    
    for (const edge of data.project.services.edges) {
      const service = edge.node;
      if (opts.serviceId && service.id !== opts.serviceId) continue;
      
      for (const logEdge of service.logs.edges) {
        logs.push({
          timestamp: logEdge.node.timestamp,
          message: logEdge.node.message,
          severity: logEdge.node.severity as LogEntry['severity'],
        });
      }
    }

    // Filter if requested
    if (opts.filter) {
      const filterLower = opts.filter.toLowerCase();
      return logs.filter(l => l.message.toLowerCase().includes(filterLower));
    }

    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    // Return mock data if API doesn't support this query
    console.warn('Railway logs API not available, returning empty array');
    return [];
  }
}

/**
 * Get recent deployments for a project
 */
export async function getRailwayDeployments(projectName: string): Promise<DeploymentInfo[]> {
  const projectId = PROJECT_CACHE[projectName] || projectName;

  const query = `
    query($projectId: String!) {
      project(id: $projectId) {
        deployments {
          edges {
            node {
              id
              status
              createdAt
              environment
              service {
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      project: {
        deployments: {
          edges: Array<{
            node: DeploymentInfo
          }>
        }
      }
    }>(query, { projectId });

    return data.project.deployments.edges.map(e => e.node);
  } catch (error) {
    console.warn('Railway deployments API not available');
    return [];
  }
}

/**
 * Get resource metrics for a project
 */
export async function getRailwayMetrics(projectName: string) {
  const projectId = PROJECT_CACHE[projectName] || projectName;

  const query = `
    query($projectId: String!) {
      project(id: $projectId) {
        services {
          edges {
            node {
              id
              name
              metrics {
                cpu
                memory
                networkEgress
                diskUsage
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await railwayQuery<any>(query, { projectId });
    return data.project.services.edges.map((e: any) => ({
      serviceId: e.node.id,
      serviceName: e.node.name,
      metrics: e.node.metrics,
    }));
  } catch (error) {
    console.warn('Railway metrics API not available');
    return [];
  }
}

/**
 * List all Railway projects
 */
export async function listRailwayProjects(): Promise<Array<{ id: string; name: string }>> {
  const query = `
    query {
      projects {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;

  const data = await railwayQuery<{
    projects: {
      edges: Array<{
        node: { id: string; name: string }
      }>
    }
  }>(query);

  return data.projects.edges.map(e => e.node);
}

/**
 * Get services for a project
 */
export async function getRailwayServices(projectName: string): Promise<Array<{ id: string; name: string; status: string }>> {
  const projectId = PROJECT_CACHE[projectName] || projectName;

  const query = `
    query($projectId: String!) {
      project(id: $projectId) {
        services {
          edges {
            node {
              id
              name
              status
            }
          }
        }
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      project: {
        services: {
          edges: Array<{
            node: { id: string; name: string; status: string }
          }>
        }
      }
    }>(query, { projectId });

    return data.project.services.edges.map(e => e.node);
  } catch (error) {
    console.warn('Railway services API not available');
    return [];
  }
}

/**
 * Trigger a new deployment
 */
export async function triggerDeploy(projectName: string, serviceName?: string): Promise<{ success: boolean; deploymentId?: string }> {
  const projectId = PROJECT_CACHE[projectName] || projectName;

  const query = `
    mutation($projectId: String!, $serviceId: String) {
      deploymentTrigger(projectId: $projectId, serviceId: $serviceId) {
        id
        status
      }
    }
  `;

  try {
    const data = await railwayQuery<{
      deploymentTrigger: { id: string; status: string }
    }>(query, { projectId, serviceId: serviceName });

    return {
      success: true,
      deploymentId: data.deploymentTrigger.id,
    };
  } catch (error) {
    return {
      success: false,
    };
  }
}

/**
 * Get project info by name
 */
export async function getProjectInfo(projectName: string) {
  const projects = await listRailwayProjects();
  const project = projects.find(p => p.name.toLowerCase() === projectName.toLowerCase());
  
  if (!project) {
    throw new Error(`Project "${projectName}" not found`);
  }

  // Cache it
  PROJECT_CACHE[projectName] = project.id;

  const [services, deployments] = await Promise.all([
    getRailwayServices(projectName),
    getRailwayDeployments(projectName),
  ]);

  return {
    id: project.id,
    name: project.name,
    services,
    recentDeployments: deployments.slice(0, 10),
  };
}
