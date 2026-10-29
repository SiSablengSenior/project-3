<?php
require __DIR__.'/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['error'=>'Method not allowed'],405);
$data=body(); $username=trim((string)($data['username']??'')); $password=(string)($data['password']??'');
$stmt=$pdo->prepare('SELECT id, username, password_hash FROM users WHERE username=? AND active=1 LIMIT 1');
$stmt->execute([$username]); $user=$stmt->fetch();
if (!$user || !password_verify($password,$user['password_hash'])) out(['error'=>'Invalid credentials'],401);
session_regenerate_id(true); $_SESSION['user_id']=(int)$user['id']; $_SESSION['username']=$user['username']; $_SESSION['csrf']=bin2hex(random_bytes(32));
out(['ok'=>true,'username'=>$user['username'],'csrf'=>$_SESSION['csrf']]);
