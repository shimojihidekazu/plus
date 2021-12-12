<?php
header("Content-Type: application/json; charset=utf-8");
echo file_get_contents($_SERVER['DOCUMENT_ROOT']."/../webapp/config/ApplicationContentMaster.json");