import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAllProviders } from '@/lib/providers/registry';
import type { ProviderData } from '@/lib/providers/types';

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

function getCardProposalMetrics(provider: ProviderData): Array<{ label: string; value: string }> {
  switch (provider.id) {
    case 'railway':
      return [
        { label: 'Monthly Spend', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'CPU Usage', value: formatNumber(provider.usage?.current, provider.usage?.unit ?? 'vCPU-h') },
        { label: 'Memory Usage', value: 'N/A (requires usage endpoint)' },
        { label: 'Storage Used', value: 'N/A (requires volume query)' },
        { label: 'Bandwidth', value: 'N/A (requires network usage query)' },
      ];
    case 'stripe':
      return [
        { label: 'Monthly Revenue', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'Transaction Count', value: 'N/A (needs charges endpoint)' },
        { label: 'Average Transaction', value: 'N/A' },
        { label: 'Fees Paid', value: 'N/A (needs balance transactions)' },
        { label: 'Net Revenue', value: 'N/A' },
      ];
    case 'lemonsqueezy':
      return [
        { label: 'Monthly Revenue', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'Order Count', value: 'N/A (needs order aggregation)' },
        { label: 'Average Order Value', value: 'N/A' },
        { label: 'Active Subscriptions', value: 'N/A (needs subscriptions endpoint)' },
        { label: 'Fees Paid', value: 'N/A (5% + 50c estimate)' },
      ];
    case 'github':
      return [
        { label: 'Actions Minutes Used', value: formatNumber(provider.usage?.current, provider.usage?.unit ?? 'min') },
        { label: 'Storage Used', value: 'N/A (needs shared storage endpoint)' },
        { label: 'Workflow Runs', value: 'N/A (needs workflow runs endpoint)' },
        { label: 'Active Repos', value: 'N/A (needs repos endpoint)' },
        { label: 'GHAS Committers', value: 'N/A (needs advanced security endpoint)' },
      ];
    case 'deepseek':
      return [
        { label: 'Account Balance', value: formatCurrency(provider.usage?.current, provider.costs?.currency ?? 'USD') },
        { label: 'Tokens Used', value: 'N/A (usage history dashboard)' },
        { label: 'Input Tokens', value: 'N/A' },
        { label: 'Output Tokens', value: 'N/A' },
        { label: 'Cache Hit Rate', value: 'N/A' },
      ];
    default:
      return [
        { label: 'Month Cost', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'Usage', value: provider.usage ? formatNumber(provider.usage.current, provider.usage.unit) : 'N/A' },
      ];
  }
}

function getSubPageProposal(providerId: string): Array<{ title: string; points: string[] }> {
  const proposals: Record<string, Array<{ title: string; points: string[] }>> = {
    railway: [
      {
        title: 'Projects Overview',
        points: ['List all projects with costs', 'Resource allocation per project', 'Active environments'],
      },
      {
        title: 'Services Breakdown',
        points: ['Per-service CPU/memory usage', 'Deployment frequency', 'Error rates from logs'],
      },
      {
        title: 'Database & Storage',
        points: ['Database sizes', 'Volume usage', 'Backup status'],
      },
      {
        title: 'Cost Trends',
        points: ['Daily/weekly spend chart', 'Projected monthly cost', 'Cost by resource type'],
      },
      {
        title: 'Object Lists',
        points: ['Projects', 'Services', 'Deployments', 'Environments', 'Volumes', 'Domains'],
      },
    ],
    stripe: [
      {
        title: 'Revenue Overview',
        points: ['Gross revenue chart', 'Refunds and disputes', 'Net revenue calculation'],
      },
      {
        title: 'Transactions',
        points: ['Recent charges list', 'Payment method breakdown', 'Failed payment analysis'],
      },
      {
        title: 'Customer Metrics',
        points: ['Active customers', 'New customers this month', 'Customer lifetime value'],
      },
      {
        title: 'Subscription Health',
        points: ['Active subscriptions', 'MRR', 'Churn rate'],
      },
      {
        title: 'Payouts',
        points: ['Payout history', 'Pending balance', 'Payout schedule'],
      },
    ],
    lemonsqueezy: [
      {
        title: 'Revenue Overview',
        points: ['Gross revenue chart', 'Net revenue after fees', 'Tax collected breakdown'],
      },
      {
        title: 'Orders',
        points: ['Recent orders list', 'Order status breakdown', 'Refund statistics'],
      },
      {
        title: 'Subscriptions',
        points: ['Active subscriptions', 'MRR calculation', 'Churn analysis', 'Subscription tier distribution'],
      },
      {
        title: 'Products',
        points: ['Top selling products', 'Variant performance', 'Revenue by product'],
      },
      {
        title: 'Customers',
        points: ['Customer count', 'Geographic distribution', 'License key usage'],
      },
    ],
    github: [
      {
        title: 'Actions Overview',
        points: ['Minutes used by OS type', 'Workflow run history', 'Most active workflows', 'Runner usage'],
      },
      {
        title: 'Storage Breakdown',
        points: ['Artifacts storage', 'Packages storage', 'Releases storage', 'LFS storage'],
      },
      {
        title: 'Repository Metrics',
        points: ['Repository list with stats', 'Commit activity', 'Issue/PR counts', 'Code frequency'],
      },
      {
        title: 'Security',
        points: ['GHAS usage', 'Code scanning alerts', 'Secret scanning results', 'Dependabot alerts'],
      },
      {
        title: 'Copilot Usage',
        points: ['Active seats', 'Suggestions accepted rate', 'Usage by language'],
      },
    ],
    deepseek: [
      {
        title: 'Balance Overview',
        points: ['Current balance', 'Usage rate (balance burn rate)', 'Projected depletion date'],
      },
      {
        title: 'Token Usage',
        points: ['Daily token consumption', 'Input/output ratio', 'By model breakdown'],
      },
      {
        title: 'Cache Performance',
        points: ['Cache hit rate', 'Savings from caching', 'Cache miss analysis'],
      },
      {
        title: 'Model Usage',
        points: ['Usage by model type', 'Thinking vs non-thinking', 'Feature usage (JSON, tools)'],
      },
      {
        title: 'Request Analytics',
        points: ['Request count', 'Average tokens per request', 'Error rate'],
      },
    ],
  };

  return proposals[providerId] ?? [];
}

export default async function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const providers = await fetchAllProviders();
  const provider = providers.find((entry) => entry.id === id);

  if (!provider) {
    notFound();
  }

  const cardMetrics = getCardProposalMetrics(provider);
  const sections = provider.detailSections && provider.detailSections.length > 0 ? provider.detailSections : getSubPageProposal(provider.id);

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
            Health: {provider.health.status} | Billing API: {provider.hasBillingApi ? 'Yes' : 'No'}
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

        <section className="grid gap-2 md:grid-cols-2">
          {sections.map((section) => {
            const metrics = 'metrics' in section ? section.metrics : section.points.map((point) => ({ label: 'Item', value: point }));

            return (
              <article key={section.title} className="border border-blue-500/45 bg-[#0d1219] p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300">{section.title}</h3>
                <div className="space-y-1.5">
                  {metrics.map((metric) => (
                    <div key={`${section.title}-${metric.label}-${metric.value}`} className="grid grid-cols-[auto_1fr] gap-x-2">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-blue-200">{metric.label}</p>
                      <p className="text-right text-xs text-[#f5e6b3]">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
