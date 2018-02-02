/* eslint-disable no-unused-expressions */

const got = require("got");

const config = require("./config");

const ONE_HOUR = 3580000;

let refreshDate = 0;
let token = null;

function refreshToken() {
  const now = new Date();

  if (now - refreshDate < ONE_HOUR) {
    return Promise.resolve();
  }

  const options = {method: "POST", json: true};

  return got(config.REFRESH_URL, options)
  .then(response => {
    refreshDate = now;

    token = response.body.access_token;
  });
}

function invokeQuery() {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: config.QUERY_DATA,
    json: true
  };

  return got(config.QUERY_URL, options)
  .then(response => {
    const data = response.body

    data.jobComplete || console.warn(`Query did not complete in provided timeout: ${config.QUERY_TIMEOUT}`);

    return data;
  });
}

function asDisplayList(data) {
  return data.rows.map(row => {
    const displayId = row.f[0].v;
    const addresses = row.f[1].v.split(",");

    return {displayId, addresses};
  });
}

function readMonitoredDisplays() {
  return module.exports.refreshToken()
  .then(module.exports.invokeQuery)
  .then(asDisplayList);
}

module.exports = {
  asDisplayList,
  invokeQuery,
  readMonitoredDisplays,
  refreshToken
};
