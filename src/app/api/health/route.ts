import { NextResponse } from 'next/server';
import { getDatabaseClient } from '@/server/db/client';
import { readEnv } from '@/server/env';
import { checkHealth } from '@/server/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = readEnv();
  const health = await checkHealth(getDatabaseClient(env), env);
  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
    headers: { 'cache-control': 'no-store' },
  });
}
