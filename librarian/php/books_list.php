<?php
require_once __DIR__.'/db.php';
api_require_role('librarian');
try{
 $in=input_json(); $search=trim((string)($in['search']??'')); $cat=trim((string)($in['category']??'')); $status=trim((string)($in['status']??''));
 $sql="SELECT v.book_id,v.book_code,v.title,v.author_names,v.category,v.available_copies,v.total_copies,
       COALESCE((SELECT GROUP_CONCAT(DISTINCT shelf_location ORDER BY shelf_location SEPARATOR ', ') FROM book_copies bc WHERE bc.book_id=v.book_id AND bc.status='in_service'),'') shelf,
       CASE WHEN v.available_copies=0 THEN 'out_of_stock'
            WHEN v.available_copies <= CAST((SELECT setting_value FROM system_settings WHERE setting_key='low_stock_threshold') AS UNSIGNED) THEN 'low_stock'
            ELSE 'available' END status
       FROM v_book_catalog v WHERE v.is_active=1";
 $params=[];
 if($search!==''){ $sql.=" AND (v.book_code LIKE ? OR v.title LIKE ? OR v.author_names LIKE ?)"; $q="%$search%"; $params=[$q,$q,$q];}
 if($cat!==''){$sql.=" AND v.category=?";$params[]=$cat;}
 $sql.=" ORDER BY v.title";
 $st=db()->prepare($sql);$st->execute($params);
 $rows=[];
 foreach($st as $r){if($status!=='' && $r['status']!==$status) continue;$rows[]=['id'=>$r['book_code'],'title'=>$r['title'],'author'=>$r['author_names']??'','category'=>$r['category'],'copies'=>(int)$r['available_copies'],'shelf'=>$r['shelf'],'status'=>$r['status']];}
 api_ok($rows);
}catch(Throwable $e){error_log($e->getMessage());api_error('Could not load books',500);}
?>