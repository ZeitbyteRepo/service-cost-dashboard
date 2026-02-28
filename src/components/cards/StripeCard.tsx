import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency } from './utils';

interface Props {
  provider: ProviderData;
  interactionMode?: 'link' | 'select';
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function StripeCard({ provider, interactionMode, onSelect, selected }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:stripe"
      interactionMode={interactionMode}
      onSelect={onSelect}
      selected={selected}
      metrics={[
        { label: 'Monthly Revenue', value: formatCurrency(provider.costs?.currentMonth, provider.costs?.currency ?? 'USD') },
        { label: 'Transaction Count', value: 'N/A (needs charges endpoint)' },
        { label: 'Average Transaction', value: 'N/A' },
        { label: 'Fees Paid', value: 'N/A (needs balance tx fees)' },
        { label: 'Net Revenue', value: 'N/A' },
      ]}
    />
  );
}
