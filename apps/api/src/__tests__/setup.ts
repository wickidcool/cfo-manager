/**
 * Jest Setup File
 * Configure test environment globals and mocks
 */

// Set test environment variables FIRST
process.env['DYNAMODB_TABLE'] = 'test-table';
process.env['AWS_REGION'] = 'us-east-1';
process.env['SERVICE_NAME'] = 'test-service';
process.env['LOG_LEVEL'] = 'ERROR'; // Reduce noise in tests
process.env['NODE_ENV'] = 'test';

