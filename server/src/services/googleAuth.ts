import { google } from 'googleapis';
import { config } from '../config/env';

/**
 * Google OAuth 2.0 authentication.
 * The server acts as the agency owner's Google account using the refresh
 * token obtained once via "npm run get-token". Access tokens are refreshed
 * automatically by the client library.
 * Credentials come exclusively from environment variables.
 */
const auth = new google.auth.OAuth2(
  config.googleOAuth.clientId,
  config.googleOAuth.clientSecret
);
auth.setCredentials({ refresh_token: config.googleOAuth.refreshToken });

export const drive = google.drive({ version: 'v3', auth });
export const docs = google.docs({ version: 'v1', auth });

/** Verifies credentials on boot so misconfiguration fails fast and loudly. */
export async function verifyGoogleAuth(): Promise<void> {
  // Forces a refresh-token exchange; throws if the token is invalid or revoked.
  await auth.getAccessToken();
  console.log('[google] Authenticated via OAuth (acting as the authorized Google account)');
}
