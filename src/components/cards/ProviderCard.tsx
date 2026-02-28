import type { ProviderData } from '@/lib/providers/types';
import DeepSeekCard from './DeepSeekCard';
import GenericProviderCard from './GenericProviderCard';
import GitHubCard from './GitHubCard';
import LemonSqueezyCard from './LemonSqueezyCard';
import RailwayCard from './RailwayCard';
import StripeCard from './StripeCard';

interface Props {
  provider: ProviderData;
}

export default function ProviderCard({ provider }: Props) {
  switch (provider.id) {
    case 'railway':
      return <RailwayCard provider={provider} />;
    case 'stripe':
      return <StripeCard provider={provider} />;
    case 'lemonsqueezy':
      return <LemonSqueezyCard provider={provider} />;
    case 'github':
      return <GitHubCard provider={provider} />;
    case 'deepseek':
      return <DeepSeekCard provider={provider} />;
    default:
      return <GenericProviderCard provider={provider} />;
  }
}
