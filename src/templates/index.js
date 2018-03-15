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

function Template(body) {
  this.textForDisplay = function(display, displayDate) {
    return replaceDisplayData(body, display, displayDate);
  }
}

module.exports = {
  failure: new Template(loadTemplate("monitor-offline-email")),
  recovery: new Template(loadTemplate("monitor-online-email"))
};
