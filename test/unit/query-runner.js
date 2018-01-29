/* eslint-env mocha */
const assert = require("assert");
const runner = require("../../src/query-runner.js");

describe("QueryRunner - Unit", ()=>{
  it("exists", ()=>{
    assert(runner);
  });
});
