/**
 * Minimal FIFO async mutex.
 *
 * Used to serialize access to the client counter so that two concurrent
 * submissions can never read the same counter value and receive the same
 * client number. Requests queue up and are processed strictly in order.
 *
 * Note: this guards a single server process. If you ever scale to multiple
 * server instances, move the counter to a transactional store (or use Drive
 * file revisions as an optimistic lock).
 */
export class Mutex {
  private queue: Promise<void> = Promise.resolve();

  /** Runs `fn` exclusively; concurrent callers wait their turn in FIFO order. */
  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    // Keep the chain alive even if fn rejects, so later callers still run.
    this.queue = run.then(
      () => undefined,
      () => undefined
    );
    return run;
  }
}
