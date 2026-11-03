import type { Client } from '@libsql/client';
import type { SpikeResult } from './types';

const setup = [
  'DROP TABLE IF EXISTS spike_child',
  'DROP TABLE IF EXISTS spike_parent',
  'DROP TABLE IF EXISTS spike_counters',
  'CREATE TABLE spike_parent (id INTEGER PRIMARY KEY, stock INTEGER NOT NULL CHECK (stock >= 0))',
  'CREATE TABLE spike_child (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES spike_parent (id))',
  'CREATE TABLE spike_counters (year INTEGER PRIMARY KEY, last_value INTEGER NOT NULL DEFAULT 0)',
  'INSERT INTO spike_parent (id, stock) VALUES (1, 1)',
];

async function rejects(run: () => Promise<unknown>): Promise<string | null> {
  try {
    await run();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** Checks the SQLite behaviours the order write depends on, on a local file or on Turso. */
export async function spikeDatabase(client: Client, parallel = 20): Promise<SpikeResult[]> {
  const results: SpikeResult[] = [];
  await client.batch(setup, 'write');

  // 1. Foreign keys inside a write batch, which is how orders are saved.
  const inBatch = await rejects(() =>
    client.batch(
      ['PRAGMA foreign_keys = ON', 'INSERT INTO spike_child (parent_id) VALUES (999)'],
      'write',
    ),
  );
  results.push({
    name: 'Foreign keys enforced inside a batch',
    pass: inBatch !== null,
    detail: inBatch ?? 'an orphan row was accepted',
  });

  // 2. Foreign keys after a separate PRAGMA statement on the same client.
  await client.execute('PRAGMA foreign_keys = ON');
  const separate = await rejects(() =>
    client.execute('INSERT INTO spike_child (parent_id) VALUES (998)'),
  );
  results.push({
    name: 'Foreign keys enforced after a separate PRAGMA',
    pass: separate !== null,
    detail: separate ?? 'an orphan row was accepted',
  });
  const fkState = await client.execute('PRAGMA foreign_keys');
  results.push({
    name: 'PRAGMA foreign_keys reads back as 1',
    pass: Number(fkState.rows[0]?.[0]) === 1,
    detail: `foreign_keys = ${String(fkState.rows[0]?.[0])}`,
  });
  await client.execute('DELETE FROM spike_child');

  // 3. A batch with one failing statement leaves no rows.
  const failed = await rejects(() =>
    client.batch(
      [
        'INSERT INTO spike_child (parent_id) VALUES (1)',
        'UPDATE spike_parent SET stock = stock - 5 WHERE id = 1',
      ],
      'write',
    ),
  );
  const children = await client.execute('SELECT count(*) AS n FROM spike_child');
  results.push({
    name: 'A failing batch rolls back every statement',
    pass: failed !== null && Number(children.rows[0]?.n) === 0,
    detail: `error: ${failed ?? 'none'}; rows left: ${String(children.rows[0]?.n)}`,
  });

  // 4. Parallel conditional updates on the last item in stock.
  await client.execute('UPDATE spike_parent SET stock = 1 WHERE id = 1');
  const attempts = await Promise.allSettled(
    Array.from({ length: parallel }, () =>
      client.execute('UPDATE spike_parent SET stock = stock - 1 WHERE id = 1 AND stock >= 1'),
    ),
  );
  const won = attempts.filter((a) => a.status === 'fulfilled' && a.value.rowsAffected === 1).length;
  const errored = attempts.filter((a) => a.status === 'rejected').length;
  const stock = await client.execute('SELECT stock FROM spike_parent WHERE id = 1');
  results.push({
    name: `${parallel} parallel conditional updates on stock 1`,
    pass: won === 1 && Number(stock.rows[0]?.stock) === 0,
    detail: `succeeded: ${won}, errors: ${errored}, final stock: ${String(stock.rows[0]?.stock)}`,
  });

  // 5. Order counter with upsert and RETURNING inside a batch.
  const counter =
    'INSERT INTO spike_counters (year, last_value) VALUES (2026, 1) ON CONFLICT (year) DO UPDATE SET last_value = last_value + 1 RETURNING last_value';
  const first = await client.batch([counter], 'write');
  const second = await client.batch([counter], 'write');
  const values = [first[0]?.rows[0]?.last_value, second[0]?.rows[0]?.last_value].map(Number);
  results.push({
    name: 'Order counter upsert with RETURNING',
    pass: values[0] === 1 && values[1] === 2,
    detail: `returned ${values.join(', ')}`,
  });

  await client.batch(
    ['DROP TABLE spike_child', 'DROP TABLE spike_parent', 'DROP TABLE spike_counters'],
    'write',
  );
  return results;
}
