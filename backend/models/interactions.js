const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  itemA: String,
  itemB: String,

  itemA_synonyms: [String],
  itemB_synonyms: [String],

  type: String,

  severity: String,
  baseScore: Number,

  mechanism: String,
  effects: [String],
  recommendation: String
});

module.exports = mongoose.model("Interaction", interactionSchema);