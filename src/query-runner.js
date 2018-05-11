const BigQuery = require("@google-cloud/bigquery");

const fs = require("fs");

let client = null;
const path = require.resolve('./queries/displaysToBeMonitored.bq');
const query = fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
const QUERY_TIMEOUT = 120000;

function getQuery() {
  return query;
}

function getClient(testClient) {
  if (testClient) {
    return testClient;
  }

  if (!client) {
    client = new BigQuery({projectId: 'rise-core-log'});
  }

  return client;
}

function invokeQuery(testClient) {
  const invoker = getClient(testClient);
  const options = {query, useLegacySql: false, useQueryCache: false};

  return invoker.query(options, {timeoutMs: QUERY_TIMEOUT});
}

function asDisplayList(data) {
  const rows = data[0];

  return rows.map(({displayId, displayName, monitoringEmails, timeZoneOffset}) => {
    const addresses = monitoringEmails.split(/,\s*/);

    return {displayId, displayName, addresses, timeZoneOffset};
  });
}

function readMonitoredDisplays(testClient) {
  return module.exports.invokeQuery(testClient)
  .then(asDisplayList);
}

module.exports = {
  asDisplayList,
  getQuery,
  invokeQuery,
  readMonitoredDisplays
};
