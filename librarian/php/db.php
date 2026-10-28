<?php
declare(strict_types=1);
require_once __DIR__ . '/../../config/auth.php';

$host = 'localhost';
$dbname = 'library_db';
$dbuser = 'root';
$dbpass = '';

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    global $host, $dbname, $dbuser, $dbpass;
    try {
        $pdo = new PDO(
            "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
            $dbuser, $dbpass,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log($e->getMessage());
        api_error('Could not connect to the database. Import database.sql and check XAMPP MySQL.', 500);
    }
}
function input_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '{}', true);
    return is_array($data) ? $data : [];
}
