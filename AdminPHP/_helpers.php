<?php
// Admin helpers shared by every AdminPHP endpoint.
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';

// Step 1: write one row to activity_log so it shows under "Recent Staff Activity" on the Overview.
// The actor's name is read from the users table (not from the browser).
function log_activity(PDO $pdo, array $user, string $action, string $item, string $entityType, ?int $entityId): void {
    $st = $pdo->prepare('SELECT full_name FROM users WHERE user_id = ?');
    $st->execute([(int)$user['user_id']]);
    $name = (string)($st->fetchColumn() ?: ($user['name'] ?? 'Admin'));

    $ins = $pdo->prepare(
        'INSERT INTO activity_log (user_id, actor_name, action, item, entity_type, entity_id)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    $ins->execute([(int)$user['user_id'], $name, $action, text_cut($item, 200), $entityType, $entityId]);
}

// Step 2: pages send JSON for add / edit / delete; this reads it and checks the request is a POST.
function post_json(): array {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        api_error('Use POST for changes', 405);
    }
    return json_input();
}

// Step 3: UTF-8 safe length / cut that work even when PHP's mbstring extension is switched off.
function text_len(string $s): int { return (int)preg_match_all('/./su', $s); }
function text_cut(string $s, int $max): string { preg_match('/^.{0,' . $max . '}/su', $s, $m); return $m[0] ?? ''; }
