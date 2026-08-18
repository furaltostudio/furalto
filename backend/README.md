# Furalto Backend API

Express + MongoDB REST API for the Furalto luxury furniture storefront.

## Stack

- **Node.js** + **Express 4**
- **MongoDB** + **Mongoose**
- **JWT** auth (access + refresh cookies)
- **Google OAuth** (ID token verification)
- **Nodemailer** (email verification)

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`)

### 2. Setup

```bash
cd backend
cp .env.example .env
npm install
npm run export-products   # sync catalog from frontend
npm run seed              # load products into MongoDB
npm run dev               # http://localhost:5000
```

### 3. Frontend env

In `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your-google-client-id
```

Use the **same** `GOOGLE_CLIENT_ID` in `backend/.env` as `GOOGLE_CLIENT_ID`.

---

## API Routes

Base URL: `http://localhost:5000/api/v1`

### Health
| Method | Route | Auth |
|--------|-------|------|
| GET | `/health` | No |

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Email signup (sends verification email) |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/google` | Google OAuth `{ credential }` |
| POST | `/auth/verify-email` | Verify email `{ token }` |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password `{ token, password }` |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user profile |
| POST | `/auth/logout` | Clear session cookies |

### Products
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/products` | List products (`?category=&subcategory=&q=&page=&limit=`) |
| GET | `/products/search?q=` | Search products |
| GET | `/products/collections` | Category index |
| GET | `/products/:slug` | Product detail |
| GET | `/products/:slug/related` | Related products |
| POST | `/products/seed` | Seed catalog (header: `x-seed-secret`) |

### Cart (auth required)
| Method | Route |
|--------|-------|
| GET | `/cart` |
| POST | `/cart/items` |
| PUT | `/cart/items/:itemId` |
| DELETE | `/cart/items/:itemId` |
| DELETE | `/cart` |

### Orders
| Method | Route | Auth |
|--------|-------|------|
| POST | `/orders` | Optional |
| POST | `/orders/track` | No |
| GET | `/orders` | Yes |
| GET | `/orders/:orderNumber` | Yes |

### Wishlist (auth required)
| Method | Route |
|--------|-------|
| GET | `/wishlist` |
| POST | `/wishlist` `{ slug }` |
| DELETE | `/wishlist/:slug` |

### Appointments
| Method | Route | Auth |
|--------|-------|------|
| POST | `/appointments` | Optional |
| GET | `/appointments` | Yes |

### Contact & Newsletter
| Method | Route |
|--------|-------|
| POST | `/contact` |
| POST | `/newsletter/subscribe` |

---

## Email Verification (Dev)

If SMTP is not configured, verification links are **printed to the backend console**:

```
--- EMAIL (dev mode — SMTP not configured) ---
To: user@example.com
Subject: Verify your Furalto account
...
```

Copy the link and open: `http://localhost:3000/account/verify-email?token=...`

---

## Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { }
}
```

Errors return `success: false` with `message` and optional `errors[]`.

---

## Project Structure

```
src/
├── config/         # env, database
├── constants/      # HTTP status, API prefix
├── controllers/    # route handlers
├── middlewares/    # auth, validation, errors
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── services/       # business logic
├── validators/     # express-validator rules
└── utils/          # ApiResponse, ApiError, asyncHandler
```
