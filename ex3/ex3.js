$(document).ready(function(){

	var map;
	var markerArray = new Array(); //array that stores markers of each request
	var routeLine; //variable is global so there is only one route displayed at a time

	
	var url = new Wrapper(callback); //wrapper used to wait for value definition (sse below)

	function initMap() {
		map = new google.maps.Map(document.getElementById('googleMap'), {
			zoom: 13,
			center: {lat: 60.4502, lng: 22.276} //centered on Turku
		});
	}

	initMap();

	getSecureUrl(); //get the proper https url


	$("#showbus").click(showBus);

	$("#refresh").click(showBus);


	$("#showroute").click(function(){ //get route and show it on the map
		var route_id = $("#busline").val(); //get route_id of the selected route

		var client = new XMLHttpRequest();
		client.open("GET", url.get() + "trips/all", true); //get request that retrieves all trips from Foli API
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);

				var shape_idArray = new Array(); //array containing all the shape_id of each trip that corresponds to the selected route
				var shape_id;
				

				for (var i = 0; i < obj.length; i++) { //for each trip check if its route_id attribute corresponds to the route_id
					if(obj[i].route_id == route_id){
						shape_idArray.push(obj[i].shape_id); //add the shape_id of the trip
					}
				};
				client.open("GET", url.get() + "shapes", true); //get request that retrieves all the shapes that actually have map coordinates.
				client.onreadystatechange = function() {
					if(client.readyState == 4) {
						var obj = JSON.parse(client.responseText);
						for (var i = 0; i < obj.length; i++) { //get the first shape that corresponds to shape_id and that is contained in the array of shapes having coordinates
							for (var j = 0; j < shape_idArray.length; j++) {
								if(shape_idArray[j] == obj[i]){
									shape_id = shape_idArray[j];
									i = obj.length;
									break;									
								}
							};
						};

						client.open("GET", url.get() + "shapes/" + shape_id, true); //get request that retrieves the corresponding coordinates of the shape
						client.onreadystatechange = function() {
							if(client.readyState == 4) {
								var obj = JSON.parse(client.responseText);
								if(obj.hasOwnProperty('success')){ //check if route coordinates exist and if not display an error message
									$("#errorMessage").text("No route found for this bus line");
								}else{
									$("#errorMessage").text("");
								}

								var routeCoordinates = new Array(); //array containing route coordinates
								var centerRouteCoordinates; //coordinates of the center of the route (used to center the map on the route)

								for (var i = 0; i < obj.length; i++) {
									if(i == Math.round(obj.length / 2)){ //middle of the coordinates array
										centerRouteCoordinates = {lat: parseFloat(obj[i].lat), lng: parseFloat(obj[i].lon)}; //create a coordinate tuple of the center of the route
									}
									routeCoordinates.push({lat: parseFloat(obj[i].lat), lng: parseFloat(obj[i].lon)}) //create and push a coordinate tuple for each coordinate
								};


								if(typeof routeLine != 'undefined'){
									routeLine.setMap(null); //delete previous line if it exists
								}								

								routeLine = new google.maps.Polyline({ //create a polyline from the routeCoordinates array
									path: routeCoordinates,
									geodesic: true,
									strokeColor: '#FF0000',
									strokeOpacity: 1.0,
									strokeWeight: 2
								});

								routeLine.setMap(map); //draw the line
								map.setCenter(centerRouteCoordinates); //center the map on the center of the line
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
		client.open("GET", url.get() + "routes", true); //get request that retrieves all routes
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);

				for (var i = 0; i < obj.length; i++) { //get route_id and route_name for each route and append them in the line select
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

	function getSecureUrl() {
		var client = new XMLHttpRequest();
		client.open("GET", "https://data.foli.fi/gtfs/", true);
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);
				url.set("https://data.foli.fi" + obj.gtfspath + "/" + obj.latest + "/");
			};
		};
		client.send();
	}

	function showBus(){ //show on the map buses corresponding to the selected bus line
		var route_name = $("#busline option:selected").text(); //get route_name

		clearMarkers(); //clear all previous markers before each request

		var client = new XMLHttpRequest();
		client.open("GET", "https://data.foli.fi/siri/vm", true); //get request that retrieves all the buses available
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);
				var vehicules = new Array();
				vehicules = obj.result.vehicles; //array that contains all the buses
				for (const prop in vehicules) { //for each bus check if its route attribute corresponds to route_name and if so place it on the map
					if(vehicules[prop].publishedlinename == route_name){
				    	placeMarker(vehicules[prop].longitude,vehicules[prop].latitude); //place marker on the map				    	
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

		markerArray.push(marker); //add marker to the array marker

		marker.setMap(map);
		map.setCenter(marker.getPosition());
	}

	function clearMarkers(){ //clear all previous markers from the map
		for (var i = 0; i < markerArray.length; i++) {
			markerArray[i].setMap(null);
		};
		markerArray = [];
	}


	function Wrapper(callback) {
	    var value;
	    this.set = function(v) {
	        value = v;
	        callback(this);
	    }
	    this.get = function() {
	        return value;
	    }  
	}

	function callback(wrapper) {
    	getAllLines(); //get lines when url value is defined
	}	
});