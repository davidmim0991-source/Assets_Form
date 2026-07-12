/**
 * Retry helper with exponential backoff + jitter.
 * Used for every Google API call so transient failures (rate limits,
 * network blips, 5xx errors) are retried automatically.
 */

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  label?: string;
}

function getStatusCode(err: unknown): number | undefined {
  const anyErr = err as { code?: number | string; response?: { status?: number } };
  if (typeof anyErr?.response?.status === 'number') return anyErr.response.status;
  if (typeof anyErr?.code === 'number') return anyErr.code;
  return undefined;
}

/** Only retry errors that can plausibly succeed on a second attempt. */
function isRetryable(err: unknown): boolean {
  const status = getStatusCode(err);
  if (status === undefined) return true; // network / unknown errors -> retry
  if (status === 429) return true; // rate limited
  if (status >= 500) return true; // server errors
  return false; // 4xx client errors will not fix themselves
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 4, baseDelayMs = 600, label = 'operation' } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries || !isRetryable(err)) break;
      const delay = baseDelayMs * 2 ** attempt + Math.random() * 300;
      console.warn(
        `[retry] ${label} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(delay)}ms:`,
        (err as Error).message
      );
      await sleep(delay);
    }
  }
  throw lastError;
}
