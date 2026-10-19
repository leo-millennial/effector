import {createApp, defineComponent, h} from 'vue-next'

import {hasInjectionContext} from '../lib/vue-compat'

jest.mock('vue', () => require('vue-next'))

/**
 * The installed Vue has `hasInjectionContext`, so every other run takes it.
 * These cases hide it to reach the path the versions before 3.3 get: the
 * check falls back to the component instance.
 */
describe('hasInjectionContext without the one of Vue', () => {
  const vue = require('vue-next')
  const original = vue.hasInjectionContext

  beforeEach(() => {
    vue.hasInjectionContext = undefined
  })

  afterEach(() => {
    vue.hasInjectionContext = original
  })

  test('is false outside of a component', () => {
    expect(hasInjectionContext()).toBe(false)
  })

  test('is true in setup', () => {
    let result: boolean | undefined

    const App = defineComponent({
      setup() {
        result = hasInjectionContext()
        return () => h('div')
      },
    })
    createApp(App).mount(document.createElement('div'))

    expect(result).toBe(true)
  })
})
