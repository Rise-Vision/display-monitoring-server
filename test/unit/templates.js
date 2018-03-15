/* eslint-env mocha */
/* eslint-disable no-magic-numbers */
const assert = require("assert");
const simple = require("simple-mock");

const notifier = require("../../src/notifier");
const templates = require("../../src/templates");

describe("Templates - Unit", () => {

  afterEach(() => simple.restore());

  it("should replace display data", () => {
    const serverDate = new Date(Date.parse('14 Mar 2018 10:00:00 GMT'));
    simple.mock(notifier, "getServerDate").returnWith(serverDate);

    const display = {
      displayId: 'ABC', displayName: 'Main Hall', timeZoneOffset: -240
    };

    const template = `
      Display id: DISPLAYID,
      name: DISPLAYNAME,
      timestamp: FORMATTEDTIMESTAMP
    `;

    const displayDate = notifier.displayDateFor(display);
    const formatted =
      templates.replaceDisplayData(template, display, displayDate);

    assert.equal(formatted, `
      Display id: ABC,
      name: Main Hall,
      timestamp: Mar 14 2018, at 06:00AM
    `);
  });

});
