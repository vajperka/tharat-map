# THARAT Resource Map V5

Full-stack Next.js project for Vercel.

## Stack
- Next.js App Router
- Vercel
- Neon Postgres
- Auth.js / NextAuth credentials authentication
- bcrypt password hashing
- Roles: `user` / `admin`
- Public approved marker map
- Logged-in marker submissions
- Admin moderation dashboard

## 1. Install
```bash
npm install
```

## 2. Create Neon in Vercel
In the Vercel project open Marketplace / Storage and add **Neon Postgres**.
Vercel/Neon will provide `DATABASE_URL`.

For local development:
```bash
vercel env pull .env.local
```
or copy `.env.example` to `.env.local`.

## 3. Auth secret
Generate a long random value and set:
```env
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
```
In production set `AUTH_URL` to your production URL if needed.

## 4. Initialize DB
```bash
npm run db:init
```

## 5. Run locally
```bash
npm run dev
```

## 6. Create the admin
First register your normal account through `/register`, then run:
```bash
npm run db:make-admin -- your@email.cz
```
Log out and back in. The `/admin` link will appear.

You can also run this SQL in Neon/Vercel database browser:
```sql
UPDATE users SET role='admin' WHERE lower(email)=lower('your@email.cz');
```

## Marker workflow
1. Public visitors can see only approved markers.
2. A registered user right-clicks the map and submits a location.
3. The marker is stored as `pending`.
4. Admin opens `/admin`.
5. Approve -> marker becomes `approved` + `verified` and appears publicly.
6. Reject -> marker stays hidden.
7. Admin can delete markers.

## Important security notes
- `DATABASE_URL` and `AUTH_SECRET` are server-only environment variables.
- They are never exposed through `NEXT_PUBLIC_*`.
- Registration always creates `role='user'`.
- Admin endpoints check the authenticated server-side session and `role === 'admin'`.
- Passwords are bcrypt hashes, never plaintext.

## Current map data
The database starts empty on purpose. No unverified Tharat coordinates were invented.
The supplied `public/tharat-map.png` is the temporary map background from the earlier prototype.

## V5.1
- Viditelné tlačítko `+ PŘIDAT MARKER`.
- Host dostane login/register modal.
- Přihlášený uživatel vybere pozici kliknutím do mapy.
- LAT/LON se vezmou z mapy a ve formuláři se nepřepisují ručně.
- `ZMĚNIT POZICI` zachová rozepsaná data.
- ESC ruší výběr; u rozepsaného markeru vyžádá potvrzení.
- Běžný user vždy vytváří `pending` marker.
- Admin může zvolit `Publikovat okamžitě`; oprávnění kontroluje server.
- Není potřeba žádná změna databázového schématu oproti V5.

## V5.1.2
- Leaflet workspace fills the entire area to the right of the filter sidebar.
- Removed fixed/limited map sizing; map canvas is 100% width and height.
- Dark map background replaces Leaflet's default light gray background.
- Search and `+ PŘIDAT MARKER` are grouped together in the upper-left overlay.
- Leaflet invalidates its size after mount and on browser resize.
