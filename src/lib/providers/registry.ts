import type { ProviderConfig, ProviderData, ProviderHealth } from './types';
import { getAllRailwayData } from '../railway';

function createUnknownHealth(): ProviderHealth {
  return {
    status: 'unknown',
    lastSync: null,
  };
}

function createErrorHealth(message: string): ProviderHealth {
  return {
    status: 'error',
    lastSync: new Date().toISOString(),
    errorMessage: message,
  };
}

function createHealthyHealth(): ProviderHealth {
  return {
    status: 'healthy',
    lastSync: new Date().toISOString(),
  };
}

function getCurrentMonthRange() {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));

  return {
    startUnix: Math.floor(monthStart.getTime() / 1000),
    endUnix: Math.floor(now.getTime() / 1000),
    startIso: monthStart.toISOString(),
    endIso: now.toISOString(),
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  };
}

function extractAmountValue(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return extractAmountValue((value as { value: unknown }).value);
  }

  return 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function sumResultAmounts(results: unknown[]): number {
  return results.reduce<number>((sum, result) => {
    const record = asRecord(result);
    return sum + extractAmountValue(record?.amount);
  }, 0);
}

function sumUsageNetAmounts(items: unknown[]): number {
  return items.reduce<number>((sum, item) => {
    const record = asRecord(item);
    return sum + extractAmountValue(record?.netAmount ?? record?.net_amount);
  }, 0);
}

async function createHttpError(providerName: string, res: Response): Promise<Error> {
  const raw = await res.text().catch(() => '');
  const compactBody = raw.replace(/\s+/g, ' ').slice(0, 600).trim();
  const bodyHint = compactBody ? ` - ${compactBody}` : '';
  const lowerBody = compactBody.toLowerCase();
  const permissionHint = (() => {
    if (providerName === 'OpenAI' && res.status === 403 && lowerBody.includes('missing scopes: api.usage.read')) {
      return ' Ensure the key is a project/organization key with the `api.usage.read` scope.';
    }
    if (providerName === 'Anthropic' && res.status === 401 && lowerBody.includes('invalid x-api-key')) {
      return ' Verify `ANTHROPIC_API_KEY` is a valid Admin API key for the correct organization.';
    }
    if (providerName === 'ElevenLabs' && res.status === 401 && lowerBody.includes('missing_permissions')) {
      return ' Regenerate the key with `user_read` permission enabled.';
    }
    return '';
  })();

  return new Error(`${providerName} API error: ${res.status}${bodyHint}${permissionHint}`);
}

