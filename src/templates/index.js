const dateFormat = require("dateformat");
const fs = require("fs");

function loadTemplate(name) {
  const path = require.resolve(`./${name}.html`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

function replaceDisplayData(text, display, displayDate) {
  const formattedTimestamp =
    dateFormat(displayDate, "mmm dd yyyy, 'at' HH:MMTT");

  return text.replace(/DISPLAYID/g, display.displayId)
  .replace(/DISPLAYNAME/g, display.displayName)
  .replace(/FORMATTEDTIMESTAMP/g, formattedTimestamp);
}

function Template(source) {
  this.body = loadTemplate(source);

  this.textForDisplay = function(display, displayDate) {
    return replaceDisplayData(this.body, display, displayDate);
  }
}

module.exports = {
  failure: new Template("monitor-offline-email"),
  recovery: new Template("monitor-online-email"),
  replaceDisplayData
};
