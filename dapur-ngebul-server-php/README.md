# Dapur Ngebul Server - PHP

PHP version of the Dapur Ngebul API server.

## Requirements
- PHP 8.0+
- MySQL 8.0+
- Composer (optional, for autoloading)

## Setup

1. Copy `.env.example` to `.env` and configure database:
```bash
cp .env.example .env
```

2. Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=dapur_ngebul
DB_USER=root
DB_PASSWORD=yourpassword
```

3. Run database migrations (same as Node.js version):
```bash
mysql -h localhost -u root -p dapur_ngebul < ../dapur-ngebul-server/src/migrations/create_tables.sql
mysql -h localhost -u root -p dapur_ngebul < ../dapur-ngebul-server/src/migrations/add_customer_name_to_orders.sql
mysql -h localhost -u root -p dapur_ngebul < ../dapur-ngebul-server/src/migrations/seed_menu_from_image.sql
```

4. Run with PHP built-in server:
```bash
php -S localhost:4002 -t .
```

Or use Apache/Nginx with `.htaccess` for URL rewriting.

## API Endpoints

Same as Node.js version:
- `GET /health` - Health check
- `GET /api/menu` - List menu items
- `GET /api/menu/categories` - List categories
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (with date/status filters)
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/sales` - Sales summary (with optional date filter)
- `GET /api/sales/today` - Today's sales
- `GET /api/sales/month-to-date` - Month-to-date sales
- `GET /api/sales/all-time` - All-time sales
- `GET /api/sales/range` - Sales by date range

## Notes
- Uses PDO for database access
- Simple routing system (no framework dependencies)
- CORS enabled for all origins
- Error logging to PHP error log

## Run with Podman Compose

From repository root:

```bash
podman compose up -d --build
podman compose logs -f db api frontend
```

Endpoints:
- Frontend: `http://localhost:8081`
- Backend: `http://localhost:4002/api/health`

