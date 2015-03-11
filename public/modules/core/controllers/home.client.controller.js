'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'soundcloud',
	function($scope, Authentication, soundcloud) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.soundcloud = soundcloud;
		$scope.soundcloud.fetchTracks('buskers');
	}
]);
