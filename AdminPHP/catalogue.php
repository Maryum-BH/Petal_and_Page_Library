<?php
// Admin > Catalogue and Categories
//   GET                      -> every category with its title counts (from v_category_stats)
//   POST {action:'add',    name, parent_id}   -> new category
//   POST {action:'toggle', category_id}       -> switch Active / Inactive
//   POST {action:'delete', category_id}       -> delete (only if empty)
declare(strict_types=1);
require_once __DIR__ . '/_helpers.php';
$admin = api_require_role('admin');

// Step 1: the list the page shows (counts come from the view, never typed in HTML)
function load_categories(PDO $pdo): array {
    $rows = $pdo->query(
        "SELECT s.category_id, s.category, s.parent_category, s.is_active, s.titles, s.physical_titles, s.digital_titles
         FROM v_category_stats s ORDER BY s.category"
    )->fetchAll();
    return array_map(fn($r) => [
        'id'       => (int)$r['category_id'],
        'name'     => $r['category'],
        'parent'   => $r['parent_category'],
        'active'   => (bool)$r['is_active'],
        'titles'   => (int)$r['titles'],
        'physical' => (int)$r['physical_titles'],
        'digital'  => (int)$r['digital_titles'],
    ], $rows);
}

try {
    $pdo = pdo();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        api_ok(['categories' => load_categories($pdo)]);
    }

    $in = post_json();
    $action = (string)($in['action'] ?? '');

    if ($action === 'add') {
        // Step 2: check the name and the parent
        $name = trim((string)($in['name'] ?? ''));
        $parentId = ($in['parent_id'] ?? null) ? (int)$in['parent_id'] : null;
        if ($name === '') api_error('Please enter a category name.');
        if (text_len($name) > 80) api_error('Category name is too long (80 characters max).');

        $st = $pdo->prepare('SELECT COUNT(*) FROM categories WHERE LOWER(name) = LOWER(?)');
        $st->execute([$name]);
        if ((int)$st->fetchColumn() > 0) api_error('That category already exists.');

        if ($parentId !== null) {
            // categories can only go 3 levels deep (Fiction > Graphic Novels > Manga)
            $st = $pdo->prepare(
                'SELECT p.category_id, p.parent_category_id, g.parent_category_id AS grand
                 FROM categories p LEFT JOIN categories g ON g.category_id = p.parent_category_id
                 WHERE p.category_id = ?'
            );
            $st->execute([$parentId]);
            $p = $st->fetch();
            if (!$p) api_error('The parent category was not found.');
            if ($p['parent_category_id'] !== null && $p['grand'] !== null) {
                api_error('Categories can only go three levels deep.');
            }
        }

        // Step 3: save, then log it
        $pdo->beginTransaction();
        $st = $pdo->prepare('INSERT INTO categories (name, parent_category_id) VALUES (?, ?)');
        $st->execute([$name, $parentId]);
        $newId = (int)$pdo->lastInsertId();
        log_activity($pdo, $admin, 'Added category', $name, 'category', $newId);
        $pdo->commit();
        api_ok(['categories' => load_categories($pdo), 'message' => "\"$name\" added."]);
    }

    // toggle and delete both start from an existing category
    $id = (int)($in['category_id'] ?? 0);
    $st = $pdo->prepare('SELECT category_id, name, is_active FROM categories WHERE category_id = ?');
    $st->execute([$id]);
    $cat = $st->fetch();
    if (!$cat) api_error('Category not found.', 404);

    if ($action === 'toggle') {
        $new = $cat['is_active'] ? 0 : 1;
        $pdo->beginTransaction();
        $pdo->prepare('UPDATE categories SET is_active = ? WHERE category_id = ?')->execute([$new, $id]);
        log_activity($pdo, $admin, $new ? 'Activated category' : 'Deactivated category', $cat['name'], 'category', $id);
        $pdo->commit();
        api_ok(['categories' => load_categories($pdo)]);
    }

    if ($action === 'delete') {
        // a category that still holds books or sub-categories must not be deleted
        $st = $pdo->prepare('SELECT COUNT(*) FROM books WHERE category_id = ?');
        $st->execute([$id]);
        if ((int)$st->fetchColumn() > 0) api_error('This category still has books. Move them first.');
        $st = $pdo->prepare('SELECT COUNT(*) FROM categories WHERE parent_category_id = ?');
        $st->execute([$id]);
        if ((int)$st->fetchColumn() > 0) api_error('This category has sub-categories. Delete or move them first.');

        $pdo->beginTransaction();
        $pdo->prepare('DELETE FROM categories WHERE category_id = ?')->execute([$id]);
        log_activity($pdo, $admin, 'Deleted category', $cat['name'], 'category', $id);
        $pdo->commit();
        api_ok(['categories' => load_categories($pdo)]);
    }

    api_error('Unknown action.');
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('Admin catalogue error: ' . $e->getMessage());
    api_error('Could not complete that request.', 500);
}
