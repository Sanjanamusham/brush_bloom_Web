# Brush & Bloom Handmade — MEAN Stack

A MEAN-stack (MongoDB, Express, Angular, Node.js) rebuild of the Lippan Art
showcase/ordering site, converted from the original React + Supabase project.
No payment gateway — customers submit an order request and you confirm
pricing & delivery manually over WhatsApp, exactly like the original spec.

```
mean-brush-bloom/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
├── frontend/    Angular 18 standalone app
└── docker-compose.yml   Local MongoDB, zero cost
```

## What's implemented

| Area | Details |
|---|---|
| Product catalog | Public browse/filter/sort, admin CRUD |
| Cart | Client-side (localStorage), no payment |
| Order requests | Generates `LP-YYYYMMDD-####` code, saves to DB, redirects to WhatsApp |
| Order tracking | Public lookup requires **order code + phone match** — never exposes the orders collection |
| Admin panel | JWT-protected (`/admin` login, `/admin/dashboard`), product & order management |
| Security | helmet, CORS allowlist, rate limiting, Zod input validation + sanitisation, mongo-sanitize, hpp, bcrypt password hashing, short-lived JWT access token + httpOnly refresh cookie |

## Prerequisites

- Node.js 20+ and npm
- Docker Desktop (for local MongoDB) **or** a local MongoDB install **or** a free
  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster (all zero-cost)
- Angular CLI: `npm install -g @angular/cli`

## 1. Start MongoDB locally (free)

```bash
docker compose up -d
```

This runs MongoDB on `localhost:27017`. (Alternative: install MongoDB Community
Server directly, or point `MONGO_URI` at a free Atlas cluster — no code changes needed.)

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and:
- Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to random strings:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- Set `WHATSAPP_NUMBER` to your real WhatsApp Business number (digits only, country code, no `+`).
- Leave `MONGO_URI=mongodb://127.0.0.1:27017/brush_bloom` if using the Docker Mongo above.

Seed the database with the sample product catalog and an admin account:

```bash
npm run seed
# or with your own admin login:
npm run seed -- --admin-email=you@example.com --admin-password="A-Strong-Password-1"
```

The console prints the admin email/password used — **log in once and note it down**,
this account is only shown once at seed time.

Start the API:

```bash
npm run dev
```

API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 3. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm start
```

Angular dev server runs at `http://localhost:4200` and calls the API at
`http://localhost:5000/api` (set in `src/environments/environment.ts`).

Open `http://localhost:4200` in your browser — you should see the shop with
the same 8 sample Lippan art products as the original.

## 4. Try it end to end

1. Browse products on the home page, add a couple to your cart.
2. Go to **Cart → Submit Order Request**, fill the form, submit.
3. You'll get an Order ID (e.g. `LP-20260817-0001`) and a WhatsApp link.
4. Go to **Track Order**, enter that Order ID + the phone number you used.
5. Go to `/admin`, log in with the seeded admin account, open **Orders**,
   change the status — refresh the tracking page and confirm it updated.
6. In **Products**, add/edit/delete a product and confirm it appears/updates on the home page.

## Editing business details (WhatsApp number, email, Instagram)

Single source of truth, same pattern as the original app:
- Backend: `backend/.env` → `WHATSAPP_NUMBER`, `BUSINESS_EMAIL`, `BUSINESS_INSTAGRAM`
- Frontend: `frontend/src/app/shared/config/site.config.ts`

## Security checklist covered locally

- [x] Passwords hashed with bcrypt (12 rounds), never stored in plain text
- [x] Admin JWT access token kept in memory only (not localStorage) + httpOnly refresh cookie
- [x] All write endpoints validate & sanitise input (Zod), matching the original app's rules
- [x] Order tracking is a two-factor lookup (code + phone), never a public list
- [x] Rate limiting on login, order creation, and order tracking
- [x] `helmet`, CORS allowlist, `express-mongo-sanitize`, `hpp` on every request
- [x] No payment/card/UPI data ever collected, stored, or transmitted

## Next steps toward production (do this later, as you said)

- Swap `.env` secrets for strong generated values and never commit `.env`
- Move MongoDB from local Docker to MongoDB Atlas free tier
- Deploy backend to a free tier host (Render, Railway, Fly.io) and frontend to
  a static host (Vercel, Netlify, Cloudflare Pages, or GitHub Pages)
- Add HTTPS (automatic on most of the above), set `NODE_ENV=production`,
  and update `CLIENT_ORIGIN` / `environment.prod.ts` to your real domains
- Add image upload (e.g. `multer` + free-tier object storage or Cloudinary)
  instead of typing image URLs by hand in the admin panel
- Add automated tests (Jest for backend, Karma/Jasmine or Vitest for frontend)
- Consider 2FA or IP-based lockout on the admin login for extra protection
