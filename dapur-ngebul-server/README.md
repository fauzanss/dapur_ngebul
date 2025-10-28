# Dapur Ngebul Server (API)

Instruksi cepat:

1. `cp .env.example .env` lalu sesuaikan credential MySQL.
2. `npm install`
3. `npm run migrate` untuk membuat tabel + seed minimal.
4. `npm run dev` untuk menjalankan server di port 3001.

Endpoint utama:
- GET `/api/menu`
- POST `/api/orders`
- GET `/api/orders/:id`
- GET `/api/orders?date=YYYY-MM-DD`
- GET `/api/sales?date=YYYY-MM-DD`
