<?php
require_once __DIR__.'/db.php';api_require_role('librarian');
try{
 $in=input_json();$id=trim((string)($in['id']??''));$st=db()->prepare("SELECT u.library_id id,u.full_name name,mp.name tier,mp.loan_period_days loan_days FROM users u JOIN membership_plans mp ON mp.plan_id=u.plan_id WHERE u.library_id=? AND u.role='reader' AND u.account_status='active'");
 $st->execute([$id]);$r=$st->fetch();if(!$r)api_error('Borrower not found');api_ok(['id'=>$r['id'],'name'=>$r['name'],'tier'=>$r['tier'],'loan_days'=>(int)$r['loan_days']]);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not find borrower',500);}
?>