<?php
	header('Content-Type: application/json');

	//neu
	// ls /sys/class/net
	// ip route | grep default
	// netplan ip leases enp0s3
	

	$interfaces = shell_exec('ifconfig -s -a');
	$interfaces = explode(PHP_EOL, trim($interfaces));
	//remove first line (headlines)
	array_shift($interfaces);
	
	$ints = array();
	
	$ints['hostname'] = getHostname();
	$ints['interfaces'] = array();

	foreach($interfaces as $interface) {
		
		$int = explode(' ', trim($interface));
		
		if( getIP($int[0]) != '127.0.0.1'){
			
			$ints['interfaces'][$int[0]]['name'] =  $int[0];
			$ints['interfaces'][$int[0]]['ip'] = getIP($int[0]);
			$ints['interfaces'][$int[0]]['subnet'] = getSubnetmask($int[0]);
			$ints['interfaces'][$int[0]]['gateway'] = getGateway($int[0]);
			$ints['interfaces'][$int[0]]['status'] = getStatus($int[0]);
			$ints['interfaces'][$int[0]]['link'] = getLink($int[0]);
			$ints['interfaces'][$int[0]]['mac'] = getMac($int[0]);
			$ints['interfaces'][$int[0]]['type'] = getHardwaretype($int[0]);

		}
	}
	
	$json = json_encode($ints);

	echo $json;

	function getIP($interface){
		$ip =  shell_exec("ip -4 addr show ".$interface." | grep -oP '(?<=inet\s)\d+(\.\d+){3}'");
		return trim($ip);
	}

	function getSubnetmask($interface){
		$subnet =  shell_exec("/sbin/ifconfig ".$interface." | awk '/netmask/{ print $4;} '");
		return trim($subnet);	
	}
	
	function getLink($interface){
		$status = shell_exec("ethtool ".$interface."");
		if (strpos($status, 'Link detected: yes') !== false) {
			return 'ok';
		} else {
			return 'down';
		}
	}
	
	function getGateway($interface){
		$gateway = shell_exec("route -n | awk -viface=".$interface." '{if ($1 == \"0.0.0.0\" && $8 == iface) {print $2;exit}}'");
		return trim($gateway);
	}
	
	function getMac($interface){
		$mac = shell_exec("cat /sys/class/net/".$interface."/address");
		return trim($mac);
	}
	
	function getStatus($interface){
		$mac = shell_exec("cat /sys/class/net/".$interface."/operstate");
		return trim($mac);
	}
	
	function getHardwaretype($interface){
		$type = shell_exec("iwconfig ".$interface." 2>&1");
		if (strpos($type, 'no wireless extensions') !== false) {
			return 'ethernet';
		} else {
			return 'wifi';
		}		
	}

?>