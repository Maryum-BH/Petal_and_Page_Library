<?php
require_once __DIR__.'/db.php';$actor=api_require_role('librarian');
try{$in=input_json();$id=(int)($in['id']??0);$st=db()->prepare("UPDATE fines SET status='cleared',resolved_by=?,resolved_at=NOW() WHERE fine_id=? AND status='unpaid'");$st->execute([$actor['user_id'],$id]);if(!$st->rowCount())api_error('Fine not found or already cleared');api_ok(true);}catch(Throwable $e){error_log($e->getMessage());api_error('Could not clear fine',500);}
?>