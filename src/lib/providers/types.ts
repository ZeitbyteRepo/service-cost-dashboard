export type ProviderCategory = 'ai' | 'infrastructure' | 'payments' | 'search' | 'platform';

export interface ProviderCosts {
  currentMonth: number;
  lastMonth: number | null;
  projected: number;
  currency: string;
}

export interface ProviderUsage {
  unit: string;
  current: number;
  limit: number | null;
  percentage: number;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  lastSync: string | null;
  errorMessage?: string;
}

export interface ProviderData {
  id: string;
  name: string;
  category: ProviderCategory;
  costs: ProviderCosts | null;
  usage: ProviderUsage | null;
  health: ProviderHealth;
  lastUpdated: string;
  hasBillingApi: boolean;
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: ProviderCategory;
  hasBillingApi: boolean;
  envKey: string;
  fetchFn: () => Promise<ProviderData>;
}
