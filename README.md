# i2i

i2i (i2icustom) makes custom sports uniforms for teams. Customers order in three ways:

- **Uniform order**: one product for the whole team, with a name, number and size per player.
- **Mix order**: several products in one order, one row per product.
- **Stock order**: ready-made items by size, from stock.

An order is a request, not a payment: the site prices it, and sales confirms the artwork, price
and delivery with the customer.

The old site ran at i2icustom.com on PHP (CodeIgniter 3) and is no longer online. This repo
is its rebuild: one Next.js app styled with Bootstrap 5.3, with data in SQLite. The old app is
kept under the Git tag `legacy-final`.

## Run it locally

Needs Node.js 22 (see `.nvmrc`).

```sh
npm ci
npm run db:migrate
npm run dev
```

The app opens at http://localhost:3000, with its database in `./data/i2i.db`. Copy
`.env.example` to `.env.local` to change any setting.
