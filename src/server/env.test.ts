import { describe, expect, it } from 'vitest';
import { readEnv } from '@/server/env';

describe('readEnv', () => {
  it('falls back to local defaults when variables are empty', () => {
    const env = readEnv({ DATABASE_URL: '', STORAGE_DRIVER: '' });

    expect(env.DATABASE_URL).toBe('file:./data/i2i.db');
    expect(env.STORAGE_DRIVER).toBe('disk');
    expect(env.DATABASE_AUTH_TOKEN).toBeUndefined();
  });

  it('rejects an unknown storage driver', () => {
    expect(() => readEnv({ STORAGE_DRIVER: 's3' })).toThrow();
  });
});
