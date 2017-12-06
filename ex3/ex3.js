$(document).ready(function(){

	var map;
	var routeLine;
	var markerArray = new Array();


	function initMap() {
		map = new google.maps.Map(document.getElementById('googleMap'), {
			zoom: 13,
			center: {lat: 60.4502, lng: 22.276}
		});
	}

	initMap();

	getAllLines();	

	$("#showbus").click(showBus);

	$("#refresh").click(showBus);


	$("#showroute").click(function(){
		var route_id = $("#busline").val();

		var client = new XMLHttpRequest();
		client.open("GET", "http://data.foli.fi/gtfs/trips/all", true);
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);

				var trip_id;
				var shape_idArray = new Array();
				var shape_id;
				

				for (var i = 0; i < obj.length; i++) {
					if(obj[i].route_id == route_id){
						trip_id = obj[i].trip_id;
						shape_idArray.push(obj[i].shape_id);
					}
				};
				client.open("GET", "http://data.foli.fi/gtfs/shapes", true);
				client.onreadystatechange = function() {
					if(client.readyState == 4) {
						var obj = JSON.parse(client.responseText);
						for (var i = 0; i < obj.length; i++) {
							for (var j = 0; j < shape_idArray.length; j++) {
								if(shape_idArray[j] == obj[i]){
									shape_id = shape_idArray[j];
									i = obj.length;
									break;									
								}
							};
						};

						client.open("GET", "http://data.foli.fi/gtfs/shapes/" + shape_id, true);
						client.onreadystatechange = function() {
							if(client.readyState == 4) {
								var obj = JSON.parse(client.responseText);
								if(obj.hasOwnProperty('success')){
									$("#errorMessage").text("No route found for this bus line");
								}else{
									$("#errorMessage").text("");
								}

								var routeCoordinates = new Array();
								var centerRouteCoordinates;

								for (var i = 0; i < obj.length; i++) {
									if(i == Math.round(obj.length / 2)){
										centerRouteCoordinates = {lat: parseFloat(obj[i].lat), lng: parseFloat(obj[i].lon)};
									}
									routeCoordinates.push({lat: parseFloat(obj[i].lat), lng: parseFloat(obj[i].lon)})
								};


								if(typeof routeLine != 'undefined'){
									routeLine.setMap(null);
								}								

								routeLine = new google.maps.Polyline({
									path: routeCoordinates,
									geodesic: true,
									strokeColor: '#FF0000',
									strokeOpacity: 1.0,
									strokeWeight: 2
								});

								routeLine.setMap(map);
								map.setCenter(centerRouteCoordinates);
							};
						};
						client.send();
					};
				};
				client.send();


			};
		};
		client.send();		
	});

	function getAllLines(){
		var client = new XMLHttpRequest();
		client.open("GET", "http://data.foli.fi/gtfs/routes", true);
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);

				for (var i = 0; i < obj.length; i++) {
					var route_id = obj[i].route_id;
					var route_name = obj[i].route_short_name;

					$('#busline').append($('<option>', {
						value: route_id,
						text: route_name
					},'<\option>'));
				};
			};
		};
		client.send();
	}

	function showBus(){
		var route_name = $("#busline option:selected").text();

		clearMarkers();

		var client = new XMLHttpRequest();
		client.open("GET", "http://data.foli.fi/siri/vm", true);
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);
				var vehicules = new Array();
				vehicules = obj.result.vehicles;
				for (const prop in vehicules) {
				    if(vehicules[prop].publishedlinename == route_name){
				    	placeMarker(vehicules[prop].longitude,vehicules[prop].latitude);				    	
				    }
				}
				
			};
		};
		client.send();
	}

	function placeMarker(a,b) {
		var marker;
		marker = new google.maps.Marker({
			map: map,
			position: {lat:parseFloat(b), lng:parseFloat(a)}
		});

		markerArray.push(marker);

		marker.setMap(map);
		map.setCenter(marker.getPosition());
	}

	function clearMarkers(){
		for (var i = 0; i < markerArray.length; i++) {
			markerArray[i].setMap(null);
		};
		markerArray = [];
	}
});