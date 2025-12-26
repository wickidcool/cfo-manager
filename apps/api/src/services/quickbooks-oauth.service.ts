import type {
  QBTokens,
  QBConnectionStatus,
  QBEnvironment,
  QBAuthStartResponse,
} from '@aws-starter-kit/common-types';
import { getQBSecrets, type QBSecrets } from '../utils/secrets';


const OAuthClient = require('intuit-oauth');

/**
 * QuickBooks OAuth Service
 * Handles OAuth 2.0 authentication flow with Intuit QuickBooks
 *
 * Credentials are fetched from AWS Secrets Manager for security.
 * Falls back to environment variables if secrets are not available.
 */
export class QuickBooksOAuthService {
  /**
   * Get the redirect URI from secrets or environment
   */
  private getRedirectUri(secrets?: QBSecrets): string {
    return secrets?.redirectUri || process.env['QB_REDIRECT_URI'] || '';
  }

  /**
   * Get the environment from secrets or environment variable
   */
  private getEnvironment(secrets?: QBSecrets): QBEnvironment {
    return secrets?.environment ||
      (process.env['QB_ENVIRONMENT'] as QBEnvironment) ||
      'sandbox';
  }

  /**
   * Create a new OAuth client instance with secrets from Secrets Manager
   */
  private async createOAuthClient(): Promise<typeof OAuthClient> {
    const secrets = await getQBSecrets();

    return new OAuthClient({
      clientId: secrets.clientId,
      clientSecret: secrets.clientSecret,
      environment: this.getEnvironment(secrets),
      redirectUri: this.getRedirectUri(secrets),
    });
  }

  /**
   * Generate the authorization URL for OAuth flow
   */
  async getAuthorizationUrl(state: string): Promise<QBAuthStartResponse> {
    const oauthClient = await this.createOAuthClient();

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
      state,
    });

    return {
      authorizationUrl: authUri,
      state,
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(
    authorizationCode: string,
    realmId: string
  ): Promise<QBTokens> {
    const oauthClient = await this.createOAuthClient();

    try {
      const authResponse = await oauthClient.createToken(authorizationCode);
      const tokenData = authResponse.getJson();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        refreshTokenExpiresIn: tokenData.x_refresh_token_expires_in,
        realmId,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string, realmId: string): Promise<QBTokens> {
    const oauthClient = await this.createOAuthClient();

    try {
      oauthClient.setToken({
        refresh_token: refreshToken,
        realmId,
      });

      const authResponse = await oauthClient.refresh();
      const tokenData = authResponse.getJson();

      return {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        refreshTokenExpiresIn: tokenData.x_refresh_token_expires_in,
        realmId,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Revoke tokens (disconnect from QuickBooks)
   */
  async revokeTokens(accessToken: string, refreshToken: string): Promise<void> {
    const oauthClient = await this.createOAuthClient();

    try {
      oauthClient.setToken({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      await oauthClient.revoke();
    } catch (error) {
      console.error('Error revoking tokens:', error);
      throw new Error('Failed to revoke tokens');
    }
  }

  /**
   * Check if tokens are expired
   */
  isTokenExpired(tokens: QBTokens): boolean {
    const createdAt = new Date(tokens.createdAt).getTime();
    const expiresAt = createdAt + tokens.expiresIn * 1000;
    const now = Date.now();

    // Add 5 minute buffer
    return now >= expiresAt - 5 * 60 * 1000;
  }

  /**
   * Check if refresh token is expired
   */
  isRefreshTokenExpired(tokens: QBTokens): boolean {
    const createdAt = new Date(tokens.createdAt).getTime();
    const expiresAt = createdAt + tokens.refreshTokenExpiresIn * 1000;
    const now = Date.now();

    // Add 1 day buffer
    return now >= expiresAt - 24 * 60 * 60 * 1000;
  }

  /**
   * Get connection status from tokens
   */
  getConnectionStatus(tokens: QBTokens | null): QBConnectionStatus {
    if (!tokens) {
      return { connected: false };
    }

    const createdAt = new Date(tokens.createdAt).getTime();
    const accessExpiresAt = new Date(createdAt + tokens.expiresIn * 1000);
    const refreshExpiresAt = new Date(
      createdAt + tokens.refreshTokenExpiresIn * 1000
    );

    return {
      connected: !this.isRefreshTokenExpired(tokens),
      realmId: tokens.realmId,
      expiresAt: accessExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  /**
   * Get the API base URL for the current environment
   */
  async getApiBaseUrl(): Promise<string> {
    const secrets = await getQBSecrets();
    const environment = this.getEnvironment(secrets);

    return environment === 'production'
      ? 'https://quickbooks.api.intuit.com'
      : 'https://sandbox-quickbooks.api.intuit.com';
  }
}

// Export singleton instance
export const quickBooksOAuthService = new QuickBooksOAuthService();
