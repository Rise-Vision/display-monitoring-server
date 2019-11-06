const dateFormat = require("dateformat");
const fs = require("fs");

function loadFromFile(name) {
  const path = require.resolve(`./${name}.html`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

function replaceDisplayData(text, display, displayDate) {
  const formattedDate = dateFormat(displayDate, "mmm dd yyyy");
  const formattedTime = dateFormat(displayDate, "HH:MMTT");
  const formattedTimestamp = `${formattedDate}, at ${formattedTime}`;

  return text.replace(/DISPLAYID/g, display.displayId)
  .replace(/DISPLAYNAME/g, display.displayName)
  .replace(/FORMATTEDTIMESTAMP/g, formattedTimestamp)
  .replace(/FORMATTEDTIME/g, formattedTime);
}

function Template(options) {
  this.body = loadFromFile(options.body);

  this.subjectForDisplay = function(display, displayDate) {
    return replaceDisplayData(options.subject, display, displayDate);
  }

  this.textForDisplay = function(display, displayDate) {
    return replaceDisplayData(this.body, display, displayDate);
  }
}

module.exports = {
  failure: new Template({
    body: "monitor-offline-email",
    subject: "Display Monitoring: DISPLAYNAME disconnected and is now offline"
  }),
  recovery: new Template({
    body: "monitor-online-email",
    subject: "Display Monitoring: DISPLAYNAME reconnected and is now online"
  }),
  replaceDisplayData
};
