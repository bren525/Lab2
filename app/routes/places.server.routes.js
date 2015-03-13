'use strict';

/**
 * Module dependencies.
 */
var users = require('../../app/controllers/users.server.controller'),
	places = require('../../app/controllers/places.server.controller');

module.exports = function(app) {
	// Article Routes
	app.route('/places')
		.get(places.list)
		.post(users.requiresLogin, places.create);

	app.route('/places/:placeId')
		.get(places.read)
		.put(users.requiresLogin, places.update)
		.delete(users.requiresLogin, places.delete);

	// Finish by binding the place middleware
	app.param('placeId', places.placeByID);
};
