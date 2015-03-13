'use strict';

//Places service used for communicating with the places REST endpoints
angular.module('core').factory('places', ['$resource',
	function($resource) {
		return $resource('places/:placeId', {
			
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
