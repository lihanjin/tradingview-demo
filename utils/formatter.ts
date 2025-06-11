/** 解析json字符串 */
export function parseJSON(str: string | null, defaultValue: any) {
    if (str === null) return defaultValue
    try {
        const res = JSON.parse(str)
        return res || defaultValue
    } catch (e) {
        return defaultValue
    }
}

/**
 * 函数 getThousandsGroupRegex 返回基于指定千组样式的正则表达式。
 * @param {string} thousandsGroupStyle - `thousandsGroupStyle` 参数是一个字符串，用于确定数字中千位的分组样式。它可以具有三个可能的值：lakh | wan | thousand
 * @returns 基于输入参数“thousandsGroupStyle”的正则表达式。正则表达式用于根据所需的千位组样式对数字中的数字进行匹配和分组。
 */
export function getThousandsGroupRegex(thousandsGroupStyle: string) {
    switch (thousandsGroupStyle) {
        // 十万分位
        case 'lakh':
            return /(\d+?)(?=(\d\d)+(\d)(?!\d))(\.\d+)?/g
        // 万分位
        case 'wan':
            return /(\d)(?=(\d{4})+(?!\d))/g
        // 千分位
        case 'thousand':
        default:
            return /(\d)(?=(\d{3})+(?!\d))/g
    }
}

/**
 * 该函数根据指定的样式将千位分隔符应用于给定的字符串编号。
 * @param [str=0] - “str”参数是一个字符串，表示要使用千位分隔符格式化的数字。。
 * @param [thousandSeparator=,] - `thousandSeparator`
 * 参数是一个字符串，表示用于在输出中分隔千位的字符。例如，如果“thousandSeparator”设置为“','”，则输出将以逗号作为千位分隔符。
 * @param [thousandsGroupStyle=thousand] - `thousandsGroupStyle` 参数确定千组的分隔样式。它可以有两个可能的值： lakh | wan | thousand
 * @returns 添加了千位分隔符的输入字符串的修改版本。
 */
export function applyThousandSeparator(str = '0', thousandSeparator = ',', thousandsGroupStyle = 'thousand') {
    if (str === null || str === undefined) return '0'

    /** 是否有小数点 */
    const hasDecimalSeparator = str.indexOf('.') !== -1
    const parts = str.split('.')
    /** 整数位 */
    const beforeDecimal = parts[0]
    /** 小数位 */
    const afterDecimal = parts[1] || ''
    const thousandsGroupRegex = getThousandsGroupRegex(thousandsGroupStyle)

    let index = beforeDecimal.search(/[1-9]/)
    index = index === -1 ? str.length : index

    return `${
        beforeDecimal.substring(0, index) +
        beforeDecimal.substring(index, str.length).replace(thousandsGroupRegex, '$1' + thousandSeparator)
    }${hasDecimalSeparator ? '.' + afterDecimal : ''}`
}
