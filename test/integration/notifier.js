/* eslint-env mocha */
/* eslint-disable array-bracket-newline, max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const notifier = require("../../src/notifier.js");
const stateManager = require("../../src/state-manager.js");

describe("Notifier - Integration", () => {

  beforeEach(() => {
    simple.mock(notifier, "sendFailureEmail").returnWith();
    simple.mock(notifier, "sendRecoveryEmail").returnWith();
  });

  afterEach(() => {
    simple.restore();
    stateManager.reset();
  });

  it("should notify or not depending on the current display state", () => {

    // first iteration, one display online, two offline
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: true, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: false, addresses: ['g@example.com']
      }
    ]);

    assert(!notifier.sendFailureEmail.called);
    assert(!notifier.sendRecoveryEmail.called);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'OK', count: 1},
      'DEF': {state: 'FAILED', count: 1},
      'GHI': {state: 'FAILED', count: 1}
    });

    // ABC goes offline, DEF continues offline, GHI not followed this time
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: false, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      }
    ]);

    assert(!notifier.sendFailureEmail.called);
    assert(!notifier.sendRecoveryEmail.called);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'FAILED', count: 1},
      'DEF': {state: 'FAILED', count: 2}
    });

    // ABC continues offline, DEF two periods offline now, GHI back and offline
    notifier.updateDisplayStatusListAndNotify([
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

    assert(notifier.sendFailureEmail.called);
    assert(!notifier.sendRecoveryEmail.called);

    assert.equal(notifier.sendFailureEmail.callCount, 1);
    assert.deepEqual(notifier.sendFailureEmail.lastCall.args, [
      'DEF', ['d@example.com']
    ]);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'FAILED', count: 2},
      'DEF': {state: 'ALERTED', count: 1},
      'GHI': {state: 'FAILED', count: 1}
    });

    // ABC goes online, DEF still offline, GHI still offline
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: true, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: false, addresses: ['g@example.com']
      }
    ]);

    assert(!notifier.sendRecoveryEmail.called);

    // still not changed
    assert.equal(notifier.sendFailureEmail.callCount, 1);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'OK', count: 1},
      'DEF': {state: 'ALERTED', count: 1},
      'GHI': {state: 'FAILED', count: 2}
    });

    // ABC still online, DEF goes online, GHI offline for two periods now
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: true, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: true, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: false, addresses: ['g@example.com']
      }
    ]);

    assert(!notifier.sendRecoveryEmail.called);

    assert.equal(notifier.sendFailureEmail.callCount, 2);
    assert.deepEqual(notifier.sendFailureEmail.lastCall.args, [
      'GHI', ['g@example.com']
    ]);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'OK', count: 1},
      'DEF': {state: 'RECOVERING', count: 1},
      'GHI': {state: 'ALERTED', count: 1}
    });

    // ABC goes offline, DEF still online, GHI goes online again
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: false, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: true, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: true, addresses: ['g@example.com']
      }
    ]);

    assert(!notifier.sendRecoveryEmail.called);
    assert.equal(notifier.sendFailureEmail.callCount, 2);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'FAILED', count: 1},
      'DEF': {state: 'RECOVERING', count: 2},
      'GHI': {state: 'RECOVERING', count: 1}
    });

    // ABC still offline, DEF goes back offline, GHI still online
    notifier.updateDisplayStatusListAndNotify([
      {
        displayId: 'ABC', online: false, addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', online: false, addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', online: true, addresses: ['g@example.com']
      }
    ]);

    assert(!notifier.sendRecoveryEmail.called);
    assert.equal(notifier.sendFailureEmail.callCount, 2);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'FAILED', count: 2},
      'DEF': {state: 'ALERTED', count: 1},
      'GHI': {state: 'RECOVERING', count: 2}
    });

    // ABC back online, DEF still offline, GHI two periods now in online recovering
    notifier.updateDisplayStatusListAndNotify([
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

    assert(notifier.sendRecoveryEmail.called);
    assert.equal(notifier.sendFailureEmail.callCount, 2);

    assert.equal(notifier.sendRecoveryEmail.callCount, 1);
    assert.deepEqual(notifier.sendRecoveryEmail.lastCall.args, [
      'GHI', ['g@example.com']
    ]);

    assert.deepEqual(stateManager.getCurrentDisplayStates(), {
      'ABC': {state: 'OK', count: 1},
      'DEF': {state: 'ALERTED', count: 1},
      'GHI': {state: 'OK', count: 1}
    });
  });

});