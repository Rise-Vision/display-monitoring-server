const stateManager = require("./state-manager");

function updateDisplayStatusList(list) {
  stateManager.filterSilentStates(list);

  list.forEach(({displayId, online, addresses}) => {
    const action = stateManager.updateDisplayStatus(displayId, online);

    switch(action) {
      case "SEND_FAILURE_EMAIL":
        return module.exports.sendFailureEmail(displayId, addresses);

      case "SEND_RECOVERY_EMAIL":
        return module.exports.sendRecoveryEmail(displayId, addresses);
    }
  });
}

function sendFailureEmail(displayId, addresses) {
}

function sendRecoveryEmail(displayId, addresses) {
}

module.exports = {
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusList
};
