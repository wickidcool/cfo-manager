# Jest + Node.js 25 Local Storage Issue

## Problem

When running tests with Jest on Node.js 25.x, you may encounter this error:

```
SecurityError: Cannot initialize local storage without a `--localstorage-file` path
```

This is due to Node.js 25's new permission model that restricts access to local storage without explicit authorization.

## Root Cause

- Node.js 25 introduced stricter security controls around localStorage
- Jest's `jest-environment-node` tries to initialize localStorage during test setup
- The permission model requires an explicit `--localstorage-file` flag, but Jest doesn't currently support passing this through its configuration

## Solutions

### Option 1: Downgrade to Node.js 22 LTS (Recommended)

```bash
# Using nvm
nvm install 22
nvm use 22

# Then run tests
npm run test:api
```

### Option 2: Wait for Jest Update

Jest is working on a fix for this issue. Monitor:
- https://github.com/jestjs/jest/issues/15619
- https://github.com/nodejs/node/issues/54374

### Option 3: Use a Custom Test Environment (Attempted)

We've tried creating a custom Jest environment but the localStorage initialization happens before we can intercept it.

## Current Status

The test files have been updated to use proper mocking:
- `apps/api/src/__tests__/services/user-service.spec.ts` - Updated with mock-based tests
- `apps/api/src/models/__mocks__/UserModel.ts` - Mock implementation created
- `apps/api/src/__tests__/setup.ts` - Test environment setup

Tests are ready to run once the Node.js version issue is resolved.

## Workaround for CI/CD

In your CI/CD pipeline, explicitly use Node.js 22:

```yaml
# Example for GitHub Actions
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

## Files Modified

1. `apps/api/jest.config.ts` - Added workarounds (not successful yet)
2. `apps/api/src/__tests__/services/user-service.spec.ts` - Updated tests with mocks
3. `apps/api/src/models/__mocks__/UserModel.ts` - Created mock
4. `apps/api/src/__tests__/setup.ts` - Test setup file

## Next Steps

1. Either downgrade to Node.js 22 LTS
2. Or wait for Jest to release a fix for Node.js 25 compatibility
3. Once resolved, run `npm run test:api` to verify all tests pass

