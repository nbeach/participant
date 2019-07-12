export const isPromise = (value: any): value is Promise<any> => {
    return not(isUndefined)(value) && typeof value.then === "function"
}

export const not = <T>(func: (param: T) => boolean): (param: T) => boolean => {
    return (param: T) => !func(param)
}

export const isUndefined = (value: any): value is undefined => {
    return value === undefined
}
