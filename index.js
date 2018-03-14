const logger = require("./src/logger");
const notifier = require("./src/notifier");
const runner = require("./src/query-runner");
const stateRetriever = require("./src/connection-state-retriever");

const MINUTES = 60000;
const monitoringInterval = 5 * MINUTES; // eslint-disable-line no-magic-numbers

process.on("SIGUSR2", logger.debugToggle);
Error.stackTraceLimit = 50;

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
      return console.warn("No monitored displays found");
    }

    logger.log(`Checking ${displays.length} displays`);
    const displayIds = displays.map(display => display.displayId);

    return stateRetriever.retrieveState(displayIds)
    .then(states => {
      logger.log(`States retrieved: ${JSON.stringify(states)}`);
      const statusList = generateStatusList(displays, states);
      logger.log(`Status list generated: ${JSON.stringify(statusList)}`);

      return notifier.updateDisplayStatusListAndNotify(statusList);
    });
  })
  .catch(console.error);
}

function run(schedule = setInterval) {
  if (timerId) {
    clearInterval(timerId);
  }

  timerId = schedule(monitorDisplays, monitoringInterval);
}

module.exports = {generateStatusList, monitorDisplays, run};

if (process.env.NODE_ENV !== "test") {
  console.log(`Monitoring at ${monitoringInterval / MINUTES} minute intervals`);
  stateRetriever.init();
  run();
}
