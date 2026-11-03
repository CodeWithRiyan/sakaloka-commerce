import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { createDatabaseClient, databaseKind } from '@/server/db/client';
import { checkHealth } from '@/server/health';

const dir = mkdtempSync(path.join(tmpdir(), 'i2i-health-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

describe('databaseKind', () => {
  it('tells a local file from Turso', () => {
    expect(databaseKind('file:./data/i2i.db')).toBe('sqlite-file');
    expect(databaseKind('libsql://i2i-example.turso.io')).toBe('turso');
  });
});

describe('checkHealth', () => {
  it('reports ok when the database answers', async () => {
    const env = {
      DATABASE_URL: `file:${path.join(dir, 'nested', 'i2i.db')}`,
      STORAGE_DRIVER: 'disk',
    } as const;
    const client = createDatabaseClient(env);

    const health = await checkHealth(client, env, 'test');
    client.close();

    expect(health).toEqual({
      status: 'ok',
      version: 'test',
      database: { kind: 'sqlite-file', ok: true },
      storage: { driver: 'disk' },
    });
  });

  it('reports degraded when the database fails', async () => {
    const failing = { execute: () => Promise.reject(new Error('down')) };
    const env = { DATABASE_URL: 'libsql://i2i-example.turso.io', STORAGE_DRIVER: 'blob' } as const;

    const health = await checkHealth(failing, env, 'test');

    expect(health.status).toBe('degraded');
    expect(health.database).toEqual({ kind: 'turso', ok: false });
  });
});
