# Coinbase Clone Backend API

This project is the Node.js, Express, and MongoDB backend for the student Coinbase-style frontend in `coinbase-clone-joyAj2`. It provides JWT authentication, cookie-based session persistence, and cryptocurrency listing endpoints with initial seed data.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- cookie-parser and CORS for browser integration

## Setup

1. Open `D:\Joy\l300\IA\interim-assesment-joyAj2`
2. Install dependencies with `npm install`
3. Copy `.env.example` values into `.env`
4. Update:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
5. Start the server:
   - Development: `npm run dev`
   - Production: `npm start`

The API runs on `http://localhost:5000` by default.

## Environment Variables

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Auth

#### `POST /api/auth/register`

- Auth required: No
- Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

- Success response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "68076c919e73fef7ecf53b98",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

#### `POST /api/auth/login`

- Auth required: No
- Body:

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

- Success response:

```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "68076c919e73fef7ecf53b98",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

#### `GET /api/auth/profile`

- Auth required: Yes
- Send JWT using either:
  - `Authorization: Bearer <token>`
  - HTTP-only `token` cookie
- Success response:

```json
{
  "id": "68076c919e73fef7ecf53b98",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2026-04-22T12:00:00.000Z"
}
```

#### `POST /api/auth/logout`

- Auth required: No
- Success response:

```json
{
  "message": "Logged out successfully"
}
```

### Crypto

#### `GET /api/crypto`

- Auth required: No
- Success response: array of cryptocurrencies sorted by newest first

#### `GET /api/crypto/gainers`

- Auth required: No
- Success response: array of cryptocurrencies where `change24h > 0`, sorted by highest gain first

#### `GET /api/crypto/new`

- Auth required: No
- Success response: array of the 20 newest cryptocurrencies

#### `POST /api/crypto`

- Auth required: No
- Body:

```json
{
  "name": "Sui",
  "symbol": "SUI",
  "price": 3.88,
  "image": "https://example.com/sui.png",
  "change24h": 5.44
}
```

- Success response:

```json
{
  "message": "Cryptocurrency added successfully",
  "crypto": {
    "_id": "68076d169e73fef7ecf53b99",
    "name": "Sui",
    "symbol": "SUI",
    "price": 3.88,
    "image": "https://example.com/sui.png",
    "change24h": 5.44,
    "createdAt": "2026-04-22T12:05:00.000Z",
    "updatedAt": "2026-04-22T12:05:00.000Z"
  }
}
```

## Seed Data

On first run, the server seeds 10 realistic cryptocurrencies if the `Crypto` collection is empty:

- BTC
- ETH
- BNB
- SOL
- ADA
- DOGE
- XRP
- AVAX
- MATIC
- LINK

## Quick Testing

Example register request:

```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Jane Doe\",\"email\":\"jane@example.com\",\"password\":\"secret123\"}"
```

Example login request:

```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"jane@example.com\",\"password\":\"secret123\"}"
```

Example crypto request:

```bash
curl http://localhost:5000/api/crypto
```

## Deployment Notes for Render

- Create a new Web Service on Render
- Set the root directory to `interim-assesment-joyAj2`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables in the Render dashboard:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `PORT`
  - `FRONTEND_URL`
- Set `FRONTEND_URL` to your deployed frontend origin

