<?php
// Admin > Author Database
//   GET                                          -> all authors (v_author_stats; "Titles Held" is counted, never typed)
//   POST {action:'add',    name, genre}          -> new author (rights start as Pending Review)
//   POST {action:'edit',   author_id, name, genre, rights}
//   POST {action:'delete', author_id}            -> only if the author holds no titles
declare(strict_types=1);
require_once __DIR__ . '/_helpers.php';
$admin = api_require_role('admin');

const RIGHTS = ['Cleared', 'Pending Review', 'Public Domain'];

// Step 1: the list the page shows
function load_authors(PDO $pdo): array {
    $rows = $pdo->query(
        "SELECT author_id, name, primary_genre, rights_status, titles_held,
                DATE_FORMAT(updated_at, '%d %b %Y') AS updated, updated_at AS updated_raw
         FROM v_author_stats ORDER BY name"
    )->fetchAll();
    return array_map(fn($r) => [
        'id' => (int)$r['author_id'], 'name' => $r['name'], 'genre' => $r['primary_genre'],
        'titles' => (int)$r['titles_held'], 'rights' => $r['rights_status'],
        'updated' => $r['updated'], 'updated_raw' => $r['updated_raw'],
    ], $rows);
}

// Step 2: name + genre checks shared by add and edit
function clean_name_genre(array $in): array {
    $name = trim((string)($in['name'] ?? ''));
    $genre = trim((string)($in['genre'] ?? ''));
    if ($name === '' || $genre === '') api_error('Name and genre are both required.');
    if (text_len($name) > 100 || text_len($genre) > 60) api_error('Name or genre is too long.');
    return [$name, $genre];
}

try {
    $pdo = pdo();
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        api_ok(['authors' => load_authors($pdo)]);
    }

    $in = post_json();
    $action = (string)($in['action'] ?? '');

    if ($action === 'add') {
        [$name, $genre] = clean_name_genre($in);
        $st = $pdo->prepare('SELECT COUNT(*) FROM authors WHERE LOWER(name) = LOWER(?)');
        $st->execute([$name]);
        if ((int)$st->fetchColumn() > 0) api_error('An author with that name already exists.');

        $pdo->beginTransaction();
        $pdo->prepare("INSERT INTO authors (name, primary_genre, rights_status) VALUES (?, ?, 'Pending Review')")
            ->execute([$name, $genre]);
        $id = (int)$pdo->lastInsertId();
        log_activity($pdo, $admin, 'Added author', $name, 'author', $id);
        $pdo->commit();
        api_ok(['authors' => load_authors($pdo), 'message' => "$name saved."]);
    }

    // edit and delete start from an existing author
    $id = (int)($in['author_id'] ?? 0);
    $st = $pdo->prepare('SELECT author_id, name FROM authors WHERE author_id = ?');
    $st->execute([$id]);
    $author = $st->fetch();
    if (!$author) api_error('Author not found.', 404);

    if ($action === 'edit') {
        [$name, $genre] = clean_name_genre($in);
        $rights = (string)($in['rights'] ?? '');
        if (!in_array($rights, RIGHTS, true)) api_error('Choose a valid rights status.');
        $st = $pdo->prepare('SELECT COUNT(*) FROM authors WHERE LOWER(name) = LOWER(?) AND author_id <> ?');
        $st->execute([$name, $id]);
        if ((int)$st->fetchColumn() > 0) api_error('Another author already has that name.');

        $pdo->beginTransaction();
        $pdo->prepare('UPDATE authors SET name = ?, primary_genre = ?, rights_status = ? WHERE author_id = ?')
            ->execute([$name, $genre, $rights, $id]);
        log_activity($pdo, $admin, 'Updated author', $name, 'author', $id);
        $pdo->commit();
        api_ok(['authors' => load_authors($pdo), 'message' => 'Author updated.']);
    }

    if ($action === 'delete') {
        $st = $pdo->prepare('SELECT COUNT(*) FROM book_authors WHERE author_id = ?');
        $st->execute([$id]);
        if ((int)$st->fetchColumn() > 0) api_error('This author still has titles in the catalogue, so they cannot be deleted.');

        $pdo->beginTransaction();
        $pdo->prepare('DELETE FROM authors WHERE author_id = ?')->execute([$id]);
        log_activity($pdo, $admin, 'Deleted author', $author['name'], 'author', $id);
        $pdo->commit();
        api_ok(['authors' => load_authors($pdo), 'message' => 'Author deleted.']);
    }

    api_error('Unknown action.');
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('Admin authors error: ' . $e->getMessage());
    api_error('Could not complete that request.', 500);
}
