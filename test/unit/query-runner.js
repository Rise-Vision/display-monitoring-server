/* eslint-env mocha */
const assert = require("assert");
const runner = require("../../src/query-runner.js");

describe("QueryRunner", ()=>{
  it("exists", ()=>{
    assert(runner);
  });
});
