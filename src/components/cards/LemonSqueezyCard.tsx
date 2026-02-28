import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency } from './utils';

interface Props {
  provider: ProviderData;
  interactionMode?: 'link' | 'select';
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function LemonSqueezyCard({ provider, interactionMode, onSelect, selected }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:lemon"
      interactionMode={interactionMode}
      onSelect={onSelect}
      selected={selected}
      metrics={[
        { label: 'Monthly Revenue', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'Order Count', value: 'N/A (needs order aggregation)' },
        { label: 'Average Order Value', value: 'N/A' },
        { label: 'Active Subscriptions', value: 'N/A (needs subscriptions endpoint)' },
        { label: 'Fees Paid', value: 'N/A (5% + 50c estimate)' },
      ]}
    />
  );
}
