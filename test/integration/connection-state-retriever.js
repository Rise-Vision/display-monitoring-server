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
    return redisClient.smembers("connected-displays")
    .then(resp=>{
      console.dir(resp);
      assert.deepEqual(resp.sort(), initialConnectedDisplays.sort());
    });
  });
});

function setUpMockData() {
  return redisClient.del("connected-displays")
  .then(()=>{
    return redisClient.sadd("connected-displays", initialConnectedDisplays);
  });
}
