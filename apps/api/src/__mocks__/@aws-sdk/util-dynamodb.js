/**
 * Mock for AWS SDK DynamoDB Util
 */

module.exports = {
  marshall: jest.fn((obj) => obj),
  unmarshall: jest.fn((obj) => obj),
};

