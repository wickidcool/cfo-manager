# AWS CDK Infrastructure

This directory contains AWS CDK infrastructure code for deploying the AWS Starter Kit.

## Architecture

The infrastructure is split into two CDK stacks:

### 1. StaticStack - Core Infrastructure

Creates the foundational infrastructure:

- **CloudFront Distribution**
  - Serves as the entry point for all traffic
  - Handles SSL/TLS termination
  - Provides caching and DDoS protection

- **S3 Bucket**
  - Stores static web content (React app)
  - Accessed by CloudFront via Origin Access Control (OAC)
  - Not publicly accessible
  - Configured for SPA routing (404/403 → index.html)

- **API Gateway**
  - REST API for Lambda functions
  - CORS enabled
  - Request validation and throttling
  - CloudWatch logging enabled
  - Health check endpoint at `/health`

- **CloudFront Behaviors**
  - Default (`/`): Routes to S3 bucket for static content
  - API routes (`/api/*`): Routes to API Gateway
  - Custom cache policies for each origin

### 2. UserStack - Lambda Functions

Creates Lambda functions and API Gateway integrations based on `lambdas.yml`:

- **Lambda Functions**
  - Automatically created from configuration file
  - Node.js 20.x runtime
  - X-Ray tracing enabled
  - CloudWatch Logs integration
  - Configurable memory, timeout, and environment variables

- **API Gateway Integrations**
  - Automatic route creation from YAML config
  - CORS support
  - Lambda proxy integration
  - Nested resource paths supported

## Configuration

### lambdas.yml

Define your Lambda functions in `lambdas.yml` at the project root:

```yaml
lambdas:
  - name: GetUsers
    handler: handlers/users/get-users.handler
    method: GET
    path: /users
    description: Get all users
    memorySize: 256
    timeout: 30
    environment:
      LOG_LEVEL: info

  - name: CreateUser
    handler: handlers/users/create-user.handler
    method: POST
    path: /users
    description: Create a new user
    memorySize: 512
    timeout: 60
    environment:
      LOG_LEVEL: debug
      TABLE_NAME: users-table
```

#### Configuration Options

- **name** (required): Unique name for the Lambda function
- **handler** (required): Path to handler file and export (e.g., `handlers/users/get-users.handler`)
- **method** (required): HTTP method (GET, POST, PUT, DELETE, PATCH)
- **path** (required): API Gateway path (e.g., `/users`, `/users/{id}`)
- **description** (optional): Function description
- **memorySize** (optional): Memory in MB (default: 256)
- **timeout** (optional): Timeout in seconds (default: 30)
- **environment** (optional): Environment variables as key-value pairs

## Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js and npm installed
- AWS CDK CLI installed globally: `npm install -g aws-cdk`
- Lambda functions built: `npm run build:api`

## Usage

### Install Dependencies

From the project root:

```bash
npm install
```

### Bootstrap CDK (First Time Only)

Bootstrap your AWS environment for CDK:

```bash
cd apps/api/cdk
cdk bootstrap
```

Or use the npm script:

```bash
npm run cdk:bootstrap
```

### Deploy Stacks

Deploy both stacks to the default environment (dev):

```bash
npm run cdk:deploy
```

This will deploy:
1. `AwsStarterKit-Static-dev` - CloudFront, S3, API Gateway
2. `AwsStarterKit-Users-dev` - Lambda functions

Deploy to a specific environment:

```bash
cd apps/api/cdk
cdk deploy --all -c environment=prod
```

Deploy only a specific stack:

```bash
# Deploy only static infrastructure
cdk deploy AwsStarterKit-Static-dev

# Deploy only Lambda functions
cdk deploy AwsStarterKit-Users-dev
```

### View Synthesized CloudFormation

```bash
npm run cdk:synth
```

### View Differences

```bash
npm run cdk:diff
```

### Destroy Stacks

```bash
npm run cdk:destroy
```

This will destroy both stacks (prompts for confirmation).

## Environment Variables

The stacks use the following environment variables:

- `CDK_DEFAULT_ACCOUNT` or `AWS_ACCOUNT_ID`: AWS account ID
- `CDK_DEFAULT_REGION` or `AWS_REGION`: AWS region (default: us-east-1)
- `NODE_ENV`: Set automatically to environment name in Lambda functions

You can also pass environment as context:

```bash
cdk deploy --all -c environment=staging
```

## Outputs

### StaticStack Outputs

