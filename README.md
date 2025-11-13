# AWS Starter Kit

A production-ready Nx monorepo with React web client, AWS Lambda API, and shared TypeScript types.

## 🚀 Features

- **Nx Monorepo** - Efficient workspace management with caching and task orchestration
- **React Web Client** - Modern React 18 app with Vite for fast development
- **Chakra UI** - Beautiful, accessible component library with dark mode
- **Zustand** - Lightweight state management solution
- **Jest Testing** - Comprehensive testing setup with React Testing Library
- **AWS Lambda API** - Serverless backend with TypeScript Lambda handlers
- **Shared Types** - Common TypeScript types shared across frontend and backend
- **Type Safety** - End-to-end type safety from API to UI
- **Ready for Production** - Includes SAM template for AWS deployment

## 📁 Project Structure

```
aws-starter-kit/
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── App.tsx        # Main React component
│   │   │   ├── main.tsx       # Application entry point
│   │   │   └── styles.css     # Global styles
│   │   ├── index.html         # HTML template
│   │   ├── vite.config.ts     # Vite configuration
│   │   ├── tsconfig.json      # TypeScript config
│   │   └── project.json       # Nx project config
│   │
│   └── api/                    # AWS Lambda API
│       ├── src/
│       │   ├── handlers/
│       │   │   └── users.ts   # User CRUD handlers
│       │   └── utils/
│       │       ├── response.ts # Response helpers
│       │       └── validator.ts # Request validation
│       ├── tsconfig.json      # TypeScript config
│       ├── project.json       # Nx project config
│       └── README.md          # API documentation
│
├── packages/
│   └── common-types/          # Shared TypeScript types
│       ├── src/
│       │   └── index.ts       # Type definitions
│       ├── tsconfig.json
│       ├── project.json
│       └── README.md
│
├── template.yaml              # AWS SAM deployment template
├── nx.json                    # Nx workspace configuration
├── tsconfig.base.json         # Base TypeScript configuration
└── package.json               # Root package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- AWS CLI (for deployment)
- AWS SAM CLI (optional, for local Lambda testing)

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

## 📦 Shared Types

The `@aws-starter-kit/common-types` package provides shared TypeScript types used across the monorepo:

```typescript
import { User, ApiResponse, HTTP_STATUS } from '@aws-starter-kit/common-types';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date().toISOString()
};
```

### Available Types

- **User Types**: `User`, `CreateUserRequest`, `UpdateUserRequest`
- **API Types**: `ApiResponse<T>`, `ApiError`
- **Lambda Types**: `ApiGatewayProxyEvent`, `ApiGatewayProxyResult`, `LambdaContext`
- **Constants**: `HTTP_STATUS`, `ERROR_CODES`

## 🚀 Deployment

### Deploy to AWS with SAM

1. Build the project:
```bash
npm run build:api
```

2. Deploy with SAM:
```bash
sam build
sam deploy --guided
```

3. Follow the prompts to configure your deployment:
   - Stack Name: `aws-starter-kit`
   - AWS Region: Your preferred region
   - Confirm changes before deploy: Y
   - Allow SAM CLI IAM role creation: Y

4. After deployment, note the API URL in the outputs.

### Deploy Web Client

You can deploy the web client to various platforms:

**AWS S3 + CloudFront:**
```bash
npm run build:web
aws s3 sync dist/apps/web s3://your-bucket-name
```

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

1. Create a new file in `apps/api/src/handlers/`
2. Add the handler configuration to `template.yaml`
3. Update the build configuration in `apps/api/project.json`

## 📚 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Chakra UI 2, Zustand
- **Testing**: Jest, React Testing Library, @testing-library/jest-dom
- **Backend**: AWS Lambda, Node.js 20, TypeScript
- **Validation**: AJV (JSON Schema validator) with ajv-formats
- **Monorepo**: Nx
- **Build Tools**: Vite (web), esbuild (Lambda)
- **Deployment**: AWS SAM, CloudFormation
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