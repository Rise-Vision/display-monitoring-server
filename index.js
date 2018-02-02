/* eslint-disable no-magic-numbers, no-unused-expressions */

const notifier = require("./src/notifier");
const runner = require("./src/query-runner");
const stateRetriever = require("./src/connection-state-retriever");

const MINUTES = 60000;
const monitoringInterval = 5 * MINUTES;

let timerId = null;

require("assert")(notifier);
require("assert")(runner);
require("assert")(stateRetriever);

function generateStatusList(displays, onlineDisplayIds) {
  return displays.map(display => {
    const online = onlineDisplayIds.includes(display.displayId);

    return Object.assign({online}, display);
  });
}

function monitorDisplays() {
  return runner.readMonitoredDisplays()
  .then(displays => {
    const displayIds = displays.map(display => display.displayId);

    return stateRetriever.retrieveState(displayIds)
    .then(onlineDisplayIds => {
      const statusList = generateStatusList(displays, onlineDisplayIds);

      return notifier.updateDisplayStatusListAndNotify(statusList);
    });
  })
  .catch(console.error);
}

function run(schedule = setInterval) {
  timerId && clearInterval(timerId);

  timerId = schedule(monitorDisplays, monitoringInterval);
}

module.exports = {generateStatusList, monitorDisplays, run};
