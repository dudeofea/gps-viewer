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

//thanks to http://stackoverflow.com/a/950146
function load_script(url, callback){
	// Adding the script tag to the head as suggested before
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	// Then bind the event to the callback function.
	// There are several events for cross browser compatibility.
	script.onreadystatechange = callback;
	script.onload = callback;
	// Fire the loading
	head.appendChild(script);
};

//get our script's path
var scripts = document.getElementsByTagName("script"),
	script_src = scripts[scripts.length-1].src,
	base = script_src.split('/');
base.pop(); base = base.join('/');

$(window).load(function(){
	var key_timeout = false;
	var markers = [];
	//get api key from file
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (e) {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var key = xhr.responseText;
			//load google maps script
			load_script("https://maps.googleapis.com/maps/api/js?key="+key+"&callback=initMap");
		}
	}
	xhr.open("GET", base+'/api_key.json', true);
	xhr.send();
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
			//check if valid
			if(isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180){
				continue;
			}
			new_pos = new google.maps.LatLng(lat, lon);

			//ignore duplicates
			// if(new_pos.lat() == pos.lat() && new_pos.lng() == pos.lng()){
			// 	continue;
			// }

			//create a path between them
			if(i > 0){
				var path = new google.maps.Polyline({
					path: [pos, new_pos],
					geodesic: true,
					strokeColor: m_color,
					strokeOpacity: 1.0,
					strokeWeight: 2
				});
				path.setMap(map);
			}
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
		if(markers.length > 0){
			map.fitBounds(bounds);
		}
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
	var occurences = function(string, subString, allowOverlapping) {
		string += "";
		subString += "";
		if (subString.length <= 0) return (string.length + 1);

		var n = 0,
		pos = 0,
		step = allowOverlapping ? 1 : subString.length;

		while (true) {
			pos = string.indexOf(subString, pos);
			if (pos >= 0) {
				++n;
				pos += step;
			} else break;
		}
		return n;
	};
	$(document).mouseup(function(){
		//undo selection
		for (var i = 0; i < markers.length; i++) {
			markers[i].setIcon(
				create_marker_icon(
					color_mix('#5BC0BE', '#0B132B', i/markers.length)
				)
			);
		}
		//get the selected text
		var text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type != "Control") {
			text = document.selection.createRange().text;
		}
		if(text == ""){ return;	}
		//console.log(text);
		var all = $('.points').val();
		var start = all.substring(0, all.indexOf(text));
		var n_start = occurences(start, '\n');
		var n_text = occurences(text, '\n');
		console.log(n_start, n_text);
		for (var i = n_start; i < n_start+n_text+1; i++) {
			markers[i].setIcon(create_marker_icon('#FFFFFF'));
		}
	});
});
