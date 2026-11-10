const fs = require('fs')
const path = require('path')

test('category list items match Quick access height and spacing (#1463)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'ManagerOverview.js'), 'utf8')
  expect(src).toMatch(/moduleList: \{marginTop: 12, gap: 10\}/)
  expect(src).toMatch(/moduleItem: \{[^}]*minHeight: CONTROL_HEIGHT/)
  expect(src).not.toMatch(/moduleItem: \{[^}]*paddingVertical: 13/)
})
