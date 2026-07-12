import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { config } from '../config/env';

/** Error with an attached HTTP status, thrown by controllers. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Central error handler - converts every failure into a meaningful,
 * consistent JSON response and logs the details server-side.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File exceeds the maximum upload size of ${config.maxUploadMb}MB`
        : `Upload error: ${err.message}`;
    res.status(413).json({ success: false, error: message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ success: false, error: err.message });
    return;
  }

  console.error('[error] Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Something went wrong while processing the submission. Please try again.',
  });
}
