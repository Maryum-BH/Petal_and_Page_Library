<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$u = api_require_role('admin');
header('Content-Type: application/json; charset=utf-8');
try {
    $st = pdo()->prepare('CALL sp_reset_demo_data(?)');
    $st->execute([(int)$u['user_id']]);
    while ($st->nextRowset()) {}
    echo json_encode(['ok'=>true]);
} catch (Throwable $e) {
    error_log('Library reset error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'Could not reset demo database']);
}
