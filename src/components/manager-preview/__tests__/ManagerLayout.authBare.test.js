import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('@store', () => ({
  useStore: () => ({getters: {isLogged: true}}),
}))
jest.mock('@controleonline/ui-layout/src/react/layouts/DefaultLayout', () => {
  const React = require('react')
  return function MockDefault() {
    return React.createElement('DefaultLayout')
  }
})
jest.mock('../model', () => ({managerPreviewEnabled: true}))
jest.mock('../ManagerShell', () => {
  const React = require('react')
  return function MockShell() {
    return React.createElement('ManagerShell')
  }
})
jest.mock('../ManagerStartup', () => {
  const React = require('react')
  return function MockStartup() {
    return React.createElement('ManagerStartup')
  }
})
jest.mock('@controleonline/ui-common/src/react/router/publicRoutes', () => ({
  isPublicRoute: () => false,
}))

import ManagerLayout from '../ManagerLayout'

describe('ManagerLayout auth bare routes', () => {
  it('renders children only for McpOAuthConsentPage when logged in', () => {
    const tree = renderer
      .create(
        <ManagerLayout route={{name: 'McpOAuthConsentPage'}}>
          <span>consent</span>
        </ManagerLayout>,
      )
      .toJSON()
    const flat = JSON.stringify(tree)
    expect(flat).toContain('consent')
    expect(flat).not.toContain('ManagerShell')
  })
})
