const runner = require("../../src/query-runner");

runner.readMonitoredDisplays()
.then(console.log)
.catch(console.error);
