const {getOrderChannelKey} = require('./index')

const {describe, expect, it} = global

describe('ppc channels', () => {
  it('maps app 99 to the 99food channel key', () => {
    expect(getOrderChannelKey({app: '99'})).toBe('99food')
  })
})
