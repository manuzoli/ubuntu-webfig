<?php
	header('Content-Type: application/json');

	$interface = $_GET['interface'];
	$wifis = array();
	
	$command = "iwlist $interface scan > /var/www/html/php/wifis.txt";
	echo $command.'<br>';
	passthru($command);
	var_dump($wifis);
	
?>