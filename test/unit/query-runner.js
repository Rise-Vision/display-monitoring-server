/* eslint-env mocha */
const assert = require("assert");

const config = require("../../src/config.js");
const runner = require("../../src/query-runner.js");

const SAMPLE_ANSWER_DATA = {
 "kind": "bigquery#queryResponse",
 "schema": {
  "fields": [
    {"name": "displayId", "type": "STRING", "mode": "NULLABLE"},
    {"name": "addresses", "type": "STRING", "mode": "NULLABLE"}
  ]
 },
 "jobReference": {
  "projectId": "client-side-events",
  "jobId": "job_P4KAg26lemcBCSsKD11ayHdMesPW"
 },
 "totalRows": "2",
 "rows": [
   {
     "f": [
       {"v": "ABC"},
       {"v": "a@example.com,a2@example.com"}
     ]
   },
   {
     "f": [
       {"v": "DEF"},
       {"v": "d@example.com"}
     ]
   }
 ],
 "totalBytesProcessed": "0",
 "jobComplete": true,
 "cacheHit": true
};

describe("QueryRunner - Unit", () => {
  it("exists", () => {
    assert(runner);
  });

  describe("Extraction Tests", () => {
    it("should extract display id and addresses from query result", () => {
      const list = runner.asDisplayList(SAMPLE_ANSWER_DATA);

      assert.deepEqual(list, [
        {displayId: "ABC", addresses: ["a@example.com", "a2@example.com"]},
        {displayId: "DEF", addresses: ["d@example.com"]}
      ]);
    });
  });

  describe("Invocation Tests", () => {
    it("should extract display list from a query", () => {
      return runner.readMonitoredDisplays(url => {
        const body = url === config.REFRESH_URL ?
          {"access_token": 'dummy'} : SAMPLE_ANSWER_DATA;

        return Promise.resolve({body});
      })
      .then(list => {
        assert.deepEqual(list, [
          {displayId: "ABC", addresses: ["a@example.com", "a2@example.com"]},
          {displayId: "DEF", addresses: ["d@example.com"]}
        ]);
      });
    });
  });

});
