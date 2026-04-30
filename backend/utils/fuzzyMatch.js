let drugMap = {};

const initializeFuzzy = (map) => {
  drugMap = map;
};

const findBestMatch = (input) => {
  input = input.toLowerCase().trim();

  if (drugMap[input]) return drugMap[input];

  return input;
};

module.exports = { initializeFuzzy, findBestMatch };