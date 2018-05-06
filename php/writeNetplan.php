<?php

	$yaml = $_POST['yaml'];
	$result = file_put_contents('/etc/netplan/50-cloud-init.yaml',$yaml);
	
	$myfile = fopen("/etc/netplan/50-cloud-init.yaml", "w") or die("Unable to open file!");
	fwrite($myfile, $yaml);
	fclose($myfile);
	
	sleep(5);
	exec('/var/www/html/php/netplan_apply');	

	echo 'success';
	
	
?>