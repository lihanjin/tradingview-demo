import type qs from 'qs'
import UAParser from 'ua-parser-js'

import { __UTM_CAMPAIGN__, __UTM_CONTENT__, __UTM_MEDIUM__, __UTM_SOURCE__, __UTM_TERM__ } from '@/constants'

/** 设置utm缓存 */
export const setUtmStorage = (query: qs.ParsedQs) => {
    const { utm_source = '', utm_medium = '', utm_campaign = '', utm_content = '', utm_term = '' } = query || {}
    // 缓存utm参数
    if (typeof utm_source === 'string') {
        window.sessionStorage.setItem(__UTM_SOURCE__, utm_source)
    }
    if (typeof utm_medium === 'string') {
        window.sessionStorage.setItem(__UTM_MEDIUM__, utm_medium)
    }
    if (typeof utm_campaign === 'string') {
        window.sessionStorage.setItem(__UTM_CAMPAIGN__, utm_campaign)
    }
    if (typeof utm_content === 'string') {
        window.sessionStorage.setItem(__UTM_CONTENT__, utm_content)
    }
    if (typeof utm_term === 'string') {
        window.sessionStorage.setItem(__UTM_TERM__, utm_term)
    }
}

/**
 * 获取设备类型
    注册来源:1=移动端web：H5，2=pcweb：PC_Web，3=系统&后台注册：System，4=安卓原生app：Android，5=苹果原生app：iOS，6=鸿蒙OS：HOS，7=pc windows客户端：PC_Win,8=pc mac客户端：PC_Mac，9=不属于以上的：其他
 */
export function getDevice() {
    if (typeof window === 'undefined') return 1
    const userAgentString = window.navigator.userAgent
    const parser = new UAParser()
    const result = parser.setUA(userAgentString).getResult()

    if (result.device && (result.device.type === 'mobile' || result.device.type === 'tablet')) {
        // 此访问由移动设备发起
        return 1
    }
    return 2
}

export function getRegisterDevice() {
    const parser = new UAParser()
    const device = parser.getDevice()
    // 移动端才能闹大device
    if (device?.model) {
        return `${device.model} ${device?.vendor || ''}`
    }

    // pc端获取操作系统类型
    const os = parser.getOS()
    if (os?.name) {
        return `${os.name} ${os?.version || ''}`
    }

    return navigator.platform
}

export function getMobileDevice() {
    const parser = new UAParser()
    const device = parser.getDevice()
    return device
}

/** 获取utm缓存 */
export function getUtmStorage() {
    const utmSource = window.sessionStorage.getItem(__UTM_SOURCE__)
    const utmMedium = window.sessionStorage.getItem(__UTM_MEDIUM__)
    const utmCampaign = window.sessionStorage.getItem(__UTM_CAMPAIGN__)
    const utmContent = window.sessionStorage.getItem(__UTM_CONTENT__)
    const utmTerm = window.sessionStorage.getItem(__UTM_TERM__)
    const registerSource = getDevice()

    return {
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm,
        registerSource,
    }
}
