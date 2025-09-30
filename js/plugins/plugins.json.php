<?php
header('Content-Type: application/json');
$dir = __DIR__;
$files = array_filter(scandir($dir), function($f){
    return preg_match('/^plugin-.*\.js$/', $f);
});
echo json_encode(array_values($files));