<?php

class Router {
    private $routes = [];

    public function get($path, $handler) {
        $this->routes[] = ['method' => 'GET', 'path' => $path, 'handler' => $handler];
    }

    public function post($path, $handler) {
        $this->routes[] = ['method' => 'POST', 'path' => $path, 'handler' => $handler];
    }

    public function patch($path, $handler) {
        $this->routes[] = ['method' => 'PATCH', 'path' => $path, 'handler' => $handler];
    }

    public function dispatch($requestUri, $method) {
        $parsed = parse_url($requestUri);
        $path = $parsed['path'] ?? '/';
        parse_str($parsed['query'] ?? '', $query);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $pattern = $this->pathToRegex($route['path']);
            if (preg_match($pattern, $path, $matches)) {
                array_shift($matches);
                $params = [];
                $paramNames = $this->extractParamNames($route['path']);
                foreach ($paramNames as $i => $name) {
                    $params[$name] = $matches[$i] ?? null;
                }

                $req = [
                    'params' => $params,
                    'query' => $query,
                    'body' => $this->getRequestBody()
                ];
                $res = new Response();

                if (is_array($route['handler']) && count($route['handler']) === 2) {
                    [$controller, $method] = $route['handler'];
                    $controllerInstance = new $controller();
                    $controllerInstance->$method($req, $res);
                } else {
                    call_user_func($route['handler'], $req, $res);
                }
                return;
            }
        }

        $res = new Response();
        $res->status(404)->json(['message' => 'Not Found']);
    }

    private function pathToRegex($path) {
        $pattern = preg_replace('/\/:(\w+)/', '/([^/]+)', $path);
        return '#^' . $pattern . '$#';
    }

    private function extractParamNames($path) {
        preg_match_all('/\/:(\w+)/', $path, $matches);
        return $matches[1] ?? [];
    }

    private function getRequestBody() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        return $data ?? [];
    }
}

