<?php

require_once __DIR__ . '/../../config/db.php';

class SalesController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function summary($req, $res) {
        try {
            $date = $req['query']['date'] ?? null;
            $whereDate = '';
            $params = [];
            if ($date) {
                $whereDate = 'AND s.date = ?';
                $params[] = $date;
            }
            $sql = "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count
                    FROM sales_records s
                    JOIN orders o ON o.id = s.order_id
                    WHERE o.status = 'PAID' $whereDate";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            $row = $stmt->fetch();
            $result = [
                'totalAmount' => (float)($row['total'] ?? 0),
                'totalOrders' => (int)($row['count'] ?? 0),
                'total' => (float)($row['total'] ?? 0),
                'count' => (int)($row['count'] ?? 0)
            ];
            $res->json($result);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil ringkasan penjualan', 'error' => $e->getMessage()]);
        }
    }

    public function today($req, $res) {
        try {
            $stmt = $this->db->query(
                "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count 
                 FROM sales_records s 
                 JOIN orders o ON o.id=s.order_id 
                 WHERE s.date = CURDATE() AND o.status='PAID'"
            );
            $row = $stmt->fetch();
            $res->json([
                'total' => (float)($row['total'] ?? 0),
                'count' => (int)($row['count'] ?? 0)
            ]);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil penjualan hari ini', 'error' => $e->getMessage()]);
        }
    }

    public function monthToDate($req, $res) {
        try {
            $stmt = $this->db->query(
                "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count 
                 FROM sales_records s 
                 JOIN orders o ON o.id=s.order_id 
                 WHERE YEAR(s.date)=YEAR(CURDATE()) AND MONTH(s.date)=MONTH(CURDATE()) AND o.status='PAID'"
            );
            $row = $stmt->fetch();
            $res->json([
                'total' => (float)($row['total'] ?? 0),
                'count' => (int)($row['count'] ?? 0)
            ]);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil penjualan bulan ini', 'error' => $e->getMessage()]);
        }
    }

    public function allTime($req, $res) {
        try {
            $stmt = $this->db->query(
                "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count 
                 FROM sales_records s 
                 JOIN orders o ON o.id=s.order_id 
                 WHERE o.status='PAID'"
            );
            $row = $stmt->fetch();
            $res->json([
                'total' => (float)($row['total'] ?? 0),
                'count' => (int)($row['count'] ?? 0)
            ]);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil total penjualan keseluruhan', 'error' => $e->getMessage()]);
        }
    }

    public function range($req, $res) {
        try {
            $startDate = $req['query']['startDate'] ?? null;
            $endDate = $req['query']['endDate'] ?? null;

            if (!$startDate || !$endDate) {
                return $res->status(400)->json(['message' => 'startDate dan endDate diperlukan']);
            }

            $stmt = $this->db->prepare(
                "SELECT COALESCE(SUM(s.total),0) AS total, COUNT(s.id) AS count
                 FROM sales_records s
                 JOIN orders o ON o.id = s.order_id
                 WHERE o.status = 'PAID' 
                 AND s.date >= ? 
                 AND s.date <= ?"
            );
            $stmt->execute([$startDate, $endDate]);
            $row = $stmt->fetch();

            $res->json([
                'total' => (float)($row['total'] ?? 0),
                'count' => (int)($row['count'] ?? 0),
                'startDate' => $startDate,
                'endDate' => $endDate
            ]);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil penjualan berdasarkan range', 'error' => $e->getMessage()]);
        }
    }
}

