<?php
require __DIR__.'/bootstrap.php'; require_login(); csrf();
$_SESSION=[]; session_destroy(); out(['ok'=>true]);
