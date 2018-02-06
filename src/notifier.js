const fs = require("fs");
const got = require("got");
const querystring = require("querystring");

const stateManager = require("./state-manager");

const EMAIL_API_URL = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
const SENDER_ADDRESS = "support@risevision.com";
const SENDER_NAME = "Rise Vision Support";

const templates = {
  'failure': {
    subject: "Display DISPLAYID is offline",
    body: loadTemplate("failure")
  },
  'recovery': {
    subject: "Display DISPLAYID is now online",
    body: loadTemplate("recovery")
  }
};

const RESPONSE_OK = 200;

function loadTemplate(name) {
  const path = require.resolve(`./templates/${name}.txt`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

function updateDisplayStatusListAndNotify(list) {
  stateManager.filterSilentStates(list);

  return list.reduce((promise, {displayId, online, addresses}) => {
    return promise.then(() => {
      const action = stateManager.updateDisplayStatus(displayId, online);

      switch (action) {
        case "SEND_FAILURE_EMAIL":
          return module.exports.sendFailureEmail(displayId, addresses);

        case "SEND_RECOVERY_EMAIL":
          return module.exports.sendRecoveryEmail(displayId, addresses);

        default:
      }
    })
  }, Promise.resolve());
}

function sendFailureEmail(displayId, addresses) {
  return prepareContentAndSendEmail(templates.failure, displayId, addresses);
}

function sendRecoveryEmail(displayId, addresses) {
  return prepareContentAndSendEmail(templates.recovery, displayId, addresses);
}

function prepareContentAndSendEmail(template, displayId, recipients) {
  const subject = template.subject.replace('DISPLAYID', displayId);
  const text = template.body.replace(/DISPLAYID/g, displayId);

  return sendEmail(subject, text, recipients)
  .catch(console.warn);
}

function sendEmail(subject, text, recipients) {
  const data = querystring.stringify({
    from: SENDER_ADDRESS,
    fromName: SENDER_NAME,
    recipients,
    subject,
    text
  });

  const url = `${EMAIL_API_URL}?${data}`;

  return got.post(url)
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
