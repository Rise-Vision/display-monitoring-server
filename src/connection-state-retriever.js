const redisPromise = require("./redis-promise.js");
const gkeHostname = "display-ms-redis-primary";

let redisClient = null;

module.exports = {
  init(host = gkeHostname) {
    redisClient = redisPromise.connectWith(host);
  },
  quit() {
    return redisClient.quit();
  },
  retrieveState(displays) {
    if (!validParam(displays)) {return invalidParam();}

    const commands = displays.map(display=>["get", `connections:id:${display.displayId}`]);

    return redisClient.batch(commands);
  }
};

function validParam(ids) {
  return ids && Array.isArray(ids) && ids.length;
}

function invalidParam() {
  return Promise.reject(Error("Expected an array with at least one element"));
}
