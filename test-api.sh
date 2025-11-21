#!/bin/bash

# Test API endpoints and show what's being returned

CLOUDFRONT_URL="https://d2dg4o035tbuxs.cloudfront.net"

echo "========================================"
echo "Testing CloudFront API"
echo "========================================"
echo ""

echo "1️⃣ Testing Health Check: ${CLOUDFRONT_URL}/api/health"
echo "---"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nCONTENT_TYPE:%{content_type}" "${CLOUDFRONT_URL}/api/health")
echo "$HEALTH_RESPONSE"
echo ""
echo ""

echo "2️⃣ Testing Get Users: ${CLOUDFRONT_URL}/api/users"
echo "---"
USERS_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}\nCONTENT_TYPE:%{content_type}" "${CLOUDFRONT_URL}/api/users")
echo "$USERS_RESPONSE"
echo ""
echo ""

echo "3️⃣ Checking Response Headers"
echo "---"
curl -I "${CLOUDFRONT_URL}/api/users" 2>&1 | grep -E "HTTP|Content-Type|x-cache|x-amz-cf"
echo ""

echo "========================================"
echo "Analysis"
echo "========================================"
echo ""

# Check if response contains HTML
if echo "$USERS_RESPONSE" | grep -qi "<!DOCTYPE\|<html"; then
    echo "❌ ISSUE: Getting HTML instead of JSON"
    echo ""
    echo "This means CloudFront is routing to S3 instead of API Gateway."
    echo ""
    echo "Possible causes:"
    echo "1. CDK stack not deployed with new /api prefix"
    echo "2. CloudFront cache still has old routing"
    echo "3. API Gateway routes not created"
    echo ""
    echo "Solutions:"
    echo "  npm run cdk:deploy          # Deploy with updated routes"
    echo "  npm run invalidate:cdn      # Clear CloudFront cache"
    echo ""
elif echo "$USERS_RESPONSE" | grep -q "HTTP_STATUS:2"; then
    echo "✅ API is working!"
    echo ""
    if echo "$USERS_RESPONSE" | grep -q '"success"'; then
        echo "✅ Getting valid JSON response"
    else
        echo "⚠️  Response is 200 but not expected JSON format"
    fi
elif echo "$USERS_RESPONSE" | grep -q "HTTP_STATUS:403\|HTTP_STATUS:404"; then
    echo "❌ ISSUE: Getting 403/404 error"
    echo ""
    echo "This means API Gateway can't find the route."
    echo ""
    echo "Check:"
    echo "1. Lambda paths in lambdas.yml include /api prefix"
    echo "2. CDK stack deployed: npm run cdk:deploy"
    echo "3. Wait 5-10 minutes after deployment"
else
    echo "❌ Unexpected response"
    echo ""
    echo "Run these commands to diagnose:"
    echo "  aws lambda list-functions --query 'Functions[?starts_with(FunctionName, \`dev-\`)].FunctionName'"
    echo "  aws cloudformation describe-stacks --stack-name AwsStarterKit-Static-dev"
fi
echo ""

