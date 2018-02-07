const fs = require("fs");
const got = require("got");
const querystring = require("querystring");

const stateManager = require("./state-manager");

const EMAIL_API_URL = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
const SENDER_ADDRESS = "support@risevision.com";
const SENDER_NAME = "Rise Vision Support";
const RESPONSE_OK = 200;

const templates = {
  "failure": {
    "subject": "Display DISPLAYID is offline",
    "body": loadTemplate("failure")
  },
  "recovery": {
    "subject": "Display DISPLAYID is now online",
    "body": loadTemplate("recovery")
  }
};

function loadTemplate(name) {
  const path = require.resolve(`./templates/${name}.txt`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterUnmonitoredDisplays(list);

  return list.reduce((promise, display) => {
    const {displayId, online, addresses} = display;

    return promise.then(() => {
      const action = stateManager.updateDisplayStatus(displayId, online);

      switch (action) {
        case "SEND_FAILURE_EMAIL":
          console.log(`Sending failure email to ${addresses} for ${displayId}`);
          // module.exports.sendFailureEmail(displayId, addresses);
          return;

        case "SEND_RECOVERY_EMAIL":
          console.log(`Sending recovery email to ${addresses} for ${displayId}`);
          // module.exports.sendRecoveryEmail(displayId, addresses);
          return; // eslint-disable-line no-useless-return

        default:
      }
    })
    .catch(error => console.error(`Error while notifying: ${display}`, error))
  }, Promise.resolve());
}

function sendFailureEmail(displayId, addresses) {
  return prepareAndSendEmail(templates.failure, displayId, addresses);
}

function sendRecoveryEmail(displayId, addresses) {
  return prepareAndSendEmail(templates.recovery, displayId, addresses);
}

function prepareAndSendEmail(template, displayId, recipients) {
  const subject = template.subject.replace('DISPLAYID', displayId);
  const text = template.body.replace(/DISPLAYID/g, displayId);

  const data = {
    from: SENDER_ADDRESS,
    fromName: SENDER_NAME,
    recipients,
    subject,
    text
  };

  return send(data);
}

function send(data) {
  const parameterString = querystring.stringify(data);
  const url = `${EMAIL_API_URL}?${parameterString}`;

  return got.post(url)
  .then(response =>
  {
    if (response.statusCode !== RESPONSE_OK) {
      return logErrorDataFor(response, url);
    }

    console.log(`Mail '${data.subject}' sent to ${data.recipients.join()}`);

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
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
