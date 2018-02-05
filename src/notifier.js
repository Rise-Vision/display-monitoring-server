/* eslint-disable default-case, no-unused-vars */
const got = require("got");
const querystring = require("querystring");

const config = require("./config");
const stateManager = require("./state-manager");

const RESPONSE_OK = 200;

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterSilentStates(list);

  list.forEach(({displayId, online, addresses}) => {
    const action = stateManager.updateDisplayStatus(displayId, online);

    switch (action) {
      case "SEND_FAILURE_EMAIL":
        return module.exports.sendFailureEmail(displayId, addresses);

      case "SEND_RECOVERY_EMAIL":
        return module.exports.sendRecoveryEmail(displayId, addresses);
    }
  });
}

function sendFailureEmail(displayId, addresses) {
  // implement when external email service is decided...
}

function sendRecoveryEmail(displayId, addresses) {
  // implement when external email service is decided...
}

function sendEmail(subject, text, recipients) {
  const data = querystring.stringify({
    from: config.SENDER_ADDRESS,
    fromName: config.SENDER_NAME,
    recipients,
    subject,
    text
  });

  const url = `${config.EMAIL_URL}?${data}`
  const options = {
    headers: {"Content-Type": "application/x-www-form-urlencoded"}
  };

  return got.post(url, options)
  .then(response =>
  {
    if (response.statusCode !== RESPONSE_OK) {
      return logErrorDataFor(response, url);
    }

    console.log(`Mail '${subject}' sent to ${recipients.join()}`);

    return JSON.parse(response.body);
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
  sendEmail,
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
