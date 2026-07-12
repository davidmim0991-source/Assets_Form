# Client Onboarding Portal

A production-ready client onboarding portal for a web agency. Clients fill out a beautiful 3-step Hebrew (RTL) form and upload their assets; the backend automatically organizes everything into your Google Drive:

```
Root Drive Folder
├── client_counter.json          <- chronological counter (managed automatically)
├── 0001 - David's Pizza
│   ├── Client Information       <- "Client Information" Google Doc + client.json
│   ├── Logos
│   ├── Images
│   ├── Videos
│   ├── Documents
│   ├── Testimonials
│   └── Brand Assets
├── 0002 - ABC Construction
│   └── ...
```

- **`client.json`** - the complete machine-readable submission (source of truth, ready for an AI Website Builder).
- **`Client Information` Google Doc** - the same data, professionally formatted for humans.
- Uploaded files are automatically routed into the correct subfolder (logo → Logos, videos → Videos, PDFs → Documents, etc.).
- Client numbering is concurrency-safe: two simultaneous submissions can never receive the same number.

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React (Vite), TypeScript, TailwindCSS v4, Framer Motion, React Hook Form |
| Backend  | Node.js, Express, TypeScript, Multer, Google Drive API, Google Docs API |
| Auth     | Google OAuth 2.0 (credentials via environment variables only) |

## Project Structure

```
├── client/                  # React frontend (Hebrew, RTL)
│   └── src/
│       ├── components/      # Form steps, dropzone, progress bar, success screen
│       ├── hooks/           # Autosave (localStorage)
│       └── lib/             # API client
└── server/                  # Express backend
    └── src/
        ├── config/          # Environment loading & validation
        ├── controllers/     # HTTP request handling & validation
        ├── middleware/      # Multer uploads, central error handler
        ├── routes/          # REST routes
        ├── services/        # Google Auth / Drive / Docs / counter / orchestration
        └── utils/           # Retry with backoff, mutex, filename sanitizing
```

## Setup

### 1. Set up Google authentication (OAuth 2.0)

The server acts as your own Google account via OAuth - all created files are owned by you and use your storage quota. (Service accounts are not supported: they have no storage quota in a personal My Drive.)

1. In the [Google Cloud Console](https://console.cloud.google.com/), create (or select) a project and enable both the **Google Drive API** and the **Google Docs API**.
2. **APIs & Services → OAuth consent screen** - configure it (External), and add your own Gmail address under **Test users**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID.** For a **Web application** client, add `http://localhost:3000/oauth2callback` under **Authorized redirect URIs**.
4. Copy the client ID and the raw `client_secret` value into `server/.env` (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`) - never paste the whole OAuth JSON file.
5. Run the one-time authorization - a browser opens, sign in with the account that owns the Drive folder, approve access, and the refresh token is saved to `.env` automatically:

```bash
cd server
npm run get-token
```

### 2. Configure the server

```bash
cd server
npm install
copy .env.example .env     # (macOS/Linux: cp .env.example .env)
```

Edit `server/.env`: set `DRIVE_ROOT_FOLDER_ID` to the Drive folder that should contain all client folders, and fill in the auth variables for your chosen mode.

Never commit `.env` or key files - both are ignored by `.gitignore`.

### 3. Configure the client

```bash
cd client
npm install
```

No `.env` needed in development - Vite proxies `/api` to the local server. For production, copy `client/.env.example` to `client/.env` and set `VITE_API_URL` to your deployed backend URL.

### 4. Run in development

Open two terminals:

```bash
# Terminal 1 - backend (http://localhost:4000)
cd server
npm run dev

# Terminal 2 - frontend (http://localhost:5173)
cd client
npm run dev
```

Visit http://localhost:5173.

### 5. Build for production

```bash
# Backend -> server/dist
cd server && npm run build && npm start

# Frontend -> client/dist (deploy to any static host)
cd client && npm run build
```

When deploying, set `ALLOWED_ORIGIN` on the server to your frontend's URL, and `VITE_API_URL` on the client to the backend's URL.

## API

### `POST /api/submissions`

`multipart/form-data`:

| Part | Type | Description |
|------|------|-------------|
| `data` | JSON string | All form fields (businessName, email, phone, socials, branding, notes...) |
| `logo`, `testimonials`, `images`, `videos`, `documents` | files | Uploaded assets, routed by field name |

Response `201`:

```json
{
  "success": true,
  "clientNumber": "0001",
  "folderName": "0001 - David's Pizza",
  "folderLink": "https://drive.google.com/drive/folders/...",
  "uploadedFiles": 12
}
```

### `GET /api/health`

Health check, returns `{ "status": "ok" }`.

## Key Behaviors

- **Chronological numbering** - `client_counter.json` in the root folder stores the last assigned number. It is created automatically on the first submission. All increments run through a FIFO mutex, so concurrent submissions always get unique, increasing numbers.
- **Automatic retries** - every Google API call retries up to 4 times with exponential backoff on rate limits, network errors, and 5xx responses.
- **Security** - Helmet headers, CORS allow-list, filename sanitization (path traversal safe), executable file types blocked, 100MB per-file limit, files staged on disk (not RAM), temp files always cleaned up.
- **Autosave** - the form is saved to localStorage as the client types, so they can leave and come back without losing text (files must be re-selected).
- **Friendly Hebrew validation** - email, phone, and required fields are validated on the client with friendly Hebrew messages, and re-validated on the server.
