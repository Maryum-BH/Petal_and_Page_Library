<?php
require_once __DIR__.'/db.php';
api_require_role('librarian');
try {
 $pdo = db();

 // "titles" = different books in the catalogue, "copies" = physical copies of those books
 $titles = (int)$pdo->query("SELECT COUNT(*) FROM v_book_catalog WHERE is_active=1")->fetchColumn();
 $copies = (int)$pdo->query("SELECT COALESCE(SUM(total_copies),0) FROM v_book_catalog WHERE is_active=1")->fetchColumn();

 // the three daily numbers
 $reserved = (int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE DATE(created_at)=CURDATE() AND status IN ('reserved','queued')")->fetchColumn();
 $returns  = (int)$pdo->query("SELECT COUNT(*) FROM loans WHERE returned_at IS NOT NULL AND DATE(returned_at)=CURDATE()")->fetchColumn();
 $overdue  = (int)$pdo->query("SELECT COUNT(*) FROM v_active_loans WHERE is_overdue=1")->fetchColumn();

 $notes = [];

 // titles with no free copy left (first 5, then a summary line)
 $out = (int)$pdo->query("SELECT COUNT(*) FROM v_book_catalog WHERE is_active=1 AND available_copies=0")->fetchColumn();
 $q = $pdo->query("SELECT v.title,
        COALESCE((SELECT GROUP_CONCAT(DISTINCT bc.shelf_location ORDER BY bc.shelf_location SEPARATOR ', ')
                  FROM book_copies bc WHERE bc.book_id=v.book_id AND bc.status='in_service'),'') AS shelf
        FROM v_book_catalog v WHERE v.is_active=1 AND v.available_copies=0 ORDER BY v.title LIMIT 5");
 foreach ($q as $r) {
   $where = $r['shelf'] !== '' ? " at shelf ".$r['shelf'] : '';
   $notes[] = ['type'=>'warning', 'title'=>$r['title'], 'text'=>"is out of stock".$where];
 }
 if ($out > 5) $notes[] = ['type'=>'warning', 'text'=>($out-5)." more titles are out of stock"];

 // reservations that run out in the next 2 hours
 $e = (int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE status='reserved' AND expires_at IS NOT NULL AND expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)")->fetchColumn();
 if ($e) $notes[] = ['type'=>'warning', 'text'=>"$e reservation".($e>1?'s expire':' expires')." within 2 hours"];

 // loans that are due today
 $d = (int)$pdo->query("SELECT COUNT(*) FROM loans WHERE status='active' AND returned_at IS NULL AND due_on=CURDATE()")->fetchColumn();
 if ($d) $notes[] = ['type'=>'info', 'text'=>"$d return".($d>1?'s':'')." due today"];

 // the last 5 things staff did
 $activity = [];
 $q = $pdo->query("SELECT action, item FROM activity_log ORDER BY created_at DESC, activity_id DESC LIMIT 5");
 foreach ($q as $r) $activity[] = ['type'=>'info', 'text'=>$r['action'].': '.$r['item']];

 api_ok([
   'total_books'    => $titles,
   'total_copies'   => $copies,
   'reserved_today' => $reserved,
   'returns_today'  => $returns,
   'overdue'        => $overdue,
   'notifications'  => $notes,
   'activity'       => $activity
 ]);
} catch (Throwable $e) { error_log($e->getMessage()); api_error('Could not load dashboard', 500); }
