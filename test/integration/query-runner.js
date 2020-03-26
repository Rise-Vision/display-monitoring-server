/* eslint-env mocha */
/* eslint-disable array-bracket-newline, max-statements, no-magic-numbers */
const assert = require("assert");
const runner = require("../../src/query-runner.js");

// skip in most cases - requires GOOGLE_AUTHENTICATION_CREDENTIALS
// can be run manually when required
xdescribe("Query Runner - Integration", () => {
  it("should run its query", () => {
    return runner.invokeQuery()
    .then(res=>assert(res[0].length));
  });
});
