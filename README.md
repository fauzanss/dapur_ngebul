# Dapur Ngebul — Run Locally

## Requirements

- Node.js 20+
- npm 10+
- Docker + Docker Compose (optional, recommended)

## Monorepo Layout

- `dapur-ngebul-client/` — Expo/React Native app
- `dapur-ngebul-server/` — Express API (MySQL)

## Quick Start (Docker)

This starts MySQL and the API, runs migrations + seed automatically.

```bash
# from repo root
docker compose up -d
# API → http://localhost:3001
# MySQL → localhost:3306 (db: dapur_ngebul, user: appuser, pass: apppass)
```

To stop:

```bash
docker compose down
```

## Run Server Locally (without Docker)

1. Start MySQL (any instance) and create database `dapur_ngebul`.

2. Create `.env` inside `dapur-ngebul-server/`:

```bash
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=dapur_ngebul
```

3. Install and run migrations:

```bash
cd dapur-ngebul-server
npm install
# run base tables
mysql -h $DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < src/migrations/create_tables.sql
# optional migrations & seed
mysql -h $DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < src/migrations/add_customer_name_to_orders.sql
mysql -h $DB_HOST -u$DB_USER -p$DB_PASSWORD $DB_NAME < src/migrations/seed_menu_from_image.sql

# start API
npm run dev
# or
npm start
```

API will be available at `http://localhost:3001`.

## Run Client (Expo)

In a separate terminal:

```bash
cd dapur-ngebul-client
npm install
# start Expo
npm run start
\n+# or run directly on Web
npm run web
```

- Press `w` to open Web in the browser.
- Make sure the API base URL is correct in `dapur-ngebul-client/constants/config.ts` (defaults to `http://localhost:3001`).

## Environment Notes

- The server reads `.env` from `dapur-ngebul-server/.env`.
- Default DB name is `dapur_ngebul`.
- With Docker Compose, credentials are set automatically and containers depend on DB readiness; migrations + seed are applied once via the `migrator` service.

## Common Troubleshooting

- Port already in use: stop the conflicting service or change `PORT` in server `.env`.
- MySQL connection refused: verify DB credentials and that MySQL is listening on the expected host/port.
- Client cannot reach API: confirm `API_BASE` in `constants/config.ts` points to `http://localhost:3001` (or your host IP if using device).
