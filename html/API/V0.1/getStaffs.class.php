<?php
$_user = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT']."/../webapp/config/StaffMaster.json"), true);
$user = [];
foreach ($_user as $v) {
  unset($v['password']);
  $user[] = $v;
}
header("Content-Type: application/json; charset=utf-8");
echo json_encode($user);