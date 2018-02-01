/* eslint-disable default-case, no-unused-vars */

const stateManager = require("./state-manager");

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterSilentStates(list);

  list.forEach(({displayId, online, addresses}) => {
    const action = stateManager.updateDisplayStatus(displayId, online);

    switch (action) {
      case "SEND_FAILURE_EMAIL":
        return module.exports.sendFailureEmail(displayId, addresses);

      case "SEND_RECOVERY_EMAIL":
        return module.exports.sendRecoveryEmail(displayId, addresses);
    }
  });
}

function sendFailureEmail(displayId, addresses) {
  // implement when external email service is decided...
}

function sendRecoveryEmail(displayId, addresses) {
  // implement when external email service is decided...
}

module.exports = {
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
