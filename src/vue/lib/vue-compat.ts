import * as VueModule from 'vue-next'
import {getCurrentInstance} from 'vue-next'

/**
 * `hasInjectionContext` is Vue 3.3+, while the package declares `vue: "*"` as
 * a peer dependency. Reading it off the module namespace instead of importing
 * it by name keeps older versions loadable: there the component instance is
 * the only injection context that exists.
 */
const VueRuntime = VueModule as {hasInjectionContext?: () => boolean}

export function hasInjectionContext(): boolean {
  if (typeof VueRuntime.hasInjectionContext === 'function') {
    return VueRuntime.hasInjectionContext()
  }
  return Boolean(getCurrentInstance())
}
