/* eslint-env mocha */
const assert = require("assert");
const emailer = require("../../src/emailer.js");

describe("Emailer", ()=>{
  it("exists", ()=>{
    assert(emailer);
  });
});
