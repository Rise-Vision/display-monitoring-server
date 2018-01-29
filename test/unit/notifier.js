/* eslint-env mocha */
const assert = require("assert");
const notifier = require("../../src/notifier.js");

describe("Notifier - Unit", ()=>{
  it("exists", ()=>{
    assert(notifier);
  });
});
