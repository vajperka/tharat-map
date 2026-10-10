# Cloudflare Turnstile – Tharat

1. Open https://dash.cloudflare.com/ and create a Turnstile widget for the production hostname `tharat-map.vercel.app` (and any custom domain you use).
2. In Vercel → Project → Settings → Environment Variables, set:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` – public Site Key from Turnstile.
   - `TURNSTILE_SECRET_KEY` – private Secret Key from Turnstile.
   - `TURNSTILE_EXPECTED_HOSTNAME` – optional, e.g. `tharat-map.vercel.app`. If using several domains, omit this and configure allowed hostnames in Cloudflare.
3. Keep existing `AUTH_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DATABASE_URL`.
4. Redeploy the Production deployment after saving variables.

Protection is validated on the server for email/password login and registration. Discord login requires a successful Turnstile verification before OAuth begins and checks a short-lived signed HttpOnly cookie when the OAuth callback returns.

Important: Registration now redirects to login rather than signing in automatically because Turnstile tokens are single-use. CAPTCHA is not a substitute for IP/account rate limiting.

No secret keys should be committed into Git.
