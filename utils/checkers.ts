/* eslint-disable indent */
const { toString } = Object.prototype
export const getType = (obj: any) => toString.call(obj)
const isType =
    <T>(type: string | string[]) =>
    (obj: unknown): obj is T =>
        getType(obj) === `[object ${type}]`
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFn = (val: any): val is Function => typeof val === 'function'
export const isArr = Array.isArray
export const isPlainObj = isType<object>('Object')
export const isStr = isType<string>('String')
export const isBool = isType<boolean>('Boolean')
export const isNum = isType<number>('Number')
export const isMap = (val: any): val is Map<any, any> => val && val instanceof Map
export const isSet = (val: any): val is Set<any> => val && val instanceof Set
export const isWeakMap = (val: any): val is WeakMap<any, any> => val && val instanceof WeakMap
export const isWeakSet = (val: any): val is WeakSet<any> => val && val instanceof WeakSet
export const isNumberLike = (index: any): index is number => isNum(index) || /^\d+$/.test(index)
export const isObj = (val: unknown): val is object => typeof val === 'object'
export const isRegExp = isType<RegExp>('RegExp')
export const isReactElement = (obj: any): boolean => obj?.$$typeof && obj._owner
export const isHTMLElement = (target: any): target is EventTarget => Object.prototype.toString.call(target).indexOf('HTML') > -1

export const isServer = typeof window === 'undefined'

const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent
export const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

const has = Object.prototype.hasOwnProperty

export const isValid = (val: any) => val !== undefined && val !== null

// eslint-disable-next-line complexity
export function isEmpty(val: any, strict = false): boolean {
    // Null and Undefined...
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (val == null) {
        return true
    }

    // Booleans...
    if (typeof val === 'boolean') {
        return false
    }

    // Numbers...
    if (typeof val === 'number') {
        return false
    }

    // Strings...
    if (typeof val === 'string') {
        return val.length === 0
    }

    // Functions...
    if (typeof val === 'function') {
        return val.length === 0
    }

    // Arrays...
    if (Array.isArray(val)) {
        if (val.length === 0) {
            return true
        }
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < val.length; i++) {
            if (strict) {
                if (val[i] !== undefined && val[i] !== null) {
                    return false
                }
            } else if (val[i] !== undefined && val[i] !== null && val[i] !== '' && val[i] !== 0) {
                return false
            }
        }
        return true
    }

    // Objects...
    if (val.toString === toString) {
        // eslint-disable-next-line default-case
        switch (val.toString()) {
            // Maps, Sets, Files and Errors...
            case '[object File]':
            case '[object Map]':
            case '[object Set]': {
                return val.size === 0
            }

            // Plain objects...
            case '[object Object]': {
                for (const key in val) {
                    if (has.call(val, key)) {
                        return false
                    }
                }

                return true
            }
        }
    }

    // Anything else...
    return false
}
