const assert = require("assert");

const monitoring = require("../../index");

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

    const statusList = monitoring.generateStatusList(displays, [1, 0, 1]);

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

    const statusList = monitoring.generateStatusList(displays, [0, 0, 0]);

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

});
