import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * QuickBooks credentials stored in Secrets Manager
 */
export interface QBSecrets {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  environment?: 'sandbox' | 'production';
}

// Cache for secrets to avoid repeated API calls
let cachedSecrets: QBSecrets | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const client = new SecretsManagerClient({
  region: process.env['AWS_REGION'] || 'us-east-1',
});

/**
 * Get the secret name from environment variable or use default
 */
function getSecretName(): string {
  return process.env['QB_SECRET_NAME'] || 'cfo-manager/quickbooks';
}

/**
 * Fetch QuickBooks credentials from AWS Secrets Manager
 * Results are cached for 5 minutes to reduce API calls
 */
export async function getQBSecrets(): Promise<QBSecrets> {
  const now = Date.now();

  // Return cached secrets if still valid
  if (cachedSecrets && now < cacheExpiry) {
    return cachedSecrets;
  }

  const secretName = getSecretName();

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    });

    const response = await client.send(command);

    if (!response.SecretString) {
      throw new Error(`Secret ${secretName} has no string value`);
    }

    const secrets = JSON.parse(response.SecretString) as QBSecrets;

    // Validate required fields
    if (!secrets.clientId || !secrets.clientSecret) {
      throw new Error('Secret must contain clientId and clientSecret');
    }

    // Cache the secrets
    cachedSecrets = secrets;
    cacheExpiry = now + CACHE_TTL_MS;

    console.log(`Successfully loaded QuickBooks secrets from ${secretName}`);
    return secrets;
  } catch (error) {
    console.error(`Failed to fetch secrets from ${secretName}:`, error);

    // Fall back to environment variables if secrets fetch fails
    const fallbackSecrets: QBSecrets = {
      clientId: process.env['QB_CLIENT_ID'] || '',
      clientSecret: process.env['QB_CLIENT_SECRET'] || '',
      redirectUri: process.env['QB_REDIRECT_URI'],
      environment: (process.env['QB_ENVIRONMENT'] as 'sandbox' | 'production') || 'sandbox',
    };

    if (fallbackSecrets.clientId && fallbackSecrets.clientSecret) {
      console.warn('Using environment variable fallback for QuickBooks credentials');
      return fallbackSecrets;
    }

    throw new Error(
      `Failed to get QuickBooks credentials: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Clear the cached secrets (useful for testing or forced refresh)
 */
export function clearSecretsCache(): void {
  cachedSecrets = null;
  cacheExpiry = 0;
}

