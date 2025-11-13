# AWS Starter Kit

A production-ready Nx monorepo with React web client, AWS Lambda API, and shared TypeScript types.

## 🚀 Features

- **Nx Monorepo** - Efficient workspace management with caching and task orchestration
- **React Web Client** - Modern React 18 app with Vite for fast development
- **Chakra UI** - Beautiful, accessible component library with dark mode
- **Zustand** - Lightweight state management solution
- **Jest Testing** - Comprehensive testing setup with React Testing Library
- **AWS Lambda API** - Serverless backend with TypeScript Lambda handlers
- **AWS CDK Infrastructure** - Infrastructure as Code for CloudFront, API Gateway, and S3
- **Shared Types** - Common TypeScript types shared across frontend and backend
- **Type Safety** - End-to-end type safety from API to UI
- **Ready for Production** - Complete CDK infrastructure with configuration-driven Lambda deployment

## 📁 Project Structure

```
aws-starter-kit/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── App.tsx        # Main React component
│   │   │   ├── main.tsx       # Application entry point
│   │   │   ├── store/         # Zustand state management
│   │   │   └── theme/         # Chakra UI theme
│   │   ├── index.html         # HTML template
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── project.json       # Nx project config
│   │
│   └── api/                    # AWS Lambda API
│       ├── src/
│       │   ├── handlers/
│       │   │   └── users/     # User CRUD handlers
│       │   ├── services/      # Business logic layer
│       │   ├── schemas/       # JSON schemas for validation
│       │   └── utils/
│       │       ├── response.ts      # Response helpers
│       │       ├── validator.ts     # AJV validation
│       │       └── lambda-handler.ts # Common handler wrapper
│       ├── cdk/               # AWS CDK infrastructure
│       │   ├── app.ts         # CDK app entry point
│       │   ├── static-stack.ts # CloudFront + API Gateway + S3
│       │   ├── user-stack.ts  # Lambda functions (from lambdas.yml)
│       │   ├── cdk.json       # CDK configuration
│       │   └── README.md      # Infrastructure docs
│       ├── tsconfig.json      # TypeScript config
│       ├── project.json       # Nx project config
│       └── README.md          # API documentation
│
├── packages/
│   ├── common-types/          # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts       # Type definitions
│   │   ├── tsconfig.json
│   │   ├── project.json
│   │   └── README.md
│   └── api-client/            # Type-safe API client (Axios)
│       ├── src/
│       │   ├── api-client.ts  # API client implementation
│       │   └── index.ts       # Package exports
│       ├── tsconfig.json
│       ├── project.json
│       └── README.md
│
├── lambdas.yml                # Lambda function configurations (for CDK)
├── nx.json                    # Nx workspace configuration
├── tsconfig.base.json         # Base TypeScript configuration
└── package.json               # Root package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- AWS CLI (for deployment)
- AWS CDK CLI (installed globally or via npx)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wickidcool/aws-starter-kit.git
cd aws-starter-kit
```

2. Install dependencies:
```bash
npm install
```

## 🏃 Development

### Run the Web Client

```bash
npm run web
```

The web app will be available at `http://localhost:3000`

### Build All Projects

```bash
npm run build:all
```

### Build Specific Projects

```bash
# Build web client
npm run build:web

# Build API
npm run build:api
```

### Run Tests

```bash
# Run all tests
npm test

# Run web app tests only
npm run test:web

# Run API tests only
npm run test:api

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Lint All Projects

```bash
npm run lint
```

### View Dependency Graph

```bash
npm run graph
```

## 📦 Shared Packages

### Common Types (`@aws-starter-kit/common-types`)

Shared TypeScript types used across the monorepo:

```typescript
import { User, ApiResponse, HTTP_STATUS } from '@aws-starter-kit/common-types';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date().toISOString()
};
```

**Available Types:**
- **User Types**: `User`, `CreateUserRequest`, `UpdateUserRequest`
- **API Types**: `ApiResponse<T>`, `ApiError`
- **Lambda Types**: `ApiGatewayProxyEvent`, `ApiGatewayProxyResult`, `LambdaContext`
- **Constants**: `HTTP_STATUS`, `ERROR_CODES`

### API Client (`@aws-starter-kit/api-client`)

Type-safe API client using Axios for backend communication:

```typescript
import { createApiClient } from '@aws-starter-kit/api-client';

// Create client
const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
});

// Fetch users
const users = await apiClient.getUsers();

// Create user
const newUser = await apiClient.createUser({
  email: 'new@example.com',
  name: 'New User',
});

