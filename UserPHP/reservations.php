<?php
// Reader > My Reservations
// The reader's reservations are saved in the `reservations` table, so the librarian sees them too.
//   GET                                              -> this reader's reservations
//   POST {action:'create', title, mode, date, slot}  -> reserve a copy (or join the queue if none is free)
//   POST {action:'cancel', id}                       -> cancel one of this reader's reservations
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
$me = api_require_role('reader');
$userId = (int)$me['user_id'];

// Step 1: this reader's reservations, in the shape the reader pages already use
function my_reservations(PDO $pdo, int $userId): array {
    $st = $pdo->prepare(
        "SELECT r.reservation_id, b.title, r.mode, r.status, r.slot_date, ts.label AS slot, r.desk_label,
                r.queue_position, c.shelf_location,
                (r.status IN ('reserved','queued') AND (r.expires_at IS NULL OR r.expires_at > NOW())) AS is_open
         FROM reservations r
         JOIN books b ON b.book_id = r.book_id
         LEFT JOIN time_slots ts ON ts.slot_id = r.slot_id
         LEFT JOIN book_copies c ON c.copy_id = r.copy_id
         WHERE r.user_id = ? AND r.status <> 'cancelled'
         ORDER BY r.created_at DESC, r.reservation_id DESC"
    );
    $st->execute([$userId]);
    $out = [];
    foreach ($st->fetchAll() as $r) {
        $out[] = [
            'id'    => (int)$r['reservation_id'],
            'title' => $r['title'],
            'mode'  => $r['mode'] === 'queue' ? 'queue' : ($r['mode'] === 'borrow_pickup' ? 'borrow' : 'library'),
            'date'  => $r['slot_date'],
            'slot'  => $r['slot'],
            'desk'  => $r['desk_label'],
            'shelf' => $r['shelf_location'],
            'pos'   => $r['queue_position'] !== null ? (int)$r['queue_position'] : null,
            'done'  => !(bool)$r['is_open'],     // picked up, expired, shelved ... = not an open reservation any more
        ];
    }
    return $out;
}

