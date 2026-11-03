import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const dir = mkdtempSync(path.join(tmpdir(), 'sakaloka-api-'));

beforeAll(() => {
  vi.stubEnv('DATABASE_URL', `file:${path.join(dir, 'app.db')}`);
  vi.stubEnv('STORAGE_DRIVER', 'disk');
});

afterAll(() => {
  vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});

describe('GET /api/health', () => {
  it('returns 200 with the database and storage status', async () => {
    const { GET } = await import('@/app/api/health/route');

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({
      status: 'ok',
      database: { kind: 'sqlite-file', ok: true },
      storage: { driver: 'disk' },
    });
  });
});
