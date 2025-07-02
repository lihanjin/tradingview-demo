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

// Used to manage subscriptions (listenerGuid -> { symbol, resolution, callback })
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

    // Currently selected product
    const [currentSymbolInfo, setCurrentSymbolInfo] = useState<Product>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('currentSymbolInfo')
            return cached ? JSON.parse(cached) : symbolList[0]
        }
        return symbolList[0]
    })
    // Heartbeat timer reference
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    // Timestamp of the last heartbeat response
    const lastPongTimeRef = useRef<number>(0)
    // Heartbeat packet sequence number
    const seqRef = useRef(1)
    // Stocks that have already requested historical K-line data
    const stockGetBarsRequestedRef = useRef(new Set<string>())
    // Last bar data
    const lastBarsRef = useRef<Map<string, Bar>>(new Map())

    const resolutions = ['1', '5', '15', '30', '60', '120', '240', '1D', '1W', '1M'] as ResolutionString[]

    const getWsUrlByProductType = (type: string) => {
        const stockTypes = ['us_stock', 'hk_stock', 'cn_stock']
        // Stock and forex have different websocket URLs
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
            // Start heartbeat after connection is established
            startHeartbeat()
            // Resend current subscription data
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
                // 1️⃣ Parse WebSocket pushed data
                const parsed = JSON.parse(message.data)
                const tickData = parsed.data
                if (!tickData) return // Return directly if data is invalid

                // 2️⃣ Extract and format tick data
                const symbol = tickData.code
                const timeMs = Number(tickData.tick_time) // Millisecond timestamp
                const priceNum = Number(tickData.price)
                const volumeNum = Number(tickData.volume)

                // 3️⃣ Get current chart resolution and calculate the K-line period the tick belongs to
                const currentResolution = chartWidgetRef.current?.activeChart().resolution()
                const barTime = alignTimeToResolution(timeMs, currentResolution || '1')

                // 4️⃣ Get the last cached bar and determine if the tick is out of order
                const prevBar = lastBarsRef.current.get(symbol)
                if (prevBar && barTime < prevBar.time) {
                    // Skip out-of-order or rollback ticks to avoid TradingView time reversal errors
                    return
                }

                let newBar: Bar
                if (prevBar && prevBar.time === barTime) {
                    // 🔁 In the same period, update the current bar (high, low, close, volume)
                    newBar = {
                        ...prevBar,
                        high: Math.max(prevBar.high, priceNum),
                        low: Math.min(prevBar.low, priceNum),
                        close: priceNum,
                        volume: (prevBar.volume ?? 0) + volumeNum,
                    }
                } else {
                    // 🆕 New period, create a new bar
                    newBar = {
                        time: barTime,
                        open: priceNum,
                        high: priceNum,
                        low: priceNum,
                        close: priceNum,
                        volume: volumeNum,
                    }
                }

                // 5️⃣ Update cache
                lastBarsRef.current.set(symbol, newBar)

                // 6️⃣ Notify all subscribers of the symbol and call onTick callback to update the chart
                subscriptions.forEach(({ symbolInfo, onTick }) => {
                    if (symbolInfo.ticker === symbol && typeof onTick === 'function') {
                        onTick(newBar) // 📤 Push new bar data to TradingView widget
                    }
                })
            } catch (e) {
                // Catch parsing or processing exceptions to avoid affecting the main process
                console.error('[TV] Failed to parse tick data', e)
            }
        },
    })

    // Start heartbeat detection
    const startHeartbeat = () => {
        // Clear any existing old timer first
        stopHeartbeat()

        // Set the current time as the last PONG time
        lastPongTimeRef.current = Date.now()

        // Send a heartbeat message immediately after connection is established
        sendJsonMessage({
            cmd_id: 22000,
            seq_id: seqRef.current++,
            trace: guid(),
            data: {},
        })

        // Create a new timer to send PING every minute
        pingIntervalRef.current = setInterval(() => {
            // Send PING message
            sendJsonMessage({
                cmd_id: 22000,
                seq_id: seqRef.current++,
                trace: guid(),
                data: {},
            })
        }, 10 * 1000) // Execute every minute
    }

    // Stop heartbeat detection
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
                /** Get historical data, i.e., data before the current moment */
                async getBars(symbolInfo, resolution, periodParams, onResult) {
                    const isStock = symbolInfo.type.includes('stock')
                    const key = `${symbolInfo.ticker}_${resolution}`

                    // Stock products only request once
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
                                    ? {} // Stocks do not pass kline_timestamp_end
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

                        // Mark: getBars has already been requested for this stock
                        if (isStock) {
                            stockGetBarsRequestedRef.current.add(key)
                        }

                        onResult(bars)
                    } catch (error) {
                        onResult([], { noData: true })
                    }
                },
                /**
                 * Select product information
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
                            // Stocks do not support 2-hour and 4-hour K-lines
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
                 * Subscribe to K-line data, real-time data
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

                // /** Search products */
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
