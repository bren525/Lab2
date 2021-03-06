'use strict';


angular.module('core').controller('HomeController', ['$scope', '$interval', 'Authentication', 'soundcloud','places',
	function($scope, $interval, Authentication, soundcloud, places) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;
		$scope.places = places;

		function initWidget () {
			$scope.soundcloud.fetchTracks('local natives').then(function (tracks){
				$scope.widgetPromise = $scope.soundcloud.fetchWidget(tracks[0].uri);
				$scope.widgetPromise.then(function (widget) {
					console.log(widget);
					$scope.widget = widget;
					$scope.widget.pause();
					$scope.songIndex=0
					$scope.widget.bind(SC.Widget.Events.FINISH, function () {
						console.log('playing next');
						console.log($scope.songIndex);
						if ($scope.songIndex < $scope.playlist.songs.length-1){
							$scope.songIndex += 1
							$scope.widget.load($scope.playlist.songs[$scope.songIndex].uri, {auto_play: true})
							console.log("songIndex",$scope.songIndex);
						} else {
							$scope.songIndex = 0;
							$scope.widget.load($scope.playlist.songs[$scope.songIndex].uri, {auto_play: true});
							console.log($scope.playlist.songs[$scope.songIndex]);
						}
						$scope.$apply();
						console.log("applying changes");
					});
					if ($scope.place.playlists.length > 0){
						$scope.playlistIndex = 0;
						$scope.playlist = $scope.place.playlists[$scope.playlistIndex];
						$scope.sidebarItems = $scope.playlist.songs;
						if ($scope.playlist.length > 0 ){
							$scope.widget.load($scope.playlist.songs[$scope.songIndex].uri);
						}
						$scope.mode = 'playing';
					}
					else {
						$scope.mode = 'playlisting';
					}
				});
			});
		}

		$scope.searchSongs = function () {
			console.log($scope.searchQuery);
			$scope.soundcloud.fetchTracks($scope.searchQuery).then(function (tracks){
				$scope.sidebarItems = tracks.slice(0,15);
				$scope.mode = 'searching';
			});
		};

		$scope.addPlaylist = function () {
			console.log($scope.playlistName);
			var playlist = {};
			playlist.title = $scope.playlistName;
			playlist.user = window.user.displayname;
			playlist.songs = [];
			$scope.place.playlists.push(playlist);
			updatePlace();
			$scope.playlist = playlist;
			$scope.playlistIndex = $scope.place.playlists.length-1;
			console.log('playlistIndex:', $scope.playlistIndex);
			$scope.mode = 'playing';
			$scope.sidebarItems = $scope.playlist.songs;
		}

		$scope.sidebarItemAction = function (sidebarItem) {
			if ($scope.mode == 'playlisting'){
				$scope.playlistIndex = arrayObjectIndexOf($scope.place.playlists, sidebarItem);
				$scope.playlist = $scope.place.playlists[$scope.playlistIndex];
				$scope.mode = 'playing';
				$scope.sidebarItems = $scope.playlist.songs;
			} else if ($scope.mode == 'searching'){
				$scope.place.playlists[$scope.playlistIndex].songs.push(sidebarItem);
				updatePlace();
				$scope.playlist = $scope.place.playlists[$scope.playlistIndex];
				$scope.mode = 'playing';
				$scope.sidebarItems = $scope.playlist.songs;
				console.log("Adding Song", $scope.sidebarItem.title);
			} else if ($scope.mode == 'playing') {
				$scope.widget.load(sidebarItem.uri, {auto_play: true});
				$scope.songIndex = arrayObjectIndexOf($scope.playlist.songs, sidebarItem);
				console.log("songIndex",$scope.songIndex);
				console.log(sidebarItem);
			}
		};

		$scope.back = function () {
			if ($scope.mode == 'searching'){
				$scope.mode = 'playing';
				$scope.sidebarItems = $scope.playlist.songs;
			} else if ($scope.mode == 'playing') {
				$scope.mode = 'playlisting';
				$scope.sidebarItems = $scope.place.playlists;
			}
		}

		function updatePlace (){
			var place = $scope.place;
			console.log(place);
			place.$update({placeId: place.placeId}, function (response) {
				$scope.place = response;
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
				console.log($scope.error);
			});
		}

		function syncPlace(){
			$scope.places.get({placeId: $scope.place.placeId}, function (match){
				if (match.message != 'Place not found'){
					$scope.place = match;
				} else {
					console.log('Syncing Error!!!');
				}
			})
		}
		$interval(syncPlace, 5000);

		function createPlace (newPlace) {
			// Create new Place object
			var place = new places({
			 	placeId: newPlace.placeId,
			 	title: newPlace.title,
			 	playlists: [],
			});

			place.$save(function (response) {
				$scope.place = response;
				$scope.sidebarItems = $scope.place.playlists;
				$scope.mode = "playlisting";
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
			});
		}


		function checkPlaceInBase (clickedPlace){
			$scope.places.get({
				placeId: clickedPlace.placeId
			},function (match) {
				if (match.message === 'Place not found') {
					createPlace(clickedPlace);
				} else {
					$scope.place = match;
					$scope.sidebarItems = $scope.place.playlists;
					$scope.mode = "playlisting";
				};
			});
		}

		function arrayObjectIndexOf(arr, obj){
			for(var i = 0; i < arr.length; i++){
				if(angular.equals(arr[i], obj)){
					return i;
				}
			};

			return -1;
		}

		
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
			map = new google.maps.Map(document.getElementById('map-canvas'),
			mapOptions);

			service = new google.maps.places.PlacesService(map);
			var input = (document.getElementById('mapSearchBar'));
  			map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  			searchBox = new google.maps.places.SearchBox((input));

  			$scope.mode = 'playing';

  			function createPlaceMarker(place) {
				var marker = new google.maps.Marker({
				    map: map,
				    title: place.name,
				    position: place.geometry.location
			 	});

			 	google.maps.event.addListener(marker, 'click', function() {
			 		infowindow.setContent('<div class=\'infowindow\'><h5>'+ place.name +'</h5>'+place.formatted_address+'</div>');
			 		infowindow.open(map, marker);
			 		checkPlaceInBase({title:place.name,placeId:place.place_id});
					$scope.$apply();
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
			service.nearbySearch({
  				location: map.getCenter(),
    			radius: '250'
    			,types: ['accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar','beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer','car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store','courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment','finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store','hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office','locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company','museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship','plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school','shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand','train_station','travel_agency','university','veterinary_care','zoo']
  			}, 
  			function(results){
  				if(results.length > 0){
  					service.getDetails({placeId: results[0].place_id}, function(details){
  						var initMarker = createPlaceMarker(details);
  						console.log('initial',details);
  						foundPlaces.push(initMarker);
  						infowindow.setContent('<div class=\'infowindow\'><h5>'+ details.name +'</h5>'+details.formatted_address+'</div>');
  						infowindow.open(map,initMarker.marker);
  						checkPlaceInBase({title:results[0].name,placeId:results[0].place_id});
						initWidget();
  					});
  					
  				}else{
  					checkPlaceInBase({title:'Franklin W. Olin College of Engineering',placeId:'ChIJu_Vj-z-B44kRW8PY7p4iOKA'});
					initWidget();
  				}
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
