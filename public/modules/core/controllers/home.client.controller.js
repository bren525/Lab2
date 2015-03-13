'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'soundcloud',
	function($scope, Authentication, soundcloud) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;
		$scope.soundcloud.fetchTracks('arctic monkeys').then(function (tracks){
			console.log(tracks[0]);
			$scope.soundcloud.fetchWidget(tracks[0].uri);
		});

		var map;
		var service;
		var foundPlaces = [];
		function initialize(){
			var mapOptions = {
			  center: new google.maps.LatLng(42.364506, -71.038887),
			  zoom: 10
			};
			map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);
			
			service = new google.maps.places.PlacesService(map);
			

		}
		initialize();

		function createPlace(place) {
			console.log(place.place_id);
			var marker = new google.maps.Marker({
			    map: map,
			    position: place.geometry.location
			    ,place: {placeId: place.place_id, location: place.geometry.location}
		 	});
		 	var infowindow = new google.maps.InfoWindow();
		 	google.maps.event.addListener(marker, 'click', function() {
		 		infowindow.setContent(place.name +" \n"+place.formatted_address);
		 		infowindow.open(map, marker);
	    		map.setZoom(16);
	    		map.panTo(marker.getPosition());
  			});
		 	return marker;
		}
		function clearPlaces(){
			for (var i = 0; i < foundPlaces.length;i++){
				foundPlaces[i].setMap(null);
			}
			foundPlaces = [];
		}

		function displaySearch(results, status) {
			clearPlaces();
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log(results);
				for (var i = 0; i < results.length; i++) {
					foundPlaces.push(createPlace(results[i]));
				}
			}
		}
		
		$scope.search = function(){
			console.log($scope.searchText);
			var request = {
				location: map.getCenter(),
				radius: '500',
				query: $scope.searchText
			};
			service.textSearch(request, displaySearch);
		}

		
    	console.log(map);
	}
	
]);
