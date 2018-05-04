$(document).ready(function(){
	
	initIfconfig();
	
})

function initIfconfig(){
	$('.content').empty();
	
	$.getJSON( "php/status.php", function( data ) {
		
		$('.content').append('<div class="hostname"><label>Hostname:</label>'+data.hostname+'</div>');		
		
		console.log(data);
		
		$.each(data.interfaces,function(key,interface){
			$interface = $('<div class="interface" data-type="'+interface.type+'"  data-status="'+interface.status+'" data-link="'+interface.link+'" data-id="'+key+'"></div>');
			$interface.append('<div class="status"></div><div class="type"></div><div class="link"></div><div class="edit">bearbeiten</div>');
			
			$interface.append('<div class="name"><label>Name:</label>'+interface.name+'</div>');
			$interface.append('<div class="ip"><label>IP:</label>'+interface.ip+'</div>');
			$interface.append('<div class="subnet"><label>Subnet:</label>'+interface.subnet+'</div>');
			$interface.append('<div class="gateway"><label>Gateway:</label>'+interface.gateway+'</div>');
			$interface.append('<div class="mac"><label>MAC:</label>'+interface.mac+'</div>');
			
			$('.content').append($interface);
			
			
			
		})
		
	})
	
}