import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatNumber } from './utils';

interface Props {
  provider: ProviderData;
}

export default function GitHubCard({ provider }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:gh"
      metrics={[
        { label: 'Actions Minutes Used', value: formatNumber(provider.usage?.current, provider.usage?.unit ?? 'min') },
        { label: 'Storage Used', value: 'N/A (needs billing storage endpoints)' },
        { label: 'Workflow Runs', value: 'N/A (needs actions runs endpoint)' },
        { label: 'Active Repos', value: 'N/A (needs repos list)' },
        { label: 'GHAS Committers', value: 'N/A (needs advanced security endpoint)' },
      ]}
    />
  );
}
