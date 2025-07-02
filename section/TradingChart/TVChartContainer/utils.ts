import dayjs from 'dayjs'

import { Bar } from '@/public/static/charting_library/charting_library'

/**
 * 计算到下一个更新k线的时间要多少秒
 * @param interval 时间间隔
 * @param time 上一次k线返回的最新时间
 * @returns
 */
export function timeToNextInterval(interval: number) {
    const now = dayjs()

    // 获取到下一个整数时间点的函数
    const getNextRoundedTime = (unit: dayjs.ManipulateType, amount: number) => {
        const time = now.add(1, unit).startOf(unit)
        const roundedTime = time.minute() % amount === 0 ? time : time.add(amount - (time.minute() % amount), 'minute')
        return roundedTime
    }

    // 获取不同时间点

    const obj: { [key in number]: dayjs.Dayjs } = {
        1: getNextRoundedTime('minute', 1),
        2: getNextRoundedTime('minute', 5),
        3: getNextRoundedTime('minute', 15),
        4: getNextRoundedTime('minute', 30),
        5: getNextRoundedTime('hour', 1),
        6: getNextRoundedTime('hour', 2),
        7: getNextRoundedTime('hour', 4),
        8: getNextRoundedTime('day', 1),
        9: getNextRoundedTime('week', 1),
        10: getNextRoundedTime('month', 1),
    }

    // 计算差异秒数的函数
    return {
        diff: obj[interval].diff(now, 'milliseconds') + 1500,
    }
}

/**
 * 1分钟K，2为5分钟K，3为15分钟K，4为30分钟K，5为小时K，6为2小时K，7为4小时K，8为日K，9为周K，10为月K
 */
export const resolutionMap: any = {
    1: '1',
    5: '2',
    15: '3',
    30: '4',
    60: '5',
    120: '6',
    240: '7',
    '1D': '8',
    '1W': '9',
    '1M': '10',
}

/**
 * 将接口返回的单条K线对象转为 TradingView 所需格式
 * @param item 后端原始K线对象
 * @returns TradingView 标准K线对象
 */
export function convertToTVBar(item: {
    timestamp: string
    open_price: string
    close_price: string
    high_price: string
    low_price: string
    volume: string
}): Bar {
    return {
        time: Number(item.timestamp) * 1000,
        open: Number(item.open_price),
        high: Number(item.high_price),
        low: Number(item.low_price),
        close: Number(item.close_price),
        volume: Number(item.volume),
    }
}

export function alignTimeToResolution(timeMs: number, resolution: string): number {
    const timeSec = Math.floor(timeMs / 1000)

    let intervalSec: number

    switch (resolution) {
        case '1':
            intervalSec = 60
            break
        case '5':
            intervalSec = 300
            break
        case '15':
            intervalSec = 900
            break
        case '30':
            intervalSec = 1800
            break
        case '60':
            intervalSec = 3600
            break
        case '1D':
        case 'D':
            intervalSec = 86400
            break
        default:
            intervalSec = 60
    }

    const alignedSec = Math.floor(timeSec / intervalSec) * intervalSec
    return alignedSec * 1000 // 转换为毫秒
}

export function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
