'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';

interface DashboardData {
  user: { name: string; email: string };
  projects: Array<{ id: string; name: string }>;
  billing: {
    currentMonth: { credits: number; projectedCost: number };
    lastMonth: { credits: number };
    previousMonth: { credits: number };
    trend: { direction: string; percentage: number; change: number };
    subscription: { plan: string | null; status: string | null } | null;
  };
  metrics: {
    cpu: number;
    memory: number;
    networkEgress: number;
    diskUsage: number;
    buildMinutes: number;
  };
  timestamp: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/billing');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          throw new Error(json.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { billing, metrics, projects, user } = data;

  // Prepare chart data
  const spendTrendData = [
    { month: 'Previous', credits: billing.previousMonth.credits, projected: billing.previousMonth.credits * 0.01 },
    { month: 'Last', credits: billing.lastMonth.credits, projected: billing.lastMonth.credits * 0.01 },
    { month: 'Current', credits: billing.currentMonth.credits, projected: billing.currentMonth.projectedCost },
  ];

  const usageData = [
    { name: 'CPU', value: metrics.cpu, color: '#3b82f6', unit: '%' },
    { name: 'Memory', value: metrics.memory, color: '#a855f7', unit: 'MB' },
    { name: 'Network', value: metrics.networkEgress, color: '#22c55e', unit: 'GB' },
    { name: 'Disk', value: metrics.diskUsage, color: '#f59e0b', unit: 'GB' },
    { name: 'Build', value: metrics.buildMinutes, color: '#ec4899', unit: 'min' },
  ];

  // Projection chart data (simulated daily trajectory)
  const projectionData = [];
  const dailyAvg = billing.currentMonth.credits / 15; // Assume mid-month
  for (let i = 1; i <= 30; i++) {
    const actual = i <= 15 ? dailyAvg * i : null;
    const projected = dailyAvg * i;
    projectionData.push({
      day: i,
      actual: actual,
      projected: projected,
    });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold">Railway Cost Dashboard</h1>
              <p className="text-gray-400 text-sm">{projects.length} projects · {billing.subscription?.plan || 'Free'} plan</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Bill */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Current Bill</p>
            <p className="text-3xl font-bold text-white">
              ${billing.currentMonth.projectedCost.toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {billing.currentMonth.credits.toFixed(0)} credits
            </p>
          </div>

          {/* Last Month */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Last Month</p>
            <p className="text-3xl font-bold text-white">
              ${(billing.lastMonth.credits * 0.01).toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {billing.lastMonth.credits.toFixed(0)} credits
            </p>
          </div>

          {/* Trend */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Trend</p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-bold ${
                billing.trend.direction === 'increasing' ? 'text-red-400' :
                billing.trend.direction === 'decreasing' ? 'text-green-400' : 'text-gray-400'
              }`}>
                {billing.trend.direction === 'increasing' ? '↑' :
                 billing.trend.direction === 'decreasing' ? '↓' : '→'}
              </p>
              <p className="text-xl font-semibold">
                {Math.abs(billing.trend.percentage).toFixed(1)}%
              </p>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              {billing.trend.direction === 'stable' ? 'Stable' :
               billing.trend.direction === 'increasing' ? 'Higher than last month' : 'Lower than last month'}
            </p>
          </div>

          {/* Projected Cost */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Projected (End of Month)</p>
            <p className="text-3xl font-bold text-amber-400">
              ${(billing.currentMonth.projectedCost * 1.15).toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Est. based on usage
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spend Trend Chart */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Spend Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Credits"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-gray-500 text-sm mt-2 text-center">Credits used over 3 months</p>
          </div>

          {/* Usage Breakdown Chart */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Usage Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-gray-500 text-sm mt-2 text-center">Resource consumption by type</p>
          </div>
        </div>

        {/* Monthly Projection Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Projection</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  name="Projected"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.4}
                  name="Actual"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-gray-500 text-sm mt-2 text-center">Daily credit usage trajectory (actual vs projected)</p>
        </div>

        {/* Usage Section */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Resource Usage</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* CPU */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">CPU</p>
              <p className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${Math.min(metrics.cpu, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Memory */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Memory</p>
              <p className="text-2xl font-bold">{metrics.memory.toFixed(0)} MB</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(metrics.memory / 10, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Network */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Network Egress</p>
              <p className="text-2xl font-bold">{metrics.networkEgress.toFixed(1)} GB</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(metrics.networkEgress * 5, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Disk */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Disk Usage</p>
              <p className="text-2xl font-bold">{metrics.diskUsage.toFixed(1)} GB</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min(metrics.diskUsage * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Build Minutes */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Build Minutes</p>
              <p className="text-2xl font-bold">{metrics.buildMinutes.toFixed(0)}</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${Math.min(metrics.buildMinutes / 3, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Projects ({projects.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <div key={project.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="font-medium">{project.name}</p>
                <p className="text-gray-500 text-sm truncate">{project.id}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-sm text-center mt-8">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </p>
      </main>
    </div>
  );
}
