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

export interface ProviderMetric {
  label: string;
  value: string;
}

export interface ProviderSection {
  title: string;
  metrics: ProviderMetric[];
}

export interface ProviderObjectList {
  title: string;
  items: string[];
}

export interface ProviderTrendPoint {
  label: string;
  value: number;
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
  cardMetrics?: ProviderMetric[];
  detailSections?: ProviderSection[];
  objectLists?: ProviderObjectList[];
  trendSeries?: ProviderTrendPoint[];
}

export interface ProviderConfig {
  id: string;
  name: string;
  category: ProviderCategory;
  hasBillingApi: boolean;
  envKey: string;
  fetchFn: () => Promise<ProviderData>;
}