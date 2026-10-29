<?php
require __DIR__.'/bootstrap.php'; require_login();
if ($_SERVER['REQUEST_METHOD']==='GET') {
  $stmt=$pdo->prepare('SELECT id, operation, subject, fuel, created_at, status FROM activity_logs WHERE user_id=? ORDER BY id DESC LIMIT 500');
  $stmt->execute([$_SESSION['user_id']]); out(['items'=>$stmt->fetchAll()]);
}
if ($_SERVER['REQUEST_METHOD']==='POST') {
  csrf(); $d=body(); $allowed=['verify','reset_person','reset_hang','reset_company','unblock','block','delete_person','delete_company'];
  $op=(string)($d['operation']??''); $subject=trim((string)($d['subject']??''));
  if (!in_array($op,$allowed,true) || $subject==='' || strlen($subject)>80) out(['error'=>'Invalid input'],422);
  // Aman secara default: hanya mencatat permintaan. Tidak mengeksekusi perubahan di sistem pusat.
  $stmt=$pdo->prepare("INSERT INTO activity_logs(user_id,operation,subject,fuel,status) VALUES(?,?,?,?, 'PENDING_INTEGRATION')");
  $stmt->execute([$_SESSION['user_id'],$op,$subject,$d['fuel']??null]);
  out(['ok'=>true,'id'=>(int)$pdo->lastInsertId(),'status'=>'PENDING_INTEGRATION'],201);
}
out(['error'=>'Method not allowed'],405);
