#!/usr/bin/php
<?php
// DB接続
$manager = new MongoDB\Driver\Manager("mongodb://mongo:27017", ['username' => 'root', 'password' => 'example']);

// Insert
$bulk = new MongoDB\Driver\BulkWrite;
$bulk->delete([]);
$bulk->insert(['id' => 1,'name' => '石川悦子', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 2,'name' => '内間さとみ', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 3,'name' => '宮國泰然', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 4,'name' => '松田五月', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 5,'name' => '池村清一', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 6,'name' => '仲里裕之', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 7,'name' => '高安百合野', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 8,'name' => '仲村佳子', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 9,'name' => '當間香', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 10,'name' => '泉光代', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 11,'name' => '長濱英恵', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 12,'name' => '花城結生', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 13,'name' => '藤村裕介', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 14,'name' => '新城一美', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 15,'name' => '友利美和子', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 16,'name' => '堀川初美', 'startTime' => '12:30', 'endTime' => '16:30']);
$bulk->insert(['id' => 17,'name' => '伊良部政江', 'startTime' => '9:00', 'endTime' => '13:30']);
$bulk->insert(['id' => 18,'name' => '平良弘子', 'startTime' => '9:00', 'endTime' => '13:30']);
$bulk->insert(['id' => 19,'name' => '宮城清子', 'startTime' => '8:30', 'endTime' => '17:30']);
$bulk->insert(['id' => 20,'name' => '比屋根理沙', 'startTime' => '9:00', 'endTime' => '13:30']);
$bulk->insert(['id' => 21,'name' => '仲田佳穂', 'startTime' => '9:00', 'endTime' => '13:30']);
$bulk->insert(['id' => 22,'name' => '上運天裕子', 'startTime' => '9:00', 'endTime' => '13:00']);
$bulk->insert(['id' => 23,'name' => '上村渠とよみ', 'startTime' => '7:45', 'endTime' => '13:45']);
$bulk->insert(['id' => 24,'name' => '久手堅末子', 'startTime' => '9:30', 'endTime' => '13:30']);
$bulk->insert(['id' => 25,'name' => '平仲秀美', 'startTime' => '9:30', 'endTime' => '13:30']);
$manager->executeBulkWrite('plus.staff', $bulk);

// Select
//$filter = ['address' => ['$gt' => 'tokyo']]; // where句
$filter = [];
$options = [
  'projection' => ['_id' => 0],
  'sort' => ['_id' => -1],
];
$query = new MongoDB\Driver\Query($filter, $options);
$cursor = $manager->executeQuery('plus.staff', $query);

// Select 結果表示
foreach ($cursor as $document) {
  var_dump($document);
}
?>
