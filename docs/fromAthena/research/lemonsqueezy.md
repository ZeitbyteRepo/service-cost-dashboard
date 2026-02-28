# LemonSqueezy API Research

## Key Status
- Env var: `LEMONSQUEEZY_API_KEY`
- Permissions: Full API access for store management
- Tested: Working key

## Available Endpoints

Base URL: `https://api.lemonsqueezy.com/v1`

### Store Endpoints
- `GET /stores` - List all stores
- `GET /stores/{id}` - Get store details

### Order Endpoints
- `GET /orders` - List all orders
- `GET /orders/{id}` - Get order details
- `POST /orders/{id}/refund` - Issue refund
- `GET /orders/{id}/invoice` - Generate invoice

### Customer Endpoints
- `GET /customers` - List customers
- `GET /customers/{id}` - Get customer
- `POST /customers` - Create customer

### Subscription Endpoints
- `GET /subscriptions` - List subscriptions
- `GET /subscriptions/{id}` - Get subscription
- `PATCH /subscriptions/{id}` - Update subscription
- `POST /subscriptions/{id}/cancel` - Cancel subscription

### Invoice Endpoints
- `GET /subscription-invoices` - List subscription invoices
- `GET /subscription-invoices/{id}` - Get invoice

### Product Endpoints
- `GET /products` - List products
- `GET /variants` - List variants
- `GET /prices` - List prices

### Checkout Endpoints
- `POST /checkouts` - Create checkout
- `GET /checkouts` - List checkouts

## Cost Drivers

1. **Transaction Volume** - Per-transaction fees
2. **Subscription Count** - Monthly active subscriptions
3. **Payment Method** - PayPal vs card
4. **Refunds** - Refund processing
5. **Currency** - Multi-currency handling

### Pricing Model (Merchant of Record)
- 5% + 50c per transaction (cards)
- PayPal: Additional fees
- Tax handling included in MoR fee
- No monthly subscription fee

### Key Advantages
- Handles global taxes (VAT, GST)
- No merchant account needed
- Built-in fraud protection

## Card Proposal (Dashboard)

### Primary Metric
- **Monthly Revenue** - Total order value

### Secondary Metrics
- **Order Count** - Number of orders
- **Average Order Value** - Mean order amount
- **Active Subscriptions** - MRR count
- **Fees Paid** - LemonSqueezy fees

### Uptime Indicator
- No dedicated status page API
- Monitor via API response times

## Sub-Page Proposal (Detail View)

### Section 1: Revenue Overview
- Gross revenue chart
- Net revenue after fees
- Tax collected breakdown

### Section 2: Orders
- Recent orders list
- Order status breakdown
- Refund statistics

### Section 3: Subscriptions
- Active subscriptions
- MRR calculation
- Churn analysis
- Subscription tier distribution

### Section 4: Products
- Top selling products
- Variant performance
- Revenue by product

### Section 5: Customers
- Customer count
- Geographic distribution
- License key usage

### Object Lists
- Stores (all stores)
- Orders (all transactions)
- Customers (all buyers)
- Subscriptions (recurring billing)
- Products (catalog)
- Variants (product options)
- License Keys (software licenses)
- Checkouts (checkout sessions)
- Discounts (promo codes)

## Sample API Response

```json
GET /v1/orders

{
  "jsonapi": {
    "version": "1.0"
  },
  "data": [
    {
      "type": "orders",
      "id": "1",
      "attributes": {
        "store_id": 1,
        "customer_id": 1,
        "identifier": "abc123",
        "order_number": 1,
        "currency": "USD",
        "subtotal": 1000,
        "discount_total": 0,
        "tax": 200,
        "total": 1200,
        "subtotal_usd": 1000,
        "discount_total_usd": 0,
        "tax_usd": 200,
        "total_usd": 1200,
        "status": "paid",
        "created_at": "2024-01-15T10:00:00Z"
      }
    }
  ]
}
```

## Notes
- JSON:API format for responses
- Rate limit: 300 requests/minute
- Amounts in cents
- Test mode available
- Webhooks for events
