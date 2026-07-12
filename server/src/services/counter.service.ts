import { config } from '../config/env';
import { Mutex } from '../utils/mutex';
import { createJsonFile, findFileByName, readJsonFile, updateJsonFile } from './drive.service';

/**
 * Chronological client counter, persisted as client_counter.json in the
 * root Drive folder.
 *
 * Concurrency safety: all reads/increments run inside a FIFO mutex, so even
 * if two customers submit at the exact same moment, each is assigned a
 * unique, strictly increasing number.
 */

const COUNTER_FILE_NAME = 'client_counter.json';

interface CounterFile {
  /** The last client number that was assigned. */
  counter: number;
  updatedAt: string;
}

const counterMutex = new Mutex();

// Cache the Drive file id after first lookup to save an API call per submission.
let counterFileId: string | null = null;

/**
 * Atomically assigns the next client number.
 * If client_counter.json does not exist yet, it is created and the first
 * client receives number 1 (rendered as "0001").
 */
export async function getNextClientNumber(): Promise<number> {
  return counterMutex.runExclusive(async () => {
    if (!counterFileId) {
      const existing = await findFileByName(COUNTER_FILE_NAME, config.driveRootFolderId);
      counterFileId = existing?.id ?? null;
    }

    if (!counterFileId) {
      const initial: CounterFile = { counter: 1, updatedAt: new Date().toISOString() };
      counterFileId = await createJsonFile(COUNTER_FILE_NAME, config.driveRootFolderId, initial);
      return 1;
    }

    const current = await readJsonFile<CounterFile>(counterFileId);
    const next = (Number.isFinite(current?.counter) ? current.counter : 0) + 1;
    await updateJsonFile(counterFileId, {
      counter: next,
      updatedAt: new Date().toISOString(),
    } satisfies CounterFile);
    return next;
  });
}

/** Formats a client number as a zero-padded string, e.g. 7 -> "0007". */
export function formatClientNumber(n: number): string {
  return String(n).padStart(4, '0');
}
