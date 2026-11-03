# Platform spike (T-R1-04 and T-PR-02)

The spike tests the assumptions the order write, login and PDF plans depend on, before any
feature work. The code lives on the branch `spike/platform`, which is never merged: the checks
are in `src/spike/` and run through `tests/spike/local.test.ts` locally and `/api/spike/*` on a
Vercel preview.

On 2026-11-03 the owner chose to run the app only locally until launch, so the spike runs in two
halves. The local half (T-R1-04) is done. The platform half (T-PR-02) runs in the pre-release stage, just before launch.

## Local half: T-R1-04, done 2026-11-03

Run on a SQLite file through `@libsql/client` 0.18.0, Node.js 22.23, macOS 26.6 on arm64.
Command: `npx vitest run tests/spike` on `spike/platform`.

| Check                                                             | Result | Detail                                                      |
| ----------------------------------------------------------------- | ------ | ----------------------------------------------------------- |
| Foreign keys enforced inside a write batch                        | Pass   | `FOREIGN KEY constraint failed`                             |
| Foreign keys enforced after a separate `PRAGMA foreign_keys = ON` | Pass   | `PRAGMA foreign_keys` reads back 1                          |
| A failing batch rolls back every statement                        | Pass   | The CHECK `stock >= 0` failed and 0 rows were left          |
| 20 parallel conditional updates on the last item in stock         | Pass   | 1 succeeded, 0 errors, final stock 0                        |
| Order counter upsert with `RETURNING`, inside a batch             | Pass   | Returned 1, then 2                                          |
| Argon2id hash and verify with `@node-rs/argon2` 2.2.2 defaults    | Pass   | Hash 51 ms, verify 51 ms, `$argon2id$v=19$m=19456,t=2,p=1$` |
| A3 PDF with 500 player rows, `@react-pdf/renderer` 4.9.0          | Pass   | 1,867 ms, 40 KiB, A3 MediaBox 841.89 x 1190.55 points       |

What this settles for the plan:

- Orders can be saved with one libSQL `batch(..., 'write')`: it is atomic, and foreign keys and
  CHECK constraints hold inside it.
- The conditional `UPDATE ... WHERE stock >= n` is enough to stop overselling on SQLite; no row
  locking is needed.
- `order_counters` can hand out order numbers with one upsert statement.
- Argon2id at the library defaults costs about 50 ms per login on this machine.
- A3 order PDFs render without Chromium. 500 rows is the largest uniform order allowed.

## Platform half: T-PR-02, in pre-release

These need a Vercel preview with Turso and Blob, so they wait for the deploy.

| Check                                                                            | How                                                                    |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| The database checks above, on Turso over the network                             | `GET /api/spike/database`                                              |
| Argon2id and the A3 PDF inside a Vercel function, within 300 s and 2 GB on Hobby | `GET /api/spike/argon2`, `GET /api/spike/pdf`                          |
| Private Blob upload, download, anonymous refusal and delete                      | `GET /api/spike/blob`                                                  |
| `after()` runs work after the response is sent                                   | `GET /api/spike/after`, then `GET /api/spike/after-result`             |
| Vercel Cron calls a route with `CRON_SECRET`                                     | Moved to T-PR-04: Vercel runs cron jobs on production deployments only |

Every route needs the `x-spike-secret` header equal to `SPIKE_SECRET`, set for Preview only.
