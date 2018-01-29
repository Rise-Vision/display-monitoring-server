/* eslint-env mocha */
const assert = require("assert");

const stateManager = require("../../src/state-manager.js");

describe("State Manager - Unit", ()=>{

  afterEach(() => stateManager.reset());

  it("should filter states not present in current list", () => {
    stateManager.updateDisplayStatus("A123", true);
    stateManager.updateDisplayStatus("B123", true);
    stateManager.updateDisplayStatus("C123", true);

    stateManager.filterSilentStates([
      {displayId: "A123", online: true, addresses: ['a@example.com']},
      {displayId: "D123", online: true, addresses: ['d@example.com']},
      {displayId: "E123", online: true, addresses: ['e@example.com']}
    ]);

    const states = stateManager.getCurrentDisplayStates();

    assert(states.A123);
    assert(!states.B123);
    assert(!states.C123);
  });

});
