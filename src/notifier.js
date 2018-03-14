const fs = require("fs");
const got = require("got");
const querystring = require("querystring");

const stateManager = require("./state-manager");

const EMAIL_API_URL = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
const SENDER_ADDRESS = "support@risevision.com";
const SENDER_NAME = "Rise Vision Support";
const RESPONSE_OK = 200;
const SUBJECT_LINE = "Display monitoring for display DISPLAYID";

const templates = {
  "failure": loadTemplate("monitor-offline-email"),
  "recovery": loadTemplate("monitor-online-email")
};

function loadTemplate(name) {
  const path = require.resolve(`./templates/${name}.html`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterUnmonitoredDisplays(list);
  console.log(`Current display states: ${JSON.stringify(stateManager.getCurrentDisplayStates())}`)

  return list.reduce((promise, display) => {
    const {displayId, online, addresses} = display;

    return promise.then(() => {
      const action = stateManager.updateDisplayStatus(displayId, online);

      switch (action) {
        case "SEND_FAILURE_EMAIL":
          console.log(`Sending failure email to ${addresses} for ${displayId}`);
          return module.exports.sendFailureEmail(displayId, addresses);

        case "SEND_RECOVERY_EMAIL":
          console.log(`Sending recovery email to ${addresses} for ${displayId}`);
          return module.exports.sendRecoveryEmail(displayId, addresses);

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
  const subject = SUBJECT_LINE.replace('DISPLAYID', displayId);
  const text = template.replace(/DISPLAYID/g, displayId);
  const promises = [];

  recipients.forEach(recipient=>{
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

    promises.push(send(data, options));
  });

  return Promise.all(promises)
  .then(() => console.log(`Mail '${subject}' sent to ${recipients.join(", ")}`))
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
  sendFailureEmail,
  sendRecoveryEmail,
  updateDisplayStatusListAndNotify
};
