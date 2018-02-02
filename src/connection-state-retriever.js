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
    return ids;
  }
};
