const assert = require("assert");

const stateManager = require("../../src/state-manager.js");

describe("State Manager - Unit", () => {

  afterEach(() => stateManager.reset());

  it("should filter states not present in current list", () => {
    stateManager.updateDisplayStatus("A123", true);
    stateManager.updateDisplayStatus("B123", true);
    stateManager.updateDisplayStatus("C123", true);

    stateManager.filterUnmonitoredDisplays([
      {displayId: "A123", online: true, addresses: ['a@example.com']},
      {displayId: "D123", online: true, addresses: ['d@example.com']},
      {displayId: "E123", online: true, addresses: ['e@example.com']}
    ]);

    const states = stateManager.getCurrentDisplayStates();

    assert(states.A123);
    assert(!states.B123);
    assert(!states.C123);
  });

  it("should switch between OK and FAILED", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }
  });

  it("should remain in OK if display is online", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}})
    }
  });

  it("should remain in FAILED for one offline period", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }
  });

  it("should go to ALERTED after two offline periods", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert.equal(answer, "SEND_FAILURE_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }
  });

  it("should switch between RECOVERING and ALERTED", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert.equal(answer, "SEND_FAILURE_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }
  });

  it("should stay in ALERTED while display is offline", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert.equal(answer, "SEND_FAILURE_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }
  });

  it("should remain in RECOVERING for one online period", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert.equal(answer, "SEND_FAILURE_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }
  });

  it("should go back to OK after two online periods", () => {

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'FAILED', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", false);
      assert.equal(answer, "SEND_FAILURE_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'ALERTED', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 1}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert(!answer);

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'RECOVERING', count: 2}});
    }

    {
      const answer = stateManager.updateDisplayStatus("A123", true);
      assert.equal(answer, "SEND_RECOVERY_EMAIL");

      const states = stateManager.getCurrentDisplayStates();
      assert.deepEqual(states, {A123: {state: 'OK', count: 1}});
    }
  });

});
