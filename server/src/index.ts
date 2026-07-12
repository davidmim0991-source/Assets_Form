import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { verifyGoogleAuth } from './services/googleAuth';
import submissionRoutes from './routes/submission.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.allowedOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', submissionRoutes);
app.use(errorHandler);

async function start() {
  // Fail fast if Google credentials are misconfigured.
  await verifyGoogleAuth();

  app.listen(config.port, () => {
    console.log(`[server] Onboarding API listening on http://localhost:${config.port}`);
    console.log(`[server] Allowed origin(s): ${config.allowedOrigin}`);
    console.log(`[server] Drive root folder: ${config.driveRootFolderId}`);
  });
}

start().catch((err) => {
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
