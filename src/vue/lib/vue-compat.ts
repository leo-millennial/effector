import * as VueModule from 'vue-next'
import {InjectionKey, getCurrentInstance} from 'vue-next'

/**
 * `hasInjectionContext` is Vue 3.3+, while the package declares `vue: "*"` as
 * a peer dependency. Reading it off the module namespace instead of importing
 * it by name keeps older versions loadable: there the component instance is
 * the only injection context that exists.
 */
const VueRuntime = VueModule as {
  hasInjectionContext?: () => boolean
  ssrContextKey?: symbol
}

export function hasInjectionContext(): boolean {
  if (typeof VueRuntime.hasInjectionContext === 'function') {
    return VueRuntime.hasInjectionContext()
  }
  return Boolean(getCurrentInstance())
}

/**
 * The key `renderToString` provides its context under. Vue registers it in
 * the global symbol registry, so the fallback for versions that keep it out
 * of the public exports is the very same symbol.
 */
export const ssrContextKey = (VueRuntime.ssrContextKey ??
  Symbol.for('v-scx')) as InjectionKey<unknown>
