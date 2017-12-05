$(document).ready(function(){

	var map;

	function initMap() {
		map = new google.maps.Map(document.getElementById('googleMap'), {
			zoom: 6,
			center: {lat: 60.4502, lng: 22.276}
		});
	}

	initMap();
	displayRequest();
	
	$("#search").click(function(){	
		var country = $( "#countries" ).val();
		var code = $("#code").val();
		var lng;
		var lat;

		var client = new XMLHttpRequest();
		client.open("GET", "http://api.zippopotam.us/" + country + "/" + code, true);
		client.onreadystatechange = function() {
			if(client.readyState == 4) {
				var obj = JSON.parse(client.responseText);
				var places = obj.places;

				a1 = JSON.parse(localStorage["request"]);

				//var a1 = new Array();

				var s = obj.country + ' - ' + code;

				addInArray(a1, s);

				localStorage["request"] = JSON.stringify(a1);

				$("#places").find("tr:gt(0)").remove();
				for (var i = 0; i < places.length; i++) {
					lng = places[i].longitude;
					lat = places[i].latitude;
					$('#places').append('<tr><td>' + places[i]["place name"] + '</td><td>' + lng + '</td><td>' + lat + '</td></tr>');
					placeMarker(lng,lat);
				};

				displayRequest();	
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
		requestStorage = JSON.parse(localStorage["request"]);
		var s = "";
		for (var i = 0; i < requestStorage.length; i++) {
			s = s + requestStorage[i] + '<br>';
		};
		$( "#demo" ).html( s );
		console.log(s);

	}

	function addInArray(a, s){
		//if (a.length < 10) {
			a.push(s);
		/*}else {
			a1 = JSON.parse(localStorage["request"]);
			var a2 = new Array();
			a2[0] = s;
			for (var i = 0; i < a1.length-1; i++) {
				a2[i+1]=a1[i];
			};
			

			console.log(a2);
			localStorage["request"] = JSON.stringify(a2);
			displayRequest();
		};*/
	}
});