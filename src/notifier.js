const stateManager = require("./state-manager");

function updateDisplayStatusList(list) {
  stateManager.filterSilentStates(list);
}

module.exports = {
  updateDisplayStatusList
};
