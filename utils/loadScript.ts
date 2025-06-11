/**
 * 创建script
 * @param url
 * @returns {Promise}
 */
function loadScript(url: string, setScriptAttr?: (scriptElement: HTMLScriptElement) => void) {
    const scriptElement = document.createElement('script')
    document.body.appendChild(scriptElement)
    const promise = new Promise((resolve, reject) => {
        scriptElement.addEventListener(
            'load',
            (e) => {
                removeScript(scriptElement)
                resolve(e)
            },
            false,
        )

        scriptElement.addEventListener(
            'error',
            (e) => {
                removeScript(scriptElement)
                reject(e)
            },
            false,
        )
    })
    scriptElement.type = 'text/javascript'
    scriptElement.async = false
    scriptElement.defer = true
    scriptElement.src = url
    setScriptAttr?.(scriptElement)
    return promise
}

/**
 * 移除script标签
 * @param scriptElement script dom
 */
function removeScript(scriptElement: any) {
    document.body.removeChild(scriptElement)
}

export default loadScript
