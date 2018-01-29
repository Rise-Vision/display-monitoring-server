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

function updateDisplayStatus(displayId, online) {
  currentDisplayStates[displayId] = {online};
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
