import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatCurrency } from './utils';

interface Props {
  provider: ProviderData;
}

export default function DeepSeekCard({ provider }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:deep"
      metrics={[
        {
          label: 'Account Balance',
          value: formatCurrency(provider.usage?.current, provider.costs?.currency ?? 'USD'),
        },
        { label: 'Tokens Used', value: 'N/A (usage history dashboard)' },
        { label: 'Input Tokens', value: 'N/A' },
        { label: 'Output Tokens', value: 'N/A' },
        { label: 'Cache Hit Rate', value: 'N/A' },
      ]}
    />
  );
}
