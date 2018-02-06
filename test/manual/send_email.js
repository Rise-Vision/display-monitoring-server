/* eslint-disable no-magic-numbers */

const notifier = require("../../src/notifier");

const recipients = [...process.argv].slice(2);

if (recipients.length === 0) {
  throw new Error("No recipient addresses provided");
}

notifier.sendFailureEmail("ABC", recipients)
.then(console.log)
.catch(console.error);
