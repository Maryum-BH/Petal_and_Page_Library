<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

try {
    // Accept JSON (the current frontend) and regular HTML form submissions.
    $raw = file_get_contents('php://input') ?: '';
    $json = json_decode($raw, true);
    $in = is_array($json) ? $json : $_POST;
    $email = strtolower(trim((string)($in['email'] ?? '')));
    $password = (string)($in['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        http_response_code(422);
        echo json_encode(['ok'=>false, 'error'=>'Enter a valid email and password']);
        exit;
    }

    $pdo = pdo();
    $st = $pdo->prepare('SELECT u.*, mp.name AS plan_name FROM users u LEFT JOIN membership_plans mp ON mp.plan_id=u.plan_id WHERE LOWER(TRIM(u.email))=? LIMIT 1');
    $st->execute([$email]);
    $u = $st->fetch();

    if (!$u || ($u['account_status'] ?? '') !== 'active') {
        http_response_code(401);
        echo json_encode(['ok'=>false, 'error'=>'Invalid email or password']);
        exit;
    }

    $stored = (string)($u['password_hash'] ?? '');
    $valid = false;
    if (str_starts_with($stored, 'pbkdf2_sha256$')) {
        $parts = explode('$', $stored, 4);
        if (count($parts) === 4) {
            [, $iterations, $salt, $encoded] = $parts;
            $calculated = base64_encode(hash_pbkdf2('sha256', $password, $salt, (int)$iterations, 32, true));
            $valid = hash_equals($encoded, $calculated);
        }
    } else {
        $valid = password_verify($password, $stored);
    }

    if (!$valid) {
        http_response_code(401);
        echo json_encode(['ok'=>false, 'error'=>'Invalid email or password']);
        exit;
    }

    $pdo->prepare('UPDATE users SET last_login_at=NOW() WHERE user_id=?')->execute([$u['user_id']]);
    $_SESSION['library_user'] = [
        'user_id'=>(int)$u['user_id'],
        'library_id'=>$u['library_id'],
        'role'=>$u['role'],
        'name'=>$u['full_name'],
        'nickname'=>$u['nickname'],
        'email'=>$u['email'],
        'plan_id'=>$u['plan_id'] ? (int)$u['plan_id'] : null,
        'plan_name'=>$u['plan_name'] ?? null
    ];

    $base = rtrim(dirname(dirname(str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '/UserPHP/login.php'))), '/');
    $redirect = $base . ($u['role'] === 'admin' ? '/admin/index.php' : ($u['role'] === 'librarian' ? '/librarian/html-css/Dashboard.php' : '/guest_user/dashboard.php'));
    echo json_encode(['ok'=>true, 'user'=>$_SESSION['library_user'], 'redirect'=>$redirect]);
} catch (Throwable $e) {
    error_log('Library login error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok'=>false, 'error'=>'Server/database error. Check that library_db is imported and MySQL is running.']);
}
