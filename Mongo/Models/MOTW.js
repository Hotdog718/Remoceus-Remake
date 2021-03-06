const mongoose = require("mongoose");

const motwSchema = mongoose.Schema({
  setName: String,
  pokemon: String,
  ability: String,
  nature: String,
  item: String,
  evs: Object,
  move1: String,
  move2: String,
  move3: String,
  move4: String,
  forme: String,
  shiny: Boolean,
  year: Number,
  ytLink: String
});

module.exports = mongoose.model("MOTW", motwSchema);
