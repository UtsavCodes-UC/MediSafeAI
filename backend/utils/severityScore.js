const getSeverityScore = (severity) => {
  switch (severity) {
    case "low":
      return 2;
    case "medium":
      return 5;
    case "high":
      return 8;
    default:
      return 0;
  }
};

module.exports = getSeverityScore;