# Security

## Reporting a vulnerability

Please report it privately through this repository's **Security** tab ("Report a vulnerability") instead of opening a public issue.

## What is protected

- **Bots and brute force:** reCAPTCHA v3 on register, login and forgot-password, checked on the server and failing closed in production. Per-IP and per-account rate limits, and a 10 minute lockout after 5 wrong passwords.
- **Sessions:** logout and password changes revoke all existing tokens immediately, and roles are read from the database on every request.
- **Accounts:** login failures give the same message whether or not the email exists. Deleting an account requires the password.
- **Input:** MongoDB operator injection is rejected, admin product edits accept only an allowed list of fields, and image URLs must be `https://` or a local `/path`.
- **Platform:** strict CORS, CSP, HSTS and other headers, masked emails in logs, and startup checks for weak secrets.

## reCAPTCHA setup

1. Create a **v3** key pair at <https://www.google.com/recaptcha/admin/create> for your domain.
2. API: set `RECAPTCHA_SECRET_KEY`. Site: set `VITE_RECAPTCHA_SITE_KEY` at build time.
3. Locally, with no keys, the check is skipped. Production builds never skip it.

## DDoS

Application code cannot stop a large DDoS. Put a CDN or WAF (Cloudflare, Vercel, CloudFront) in front of the site and API and add a rate rule for `/api/auth/*`. The built-in limiters are per server instance, so use a shared store such as Redis if you run several.

## Known limits

- The login token is kept in browser storage so the site and API can live on different domains. A same-site `HttpOnly` cookie is stronger if you host both under one domain.
- Registration reveals when an email already exists. It sits behind reCAPTCHA and rate limits.

## Before going live

- [ ] `NODE_ENV=production` and a random `JWT_SECRET` of at least 32 characters
- [ ] `CLIENT_URL` set to the exact site origin
- [ ] reCAPTCHA keys set on the API and the site build
- [ ] Email, Stripe and PayPal keys configured
- [ ] Never run `npm run seed` in production, and remove the demo accounts if it ever ran
- [ ] CDN or WAF in front, and `npm audit --omit=dev` clean in both apps
