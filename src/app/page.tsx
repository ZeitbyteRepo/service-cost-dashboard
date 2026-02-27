'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProviderData } from '@/lib/providers/types';

interface ProvidersApiResponse {
  providers: ProviderData[];
}

const healthStyles: Record<ProviderData['health']['status'], { dot: string; label: string }> = {
  healthy: { dot: 'bg-green-500', label: 'Healthy' },
  degraded: { dot: 'bg-yellow-500', label: 'Degraded' },
  error: { dot: 'bg-red-500', label: 'Error' },
  unknown: { dot: 'bg-gray-400', label: 'Unknown' },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toCategoryLabel(category: ProviderData['category']) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function Page() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProviders = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const res = await fetch('/api/providers');
      if (!res.ok) throw new Error('Failed to fetch providers');

      const json = (await res.json()) as ProvidersApiResponse;
      setProviders(Array.isArray(json.providers) ? json.providers : []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
    const intervalId = window.setInterval(fetchProviders, 900000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchProviders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="mb-2 h-8 w-80 rounded bg-slate-200" />
            <div className="mb-8 h-4 w-56 rounded bg-slate-200" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 rounded-xl border border-slate-200 bg-white p-6" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-700">Error Loading Providers</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Multi-Provider Cost Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">Current month spend and health across integrated providers</p>
            <p className="mt-1 text-xs text-slate-500">
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-500">{providers.length} providers</p>
            <button
              onClick={fetchProviders}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isFetching && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              )}
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {providers.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            No providers available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => {
              const health = healthStyles[provider.health.status];
              const costDisplay = provider.costs
                ? formatCurrency(provider.costs.currentMonth, provider.costs.currency)
                : 'N/A';
              const usagePercent = provider.usage ? Math.max(0, Math.min(100, provider.usage.percentage)) : null;

              return (
                <article
                  key={provider.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{provider.name}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {toCategoryLabel(provider.category)}
                        </span>
                        {!provider.hasBillingApi && (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                            (est.)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${health.dot}`} />
                      {health.label}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-500">Current month cost</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{costDisplay}</p>
                  </div>

                  {provider.usage && usagePercent !== null && (
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Usage ({provider.usage.current} {provider.usage.unit}
                          {provider.usage.limit ? ` / ${provider.usage.limit} ${provider.usage.unit}` : ''})
                        </span>
                        <span>{usagePercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-slate-700 transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
