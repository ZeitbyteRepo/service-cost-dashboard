# Stripe API Research

## Key Status
- Env var: `STRIPE_SECRET_KEY`
- Permissions: Full API access (sk_live or sk_test)
- Tested: Working key

## Available Endpoints

Base URL: `https://api.stripe.com/v1`

### Balance & Billing Endpoints
- `GET /balance` - Current account balance
- `GET /balance_transactions` - Transaction history
- `GET /charges` - List all charges
- `GET /customers` - List customers
- `GET /invoices` - List invoices
- `GET /subscriptions` - List subscriptions

### Payment Endpoints
- `POST /payment_intents` - Create payment intent
- `GET /payment_intents` - List payment intents
- `POST /refunds` - Create refund
- `GET /payouts` - List payouts

### Product Endpoints
- `GET /products` - List products
- `GET /prices` - List prices
- `GET /coupons` - List coupons

### Reporting Endpoints
- `GET /reports` - Report types
- `POST /report_runs` - Run reports

## Cost Drivers

1. **Transaction Volume** - Per-transaction fees
2. **Payment Method** - Different fees for cards, ACH, etc.
3. **International** - Higher fees for cross-border
4. **Currency Conversion** - FX fees
5. **Subscription Volume** - Per-subscription fees

### Pricing Model
| Type | Rate |
|------|------|
| Card payments | 2.9% + $0.30 |
| ACH Direct Debit | 0.8% ($5 cap) |
| Wire transfer | $8 inbound |
| International cards | 3.9% + $0.30 |

### For Our Dashboard (as consumer)
- We are the merchant receiving payments
- Track: Volume processed, fees paid, payouts
- Revenue data available via API

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Revenue** - Total charges this month

### Secondary Metrics
- **Transaction Count** - Number of charges
- **Average Transaction** - Mean charge amount
- **Fees Paid** - Stripe fees this month
- **Net Revenue** - After fees

### Uptime Indicator
- Yes - Status page at `https://status.stripe.com`
- API health: `GET /v1/account` (test connectivity)

## Sub-Page Proposal (Detail View)

### Section 1: Revenue Overview
- Gross revenue chart
- Refunds and disputes
- Net revenue calculation

### Section 2: Transactions
- Recent charges list
- Payment method breakdown
- Failed payment analysis

### Section 3: Customer Metrics
- Active customers
- New customers this month
- Customer lifetime value

### Section 4: Subscription Health
- Active subscriptions
- MRR (Monthly Recurring Revenue)
- Churn rate

### Section 5: Payouts
- Payout history
- Pending balance
- Payout schedule

### Object Lists
- Customers (enumerate all)
- Charges (all transactions)
- Subscriptions (active and past)
- Invoices (billing history)
- Products (catalog)
- Prices (pricing)
- Payouts (bank transfers)
- Balance Transactions (all ledger entries)

## Sample API Response

```json
GET /v1/balance

{
  "object": "balance",
  "available": [
    {
      "amount": 666670,
      "currency": "usd",
      "source_types": {
        "card": 666670
      }
    }
  ],
  "pending": [
    {
      "amount": 61414,
      "currency": "usd",
      "source_types": {
        "card": 61414
      }
    }
  ]
}
```

```json
GET /v1/charges?limit=3

{
  "object": "list",
  "data": [
    {
      "id": "ch_1234",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded",
      "created": 1709078400
    }
  ]
}
```

## Notes
- Pagination with `starting_after` and `limit`
- Webhooks for real-time updates
- Test mode keys for development
- Expand related objects with `expand[]` param
