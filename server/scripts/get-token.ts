/**
 * One-time OAuth authorization helper.
 *
 * Usage:
 *   1. Put GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in server/.env
 *      (create a "Desktop app" OAuth client in Google Cloud Console).
 *   2. Run: npm run get-token
 *   3. A browser opens - sign in with the Google account that owns the Drive
 *      folder and approve access.
 *   4. The refresh token is saved into server/.env automatically.
 */
import dotenv from 'dotenv';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { google } from 'googleapis';

dotenv.config();

// Must exactly match an Authorized redirect URI registered on the OAuth client.
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/documents',
];
const ENV_PATH = path.join(__dirname, '..', '.env');

function fail(message: string): never {
  console.error(`\n[error] ${message}`);
  process.exit(1);
}

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
if (!clientId || !clientSecret) {
  fail(
    'GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in server/.env first.\n' +
      'Create them in Google Cloud Console -> APIs & Services -> Credentials -> ' +
      'Create credentials -> OAuth client ID -> Application type: Desktop app.'
  );
}

const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2.generateAuthUrl({
  access_type: 'offline', // required to receive a refresh token
  prompt: 'consent', // force a refresh token even if previously authorized
  scope: SCOPES,
});

/** Writes/replaces GOOGLE_OAUTH_REFRESH_TOKEN in the .env file. */
function saveRefreshToken(token: string): void {
  let env = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
  if (/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m.test(env)) {
    env = env.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, `GOOGLE_OAUTH_REFRESH_TOKEN=${token}`);
  } else {
    env = `${env.trimEnd()}\nGOOGLE_OAUTH_REFRESH_TOKEN=${token}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', REDIRECT_URI);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.end('Authorization was denied. You can close this tab.');
    server.close();
    fail(`Authorization denied: ${error}`);
  }
  if (!code) {
    res.end('Waiting for authorization...');
    return;
  }

  try {
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('Google did not return a refresh token. Try again.');
    }
    saveRefreshToken(tokens.refresh_token);
    res.end('Authorization successful! You can close this tab and return to the terminal.');
    console.log('\n[success] Refresh token saved to server/.env');
    console.log('[success] You can now start the server with: npm run dev');
  } catch (err) {
    res.end('Token exchange failed - check the terminal.');
    console.error('\n[error] Token exchange failed:', (err as Error).message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Opening your browser for Google authorization...');
  console.log('If it does not open automatically, visit this URL:\n');
  console.log(authUrl + '\n');
  // Windows-friendly browser open (also handles macOS/Linux).
  const opener =
    process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${opener} "${authUrl.replace(/"/g, '%22')}"`);
});
