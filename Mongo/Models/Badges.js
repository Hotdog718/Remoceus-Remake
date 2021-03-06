const mongoose = require("mongoose");

const badgeSchema = mongoose.Schema({
	userID: String,
	serverID: String,
	bug: Boolean,
	dark: Boolean,
	dragon: Boolean,
	electric: Boolean,
	fairy: Boolean,
	fighting: Boolean,
	fire: Boolean,
	flying: Boolean,
	ghost: Boolean,
	grass: Boolean,
	ground: Boolean,
	ice: Boolean,
	normal: Boolean,
	poison: Boolean,
	psychic: Boolean,
	rock: Boolean,
	steel: Boolean,
	water: Boolean,
	count: Number,
	hometown: String,
	points: Number
});

module.exports = mongoose.model("Badges", badgeSchema);
