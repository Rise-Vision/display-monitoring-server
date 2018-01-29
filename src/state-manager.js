/* eslint-disable no-magic-numbers */

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

function change(entry, state) {
  Object.assign(entry, {state, count: 0});

  return null;
}

function updateAsOnline(entry) {
  switch (entry.state) {
    case 'ALERTED': return change(entry, 'RECOVERING');
    case 'RECOVERING':
      if (entry.count >= 2) {
        change(entry, 'OK');
        return "SEND_RECOVERY_EMAIL";
      }

      entry.count += 1;
      return null;

    case 'FAILED': return change(entry, 'OK');
    default: return null;
  }
}

function updateAsOffline(entry) {
  switch (entry.state) {
    case 'OK': return change(entry, 'FAILED');
    case 'FAILED':
      if (entry.count >= 2) {
        change(entry, 'ALERTED');
        return "SEND_FAILURE_EMAIL";
      }

      entry.count += 1;
      return null;

    case 'RECOVERING': return change(entry, 'ALERTED');
    default: return null;
  }
}

function updateDisplayStatus(displayId, online) {
  const displayState = currentDisplayStates[displayId];

  if (!displayState) {
    currentDisplayStates[displayId] = {
      state: online ? 'OK' : 'FAILED',
      count: 0
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
