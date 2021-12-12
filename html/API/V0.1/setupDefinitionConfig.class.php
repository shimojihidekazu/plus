<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
define('CLIENT_SECRET_PATH', $_SERVER['DOCUMENT_ROOT'].'/../webapp/Confidential/anyonebank-148cc528131b.json');
define('SHEET_ID', '10mZ8X6CbxaUCKIAOWsH7i3bgYfl47YUjB8L46sFsJb8');
define('SCOPES', implode(' ', [Google_Service_Sheets::SPREADSHEETS]));

function dd($v) {
  echo "<pre>";
  var_dump($v);
  die();
}


// アカウント認証情報インスタンスを作成
$client = new Google_Client();
$client->setScopes(SCOPES);
$client->setAuthConfig(CLIENT_SECRET_PATH);
$service = new Google_Service_Sheets($client);


$response = $service->spreadsheets_values->get(
  SHEET_ID,
  '職員マスター!A2:F');
$values = $response->getValues();
$responce = [];
foreach ($values as $v) {
  if(strlen($v[1])<=0) break;
  $responce[] = [
    'id'              => $v[0],
    'name'            => $v[1],
    'startTime'       => $v[2],
    'endTime'         => $v[3],
    'partTimeFlag'    => $v[4],
    'password'        => $v[5],
  ];
}
file_put_contents($_SERVER['DOCUMENT_ROOT']."/../webapp/config/StaffMaster.json", json_encode($responce));


$response = $service->spreadsheets_values->get(
  SHEET_ID,
  '申請マスター!A1:E');
$values = $response->getValues();

$wk_name = $values[0][0];
$wk_id   = $values[0][1];
$wk_caption = $values[0][2];
$Reason = [];
$ApplicationContent = [];
foreach ($values as $v) {
  if(strlen($v[4])<=0) break;

  if(strlen($v[0])<=0 && strlen($v[1])<=0 && strlen($v[2])<=0) {
    $v[0] = $wk_name;
    $v[1] = $wk_id;
    $v[2] = $wk_caption;
  }

  if($wk_id != $v[1]) {
    $ApplicationContent[$wk_name] = [
      'value'           => $wk_id,
      'caption'         => $wk_caption,
      'Reason'          => $Reason
    ];

    $wk_name    = $v[0];
    $wk_id      = $v[1];
    $wk_caption = $v[2];

    $Reason = [];
  }
  $Reason[] = [
    "value"   => ($v[3] == '999') ? $v[3] : sprintf("%d%d", $wk_id, $v[3]),
    "caption" => $v[4]
  ];
}
if(sizeof($Reason)>0) {
  $ApplicationContent[$wk_name] = [
    'value'           => $wk_id,
    'caption'         => $wk_caption,
    'Reason'          => $Reason
  ];
}
file_put_contents($_SERVER['DOCUMENT_ROOT']."/../webapp/config/ApplicationContentMaster.json", json_encode($ApplicationContent));
