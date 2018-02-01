function readMonitoredDisplays() {
  return Promise.resolve([
    {
      displayId: 'ABC', addresses: ['a@example.com']
    },
    {
      displayId: 'DEF', addresses: ['d@example.com']
    },
    {
      displayId: 'GHI', addresses: ['g@example.com']
    }
  ]);
}

module.exports = {readMonitoredDisplays};
