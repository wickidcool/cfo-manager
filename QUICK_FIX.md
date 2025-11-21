# Quick Fix: CloudFront Returning Wrong Data

## What You're Probably Seeing

One of these:
1. **HTML page** instead of JSON
2. **403 Forbidden** error
3. **404 Not Found** error
4. **Empty response** or connection error

## Root Cause

The CDK stack hasn't been deployed with the updated `/api` prefix configuration yet.

## 3-Step Fix

### Step 1: Deploy Updated CDK Stack

```bash
cd /Users/alwick/development/projects/aws-starter-kit

# This deploys BOTH stacks with the /api prefix fix
npm run cdk:deploy
```

**What this does:**
- Updates API Gateway routes to include `/api` prefix
- Deploys Lambda functions with correct paths
- Updates CloudFront distribution
- Takes ~5-10 minutes

**Expected output:**
```
✅ AwsStarterKit-Static-dev
✅ AwsStarterKit-Users-dev

Outputs:
AwsStarterKit-Static-dev.WebsiteUrl = https://d2dg4o035tbuxs.cloudfront.net
AwsStarterKit-Static-dev.ApiUrlViaCdn = https://d2dg4o035tbuxs.cloudfront.net/api
```

### Step 2: Wait for CloudFront Distribution Update

CloudFront distributions take time to deploy. Wait **5-10 minutes** after CDK deploy completes.

You can check status with:
```bash
aws cloudformation describe-stacks \
  --stack-name AwsStarterKit-Static-dev \
  --query 'Stacks[0].StackStatus' \
  --output text

# Should show: UPDATE_COMPLETE
```

### Step 3: Invalidate CloudFront Cache (Optional but Recommended)

```bash
npm run invalidate:cdn
```

This clears the CloudFront cache so it picks up the new routing immediately.

## Test It

Run the test script:

```bash
chmod +x test-api.sh
./test-api.sh
```

Or test manually:

```bash
# Health check (should return JSON)
curl https://d2dg4o035tbuxs.cloudfront.net/api/health

# Get users (should return JSON)
curl https://d2dg4o035tbuxs.cloudfront.net/api/users

# Should see something like:
# {"success":true,"data":[]}
```

## If Still Not Working

### Check 1: Verify Lambda Functions Exist

```bash
aws lambda list-functions \
  --query 'Functions[?starts_with(FunctionName, `dev-`)].FunctionName' \
  --output table
```

**Expected:**
```
-----------------------
|   ListFunctions      |
+---------------------+
|  dev-GetUsers       |
|  dev-GetUser        |
|  dev-CreateUser     |
|  dev-UpdateUser     |
|  dev-DeleteUser     |
+---------------------+
```

**If empty:** CDK deployment failed. Check CloudFormation console.

### Check 2: Verify API Gateway Routes

```bash
# Get API Gateway ID
API_ID=$(aws cloudformation describe-stacks \
  --stack-name AwsStarterKit-Static-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiId`].OutputValue' \
  --output text)

# List all routes
aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[].path' \
  --output table
```

**Expected routes:**
```
/
/api
/api/health
/api/users
/api/users/{id}
```

**If missing `/api`:** The old CDK code is still deployed. Run `npm run cdk:deploy` again.

### Check 3: Test API Gateway Directly (Bypass CloudFront)

```bash
# Get direct API Gateway URL
aws cloudformation describe-stacks \
  --stack-name AwsStarterKit-Static-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

# Test it directly
curl https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev/api/users
```

**If this works but CloudFront doesn't:**
- CloudFront cache issue → Run `npm run invalidate:cdn`
- CloudFront distribution still updating → Wait 10-15 minutes

### Check 4: CloudFormation Stack Status

```bash
aws cloudformation describe-stacks \
  --stack-name AwsStarterKit-Static-dev \
  --query 'Stacks[0].{Status:StackStatus,Reason:StackStatusReason}' \
  --output table
```

**If status is not `UPDATE_COMPLETE`:**
- Check AWS CloudFormation console for errors
- Look for red X marks indicating failed resources

### Check 5: CloudFront Distribution Status

```bash
# Get distribution ID
DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name AwsStarterKit-Static-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' \
  --output text)

# Check status
aws cloudfront get-distribution \
  --id $DIST_ID \
  --query 'Distribution.Status' \
  --output text
```

**Should show:** `Deployed`

**If shows** `InProgress`: Wait for deployment to complete.

## Common Issues

### Issue: "CDK deploy fails with 'Resource already exists'"

**Solution:**
```bash
# Destroy and recreate
npm run cdk:destroy
npm run cdk:deploy
```

⚠️ **Warning:** This deletes all resources. Only do this in development.

### Issue: "Access Denied" errors

**Solution:** Check AWS credentials:
```bash
aws sts get-caller-identity
```

Should show your AWS account. If not, run `aws configure`.

### Issue: Lambda functions exist but not responding

**Check CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/dev-GetUsers --since 10m --follow
```

Look for errors like:
- `Task timed out` → Increase timeout in `lambdas.yml`
- `Cannot find module` → Bundling issue
- `Runtime.HandlerNotFound` → Check handler name

### Issue: Still getting HTML from S3

This means CloudFront is still routing to S3 instead of API Gateway.

**Solution:**
1. Verify `/api/*` behavior exists in CloudFront:
```bash
aws cloudfront get-distribution-config --id $DIST_ID | grep -A 20 "PathPattern.*api"
```

2. If missing, redeploy:
```bash
npm run cdk:deploy --all
```

## Complete Deployment Verification

Run all checks at once:

```bash
#!/bin/bash
echo "1. Lambda Functions:"
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `dev-`)].FunctionName' --output table

echo -e "\n2. CloudFormation Status:"
aws cloudformation describe-stacks --stack-name AwsStarterKit-Static-dev --query 'Stacks[0].StackStatus' --output text

echo -e "\n3. API Gateway Resources:"
API_ID=$(aws cloudformation describe-stacks --stack-name AwsStarterKit-Static-dev --query 'Stacks[0].Outputs[?OutputKey==`ApiId`].OutputValue' --output text)
aws apigateway get-resources --rest-api-id $API_ID --query 'items[].path' --output table

echo -e "\n4. Test Health Check:"
curl -s https://d2dg4o035tbuxs.cloudfront.net/api/health | jq .

echo -e "\n5. Test Get Users:"
curl -s https://d2dg4o035tbuxs.cloudfront.net/api/users | jq .
```

## Summary

**The most common issue:** CDK not deployed with the updated configuration.

**The fix:**
```bash
npm run cdk:deploy  # Wait 5-10 minutes
npm run invalidate:cdn
./test-api.sh
```

If you're still having issues, share the output of `./test-api.sh` and I can help diagnose further!

