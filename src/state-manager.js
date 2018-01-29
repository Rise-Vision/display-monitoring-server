/* eslint-disable no-magic-numbers, default-case */

// Display ids are used as keys, the value is a structure with state and count of times it has been in that status
let currentDisplayStates = {};

function filterSilentStates(list) {
  const filteredDisplayStates = {};

  list.forEach(entry => {
    const displayId = entry.displayId;

    filteredDisplayStates[displayId] = currentDisplayStates[displayId];
  });

  currentDisplayStates = filteredDisplayStates;
}

function updateAsOnline(entry) {
  switch (entry.state) {
    case 'ALERTED':
      Object.assign(entry, {state: 'RECOVERING', count: 1});
      return null;

    case 'RECOVERING':
      if (entry.count === 2) {
        entry.state = 'OK';
        return "SEND_RECOVERY_EMAIL";
      }

      entry.count = 2;
      return null;

    case 'FAILED':
      entry.state = 'OK';
  }

  return null;
}

function updateAsOffline(entry) {
  switch (entry.state) {
    case 'OK':
      Object.assign(entry, {state: 'FAILED', count: 1});
      return null;

    case 'FAILED':
      if (entry.count === 2) {
        entry.state = 'ALERTED';
        return "SEND_FAILURE_EMAIL";
      }

      entry.count = 2;
      return null;

    case 'RECOVERING':
      entry.state = 'ALERTED';
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

// For inspection during testing only.
function getCurrentDisplayStates() {
  return currentDisplayStates;
}

// For testing purposes only.
function reset() {
  currentDisplayStates = {};
}

module.exports = {
  filterSilentStates,
  updateDisplayStatus,
  getCurrentDisplayStates,
  reset
};
