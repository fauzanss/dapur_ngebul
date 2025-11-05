<?php

class Response {
    private $statusCode = 200;
    private $headers = [];

    public function status($code) {
        $this->statusCode = $code;
        return $this;
    }

    public function json($data) {
        http_response_code($this->statusCode);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        echo json_encode($data);
        exit;
    }
}

