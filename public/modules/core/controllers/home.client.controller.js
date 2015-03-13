'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'soundcloud','places',
	function($scope, Authentication, soundcloud) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;
		$scope.places = places;

		$scope.searchSongs = function () {
			console.log($scope.searchQuery);
			$scope.soundcloud.fetchTracks($scope.searchQuery).then(function (tracks){
				$scope.sidebarItems = tracks.slice(0,15);
				$scope.sidebarItems.class = "sidebar-search";
			});
		};

		$scope.soundcloud.fetchTracks('local natives').then(function (tracks){
			$scope.soundcloud.fetchWidget(tracks[0].uri);
		});

		$scope.clickedPlace = function(place) {
			if checkPlaceInBase(place) == false {
				createPlace(place);
			}

			$scope.sideBarItems = $scope.place.playlist;
			$scope.sideBarItems.class = "sidebar-song";
		};

		$scope.updatePlace = function(){
			var place = $scope.place;

			place.$update(function () {
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
			});
		};

		function createPlace (newPlace) {
			// Create new Place object
			var place = new Places({
			 	placeId: newPlace.placeId,
			 	title: newPlace.title,
			 	playlist: [],
			});

			place.$save(function (response) {
				$scope.place = newPlace;
			}, function (errorResponse){
				$scope.error = errorResponse.data.message;
			});
		}


		function checkPlaceInBase (clickedPlace){
			var match = Places.get({
				placeId: clickedPlace.placeId;
			});

			if match.length == 0 {
				return false;
			} else {
				$scope.place = match;
			};
		};
	}
]);
