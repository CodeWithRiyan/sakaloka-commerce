import type { Client } from '@libsql/client';
import { databaseKind, type DatabaseKind } from '@/server/db/client';
import type { Env } from '@/server/env';

export type Health = {
  status: 'ok' | 'degraded';
  version: string;
  database: { kind: DatabaseKind; ok: boolean };
  storage: { driver: Env['STORAGE_DRIVER'] };
};

export async function checkHealth(
  database: Pick<Client, 'execute'>,
  env: Pick<Env, 'DATABASE_URL' | 'STORAGE_DRIVER'>,
  version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
): Promise<Health> {
  let databaseOk = true;
  try {
    await database.execute('select 1');
  } catch {
    databaseOk = false;
  }

  return {
    status: databaseOk ? 'ok' : 'degraded',
    version,
    database: { kind: databaseKind(env.DATABASE_URL), ok: databaseOk },
    storage: { driver: env.STORAGE_DRIVER },
  };
}
