<?php

require_once __DIR__ . '/../../config/db.php';

class OrderController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($req, $res) {
        $body = $req['body'] ?? [];
        $orderUuid = $body['order_uuid'] ?? null;
        $cashier = $body['cashier'] ?? 'Kasir';
        $items = $body['items'] ?? [];
        $paidAmount = $body['paid_amount'] ?? null;
        $customerName = $body['customer_name'] ?? null;

        if (!$orderUuid || !is_array($items) || count($items) === 0) {
            return $res->status(400)->json(['message' => 'order_uuid dan items wajib']);
        }

        $this->db->beginTransaction();
        try {
            $total = 0;
            $menuIds = array_map(fn($i) => $i['menu_item_id'], $items);
            $placeholders = implode(',', array_fill(0, count($menuIds), '?'));
            $stmt = $this->db->prepare("SELECT * FROM menu_items WHERE id IN ($placeholders)");
            $stmt->execute($menuIds);
            $menuList = $stmt->fetchAll();
            $menuMap = [];
            foreach ($menuList as $m) {
                $menuMap[$m['id']] = $m;
            }

            foreach ($items as $i) {
                $menuItem = $menuMap[$i['menu_item_id']] ?? null;
                $price = $i['price'] ?? ($menuItem ? (float)$menuItem['price'] : 0);
                $total += $price * ($i['quantity'] ?? 1);
            }

            $stmt = $this->db->prepare(
                "INSERT INTO orders (order_uuid, cashier, total_amount, paid_amount, status, customer_name, created_at) 
                 VALUES (?, ?, ?, ?, 'COOKING', ?, NOW())"
            );
            $stmt->execute([$orderUuid, $cashier, $total, $paidAmount, $customerName]);
            $orderId = $this->db->lastInsertId();

            foreach ($items as $i) {
                $menuItem = $menuMap[$i['menu_item_id']] ?? null;
                $stmt = $this->db->prepare(
                    "INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, note) 
                     VALUES (?, ?, ?, ?, ?, ?)"
                );
                $stmt->execute([
                    $orderId,
                    $i['menu_item_id'],
                    $i['name'] ?? ($menuItem ? $menuItem['name'] : ''),
                    $i['price'] ?? ($menuItem ? $menuItem['price'] : 0),
                    $i['quantity'] ?? 1,
                    $i['note'] ?? null
                ]);
            }

            $stmt = $this->db->prepare("INSERT INTO sales_records (order_id, date, total) VALUES (?, CURDATE(), ?)");
            $stmt->execute([$orderId, $total]);

            $this->db->commit();
            $order = $this->getByIdInternal($orderId);
            $res->status(201)->json($order);
        } catch (Exception $e) {
            $this->db->rollBack();
            $res->status(500)->json(['message' => 'Gagal membuat order', 'error' => $e->getMessage()]);
        }
    }

    public function getById($req, $res) {
        try {
            $id = $req['params']['id'] ?? null;
            if (!$id) {
                return $res->status(400)->json(['message' => 'ID diperlukan']);
            }
            $order = $this->getByIdInternal($id);
            if (!$order) {
                return $res->status(404)->json(['message' => 'Order tidak ditemukan']);
            }
            $res->json($order);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil order', 'error' => $e->getMessage()]);
        }
    }

    public function listByDate($req, $res) {
        try {
            $date = $req['query']['date'] ?? null;
            $status = $req['query']['status'] ?? null;

            $where = [];
            $params = [];
            if ($date) {
                $where[] = "DATE(o.created_at) = ?";
                $params[] = $date;
            }
            if ($status) {
                $where[] = "o.status = ?";
                $params[] = strtoupper($status);
            }
            $whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

            $sql = "SELECT o.* FROM orders o $whereClause ORDER BY o.id DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $orders = $stmt->fetchAll();

            foreach ($orders as $key => $order) {
                $orders[$key]['items'] = $this->getOrderItems($order['id']);
            }

            $res->json($orders);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil daftar order', 'error' => $e->getMessage()]);
        }
    }

    public function updateStatus($req, $res) {
        try {
            $id = $req['params']['id'] ?? null;
            $status = $req['body']['status'] ?? null;

            if (!$id || !$status) {
                return $res->status(400)->json(['message' => 'ID dan status wajib']);
            }

            $status = strtoupper($status);
            $allowed = ['COOKING', 'DELIVERED', 'CANCELLED', 'PAID'];
            if (!in_array($status, $allowed)) {
                return $res->status(400)->json(['message' => 'status tidak valid']);
            }

            $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
            $stmt->execute([$id]);
            $order = $stmt->fetch();
            if (!$order) {
                return $res->status(404)->json(['message' => 'Order tidak ditemukan']);
            }

            $stmt = $this->db->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);

            $updated = $this->getByIdInternal($id);
            $res->json($updated);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal update status order', 'error' => $e->getMessage()]);
        }
    }

    private function getByIdInternal($id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if ($order) {
            $order['items'] = $this->getOrderItems($id);
        }
        return $order;
    }

    private function getOrderItems($orderId) {
        $stmt = $this->db->prepare("SELECT * FROM order_items WHERE order_id = ?");
        $stmt->execute([$orderId]);
        return $stmt->fetchAll();
    }
}

