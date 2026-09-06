import {Scope} from 'effector'

import {resolveScope} from './lib/get-scope'

export function useProvidedScope(opts: {forceScope: true}): Scope
export function useProvidedScope(opts?: {forceScope?: boolean}): Scope | null
export function useProvidedScope(opts?: {forceScope?: boolean}): Scope | null {
  return resolveScope('useProvidedScope', opts)
}
