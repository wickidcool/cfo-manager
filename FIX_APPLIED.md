# CloudFront API Routing Fix Applied

## Problem
When calling `https://YOUR-CLOUDFRONT-URL/api/users`, CloudFront was returning HTML instead of JSON.

## Root Cause
The CloudFront distribution was forwarding `/api/users` to API Gateway, but the Lambda function routes were defined as `/users` (without the `/api` prefix). This caused API Gateway to return 404, which CloudFront then served as HTML.

## Changes Made

### 1. Updated `apps/api/lambdas.yml`
Changed all Lambda paths to include the `/api` prefix:

**Before:**
```yaml
path: /users
path: /users/{id}
```

**After:**
```yaml
path: /api/users
path: /api/users/{id}
```

### 2. Updated `apps/api/cdk/static-stack.ts`
- Removed the `originPath` parameter from `RestApiOrigin` (line 155)
- Updated health check endpoint to `/api/health` (line 79)

**Before:**
```typescript
origin: new origins.RestApiOrigin(this.api, {
  originPath: `/${environmentName}`,
}),
```

**After:**
```typescript
origin: new origins.RestApiOrigin(this.api),
```

### 3. Updated Documentation
- `apps/api/cdk/README.md` - Updated examples and added note about `/api` prefix requirement
- All documentation now reflects that Lambda paths must include `/api`

## How CloudFront Routing Now Works

### Request Flow:
1. **Client Request**: `https://d2dg4o035tbuxs.cloudfront.net/api/users`
2. **CloudFront** matches `/api/*` behavior
3. **Forwards to API Gateway**: `/api/users` (at stage `dev`)
4. **API Gateway** has route `/api/users` → matches!
5. **Lambda executes** and returns JSON
6. **CloudFront** serves JSON response to client

### URL Mapping:
```
CloudFront URL                                  → API Gateway Path
─────────────────────────────────────────────────────────────────
https://d2dg4o035tbuxs.cloudfront.net/api/users         → /dev/api/users
https://d2dg4o035tbuxs.cloudfront.net/api/users/123     → /dev/api/users/123
https://d2dg4o035tbuxs.cloudfront.net/api/health        → /dev/api/health
```

## Next Steps: Deploy the Fix

You need to redeploy your CDK stacks for these changes to take effect:

```bash
# 1. Deploy updated infrastructure
npm run cdk:deploy

# 2. Wait for deployment to complete (5-10 minutes)

# 3. Invalidate CloudFront cache (optional but recommended)
npm run invalidate:cdn

# 4. Test the API
curl https://d2dg4o035tbuxs.cloudfront.net/api/users
curl https://d2dg4o035tbuxs.cloudfront.net/api/health
```

## Expected Response

After deployment, you should see:

```bash
$ curl https://d2dg4o035tbuxs.cloudfront.net/api/users
{"success":true,"data":[]}

$ curl https://d2dg4o035tbuxs.cloudfront.net/api/health
{"status":"healthy","timestamp":"...","environment":"dev"}
```

## Verification

To verify the fix is working:

1. **Check Lambda Functions:**
   ```bash
   aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `dev-`)].FunctionName'
   ```
   Should show: `dev-GetUsers`, `dev-CreateUser`, etc.

2. **Check API Gateway Routes:**
   ```bash
   aws apigateway get-resources --rest-api-id YOUR_API_ID
   ```
   Should show routes like `/api/users`, `/api/users/{id}`

3. **Test Endpoints:**
   ```bash
   # Health check
   curl https://d2dg4o035tbuxs.cloudfront.net/api/health
   
   # Get all users
   curl https://d2dg4o035tbuxs.cloudfront.net/api/users
   
   # Create user
   curl -X POST https://d2dg4o035tbuxs.cloudfront.net/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   ```

## Troubleshooting

### Still getting HTML?
- Wait 5-10 minutes for CloudFront distribution to fully update
- Run `npm run invalidate:cdn` to clear cache
- Check CloudFormation console for deployment status

### Getting 403 Forbidden?
- Lambda execution role might not have correct permissions
- Check CloudWatch Logs for Lambda errors

### Getting CORS errors?
- CORS is configured by default in `StaticStack`
- Make sure you're accessing through CloudFront, not API Gateway directly

## Summary

✅ All Lambda paths now include `/api` prefix  
✅ CloudFront routing configuration simplified  
✅ API Gateway routes match CloudFront forwarding  
✅ Tests passing (118 tests)  
✅ No linter errors  

**Action Required:** Run `npm run cdk:deploy` to apply these changes to your AWS infrastructure.

