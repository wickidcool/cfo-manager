/**
 * Custom Jest Node Environment without localStorage
 * Workaround for Node.js 25+ permission model localStorage error
 */

const NodeEnvironment = require('jest-environment-node').TestEnvironment;
const os = require('os');
const path = require('path');

class CustomNodeEnvironment extends NodeEnvironment {
  constructor(config, context) {
    // Provide a localStorage file path to avoid the permission error
    const localStoragePath = path.join(os.tmpdir(), 'jest-localstorage');
    
    // Merge the localStorage path into the config
    const configWithStorage = {
      ...config,
      testEnvironmentOptions: {
        ...(config.testEnvironmentOptions || {}),
        localStorageFile: localStoragePath,
      },
    };
    
    super(configWithStorage, context);
  }
  
  async setup() {
    await super.setup();
  }
  
  async teardown() {
    await super.teardown();
  }
}

module.exports = CustomNodeEnvironment;

