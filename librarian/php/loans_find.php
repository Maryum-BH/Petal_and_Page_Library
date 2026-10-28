<?php
require_once __DIR__.'/db.php';api_require_role('librarian');
try{
 $in=input_json();$q=trim((string)($in['q']??''));if($q==='')api_error('Search text is required');$pdo=db();
 $sql="SELECT l.loan_id id,u.library_id borrower_id,u.full_name borrower_name,b.title book_title,l.due_on,
        GREATEST(DATEDIFF(CURDATE(),l.due_on),0) days_late,
        COALESCE(LEAST(GREATEST(CAST(DATEDIFF(CURDATE(),l.due_on) AS SIGNED)-CAST(mp.late_fee_grace_days AS SIGNED),0)*r.fee_per_day,r.max_fee),0) late_fee
        FROM loans l JOIN users u ON u.user_id=l.user_id JOIN book_copies bc ON bc.copy_id=l.copy_id JOIN books b ON b.book_id=bc.book_id
        JOIN membership_plans mp ON mp.plan_id=u.plan_id LEFT JOIN late_fee_rules r ON r.plan_id=u.plan_id AND r.item_type='physical'
        WHERE l.status='active' AND l.returned_at IS NULL AND (u.library_id LIKE ? OR u.full_name LIKE ? OR b.title LIKE ?) ORDER BY l.due_on";
 $x="%$q%";$st=$pdo->prepare($sql);$st->execute([$x,$x,$x]);$rows=[];foreach($st as $r)$rows[]=['id'=>(int)$r['id'],'book_id'=>null,'book_title'=>$r['book_title'],'borrower_id'=>$r['borrower_id'],'borrower_name'=>$r['borrower_name'],'due_on'=>$r['due_on'],'days_late'=>(int)$r['days_late'],'late_fee'=>(float)$r['late_fee']];api_ok($rows);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not find loans',500);}
?>