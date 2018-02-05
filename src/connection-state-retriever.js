const redisPromise = require("./redis-promise.js");
const gkeHostname = "display-ms-redis-master";

let redisClient = null;

module.exports = {
  init(host = gkeHostname) {
    redisClient = redisPromise.connectWith(host);
  },
  quit() {
    return redisClient.quit();
  },
  retrieveState(ids) {
    if (!validParam(ids)) {return invalidParam();}

    const commands = ids.map(displayId=>["sismember", "connections:id", displayId]);

    return redisClient.batch(commands);
  }
};

function validParam(ids) {
  return ids && Array.isArray(ids) && ids.length;
}

function invalidParam() {
  return Promise.reject(Error("Expected an array with at least one element"));
}
