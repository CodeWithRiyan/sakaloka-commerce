import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { createDatabaseClient } from '@/server/db/client';
import { spikeArgon2 } from '@/spike/argon2';
import { spikeDatabase } from '@/spike/database';
import { spikePdf } from '@/spike/pdf';

// The local half of T-R1-05. The same checks run on Turso and Blob through /api/spike/*.
const dir = mkdtempSync(path.join(tmpdir(), 'i2i-spike-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('platform spike, local', () => {
  it('database behaviours on a SQLite file', async () => {
    const client = createDatabaseClient({ DATABASE_URL: `file:${path.join(dir, 'spike.db')}` });
    const results = await spikeDatabase(client);
    client.close();
    console.table(results);
    expect(results.filter((r) => !r.pass)).toEqual([]);
  });

  it('argon2', async () => {
    const results = await spikeArgon2();
    console.table(results);
    expect(results.every((r) => r.pass)).toBe(true);
  });

  it('pdf', async () => {
    const results = await spikePdf();
    console.table(results);
    expect(results.every((r) => r.pass)).toBe(true);
  }, 60_000);
});
