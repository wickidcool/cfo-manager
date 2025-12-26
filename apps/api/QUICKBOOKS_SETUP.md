# QuickBooks Integration Setup

This guide walks you through setting up the Intuit QuickBooks Online integration for the CFO Manager API.

## Prerequisites

1. An Intuit Developer account: [developer.intuit.com](https://developer.intuit.com)
2. A QuickBooks Online company (sandbox or production)
3. AWS CLI configured with appropriate permissions

## Step 1: Create an Intuit Developer App

1. Go to [Intuit Developer Portal](https://developer.intuit.com)
2. Sign in or create an account
3. Navigate to **My Apps** → **Create an App**
4. Select **QuickBooks Online and Payments**
5. Fill in your app details:
   - App Name: CFO Manager
   - Select scopes: `com.intuit.quickbooks.accounting` (Accounting)
6. After creation, note your **Client ID** and **Client Secret**

## Step 2: Configure Redirect URI

In your Intuit Developer app settings:

1. Go to **Keys & OAuth**
2. Add your redirect URIs:
   - Development: `http://localhost:3000/api/quickbooks/auth/callback`
   - Production: `https://your-domain.com/api/quickbooks/auth/callback`

## Step 3: Store Credentials in AWS Secrets Manager

The QuickBooks Client ID and Client Secret are stored securely in AWS Secrets Manager (not in environment variables).

### Create the Secret

```bash
# Create the secret with your QuickBooks credentials
aws secretsmanager create-secret \
  --name cfo-manager/quickbooks \
  --description "QuickBooks OAuth credentials for CFO Manager" \
  --secret-string '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "redirectUri": "https://your-domain.com/api/quickbooks/auth/callback",
    "environment": "sandbox"
  }'
```

### Update the Secret

```bash
aws secretsmanager update-secret \
  --secret-id cfo-manager/quickbooks \
  --secret-string '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "redirectUri": "https://your-domain.com/api/quickbooks/auth/callback",
    "environment": "production"
  }'
```

### Secret Structure

The secret JSON should contain:

| Field | Required | Description |
|-------|----------|-------------|
| `clientId` | Yes | Your Intuit app's Client ID |
| `clientSecret` | Yes | Your Intuit app's Client Secret |
| `redirectUri` | No | OAuth redirect URI (can also be in env var) |
| `environment` | No | `sandbox` or `production` (default: `sandbox`) |

## Step 4: Environment Variables

The following environment variables are still used (but NOT for secrets):

```bash
# Optional: Override redirect URI and environment
QB_REDIRECT_URI=https://your-domain.com/api/quickbooks/auth/callback
QB_ENVIRONMENT=sandbox  # or 'production'

# Secret name in AWS Secrets Manager (defaults to 'cfo-manager/quickbooks')
QB_SECRET_NAME=cfo-manager/quickbooks
```

These are configured in `lambdas.yml` and will be set automatically during CDK deployment.

## Step 5: Deploy

The CDK stack automatically grants Secrets Manager read access to QuickBooks Lambda functions.

```bash
# Deploy all stacks
npm run cdk:deploy
```

## API Endpoints

### OAuth Flow

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quickbooks/auth/start` | Start OAuth flow, get authorization URL |
| GET | `/api/quickbooks/auth/callback` | OAuth callback handler |
| POST | `/api/quickbooks/connection/status` | Check connection status |
| POST | `/api/quickbooks/disconnect` | Disconnect from QuickBooks |

### Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quickbooks/company` | Get company information |
| POST | `/api/quickbooks/customers` | Get all customers |
| POST | `/api/quickbooks/vendors` | Get all vendors |
| POST | `/api/quickbooks/accounts` | Get chart of accounts |
| POST | `/api/quickbooks/invoices` | Get invoices |
| POST | `/api/quickbooks/bills` | Get bills (A/P) |
| POST | `/api/quickbooks/items` | Get products/services |
| POST | `/api/quickbooks/reports/profit-loss` | Get P&L report |
| POST | `/api/quickbooks/reports/balance-sheet` | Get Balance Sheet |

## Usage Examples

### 1. Start OAuth Flow

```typescript
// POST /api/quickbooks/auth/start
const response = await fetch('/api/quickbooks/auth/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user-123' })
});

const { data } = await response.json();
// Redirect user to: data.authorizationUrl
window.location.href = data.authorizationUrl;
```

### 2. Handle OAuth Callback

After user authorizes, QuickBooks redirects to your callback URL with tokens:

```typescript
// The callback endpoint exchanges the code for tokens
// Your app receives: { userId, realmId, tokens }
```

### 3. Fetch QuickBooks Data

```typescript
// POST /api/quickbooks/customers
const response = await fetch('/api/quickbooks/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokens: {
      accessToken: 'xxx',
      refreshToken: 'xxx',
      realmId: '123456789',
      // ... other token fields
    },
    params: {
      limit: 50,
      offset: 0
    }
  })
});

const { data } = await response.json();
console.log(data.customers);
```

### 4. Get Financial Reports

```typescript
// POST /api/quickbooks/reports/profit-loss
const response = await fetch('/api/quickbooks/reports/profit-loss', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tokens: { /* ... */ },
    dateRange: {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    }
  })
});
```

## Token Management

The API automatically handles token refresh when needed. When tokens are refreshed, the response includes `newTokens` that your application should store.

```typescript
const { data } = await response.json();

if (data.newTokens) {
  // Store the new tokens
  await saveTokens(data.newTokens);
}
```

## Security Best Practices

1. **Secrets in Secrets Manager**: Client ID and Client Secret are stored in AWS Secrets Manager, never in environment variables or code
2. **IAM Least Privilege**: Lambda functions only have access to the specific secret they need
3. **Secrets Caching**: Secrets are cached for 5 minutes to reduce API calls and improve performance
4. **Fallback Support**: If Secrets Manager is unavailable, the system can fall back to environment variables for development
5. **HTTPS Only**: Always use HTTPS in production for all OAuth flows
6. **Token Storage**: Store user tokens securely (encrypted in database)

## Local Development

For local development, you can either:

### Option 1: Use AWS Secrets Manager (Recommended)

Configure your AWS credentials and the Lambda will fetch secrets from Secrets Manager:

```bash
export AWS_PROFILE=your-profile
# or
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
export AWS_REGION=us-east-1
```

### Option 2: Environment Variable Fallback

Set environment variables directly (for development only):

```bash
export QB_CLIENT_ID=your_client_id
export QB_CLIENT_SECRET=your_client_secret
export QB_REDIRECT_URI=http://localhost:3000/api/quickbooks/auth/callback
export QB_ENVIRONMENT=sandbox
```

## Sandbox Testing

QuickBooks provides sandbox companies for testing:

1. Go to [Intuit Developer Portal](https://developer.intuit.com)
2. Navigate to **Sandbox** in your app dashboard
3. Create or use an existing sandbox company
4. Use `environment: "sandbox"` in your secret

## Troubleshooting

### "Failed to get QuickBooks credentials" error
- Verify the secret exists in Secrets Manager: `aws secretsmanager get-secret-value --secret-id cfo-manager/quickbooks`
- Check the Lambda has the correct IAM permissions
- Verify the secret contains valid JSON with `clientId` and `clientSecret`

### "Invalid grant" error
- The authorization code has expired (valid for 10 minutes)
- The code has already been used
- Redirect URI mismatch

### "Token expired" error
- Access tokens expire after 1 hour
- The API automatically refreshes tokens, but if refresh fails, user needs to re-authenticate

### "Invalid client" error
- Check `clientId` and `clientSecret` in Secrets Manager are correct
- Ensure the app is active in Intuit Developer Portal

## Related Files

- `apps/api/src/utils/secrets.ts` - AWS Secrets Manager integration
- `apps/api/src/services/quickbooks-oauth.service.ts` - OAuth flow handling
- `apps/api/src/services/quickbooks-api.service.ts` - QuickBooks API operations
- `apps/api/src/handlers/quickbooks/` - Lambda handlers
- `apps/api/cdk/user-stack.ts` - CDK infrastructure (IAM permissions)
- `packages/common-types/src/quickbooks.types.ts` - TypeScript types
