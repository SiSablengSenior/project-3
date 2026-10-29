<?php
declare(strict_types=1);
$configPath = __DIR__ . '/../config/config.php';
if (!is_file($configPath)) { http_response_code(503); exit('Backend belum dikonfigurasi.'); }
$config = require $configPath;
header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && hash_equals($config['allowed_origin'], $origin)) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
  header('Access-Control-Allow-Credentials: true');
  header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Strict');
session_start();
try {
  $pdo = new PDO(
    "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
    $config['db_user'], $config['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
  );
} catch (Throwable $e) { http_response_code(503); echo json_encode(['error'=>'Database unavailable']); exit; }
function body(): array { return json_decode(file_get_contents('php://input'), true) ?? []; }
function out(array $data, int $status=200): never { http_response_code($status); echo json_encode($data); exit; }
function require_login(): void { if (empty($_SESSION['user_id'])) out(['error'=>'Unauthorized'],401); }
function csrf(): void {
  $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
  if (!$token || !hash_equals($_SESSION['csrf'] ?? '', $token)) out(['error'=>'CSRF validation failed'],403);
}
