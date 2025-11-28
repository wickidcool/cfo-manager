/**
 * Mock for AWS Lambda Powertools Logger
 */

module.exports = {
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    addContext: jest.fn(),
    addPersistentLogAttributes: jest.fn(),
  })),
};