- `BucketName`: S3 bucket name for uploading web content
- `BucketArn`: S3 bucket ARN
- `ApiUrl`: Direct API Gateway URL
- `ApiId`: API Gateway ID
- `DistributionId`: CloudFront distribution ID
- `DistributionDomainName`: CloudFront domain name
- `WebsiteUrl`: Full HTTPS URL for the website
- `ApiUrlViaCdn`: API URL via CloudFront (recommended)

### UserStack Outputs

For each Lambda function defined in `lambdas.yml`:
- `<FunctionName>Arn`: Lambda function ARN

Example:
- `GetUsersArn`
- `CreateUserArn`
- `UpdateUserArn`

## Deployment Workflow

### 1. Build Lambda Functions

```bash
npm run build:api
```

This compiles TypeScript and bundles Lambda functions with esbuild.

### 2. Deploy Infrastructure

```bash
npm run cdk:deploy
```

This deploys both stacks.

### 3. Deploy Web Application

```bash
npm run deploy:web
```

This builds the React app and uploads to S3.

### 4. Invalidate CloudFront Cache

```bash
npm run invalidate:cdn
```

This forces CloudFront to fetch the latest content from S3.

### Complete Deployment

```bash
# One-liner for complete deployment
npm run build:all && npm run cdk:deploy && npm run deploy:web && npm run invalidate:cdn
```

## Adding New Lambda Functions

1. **Create handler file** in `apps/api/src/handlers/`
2. **Add to lambdas.yml**:
   ```yaml
   - name: MyNewFunction
     handler: handlers/my-new-function.handler
     method: GET
     path: /my-endpoint
     description: My new Lambda function
   ```
3. **Build and deploy**:
   ```bash
   npm run build:api
   npm run cdk:deploy
   ```

The UserStack will automatically create the Lambda function and API Gateway integration.

## Cost Considerations

- **CloudFront**: Pay-per-use (requests and data transfer)
- **S3**: Storage and request costs (minimal for static sites)
- **API Gateway**: Pay-per-million requests
- **Lambda**: Pay-per-invocation and compute time
- **CloudWatch**: Logs storage and metrics

Development environments use `DESTROY` removal policy for easy cleanup.

## Security

- S3 bucket is not publicly accessible
- CloudFront uses Origin Access Control (OAC) for S3 access
- API Gateway has throttling enabled (100 requests/sec, 200 burst)
- All traffic uses HTTPS
- CORS is configured on API Gateway
- Lambda functions have minimal IAM permissions
- X-Ray tracing enabled for Lambda functions

## Stack Dependencies

```
StaticStack (CloudFront, S3, API Gateway)
    ↓
UserStack (Lambda functions, API integrations)
```

The UserStack depends on StaticStack and cannot be deployed independently.

## Troubleshooting

### CloudFront returns 403 errors

- Ensure S3 bucket has correct OAC permissions
- Check that files are uploaded to the bucket
- Verify CloudFront error responses are configured

### API requests fail

- Check API Gateway stage name matches CloudFront origin path
- Verify Lambda functions are deployed
- Check CloudWatch logs for API Gateway and Lambda
- Ensure `dist/apps/api` contains built Lambda code

### Lambda function not found

- Ensure `npm run build:api` was run before deployment
- Check that handler path in `lambdas.yml` matches built file structure
- Verify handler export name (should be `handler`)

### CDK deployment fails

- Ensure AWS credentials are configured
- Verify CDK is bootstrapped in your account/region
- Check for resource limit issues in your AWS account
- Run `npm run build:api` before deploying

### YAML configuration errors

- Validate YAML syntax
- Ensure all required fields are present
- Check for duplicate function names or paths
- Verify handler paths match the built code

### Stack deletion fails

- Empty S3 bucket manually if auto-delete fails
- Check for resources with retention policies
- Delete stacks in reverse order (Users first, then Static)

## Testing Locally

### Test Lambda Functions

```bash
# Run unit tests
npm run test:api

# Test locally with SAM (alternative to CDK)
sam local start-api
```

### Test Infrastructure

```bash
# Synthesize and review CloudFormation
npm run cdk:synth

# Run CDK diff to see changes
npm run cdk:diff
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:all
      
      - name: Deploy CDK
        run: npm run cdk:deploy -- --require-approval never
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      
      - name: Deploy web app
        run: npm run deploy:web
```

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [S3 Documentation](https://docs.aws.amazon.com/s3/)
