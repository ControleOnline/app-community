global.IS_REACT_ACT_ENVIRONMENT = true

import React from 'react'
import renderer, {act} from 'react-test-renderer'
import ModuleTileGrid from '../ModuleTileGrid'

jest.mock('react-native', () => {
  const React = require('react')
  const component = name => props => React.createElement(name, props, props.children)
  return {View: component('View'), Text: component('Text'), StyleSheet: {create: value => value}}
})

const {Text} = require('react-native')

const hostByTestId = (tree, type, id) => tree.root.findAllByType(type).find(node => node.props.testID === id)

const flat = style => Object.assign({}, ...[].concat(style).flat(Infinity).filter(Boolean))

const render = items => {
  let tree
  act(() => {
    tree = renderer.create(
      <ModuleTileGrid
        testID="grid"
        items={items}
        renderTile={(item, index, spacing) => <Text key={item} testID={`tile-${item}`} style={spacing}>{item}</Text>}
      />,
    )
  })
  return tree
}

const measure = (tree, width) =>
  act(() => {
    hostByTestId(tree, 'View', 'grid').props.onLayout({nativeEvent: {layout: {width}}})
  })

const margin = (tree, id) => flat(hostByTestId(tree, 'Text', `tile-${id}`).props.style).marginRight

test('before measuring it keeps the wrapping fallback; after, columns are spread (#1495)', () => {
  const tree = render(['a', 'b', 'c', 'd'])
  expect(flat(hostByTestId(tree, 'View', 'grid').props.style).flexWrap).toBe('wrap')

  measure(tree, 238) // 2 columns, gap 30
  expect(margin(tree, 'a')).toBe(30)
  expect(margin(tree, 'b')).toBe(0)
  expect(margin(tree, 'c')).toBe(30)
  expect(margin(tree, 'd')).toBe(0)
})

test('incomplete last row stays in the same columns, left-aligned; one column gets no gap', () => {
  const tree = render(['a', 'b', 'c', 'd', 'e'])
  measure(tree, 328) // 3 columns, gap 8
  expect(margin(tree, 'a')).toBe(8)
  expect(margin(tree, 'c')).toBe(0)
  expect(margin(tree, 'd')).toBe(8)
  expect(margin(tree, 'e')).toBe(8)

  measure(tree, 150) // single column
  expect(margin(tree, 'a')).toBe(0)
})
