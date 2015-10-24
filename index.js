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
	var markers = [];
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
		//clear previous markers
		for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
		//create map markers
		var bounds = new google.maps.LatLngBounds();
		var pos = new google.maps.LatLng(0, 0);
		var m_color = '#5BC0BE';
		for (var i = 0; i < val.length; i++) {
			//get the coordinates
			var coord = val[i].replace(' ', '').replace('(', '').replace(')', '').split(',');
			var lat = parseFloat(coord[0]);
			var lon = parseFloat(coord[1]);
			new_pos = new google.maps.LatLng(lat, lon);
			if(new_pos.lat() == pos.lat() && new_pos.lng() == pos.lng()){
				continue;
			}
			console.log(new_pos.lat());
			//create a path between them
			var path = new google.maps.Polyline({
				path: [pos, new_pos],
				geodesic: true,
				strokeColor: m_color,
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			path.setMap(map);
			//create new icon
			pos = new_pos;
			m_color = color_mix('#5BC0BE', '#0B132B', i/val.length);
			var icon = create_marker_icon(m_color);
			//make the marker
			markers.push(new google.maps.Marker({
				position: pos,
				map: map,
				icon: icon
			}));
			//expand bounds to fit
			bounds.extend(pos);
		}
		map.fitBounds(bounds);
	});
	//returns a color partway between two others
	var color_mix = function(color_start, color_end, mix){
		color_start = color_start.replace('#', '');
		color_end = color_end.replace('#', '');
		var c1 = {
			r: parseInt(color_start[0]+color_start[1], 16),
			g: parseInt(color_start[2]+color_start[3], 16),
			b: parseInt(color_start[4]+color_start[5], 16),
		};
		var c2 = {
			r: parseInt(color_end[0]+color_end[1], 16),
			g: parseInt(color_end[2]+color_end[3], 16),
			b: parseInt(color_end[4]+color_end[5], 16),
		};
		var c3 = {
			r: (1-mix)*c1.r + (mix)*c2.r,
			g: (1-mix)*c1.g + (mix)*c2.g,
			b: (1-mix)*c1.b + (mix)*c2.b,
		}
		var sr = parseInt(c3.r).toString(16);
		var sg = parseInt(c3.g).toString(16);
		var sb = parseInt(c3.b).toString(16);
		if(sr.length < 2){ sr = '0' + sr; }
		if(sg.length < 2){ sg = '0' + sg; }
		if(sb.length < 2){ sb = '0' + sb; }
		return '#' + sr + sg + sb;
	};
	//creates a data URI containing the icon image of said color
	var create_marker_icon = function(color){
		var size = 20;
		var c = document.createElement('canvas');
		c.width = size;
		c.height = size;
		var ctx = c.getContext("2d");

		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(size/2,size/2,0.3*size,0,2*Math.PI);
		ctx.fill();
		return c.toDataURL();
	};
});
