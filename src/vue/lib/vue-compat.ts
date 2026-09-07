import * as VueModule from 'vue-next'
import {
  InjectionKey,
  MaybeRefOrGetter,
  Ref,
  getCurrentInstance,
  unref,
} from 'vue-next'

/**
 * `hasInjectionContext` is Vue 3.3+, while the package declares `vue: "*"` as
 * a peer dependency. Reading it off the module namespace instead of importing
 * it by name keeps older versions loadable: there the component instance is
 * the only injection context that exists.
 */
const VueRuntime = VueModule as {
  hasInjectionContext?: () => boolean
  ssrContextKey?: symbol
  toValue?: <T>(source: MaybeRefOrGetter<T>) => T
}

export function hasInjectionContext(): boolean {
  if (typeof VueRuntime.hasInjectionContext === 'function') {
    return VueRuntime.hasInjectionContext()
  }
  return Boolean(getCurrentInstance())
}

/**
 * `toValue` is Vue 3.3+ as well. The fallback is the whole of it: a getter is
 * called, a ref is unwrapped, anything else is already a value.
 */
export function toValue<T>(source: MaybeRefOrGetter<T>): T {
  if (typeof VueRuntime.toValue === 'function') return VueRuntime.toValue(source)

  return typeof source === 'function'
    ? (source as () => T)()
    : unref(source as Ref<T>)
}

/**
 * The key `renderToString` provides its context under. Vue registers it in
 * the global symbol registry, so the fallback for versions that keep it out
 * of the public exports is the very same symbol.
 */
export const ssrContextKey = (VueRuntime.ssrContextKey ??
  Symbol.for('v-scx')) as InjectionKey<unknown>
