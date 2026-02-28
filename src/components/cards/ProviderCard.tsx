import type { ProviderData } from '@/lib/providers/types';
import DeepSeekCard from './DeepSeekCard';
import GenericProviderCard from './GenericProviderCard';
import GitHubCard from './GitHubCard';
import LemonSqueezyCard from './LemonSqueezyCard';
import RailwayCard from './RailwayCard';
import StripeCard from './StripeCard';

interface Props {
  provider: ProviderData;
  interactionMode?: 'link' | 'select';
  onSelect?: (id: string) => void;
  selected?: boolean;
}

export default function ProviderCard({ provider, interactionMode, onSelect, selected }: Props) {
  const sharedProps = {
    provider,
    interactionMode,
    onSelect,
    selected,
  };

  switch (provider.id) {
    case 'railway':
      return <RailwayCard {...sharedProps} />;
    case 'stripe':
      return <StripeCard {...sharedProps} />;
    case 'lemonsqueezy':
      return <LemonSqueezyCard {...sharedProps} />;
    case 'github':
      return <GitHubCard {...sharedProps} />;
    case 'deepseek':
      return <DeepSeekCard {...sharedProps} />;
    default:
      return <GenericProviderCard {...sharedProps} />;
  }
}
