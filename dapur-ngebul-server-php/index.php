<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/vendor/autoload.php';

// Load .env if exists
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/src/utils/Router.php';
require_once __DIR__ . '/src/utils/Response.php';
require_once __DIR__ . '/src/controllers/MenuController.php';
require_once __DIR__ . '/src/controllers/OrderController.php';
require_once __DIR__ . '/src/controllers/SalesController.php';

// Handle OPTIONS for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}

$router = new Router();

// Health check
$router->get('/api/health', function($req, $res) {
    $res->json(['ok' => true]);
});

// Menu routes
$router->get('/api/menu', [MenuController::class, 'list']);
$router->get('/api/menu/categories', [MenuController::class, 'categories']);

// Order routes
$router->post('/api/orders', [OrderController::class, 'create']);
$router->get('/api/orders/:id', [OrderController::class, 'getById']);
$router->get('/api/orders', [OrderController::class, 'listByDate']);
$router->patch('/api/orders/:id/status', [OrderController::class, 'updateStatus']);

// Sales routes
$router->get('/api/sales', [SalesController::class, 'summary']);
$router->get('/api/sales/today', [SalesController::class, 'today']);
$router->get('/api/sales/month-to-date', [SalesController::class, 'monthToDate']);
$router->get('/api/sales/all-time', [SalesController::class, 'allTime']);
$router->get('/api/sales/range', [SalesController::class, 'range']);

try {
    $router->dispatch($_SERVER['REQUEST_URI'], $_SERVER['REQUEST_METHOD']);
} catch (Exception $e) {
    error_log('Error: ' . $e->getMessage());
    $res = new Response();
    $res->status(500)->json(['message' => 'Internal Server Error']);
}