// Set auth token
apiClient.setAuthToken('your-jwt-token');
```

**Available Methods:**
- `getUsers()` - Fetch all users
- `getUser(id)` - Fetch user by ID
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update existing user
- `deleteUser(id)` - Delete user
- `setAuthToken(token)` - Set authorization token
- `clearAuthToken()` - Clear authorization token

See [`packages/api-client/README.md`](packages/api-client/README.md) for detailed documentation.

## 🚀 Deployment

### Option 1: Deploy with AWS CDK (Recommended)

AWS CDK provides a complete infrastructure stack including CloudFront, API Gateway, S3, and Lambda functions.

#### Lambda Configuration

Lambda functions are defined in `lambdas.yml` at the project root:

```yaml
lambdas:
  - name: GetUsers
    handler: handlers/users/get-users.handler
    method: GET
    path: /users
    description: Get all users
    memorySize: 256
    timeout: 30
```

The CDK will automatically create Lambda functions and API Gateway integrations based on this configuration.

#### Deployment Steps

1. **Bootstrap CDK** (first time only):
```bash
npm run cdk:bootstrap
```

2. **Build Lambda functions**:
```bash
npm run build:api
```

3. **Deploy the infrastructure**:
```bash
npm run cdk:deploy
```

This creates two stacks:
- **StaticStack**: CloudFront distribution, S3 bucket, API Gateway
- **UserStack**: Lambda functions and API integrations (from `lambdas.yml`)

3. **Deploy the web app**:
```bash
npm run deploy:web
```

4. **Invalidate CloudFront cache** (if needed):
```bash
npm run invalidate:cdn
```

5. **Access your application**:
The CDK outputs will provide URLs for:
- `WebsiteUrl`: Your application (via CloudFront)
- `ApiUrlViaCdn`: API endpoint (via CloudFront `/api`)

**CDK Commands:**
```bash
# View infrastructure changes
npm run cdk:diff

# Deploy to production environment
npm run cdk:deploy:prod

# Destroy infrastructure (use with caution)
npm run cdk:destroy

# View synthesized CloudFormation template
npm run cdk:synth
```

See [`apps/api/cdk/README.md`](apps/api/cdk/README.md) for detailed CDK documentation.

### Alternative: Deploy Web Client to Other Platforms

If you prefer not to use S3/CloudFront, you can deploy the web client to other platforms:

**Vercel:**
```bash
cd apps/web
vercel deploy
```

**Netlify:**
```bash
cd apps/web
netlify deploy
```

## 🔧 API Endpoints

The Lambda API provides the following endpoints:

- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Example Requests

**Create User:**
```bash
curl -X POST https://your-api-url/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

**Get Users:**
```bash
curl https://your-api-url/users
```

## 🏗️ Adding New Features

### Add a New Library

```bash
npx nx g @nx/js:library my-lib --directory=packages/my-lib
```

### Add a New Application

```bash
npx nx g @nx/react:app my-app --directory=apps/my-app
```

### Add a New Lambda Handler

1. Create a new handler file in `apps/api/src/handlers/`
2. Add the configuration to `lambdas.yml`:
   ```yaml
   - name: MyNewFunction
     handler: handlers/my-new-function.handler
     method: GET
     path: /my-endpoint
     memorySize: 256
     timeout: 30
   ```
3. Build and deploy:
   ```bash
   npm run build:api
   npm run cdk:deploy
   ```

## 📚 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Chakra UI 2, Zustand
- **Testing**: Jest, React Testing Library, @testing-library/jest-dom
- **Backend**: AWS Lambda, Node.js 20, TypeScript
- **Validation**: AJV (JSON Schema validator) with ajv-formats
- **Infrastructure**: AWS CDK, CloudFormation
- **CDN & Hosting**: CloudFront, API Gateway, S3
- **Monorepo**: Nx
- **Build Tools**: Vite (web), esbuild (Lambda)
- **Deployment**: AWS CDK (Infrastructure as Code)
- **Type System**: TypeScript 5.9+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📝 License

ISC

## 🔗 Useful Links

- [Nx Documentation](https://nx.dev)
- [React Documentation](https://react.dev)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 💡 Tips

- Use `nx affected:build` to build only affected projects
- Use `nx affected:test` to test only affected projects
- The Nx cache speeds up subsequent builds
- Leverage the shared types to maintain consistency across frontend and backend
- Configure environment variables for different deployment stages

## 🐛 Troubleshooting

**Issue**: Build fails for the API
- **Solution**: Make sure all dependencies are installed and the common-types package is built

**Issue**: Web app can't find types
- **Solution**: Check that the path mapping in `tsconfig.base.json` is correct

**Issue**: SAM deployment fails
- **Solution**: Ensure AWS credentials are configured and you have necessary permissions
