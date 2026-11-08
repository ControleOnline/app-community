const fs = require('fs')
const path = require('path')

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8')

test('home, quick access and sidebar buttons share the 32px control height (#1442)', () => {
  expect(read('controlHeight.js')).toMatch(/CONTROL_HEIGHT = 32/)
  const overview = read('ManagerOverview.js')
  expect(overview).toMatch(/button: \{minHeight: CONTROL_HEIGHT/)
  expect(overview).toMatch(/periodOption: \{minHeight: CONTROL_HEIGHT/)
  expect(overview).toMatch(/quickItem:.*minHeight: CONTROL_HEIGHT/)
  expect(read('ManagerShell.js')).toMatch(/navItem: \{minHeight: CONTROL_HEIGHT/)
})
