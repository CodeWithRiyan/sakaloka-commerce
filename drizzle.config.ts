import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL || 'file:./data/app.db';

// libSQL creates a local database file but not its folder, as in a fresh clone.
if (url.startsWith('file:')) {
  mkdirSync(path.dirname(url.slice('file:'.length)), { recursive: true });
}

export default defineConfig({
  dialect: 'turso',
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  },
});
