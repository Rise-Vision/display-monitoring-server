const logger = require("./logger");
const MASS_OUTAGE_THRESHOLD = 0.2;

module.exports = {
  shouldBypass(states = []) {
    const total = states.length;
    const offlineCount = states.reduce((sum, state)=>{
      return state === null ? sum + 1 : sum;
    }, 0);

    logger.log(`Offline count: ${offlineCount} of ${total}`);

    return offlineCount / total >= MASS_OUTAGE_THRESHOLD;
  }
};
