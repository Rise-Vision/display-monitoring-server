const simple = require("simple-mock");
const assert = require("assert");
const monitoring = require("../../index");

const notifier = require("../../src/notifier");
const queryRunner = require("../../src/query-runner");
const stateRetriever = require("../../src/connection-state-retriever");

describe("Main - Unit", () => {

  it("should generate status list", () => {
    const displays = [
      {
        displayId: 'ABC', addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', addresses: ['g@example.com']
      }
    ];

    const statusList = monitoring.generateStatusList(displays, ["1", null, "1"]);

    assert.deepEqual(statusList, [
      {
        displayId: 'ABC', online: true, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: true, addresses: ['g@example.com']
      }
    ]);
  });

  it("should generate status list when all are offline", () => {
    const displays = [
      {
        displayId: 'ABC', addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', addresses: ['g@example.com']
      }
    ];

    const statusList = monitoring.generateStatusList(displays, [null, null, null]);

    assert.deepEqual(statusList, [
      {
        displayId: 'ABC', online: false, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: false, addresses: ['g@example.com']
      }
    ]);
  });

  it("should bypass updating state and notifying during mass outage", () => {
    const states = [null, null, null, "abab"];
    simple.mock(queryRunner, "readMonitoredDisplays").resolveWith([{}]);
    simple.mock(stateRetriever, "retrieveState").resolveWith(states);
    simple.mock(notifier, "updateDisplayStatusListAndNotify").returnWith();

    return monitoring.monitorDisplays()
    .then(()=>assert.equal(notifier.updateDisplayStatusListAndNotify.callCount, 0));
  });

  it("should not bypass updating state and notifying during regular outage", () => {
    const states = [null, "abab", "abab", "abab", "abab", "abab"];
    simple.mock(queryRunner, "readMonitoredDisplays").resolveWith([{}]);
    simple.mock(stateRetriever, "retrieveState").resolveWith(states);
    simple.mock(notifier, "updateDisplayStatusListAndNotify").returnWith();

    return monitoring.monitorDisplays()
    .then(()=>assert.equal(notifier.updateDisplayStatusListAndNotify.callCount, 1));
  });
});
