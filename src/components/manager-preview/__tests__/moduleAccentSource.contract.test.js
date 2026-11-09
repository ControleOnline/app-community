const fs = require('fs')
const path = require('path')

test('module card uses the category color and each button its route color (#1450)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'ManagerOverview.js'), 'utf8')
  expect(src).toMatch(/groupAccent = moduleAccent\?\.value \? resolveModuleAccent\(group\.color/)
  expect(src).toMatch(/backgroundColor: moduleAccentBackground\(groupAccent\) \?\? c\.cardBackground/)
  expect(src).toMatch(/accent = moduleAccent\?\.value \? resolveModuleAccent\(item\.color/)
})
