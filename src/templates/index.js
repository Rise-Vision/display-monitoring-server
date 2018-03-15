const fs = require("fs");

function loadTemplate(name) {
  const path = require.resolve(`./${name}.html`);

  return fs.readFileSync(path, 'utf8'); // eslint-disable-line no-sync
}

module.exports = {
  failure: loadTemplate("monitor-offline-email"),
  recovery: loadTemplate("monitor-online-email")
};
