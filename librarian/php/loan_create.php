<?php
require_once __DIR__.'/db.php';$actor=api_require_role('librarian');
try{
 $in=input_json();$code=trim((string)($in['book_id']??''));$borrower=trim((string)($in['borrower_id']??''));$borrowed=$in['borrowed_on']??'';$due=$in['due_on']??'';
 if(!$code||!$borrower||!preg_match('/^\d{4}-\d{2}-\d{2}$/',$borrowed)||!preg_match('/^\d{4}-\d{2}-\d{2}$/',$due))api_error('Book, borrower and valid dates are required');
 if($due<$borrowed)api_error('Due date cannot be before borrow date');
 $pdo=db();$q=$pdo->prepare("SELECT b.book_id,b.title FROM books b WHERE b.book_code=? AND b.is_active=1");$q->execute([$code]);$b=$q->fetch();if(!$b)api_error('Book not found');
 $q=$pdo->prepare("SELECT u.user_id,u.full_name,mp.name tier,mp.loan_period_days FROM users u JOIN membership_plans mp ON mp.plan_id=u.plan_id WHERE u.library_id=? AND u.role='reader' AND u.account_status='active'");$q->execute([$borrower]);$u=$q->fetch();if(!$u)api_error('Borrower not found');
 $q=$pdo->prepare("SELECT bc.copy_id FROM book_copies bc WHERE bc.book_id=? AND bc.status='in_service' AND NOT EXISTS (SELECT 1 FROM loans l WHERE l.copy_id=bc.copy_id AND l.status='active' AND l.returned_at IS NULL) AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.copy_id=bc.copy_id AND r.status IN ('reserved','queued')) ORDER BY bc.copy_id LIMIT 1");$q->execute([$b['book_id']]);$copy=$q->fetchColumn();if(!$copy)api_error('No available copy of this book');
 $st=$pdo->prepare("SELECT COUNT(*) FROM loans WHERE user_id=? AND copy_id IS NOT NULL AND status='active' AND returned_at IS NULL");$st->execute([$u['user_id']]);$used=(int)$st->fetchColumn();
 $st=$pdo->prepare("SELECT physical_loan_limit FROM membership_plans WHERE plan_id=(SELECT plan_id FROM users WHERE user_id=?)");$st->execute([$u['user_id']]);$limit=(int)$st->fetchColumn();if($used >= $limit)api_error('This reader has reached the physical loan limit');
 $pdo->beginTransaction();
 $st=$pdo->prepare("INSERT INTO loans(user_id,copy_id,borrowed_at,due_on,status,issued_by) VALUES(?,?,CONCAT(?,' ',TIME(NOW())),?,'active',?)");
 $st->execute([$u['user_id'],$copy,$borrowed,$due,$actor['user_id']]);
 $pdo->prepare("INSERT INTO activity_log(user_id,actor_name,action,item,entity_type,entity_id) VALUES(?,?,?,?,?,?)")->execute([$actor['user_id'],$actor['name'],'Checked out',$b['title'],'loan',(int)$pdo->lastInsertId()]);
 $pdo->commit();api_ok(['id'=>(int)$pdo->lastInsertId(),'book_id'=>$code,'borrower_id'=>$borrower,'borrowed_on'=>$borrowed,'due_on'=>$due]);
}catch(Throwable $e){if(db()->inTransaction())db()->rollBack();error_log($e->getMessage());api_error($e->getMessage()==='No available copy of this book'?$e->getMessage():'Could not create loan',500);}
?>