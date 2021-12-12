<?php
ini_set('display_errors', "On");
error_reporting(E_ALL ^ E_NOTICE ^ E_DEPRECATED);
require_once __DIR__ . '/../../../vendor/autoload.php';
require_once __DIR__ . '/../../../webapp/lib/Logging.class.php';

define('CLIENT_SECRET_PATH', '/var/www/webapp/Confidential/anyonebank-148cc528131b.json');
define('SHEET_ID', '10mZ8X6CbxaUCKIAOWsH7i3bgYfl47YUjB8L46sFsJb8');
define('SCOPES', implode(' ', [Google_Service_Sheets::SPREADSHEETS]));

$myclass = new Application();
//$myclass->execute();

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
    $this->log = new utils\Logging();

    $this->log->info(str_repeat("─", 80));
    //$vServer = [];
    //$vServer['HTTP_USER_AGENT'] = $_SERVER['HTTP_USER_AGENT'];
    //$vServer['REMOTE_ADDR'] = $_SERVER['REMOTE_ADDR'];
    //$this->log->info($vServer);
    //$this->log->info($_REQUEST);
  }
}
