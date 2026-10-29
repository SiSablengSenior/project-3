<?php
require __DIR__.'/bootstrap.php'; require_login();
out(['authenticated'=>true,'username'=>$_SESSION['username'],'csrf'=>$_SESSION['csrf']]);
