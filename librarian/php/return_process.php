<?php
require_once __DIR__.'/db.php';$actor=api_require_role('librarian');
try{
 $in=input_json();$id=(int)($in['loan_id']??0);$condition=$in['condition']??'';$waive=!empty($in['waive_fee']);
 if(!in_array($condition,['excellent','good','damaged'],true))api_error('Invalid book condition');
 $pdo=db();$q=$pdo->prepare("SELECT l.*,u.full_name borrower,mp.late_fee_grace_days,r.fee_per_day,r.max_fee,bc.book_id,bc.copy_id,b.title FROM loans l JOIN users u ON u.user_id=l.user_id JOIN membership_plans mp ON mp.plan_id=u.plan_id JOIN book_copies bc ON bc.copy_id=l.copy_id JOIN books b ON b.book_id=bc.book_id LEFT JOIN late_fee_rules r ON r.plan_id=u.plan_id AND r.item_type='physical' WHERE l.loan_id=? AND l.status='active' AND l.returned_at IS NULL");$q->execute([$id]);$l=$q->fetch();if(!$l)api_error('Open loan not found');
 $late=max(0,(int)$pdo->query("SELECT DATEDIFF(CURDATE(),'".$l['due_on']."')")->fetchColumn());$charge=max(0,$late-(int)$l['late_fee_grace_days']);$amount=min($charge*(float)($l['fee_per_day']??0),(float)($l['max_fee']??0));if($waive)$amount=0;
 $pdo->beginTransaction();
 $pdo->prepare("UPDATE loans SET returned_at=NOW(),returned_condition=?,status='returned',received_by=? WHERE loan_id=?")->execute([$condition,$actor['user_id'],$id]);
 $pdo->prepare("UPDATE book_copies SET book_condition=?,status=? WHERE copy_id=?")->execute([$condition,$condition==='damaged'?'damaged':'in_service',$l['copy_id']]);
 if($amount>0){$pdo->prepare("INSERT INTO fines(loan_id,user_id,days_late,amount,status) VALUES(?,?,?,?, 'unpaid')")->execute([$id,$l['user_id'],$late,$amount]);}
 elseif($waive && $late>0){$pdo->prepare("INSERT INTO fines(loan_id,user_id,days_late,amount,status,note,resolved_by,resolved_at) VALUES(?,?,?,?, 'waived','Fee waived on return',?,NOW())")->execute([$id,$l['user_id'],$late,min($charge*(float)($l['fee_per_day']??0),(float)($l['max_fee']??0)),$actor['user_id']]);}
 $pdo->prepare("INSERT INTO activity_log(user_id,actor_name,action,item,entity_type,entity_id) VALUES(?,?,?,?,?,?)")->execute([$actor['user_id'],$actor['name'],'Returned',$l['title'],'loan',$id]);
 $pdo->commit();api_ok(['fine_created'=>$amount>0,'amount'=>$amount,'needs_review'=>$condition==='damaged']);
}catch(Throwable $e){if(db()->inTransaction())db()->rollBack();error_log($e->getMessage());api_error('Could not process return',500);}
?>