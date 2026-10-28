<?php
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');
try {
    $raw = file_get_contents('php://input') ?: '';
    $json = json_decode($raw, true);
    $in = is_array($json) ? $json : $_POST;
    $name = trim((string)($in['name'] ?? 'Reader')) ?: 'Reader';
    $email = strtolower(trim((string)($in['email'] ?? '')));
    $password = (string)($in['password'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Enter a valid email']); exit; }
    if (strlen($password) < 6) { http_response_code(422); echo json_encode(['ok'=>false,'error'=>'Password needs at least 6 characters']); exit; }
    $pdo = pdo();
    $st = $pdo->prepare('SELECT user_id FROM users WHERE LOWER(TRIM(email))=? LIMIT 1');
    $st->execute([$email]);
    if ($st->fetch()) { http_response_code(409); echo json_encode(['ok'=>false,'error'=>'An account with this email already exists']); exit; }
    $username = preg_replace('/[^a-z0-9_]/', '', strtolower(strtok($email, '@'))) ?: 'reader';
    $baseName = $username; $n = 1;
    while (true) { $q=$pdo->prepare('SELECT user_id FROM users WHERE username=?'); $q->execute([$username]); if (!$q->fetch()) break; $username=$baseName.$n++; }
    $next = (int)$pdo->query('SELECT COALESCE(MAX(user_id),0)+1 FROM users')->fetchColumn();
    $libraryId = 'LIB-' . str_pad((string)$next, 5, '0', STR_PAD_LEFT);
    $nickname = trim(explode(' ', $name)[0]);
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $pdo->prepare("INSERT INTO users (library_id,role,full_name,nickname,username,email,password_hash,plan_id,account_status,joined_on) VALUES (?,?,?,?,?,?,?,1,'active',CURDATE())")
        ->execute([$libraryId,'reader',$name,$nickname,$username,$email,$hash]);
    $uid = (int)$pdo->lastInsertId();
    $_SESSION['library_user'] = ['user_id'=>$uid,'library_id'=>$libraryId,'role'=>'reader','name'=>$name,'nickname'=>$nickname,'email'=>$email,'plan_id'=>1,'plan_name'=>'Basic'];
    echo json_encode(['ok'=>true,'user'=>$_SESSION['library_user'],'redirect'=>'../guest_user/dashboard.php']);
} catch (Throwable $e) {
    error_log('Library signup error: '.$e->getMessage());
    http_response_code(500);
    echo json_encode(['ok'=>false,'error'=>'Could not create the account. Check the database connection.']);
}
