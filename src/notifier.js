const logger = require("./logger");
const stateManager = require("./state-manager");
const templates = require("./templates");
const emailSender = require("./email-sender");

const SENDER_ADDRESS = "monitor@risevision.com";
const SENDER_NAME = "Rise Vision Support";
const ONE_MINUTE = 60000;

function updateDisplayStatusListAndNotify(list) {
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
    .catch(error => console.error(`Error while notifying: ${JSON.stringify(display)}`, error))
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

function prepareAndSendEmail(template, display, recipients) {
  const displayDate = displayDateFor(display);
  const subject = template.subjectForDisplay(display, displayDate);
  const text = template.textForDisplay(display, displayDate);

  const promises = recipients.map(recipient=>{
    const parameters = {
      from: SENDER_ADDRESS,
      fromName: SENDER_NAME,
      recipients: recipient,
      subject
    };

    const content = text.replace("EMAIL", recipient);

    return emailSender.send(parameters, content);
  });

  return Promise.all(promises)
  .then(() => logger.log(`Mail '${subject}' sent to ${recipients.join(", ")}`))
}

module.exports = {
  displayDateFor,
  getServerDate,
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
