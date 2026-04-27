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
            $recommended = $req['query']['recommended'] ?? null;
            $whereParts = [];
            $params = [];

            if ($category) {
                $whereParts[] = 'category = :category';
                $params['category'] = $category;
            }

            if ($recommended !== null) {
                $recommendedFlag = filter_var($recommended, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($recommendedFlag !== null) {
                    $whereParts[] = 'COALESCE(is_recommended, 0) = :is_recommended';
                    $params['is_recommended'] = $recommendedFlag ? 1 : 0;
                }
            }

            $where = '';
            if (!empty($whereParts)) {
                $where = 'WHERE ' . implode(' AND ', $whereParts);
            }

            $stmt = $this->db->prepare("SELECT * FROM menu_items $where ORDER BY COALESCE(is_recommended, 0) DESC, id ASC");
            $stmt->execute($params);
            $items = $stmt->fetchAll();
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

