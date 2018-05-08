const assert = require("assert");
const simple = require("simple-mock");

const notifier = require("../../src/notifier");
const stateManager = require("../../src/state-manager");
const emailSender = require("../../src/email-sender");

describe("Notifier - Unit", () => {

  afterEach(() => simple.restore());

  describe("Dates", () => {
    it("should get the display date with server date GMT-0400 and display date GMT-0600", () => {
      const serverDate = new Date(Date.parse('14 Mar 2018 10:00:00 GMT-0400'));
      simple.mock(notifier, "getServerDate").returnWith(serverDate);

      const display = {timeZoneOffset: -360};
      const displayDate = notifier.displayDateFor(display);

      assert.equal(displayDate.getDate(), 14);
      assert.equal(displayDate.getHours(), 8);
      assert.equal(displayDate.getMinutes(), 0);
    });

    it("should get the display date with server date GMT and display date GMT-0600", () => {
      const serverDate = new Date(Date.parse('14 Mar 2018 10:00:00 GMT'));
      simple.mock(notifier, "getServerDate").returnWith(serverDate);

      const display = {timeZoneOffset: -360};
      const displayDate = notifier.displayDateFor(display);

      assert.equal(displayDate.getDate(), 14);
      assert.equal(displayDate.getHours(), 4);
      assert.equal(displayDate.getMinutes(), 0);
    });
  });

  describe("Email functions", () => {
    beforeEach(() => {
      const serverDate = new Date(Date.parse('14 Mar 2018 10:00:00 GMT'));
      simple.mock(notifier, "getServerDate").returnWith(serverDate);

      simple.mock(stateManager, "filterUnmonitoredDisplays").returnWith();
    });

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

      simple.mock(notifier, "sendFailureEmail").returnWith();
      simple.mock(notifier, "sendRecoveryEmail").returnWith();

      return notifier.updateDisplayStatusListAndNotify([
        {
          displayId: 'ABC',
          displayName: 'Main Hall',
          online: true,
          timeZoneOffset: -360,
          addresses: ['a@example.com']
        },
        {
          displayId: 'DEF',
          displayName: 'Corridor',
          online: false,
          timeZoneOffset: 0,
          addresses: ['d@example.com']
        },
        {
          displayId: 'GHI',
          displayName: 'Back door',
          online: true,
          addresses: ['g@example.com']
        }
      ])
      .then(() => {
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
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayId, 'DEF');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].displayName, 'Corridor');
        assert.equal(notifier.sendFailureEmail.lastCall.args[0].timeZoneOffset, 0);
        assert.deepEqual(notifier.sendFailureEmail.lastCall.args[1], ['d@example.com']);

        assert(notifier.sendRecoveryEmail.called);
        assert.equal(notifier.sendRecoveryEmail.callCount, 1);
        assert.equal(notifier.sendRecoveryEmail.lastCall.args[0].displayId, 'GHI');
        assert.equal(notifier.sendRecoveryEmail.lastCall.args[0].displayName, 'Back door');
        assert(!notifier.sendRecoveryEmail.lastCall.args[0].timeZoneOffset);
        assert.deepEqual(notifier.sendRecoveryEmail.lastCall.args[1], ['g@example.com']);
      });
    });

    it("should invoke external API to send failure email", () => {
      simple.mock(emailSender, "send").resolveWith();

      const display = {
        displayId: 'ABC', displayName: 'Main Hall', timeZoneOffset: -360
      };

      return notifier.sendFailureEmail(display, ['a@example.com', 'b@example.com'])
      .then(() => {
        assert.ok(emailSender.send.called);
        assert.equal(emailSender.send.callCount, 2);

        const [parameters, content] = emailSender.send.lastCall.args;

        assert.equal(parameters.from, "monitor@risevision.com");
        assert.equal(parameters.fromName, "Rise Vision Support");
        assert.equal(parameters.recipients, 'b@example.com');
        assert.equal(parameters.subject, "Main Hall disconnected and is now offline");
        assert.ok(!parameters.text);

        assert.ok(content.indexOf("ABC") > 0);
        assert.ok(content.indexOf("Main Hall") > 0);
        assert.ok(content.indexOf('b@example.com') > 0);
      });
    });

    it("should invoke external API to send recovery email", () => {
      simple.mock(emailSender, "send").resolveWith({
        statusCode: 200,
        body: '{"success": true}'
      });

      const display = {displayId: 'DEF', displayName: 'Corridor'};

      return notifier.sendRecoveryEmail(display, ['d@example.com'])
      .then(() => {
        assert.ok(emailSender.send.called);
        assert.equal(emailSender.send.callCount, 1);

        const [parameters, content] = emailSender.send.lastCall.args;

        assert.equal(parameters.from, "monitor@risevision.com");
        assert.equal(parameters.fromName, "Rise Vision Support");
        assert.equal(parameters.recipients, 'd@example.com');
        assert.equal(parameters.subject, "Corridor reconnected and is now online");
        assert.ok(!parameters.text);

        assert.ok(content.indexOf("DEF") > 0);
        assert.ok(content.indexOf("Corridor") > 0);
        assert.ok(content.indexOf("d@example.com") > 0);
      });
    });
  });

});
