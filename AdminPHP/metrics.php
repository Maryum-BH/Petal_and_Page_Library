<?php
// Admin > Check-Out Metrics
// Every number on the Metrics page comes from here (read from the database views).
declare(strict_types=1);
require_once __DIR__ . '/../config/db.php';
api_require_role('admin');

// 20  ->  "8 PM - 9 PM"
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

    // ----- check-outs for every hour of the day (the chart shows 6 AM to 11 PM) -----
    $perHour = array_fill(0, 24, 0);
    foreach ($pdo->query("SELECT hour_of_day, checkouts FROM v_hourly_checkouts") as $r) {
        $perHour[(int)$r['hour_of_day']] = (int)$r['checkouts'];
    }
    $hourly = [];
    for ($h = 6; $h <= 23; $h++) {
        $hourly[] = ['hour' => $h, 'count' => $perHour[$h]];
    }

    // busiest hour over all hours (not only the ones drawn in the chart)
    $peakHour = null;
    $best = max($perHour);
    if ($best > 0) {
        $h = array_search($best, $perHour, true);
        $peakHour = ['label' => hour_range((int)$h), 'checkouts' => $best];
    }

    // ----- busiest category -----
    $top = $pdo->query("SELECT category, checkouts, percent_of_total FROM v_category_demand ORDER BY checkouts DESC, category LIMIT 1")->fetch();
    $busiest = $top ? ['name' => $top['category'], 'percent' => (float)$top['percent_of_total']] : null;

    // ----- digital storage (the real "load" the database keeps track of) -----
    $o = $pdo->query("SELECT storage_used_mb, storage_capacity_mb FROM v_admin_overview")->fetch();
    $used = (float)$o['storage_used_mb'];
    $capacity = (float)$o['storage_capacity_mb'];
    $storage = ['used_mb' => $used, 'capacity_mb' => $capacity,
                'percent' => $capacity > 0 ? round($used / $capacity * 100, 3) : 0];

    // ----- weekly digital sessions, Monday first (the view uses 1 = Sunday ... 7 = Saturday) -----
    $perDay = array_fill(1, 7, 0);
    foreach ($pdo->query("SELECT day_of_week, sessions FROM v_weekly_digital_load") as $r) {
        $perDay[(int)$r['day_of_week']] = (int)$r['sessions'];
    }
    $weekly = [];
    foreach ([2 => 'Mon', 3 => 'Tue', 4 => 'Wed', 5 => 'Thu', 6 => 'Fri', 7 => 'Sat', 1 => 'Sun'] as $n => $name) {
        $weekly[] = ['day' => $name, 'sessions' => $perDay[$n]];
    }

    // ----- titles people are waiting for -----
    $demand = [];
    $q = $pdo->query("SELECT title, waitlist, avg_wait_days FROM v_high_demand ORDER BY waitlist DESC, title LIMIT 8");
    foreach ($q as $r) {
        $demand[] = ['title' => $r['title'], 'waitlist' => (int)$r['waitlist'], 'avg_wait_days' => (int)$r['avg_wait_days']];
    }

    api_ok(['peak_hour' => $peakHour, 'busiest_category' => $busiest, 'storage' => $storage,
            'hourly' => $hourly, 'weekly' => $weekly, 'high_demand' => $demand]);
} catch (Throwable $e) {
    error_log('Admin metrics error: ' . $e->getMessage());
    api_error('Could not load the metrics', 500);
}
