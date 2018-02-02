/* eslint-env mocha */
/* eslint-disable array-bracket-newline, function-paren-newline, max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const monitoring = require("../../index");
const notifier = require("../../src/notifier");
const runner = require("../../src/query-runner");
const stateManager = require("../../src/state-manager");
const stateRetriever = require("../../src/connection-state-retriever");

describe("Main - Integration", () => {

  beforeEach(() => {
    simple.mock(notifier, "sendFailureEmail").returnWith();
    simple.mock(notifier, "sendRecoveryEmail").returnWith();
  });

  afterEach(() => {
    simple.restore();
    stateManager.reset();
  });

  it("should iterate and notify accordingly", done => {
    simple.mock(runner, "readMonitoredDisplays").resolveWith([
      {
        displayId: 'ABC', addresses: ['a@example.com']
      },
      {
        displayId: 'DEF', addresses: ['d@example.com']
      },
      {
        displayId: 'GHI', addresses: ['g@example.com']
      }
    ]);

    const states = [
      [1, 0, 0],
      [0, 0, 1],
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
      [1, 0, 1]
    ];

    simple.mock(stateRetriever, "retrieveState").callFn(() =>
      Promise.resolve(states.shift())
    );

    monitoring.run((action, interval) => {
      assert.equal(interval, 300000);

      action().then(() => {
        assert(!notifier.sendFailureEmail.called);
        assert(!notifier.sendRecoveryEmail.called);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'FAILED', count: 1},
          'GHI': {state: 'FAILED', count: 1}
        });

        return action();
      })
      .then(() => {
        assert(!notifier.sendFailureEmail.called);
        assert(!notifier.sendRecoveryEmail.called);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 1},
          'DEF': {state: 'FAILED', count: 2},
          'GHI': {state: 'OK', count: 1}
        });

        return action();
      })
      .then(() => {
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

        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);

        // still not changed
        assert.equal(notifier.sendFailureEmail.callCount, 1);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'FAILED', count: 2}
        });

        return action();
      })
      .then(() => {
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

        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendFailureEmail.callCount, 2);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 1},
          'DEF': {state: 'RECOVERING', count: 2},
          'GHI': {state: 'RECOVERING', count: 1}
        });

        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendFailureEmail.callCount, 2);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 2},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'RECOVERING', count: 2}
        });

        return action();
      })
      .then(() => {
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

        done();
      })
    });
  });

  it("should do nothing if there are not monitored displays", done => {
    simple.mock(runner, "readMonitoredDisplays").resolveWith([]);
    simple.mock(stateRetriever, "retrieveState").resolveWith();
    simple.mock(console, "warn").returnWith();

    monitoring.run((action, interval) => {
      assert.equal(interval, 300000);

      action().then(() => {
        assert(!stateRetriever.retrieveState.called);

        assert(console.warn.callCount, 1);
        assert.equal(console.warn.lastCall.args[0], "No monitored displays found");

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {});

        done();
      })
    });
  });

});
