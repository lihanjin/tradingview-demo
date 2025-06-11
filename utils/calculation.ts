import BigNumber from 'bignumber.js'

/**
 * 保留小数位，最后一位小数位，为舍去的小数位向上取整的值
 * @param number
 * @param decimalPlaces
 * @returns
 */
export function roundUpLastDecimal(number: BigNumber.Value, decimalPlaces = 2) {
    return BigNumber(number).toFixed(decimalPlaces, 2)
}

/**
 * 舍去指定小数位
 * @param number
 * @param decimalPlaces
 * @returns
 */
export function abandonDecimal(number: BigNumber.Value, decimalPlaces = 2) {
    return BigNumber(number).toFixed(decimalPlaces, BigNumber.ROUND_DOWN)
}

/** 四舍五入转化为指定小数位数，不足补0
 * @num num表示需要四舍五入的小数
 * @pNum s表示需要保留几位小数
 */
export function toFixed(num: BigNumber.Value, s = 2) {
    return BigNumber(num).toFixed(s)
}

/** 获取数字小数位长度 */
export function getDecimalNum(num: BigNumber.Value) {
    return BigNumber(num).dp()
}

/** 加法 */
export function plus(num1: BigNumber.Value, num2: BigNumber.Value) {
    num1 = num1 || 0
    num2 = num2 || 0
    return BigNumber(num1).plus(num2).toString()
}

/** 减法 */
export function minus(num1: BigNumber.Value, num2: BigNumber.Value) {
    num1 = num1 || 0
    num2 = num2 || 0
    return BigNumber(num1).minus(num2).toString()
}

/** 除法 */
export function div(num1: BigNumber.Value, num2: BigNumber.Value) {
    num1 = num1 || 0
    num2 = num2 || 1
    return BigNumber(num1).div(num2).toString()
}
/** 乘法 */
export function mul(num1: BigNumber.Value, num2: BigNumber.Value) {
    num1 = num1 || 0
    num2 = num2 || 0
    return BigNumber(num1).multipliedBy(num2).toString()
}
/** 幂 */
export function pow(num1: BigNumber.Value, num2: BigNumber.Value) {
    num1 = num1 || 0
    num2 = num2 || 0
    return BigNumber(num1).pow(num2).toString()
}
/** 大于 */
export function gt(num1: BigNumber.Value, num2: BigNumber.Value) {
    return BigNumber(num1).gt(num2)
}
/** 大于等于 */
export function gte(num1: BigNumber.Value, num2: BigNumber.Value) {
    return BigNumber(num1).gte(num2)
}
/** 小于 */
export function lt(num1: BigNumber.Value, num2: BigNumber.Value) {
    return BigNumber(num1).lt(num2)
}
/** 小于等于 */
export function lte(num1: BigNumber.Value, num2: BigNumber.Value) {
    return BigNumber(num1).lte(num2)
}
/** 等于 */
export function eq(num1: BigNumber.Value, num2: BigNumber.Value) {
    return BigNumber(num1).eq(num2)
}

/** 百分比 */
export function percent(num1: BigNumber.Value, num2: BigNumber.Value, s = 0) {
    return BigNumber(num1).div(num2).multipliedBy(100).toFixed(s).toString() + '%'
}

/** 移位比 shiftedBy(num1:  BigNumber.Value, num2: BigNumber.Value)
 * num1 要处理的数字
 * num2 移位为小数点，即10的幂，如果n为负则向左移位，如果n为正则向右移位。
 */
export function shiftedBy(num1: BigNumber.Value, num2: number) {
    if (!num1 || !num2) return num1
    return BigNumber(num1).shiftedBy(num2).toFixed(Math.abs(num2))
}

/** 比较两个数字值是否相等，包含null, undefined,0,'',false类型 */
export function equalTo(a: BigNumber.Value, b: BigNumber.Value) {
    const aBool = !!a
    const bBool = !!b
    if (aBool === false && aBool === bBool) {
        return true
    } else {
        return BigNumber(a).eq(b)
    }
}

