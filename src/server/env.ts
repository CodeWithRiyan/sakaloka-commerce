import { z } from 'zod';

/** Treats an empty variable, as `.env` files often leave it, like an unset one. */
const unsetIfEmpty = (value: unknown) => (value === '' ? undefined : value);

const envSchema = z.object({
  STORE_NAME: z.preprocess(unsetIfEmpty, z.string().default('Sakaloka Store')),
  DATABASE_URL: z.preprocess(unsetIfEmpty, z.string().default('file:./data/app.db')),
  DATABASE_AUTH_TOKEN: z.preprocess(unsetIfEmpty, z.string().optional()),
  STORAGE_DRIVER: z.preprocess(unsetIfEmpty, z.enum(['disk', 'blob']).default('disk')),
  STORAGE_DISK_ROOT: z.preprocess(unsetIfEmpty, z.string().default('./data/uploads')),
  APP_URL: z.preprocess(unsetIfEmpty, z.url().default('http://localhost:3000')),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse(source);
}
