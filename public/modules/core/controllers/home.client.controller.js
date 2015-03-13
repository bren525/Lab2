'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'soundcloud','places',
	function($scope, Authentication, soundcloud, places) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;
		$scope.places = places;

		$scope.soundcloud.fetchTracks('local natives').then(function (tracks){
			$scope.widgetPromise = $scope.soundcloud.fetchWidget(tracks[0].uri);
			$scope.widgetPromise.then(function (widget) {
				console.log(widget);
				$scope.widget = widget;
				$scope.widget.pause();
			});
			$scope.mode = "playing";
		});

		$scope.searchSongs = function () {
			console.log($scope.searchQuery);
			$scope.soundcloud.fetchTracks($scope.searchQuery).then(function (tracks){
				$scope.sidebarItems = tracks.slice(0,15);
				$scope.mode = "searching";
			});
		};

		$scope.sidebarItemAction = function (sidebarItem) {
			if ($scope.mode == "searching"){
				$scope.place.playlist.push(sidebarItem);
				$scope.updatePlace();
				$scope.mode = "playing";
				$scope.sidebarItems = $scope.place.playlist;
			} else if ($scope.mode == "playing") {
				$scope.widget.load(sidebarItem.uri, {auto_play: true});
				$scope.widget.bind(SC.Widget.Events.FINISH, playNext())
			}
			console.log(sidebarItem);
		};

		function playNext () {
			var index = $scope.place.playlist.indexOf($scope.widget.getCurrentSound());
			if (index < $scope.place.playlist.length){
				$scope.widget.load($scope.place.playlist[index+1])
			} else {
				$scope.widget.load($scope.place.playlist[0]);
			}
		}

		$scope.updatePlace = function(){
			var place = $scope.place;
			console.log(place);
			place.$update({placeId: place.placeId}, function () {
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
			});
		};

		function createPlace (newPlace) {
			// Create new Place object
			var place = new places({
			 	placeId: newPlace.placeId,
			 	title: newPlace.title,
			 	playlist: [],
			});

			place.$save(function (response) {
				$scope.place = response;
				$scope.sideBarItems = $scope.place.playlist;
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
			});
		}


		function checkPlaceInBase (clickedPlace){
			$scope.places.get({
				placeId: clickedPlace.placeId
			},function (match) {
				if (match.message == "Place not found") {
					createPlace(clickedPlace);

				} else {
					$scope.place = match;
					$scope.sideBarItems = $scope.place.playlist;
					$scope.mode = "playing";
				};
			});
		};

		var foundPlaces = [];
		function initializeMap(lat,lng){
			var map;
			var service;
			var searchBox;
			var infowindow = new google.maps.InfoWindow();
			var mapOptions = {
			  center: new google.maps.LatLng(lat, lng),
			  zoom: 13
			};
			map = new google.maps.Map(document.getElementById("map-canvas"),
			mapOptions);

			service = new google.maps.places.PlacesService(map);
			var input = (document.getElementById('mapSearchBar'));
  			map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  			searchBox = new google.maps.places.SearchBox((input));

  			function createPlaceMarker(place) {
				var marker = new google.maps.Marker({
				    map: map,
				    title: place.name,
				    position: place.geometry.location
			 	});

			 	infowindow.close();

			 	google.maps.event.addListener(marker, 'click', function() {
			 		infowindow.setContent("<div class=\"infowindow\"><h5>"+ place.name +"</h5>"+place.formatted_address+"</div>");
			 		infowindow.open(map, marker);
			 		checkPlaceInBase({title:place.name,placeId:place.place_id});
		    		/*map.setZoom(16);
		    		map.panTo(marker.getPosition());*/
	  			});

				return {title:place.name, placeId:place.place_id, marker:marker};
			}

			function clearPlaces(){
				for (var i = 0; i < foundPlaces.length;i++){
					foundPlaces[i].marker.setMap(null);
				}
				foundPlaces = [];
			}

			function displaySearch() {
				var results = searchBox.getPlaces();
				var bounds = new google.maps.LatLngBounds();
				clearPlaces();
				console.log(results);
				for (var i = 0; i < results.length; i++) {
					foundPlaces.push(createPlaceMarker(results[i]));
					bounds.extend(results[i].geometry.location);
				}
				map.fitBounds(bounds);
			}

			google.maps.event.addListener(searchBox, 'places_changed', displaySearch);

			google.maps.event.addListener(map, 'bounds_changed', function() {
			    var searchBounds = map.getBounds();
			    searchBox.setBounds(searchBounds);
			});

		}
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(function(position){
				console.log('geolocate ',position);
				initializeMap(position.coords.latitude,position.coords.longitude);
			},
			function(err){
				initializeMap(41.9000,12.5000);
			}
			);
		}
		else{
			initializeMap(41.9000,12.5000);
		}
	}
]);
