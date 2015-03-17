'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Place = mongoose.model('Place'),
	_ = require('lodash');

/**
 * Create a place
 */
exports.create = function(req, res) {
	var place = new Place(req.body);
	place.user = req.user;

	place.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(place);
		}
	});
};

/**
 * Show the current place
 */
exports.read = function(req, res) {
	console.log(req.place);
	res.json(req.place);
};

/**
 * Update a place
 */
exports.update = function(req, res) {
	var place = req.place;
	place = _.extend(place, req.body);

	place.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(place);
		}
	});
};

/**
 * Delete an place
 */
exports.delete = function(req, res) {
	var place = req.place;

	place.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(place);
		}
	});
};

/**
 * List of Places
 */
exports.list = function(req, res) {
	Place.find().sort('-created').populate('user', 'displayName').exec(function(err, places) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.json(places);
		}
	});
};

/**
 * Place middleware
 */
exports.placeByID = function(req, res, next, id) {

	/*if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Place is invalid'
		});
	}*/

	Place.findOne({placeId:id}).exec(function(err, place) {
		if (err) return next(err);
		if (!place) {
			return res.status(200).send({
				message: 'Place not found'
			});
		}
		req.place = place;
		next();
	});
};

/**
 * Place authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.place.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
