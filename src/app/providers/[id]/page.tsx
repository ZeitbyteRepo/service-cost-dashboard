import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAllProviders } from '@/lib/providers/registry';
import type { ProviderData, ProviderMetric, ProviderTrendPoint } from '@/lib/providers/types';

function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatNumber(amount: number | null | undefined, suffix = '') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  const base = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);
  return suffix ? `${base} ${suffix}` : base;
}

function toTitle(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getFallbackCardMetrics(provider: ProviderData): ProviderMetric[] {
  return [
    { label: 'Month Cost', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
    { label: 'Projected Cost', value: formatCurrency(provider.costs?.projected, provider.costs?.currency ?? 'USD') },
    { label: 'Last Month', value: formatCurrency(provider.costs?.lastMonth, provider.costs?.currency ?? 'USD') },
    { label: 'Usage', value: provider.usage ? formatNumber(provider.usage.current, provider.usage.unit) : 'N/A' },
    {
      label: 'Usage Limit',
      value:
        provider.usage && provider.usage.limit !== null
          ? formatNumber(provider.usage.limit, provider.usage.unit)
          : 'N/A',
    },
    { label: 'Health', value: toTitle(provider.health.status) },
  ];
}

function getTrendBars(series: ProviderTrendPoint[]) {
  const max = series.reduce((acc, point) => Math.max(acc, point.value), 0);

  return series.map((point) => {
    const ratio = max > 0 ? point.value / max : 0;
    return {
      ...point,
      heightPercent: Math.max(8, Math.round(ratio * 100)),
    };
  });
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providers = await fetchAllProviders();
  const provider = providers.find((entry) => entry.id === id);

  if (!provider) {
    notFound();
  }

  const cardMetrics = provider.cardMetrics && provider.cardMetrics.length > 0
    ? provider.cardMetrics
    : getFallbackCardMetrics(provider);

  const detailSections = provider.detailSections ?? [];
  const objectLists = provider.objectLists ?? [];
  const trendSeries = provider.trendSeries ?? [];
  const trendBars = getTrendBars(trendSeries);

  return (
    <div className="panel-bg min-h-screen bg-[#07090d] px-2 py-3 text-[#f5e6b3] sm:px-3">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mb-3 border border-blue-500/60 bg-[#0e131c] px-3 py-2">
          <div className="mb-2 flex items-center justify-between border-b border-blue-500/45 pb-1 text-[11px] text-blue-300">
            <span className="tracking-[0.08em]">┌─ PROVIDER_DETAIL :: {provider.id.toUpperCase()} ─┐</span>
            <Link href="/" className="text-orange-300 hover:text-orange-200">
              ← Back
            </Link>
          </div>
          <h1 className="text-base font-semibold uppercase tracking-[0.14em] text-[#f5e6b3]">{provider.name}</h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-blue-300">
            Category: {toTitle(provider.category)} | Health: {toTitle(provider.health.status)} | Billing API: {provider.hasBillingApi ? 'Yes' : 'No'}
          </p>
        </header>

        <section className="mb-3 border border-blue-500/45 bg-[#0d1219] p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">Card Metrics</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cardMetrics.map((metric) => (
              <div key={metric.label} className="border border-blue-500/35 bg-[#0a1016] px-2 py-1.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-blue-200">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-orange-300">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-3 border border-blue-500/45 bg-[#0d1219] p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">7-Day Trend</h2>
          {trendBars.length > 0 ? (
            <div className="grid grid-cols-7 gap-2 border border-blue-500/35 bg-[#0a1016] px-2 py-2">
              {trendBars.map((point) => (
                <div key={point.label} className="flex min-h-28 flex-col justify-end">
                  <div className="flex min-h-20 items-end">
                    <div
                      className="w-full border border-orange-400/70 bg-orange-500/35"
                      style={{ height: `${point.heightPercent}%` }}
                      title={`${point.label}: ${formatCurrency(point.value, provider.costs?.currency ?? 'USD')}`}
                    />
                  </div>
                  <p className="mt-1 truncate text-center text-[9px] uppercase tracking-[0.1em] text-blue-300">{point.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-yellow-500/60 bg-[#14120d] px-2 py-3 text-[11px] uppercase tracking-[0.12em] text-yellow-300">
              Trend data unavailable.
            </p>
          )}
        </section>

        <section className="mb-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">Detail Sections</h2>
          {detailSections.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {detailSections.map((section) => (
                <article key={section.title} className="border border-blue-500/45 bg-[#0d1219] p-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">{section.title}</h3>
                  <div className="space-y-1.5">
                    {section.metrics.map((metric) => (
                      <div key={`${section.title}-${metric.label}-${metric.value}`} className="grid grid-cols-[auto_1fr] gap-x-2">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-blue-200">{metric.label}</p>
                        <p className="text-right text-xs text-[#f5e6b3]">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-yellow-500/60 bg-[#14120d] px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-yellow-300">
              No additional detail sections available.
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">Object Lists</h2>
          {objectLists.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-2">
              {objectLists.map((list) => (
                <article key={list.title} className="border border-blue-500/45 bg-[#0d1219] p-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">{list.title}</h3>
                  {list.items.length > 0 ? (
                    <ul className="space-y-1">
                      {list.items.map((item) => (
                        <li key={`${list.title}-${item}`} className="border border-blue-500/30 bg-[#0a1016] px-2 py-1 text-[11px] text-[#f5e6b3]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] uppercase tracking-[0.12em] text-blue-300">No items.</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="border border-yellow-500/60 bg-[#14120d] px-3 py-3 text-[11px] uppercase tracking-[0.12em] text-yellow-300">
              No object lists available.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
