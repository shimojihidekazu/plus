<?php
ini_set("date.timezone", "Asia/Tokyo");
require $_SERVER['DOCUMENT_ROOT']."/../config.php";
require TOP_DIR."/vendor/autoload.php";
use Carbon\Carbon;

require WEBAPP_DIR."/lib/AbstractAction.class.php";

class myClass extends \API\Base\AbstractAction {
  public function execute() {

    $_date = $_REQUEST['date'];
    if(strlen(trim($_date))<=0) $_date = time();
    $year  = date('Y', $_date);
    $month = date('n', $_date);

    $dateStr = date('Y-n-1', $_date);
    $date = new Carbon($dateStr, 'Asia/Tokyo');
    $pdate = $date->copy()->subMonth();
    $ndate = $date->copy()->addMonth();
    $datasets = [
      'nowLabel' => $date->format('Y年n月'),
      'prev' => $pdate->timestamp,
      'prevLabel' => $pdate->format('Y/n/d'),
      'next' => $ndate->timestamp,
      'nextLabel' => $ndate->format('Y/n/d')
    ];

    // カレンダーを四角形にするため、前月となる左上の隙間用のデータを入れるためずらす
    $date->subDay($date->dayOfWeek);
    // 同上。右下の隙間のための計算。
    $count = 31 + $date->dayOfWeek+7;
    $count = ceil($count / 7) * 7;
    $dates = [];

    $w = 0;

    $calendar = [];
    for ($i = 0; $i < $count; $i++, $date->addDay()) {
      if($i%7 === 0) ++$w;

      $_class = "";
      if((int)$date->format('n') !== (int) $month) {
        $_class = 'ignoreMonth';
      } elseif($date->dayOfWeek == '0') {
        $_class = 'Sunday';
      } elseif($date->dayOfWeek == '6') {
        $_class = 'Saturday';
      } elseif($date->isToday()) {
        $_class = 'today';
      }

      $calendar[$w][] = [
        "day" => $date->format('j'),
        "class" => $_class,
        "timestamp" => $date->timestamp,
        "capture" => $date->format("Y年n月j日")
      ];
    }

    $datasets['calendar'] = array_values($calendar);
    $this->put(json_encode($datasets));
  }

}

$instance = new myClass();
$instance->execute();