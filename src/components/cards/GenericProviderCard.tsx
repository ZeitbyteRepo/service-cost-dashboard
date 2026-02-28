import Link from 'next/link';
import type { ProviderData } from '@/lib/providers/types';
import { formatCurrency, formatNumber } from './utils';

const healthStyles: Record<ProviderData['health']['status'], { dot: string; text: string; label: string }> = {
  healthy: { dot: 'bg-blue-400', text: 'text-blue-300', label: 'Healthy' },
  degraded: { dot: 'bg-yellow-400', text: 'text-yellow-300', label: 'Degraded' },
  error: { dot: 'bg-red-400', text: 'text-red-300', label: 'Error' },
  unknown: { dot: 'bg-slate-400', text: 'text-slate-300', label: 'Unknown' },
};

function toCategoryLabel(category: ProviderData['category']) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

interface Props {
  provider: ProviderData;
}

export default function GenericProviderCard({ provider }: Props) {
  const health = healthStyles[provider.health.status];

  return (
    <article className="border border-blue-500/45 bg-[#0d1219] px-2.5 py-2 transition hover:border-orange-400/75">
      <div className="mb-2 flex items-center justify-between border-b border-blue-500/35 pb-1 text-[10px] uppercase tracking-[0.12em] text-blue-300">
        <span>┌─ {provider.id}</span>
        <span>window:provider</span>
      </div>

      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold uppercase tracking-[0.08em] text-[#f5e6b3]">{provider.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span className="border border-blue-500/60 bg-[#121a28] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-blue-200">
              {toCategoryLabel(provider.category)}
            </span>
            {!provider.hasBillingApi && (
              <span className="border border-yellow-500/70 bg-[#1f1a0f] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-yellow-300">
                EST
              </span>
            )}
          </div>
        </div>
        <div className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${health.text}`}>
          <span className={`h-2 w-2 ${health.dot}`} />
          {health.label}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-blue-200">Month Cost</p>
          <p className="truncate text-right text-xs font-semibold text-orange-300">
            {formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD')}
          </p>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-0.5">
          <p className="text-[10px] uppercase tracking-[0.12em] text-blue-200">Usage</p>
          <p className="truncate text-right text-xs font-semibold text-orange-300">
            {provider.usage ? formatNumber(provider.usage.current, provider.usage.unit) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-blue-500/30 pt-1 text-[10px] uppercase tracking-[0.1em] text-blue-300">
        <span>└─ status: {health.label}</span>
        <Link href={`/providers/${provider.id}`} className="text-orange-300 hover:text-orange-200">
          Details →
        </Link>
      </div>
    </article>
  );
}
