<?php
require_once __DIR__.'/db.php';
$actor=api_require_role('librarian');
try{
 $in=input_json(); $code=trim((string)($in['id']??''));
 $pdo=db(); $st=$pdo->prepare("SELECT book_id,title FROM books WHERE book_code=? AND is_active=1");$st->execute([$code]);$book=$st->fetch();
 if(!$book) api_error('Book not found',404);
 $pdo->beginTransaction();
 if(array_key_exists('copies',$in)){
   if(!is_numeric($in['copies']) || (int)$in['copies']<0 || (string)(int)$in['copies']!=(string)$in['copies'] && !is_int($in['copies']) && !ctype_digit((string)$in['copies'])) api_error('Copies must be a whole number, 0 or more');
   $wanted=(int)$in['copies'];
 }
 // Re-query cleanly because PDOStatement::execute does not return a value row.
 if(array_key_exists('copies',$in)){
   $q=$pdo->prepare("SELECT available_copies FROM v_book_catalog WHERE book_id=?");
   $q->execute([$book['book_id']]);$available=(int)$q->fetchColumn();
   $q2=$pdo->prepare("SELECT COUNT(*) FROM book_copies WHERE book_id=? AND status='in_service'");$q2->execute([$book['book_id']]);$total=(int)$q2->fetchColumn();
   if($wanted>$available){
     $add=$wanted-$available;
     $q3=$pdo->prepare("SELECT COALESCE(MAX(copy_no),0) FROM book_copies WHERE book_id=?");$q3->execute([$book['book_id']]);$next=(int)$q3->fetchColumn()+1;
     $ins=$pdo->prepare("INSERT INTO book_copies(book_id,copy_no,barcode,shelf_location,book_condition,status,acquired_on) VALUES (?,?,?,?, 'good','in_service',CURDATE())");
     $shelf=trim((string)($in['shelf']??''));
     if($shelf===''){ $q5=$pdo->prepare("SELECT shelf_location FROM book_copies WHERE book_id=? AND status='in_service' ORDER BY copy_id LIMIT 1");$q5->execute([$book['book_id']]);$shelf=(string)($q5->fetchColumn() ?: 'A-01'); }
     for($i=0;$i<$add;$i++){$ins->execute([$book['book_id'],$next,"AUTO-{$code}-".$next,$shelf]);$next++;}
   } elseif($wanted<$available){
     $remove=$available-$wanted;
     $q4=$pdo->prepare("SELECT bc.copy_id FROM book_copies bc WHERE bc.book_id=? AND bc.status='in_service' AND NOT EXISTS (SELECT 1 FROM loans l WHERE l.copy_id=bc.copy_id AND l.status='active' AND l.returned_at IS NULL) AND NOT EXISTS (SELECT 1 FROM reservations r WHERE r.copy_id=bc.copy_id AND r.status IN ('reserved','queued')) ORDER BY bc.copy_id DESC LIMIT $remove");
     $q4->execute([$book['book_id']]);
     $ids=$q4->fetchAll(PDO::FETCH_COLUMN);
     if(count($ids)<$remove) api_error('Not enough free copies can be removed');
     $del=$pdo->prepare("DELETE FROM book_copies WHERE copy_id=?");foreach($ids as $id)$del->execute([$id]);
   }
 }
 if(array_key_exists('shelf',$in)){
   $shelf=strtoupper(trim((string)$in['shelf'])); if($shelf==='') api_error('Shelf cannot be empty');
   $q=$pdo->prepare("UPDATE book_copies SET shelf_location=? WHERE book_id=? AND status='in_service'");$q->execute([$shelf,$book['book_id']]);
 }
 $pdo->prepare("INSERT INTO activity_log(user_id,actor_name,action,item,entity_type,entity_id) VALUES (?,?,?,?,?,?)")
     ->execute([$actor['user_id'],$actor['name'],'Updated inventory',$book['title'],'book',$book['book_id']]);
 $pdo->commit();
 $stmt=$pdo->prepare("SELECT * FROM books WHERE book_id=?");$stmt->execute([$book['book_id']]);
 $b=$stmt->fetch();
 $q=$pdo->prepare("SELECT available_copies FROM v_book_catalog WHERE book_id=?");$q->execute([$b['book_id']]);$avail=(int)$q->fetchColumn();
 $q=$pdo->prepare("SELECT GROUP_CONCAT(DISTINCT shelf_location ORDER BY shelf_location SEPARATOR ', ') FROM book_copies WHERE book_id=? AND status='in_service'");$q->execute([$b['book_id']]);$shelf=$q->fetchColumn()??'';
 $threshold=(int)$pdo->query("SELECT setting_value FROM system_settings WHERE setting_key='low_stock_threshold'")->fetchColumn();
 $q=$pdo->prepare("SELECT c.name AS category, COALESCE(GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', '),'') AS author
 FROM books b JOIN categories c ON c.category_id=b.category_id
 LEFT JOIN book_authors ba ON ba.book_id=b.book_id LEFT JOIN authors a ON a.author_id=ba.author_id
 WHERE b.book_id=? GROUP BY b.book_id,c.name"); $q->execute([$b['book_id']]); $meta=$q->fetch() ?: ['category'=>'','author'=>''];
 api_ok(['id'=>$b['book_code'],'title'=>$b['title'],'author'=>$meta['author'],'category'=>$meta['category'],'copies'=>$avail,'shelf'=>$shelf,'status'=>$avail===0?'out_of_stock':($avail<=$threshold?'low_stock':'available')]);
}catch(Throwable $e){if(db()->inTransaction())db()->rollBack();error_log($e->getMessage());api_error('Could not update the book',500);}
?>