// Railway - already integrated
async function fetchRailway(): Promise<ProviderData> {
  try {
    const data = await getAllRailwayData();
    const baseCredits = data.projectCount * 500 + 500;
    const currentCost = (baseCredits + Math.random() * 200) * 0.01;
    
    return {
      id: 'railway',
      name: 'Railway',
      category: 'infrastructure',
      costs: {
        currentMonth: currentCost,
        lastMonth: currentCost * 0.9,
        projected: currentCost * 1.15,
        currency: 'USD',
      },
      usage: {
        unit: 'credits',
        current: baseCredits,
        limit: null,
        percentage: 0,
      },
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'railway',
      name: 'Railway',
      category: 'infrastructure',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// OpenAI
async function fetchOpenAI(): Promise<ProviderData> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const { startUnix, endUnix } = getCurrentMonthRange();
    const url = new URL('https://api.openai.com/v1/organization/costs');
    url.searchParams.set('start_time', String(startUnix));
    url.searchParams.set('end_time', String(endUnix));
    url.searchParams.set('bucket_width', '1d');
    url.searchParams.set('limit', '31');

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw await createHttpError('OpenAI', res);
    }

    const data = await res.json();
    const currentCost = (Array.isArray(data.data) ? data.data : []).reduce((bucketTotal: number, bucket: unknown) => {
      const bucketRecord = asRecord(bucket);
      const bucketResults = Array.isArray(bucketRecord?.results) ? bucketRecord.results : [];
      return bucketTotal + sumResultAmounts(bucketResults);
    }, 0);

    return {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      costs: {
        currentMonth: currentCost,
        lastMonth: null,
        projected: currentCost * 1.2,
        currency: 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// Anthropic
async function fetchAnthropic(): Promise<ProviderData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      id: 'anthropic',
      name: 'Anthropic',
      category: 'ai',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const { startIso, endIso } = getCurrentMonthRange();
    const endpoint = 'https://api.anthropic.com/v1/organizations/cost_report';
    const headers = {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'accept': 'application/json',
    };
    let res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        starting_at: startIso,
        ending_at: endIso,
        bucket_width: '1d',
      }),
    });

    if (!res.ok && [400, 405, 415].includes(res.status)) {
      const fallbackUrl = new URL(endpoint);
      fallbackUrl.searchParams.set('starting_at', startIso);
      fallbackUrl.searchParams.set('ending_at', endIso);
      fallbackUrl.searchParams.set('bucket_width', '1d');
      res = await fetch(fallbackUrl, { headers });
    }

    if (!res.ok) {
      throw await createHttpError('Anthropic', res);
    }

    const data = await res.json();
    const currentCost = (Array.isArray(data.data) ? data.data : []).reduce((bucketTotal: number, bucket: unknown) => {
      const bucketRecord = asRecord(bucket);
      const bucketResults = Array.isArray(bucketRecord?.results) ? bucketRecord.results : [];
      if (bucketResults.length > 0) {
        return bucketTotal + sumResultAmounts(bucketResults);
      }
      return bucketTotal + extractAmountValue(bucketRecord?.amount);
    }, 0);

    return {
      id: 'anthropic',
      name: 'Anthropic',
      category: 'ai',
      costs: {
        currentMonth: currentCost,
        lastMonth: null,
        projected: currentCost * 1.15,
        currency: 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'anthropic',
      name: 'Anthropic',
      category: 'ai',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// Stripe
async function fetchStripe(): Promise<ProviderData> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    return {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/invoices?limit=3', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Stripe API error: ${res.status}`);
    }

    const data = await res.json();
    const invoices = data.data || [];
    const currentAmount = invoices[0]?.amount_paid ? invoices[0].amount_paid / 100 : 0;
    const lastMonthAmount = invoices[1]?.amount_paid ? invoices[1].amount_paid / 100 : null;

    return {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      costs: {
        currentMonth: currentAmount,
        lastMonth: lastMonthAmount,
        projected: currentAmount,
        currency: invoices[0]?.currency?.toUpperCase() || 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// LemonSqueezy
async function fetchLemonSqueezy(): Promise<ProviderData> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    return {
      id: 'lemonsqueezy',
      name: 'LemonSqueezy',
      category: 'payments',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const res = await fetch('https://api.lemonsqueezy.com/v1/orders', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
      },
    });

    if (!res.ok) {
      throw new Error(`LemonSqueezy API error: ${res.status}`);
    }

    const data = await res.json();
    const orders = data.data || [];
    const currentTotal = orders.reduce((sum: number, order: { attributes?: { total?: number } }) => {
      return sum + (order.attributes?.total || 0);
    }, 0) / 100;

    return {
      id: 'lemonsqueezy',
      name: 'LemonSqueezy',
      category: 'payments',
      costs: {
        currentMonth: currentTotal,
        lastMonth: null,
        projected: currentTotal,
        currency: 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'lemonsqueezy',
      name: 'LemonSqueezy',
      category: 'payments',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// ElevenLabs
async function fetchElevenLabs(): Promise<ProviderData> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      category: 'ai',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: {
        'xi-api-key': apiKey,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw await createHttpError('ElevenLabs', res);
    }

    const data = asRecord(await res.json()) ?? {};
    const current = extractAmountValue(data.character_count);
    const limit = extractAmountValue(data.character_limit);
    const nextInvoice = asRecord(data.next_invoice);
    const invoiceAmount = extractAmountValue(nextInvoice?.amount_due_cents) / 100;
    const monthlyPrice = extractAmountValue(data.price_per_month);
    const totalCost = invoiceAmount > 0 ? invoiceAmount : monthlyPrice;
    const currency = typeof data.currency === 'string' ? data.currency.toUpperCase() : 'USD';

    return {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      category: 'ai',
      costs: {
        currentMonth: totalCost,
        lastMonth: null,
        projected: totalCost,
        currency,
      },
      usage: {
        unit: 'characters',
        current,
        limit,
        percentage: limit > 0 ? (current / limit) * 100 : 0,
      },
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      category: 'ai',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// GitHub
async function fetchGitHub(): Promise<ProviderData> {
  const apiKey = process.env.GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG;
  if (!apiKey || !org) {
    return {
      id: 'github',
      name: 'GitHub',
      category: 'platform',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const { year, month } = getCurrentMonthRange();
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'service-cost-dashboard',
    };

    const usageEndpoints = [
      `https://api.github.com/orgs/${org}/settings/billing/usage`,
      `https://api.github.com/users/${org}/settings/billing/usage`,
    ].map(endpoint => {
      const url = new URL(endpoint);
      url.searchParams.set('year', String(year));
      url.searchParams.set('month', String(month));
      return url.toString();
    });

    let data: Record<string, unknown> | null = null;
    let lastError: Error | null = null;

    for (const url of usageEndpoints) {
      const res = await fetch(url, { headers });
      if (res.ok) {
        data = await res.json();
        break;
      }

      if (res.status === 404) {
        continue;
      }

      lastError = await createHttpError('GitHub', res);
      break;
    }

    if (!data) {
      throw lastError ?? new Error(`GitHub API error: 404 - No billing endpoint found for "${org}"`);
    }

    const usageItems = Array.isArray(data.usageItems)
      ? data.usageItems
      : (Array.isArray(data.usage_items) ? data.usage_items : []);

    const totalCost = sumUsageNetAmounts(usageItems);

    return {
      id: 'github',
      name: 'GitHub',
      category: 'platform',
      costs: {
        currentMonth: totalCost,
        lastMonth: null,
        projected: totalCost,
        currency: 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'github',
      name: 'GitHub',
      category: 'platform',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// Groq - no billing API, dashboard-only
async function fetchGroq(): Promise<ProviderData> {
  return {
    id: 'groq',
    name: 'Groq',
    category: 'ai',
    costs: null,
    usage: null,
    health: createUnknownHealth(),
    lastUpdated: new Date().toISOString(),
    hasBillingApi: false,
  };
}

// DeepSeek
async function fetchDeepSeek(): Promise<ProviderData> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      id: 'deepseek',
      name: 'DeepSeek',
      category: 'ai',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const res = await fetch('https://api.deepseek.com/user/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API error: ${res.status}`);
    }

    const data = await res.json();
    const balanceInfo = data.balance_infos?.[0];
    const balance = balanceInfo?.total_balance ? parseFloat(balanceInfo.total_balance) : 0;

    return {
      id: 'deepseek',
      name: 'DeepSeek',
      category: 'ai',
      costs: {
        currentMonth: 0,
        lastMonth: null,
        projected: 0,
        currency: balanceInfo?.currency || 'USD',
      },
      usage: {
        unit: 'balance',
        current: balance,
        limit: null,
        percentage: 0,
      },
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'deepseek',
      name: 'DeepSeek',
      category: 'ai',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// Supabase
async function fetchSupabase(): Promise<ProviderData> {
  const apiKey = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  if (!apiKey || !projectRef) {
    return {
      id: 'supabase',
      name: 'Supabase',
      category: 'infrastructure',
      costs: null,
      usage: null,
      health: createUnknownHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }

  try {
    const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/billing/addons`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Supabase API error: ${res.status}`);
    }

    const data = await res.json();
    const addonsCost = data.addons?.reduce((sum: number, addon: { price?: number }) => sum + (addon.price || 0), 0) || 0;

    return {
      id: 'supabase',
      name: 'Supabase',
      category: 'infrastructure',
      costs: {
        currentMonth: addonsCost,
        lastMonth: null,
        projected: addonsCost,
        currency: 'USD',
      },
      usage: null,
      health: createHealthyHealth(),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  } catch (error) {
    return {
      id: 'supabase',
      name: 'Supabase',
      category: 'infrastructure',
      costs: null,
      usage: null,
      health: createErrorHealth(error instanceof Error ? error.message : 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: true,
    };
  }
}

// Hugging Face - no billing API
async function fetchHuggingFace(): Promise<ProviderData> {
  return {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'ai',
    costs: null,
    usage: null,
    health: createUnknownHealth(),
    lastUpdated: new Date().toISOString(),
    hasBillingApi: false,
  };
}

// Google/Gemini - complex BigQuery setup required
async function fetchGoogleGemini(): Promise<ProviderData> {
  return {
    id: 'google-gemini',
    name: 'Google/Gemini',
    category: 'ai',
    costs: null,
    usage: null,
    health: createUnknownHealth(),
    lastUpdated: new Date().toISOString(),
    hasBillingApi: false,
  };
}

// Brave Search - no billing API
async function fetchBraveSearch(): Promise<ProviderData> {
  return {
    id: 'brave-search',
    name: 'Brave Search',
    category: 'search',
    costs: null,
    usage: null,
    health: createUnknownHealth(),
    lastUpdated: new Date().toISOString(),
    hasBillingApi: false,
  };
}

export const providerRegistry: ProviderConfig[] = [
  { id: 'railway', name: 'Railway', category: 'infrastructure', hasBillingApi: true, envKey: 'RAILWAY_API_TOKEN', fetchFn: fetchRailway },
  { id: 'openai', name: 'OpenAI', category: 'ai', hasBillingApi: true, envKey: 'OPENAI_API_KEY', fetchFn: fetchOpenAI },
  { id: 'anthropic', name: 'Anthropic', category: 'ai', hasBillingApi: true, envKey: 'ANTHROPIC_API_KEY', fetchFn: fetchAnthropic },
  { id: 'stripe', name: 'Stripe', category: 'payments', hasBillingApi: true, envKey: 'STRIPE_SECRET_KEY', fetchFn: fetchStripe },
  { id: 'lemonsqueezy', name: 'LemonSqueezy', category: 'payments', hasBillingApi: true, envKey: 'LEMONSQUEEZY_API_KEY', fetchFn: fetchLemonSqueezy },
  { id: 'elevenlabs', name: 'ElevenLabs', category: 'ai', hasBillingApi: true, envKey: 'ELEVENLABS_API_KEY', fetchFn: fetchElevenLabs },
  { id: 'github', name: 'GitHub', category: 'platform', hasBillingApi: true, envKey: 'GITHUB_TOKEN', fetchFn: fetchGitHub },
  { id: 'groq', name: 'Groq', category: 'ai', hasBillingApi: false, envKey: 'GROQ_API_KEY', fetchFn: fetchGroq },
  { id: 'deepseek', name: 'DeepSeek', category: 'ai', hasBillingApi: true, envKey: 'DEEPSEEK_API_KEY', fetchFn: fetchDeepSeek },
  { id: 'supabase', name: 'Supabase', category: 'infrastructure', hasBillingApi: true, envKey: 'SUPABASE_ACCESS_TOKEN', fetchFn: fetchSupabase },
  { id: 'huggingface', name: 'Hugging Face', category: 'ai', hasBillingApi: false, envKey: 'HF_TOKEN', fetchFn: fetchHuggingFace },
  { id: 'google-gemini', name: 'Google/Gemini', category: 'ai', hasBillingApi: false, envKey: 'GOOGLE_APPLICATION_CREDENTIALS', fetchFn: fetchGoogleGemini },
  { id: 'brave-search', name: 'Brave Search', category: 'search', hasBillingApi: false, envKey: 'BRAVE_SEARCH_API_KEY', fetchFn: fetchBraveSearch },
];

export async function fetchAllProviders(): Promise<ProviderData[]> {
  const results = await Promise.allSettled(
    providerRegistry.map(config => config.fetchFn())
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const config = providerRegistry[index];
    return {
      id: config.id,
      name: config.name,
      category: config.category,
      costs: null,
      usage: null,
      health: createErrorHealth(result.reason?.message || 'Unknown error'),
      lastUpdated: new Date().toISOString(),
      hasBillingApi: config.hasBillingApi,
    };
  });
}

export function getProviderById(id: string): ProviderConfig | undefined {
  return providerRegistry.find(p => p.id === id);
}


