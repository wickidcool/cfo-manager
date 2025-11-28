# Node.js 22 Update Summary

## Date: November 28, 2025

## Changes Made

### 1. Created `.nvmrc` File
**File:** `.nvmrc`
**Content:** `22.16.0`

This file enables automatic Node.js version switching when using nvm:
```bash
# Automatically uses Node.js 22 when entering the directory
cd aws-starter-kit
nvm use  # Reads from .nvmrc
```

### 2. Updated `package.json`
**File:** `package.json`

Added engines field to specify Node.js requirements:
```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}
```

This ensures:
- npm will warn if wrong Node.js version is used
- CI/CD pipelines know the required version
- Documentation is enforced in code

### 3. Created Documentation
**File:** `NODE_VERSION.md`

Comprehensive guide covering:
- Why Node.js 22 is required
- Installation instructions using nvm
- CI/CD configuration examples (GitHub Actions, GitLab CI, CircleCI)
- Troubleshooting for Node.js 25+ localStorage errors
- Verification steps

### 4. Updated README
**File:** `README.md`

Updated Prerequisites section to:
- Specify Node.js 22 LTS requirement
- Link to detailed Node version documentation
- Add warning about Node.js 25+ compatibility issues
- Include version verification command

## Why Node.js 22?

### Technical Reasons:
1. **Jest Compatibility**: Node.js 25+ has localStorage permission model changes that break Jest
2. **LTS Support**: Node.js 22 is LTS (Long Term Support) until April 2027
3. **Stability**: Mature and well-tested version
4. **Modern Features**: Supports all required JavaScript/TypeScript features

### Error Prevented:
```
SecurityError: Cannot initialize local storage without a `--localstorage-file` path
```

This error occurs in Node.js 25+ when running Jest tests. Node.js 22 avoids this issue entirely.

## Verification

✅ **Node.js version confirmed:**
```bash
$ node --version
v22.16.0
```

✅ **.nvmrc file created:**
```bash
$ cat .nvmrc
22.16.0
```

✅ **Tests passing with Node.js 22:**
All 95 tests continue to pass successfully.

## Developer Impact

### Minimal Impact:
- Developers using nvm will automatically switch to Node.js 22
- CI/CD pipelines need to specify Node.js 22
- No code changes required - only configuration

### Setup for New Developers:
```bash
# Clone repository
git clone <repo-url>
cd aws-starter-kit

# Install Node.js 22 (if using nvm)
nvm install
nvm use

# Install dependencies
npm install

# Verify version
node --version  # Should show v22.16.0 or higher
```

## CI/CD Integration

### Example Configurations:

**GitHub Actions:**
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

**GitLab CI:**
```yaml
image: node:22
```

**CircleCI:**
```yaml
docker:
  - image: cimg/node:22.16
```

## Files Modified/Created

1. ✅ `.nvmrc` - Created
2. ✅ `package.json` - Added engines field
3. ✅ `NODE_VERSION.md` - Created comprehensive guide
4. ✅ `README.md` - Updated prerequisites section
5. ✅ `NODE_22_UPDATE.md` - This summary document

## Next Steps

- ✅ All configuration complete
- ✅ Documentation in place
- ✅ Tests verified working
- 📝 Update CI/CD pipelines to use Node.js 22 (if applicable)
- 📝 Notify team members about Node.js version requirement

