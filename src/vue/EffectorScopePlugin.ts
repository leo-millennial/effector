import {Scope, is} from 'effector'
import {App, Plugin, markRaw} from 'vue-next'

import {EffectorScopeConfigKey, EffectorScopeKey} from './lib/scope-key'
import {throwError} from './lib/throw'

export type EffectorScopePluginOptions = {
  scope: Scope
  scopeName?: string
  forceScope?: boolean
  ssr?: boolean
}

export function EffectorScopePlugin(options: EffectorScopePluginOptions): Plugin
export function EffectorScopePlugin(
  app: App,
  options: EffectorScopePluginOptions,
): void
export function EffectorScopePlugin(
  appOrOptions: any,
  maybeOptions?: EffectorScopePluginOptions,
): any {
  /**
   * `app.use(EffectorScopePlugin, {scope})` calls the plugin as a function
   * with the application first; that form used to install nothing at all.
   * `app.use(EffectorScopePlugin({scope}))` stays the documented one.
   */
  if (isApp(appOrOptions)) {
    install(appOrOptions, maybeOptions)
    return
  }

  const options = appOrOptions as EffectorScopePluginOptions

  return {
    install(app: App) {
      install(app, options)
    },
  }
}

function install(app: App, options?: EffectorScopePluginOptions) {
  if (!options || !is.scope(options.scope)) {
    throwError(
      'EffectorScopePlugin: expected "scope" to be a Scope created by fork()',
    )
  }

  const scope = markRaw(options.scope)
  /**
   * `ssr` is stored, not read: the composables have no server render branch to
   * override yet. It stays in the config so that branch finds it in place.
   */
  const {scopeName = 'root', forceScope, ssr} = options

  app.provide(EffectorScopeKey, scope)
  app.provide(EffectorScopeConfigKey, {forceScope, ssr, scopeName})

  /**
   * The scope used to be provided under a string key read from
   * `globalProperties.scopeName`; both are kept for applications and plugins
   * written against that contract. Vue 2 has no `globalProperties`.
   */
  try {
    app.config.globalProperties.scopeName = scopeName
  } catch (err) {}
  app.provide(scopeName, scope)
}

function isApp(value: any): value is App {
  return (
    !!value &&
    typeof value.provide === 'function' &&
    typeof value.use === 'function' &&
    !!value.config
  )
}
