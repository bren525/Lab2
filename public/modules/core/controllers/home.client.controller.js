'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'soundcloud',
	function($scope, Authentication, soundcloud) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;

		$scope.search = function () {
			console.log($scope.searchQuery);
			$scope.soundcloud.fetchTracks($scope.searchQuery).then(function (tracks){
				$scope.sidebarItems = tracks.slice(0,15);
			});
		};

		$scope.soundcloud.fetchTracks('local natives').then(function (tracks){
			$scope.soundcloud.fetchWidget(tracks[0].uri);
		});
	}
]);
