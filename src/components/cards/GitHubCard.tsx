import type { ProviderData } from '@/lib/providers/types';
import ProviderCardShell from './ProviderCardShell';
import { formatNumber } from './utils';

interface Props {
  provider: ProviderData;
  interactionMode?: 'link' | 'select';
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function GitHubCard({ provider, interactionMode, onSelect, selected }: Props) {
  return (
    <ProviderCardShell
      provider={provider}
      tag="window:gh"
      interactionMode={interactionMode}
      onSelect={onSelect}
      selected={selected}
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
