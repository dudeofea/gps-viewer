//google maps API callback
function initMap(){
	map = new google.maps.Map($('.gps-map')[0], {
		center: {lat: -34.397, lng: 150.644},
		zoom: 8
	});
	//match to color scheme
	var styles = [
		{
			stylers: [
				{ hue: "#0077FF" }
			]
		}
	];
	map.setOptions({styles: styles});
}

$(window).load(function(){
	var key_timeout = false;
	//Refresh the map points when the text changes
	$('.points').keyup(function(){
		if(key_timeout == true){
			return;		//don't refresh too ofter
		}
		key_timeout = true;
		setTimeout(function(){
			key_timeout = false;
		}, 300);
		var val = $(this).val();
		val = val.split('\n');
		console.log(val);
	});
});
