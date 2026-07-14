import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

/**
 * Central, validated environment configuration.
 * Secrets are ONLY read from environment variables - never hardcoded.
 *
 * Google authentication uses OAuth 2.0: the server acts as the agency
 * owner's Google account via a stored refresh token, so all created files
 * are owned by that account and use its storage quota.
 */
export interface GoogleOAuthCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

function required(name: string, hint?: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable "${name}".${hint ? ` ${hint}` : ''} See .env.example for setup instructions.`
    );
  }
  return value.trim();
}

function resolveGoogleOAuth(): GoogleOAuthCredentials {
  return {
    clientId: required('GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: required('GOOGLE_OAUTH_CLIENT_SECRET'),
    refreshToken: required(
      'GOOGLE_OAUTH_REFRESH_TOKEN',
      'Run "npm run get-token" once to authorize your Google account and save the refresh token.'
    ),
  };
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  driveRootFolderId: required('DRIVE_ROOT_FOLDER_ID'),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '500', 10),
  /**
   * Local file holding the selectable color palettes (.docx, .txt or .css
   * with coolors.co CSS exports). Defaults to "Color Combinations.docx" in
   * the project root. Set COLOR_PALETTES_FILE to override, or to an empty
   * value with the file removed to disable the palette step.
   */
  colorPalettesFile:
    process.env.COLOR_PALETTES_FILE?.trim() ||
    path.resolve(__dirname, '..', '..', '..', 'Color Combinations.docx'),
  googleOAuth: resolveGoogleOAuth(),
} as const;
