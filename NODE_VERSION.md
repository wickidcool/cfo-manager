# Node.js Version Configuration

This project uses **Node.js 22 LTS** (v22.16.0 or higher).

## Why Node.js 22?

Node.js 25+ introduced strict permission models for localStorage that are incompatible with Jest's current implementation. Node.js 22 LTS provides:

- ✅ Stable and reliable testing environment
- ✅ Full Jest compatibility
- ✅ Long-term support (LTS) until April 2027
- ✅ Modern JavaScript features

## Setting Up Node.js 22

### Using nvm (Recommended)

```bash
# Install Node.js 22
nvm install 22

# Use Node.js 22 for this project
nvm use 22

# (Optional) Set as default
nvm alias default 22
```

The project includes a `.nvmrc` file that will automatically use Node.js 22 when you `cd` into the project directory (if you have nvm configured to auto-switch).

### Manual Installation

Download and install Node.js 22 from the official website:
https://nodejs.org/en/download/

## Verification

Check your Node.js version:

```bash
node --version
# Should output: v22.16.0 or higher
```

## CI/CD Configuration

For continuous integration, ensure your CI/CD pipeline uses Node.js 22:

### GitHub Actions
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

### GitLab CI
```yaml
image: node:22
```

### CircleCI
```yaml
docker:
  - image: cimg/node:22.16
```

## Troubleshooting

If you encounter the following error when running tests:
```
SecurityError: Cannot initialize local storage without a `--localstorage-file` path
```

This means you're using Node.js 25+. Switch to Node.js 22:
```bash
nvm use 22
```

See [JEST_NODE25_ISSUE.md](./JEST_NODE25_ISSUE.md) for more details.

## Project Requirements

The project specifies Node.js requirements in `package.json`:

```json
{
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  }
}
```

This ensures compatibility and prevents issues with incompatible Node.js versions.

