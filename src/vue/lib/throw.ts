const prefix = '[effector-vue] '

export const throwError = (message: string): never => {
  throw Error(`${prefix}${message}`)
}

export const devWarn = (message: string) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`${prefix}${message}`)
  }
}
