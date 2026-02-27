import { getProjects, type RailwayProject } from './railway';

export interface MonthlyUsage {
  credits: number;
  cpu: number;
  memory: number;
  networkEgress: number;
  diskUsage: number;
  buildMinutes: number;
}

export interface BillingSummary {
  currentMonth: {
    credits: number;
    usage: MonthlyUsage;
    projectedCost: number;
  };
  lastMonth: {
    credits: number;
    usage: MonthlyUsage | null;
  };
  previousMonth: {
    credits: number;
    usage: MonthlyUsage | null;
  };
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
    change: number;
  };
  subscription: {
    plan: string | null;
    status: string | null;
  } | null;
}

export interface UsageMetrics {
  cpu: number;
  memory: number;
  networkEgress: number;
  diskUsage: number;
  buildMinutes: number;
  totalCredits: number;
}

// Railway credit to USD conversion
const CREDIT_TO_USD = 0.01;

// Simulated usage data (would come from Railway in production)
function generateUsageMetrics(): MonthlyUsage {
  return {
    credits: 2450 + Math.random() * 500,
    cpu: 85.2 + Math.random() * 20,
    memory: 412 + Math.random() * 100,
    networkEgress: 12.5 + Math.random() * 5,
    diskUsage: 8.3 + Math.random() * 3,
    buildMinutes: 142 + Math.random() * 50,
  };
}

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const projects = await getProjects();
  
  // Generate realistic billing data based on project count
  const baseCredits = projects.length * 500 + 500;
  const currentCredits = baseCredits + Math.random() * 200;
  
  // Historical data simulation
  const lastMonthCredits = currentCredits * (0.85 + Math.random() * 0.15);
  const previousMonthCredits = lastMonthCredits * (0.9 + Math.random() * 0.1);
  
  const change = currentCredits - lastMonthCredits;
  const percentage = lastMonthCredits > 0 ? (change / lastMonthCredits) * 100 : 0;
  
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(percentage) > 5) {
    direction = percentage > 0 ? 'increasing' : 'decreasing';
  }

  return {
    currentMonth: {
      credits: Math.round(currentCredits * 100) / 100,
      usage: generateUsageMetrics(),
      projectedCost: Math.round(currentCredits * CREDIT_TO_USD * 100) / 100,
    },
    lastMonth: {
      credits: Math.round(lastMonthCredits * 100) / 100,
      usage: null,
    },
    previousMonth: {
      credits: Math.round(previousMonthCredits * 100) / 100,
      usage: null,
    },
    trend: {
      direction,
      percentage: Math.round(percentage * 10) / 10,
      change: Math.round(change * 100) / 100,
    },
    subscription: {
      plan: 'Hobby',
      status: 'active',
    },
  };
}

export async function fetchUsageMetrics(): Promise<UsageMetrics> {
  const billing = await fetchBillingSummary();
  const usage = billing.currentMonth.usage;
  
  return {
    cpu: usage.cpu,
    memory: usage.memory,
    networkEgress: usage.networkEgress,
    diskUsage: usage.diskUsage,
    buildMinutes: usage.buildMinutes,
    totalCredits: billing.currentMonth.credits,
  };
}

export async function fetchDashboardData() {
  const [projects, billing, metrics] = await Promise.all([
    getProjects(),
    fetchBillingSummary(),
    fetchUsageMetrics(),
  ]);

  return {
    user: {
      name: 'Railway User',
      email: 'user@example.com',
    },
    projects,
    billing,
    metrics,
    timestamp: new Date().toISOString(),
  };
}
