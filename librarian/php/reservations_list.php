<?php
require_once __DIR__.'/db.php'; api_require_role('librarian');
try{
 $in=input_json();$search=trim((string)($in['search']??''));$pdo=db();
 $sql="SELECT r.reservation_id id,b.title book_title,u.library_id borrower_id,u.full_name borrower_name,
        r.expires_at deadline, CASE WHEN r.status='reserved' AND r.expires_at IS NOT NULL AND r.expires_at<NOW() THEN 'expired' ELSE r.status END status
        FROM reservations r JOIN books b ON b.book_id=r.book_id JOIN users u ON u.user_id=r.user_id
        WHERE r.status IN ('reserved','expired','picked_up','shelved')";
 $p=[];if($search!==''){ $sql.=" AND (b.title LIKE ? OR u.full_name LIKE ? OR u.library_id LIKE ?)";$q="%$search%";$p=[$q,$q,$q];}
 $sql.=" ORDER BY r.created_at DESC";$st=$pdo->prepare($sql);$st->execute($p);$rows=$st->fetchAll();
 $stats=[
 'reserved'=>(int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE status='reserved' AND (expires_at IS NULL OR expires_at>=NOW())")->fetchColumn(),
 'picked_up_today'=>(int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE status='picked_up' AND DATE(picked_up_at)=CURDATE()")->fetchColumn(),
 'expiring_soon'=>(int)$pdo->query("SELECT COUNT(*) FROM reservations WHERE status='reserved' AND expires_at BETWEEN NOW() AND DATE_ADD(NOW(),INTERVAL 2 HOUR)")->fetchColumn()];
 api_ok(['stats'=>$stats,'rows'=>array_map(fn($r)=>['id'=>(int)$r['id'],'book_title'=>$r['book_title'],'borrower_id'=>$r['borrower_id'],'borrower_name'=>$r['borrower_name'],'deadline'=>$r['deadline'],'status'=>$r['status']],$rows)]);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not load reservations',500);}
?>