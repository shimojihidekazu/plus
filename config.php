<?php
ini_set('display_errors', "On");
ini_set('error_reporting', E_ALL);

define('TOP_DIR', $_SERVER['DOCUMENT_ROOT']."/..");
define('WEBAPP_DIR', TOP_DIR."/webapp");

function dd($v) {
  echo "<pre>";
  var_dump($v);
  die();
}
