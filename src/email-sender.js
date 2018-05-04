const {JWT} = require("google-auth-library");
const querystring = require("querystring");

const EMAIL_API_URL = "https://rvaserver2.appspot.com/_ah/api/rise/v0/email";
const RESPONSE_OK = 200;

let client = null;

function getApiClient() {
  if (client) {return client;}

  if (!process.env.EMAIL_API_CREDENTIALS) {
    throw new Error("Service account key json file env variable is not configure. Cannnot create email API client");
  }

  const keys = require(process.env.EMAIL_API_CREDENTIALS);
  client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/userinfo.email']
  });
  return client;
}

function send(parameters, content, apiClient = getApiClient()) {
  const parameterString = querystring.stringify(parameters);
  const url = `${EMAIL_API_URL}?${parameterString}`;

  const options = {
    url,
    method: "POST",
    data: {text: content}
  };

  return apiClient.request(options)
    .then(response => {
      if (response.status !== RESPONSE_OK) {
        return logErrorDataFor(response, url);
      }

      return response.body;
    })
    .catch((error) => {
      console.error(`Error occured when sending email ${url}`, error);
    });
}

function logErrorDataFor(response, url) {
  console.error(`Email API request returned with error code: ${
    response.statusCode
    }, message: ${
    response.statusMessage
    }, URL: ${
    url
    }`);

  return null;
}

module.exports = {
  send
};
