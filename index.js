/* eslint-disable no-magic-numbers, no-unused-expressions */

const notifier = require("./src/notifier");
const runner = require("./src/query-runner");
const stateRetriever = require("./src/connection-state-retriever");

const MINUTES = 60000;
const monitoringInterval = 5 * MINUTES;

let timerId = null;

function generateStatusList(displays, states) {
  return displays.map((display, index) => {
    const online = states[index] === 1;

    return Object.assign({online}, display);
  });
}

function monitorDisplays() {
  return runner.readMonitoredDisplays()
  .then(displays => {
    if (displays.length === 0) {
      console.warn("No monitored displays found");

      return;
    }

    const displayIds = displays.map(display => display.displayId);

    return stateRetriever.retrieveState(displayIds)
    .then(states => {
      const statusList = generateStatusList(displays, states);

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
