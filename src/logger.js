let debugMode = true;

module.exports = {
  debugToggle() {
    debugMode = !debugMode;
    console.log(`Debug mode is ${debugMode ? "on" : "off"}`);
  },
  log(str, data) {
    if (!debugMode) {return;}
    console.log(data ? `${str}${JSON.stringify(data, 2, null)}` : str); // eslint-disable-line
  }
};
