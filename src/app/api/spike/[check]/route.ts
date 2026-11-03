import { after, NextResponse, type NextRequest } from 'next/server';
import { getDatabaseClient } from '@/server/db/client';
import { readEnv } from '@/server/env';
import { spikeArgon2 } from '@/spike/argon2';
import { spikeBlob } from '@/spike/blob';
import { spikeDatabase } from '@/spike/database';
import { spikePdf } from '@/spike/pdf';
import type { SpikeResult } from '@/spike/types';

// Temporary routes for T-R1-05, on the spike/platform branch only.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const notFound = () => NextResponse.json({ error: { code: 'not_found' } }, { status: 404 });

const AFTER_TABLE =
  'CREATE TABLE IF NOT EXISTS spike_after (id INTEGER PRIMARY KEY, source TEXT NOT NULL, at INTEGER NOT NULL)';

export async function GET(request: NextRequest, ctx: RouteContext<'/api/spike/[check]'>) {
  const { check } = await ctx.params;
  const env = readEnv();
  const client = getDatabaseClient(env);

  // Vercel Cron sends CRON_SECRET as a bearer token.
  if (check === 'cron') {
    const expected = process.env.CRON_SECRET;
    if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
      return NextResponse.json({ error: { code: 'unauthenticated' } }, { status: 401 });
    }
    await client.batch([
      AFTER_TABLE,
      `INSERT INTO spike_after (source, at) VALUES ('cron', ${Date.now()})`,
    ]);
    return NextResponse.json({ ok: true });
  }

  const secret = process.env.SPIKE_SECRET;
  if (!secret || request.headers.get('x-spike-secret') !== secret) return notFound();

  let results: SpikeResult[];
  switch (check) {
    case 'database':
      results = await spikeDatabase(client);
      break;
    case 'argon2':
      results = await spikeArgon2();
      break;
    case 'pdf':
      results = await spikePdf();
      break;
    case 'blob': {
      const token = process.env.BLOB_PRIVATE_TOKEN;
      if (!token)
        return NextResponse.json(
          { error: { code: 'missing BLOB_PRIVATE_TOKEN' } },
          { status: 500 },
        );
      results = await spikeBlob(token);
      break;
    }
    case 'after': {
      // The response returns first; the insert runs after it, as the order email will.
      await client.execute(AFTER_TABLE);
      const marker = Date.now();
      after(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await client.execute({
          sql: "INSERT INTO spike_after (source, at) VALUES ('after', ?)",
          args: [marker],
        });
      });
      return NextResponse.json({ marker, check: 'GET /api/spike/after-result?marker=' + marker });
    }
    case 'after-result': {
      await client.execute(AFTER_TABLE);
      const rows = await client.execute(
        'SELECT source, at FROM spike_after ORDER BY id DESC LIMIT 20',
      );
      return NextResponse.json({ rows: rows.rows });
    }
    default:
      return notFound();
  }

  return NextResponse.json(
    { pass: results.every((r) => r.pass), results },
    { headers: { 'cache-control': 'no-store' } },
  );
}
