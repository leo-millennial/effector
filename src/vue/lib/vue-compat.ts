import * as VueModule from 'vue-next'
import {
  InjectionKey,
  getCurrentInstance,
  ssrContextKey as vueSsrContextKey,
} from 'vue-next'

/**
 * `hasInjectionContext` arrived in Vue 3.3, while the package declares
 * `vue: "*"` as a peer dependency. Reading it off the module namespace keeps
 * 3.2 loadable: there a component instance is the only injection context
 * that exists, and `getCurrentInstance` covers it.
 *
 * Every read goes to a member of the namespace. A bundler resolves such a read
 * to the one export, while a namespace kept in a variable has to be built in
 * full and puts all of Vue into the application.
 */
export function hasInjectionContext(): boolean {
  if (typeof VueModule.hasInjectionContext === 'function') {
    return VueModule.hasInjectionContext()
  }

  return Boolean(getCurrentInstance())
}

/** The key `renderToString` provides its context under. Every Vue 3 exports it. */
export const ssrContextKey = vueSsrContextKey as InjectionKey<unknown>
