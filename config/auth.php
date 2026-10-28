<?php
// Shared authentication/session helpers for the Library Management System.
declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
function current_user(): ?array {
    return $_SESSION['library_user'] ?? null;
}
function require_login(?string $role = null): array {
    $u = current_user();
    if (!$u) {
        header('Location: ../index.php');
        exit;
    }
    if ($role !== null && ($u['role'] ?? '') !== $role) {
        if (($u['role'] ?? '') === 'admin') {
            header('Location: ../admin/index.php');
        } elseif (($u['role'] ?? '') === 'librarian') {
            header('Location: ../librarian/html-css/Dashboard.php');
        } else {
            header('Location: ../guest_user/dashboard.php');
        }
        exit;
    }
    return $u;
}
function api_require_role(?string $role = null): array {
    $u = current_user();
    if (!$u) {
        http_response_code(401);
        api_error('Please log in first');
    }
    if ($role !== null && ($u['role'] ?? '') !== $role) {
        http_response_code(403);
        api_error('You do not have permission to use this feature');
    }
    return $u;
}
function api_ok(mixed $data): never {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok'=>true,'data'=>$data], JSON_UNESCAPED_UNICODE);
    exit;
}
function api_error(string $message, int $status=400): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok'=>false,'error'=>$message], JSON_UNESCAPED_UNICODE);
    exit;
}
