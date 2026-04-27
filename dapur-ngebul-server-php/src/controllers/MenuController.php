<?php

require_once __DIR__ . '/../../config/db.php';

class MenuController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function list($req, $res) {
        try {
            $category = $req['query']['category'] ?? null;
            $whereParts = [];
            $params = [];

            if ($category) {
                $whereParts[] = 'category = :category';
                $params['category'] = $category;
            }

            $where = '';
            if (!empty($whereParts)) {
                $where = 'WHERE ' . implode(' AND ', $whereParts);
            }

            $recommendedStmt = $this->db->query(
                "SELECT menu_item_id
                 FROM order_items
                 GROUP BY menu_item_id
                 ORDER BY SUM(quantity) DESC, MAX(order_id) DESC
                 LIMIT 3"
            );
            $recommendedRows = $recommendedStmt->fetchAll();
            $recommendedIds = array_map(function($row) {
                return (int)$row['menu_item_id'];
            }, $recommendedRows);
            $recommendedMap = array_flip($recommendedIds);

            $stmt = $this->db->prepare("SELECT * FROM menu_items $where ORDER BY id ASC");
            $stmt->execute($params);
            $items = $stmt->fetchAll();
            foreach ($items as &$item) {
                $item['is_recommended'] = isset($recommendedMap[(int)$item['id']]);
            }
            $res->json($items);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil menu', 'error' => $e->getMessage()]);
        }
    }

    public function categories($req, $res) {
        try {
            $stmt = $this->db->query(
                "SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL AND category <> '' ORDER BY category ASC"
            );
            $rows = $stmt->fetchAll();
            $categories = array_column($rows, 'category');
            $res->json($categories);
        } catch (Exception $e) {
            $res->status(500)->json(['message' => 'Gagal mengambil kategori', 'error' => $e->getMessage()]);
        }
    }
}

