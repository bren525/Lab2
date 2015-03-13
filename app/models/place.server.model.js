'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Place Schema
 */
var PlaceSchema = new Schema({
	placeId: {
		type: String,
	},
	title: {
		type: String,
	},
	playlist: {
		type: Array,
	}
});

mongoose.model('Place', PlaceSchema);
