/* eslint-env mocha */
/* eslint-disable array-bracket-newline, max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const notifier = require("../../src/notifier.js");
const stateManager = require("../../src/state-manager.js");

describe("Notifier - Unit", () => {

  beforeEach(() => {
    simple.mock(stateManager, "filterSilentStates").returnWith();
    simple.mock(notifier, "sendFailureEmail").returnWith();
    simple.mock(notifier, "sendRecoveryEmail").returnWith();
  });

  afterEach(() => simple.restore());

  it("exists", ()=>{
    assert(notifier);
  });

  it("should call email functions depending on state manager individual results", () => {
    simple.mock(stateManager, "updateDisplayStatus").callFn(displayId => {
      switch (displayId) {
        case 'ABC': return null;
        case 'DEF': return "SEND_FAILURE_EMAIL";
        case 'GHI': return "SEND_RECOVERY_EMAIL";
        default: assert.fail(displayId);
      }
    })

    notifier.updateDisplayStatusList([
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

    assert(stateManager.updateDisplayStatus.called);
    assert.equal(stateManager.updateDisplayStatus.callCount, 3);
    const calls = stateManager.updateDisplayStatus.calls;

    assert.deepEqual(calls[0].args, ['ABC', true]);
    assert.deepEqual(calls[1].args, ['DEF', false]);
    assert.deepEqual(calls[2].args, ['GHI', true]);

    assert(!calls[0].returned);
    assert.equal(calls[1].returned, "SEND_FAILURE_EMAIL");
    assert.equal(calls[2].returned, "SEND_RECOVERY_EMAIL");

    assert(notifier.sendFailureEmail.called);
    assert.equal(notifier.sendFailureEmail.callCount, 1);
    assert.deepEqual(notifier.sendFailureEmail.lastCall.args, [
      'DEF', ['d@example.com']
    ]);

    assert(notifier.sendRecoveryEmail.called);
    assert.equal(notifier.sendRecoveryEmail.callCount, 1);
    assert.deepEqual(notifier.sendRecoveryEmail.lastCall.args, [
      'GHI', ['g@example.com']
    ]);
  });

});
