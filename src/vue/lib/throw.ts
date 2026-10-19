const prefix = '[effector-vue] '

export const throwError = (message: string): never => {
  throw Error(`${prefix}${message}`)
}

/**
 * A bundler replaces `process.env.NODE_ENV` and drops the warnings from a
 * production build. Without a bundler there is no `process`, and the
 * warnings stay on.
 */
const isDev = (): boolean => {
  try {
    return process.env.NODE_ENV !== 'production'
  } catch {
    return true
  }
}

export const devWarn = (message: string) => {
  if (isDev()) console.error(`${prefix}${message}`)
}
