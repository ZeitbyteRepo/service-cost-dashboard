'use client';

import { useCallback, useEffect, useState } from 'react';
import ProviderCard from '@/components/cards/ProviderCard';
import type { ProviderData } from '@/lib/providers/types';

interface ProvidersApiResponse {
  providers: ProviderData[];
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
      <div className="panel-bg min-h-screen bg-[#07090d] px-2 py-3 text-[#f5e6b3] sm:px-3">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="animate-pulse">
            <div className="mb-2 h-6 w-64 border border-blue-500/40 bg-[#101722]" />
            <div className="mb-4 h-3 w-44 border border-yellow-500/40 bg-[#101722]" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-28 border border-blue-500/30 bg-[#0e131c] p-3" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-bg min-h-screen bg-[#07090d] px-2 py-3 text-[#f5e6b3] sm:px-3">
        <div className="mx-auto w-full max-w-[1180px]">
          <div className="border border-red-500/70 bg-[#160c0c] p-4">
            <h2 className="mb-1 text-lg font-semibold uppercase tracking-[0.16em] text-red-300">System Fault</h2>
            <p className="text-sm text-red-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 border border-red-400/80 bg-[#2a1414] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-[#381818]"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-bg min-h-screen bg-[#07090d] text-[#f5e6b3]">
      <div className="crt-layer mx-auto w-full max-w-[1180px] px-2 py-2 sm:px-3">
        <header className="mb-2 border border-blue-500/60 bg-[#0e131c] px-3 py-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/45 pb-1 text-[11px] text-blue-300">
            <span className="tracking-[0.08em]">┌─ SERVICE_COST_DASHBOARD :: /usr/local/monitor ─┐</span>
            <span className="tracking-[0.08em]">TTY0</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-yellow-300">Samuel Console // Service Cost Matrix</p>
              <h1 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#f5e6b3] sm:text-base">
                Multi-Provider Control Panel
              </h1>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-blue-200">Last Sync: {formatTimestamp(lastUpdated)}</p>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <p className="border border-blue-400/65 bg-[#111a28] px-2 py-1 uppercase tracking-[0.14em] text-blue-200">{providers.length} Providers</p>
              <button
                onClick={fetchProviders}
                disabled={isFetching}
                className="inline-flex items-center gap-1.5 border border-orange-400/80 bg-[#24190f] px-2 py-1 font-semibold uppercase tracking-[0.14em] text-orange-200 transition hover:bg-[#332214] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isFetching && <span className="h-3 w-3 animate-spin rounded-full border border-orange-200 border-t-transparent" />}
                {isFetching ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-blue-300">└────────────────────────────────────────────────────────────────────────────┘</div>
        </header>

        <main>
          {providers.length === 0 ? (
            <div className="border border-yellow-500/60 bg-[#14120d] px-4 py-6 text-center text-xs uppercase tracking-[0.16em] text-yellow-300">
              No Providers Available
            </div>
          ) : (
            <div className="provider-grid grid gap-2">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
