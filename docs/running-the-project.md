# Running ShoeStore locally

This guide takes you from a fresh clone to a working store with sample data.

## 1. Prerequisites

| Tool | Version | Check |
| --- | --- | --- |
| Node.js | 20 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |
| MongoDB | 6 or newer, local or Atlas | see below |

## 2. Get a MongoDB database

Pick one.

**Docker (quickest)**

```bash
docker run -d --name shoestore-mongo -p 27017:27017 mongo:7
# connection string: mongodb://127.0.0.1:27017/shoestore
```

**MongoDB Atlas (free tier)**

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user and allow your IP under *Network Access*.
3. Copy the connection string and add a database name, e.g. `mongodb+srv://USER:PASS@cluster.mongodb.net/shoestore`.

**Local install**: install MongoDB Community Edition and start `mongod`, then use `mongodb://127.0.0.1:27017/shoestore`.

## 3. Start the API

```bash
cd shoe-ecommerce-backend
cp .env.example .env
```

Edit `.env` (at minimum `MONGODB_URI` and `JWT_SECRET`; generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

```bash
npm install
npm run seed     # wipes products, carts, wish lists and orders, then loads sample data
npm run dev      # http://localhost:5000, check http://localhost:5000/api/health
```

`npm run seed` is safe to re-run on a development database whenever you want a clean slate. It refuses to run when `NODE_ENV=production`, because it creates the known demo logins below:

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@shoestore.com | Demo@12345 |
| Admin | admin@shoestore.com | Admin@12345 |

### Environment variables (`shoe-ecommerce-backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret used to sign login tokens. At least 32 random characters (the API refuses to start in production otherwise) |
| `PORT` | no | API port, default `5000` |
| `NODE_ENV` | no | `development` shows error stacks; use `production` when deployed |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d` |
| `RECAPTCHA_SECRET_KEY` | production | reCAPTCHA v3 secret. Protects register, login and forgot-password. Skipped locally when empty, required in production |
| `RECAPTCHA_MIN_SCORE` | no | Minimum score from 0 to 1, default `0.5` |
| `CLIENT_URL` | no | Storefront origin for CORS, reset links and payment redirects, default `http://localhost:5173` |
| `EMAIL_USER`, `EMAIL_PASS` | no | Gmail address and app password for password-reset emails. Without them the reset link is printed in the API log |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | no | Enables card payments |
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENVIRONMENT` | no | Enables PayPal (`sandbox` or `production`) |

## 4. Start the storefront

In a second terminal:

```bash
cd shoe-ecommerce-frontend
npm install
npm run dev      # http://localhost:5173
```

The dev server renders pages on the server (SSR) and proxies `/api` requests to `http://localhost:5000`, so no frontend configuration is needed locally.

### Storefront variables (`shoe-ecommerce-frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | no | API origin for production builds. Leave empty locally |
| `VITE_RECAPTCHA_SITE_KEY` | production | reCAPTCHA v3 site key, set **at build time**. Not needed locally |

## 5. Try it out

1. Browse the home page, search, and filter by department, brand, rating and price.
2. Open a product, pick a size and colour, and add it to the cart.
3. Sign in as the demo customer and check out with **Pay on delivery**.
4. Follow the order under **Returns & Orders**, or cancel it while it is unpaid.
5. Sign in as the admin and open **Account & Lists → Admin Dashboard** to move the order through *Processing → Shipped → Delivered* and manage products.

## 6. Optional: payments

**Stripe (card)**

1. Create a Stripe account and copy the *test* secret key (`sk_test_...`) into `STRIPE_SECRET_KEY`.
2. Forward webhooks locally: `stripe listen --forward-to localhost:5000/api/payments/stripe/webhook`, then copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.
3. Pay with test card `4242 4242 4242 4242`, any future expiry and any CVC.

Even without the webhook, the order page confirms the payment when Stripe redirects back.

**PayPal**

1. In the PayPal developer dashboard create a sandbox app and copy its client ID and secret.
2. Set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` and `PAYPAL_ENVIRONMENT=sandbox`.
3. Choose PayPal at checkout and pay with a sandbox buyer account.

Restart the API after changing `.env`.

## 7. Production build


```bash
cd shoe-ecommerce-frontend
VITE_API_URL=https://your-api.example.com npm run build
NODE_ENV=production PORT=5173 node server.js      # same as: npm run preview
```

- `VITE_API_URL` is baked in at build time. Leave it empty if the API is served from the same origin.
- Run the API with `NODE_ENV=production` and set `CLIENT_URL` to the public storefront URL.
- Product images in `shoe-ecommerce-frontend/public/products/` are served by the storefront server.

## 8. Useful commands

| Where | Command | What it does |
| --- | --- | --- |
| backend | `npm run dev` | API with auto-reload |
| backend | `npm start` | API without reload |
| backend | `npm run seed` | Reset and reseed the database |
| frontend | `npm run dev` | SSR dev server with hot reload |
| frontend | `npm run lint` | ESLint |
| frontend | `npm run build` | Client and server production bundles |

## 9. Troubleshooting

| Symptom | Fix |
| --- | --- |
| API exits with `MongoDB connection error` | Check `MONGODB_URI`, that MongoDB is running, and (Atlas) that your IP is allowed |
| Storefront loads but products never appear | The API isn't running on port 5000, or you haven't run `npm run seed` |
| `Not allowed by CORS` in the browser console | Set `CLIENT_URL` to the exact storefront origin and restart the API |
| `Too many requests` | The API rate-limits by IP; wait a few minutes or restart it |
| "Card payments / PayPal is not configured" | Add the Stripe or PayPal keys, or use Pay on delivery |
| Port already in use | Change `PORT` for the API, or `PORT=5174 npm run dev` for the storefront |
| Password-reset email not arriving | Without `EMAIL_USER`/`EMAIL_PASS` the link is only printed in the API console and `logs/combined.log` |
