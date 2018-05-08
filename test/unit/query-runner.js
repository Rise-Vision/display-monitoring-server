/* eslint-disable array-bracket-newline */
const assert = require("assert");

const runner = require("../../src/query-runner.js");

describe("QueryRunner - Unit", () => {
  it("exists", () => {
    assert(runner);
  });

  describe("Query Tests", () => {
    it("should read query SQL", () => {
      const query = runner.getQuery();

      assert.equal(typeof query, 'string');
      assert(query.startsWith("#standardSQL"));
    });
  });

  describe("Extraction Tests", () => {
    it("should extract display id and addresses from query result", () => {
      const data = [[
        {
          displayId: 'ABC',
          displayName: 'Main display',
          timeZoneOffset: -360,
          monitoringEmails: 'a@example.com, a2@example.com'
        },
        {
          displayId: 'DEF',
          displayName: 'Secondary display',
          timeZoneOffset: -360,
          monitoringEmails: 'd@example.com'
        }
      ]];

      const list = runner.asDisplayList(data);

      assert.deepEqual(list, [
        {
          displayId: "ABC",
          displayName: 'Main display',
          timeZoneOffset: -360,
          addresses: ["a@example.com", "a2@example.com"]
        },
        {
          displayId: "DEF",
          displayName: 'Secondary display',
          timeZoneOffset: -360,
          addresses: ["d@example.com"]
        }
      ]);
    });

    it("should not extract anything with an empty query result", () => {
      const data = [[]];

      const list = runner.asDisplayList(data);

      assert.deepEqual(list, []);
    });
  });

  describe("Invocation Tests", () => {
    it("should extract display list from a query", () => {
      const data = [[
        {
          displayId: 'ABC',
          displayName: 'Main display',
          timeZoneOffset: -360,
          monitoringEmails: 'a@example.com, a2@example.com'
        },
        {
          displayId: 'DEF',
          displayName: 'Secondary display',
          timeZoneOffset: -360,
          monitoringEmails: 'd@example.com'
        }
      ]];

      return runner.readMonitoredDisplays({query: () =>
        Promise.resolve(data)
      })
      .then(list => {
        assert.deepEqual(list, [
          {
            displayId: "ABC",
            displayName: 'Main display',
            timeZoneOffset: -360,
            addresses: ["a@example.com", "a2@example.com"]
          },
          {
            displayId: "DEF",
            displayName: 'Secondary display',
            timeZoneOffset: -360,
            addresses: ["d@example.com"]
          }
        ]);
      });
    });
  });

});
