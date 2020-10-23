/* eslint-env mocha */
/* eslint-disable array-bracket-newline, function-paren-newline, max-statements, no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const monitoring = require("../../index");
const notifier = require("../../src/notifier");
const runner = require("../../src/query-runner");
const stateManager = require("../../src/state-manager");
const stateRetriever = require("../../src/connection-state-retriever");
const massOutageBypass = require("../../src/mass-outage-bypass");

describe("Main - Integration", () => {

  beforeEach(() => {
    simple.mock(notifier, "sendFailureEmail").returnWith();
    simple.mock(notifier, "sendRecoveryEmail").returnWith();
  });

  afterEach(() => {
    simple.restore();
    stateManager.setCurrentDisplayStates({});
  });

  let JKLScheduled = false;
  it("should iterate and notify accordingly", done => {
    simple.mock(runner, "readMonitoredDisplays").callFn(() => Promise.resolve([
      {
        displayId: 'ABC',
        displayName: 'Main Hall',
        timeZoneOffset: -360,
        addresses: ['a@example.com'],
        shouldBePingedNow: true
      },
      {
        displayId: 'DEF',
        displayName: 'Corridor',
        timeZoneOffset: -360,
        addresses: ['d@example.com'],
        shouldBePingedNow: true
      },
      {
        displayId: 'GHI',
        displayName: 'Back door',
        timeZoneOffset: -360,
        addresses: ['g@example.com'],
        shouldBePingedNow: true
      },
      {
        displayId: 'JKL',
        displayName: 'Scheduled',
        timeZoneOffset: -360,
        addresses: ['g@example.com'],
        shouldBePingedNow: JKLScheduled
      }
    ]));

    const states = [
      ["1", null, null],
      [null, null, "1", null],
      [null, null, null],
      ["1", null, null, null],
      ["1", "1", null, "1"],
      [null, "1", "1"],
      [null, null, "1"],
      ["1", null, "1"]
    ];

    simple.mock(stateRetriever, "retrieveState").callFn(() =>
      Promise.resolve(states.shift())
    );

    simple.mock(stateManager, "persistCurrentDisplayStates").returnWith();

    simple.mock(massOutageBypass, "shouldBypass").returnWith(false);

    monitoring.run((action, interval) => {
      assert.equal(interval, 300000);

      action().then(() => {
        assert(!notifier.sendFailureEmail.called);
        assert(!notifier.sendRecoveryEmail.called);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'FAILED', count: 1},
          'GHI': {state: 'FAILED', count: 1},
          'JKL': undefined
        });

        JKLScheduled = true;
        return action();
      })
      .then(() => {
        assert(!notifier.sendFailureEmail.called);
        assert(!notifier.sendRecoveryEmail.called);
        assert(stateManager.persistCurrentDisplayStates.called);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 1},
          'DEF': {state: 'FAILED', count: 2},
          'GHI': {state: 'OK', count: 1},
          'JKL': {state: 'FAILED', count: 1}
        });

        JKLScheduled = false;
        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);

        assert.equal(notifier.sendFailureEmail.callCount, 1);
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayId, 'DEF');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayName, 'Corridor');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].timeZoneOffset, -360);
        assert.deepEqual(notifier.sendFailureEmail.lastCall.args[1], ['d@example.com']);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 2},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'FAILED', count: 1},
          'JKL': {state: 'FAILED', count: 1}
        });

        JKLScheduled = true;
        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);

        // still not changed
        assert.equal(notifier.sendFailureEmail.callCount, 1);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'FAILED', count: 2},
          'JKL': {state: 'FAILED', count: 2}
        });

        JKLScheduled = true;
        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);

        assert.equal(notifier.sendFailureEmail.callCount, 2);
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayId, 'GHI');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayName, 'Back door');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].timeZoneOffset, -360);
        assert.deepEqual(notifier.sendFailureEmail.lastCall.args[1], ['g@example.com']);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'RECOVERING', count: 1},
          'GHI': {state: 'ALERTED', count: 1},
          'JKL': {state: 'OK', count: 1}
        });

        JKLScheduled = false;
        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendFailureEmail.callCount, 2);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 1},
          'DEF': {state: 'RECOVERING', count: 2},
          'GHI': {state: 'RECOVERING', count: 1},
          'JKL': {state: 'OK', count: 1}
        });

        JKLScheduled = false;
        return action();
      })
      .then(() => {
        assert(!notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendFailureEmail.callCount, 2);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'FAILED', count: 2},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'RECOVERING', count: 2},
          'JKL': {state: 'OK', count: 1}
        });

        JKLScheduled = false;
        return action();
      })
      .then(() => {
        assert(notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendFailureEmail.callCount, 2);

        assert.equal(notifier.sendRecoveryEmail.callCount, 1);
        assert.equal(notifier.sendRecoveryEmail.lastCall.args[0].displayId, 'GHI');
        assert.equal(notifier.sendRecoveryEmail.lastCall.args[0].displayName, 'Back door');
        assert.equal(notifier.sendRecoveryEmail.lastCall.args[0].timeZoneOffset, -360);
        assert.deepEqual(notifier.sendRecoveryEmail.lastCall.args[1], ['g@example.com']);

        assert.deepEqual(stateManager.getCurrentDisplayStates(), {
          'ABC': {state: 'OK', count: 1},
          'DEF': {state: 'ALERTED', count: 1},
          'GHI': {state: 'OK', count: 1},
          'JKL': {state: 'OK', count: 1}
        });

        done();
      })
      .catch(err=>{
        console.error(`ERROR on ${err.operator}`);
        console.log("Actual:", err.actual, "Expected:", err.expected);
        console.log(err.stack)
      });
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
