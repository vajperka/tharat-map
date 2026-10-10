# THARAT – Maintenance mode

Admin panel → ÚDRŽBA / MAINTENANCE → toggle. Only the `admin` role may toggle it.
The flag is stored in Neon `site_settings`, created automatically on the first toggle.
Public pages redirect to `/maintenance` while enabled. Public API endpoints return HTTP 503. Login and Auth.js endpoints remain accessible so admins can sign in. Static files remain available for rendering.
Admin sessions are checked against the database on every request; moderators do not bypass maintenance.

Emergency recovery if admin cannot log in: in the Neon SQL editor run:
`UPDATE site_settings SET enabled = false WHERE key = 'maintenance';`
No redeploy needed.

The middleware requires `AUTH_SECRET` and `DATABASE_URL` to be set on Vercel. If database connectivity is lost, it responds with HTTP 503.
