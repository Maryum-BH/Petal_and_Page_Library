<?php
require_once __DIR__.'/db.php';$actor=api_require_role('librarian');
try{
 $in=input_json();$id=(int)($in['id']??0);$action=$in['action']??'';
 if(!in_array($action,['picked_up','shelved'],true)) api_error('Invalid reservation action');
 $pdo=db();$q=$pdo->prepare("SELECT status FROM reservations WHERE reservation_id=?");$q->execute([$id]);$r=$q->fetch();
 if(!$r)api_error('Reservation not found',404);
 if($action==='picked_up'){
   $st=$pdo->prepare("UPDATE reservations SET status='picked_up',picked_up_at=NOW(),handled_by=? WHERE reservation_id=? AND status='reserved'");$st->execute([$actor['user_id'],$id]);
 } else {
   $st=$pdo->prepare("UPDATE reservations SET status='shelved',handled_by=? WHERE reservation_id=? AND status IN ('reserved','expired')");$st->execute([$actor['user_id'],$id]);
 }
 if($st->rowCount()===0)api_error('Reservation cannot be updated in its current state');
 api_ok(true);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not update reservation',500);}
?>