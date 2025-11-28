/**
 * Mock for UserDynamoModel
 * Used in tests to avoid DynamoDB dependencies
 */

export class UserDynamoModel {
  scanAll = jest.fn();
  getById = jest.fn();
  getByEmail = jest.fn();
  create = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  batchDelete = jest.fn();
  getByCreatedAfter = jest.fn();
  toUserType = jest.fn();
}

export interface UserModel {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  pk1?: string;
  sk1?: string;
  pk2?: string;
  sk2?: string;
  pk3?: string;
  sk3?: string;
  pk4?: string;
  sk4?: string;
  pk5?: string;
  sk5?: string;
  pk6?: string;
  sk6?: string;
}

// This file is only used in test environments where jest is available
declare const jest: any;

