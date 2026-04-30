const Interaction = require("../models/interactions.js");

const buildDrugMap = async () => {
  const interactions = await Interaction.find();

  let map = {};

  interactions.forEach(i => {
    map[i.itemA.toLowerCase()] = i.itemA.toLowerCase();
    map[i.itemB.toLowerCase()] = i.itemB.toLowerCase();

    i.itemA_synonyms?.forEach(s => {
      map[s.toLowerCase()] = i.itemA.toLowerCase();
    });

    i.itemB_synonyms?.forEach(s => {
      map[s.toLowerCase()] = i.itemB.toLowerCase();
    });
  });

  return map;
};

module.exports = buildDrugMap;