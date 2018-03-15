const dateFormat = require("dateformat");
const logger = require("./logger");
const got = require("got");
const querystring = require("querystring");

const stateManager = require("./state-manager");
const templates = require("./templates");

const EMAIL_API_URL = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
const SENDER_ADDRESS = "support@risevision.com";
const SENDER_NAME = "Rise Vision Support";
const RESPONSE_OK = 200;
const SUBJECT_LINE = "Display monitoring for display DISPLAYID";
const ONE_MINUTE = 60000;

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterUnmonitoredDisplays(list);
  logger.log(`Current display states: ${JSON.stringify(stateManager.getCurrentDisplayStates())}`)

  return list.reduce((promise, display) => {
    const {displayId, online, addresses} = display;

    return promise.then(() => {
      const action = stateManager.updateDisplayStatus(displayId, online);

      switch (action) {
        case "SEND_FAILURE_EMAIL":
          logger.log(`Sending failure email to ${addresses} for ${displayId}`);
          return module.exports.sendFailureEmail(display, addresses);

        case "SEND_RECOVERY_EMAIL":
          logger.log(`Sending recovery email to ${addresses} for ${displayId}`);
          return module.exports.sendRecoveryEmail(display, addresses);

        default:
      }
    })
    .catch(error => console.error(`Error while notifying: ${display}`, error))
  }, Promise.resolve());
}

function sendFailureEmail(display, addresses) {
  return prepareAndSendEmail(templates.failure, display, addresses);
}

function sendRecoveryEmail(display, addresses) {
  return prepareAndSendEmail(templates.recovery, display, addresses);
}

function getServerDate() {
  return new Date();
}

function displayDateFor(display) {
  const serverDate = module.exports.getServerDate();
  const offset = display.timeZoneOffset || 0;

  const serverOffset = serverDate.getTimezoneOffset() * ONE_MINUTE
  const utc = new Date(serverDate.getTime() + serverOffset);

  const displayOffset = offset * ONE_MINUTE;
  return new Date(utc.getTime() + displayOffset);
}

function replaceDisplayData(text, display, displayDate) {
  const formattedTimestamp =
    dateFormat(displayDate, "mmm dd yyyy, 'at' HH:MMTT");

  return text.replace(/DISPLAYID/g, display.displayId)
  .replace(/DISPLAYNAME/g, display.displayName)
  .replace(/FORMATTEDTIMESTAMP/g, formattedTimestamp);
}

function prepareAndSendEmail(template, display, recipients) {
  const displayDate = displayDateFor(display);
  const subject = replaceDisplayData(SUBJECT_LINE, display, displayDate);
  const text = replaceDisplayData(template, display, displayDate);

  const promises = recipients.map(recipient=>{
    const data = {
      from: SENDER_ADDRESS,
      fromName: SENDER_NAME,
      recipients: recipient,
      subject
    };

    const options = {
      json: true,
      body: {
        text: text.replace("EMAIL", recipient)
      }
    };

    return send(data, options);
  });

  return Promise.all(promises)
  .then(() => logger.log(`Mail '${subject}' sent to ${recipients.join(", ")}`))
}

function send(data, options) {
  const parameterString = querystring.stringify(data);
  const url = `${EMAIL_API_URL}?${parameterString}`;

  return got.post(url, options)
  .then(response => {
    if (response.statusCode !== RESPONSE_OK) {
      return logErrorDataFor(response, url);
    }

    return response.body;
  });
}

function logErrorDataFor(response, url) {
  console.warn(`Email API request returned with error code: ${
    response.statusCode
  }, message: ${
    response.statusMessage
  }, URL: ${
    url
  }`);

  return null;
}

module.exports = {
  displayDateFor,
  getServerDate,
  replaceDisplayData,
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
