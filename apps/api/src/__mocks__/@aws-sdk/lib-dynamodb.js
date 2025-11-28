/**
 * Mock for AWS SDK DynamoDB Lib
 */

module.exports = {
  DynamoDBDocumentClient: {
    from: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({}),
    })),
  },
  GetCommand: jest.fn(),
  PutCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
  ScanCommand: jest.fn(),
  QueryCommand: jest.fn(),
  BatchWriteCommand: jest.fn(),
  BatchGetCommand: jest.fn(),
};

