export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

/**
 * 该函数使用指定的键将值保存到浏览器的本地存储中。
 * @param {string} key - key 参数是一个字符串，表示存储在 localStorage 中的值的名称或标识符。它用于稍后检索该值。
 * @param {string} value - value 参数是要保存到存储的数据。它可以是您要存储的任何字符串值。
 * @returns 正在返回“window.localStorage.setItem(key, value)”方法。
 */
export const saveToStorage = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.setItem(key, value)
    }
}

/**
 * 函数“getFromStorage”使用提供的键从浏览器的本地存储中检索值。
 * @param {string} key - “key”参数是一个字符串，表示用于从本地存储检索值的键。
 * @returns 使用给定键存储在 localStorage 中的值。
 */
export const getFromStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key)
    }
}

/**
 * 该函数使用指定的键将值转换成字符串保存到浏览器的本地存储中。
 * @param {string} key - key 参数是一个字符串，表示存储在 localStorage 中的值的名称或标识符。它用于稍后检索该值。
 * @param {string} value - value 参数是要保存到存储的数据。它可以是您要存储的任何字符串值。
 * @returns 正在返回“window.localStorage.setItem(key, value)”方法。
 */
export const saveParseToStorage = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.log('🚀 ~ file: common.ts:43 ~ saveParseToStorage ~ error:', error)
        }
    }
}

/**
 * 函数“getFromStorage”使用提供的键从浏览器的本地存储中检索值。
 * @param {string} key - “key”参数是一个字符串，表示用于从本地存储检索值的键。
 * @returns 使用给定键存储在 localStorage 中的值。转换成对象或数字
 */
export const getParseToStorage = (key: string) => {
    let parseValue = null

    if (typeof window !== 'undefined') {
        try {
            const storeValue = window.localStorage.getItem(key)
            if (storeValue) {
                parseValue = JSON.parse(storeValue)
            }
        } catch (error) {
            console.log('🚀 ~ file: common.ts:61 ~ getParseToStorage ~ error:', error)
            return null
        }
    }

    return parseValue
}

/**
 * 如果给定对象具有“addEventListener”方法，则函数“eventListenerOn”将事件侦听器添加到该对象。
 * @param {T | null} obj - `obj`
 * 参数是将添加事件监听器的对象。它可以是“Window”、“Document”、“HTMLElement”或任何实现“EventTarget”接口的对象。
 * @param {Parameters<T['addEventListener']> | [string, Function | null, ...any]} args - `args`
 * 参数是一个剩余参数，允许您传入任意数量的参数。它可以接受两种类型的参数：
 *  * Demos:
 *
 * ```
 * eventListenerOn(window, 'beforeunload', (e) =>{})
 * ```
 */
export function eventListenerOn<T extends Window | Document | HTMLElement | EventTarget>(
    obj: T | null,
    ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]
): void {
    if (obj?.addEventListener) {
        obj.addEventListener(...(args as Parameters<HTMLElement['addEventListener']>))
    }
}

/**
 * 如果给定对象具有“removeEventListener”方法，则“eventListenerOff”函数会从给定对象中删除事件侦听器。
 * @param {T | null} obj - `obj`
 * 参数是应删除事件侦听器的对象。它可以是“Window”、“Document”、“HTMLElement”或任何实现“EventTarget”接口的对象。
 * @param {Parameters<T['removeEventListener']> | [string, Function | null, ...any]} args - `args`
 * 参数是一个剩余参数，允许您传入多个不同类型的参数。在这种情况下，它接受与“HTMLElement”接口的“removeEventListener”方法相同的参数，或者字符串、函数或 null
 *
 * * Demos:
 *
 * ```
 * eventListenerOff(window, 'beforeunload', (e) =>{})
 * ```
 */
export function eventListenerOff<T extends Window | Document | HTMLElement | EventTarget>(
    obj: T | null,
    ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]
): void {
    if (obj?.removeEventListener) {
        obj.removeEventListener(...(args as Parameters<HTMLElement['removeEventListener']>))
    }
}
