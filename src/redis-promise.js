const redis = require("redis");
const {promisify} = require("util");

module.exports = {
  connectWith(host) {
    const client = redis.createClient({host});
    const cmds = ["quit", "del", "sadd", "smembers"];

    return cmds.reduce((obj, key)=>{
      return {...obj, [key]: promisify(client[key]).bind(client)};
    }, {
      batch(commands) {
        return new Promise((res, rej)=>{
          client.batch(commands).exec((err, resp)=>{
            if (err) {return rej(err);}
            res(resp);
          });
        });
      }
    });
  }
}
