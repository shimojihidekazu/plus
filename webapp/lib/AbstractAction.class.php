<?php
namespace API\Base;

abstract class AbstractAction {
  public function __construct() {
  }

  public function put($v) {
    header("Content-Type: application/json; charset=utf-8");
    die($v);
  }
}