import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency, formatNumber } from './utils';

interface Props {
  provider: ProviderData;
  interactionMode?: 'link' | 'select';
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function RailwayCard({ provider, interactionMode, onSelect, selected }: Props) {
  const usageValue = provider.usage?.current;

  return (
    <ProviderCardShell
      provider={provider}
      tag="window:rail"
      interactionMode={interactionMode}
      onSelect={onSelect}
      selected={selected}
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
