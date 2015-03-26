<?php
$page = $_GET['p'];
$url = "http://seecsee.com/index.php/circle/indexInfoList?p=".$page; 
$contents = file_get_contents($url); 
echo $contents; 
?>