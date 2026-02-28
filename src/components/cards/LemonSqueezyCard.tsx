import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency } from './utils';

interface Props {
  provider: ProviderData;
}

export default function LemonSqueezyCard({ provider }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:lemon"
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
