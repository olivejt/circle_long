<?php
$url = "http://seecsee.com/index.php/circle/indexBanner"; 
$contents = file_get_contents($url); 
echo $contents; 
?>