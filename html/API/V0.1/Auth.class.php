<?php
$flag = false;

$data = json_decode(file_get_contents('php://input'), true);

$passwd = isset($data['passwd']) ? $data['passwd'] : null;
if(empty($passwd)) {
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode(
    [
      'status' => 'fail',
      'profile' => []
    ]
  );
  die();
}

$user = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT']."/../webapp/config/StaffMaster.json"), true);
foreach($user as $v) {
  if($v['password'] == $passwd) {
    $flag = true;
    break;
  }
}
if(!$flag) {
  $v = [];
} else {
  unset($v['password']);
}

header("Content-Type: application/json; charset=utf-8");
echo json_encode(
  [
    'status' => ($flag) ? 'success': 'fail',
    'profile' => $v
  ]
);
die();