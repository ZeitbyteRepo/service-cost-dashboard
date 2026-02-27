'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProviderData } from '@/lib/providers/types';

interface ProvidersApiResponse {
  providers: ProviderData[];
}

const healthStyles: Record<ProviderData['health']['status'], { dot: string; text: string; label: string }> = {
  healthy: { dot: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]', text: 'text-cyan-200', label: 'Healthy' },
  degraded: {
    dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
    text: 'text-amber-200',
    label: 'Degraded',
  },
  error: { dot: 'bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.85)]', text: 'text-fuchsia-200', label: 'Error' },
  unknown: { dot: 'bg-slate-400 shadow-[0_0_10px_rgba(148,163,184,0.6)]', text: 'text-slate-200', label: 'Unknown' },
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

function formatTimestamp(timestamp: Date | null) {
  if (!timestamp) return 'Never';
  return timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
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
      <div className="panel-bg min-h-screen px-2 py-3 text-slate-100 sm:px-3">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="animate-pulse">
            <div className="mb-2 h-6 w-56 rounded bg-cyan-200/30" />
            <div className="mb-4 h-3 w-44 rounded bg-cyan-200/20" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-28 rounded-sm border border-cyan-500/20 bg-slate-900/50 p-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-bg min-h-screen px-2 py-3 text-slate-100 sm:px-3">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="rounded-sm border border-fuchsia-400/60 bg-[#190e1e]/80 p-4 shadow-[0_0_26px_rgba(217,70,239,0.18)]">
            <h2 className="mb-1 text-lg font-semibold uppercase tracking-[0.16em] text-fuchsia-300">System Fault</h2>
            <p className="text-sm text-fuchsia-100">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-sm border border-fuchsia-400/80 bg-fuchsia-400/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:bg-fuchsia-400/25"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-bg min-h-screen text-slate-100">
      <div className="crt-layer mx-auto w-full max-w-[1180px] px-2 py-2 sm:px-3">
        <header className="relative mb-2 overflow-hidden rounded-sm border border-cyan-500/45 bg-[#0c1222]/90 px-3 py-2 shadow-[0_0_28px_rgba(34,211,238,0.17)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(34,211,238,0.14),transparent_44%),radial-gradient(circle_at_85%_78%,rgba(251,191,36,0.13),transparent_42%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/85">Samuel Console // Service Cost Matrix</p>
              <h1 className="text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100 sm:text-base">
                Multi-Provider Control Panel
              </h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-200/65">
                Last Sync: {formatTimestamp(lastUpdated)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <p className="rounded-sm border border-cyan-500/50 bg-cyan-500/10 px-2 py-1 uppercase tracking-[0.14em] text-cyan-200">
                {providers.length} Providers
              </p>
              <button
                onClick={fetchProviders}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 rounded-sm border border-amber-400/80 bg-amber-400/15 px-2 py-1 font-semibold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isFetching && (
                  <span className="h-3 w-3 animate-spin rounded-full border border-amber-100/80 border-t-transparent" />
                )}
                {isFetching ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        <main>
          {providers.length === 0 ? (
            <div className="rounded-sm border border-cyan-500/40 bg-[#0b1324]/80 px-4 py-6 text-center text-xs uppercase tracking-[0.16em] text-cyan-200/80">
              No Providers Available
            </div>
          ) : (
            <div className="provider-grid grid gap-2">
              {providers.map((provider) => {
                const health = healthStyles[provider.health.status];
                const costDisplay = provider.costs
                  ? formatCurrency(provider.costs.currentMonth, provider.costs.currency)
                  : 'N/A';
                const usagePercent = provider.usage ? Math.max(0, Math.min(100, provider.usage.percentage)) : null;

                return (
                  <article
                    key={provider.id}
                    className="group relative overflow-hidden rounded-sm border border-cyan-500/35 bg-[#08101f]/90 px-2.5 py-2 shadow-[inset_0_0_18px_rgba(13,110,121,0.2)] transition hover:border-cyan-300/75 hover:shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-fuchsia-400/55 opacity-45 transition group-hover:opacity-80" />
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-cyan-50">
                          {provider.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          <span className="rounded-sm border border-cyan-400/50 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cyan-100">
                            {toCategoryLabel(provider.category)}
                          </span>
                          {!provider.hasBillingApi && (
                            <span className="rounded-sm border border-amber-400/70 bg-amber-400/15 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-amber-200">
                              (est.)
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${health.text}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${health.dot}`} />
                        {health.label}
                      </div>
                    </div>

                    <div className="mb-1.5 grid grid-cols-[auto_1fr] items-end gap-x-2 gap-y-0.5">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-cyan-200/70">Month Cost</p>
                      <p className="text-right text-base font-semibold leading-none text-cyan-100">{costDisplay}</p>
                    </div>

                    {provider.usage && usagePercent !== null && (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.1em] text-slate-300/75">
                          <span className="truncate pr-2">
                            {provider.usage.current} {provider.usage.unit}
                            {provider.usage.limit ? ` / ${provider.usage.limit} ${provider.usage.unit}` : ''}
                          </span>
                          <span className="text-cyan-200">{usagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-[2px] border border-cyan-700/60 bg-[#111f39] p-[1px]">
                          <div
                            className="h-full rounded-[1px] bg-gradient-to-r from-cyan-400 via-cyan-300 to-amber-300 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all"
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
    </div>
  );
}
