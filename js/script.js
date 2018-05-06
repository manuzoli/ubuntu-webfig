$(document).ready(function(){
	
 	initIfconfig();
	
})

function initIfconfig(){
	$('.content').empty();
	
	$.getJSON( "php/status.php", function( data ) {
		
		$('.content').append('<div class="hostname"><label>Hostname:</label>'+data.hostname+'</div>');		

		$.each(data.interfaces,function(key,interface){
			$interface = $('<div class="interface" data-type="'+interface.type+'"  data-status="'+interface.status+'" data-link="'+interface.link+'" data-id="'+key+'"></div>');
			$interface.append('<div class="status"></div><div class="type"></div><div class="link"></div><div class="edit">bearbeiten</div>');
			
			$interface.append('<div class="name"><label>Name:</label>'+interface.name+'</div>');
			$interface.append('<div class="ip"><label>IP:</label>'+interface.ip+'</div>');
			$interface.append('<div class="subnet"><label>Subnet:</label>'+interface.subnet+'</div>');
			$interface.append('<div class="gateway"><label>Gateway:</label>'+interface.gateway+'</div>');
			$interface.append('<div class="mac"><label>MAC:</label>'+interface.mac+'</div>');
			
			$('.content').append($interface);	
			
			$('body').off('click','.edit').on('click','.edit',function(){
				var key = $(this).parent().attr('data-id');
				var type = $(this).parent().attr('data-type');
				editInt(key,type);
			})
			
			
		})
		
		
		
	})
}

function editInt( interf, type ){
	
	$('.content').empty();

	$int = $('<div class="interface form" data-id="'+interf+'" data-type="'+type+'"></div>');

	if(type == "wifi"){
		$int.append('<div class="scan"></div>');
		$int.append('<div class="ssid"><label>SSID:</label><input name="ssid"></div>');
		$int.append('<div class="wpa"><label>WPA2:</label><input name="wpa" type="password"></div>');
	}
	
	$int.append('<div class="mode"><label>Mode:</label>dhcp: <input type="radio" name="mode" value="dhcp"> -  static:<input type="radio" name="mode" value="static"></div>');
	$int.append('<div class="ip"><label>IP:</label><input name="ip"></div>');
	$int.append('<div class="subnet"><label>Subnet:</label><input name="subnet"></div>');
	$int.append('<div class="gateway"><label>Gateway:</label><input name="gateway"></div>');
	$int.append('<div class="dns"><label>DNS:</label><input name="dns"></div>');
	$int.append('<div class="submit">speichern</div>');
	$int.append('<div class="cancel">abbrechen</div>');
	
	$('.content').append($int);	
	
	fillInt( interf, type );
	
	$('body').off('click','.cancel').on('click','.cancel',function(){
		initIfconfig();	
	})
	
	$('body').off('click','.submit').on('click','.submit',function(){
		
		YAML.load('/php/readNetplan.php', function( yaml ){
		
			yaml['network'][type+'s'][interf] = {};	
			
			var mode = $('input[name="mode"]:checked').val();
			if(mode == 'dhcp'){
				
				yaml['network'][type+'s'][interf]['dhcp4'] = true;
				console.log(yaml['network'][type+'s'][interf]);
				
			} else {
				
				yaml['network'][type+'s'][interf]['dhcp4'] = false;
				
				var bits = dot2num($('[name="subnet"]').val());
				yaml['network'][type+'s'][interf]['addresses'] = '['+$('[name="ip"]').val()+'/'+bits+']';
			
				yaml['network'][type+'s'][interf]['gateway4'] = $('[name="gateway"]').val();
				
				yaml['network'][type+'s'][interf]['nameservers'] = {};
				yaml['network'][type+'s'][interf]['nameservers']['addresses'] = '['+$('[name="dns"]').val()+']';
				


			}
			
			if( type == 'wifi'){
				yaml['network'][type+'s'][interf]['access-points'] = {};
				yaml['network'][type+'s'][interf]['access-points'][$('[name="ssid"]').val()] = {};
				yaml['network'][type+'s'][interf]['access-points'][$('[name="ssid"]').val()]['password'] = $('[name="wpa"]').val();
			}
			
			
			console.log(yaml['network']);			
			yamlString = YAML.stringify(yaml, 10);
			/*TODO Yaml converter think the arrays are stringst*/
			yamlString = yamlString.replace(new RegExp('\'\\[', 'g'),'[');
			yamlString = yamlString.replace(new RegExp('\\]\'', 'g'),']');

			var data = {'yaml':yamlString };
			
			$('.interface.form').addClass('inactive');
			$.post('/php/writeNetplan.php', data, function(result){
				
				initIfconfig();
			   
			});			
			
			
		})
		
	})
	
	
	
}

function fillInt( interf, type ){
	
	YAML.load('/php/readNetplan.php', function( yaml ){
		
		var item = yaml['network'][type+'s'][interf];
		
		var mode = '';
		if( item['dhcp4'] ){
			mode = 'dhcp';
		} else {
			mode = 'static';
		}
		$('input[name="mode"][value="'+mode+'"]').trigger('click');
		
		if(typeof item.addresses != "undefined"){
			if(typeof item.addresses[0] != "undefined"){
				var addresses = item.addresses[0].split('/')
				$('input[name="ip"]').val(addresses[0]);
				$('input[name="subnet"]').val(num2dot(parseInt(addresses[1])));
			}
		}
		$('input[name="gateway"]').val(item.gateway4);
		
		if(typeof item.nameservers != "undefined"){
			$('input[name="dns"]').val(item.nameservers.addresses[0]);
		}
		
		if(type == 'wifi'){
			var wifi = Object.keys(item['access-points'])[0];
			$('input[name="ssid"]').val(wifi);
			$('input[name="wpa"]').val(item['access-points'][wifi]['password']);
		}
		
	    
	});

}


/* dotted-quad IP to integer */
function dot2num( strbits ) {
    var split = strbits.split( '.', 4 );
    var myInt = (split[0] >>> 0).toString(2)+(split[1] >>> 0).toString(2)+(split[2] >>> 0).toString(2)+(split[3] >>> 0).toString(2);
    myInt = myInt.replace(new RegExp('0', 'g'),'');
    return myInt.length;
}

/* Bitmask in IP Konvertieren */
function num2dot(num){
    var str = new Array(num + 1).join( '1' );
    var block1 = parseInt( str.substr(0, 8) , 2);
    var block2 = parseInt( str.substr(8, 8), 2);
    var block3 = parseInt( str.substr(16, 8), 2);
    var block4 = parseInt( str.substr(24, 8), 2);
    if(isNaN(block1)){ block1 = 0 };
	if(isNaN(block2)){ block2 = 0 };
	if(isNaN(block3)){ block3 = 0 };
	if(isNaN(block4)){ block4 = 0 };
    return block1+'.'+block2+'.'+block3+'.'+block4;
}






















