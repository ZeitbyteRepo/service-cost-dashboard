import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency, formatNumber } from './utils';

interface Props {
  provider: ProviderData;
}

export default function RailwayCard({ provider }: Props) {
  const usageValue = provider.usage?.current;

  return (
    <ProviderCardShell
      provider={provider}
      tag="window:rail"
      metrics={[
        { label: 'Monthly Spend', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'CPU Usage', value: formatNumber(usageValue, provider.usage?.unit ?? 'vCPU-h') },
        { label: 'Memory Usage', value: 'N/A (requires usage endpoint)' },
        { label: 'Storage Used', value: 'N/A (requires volumes query)' },
        { label: 'Bandwidth', value: 'N/A (requires network usage)' },
      ]}
    />
  );
}
