
export const call = <T>(fun: (...args: any) => T, ...args: any): T => fun(...args)
export type Call = typeof call

export const mockCall = <T>(fun: (...args: any) => T, ...args: any): T => fun(...args)
export type MockCall = typeof mockCall
