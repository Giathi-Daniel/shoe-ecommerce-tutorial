# Security

How ShoeStore protects accounts, orders and the API, what is deliberately left to the hosting layer, and what to do before launch.

## What is protected

| Risk | Defence |
| --- | --- |
| Bots registering, guessing passwords or mailing reset links | **Google reCAPTCHA v3** is verified on the server for register, login and forgot-password (score and action checked). Production **fails closed**: no secret or an unreachable Google means the request is refused. |
| Brute force and credential stuffing | Per-IP limits plus a per-account limit (so spreading attempts across many IPs still hits a ceiling), a stricter limit on password-reset email, and a 10 minute lockout after 5 wrong passwords. |
| Account enumeration | Unknown email, wrong password and locked account all return the **same message**, and a dummy password hash is checked for unknown emails so response time does not give them away. Password reset always answers the same way. |
| Stolen or stale sessions | Tokens carry a version number. **Logout, password change and password reset revoke every existing token immediately.** The user's role is read from the database on each request, so demoting an admin takes effect at once. Tokens last 1 day by default. |
| NoSQL injection | Any request containing MongoDB operators (`$gt`, `$ne`, dotted keys) is rejected, inputs are validated, and ids are checked before queries. |
| Mass assignment | Admin product create and update only accept an explicit list of fields. Ratings, review counts and reviews cannot be set from a request. |
| Dangerous image URLs | Product images must be `https://` URLs or `/paths`, so `javascript:` and `data:` URLs are refused. |
| Destructive account actions | Deleting an account requires the current password. |
| Cross-origin abuse | CORS only allows `CLIENT_URL` in production (localhost is allowed in development only) and blocked origins get a clean `403`. |
| Oversized or malformed requests | JSON bodies are limited to 100 KB, passwords to 128 characters, and bad JSON returns `400` without echoing input. |
| Sensitive data in logs | Email addresses are masked, and password-reset emails are never written to production logs. |
| Open redirects | Post-login redirects are restricted to same-site paths. |
| Browser attacks | The site server sends a strict CSP (scripts only from itself and reCAPTCHA), HSTS, no framing and no MIME sniffing. The API sends Helmet defaults with a deny-all CSP. |
| Server crashes | A malformed URL can no longer crash the web server, stack traces are hidden in production and only GET and HEAD are served. |
| Weak configuration | In production the API refuses to start with a `JWT_SECRET` shorter than 32 characters, and the seed script refuses to run (it creates known demo logins). |

## Set up reCAPTCHA

1. Create a **v3** key pair at <https://www.google.com/recaptcha/admin/create> and add your production domain.
2. API: set `RECAPTCHA_SECRET_KEY` (and optionally `RECAPTCHA_MIN_SCORE`, default `0.5`).
3. Site: set `VITE_RECAPTCHA_SITE_KEY` **at build time**, then rebuild.
4. Watch the score distribution in the reCAPTCHA console after launch and tune `RECAPTCHA_MIN_SCORE` if real customers are rejected.

Locally, with no keys, the check is skipped so development works. Production builds never skip it.

## DDoS and traffic floods

Application code cannot stop a large DDoS: protection has to sit in front of the app.

- Serve the site through a CDN or proxy (Cloudflare, Vercel, AWS CloudFront). Static pages and images are then absorbed at the edge.
- Enable the provider's **WAF and bot protection**, and add a rate rule for `/api/auth/*`.
- The in-app rate limiters keep counters in memory, so with several API instances each counts separately. Treat them as a second line of defence, and use a shared store (for example Redis) if you scale out.
- `trust proxy` is set to `1`, so the API sees the real client IP behind one proxy. Change it if you run behind more.

## Known limits

- **Login token storage.** The token lives in browser local storage so the site and API can be hosted on different domains. A script-injection bug would be able to read it. The strict CSP, React's output escaping, 1-day expiry and instant revocation on logout and password change reduce that risk. A same-site `HttpOnly` cookie is the stronger design if you host both under one domain.
- **Registration reveals existing emails** ("already exists"). This is the usual trade-off for usable sign-up, and it sits behind reCAPTCHA and rate limits.
- Product images in the seed data are served by the storefront. Admin-added images must be hosted somewhere you trust.

## Launch checklist

- [ ] `NODE_ENV=production` on the API
- [ ] `JWT_SECRET` is random and at least 32 characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
- [ ] `CLIENT_URL` is the exact site origin (comma separate several)
- [ ] reCAPTCHA keys set on both the API and the site build
- [ ] `EMAIL_USER` and `EMAIL_PASS` set so password-reset emails are delivered
- [ ] Stripe and PayPal keys set, and the Stripe webhook secret configured
- [ ] Do **not** run `npm run seed` in production, and delete or change the demo accounts if it was ever run
- [ ] CDN or WAF in front of the site and API, with rate rules on `/api/auth/*`
- [ ] Run `npm audit --omit=dev` in both apps before each release

## Reporting a problem

If you find a vulnerability, please contact the maintainer privately instead of opening a public issue.
