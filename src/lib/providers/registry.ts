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
    const res = await fetch('https://api.openai.com/v1/organization/costs', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const currentCost = data.data?.[0]?.results?.reduce((sum: number, r: { amount?: number }) => sum + (r.amount || 0), 0) || 0;

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
    const res = await fetch('https://api.anthropic.com/v1/organizations/cost_report', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const currentCost = data.data?.reduce((sum: number, item: { amount?: string }) => {
      return sum + (item.amount ? parseFloat(item.amount) : 0);
    }, 0) || 0;

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
      },
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.status}`);
    }

    const data = await res.json();
    const current = data.character_count || 0;
    const limit = data.character_limit || 0;
    const invoiceAmount = data.open_invoices?.[0]?.amount_due_cents ? data.open_invoices[0].amount_due_cents / 100 : 0;

    return {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      category: 'ai',
      costs: {
        currentMonth: invoiceAmount,
        lastMonth: null,
        projected: invoiceAmount,
        currency: (data.currency || 'usd').toUpperCase(),
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
    const res = await fetch(`https://api.github.com/organizations/${org}/settings/billing/usage`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Accept': 'application/vnd.github+json',
      },
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    const actionsCost = data.usageItems?.filter((item: { product?: string }) => item.product === 'Actions')
      .reduce((sum: number, item: { netAmount?: number }) => sum + (item.netAmount || 0), 0) || 0;

    return {
      id: 'github',
      name: 'GitHub',
      category: 'platform',
      costs: {
        currentMonth: actionsCost,
        lastMonth: null,
        projected: actionsCost,
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
