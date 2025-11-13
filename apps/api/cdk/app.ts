#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StaticStack } from './static-stack';
import { UserStack } from './user-stack';

const appName = 'AwsStarterKit';

/**
 * AWS CDK App for AWS Starter Kit
 *
 * This app creates the infrastructure for the AWS Starter Kit including:
 * - S3 bucket for static web content
 * - API Gateway for Lambda functions
 * - CloudFront distribution with both S3 and API Gateway origins
 * - Lambda functions with API Gateway integrations (from lambdas.yml)
 */
const app = new cdk.App();

// Get environment from context or default to 'dev'
const environmentName = app.node.tryGetContext('environment') || 'dev';

// Get AWS account and region from environment or use defaults
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1',
};

// Common tags for all resources
const tags = {
  Project: 'AWS Starter Kit',
  Environment: environmentName,
  ManagedBy: 'CDK',
};

// Create the static stack (CloudFront, S3, API Gateway)
const staticStack = new StaticStack(app, `${appName}-Static-${environmentName}`, {
  env,
  environmentName,
  description: `AWS Starter Kit static infrastructure for ${environmentName} environment`,
  tags,
});

// Create the user stack (Lambda functions from lambdas.yml)
// Note: UserStack automatically depends on StaticStack because it uses staticStack.api
const userStack = new UserStack(app, `${appName}-Users-${environmentName}`, {
  env,
  environmentName,
  api: staticStack.api,
  description: `AWS Starter Kit user Lambda functions for ${environmentName} environment`,
  tags,
});

