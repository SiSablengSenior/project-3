<?php
// Jalankan sekali melalui CLI: php setup-admin.php USERNAME PASSWORD
// Hapus file ini dari webroot setelah admin dibuat.
require __DIR__.'/bootstrap.php';
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if ($argc < 3 || strlen($argv[2]) < 12) { fwrite(STDERR,"Usage: php setup-admin.php USERNAME PASSWORD (min 12 chars)\n"); exit(1); }
$hash=password_hash($argv[2], PASSWORD_DEFAULT);
$stmt=$pdo->prepare('INSERT INTO users(username,password_hash) VALUES(?,?)');
$stmt->execute([$argv[1],$hash]);
echo "Admin created. Remove this script from server.\n";
