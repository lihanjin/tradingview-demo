import { useEffect, useRef, useState } from 'react'
import React from 'react'
import useWebSocket from 'react-use-websocket'

import axios from 'axios'

import { KlineApiResponse, Product } from '@/@types/global'
import { symbolList } from '@/config/symbols'
import type {
    Bar,
    ChartingLibraryWidgetOptions,
    CustomTimezones,
    DatafeedConfiguration,
    IChartingLibraryWidget,
    LibrarySymbolInfo,
    ResolutionString,
} from '@/public/static/charting_library'
import { widget } from '@/public/static/charting_library'

import { alignTimeToResolution, convertToTVBar, guid, resolutionMap } from './utils'

// 用于管理订阅（listenerGuid -> { symbol, resolution, callback }）
const subscriptions = new Map<
    string,
    {
        symbolInfo: LibrarySymbolInfo
        resolution: string
        onTick: (bar: any) => void
    }
>()

export const TVChartContainer = React.memo(() => {
    const chartWidgetRef = useRef<IChartingLibraryWidget>(null)
    const chartContainerRef = useRef<HTMLDivElement>(null) as React.MutableRefObject<HTMLInputElement>

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone as CustomTimezones

    // 当前选中的产品
    const [currentSymbolInfo, setCurrentSymbolInfo] = useState<Product>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('currentSymbolInfo')
            return cached ? JSON.parse(cached) : symbolList[0]
        }
        return symbolList[0]
    })
    // 心跳定时器引用
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    // 上次收到心跳响应的时间戳
    const lastPongTimeRef = useRef<number>(0)
    // 心跳包序列号
    const seqRef = useRef(1)
    // 已经请求过历史K线数据的股票
    const stockGetBarsRequestedRef = useRef(new Set<string>())
    // 最后一条数据
    const lastBarsRef = useRef<Map<string, Bar>>(new Map())

    const resolutions = ['1', '5', '15', '30', '60', '120', '240', '1D', '1W', '1M'] as ResolutionString[]

    const getWsUrlByProductType = (type: string) => {
        const stockTypes = ['us_stock', 'hk_stock', 'cn_stock']
        // 股票和外汇链接不一样
        if (stockTypes.includes(type)) {
            return 'wss://quote.alltick.io/quote-stock-b-ws-api?token=' + process.env.API_TOKEN
        }
        return 'wss://quote.alltick.io/quote-b-ws-api?token=' + process.env.API_TOKEN
    }

    const wsUrl = getWsUrlByProductType(currentSymbolInfo?.type)

    const { sendJsonMessage } = useWebSocket(wsUrl, {
        share: true,
        shouldReconnect: () => true,
        onOpen: () => {
            console.log('连接成功')
            // 连接成功后开始发送心跳
            startHeartbeat()
            // 重新发送当前订阅数据
            sendJsonMessage({
                cmd_id: 22004,
                seq_id: seqRef.current++,
                trace: guid(),
                data: {
                    symbol_list: [{ code: currentSymbolInfo.ticker }],
                },
            })
        },
        onMessage: (message) => {
            try {
                // 1️⃣ 解析 WebSocket 推送的数据
                const parsed = JSON.parse(message.data)
                const tickData = parsed.data
                if (!tickData) return // 数据无效直接返回

                // 2️⃣ 提取并格式化 tick 数据
                const symbol = tickData.code
                const timeMs = Number(tickData.tick_time) // 毫秒时间戳
                const priceNum = Number(tickData.price)
                const volumeNum = Number(tickData.volume)

                // 3️⃣ 获取当前图表分辨率，计算该 tick 所属的 K 线时间段
                const currentResolution = chartWidgetRef.current?.activeChart().resolution()
                const barTime = alignTimeToResolution(timeMs, currentResolution || '1')

                // 4️⃣ 获取上一次缓存的 bar，判断 tick 是否乱序
                const prevBar = lastBarsRef.current.get(symbol)
                if (prevBar && barTime < prevBar.time) {
                    // 跳过乱序或回退的 tick，避免 TradingView 时间倒序报错
                    return
                }

                let newBar: Bar
                if (prevBar && prevBar.time === barTime) {
                    // 🔁 同一时间段内，更新当前 bar（高、低、收盘、成交量）
                    newBar = {
                        ...prevBar,
                        high: Math.max(prevBar.high, priceNum),
                        low: Math.min(prevBar.low, priceNum),
                        close: priceNum,
                        volume: (prevBar.volume ?? 0) + volumeNum,
                    }
                } else {
                    // 🆕 新时间段，创建新 bar
                    newBar = {
                        time: barTime,
                        open: priceNum,
                        high: priceNum,
                        low: priceNum,
                        close: priceNum,
                        volume: volumeNum,
                    }
                }

                // 5️⃣ 更新缓存
                lastBarsRef.current.set(symbol, newBar)

                // 6️⃣ 通知所有订阅了该 symbol 的订阅者，调用 onTick 回调更新图表
                subscriptions.forEach(({ symbolInfo, onTick }) => {
                    if (symbolInfo.ticker === symbol && typeof onTick === 'function') {
                        onTick(newBar) // 📤 推送新 bar 数据到 TradingView widget
                    }
                })
            } catch (e) {
                // 捕获解析或处理异常，避免影响主流程
                console.error('[TV] 解析 tick 数据失败', e)
            }
        },
    })

    // 开始心跳检测
    const startHeartbeat = () => {
        // 先清除可能存在的旧定时器
        stopHeartbeat()

        // 设置当前时间为最后一次 PONG 时间
        lastPongTimeRef.current = Date.now()

        // 连接成功后立即发送一次心跳消息
        sendJsonMessage({
            cmd_id: 22000,
            seq_id: seqRef.current++,
            trace: guid(),
            data: {},
        })

        // 创建新的定时器，每分钟发送一次 PING
        pingIntervalRef.current = setInterval(() => {
            // 发送 PING 消息
            sendJsonMessage({
                cmd_id: 22000,
                seq_id: seqRef.current++,
                trace: guid(),
                data: {},
            })
        }, 10 * 1000) // 每分钟执行一次
    }

    // 停止心跳检测
    const stopHeartbeat = () => {
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current)
            pingIntervalRef.current = null
        }
    }

    useEffect(() => {
        const config: DatafeedConfiguration = {
            supported_resolutions: resolutions,
        }
        const widgetOptions: ChartingLibraryWidgetOptions = {
            symbol: currentSymbolInfo.ticker,
            datafeed: {
                onReady: (onReadyCallback) => {
                    setTimeout(() => onReadyCallback(config), 0)
                },
                /** 获取历史数据，即当前时刻之前的数据 */
                async getBars(symbolInfo, resolution, periodParams, onResult) {
                    const isStock = symbolInfo.type.includes('stock')
                    const key = `${symbolInfo.ticker}_${resolution}`

                    // 股票产品只请求一次
                    if (isStock && stockGetBarsRequestedRef.current.has(key)) {
                        onResult([], { noData: true })
                        return
                    }

                    try {
                        const result = await axios.get<KlineApiResponse>('/api/kline', {
                            params: {
                                code: symbolInfo.ticker,
                                type: symbolInfo.type,
                                kline_type: resolutionMap[resolution],
                                query_kline_num: 1000,
                                adjust_type: 0,
                                ...(isStock
                                    ? {} // 股票不传 kline_timestamp_end
                                    : {
                                          kline_timestamp_end: periodParams?.firstDataRequest ? 0 : periodParams?.to,
                                      }),
                            },
                        })

                        const klineList = result?.data?.data?.kline_list || []

                        if (klineList.length === 0) {
                            onResult([], { noData: true })
                            return
                        }

                        const bars = klineList.map(convertToTVBar)

                        // 标记：已经请求过该股票的 getBars
                        if (isStock) {
                            stockGetBarsRequestedRef.current.add(key)
                        }

                        onResult(bars)
                    } catch (error) {
                        console.error('🚀 ~ getBars 请求异常:', error)
                        onResult([], { noData: true }) // 防止死循环
                    }
                },
                /**
                 * 选择产品信息
                 */
                async resolveSymbol(symbolId, onResolve, onError) {
                    try {
                        const product = symbolList.find((item) => item.symbol === symbolId || item.ticker === symbolId)
                        if (!product) {
                            Promise.resolve().then(() => onError('Symbol not found'))
                            return
                        }

                        let pricescale = 100
                        let session = '24x7'
                        let timezone = 'Etc/UTC'

                        switch (product.type) {
                            case 'us_stock':
                                session = '0930-1600'
                                timezone = 'America/New_York'
                                break
                            case 'hk_stock':
                                session = '0930-1200,1300-1600'
                                timezone = 'Asia/Hong_Kong'
                                break
                            case 'cn_stock':
                                session = '0930-1130,1300-1500'
                                timezone = 'Asia/Shanghai'
                                break
                            case 'forex':
                            case 'metal':
                                pricescale = 100000
                                session = '24x7'
                                timezone = 'Etc/UTC'
                                break
                            case 'crypto':
                                pricescale = 100
                                session = '24x7'
                                timezone = 'Etc/UTC'
                                break
                        }
                        const isStock = product.type === 'us_stock' || product.type === 'hk_stock' || product.type === 'cn_stock'

                        const symbolInfo = {
                            name: product.symbol,
                            description: product.description,
                            type: product.type,
                            session,
                            exchange: product.exchange,
                            listed_exchange: product.exchange,
                            timezone: timezone as LibrarySymbolInfo['timezone'],
                            format: 'price' as const,
                            pricescale,
                            minmov: 1,
                            ticker: product.ticker,
                            // 股票不支持2小时K、4小时K
                            supported_resolutions: resolutions.filter((r) => !isStock || (r !== '120' && r !== '240')),
                            has_intraday: true,
                            intraday_multipliers: ['1', '5', '15', '30', '60', '120', '240'],
                            has_weekly_and_monthly: true,
                        }

                        setCurrentSymbolInfo(product)
                        localStorage.setItem('currentSymbolInfo', JSON.stringify(product))

                        Promise.resolve().then(() => onResolve(symbolInfo))
                    } catch (e) {
                        Promise.resolve().then(() => onError((e as Error).message))
                    }
                },

                /**
                 * 订阅 K 线数据的,实时数据
                 */
                subscribeBars(symbolInfo, resolution, onTick, listenerGuid) {
                    subscriptions.set(listenerGuid, { symbolInfo, resolution, onTick })

                    sendJsonMessage({
                        cmd_id: 22004,
                        seq_id: seqRef.current++,
                        trace: guid(),
                        data: {
                            symbol_list: [{ code: symbolInfo.ticker }],
                        },
                    })
                },

                unsubscribeBars(listenerGuid: string) {
                    const sub = subscriptions.get(listenerGuid)
                    if (sub && sendJsonMessage) {
                        sendJsonMessage({
                            cmd_id: 22006,
                            seq_id: seqRef.current++,
                            trace: guid(),
                            data: {
                                cancel_type: 2,
                            },
                        })
                    }

                    subscriptions.delete(listenerGuid)
                },

                // /** 搜索产品 */
                searchSymbols(userInput: string, exchange: string, symbolType: string, onResult) {
                    if (!userInput) return onResult(symbolList)
                    onResult(
                        symbolList.filter((symbol) => {
                            return (
                                symbol.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
                                symbol.full_name.toLowerCase().includes(userInput.toLowerCase())
                            )
                        }),
                    )
                },
            },
            interval:
                typeof window !== 'undefined' && localStorage.getItem('chartInterval')
                    ? (localStorage.getItem('chartInterval') as ResolutionString)
                    : ('1' as ResolutionString),
            container: chartContainerRef.current,
            library_path: '/static/charting_library/',
            locale: 'zh',
            // https://tradingview.gitee.io/featuresets/
            disabled_features: ['header_compare', 'symbol_search_hot_key', 'symbol_info', 'go_to_date'],
            enabled_features: ['study_templates'],
            charts_storage_url: 'https://saveload.tradingview.com',
            charts_storage_api_version: '1.1',
            client_id: 'tradingview.com',
            user_id: 'public_user_id',
            fullscreen: false,
            autosize: true,
            theme: 'dark',
            timezone,
        }

        chartWidgetRef.current = new widget(widgetOptions)
        if (chartWidgetRef.current) {
            chartWidgetRef.current.onChartReady(() => {
                chartWidgetRef.current
                    ?.activeChart()
                    .onIntervalChanged()
                    .subscribe(null, (interval) => {
                        console.log(interval)
                        localStorage.setItem('chartInterval', interval)
                    })
            })
        }
    }, [])

    return <div className="h-full w-full" ref={chartContainerRef} />
})
