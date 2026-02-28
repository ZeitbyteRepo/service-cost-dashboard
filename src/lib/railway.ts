const RAILWAY_API_URL = 'https://backboard.railway.app/graphql/v2';
const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function graphqlQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!RAILWAY_API_TOKEN) {
    throw new Error('Missing RAILWAY_API_TOKEN environment variable');
  }

  const response = await fetch(RAILWAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RAILWAY_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Railway API error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new Error(`GraphQL error: ${json.errors.map((e) => e.message).join(', ')}`);
  }

  if (!json.data) {
    throw new Error('No data returned from Railway API');
  }

  return json.data;
}

const PROJECTS_QUERY = `
  query {
    projects {
      edges {
        node {
          id
          name
          description
          createdAt
          updatedAt
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const ESTIMATED_USAGE_QUERY = `
  query {
    estimatedUsage {
      estimatedUsage
      projectedCost
    }
  }
`;

const PROJECT_SERVICE_METRICS_QUERY = `
  query($projectId: String!) {
    project(id: $projectId) {
      id
      name
      services {
        edges {
          node {
            id
            name
            status
            metrics {
              cpu
              memory
              networkEgress
            }
          }
        }
      }
    }
  }
`;

export interface RailwayProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  services: { edges: Array<{ node: { id: string; name: string } }> };
}

export interface RailwayServiceMetric {
  id: string;
  name: string;
  status?: string;
  metrics: {
    cpu?: number | null;
    memory?: number | null;
    networkEgress?: number | null;
  } | null;
}

export interface RailwayProjectWithMetrics {
  id: string;
  name: string;
  services: RailwayServiceMetric[];
}

export async function getProjects(): Promise<RailwayProject[]> {
  const data = await graphqlQuery<{ projects: { edges: Array<{ node: RailwayProject }> } }>(PROJECTS_QUERY);
  return data.projects.edges.map((e) => e.node);
}

export async function getEstimatedUsage() {
  try {
    const data = await graphqlQuery<{ estimatedUsage: { estimatedUsage: number; projectedCost: number } }>(
      ESTIMATED_USAGE_QUERY,
    );
    return data.estimatedUsage;
  } catch {
    return {
      estimatedUsage: 0,
      projectedCost: 0,
    };
  }
}

export async function getProjectServiceMetrics(projectId: string): Promise<RailwayProjectWithMetrics | null> {
  try {
    const data = await graphqlQuery<{
      project: {
        id: string;
        name: string;
        services: {
          edges: Array<{
            node: {
              id: string;
              name: string;
              status?: string;
              metrics?: {
                cpu?: number | null;
                memory?: number | null;
                networkEgress?: number | null;
              } | null;
            };
          }>;
        };
      };
    }>(PROJECT_SERVICE_METRICS_QUERY, { projectId });

    return {
      id: data.project.id,
      name: data.project.name,
      services: data.project.services.edges.map((edge) => ({
        id: edge.node.id,
        name: edge.node.name,
        status: edge.node.status,
        metrics: edge.node.metrics ?? null,
      })),
    };
  } catch {
    return null;
  }
}

export async function getAllRailwayData() {
  const projects = await getProjects();
  const estimatedUsage = await getEstimatedUsage();
  const projectMetrics = await Promise.all(projects.map((project) => getProjectServiceMetrics(project.id)));

  return {
    projects,
    projectMetrics: projectMetrics.filter((entry): entry is RailwayProjectWithMetrics => Boolean(entry)),
    estimatedUsage,
    projectCount: projects.length,
    fetchedAt: new Date().toISOString(),
  };
}