$(document).ready(function(){

	var map;

	function initMap() {
		map = new google.maps.Map(document.getElementById('googleMap'), {
			zoom: 6,
			center: {lat: 60.4502, lng: 22.276} //centered on Turku
		});
	}

	initMap();

	//display request history if it exists
	displayRequest();
	
	//search for location when clicking on search button
	$("#search").click(function(){	
		var country = $( "#countries" ).val(); //country value from select element 
		var code = $("#code").val(); //code value from input text
		code = code.replace(/\s+/g, ''); //remove spaces from code
		if( !/^\d+$/.test(code)) { //check if code is a number
			return;
		}

		var client = new XMLHttpRequest(); 
		client.open("GET", "http://api.zippopotam.us/" + country + "/" + code, true); //get request, use the zippopatam api with the input country and code
		client.onreadystatechange = function() {
			if(client.readyState == 4) {

				var obj = JSON.parse(client.responseText);

				if(typeof obj.country === 'undefined'){ //check if the location associated with the country and code exists
					return;
				}
				var places = obj.places; //get places array associated with the location

				if (typeof localStorage["request"] === 'undefined'){ //check if the history localStorage already exists
					var a1 = new Array(); //create new array of requests if it doesn't exist
				}else{
					a1 = JSON.parse(localStorage["request"]); //get array of requests from the localStorage if it exists
				}

				

				var s = obj.country + ' - ' + code; //string for request history

				if (a1.length < 10) { //check if history contains more than 10 requests
					a1.push(s); //push current request in array of requests
				}else { //if 10 requests or more
					var a2 = new Array(); //create a new array
					a2[0] = s; //push current request in it
					for (var i = 0; i < a1.length-1; i++) {
						a2[i+1]=a1[i]; //copy 9 first requests from request history and push them in the new array after the current request
					};

					for (var i = 0; i < a1.length; i++) {
						a1[i] = a2[i]; //copy new array in the original array of requests
					};
				};

				localStorage["request"] = JSON.stringify(a1); //store the final array of requests

				var lng; //longitude of places
				var lat; //latitude of places

				$("#places").find("tr:gt(0)").remove(); //remove all rows from places table except the first one (title row)
				for (var i = 0; i < places.length; i++) { //for each place in places array append informations in places table
					lng = places[i].longitude;
					lat = places[i].latitude;
					$('#places').append('<tr><td>' + places[i]["place name"] + '</td><td>' + lng + '</td><td>' + lat + '</td></tr>');
					placeMarker(lng,lat); //place the corresponding marker on the map
				};

				displayRequest(); //display request history if it exists	
			};
		};
		client.send();

	});


	function placeMarker(a,b) {
		var marker;
		marker = new google.maps.Marker({
			map: map,
			position: {lat:parseFloat(b), lng:parseFloat(a)}
		});

		marker.setMap(map);
		map.setCenter(marker.getPosition());
	}

	function displayRequest() {
		if (typeof localStorage["request"] === 'undefined'){ //check if the history localStorage exists
			return
		}else{
			requestStorage = JSON.parse(localStorage["request"]); //get array of requests from the localStorage if it exists
			var s = "";
			for (var i = 0; i < requestStorage.length; i++) {
				s = s + requestStorage[i] + '<br>';
			};
			$( "#demo" ).html( s ); //display the array in demo div
		}
	}
});