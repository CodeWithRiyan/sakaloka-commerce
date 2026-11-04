# Sakaloka Commerce

An online store for products that customers put together from options: choose the product,
its material and options, add a size, name and number per item, and order. It suits teamwear,
printed apparel and any product sold with variants, quantity price tiers and per-item
personalisation.

Customers order in three ways:

- **Bulk order**: one product for a whole group, with a name, number and size per item.
- **Mixed order**: several products in one order, one row per product.
- **Stock order**: ready-made items by size, from stock.

An order is a request, not a payment: the store prices it on the server, and the seller
confirms the details with the customer.

Built with Next.js, Bootstrap 5.3 and SQLite.

## Run it locally

Needs Node.js 22 (see `.nvmrc`).

```sh
npm ci
npm run db:migrate
npm run dev
```

The app opens at http://localhost:3000, with its database in `./data/app.db`. Copy
`.env.example` to `.env.local` to change any setting, such as the store name.

## License

MIT, see `LICENSE`.
