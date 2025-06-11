import { isEmpty } from '.'

export const REG_MOBILE = /^((1[3-9][0-9]{1})+\d{8})$/
export const REG_AREA_CODE = /^[0-9]+$/
export const REG_EMAIL = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/ // 验证是否为邮箱格式；
export const PWD_REG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,18}$/ // 至少8个字符，至少1个大写字母，至少1个字母，1个数字和1个特殊字符
// 所有 MasterCard 号码以 51 与 55 之间的数字开始。全部号码均为 16 位。
export const REG_MASTER_CARD = /^5[1-5][0-9]{14}$/
/** 交易密码正则6位数字 */
export const REG_TRADE_PASSWORD = /^\d{6}$/
/** 英文或拼音的姓和名 */
export const REG_EN_NAME = /(^[a-zA-Z][a-zA-Z\s]{0,20}[a-zA-Z]$)/
/** 中文的姓和名 */
export const REG_CN_NAME = /^(?:[\u4e00-\u9fa5·]{1,16})$/

export function isMobileNumber(str: string, areaCode = '+86') {
    // 非大陆手机号只做数字判断
    str = str.replace(/\s*/g, '')
    return areaCode === '+86' ? REG_MOBILE.test(str) : REG_AREA_CODE.test(str)
}

export function isCode(str: string) {
    return REG_AREA_CODE.test(str)
}

export function isEmail(str: string) {
    return REG_EMAIL.test(str)
}

export function formatMobile(mobile: string) {
    const mobileReg = /(\d{3})\d*(\d{2})/
    return `${mobile}`.replace(mobileReg, '$1****$2')
}

export function isPassword(str: string) {
    return PWD_REG.test(str)
}

/** 不允许输入非负数和空 */
export const NoNegativeNumber = (values: { floatValue: number | undefined }) => {
    const { floatValue } = values
    if (isEmpty(floatValue) || floatValue === undefined) {
        return true
    }
    return floatValue >= 0
}
