'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import ProviderCard from '@/components/cards/ProviderCard';
import { useFlexMode } from '@/hooks/useFlexMode';
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

function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toTitle(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Page() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const { isFlexMode, isCover, isFolded, isUnfolded, width } = useFlexMode();
  const isNarrowLayout = width > 0 && width < 640;

  const selectedProvider = useMemo(() => {
    if (providers.length === 0) {
      return null;
    }

    const selected = providers.find((provider) => provider.id === selectedProviderId);
    return selected ?? providers[0];
  }, [providers, selectedProviderId]);

  const cycleSelection = useCallback((delta: number) => {
    if (providers.length === 0) {
      return;
    }

    setSelectedProviderId((currentId) => {
      const currentIndex = providers.findIndex((provider) => provider.id === currentId);
      const safeIndex = currentIndex >= 0 ? currentIndex : 0;
      const nextIndex = (safeIndex + delta + providers.length) % providers.length;
      return providers[nextIndex].id;
    });
  }, [providers]);

  const fetchProviders = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const res = await fetch('/api/providers');
      if (!res.ok) throw new Error('Failed to fetch providers');

      const json = (await res.json()) as ProvidersApiResponse;
      const nextProviders = Array.isArray(json.providers) ? json.providers : [];
      setProviders(nextProviders);
      setSelectedProviderId((currentId) => {
        if (nextProviders.length === 0) {
          return null;
        }
        if (currentId && nextProviders.some((provider) => provider.id === currentId)) {
          return currentId;
        }
        return nextProviders[0].id;
      });
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

  const handleTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    if (!isNarrowLayout || isFlexMode) {
      return;
    }

    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, [isNarrowLayout, isFlexMode]);

  const handleTouchEnd = useCallback((event: TouchEvent<HTMLElement>) => {
    if (!isNarrowLayout || isFlexMode || !touchStartRef.current) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 45 || absX <= absY * 1.2) {
      return;
    }

    cycleSelection(deltaX < 0 ? 1 : -1);
  }, [cycleSelection, isNarrowLayout, isFlexMode]);

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

  const modeClass = isCover ? 'cover-mode' : isFolded ? 'folded-mode' : isUnfolded ? 'unfolded-mode' : '';

  return (
    <div className={`panel-bg min-h-screen bg-[#07090d] text-[#f5e6b3] ${modeClass}`}>
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
                className="inline-flex min-h-12 items-center gap-1.5 border border-orange-400/80 bg-[#24190f] px-3 py-1 font-semibold uppercase tracking-[0.14em] text-orange-200 transition hover:bg-[#332214] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isFetching && <span className="h-3 w-3 animate-spin rounded-full border border-orange-200 border-t-transparent" />}
                {isFetching ? 'Refreshing' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-blue-300">└────────────────────────────────────────────────────────────────────────────┘</div>
        </header>

        <main className={isFlexMode ? 'fold-flex-layout' : ''} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {providers.length === 0 ? (
            <div className="border border-yellow-500/60 bg-[#14120d] px-4 py-6 text-center text-xs uppercase tracking-[0.16em] text-yellow-300">
              No Providers Available
            </div>
          ) : isFlexMode ? (
            <>
              <section className="fold-flex-top">
                <div className="provider-grid grid gap-2">
                  {providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      interactionMode="select"
                      onSelect={setSelectedProviderId}
                      selected={selectedProvider?.id === provider.id}
                    />
                  ))}
                </div>
              </section>

              <section className="fold-flex-bottom border border-blue-500/45 bg-[#0d1219] p-3">
                {selectedProvider ? (
                  <>
                    <div className="mb-2 border-b border-blue-500/35 pb-1">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f5e6b3]">{selectedProvider.name}</h2>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-blue-300">
                        {toTitle(selectedProvider.category)} | Health: {toTitle(selectedProvider.health.status)}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(selectedProvider.cardMetrics ?? [
                        { label: 'Month Cost', value: formatCurrency(selectedProvider.costs?.currentMonth, selectedProvider.costs?.currency ?? 'USD') },
                        { label: 'Projected', value: formatCurrency(selectedProvider.costs?.projected, selectedProvider.costs?.currency ?? 'USD') },
                        { label: 'Usage', value: selectedProvider.usage ? `${selectedProvider.usage.current.toLocaleString('en-US')} ${selectedProvider.usage.unit}` : 'N/A' },
                      ]).map((metric) => (
                        <div key={metric.label} className="border border-blue-500/35 bg-[#0a1016] px-2 py-1.5">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-blue-200">{metric.label}</p>
                          <p className="mt-1 text-xs font-semibold text-orange-300">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-[11px] uppercase tracking-[0.12em] text-blue-300">Select a provider to preview details.</p>
                )}
              </section>
            </>
          ) : (
            <>
              {isCover && selectedProvider && (
                <section className="mb-2 border border-blue-500/45 bg-[#0d1219] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-blue-300">Swipe ← → to cycle providers</p>
                  <h2 className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-[#f5e6b3]">{selectedProvider.name}</h2>
                  <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] uppercase tracking-[0.12em]">
                    <p className="border border-blue-500/35 bg-[#0a1016] px-2 py-1 text-blue-200">Health: {toTitle(selectedProvider.health.status)}</p>
                    <p className="border border-blue-500/35 bg-[#0a1016] px-2 py-1 text-orange-300">
                      {formatCurrency(selectedProvider.costs?.currentMonth, selectedProvider.costs?.currency ?? 'USD')}
                    </p>
                  </div>
                </section>
              )}
              <div className="provider-grid grid gap-2">
                {providers.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} interactionMode="link" />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
