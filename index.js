const notifier = require("./src/notifier.js");
const runner = require("./src/query-runner.js");
const temporaryInterval = 60000;

require("assert")(notifier);
require("assert")(runner);

setInterval(temporaryHeartbeat, temporaryInterval);

function temporaryHeartbeat() {
  console.log("I'm alive");
}
