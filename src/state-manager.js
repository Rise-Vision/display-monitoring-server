// Display ids are used as keys, the value is a structure with state and count of times it has been in that status
const logger = require("./logger");
const DATA_PATH = process.env.DATA_PATH || __dirname;
const TRANSITION_THRESHOLD = 2;
const PERSIST_FILE_PATH = require("path").join(DATA_PATH, "saved-states.json");
const fs = require("fs");

let currentDisplayStates = {};

function filterUnmonitoredDisplays(list) {
  const filteredDisplayStates = {};

  list.forEach(entry => {
    const displayId = entry.displayId;

    filteredDisplayStates[displayId] = currentDisplayStates[displayId];
  });

  currentDisplayStates = filteredDisplayStates;
}

function change(entry, state) {
  Object.assign(entry, {state, count: 1});

  return null;
}

function updateAsOnline(entry) {
  switch (entry.state) {
    case 'ALERTED': return change(entry, 'RECOVERING');
    case 'FAILED': return change(entry, 'OK');
    case 'RECOVERING':
      if (entry.count >= TRANSITION_THRESHOLD) {
        change(entry, 'OK');
        return "SEND_RECOVERY_EMAIL";
      }

      entry.count += 1;
  }

  return null;
}

function updateAsOffline(entry) {
  switch (entry.state) {
    case 'OK': return change(entry, 'FAILED');
    case 'RECOVERING': return change(entry, 'ALERTED');
    case 'FAILED':
      if (entry.count >= TRANSITION_THRESHOLD) {
        change(entry, 'ALERTED');
        return "SEND_FAILURE_EMAIL";
      }

      entry.count += 1;
  }

  return null;
}

function updateDisplayStatus(displayId, online) {
  const displayState = currentDisplayStates[displayId];

  if (!displayState) {
    currentDisplayStates[displayId] = {
      state: online ? 'OK' : 'FAILED',
      count: 1
    };

    return null;
  }

  return online ? updateAsOnline(displayState) : updateAsOffline(displayState);
}

function getCurrentDisplayStates() {
  return currentDisplayStates;
}

function setCurrentDisplayStates(states = {}) {
  currentDisplayStates = Object.assign({}, states);
}

function persistCurrentDisplayStates() {
  fs.writeFileSync(PERSIST_FILE_PATH, JSON.stringify(currentDisplayStates));
}

function init() {
  try {
    module.exports.setCurrentDisplayStates(require(PERSIST_FILE_PATH));
    logger.log(`Loaded ${Object.keys(currentDisplayStates).length} display states.`);
  } catch (err) {
    logger.log(`No saved states loaded from: ${PERSIST_FILE_PATH}`);
    logger.log(err);
  }

}

module.exports = {
  init,
  filterUnmonitoredDisplays,
  updateDisplayStatus,
  getCurrentDisplayStates,
  setCurrentDisplayStates,
  persistCurrentDisplayStates
};
