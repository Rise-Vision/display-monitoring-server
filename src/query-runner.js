const BigQuery = require("@google-cloud/bigquery");

const fs = require("fs");

let client = null;
const path = require.resolve('./queries/displaysToBeMonitored.bq');
const query = fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync

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

  return invoker.query(options);
}

function asDisplayList(data) {
  const rows = data[0];

  return rows.map(({displayId, monitoringEmails}) => {
    const addresses = monitoringEmails.split(/,\s*/);

    return {displayId, addresses};
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
