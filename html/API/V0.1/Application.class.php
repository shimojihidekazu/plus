<?php
ini_set('display_errors', "On");
error_reporting(E_ALL ^ E_NOTICE ^ E_DEPRECATED);
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../webapp/lib/Logging.class.php';

define('CLIENT_SECRET_PATH', $_SERVER['DOCUMENT_ROOT'].'/../webapp/Confidential/anyonebank-148cc528131b.json');
define('SHEET_ID', '10mZ8X6CbxaUCKIAOWsH7i3bgYfl47YUjB8L46sFsJb8');
define('SCOPES', implode(' ', [Google_Service_Sheets::SPREADSHEETS]));

$myclass = new Application();
$myclass->execute();

class Application {
  private $service = null;
  private $log     = null;

  public function __construct() {
    // アカウント認証情報インスタンスを作成
    $client = new Google_Client();
    $client->setScopes(SCOPES);
    $client->setAuthConfig(CLIENT_SECRET_PATH);

    // シートのインスタンスを生成
    $this->service = new Google_Service_Sheets($client);
    // $this->log = new utils\Logging();

    // $this->log->info(str_repeat("─", 80));
    $vServer = [];
    $vServer['HTTP_USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'];
    $vServer['REMOTE_ADDR'] = $_SERVER['REMOTE_ADDR'];
    // $this->log->info($vServer);
    // $this->log->info($_REQUEST);
  }

  public function execute() {
    switch($_REQUEST['ApplicationType']) {

      case 1: //遅刻早退
        $this->BehindOrEarlyTimeNotification();
        break;

      case 2: //時間外勤務届け
        $this->OvertimeNotification();
        $sheetname = '時間外勤務届け';
        break;

      case 3: //有給休暇届け
        $this->PaidLeaveNotification();
        $sheetname = '有給休暇届け';
        break;
    }
  }

  //遅刻早退
  private function BehindOrEarlyTimeNotification() {

    $values = ['values' => [[
      $_REQUEST['StaffId'],
      $_REQUEST['StaffName'],
      $_REQUEST['date'],
      (isset($_REQUEST['BehindTime'])) ? $_REQUEST['BehindTime'] : '',
      (isset($_REQUEST['EarlyTime'])) ? $_REQUEST['EarlyTime']: '',
      $_REQUEST['ReasonKind'],
      $_REQUEST['ReasonRemarks'],
      date("Y-m-d H:i:s"),
      $_REQUEST['LoginUserName'],
      $_SERVER['HTTP_USER_AGENT'],
      $_SERVER['REMOTE_ADDR']
    ]]];
    $this->putGoogleSpredsheet($values, '遅刻早退届け');

  }

  //時間外勤務届け
  private function OvertimeNotification() {

    $values = ['values' => [[
      $_REQUEST['StaffId'],
      $_REQUEST['StaffName'],
      $_REQUEST['date'],
      (isset($_REQUEST['EarlyFromTime'])) ? $_REQUEST['EarlyFromTime'] : '',
      (isset($_REQUEST['EarlyToTime'])) ? $_REQUEST['EarlyToTime'] : '',
      (isset($_REQUEST['EarlyDulationTime'])) ? $_REQUEST['EarlyDulationTime'] : '',
      (isset($_REQUEST['OverFromTime'])) ? $_REQUEST['OverFromTime']: '',
      (isset($_REQUEST['OverToTime'])) ? $_REQUEST['OverToTime']: '',
      (isset($_REQUEST['OverDulationTime'])) ? $_REQUEST['OverDulationTime'] : '',
      $_REQUEST['ReasonKind'],
      $_REQUEST['ReasonRemarks'],
      date("Y-m-d H:i:s"),
      $_REQUEST['LoginUserName'],
      $_SERVER['HTTP_USER_AGENT'],
      $_SERVER['REMOTE_ADDR']
    ]]];
    $this->putGoogleSpredsheet($values, '時間外勤務届け');

  }

  //有給休暇届け
  private function PaidLeaveNotification() {

    $values = ['values' => [[
      $_REQUEST['StaffId'],
      $_REQUEST['StaffName'],
      $_REQUEST['date'],
      $_REQUEST['AnnualLeave'],
      $_REQUEST['ReasonKind'],
      $_REQUEST['ReasonRemarks'],
      date("Y-m-d H:i:s"),
      $_REQUEST['LoginUserName'],
      $_SERVER['HTTP_USER_AGENT'],
      $_SERVER['REMOTE_ADDR']
    ]]];
    $this->putGoogleSpredsheet($values, '有給休暇届け');

  }

  private function putGoogleSpredsheet($values, $sheetname) {
    try {
      $updateBody = new Google_Service_Sheets_ValueRange($values);
      $result = $this->service->spreadsheets_values->append(
        SHEET_ID,
        "$sheetname!A:A",
        $updateBody,
        ['valueInputOption' => 'USER_ENTERED']
      );
    } catch (Google_Exception $e) {
      $errors = json_decode($e->getMessage(),true);
      header("Content-Type: application/json; charset=utf-8");
      die(json_encode([
        'Status' => 'ng',
        'ErrorCode' => $errors["error"]["code"],
        'ErrorMessage' => $errors["error"]["message"],
      ]));
    }
    header("Content-Type: application/json; charset=utf-8");
    die(json_encode(['Status' => 'ok']));
  }
}