/** 去绝对值 */
export function abs(num1: BigNumber.Value) {
    return BigNumber(num1).abs().toString()
}

/** 保留小数位 不四舍五入 */
export function retainDecimal(num: BigNumber.Value, decimal: number) {
    num = num.toString()
    const index = num.indexOf('.')
    if (index !== -1) {
        num = num.substring(0, decimal + index + 1)
    } else {
        num = num.substring(0)
    }
    return parseFloat(num).toFixed(decimal)
}

/** 只能输入数字 */
export function limitNumber(num: string) {
    let result = num
    if (/[^0-9\.]/.test(num)) {
        result = result.replace(/[^0-9\.]/g, '')
    }
    return result
}

/** 限制数字小数点后面的位数 */
export function limitDecimal(num: BigNumber.Value, digits: number) {
    let result = num
    if (Number(getDecimalNum(num)) > digits) {
        result = retainDecimal(num, digits)
    }
    return result
}

// 金额格式化显示
export function convertUnits(num: any, decimals = 2) {
    let result = ''
    if (isNaN(num)) {
        result = num
    } else if (num >= 1000000000000000000000000) {
        // 10^24 yotta 尧[它 Y
        num = toFixed(num / 1000000000000000000000000, decimals)
        result = num + 'Y'
    } else if (num >= 1000000000000000000000 && num < 1000000000000000000000000) {
        // 10^21 zetta 泽[它] Z
        num = toFixed(num / 1000000000000000000000, decimals)
        result = num + 'Z'
    } else if (num >= 1000000000000000000 && num < 1000000000000000000000) {
        // 10^18 exa 艾[可萨] E
        num = toFixed(num / 1000000000000000000, decimals)
        result = num + 'E'
    } else if (num >= 1000000000000000 && num < 1000000000000000000) {
        // 10^15 peta 拍[它] P
        num = toFixed(num / 1000000000000000, decimals)
        result = num + 'P'
    } else if (num >= 1000000000000 && num < 1000000000000000) {
        // 10^12 tera 太[拉] T
        num = toFixed(num / 1000000000000, decimals)
        result = num + 'T'
    } else if (num >= 1000000000 && num < 1000000000000) {
        num = toFixed(num / 1000000000, decimals)
        result = num + 'B'
    } else if (num >= 1000000 && num < 1000000000) {
        num = toFixed(num / 1000000, decimals)
        result = num + 'M'
    } else if (num >= 1000) {
        num = toFixed(num / 1000, decimals)
        result = num + 'K'
    } else {
        result = toFixed(num, decimals)
    }
    return result
}

// 科学计算法转 string
export function toNonExponential(num: any) {
    num = parseFloat(`${num}`)
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
}

// 千分位
export function thousandsNumber(num: number | string, digits = 2) {
    if (isNaN(Number(num))) {
        return `${num || '-'}`
    }
    const strNumber = toFixed(num, digits)
    let n = Math.abs(parseFloat(strNumber)) // 取绝对值格式化
    let r = ''
    let temp
    let mod
    do {
        mod = n % 1000
        n = n / 1000
        temp = ~~mod
        r = (n >= 1 ? `${temp}`.padStart(3, '0') : temp) + (r ? ',' + r : '')
    } while (n >= 1)
    const index = strNumber.indexOf('.')
    // 拼接小数部分
    if (index >= 0) {
        r += strNumber.substring(index)
    }
    // @ts-ignore
    // 负数处理
    if (num < 0) {
        r = '-' + r
    }
    return r
}

export function getUpDownColor(data: any, preData: any, defaultColor = 'text.secondary') {
    // 小于之前的价格，展示跌幅颜色
    if (lt(data, preData)) {
        return 'negative.main'
    }
    // 大于之前的价格，展示涨幅颜色
    if (gt(data, preData)) {
        return 'positive.main'
    }
    return defaultColor
}
