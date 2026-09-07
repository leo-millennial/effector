import {ref, shallowReactive} from 'vue-next'

import {toValue} from '../lib/vue-compat'

jest.mock('vue', () => require('vue-next'))

/**
 * The installed Vue is 3.4, so every run takes the `toValue` of Vue itself.
 * These cases hide it to reach the fallback the older versions get.
 */
describe('toValue without the one of Vue', () => {
  const vue = require('vue-next')
  const original = vue.toValue

  beforeEach(() => {
    vue.toValue = undefined
  })

  afterEach(() => {
    vue.toValue = original
  })

  test('calls a getter', () => {
    const source = ref(1)

    expect(toValue(() => source.value + 1)).toBe(2)
  })

  test('unwraps a ref', () => {
    expect(toValue(ref('value'))).toBe('value')
  })

  test('returns a value as it is', () => {
    const state = shallowReactive({count: 0})

    expect(toValue(state)).toBe(state)
    expect(toValue(1)).toBe(1)
  })
})

test('toValue of Vue is used when it exists', () => {
  const source = ref(1)

  expect(toValue(source)).toBe(1)
  expect(toValue(() => source.value + 1)).toBe(2)
})
