# i2i

Custom sports uniform store: catalog, uniform, mix and stock orders, and an admin.

The app is being rebuilt as one Next.js app styled with Bootstrap 5.3, with SQLite for data
(a local file in development, Turso in production) and Vercel for hosting. The plan lives in
the "i2i Rebuild: Next.js + SQLite on Vercel" doc.

The old PHP (CodeIgniter 3) app is kept under the Git tag `legacy-final` as a reference:

```sh
git show legacy-final:i2i.sql
git worktree add ../i2i-legacy legacy-final
```
