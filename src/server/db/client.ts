import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import type { Env } from '@/server/env';

export type DatabaseKind = 'sqlite-file' | 'turso';

export function databaseKind(url: string): DatabaseKind {
  return url.startsWith('file:') || url === ':memory:' ? 'sqlite-file' : 'turso';
}

/** Opens a local SQLite file or a Turso database, depending on DATABASE_URL. */
export function createDatabaseClient(
  env: Pick<Env, 'DATABASE_URL' | 'DATABASE_AUTH_TOKEN'>,
): Client {
  const url = env.DATABASE_URL;
  if (url.startsWith('file:')) {
    // libSQL creates the file but not its folder.
    mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true });
  }
  return createClient({ url, authToken: env.DATABASE_AUTH_TOKEN });
}

let client: Client | undefined;

/** One client per server process, reused across requests. */
export function getDatabaseClient(env: Env): Client {
  client ??= createDatabaseClient(env);
  return client;
}

export function getDb(env: Env) {
  return drizzle(getDatabaseClient(env));
}
