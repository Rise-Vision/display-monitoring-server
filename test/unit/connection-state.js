const assert = require("assert");
const retriever = require("../../src/connection-state-retriever.js");

describe("Connection State - Unit", ()=>{
  it("exists", ()=>{
    assert(retriever);
  });
});
