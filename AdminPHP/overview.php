<?php
// Admin > Overview
// Every number on the Overview page comes from here (read from the database views).
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
api_require_role('admin');

// "5 today" compared with "2 last week"  ->  "150% more than last week"
function compare_text(int $now, int $before, string $period): string {
    if ($before === 0) {
        return $now === 0 ? "No activity $period" : "Up from 0 $period";
    }
    if ($now === $before) return "Same as $period";
    $percent = round(abs($now - $before) / $before * 100, 1);
    return $percent . '% ' . ($now > $before ? 'more' : 'less') . " than $period";
}

// 8  ->  "8 AM - 9 AM"
function hour_range(int $h): string {
    $name = function (int $x): string {
        $x = $x % 24;
        $n = $x % 12;
        return ($n === 0 ? 12 : $n) . ($x >= 12 ? ' PM' : ' AM');
    };
    return $name($h) . ' - ' . $name($h + 1);
}

try {
    $pdo = pdo();

    // ----- the four boxes at the top -----
    $o = $pdo->query("SELECT * FROM v_admin_overview")->fetch();

    // active readers: today compared with the same day last week
    $readersLastWeek = (int)$pdo->query(
        "SELECT COUNT(DISTINCT user_id) FROM reading_sessions WHERE DATE(started_at) = CURDATE() - INTERVAL 7 DAY"
    )->fetchColumn();

    // check-outs: this month so far compared with the same days of last month
    $checkoutsLastMonth = (int)$pdo->query(
        "SELECT COUNT(*) FROM loans
         WHERE borrowed_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
           AND borrowed_at <  CURDATE() - INTERVAL 1 MONTH + INTERVAL 1 DAY"
    )->fetchColumn();

    // overdue items out of all loans that are still out
    $activeLoans = (int)$pdo->query("SELECT COUNT(*) FROM v_active_loans")->fetchColumn();

    // busiest hour for digital sessions today
    $peak = $pdo->query(
        "SELECT HOUR(started_at) AS h, COUNT(*) AS c FROM reading_sessions
         WHERE edition_id IS NOT NULL AND DATE(started_at) = CURDATE()
         GROUP BY HOUR(started_at) ORDER BY c DESC, h LIMIT 1"
    )->fetch();

    $cards = [
        'active_readers'   => ['value' => (int)$o['active_readers_today'],
                               'note'  => compare_text((int)$o['active_readers_today'], $readersLastWeek, 'last week')],
        'checkouts_month'  => ['value' => (int)$o['checkouts_this_month'],
                               'note'  => compare_text((int)$o['checkouts_this_month'], $checkoutsLastMonth, 'last month')],
        'overdue'          => ['value' => (int)$o['overdue_items'],
                               'note'  => $o['overdue_items'] . " of $activeLoans active loans"],
        'digital_sessions' => ['value' => (int)$o['digital_sessions_today'],
                               'note'  => $peak ? 'Peak ' . hour_range((int)$peak['h']) : 'No sessions yet today'],
    ];

    // ----- circulation for the last 14 days (days with no check-outs count as 0) -----
    $byDay = [];
    foreach ($pdo->query("SELECT checkout_date, checkouts FROM v_daily_circulation") as $r) {
        $byDay[$r['checkout_date']] = (int)$r['checkouts'];
    }
    $today = new DateTime((string)$pdo->query("SELECT CURDATE()")->fetchColumn());
    $circulation = [];
    for ($i = 13; $i >= 0; $i--) {
        $day = (clone $today)->modify("-$i day")->format('Y-m-d');
        $circulation[] = ['date' => $day, 'count' => $byDay[$day] ?? 0];
    }

    // ----- demand by category -----
    $categories = [];
    $q = $pdo->query("SELECT category, checkouts, percent_of_total FROM v_category_demand ORDER BY checkouts DESC, category");
    foreach ($q as $r) {
        $categories[] = ['name' => $r['category'], 'count' => (int)$r['checkouts'], 'percent' => (float)$r['percent_of_total']];
    }

    // ----- latest staff actions -----
    $activity = [];
    $q = $pdo->query("SELECT action, item, actor_name, DATE_FORMAT(created_at, '%e %b, %H:%i') AS happened
                      FROM activity_log ORDER BY created_at DESC, activity_id DESC LIMIT 8");
    foreach ($q as $r) {
        $activity[] = ['action' => $r['action'], 'item' => $r['item'], 'by' => $r['actor_name'], 'when' => $r['happened']];
    }

    api_ok(['cards' => $cards, 'circulation' => $circulation, 'categories' => $categories, 'activity' => $activity]);
} catch (Throwable $e) {
    error_log('Admin overview error: ' . $e->getMessage());
    api_error('Could not load the overview', 500);
}
