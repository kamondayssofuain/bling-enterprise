# Bling Enterprise storefront

A React + Vite storefront with individual product detail popups, editable demo catalogue, stock and KSh pricing, WhatsApp order messages, an admin dashboard, and a Safaricom Daraja STK Push backend starter.

## Run locally

```bash
npm install
npm run dev
```

The admin dashboard is opened from the **Admin** button. Demo PIN: `bling2026`.

## Product catalogue / admin notes

The included dashboard is a front-end prototype. Products and uploaded photos are saved in the current browser's localStorage only. They are not synced between devices and are not secure for a live store. Before production, replace this with a database, authenticated admin API, image storage, and server-side validation. The initial prices and quantities are sample values and must be confirmed/edited by the business.

## M-Pesa Daraja setup

1. Create/configure a Safaricom Daraja app and obtain the Consumer Key, Consumer Secret, shortcode and Lipa Na M-Pesa passkey.
2. Copy `.env.example` to `.env` and fill in the real credentials. Keep `.env` private and never put credentials in React or commit them to Git.
3. Set `MPESA_ENV=sandbox` for testing. Set `MPESA_CALLBACK_URL` to a public HTTPS address ending in `/api/mpesa/callback` (a local URL will not receive callbacks).
4. Run `npm run build` then `npm start` to serve the built React site and API together. Use a secure production host and HTTPS.
5. Test with Daraja sandbox credentials/test numbers before switching to production.

The backend starter sends the STK Push and receives callback payloads, but currently only logs callbacks. It does not yet save orders, verify callback authenticity, reconcile payments, or update inventory. Do not treat a browser message or a successful STK request as proof of payment. Implement durable order storage and verified callback processing before accepting live customer payments or dispatching goods.

## Deploy

Deploy the React app and Express API together on a Node-capable host, configure environment variables in the host dashboard, and point your domain to it. A static-only deployment (for example, a plain Vercel static build) will not run this Express API unless you adapt the API routes to serverless functions.
