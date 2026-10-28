<?php
require_once __DIR__.'/db.php';api_require_role('librarian');
try{
 $in=input_json();$search=trim((string)($in['search']??''));$pdo=db();
 $sql="SELECT f.fine_id id,u.library_id borrower_id,u.full_name borrower_name,ld.title book_title,f.days_late,f.amount,f.status FROM fines f JOIN users u ON u.user_id=f.user_id JOIN v_loan_detail ld ON ld.loan_id=f.loan_id WHERE 1=1";$p=[];
 if($search!==''){$sql.=" AND (u.library_id LIKE ? OR u.full_name LIKE ? OR ld.title LIKE ?)";$x="%$search%";$p=[$x,$x,$x];}
 $sql.=" ORDER BY f.created_at DESC";$st=$pdo->prepare($sql);$st->execute($p);$rows=[];foreach($st as $r)$rows[]=['id'=>(int)$r['id'],'borrower_id'=>$r['borrower_id'],'borrower_name'=>$r['borrower_name'],'book_title'=>$r['book_title'],'days_late'=>(int)$r['days_late'],'amount'=>(float)$r['amount'],'status'=>$r['status']];
 $stats=['total_unpaid'=>(float)$pdo->query("SELECT COALESCE(SUM(amount),0) FROM fines WHERE status='unpaid'")->fetchColumn(),'borrowers_with_fines'=>(int)$pdo->query("SELECT COUNT(DISTINCT user_id) FROM fines WHERE status='unpaid'")->fetchColumn(),'cleared_this_week'=>(float)$pdo->query("SELECT COALESCE(SUM(amount),0) FROM fines WHERE status IN ('cleared','waived') AND resolved_at>=DATE_SUB(NOW(),INTERVAL 7 DAY)")->fetchColumn()];
 api_ok(['stats'=>$stats,'rows'=>$rows]);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not load fines',500);}
?>