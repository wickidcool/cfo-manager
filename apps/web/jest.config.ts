export default {
  displayName: 'web',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  moduleNameMapper: {
    '^\\.\\./config/api$': '<rootDir>/src/__mocks__/config/api.ts',
    '^\\.\\./\\.\\./config/api$': '<rootDir>/src/__mocks__/config/api.ts',
    '^\\.\\./src/config/api$': '<rootDir>/src/__mocks__/config/api.ts',
    '^./config/api$': '<rootDir>/src/__mocks__/config/api.ts',
    '^@aws-starter-kit/common-types$': '<rootDir>/../../packages/common-types/src/index.ts',
    '^@aws-starter-kit/api-client$': '<rootDir>/../../packages/api-client/src/index.ts',
  },
};

