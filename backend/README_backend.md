# JEMER Backend (Express + MySQL)

This minimal backend accepts contact form submissions, newsletter signups and orders. It stores records in MySQL and emails the admin.

Environment (.env): see `.env.example`.

Required env vars:

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `ADMIN_EMAIL`

Quick install:

```bash
cd backend
npm install
cp .env.example .env  # edit with your credentials
node server.js
```

API endpoints:

- POST `/api/contact` { name, email, subject?, message }
- POST `/api/newsletter` { email }
- POST `/api/orders` { name, email, phone?, address?, items: [{name, qty, price}], total }

Example curl:

```bash
curl -X POST http://localhost:3000/api/contact -H "Content-Type: application/json" -d '{"name":"Test","email":"a@b.com","message":"Hello"}'
```

Database schema (MySQL):

```sql
CREATE DATABASE jemer_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE jemer_db;

CREATE TABLE contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  phone VARCHAR(64),
  address TEXT,
  total DECIMAL(12,2) NOT NULL,
  items_json JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Notes:

- Use a real SMTP provider and secure credentials. For development you can use Mailtrap or similar.
- The code stores order items as JSON for simplicity; adapt if you want normalized tables.

## Deployment checklist and recommendations

- Ensure **no** `.env` files with secrets are committed. Use the provided `.env.example` and inject real secrets via your platform (Heroku config vars, Docker secrets, Kubernetes secrets, Azure app settings, etc.).
- Rotate any credentials that were stored in removed `.env` files.
- Set environment variables:
  - `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
  - `ADMIN_EMAIL` (optional)
  - `CORS_ORIGIN` — comma-separated list of allowed origins (e.g. `https://yourdomain.com`)
  - `RATE_LIMIT_MAX` — requests per `windowMs` (default 100)

- Run behind TLS (reverse-proxy or platform-managed TLS). Do not expose the app directly on plain HTTP in production.
- Use a non-root DB user with limited privileges and restrict DB access by IP/VPC.
- Configure backups for the DB and an automated monitoring/alerting solution.

Run with Docker (example):

```bash
cd backend
docker build -t jemer-backend:latest .
docker run -e DB_HOST=... -e DB_USER=... -e DB_PASS=... -e DB_NAME=... -p 3000:3000 jemer-backend:latest
```

Or use `pm2` for process management:

```bash
npm ci --only=production
npm run start:pm2
```

Testing email without sending:

set `SMTP_TEST=true` in env to suppress real email sending (useful in staging).

## Deploy on Render (Web Service)

Use Render for this Node/Express API with a MySQL database (external provider).

Service settings:

- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm ci`
- Start Command: `npm start`

Environment variables to set in Render:

- `NODE_ENV=production`
- `PORT=10000` (Render injects `PORT`; you can leave this unset)
- `LOG_FORMAT=combined`
- `BODY_LIMIT=1mb`
- `RATE_LIMIT_MAX=100`
- `CORS_ORIGIN=https://your-frontend.onrender.com`
- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `ADMIN_EMAIL`
- `SMTP_TEST=false`

Notes:

- The app already listens on `process.env.PORT`, so it is Render-compatible.
- Make sure your DB provider allows connections from Render.
- If your frontend is hosted on another domain, add it in `CORS_ORIGIN`.
