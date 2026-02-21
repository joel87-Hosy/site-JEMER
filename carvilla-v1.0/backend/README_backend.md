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
