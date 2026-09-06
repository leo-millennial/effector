import {Scope, is} from 'effector'
import {getCurrentInstance, inject} from 'vue-next'

import {
  EffectorScopeConfig,
  EffectorScopeConfigKey,
  EffectorScopeKey,
} from './scope-key'
import {throwError} from './throw'
import {hasInjectionContext} from './vue-compat'

export type ScopeOptions = {
  scope?: Scope | null
  forceScope?: boolean
}

const NOT_PROVIDED = {}

const NOT_A_SCOPE =
  'expected "scope" to be an effector Scope created by fork(). ' +
  'A Vue EffectScope is a different thing: run the composable inside it ' +
  'instead of passing it as an option'

const NO_SCOPE =
  'no scope found, while forceScope is on. Install the plugin with ' +
  'app.use(EffectorScopePlugin({scope})), or pass {scope} to this call. ' +
  'The injection context is also lost after the first await of an async ' +
  'setup: call the composable before it, or use app.runWithContext'

/**
 * Resolves the scope of a composable call: an explicit option first, then the
 * injected scope, then the legacy string key of the plugin. Only the last
 * step needs a component instance, so the resolution keeps working in
 * `app.runWithContext` and in components without an instance.
 */
export function resolveScope(name: string, opts?: ScopeOptions): Scope | null {
  const explicitScope = opts?.scope
  if (explicitScope !== undefined && explicitScope !== null) {
    if (!is.scope(explicitScope)) throwError(`${name}: ${NOT_A_SCOPE}`)
    return explicitScope
  }

  let scope: Scope | null = null
  let config: EffectorScopeConfig | null = null

  if (hasInjectionContext()) {
    config = inject(EffectorScopeConfigKey, null)
    /**
     * A provided key wins even when its value is not a scope: a component
     * that provides one on its own opts the whole subtree out of the legacy
     * key of the application.
     */
    const injected = inject<unknown>(EffectorScopeKey, NOT_PROVIDED)
    scope =
      injected === NOT_PROVIDED
        ? resolveLegacyScope()
        : is.scope(injected)
        ? injected
        : null
  }

  const forceScope = opts?.forceScope ?? config?.forceScope

  if (!scope && forceScope) throwError(`${name}: ${NO_SCOPE}`)

  return scope
}

/**
 * @deprecated Compatibility shim for the deprecated `effector-vue/ssr` entry
 * point, which is removed in v24 (#1086). Use `resolveScope`.
 */
export function getScope() {
  return {scope: resolveScope('useEvent') ?? undefined}
}

/**
 * The scope used to be provided under a string key stored in
 * `globalProperties.scopeName`. Applications and plugins written against that
 * contract keep working.
 */
function resolveLegacyScope(): Scope | null {
  const instance = getCurrentInstance()
  if (!instance) return null

  const scopeName = instance.appContext.config.globalProperties.scopeName
  if (typeof scopeName !== 'string') return null

  const scope = inject<Scope | null>(scopeName, null)

  return is.scope(scope) ? scope : null
}