try {
    $pdo = pdo();
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
        api_ok(['reservations' => my_reservations($pdo, $userId)]);
    }
    $in = json_input();
    $action = (string)($in['action'] ?? '');

    if ($action === 'create') {
        // Step 2: which book? (the reader pages know books by title)
        $st = $pdo->prepare('SELECT book_id, title FROM books WHERE title = ? AND is_active = 1 LIMIT 1');
        $st->execute([(string)($in['title'] ?? '')]);
        $book = $st->fetch();
        if (!$book) api_error('That book is not in the library catalogue.', 404);
        $bookId = (int)$book['book_id'];

        $pdo->beginTransaction();

        // Step 3: the reader's plan limits come from membership_plans
        $st = $pdo->prepare('SELECT mp.physical_loan_limit, mp.hold_limit, mp.name FROM users u JOIN membership_plans mp ON mp.plan_id = u.plan_id WHERE u.user_id = ?');
        $st->execute([$userId]);
        $plan = $st->fetch();
        if (!$plan) api_error('Your membership plan was not found.');

        // Step 4: no second reservation for the same book
        $st = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE user_id = ? AND book_id = ? AND status IN ('reserved','queued') AND (expires_at IS NULL OR expires_at > NOW())");
        $st->execute([$userId, $bookId]);
        if ((int)$st->fetchColumn() > 0) api_error('You already have a reservation for this book.');

        // Step 5: find a copy nobody has (not on loan, not held by another reader). NOT EXISTS (not NOT IN) so empty copy_id values cannot hide every copy.
        // FOR UPDATE stops two readers taking the same copy.
        $st = $pdo->prepare(
            "SELECT c.copy_id FROM book_copies c
             WHERE c.book_id = ? AND c.status = 'in_service'
               AND NOT EXISTS (SELECT 1 FROM loans l WHERE l.copy_id = c.copy_id AND l.status = 'active' AND l.returned_at IS NULL)
               AND NOT EXISTS (SELECT 1 FROM reservations x WHERE x.copy_id = c.copy_id AND x.status = 'reserved' AND (x.expires_at IS NULL OR x.expires_at > NOW()))
             ORDER BY c.copy_no LIMIT 1 FOR UPDATE"
        );
        $st->execute([$bookId]);
        $copyId = $st->fetchColumn();

        if ($copyId === false) {
            // Step 6a: every copy is out -> join the queue (hold request)
            $st = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE user_id = ? AND status = 'queued'");
            $st->execute([$userId]);
            if ((int)$st->fetchColumn() >= (int)$plan['hold_limit']) {
                api_error($plan['name'] . ' allows ' . $plan['hold_limit'] . ' hold request(s) - upgrade for more.');
            }
            $st = $pdo->prepare("SELECT COUNT(*) + 1 FROM reservations WHERE book_id = ? AND status = 'queued'");
            $st->execute([$bookId]);
            $position = (int)$st->fetchColumn();
            $pdo->prepare("INSERT INTO reservations (user_id, book_id, mode, status, queue_position) VALUES (?, ?, 'queue', 'queued', ?)")
                ->execute([$userId, $bookId, $position]);
        } else {
            // Step 6b: a copy is free -> reserve it for a day and time slot
            $mode = ($in['mode'] ?? '') === 'borrow' ? 'borrow_pickup' : 'read_in_library';
            $st = $pdo->prepare('SELECT COUNT(*) FROM reservations WHERE user_id = ? AND mode <> \'queue\' AND status = \'reserved\' AND (expires_at IS NULL OR expires_at > NOW())');
            $st->execute([$userId]);
            if ((int)$st->fetchColumn() >= (int)$plan['physical_loan_limit']) {
                api_error($plan['name'] . ' allows ' . $plan['physical_loan_limit'] . ' physical reservations - upgrade for more.');
            }
            $st = $pdo->prepare("SELECT slot_id, TIMESTAMP(?, end_time) > NOW() AS still_ahead, DATEDIFF(?, CURDATE()) AS days_away FROM time_slots WHERE label = ?");
            $date = (string)($in['date'] ?? '');
            $st->execute([$date, $date, (string)($in['slot'] ?? '')]);
            $slot = $st->fetch();
            if (!$slot || $slot['days_away'] === null) api_error('Please choose a valid day and time slot.');
            if ((int)$slot['days_away'] < 0 || (int)$slot['days_away'] > 7 || !(int)$slot['still_ahead']) {
                api_error('That time slot is no longer available. Please pick another.');
            }
            // desk: VIP readers get a priority seat; the number just spreads readers over the desks
            $st = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE slot_date = ? AND slot_id = ? AND status = 'reserved'");
            $st->execute([$date, (int)$slot['slot_id']]);
            $n = (int)$st->fetchColumn();
            $st2 = $pdo->prepare('SELECT plan_id FROM users WHERE user_id = ?');
            $st2->execute([$userId]);
            $desk = $mode === 'borrow_pickup' ? 'Desk 2'
                  : ((int)$st2->fetchColumn() === 3 ? 'Priority seat P' . (1 + $n % 4) : 'Desk ' . (1 + $n % 8));
            // the reservation is held until the end of the chosen slot
            $pdo->prepare(
                "INSERT INTO reservations (user_id, book_id, copy_id, mode, status, slot_date, slot_id, desk_label, expires_at)
                 VALUES (?, ?, ?, ?, 'reserved', ?, ?, ?, (SELECT TIMESTAMP(?, end_time) FROM time_slots WHERE slot_id = ?))"
            )->execute([$userId, $bookId, (int)$copyId, $mode, $date, (int)$slot['slot_id'], $desk, $date, (int)$slot['slot_id']]);
        }
        $pdo->commit();
        api_ok(['reservations' => my_reservations($pdo, $userId)]);
    }

    if ($action === 'cancel') {
        // Step 7: a reader can only cancel their own open reservation
        $id = (int)($in['id'] ?? 0);
        $pdo->beginTransaction();
        $st = $pdo->prepare("SELECT book_id, status, queue_position FROM reservations WHERE reservation_id = ? AND user_id = ? FOR UPDATE");
        $st->execute([$id, $userId]);
        $r = $st->fetch();
        if (!$r || !in_array($r['status'], ['reserved', 'queued'], true)) api_error('That reservation cannot be cancelled.', 404);
        $pdo->prepare("UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?")->execute([$id]);
        if ($r['status'] === 'queued' && $r['queue_position'] !== null) {
            // everyone behind this reader moves up one place
            $pdo->prepare("UPDATE reservations SET queue_position = queue_position - 1 WHERE book_id = ? AND status = 'queued' AND queue_position > ?")
                ->execute([(int)$r['book_id'], (int)$r['queue_position']]);
        }
        $pdo->commit();
        api_ok(['reservations' => my_reservations($pdo, $userId)]);
    }

    api_error('Unknown action.');
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('Reader reservations error: ' . $e->getMessage());
    api_error('Could not complete that request.', 500);
}
