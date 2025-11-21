# Deployment Guide

This guide will help you deploy the AWS Starter Kit to AWS.

## Prerequisites

1. **AWS CLI** configured with valid credentials:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and default region
   ```

2. **Node.js** and **npm** installed

3. **AWS CDK CLI** (will be used via npx)

## Initial Setup (First Time Only)

### 1. Install Dependencies

```bash
npm install
```

### 2. Bootstrap CDK (First Time Only)

This creates the necessary S3 bucket and IAM roles for CDK deployments:

```bash
npm run cdk:bootstrap
```

You only need to run this once per AWS account/region.

## Deployment Steps

### Step 1: Deploy Infrastructure (CloudFront, S3, API Gateway, Lambdas)

```bash
npm run cdk:deploy
```

This will:
- Create the StaticStack (CloudFront, S3, API Gateway)
- Create the UserStack (Lambda functions from `lambdas.yml`)
- Show you the changes and ask for confirmation
- Output the CloudFront URL and other important values

**Important Outputs:**
- `WebsiteUrl`: Your CloudFront distribution URL (use this to access your app)
- `ApiUrlViaCdn`: API endpoint through CloudFront (e.g., `https://xxx.cloudfront.net/api`)
- `BucketName`: S3 bucket name for web content

### Step 2: Build and Deploy Web Application

```bash
# Build the web app
npm run build:web

# Deploy to S3 (requires bucket name from CDK output)
aws s3 sync dist/apps/web s3://YOUR-BUCKET-NAME --delete

# Invalidate CloudFront cache to serve new content
npm run invalidate:cdn
```

Or use the helper script:

```bash
npm run deploy:web
```

> **Note:** The `deploy:web` script requires the `BUCKET_NAME` and `DISTRIBUTION_ID` environment variables. You can get these from the CDK output.

## Complete Deployment (One Command)

After initial setup, you can deploy everything with:

```bash
npm run build:all && npm run cdk:deploy && npm run deploy:web
```

## Verifying Deployment

### 1. Check CloudFront URL

After deployment, visit the `WebsiteUrl` from the CDK output:

```
https://dxxxxxxxxxxxxx.cloudfront.net
```

You should see the React web app.

### 2. Test API Endpoints

Test the API through CloudFront:

```bash
# Get all users
curl https://YOUR-CLOUDFRONT-URL/api/users

# Health check
curl https://YOUR-CLOUDFRONT-URL/api/health
```

You should get JSON responses, not HTML.

### 3. Check Lambda Functions

Verify Lambda functions were created:

```bash
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `dev-`)].FunctionName'
```

You should see functions like:
- `dev-GetUsers`
- `dev-GetUser`
- `dev-CreateUser`
- `dev-UpdateUser`
- `dev-DeleteUser`

## Troubleshooting

### Issue: API returns HTML instead of JSON

**Cause:** CDK infrastructure not deployed or CloudFront cache needs invalidation.

**Solution:**
```bash
# Re-deploy CDK
npm run cdk:deploy

# Invalidate CloudFront cache
npm run invalidate:cdn

# Wait 5-10 minutes for CloudFront distribution to fully deploy
```

### Issue: "No bootstrap stack found"

**Cause:** CDK not bootstrapped in your AWS account/region.

**Solution:**
```bash
npm run cdk:bootstrap
```

### Issue: Lambda functions not found

**Cause:** UserStack deployment failed or `lambdas.yml` has errors.

**Solution:**
```bash
# Check CDK synth for errors
npx nx run api:cdk:synth

# Check lambdas.yml syntax
cat apps/api/lambdas.yml
```

### Issue: CORS errors in browser

**Cause:** API Gateway CORS not configured or CloudFront cache policy.

**Solution:**
- CORS is configured by default in `StaticStack`
- Invalidate CloudFront cache: `npm run invalidate:cdn`
- Wait for distribution to update (5-10 minutes)

## Updating After Changes

### Code Changes (Lambda/API)

```bash
# CDK automatically bundles Lambda functions
npm run cdk:deploy
```

### Web App Changes

```bash
npm run build:web
npm run deploy:web
npm run invalidate:cdn
```

### Infrastructure Changes (CDK code)

```bash
npm run cdk:deploy
```

## Environment Variables

Create a `.env` file for local development:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=your-account-id

# CDK Configuration
CDK_DEFAULT_ACCOUNT=your-account-id
CDK_DEFAULT_REGION=us-east-1

# Deployment (from CDK outputs)
BUCKET_NAME=aws-starter-kit-dev-web-123456789012
DISTRIBUTION_ID=E1234EXAMPLE
```

## Destroying Infrastructure

To remove all AWS resources:

```bash
npm run cdk:destroy
```

⚠️ **Warning:** This will delete:
- CloudFront distribution
- S3 bucket and all contents
- API Gateway
- All Lambda functions
- CloudWatch logs

## Cost Estimation

Development environment typical costs:
- **CloudFront**: ~$0.10-$1/month (low traffic)
- **S3**: ~$0.01-$0.10/month (storage)
- **API Gateway**: $3.50 per million requests
- **Lambda**: First 1M requests/month free
- **CloudWatch Logs**: ~$0.50/GB ingested

Total for low-traffic development: **~$1-$5/month**

## Next Steps

1. Set up a custom domain with Route 53
2. Add SSL certificate with ACM
3. Configure CloudFront to use custom domain
4. Set up CI/CD with GitHub Actions
5. Add monitoring and alarms

