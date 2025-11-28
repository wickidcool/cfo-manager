/**
 * Mock for AWS SDK DynamoDB Client
 */

module.exports = {
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
    config: {},
  })),
  GetItemCommand: jest.fn(),
  PutItemCommand: jest.fn(),
  UpdateItemCommand: jest.fn(),
  DeleteItemCommand: jest.fn(),
  ScanCommand: jest.fn(),
  QueryCommand: jest.fn(),
  BatchWriteItemCommand: jest.fn(),
  BatchGetItemCommand: jest.fn(),
};

