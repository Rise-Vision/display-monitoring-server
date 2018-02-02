/* eslint-env mocha */
const assert = require("assert");
const redisPromise = require("../../src/redis-promise.js");
const retriever = require("../../src/connection-state-retriever.js");
const localHost = "127.0.0.1";

const initialConnectedDisplays = ["A", "B", "C"]

let redisClient = null;

describe("Connection State - Integration", ()=>{
  before(()=>{
    redisClient = redisPromise.connectWith(localHost);
  });

  beforeEach(()=>{
    return setUpMockData()
    .then(()=>retriever.init(localHost));
  });

  after(()=>redisClient.quit().then(retriever.quit));

  it("hasMockData", ()=>{
    return redisClient.smembers("connections:id")
    .then(resp=>{
      assert.deepEqual(resp.sort(), initialConnectedDisplays.sort());
    });
  });

  it("retrieves connection state for one display", ()=>{
    return retriever.retrieveState(["A"])
    .then(resp=>{
      assert.deepEqual(resp, [1]);
    });
  });

  it("retrieves connection state for multiple displays", ()=>{
    return retriever.retrieveState(["A", "B", "X"])
    .then(resp=>{
      assert.deepEqual(resp, [1, 1, 0]);
    });
  });

  it("rejects if not array", ()=>{
    return retriever.retrieveState({})
    .then(()=>assert.fail("should have rejected"))
    .catch(err=>{
      if (err.message === "should have rejected") {return Promise.reject(err);}
    })
  });

  it("rejects if empty array", ()=>{
    return retriever.retrieveState([])
    .then(()=>assert.fail("should have rejected"))
    .catch(err=>{
      if (err.message === "should have rejected") {return Promise.reject(err);}
    })
  });
});

function setUpMockData() {
  return redisClient.del("connections:id")
  .then(()=>{
    return redisClient.sadd("connections:id", ...initialConnectedDisplays);
  });
}
