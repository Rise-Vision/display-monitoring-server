const redis = require("redis");
const {promisify} = require("util");

module.exports = {
  connectWith(host) {
    const client = redis.createClient({host});
    const cmds = ["quit", "del", "sadd", "smembers"];

    return cmds.reduce((obj, key)=>{
      return {...obj, [key]: promisify(client[key]).bind(client)};
    }, {});
  }
}
