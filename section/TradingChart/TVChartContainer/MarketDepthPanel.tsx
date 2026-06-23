import React, { useMemo } from 'react'

import { OrderBookData, OrderBookLevel, TradeData } from '@/@types/global'

type PriceDirection = 'up' | 'down' | 'flat'

interface MarketDepthPanelProps {
    orderBook?: OrderBookData
    trades: TradeData[]
    lastPrice?: number
    lastPriceDirection: PriceDirection
    quoteUnit: string
    baseUnit: string
    locale: string
}

const MAX_BOOK_ROWS = 8
const MAX_TRADE_ROWS = 18

const translations = {
    zh: {
        orderBook: '盘口',
        trades: '成交',
        price: '价格',
        amount: '数量',
        total: '累计',
        time: '时间',
        noOrderBook: '暂无盘口数据',
        noTrades: '暂无成交数据',
    },
    en: {
        orderBook: 'Order Book',
        trades: 'Trades',
        price: 'Price',
        amount: 'Amount',
        total: 'Total',
        time: 'Time',
        noOrderBook: 'No order book data',
        noTrades: 'No trades',
    },
    ja: {
        orderBook: '板情報',
        trades: '約定',
        price: '価格',
        amount: '数量',
        total: '合計',
        time: '時間',
        noOrderBook: '板情報がありません',
        noTrades: '約定データがありません',
    },
} as const

function getTranslations(locale: string) {
    if (locale.startsWith('ja')) return translations.ja
    if (locale.startsWith('en')) return translations.en
    return translations.zh
}

function toNumber(value?: string): number {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

function formatAmount(value?: string): string {
    const num = toNumber(value)
    if (!num) return '--'
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    if (num >= 1) return num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
    return num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

function formatTotal(value: number): string {
    if (!value) return '--'
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`
    return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

function formatTime(tickTime: string | number): string {
    const raw = Number(tickTime)
    if (!Number.isFinite(raw)) return '--'
    const ms = raw > 1000000000000 ? raw : raw * 1000
    return new Date(ms).toLocaleTimeString('zh-CN', { hour12: false })
}

function getCumulativeRows(levels: OrderBookLevel[], maxTotal: number, side: 'ask' | 'bid') {
    let cumulative = 0
    return levels.map((level) => {
        const price = toNumber(level.price)
        const volume = toNumber(level.volume)
        const total = price * volume
        cumulative += total
        return {
            ...level,
            total,
            depthPercent: maxTotal > 0 ? Math.max((cumulative / maxTotal) * 100, 4) : 0,
            side,
        }
    })
}

export function MarketDepthPanel({
    orderBook,
    trades,
    lastPrice,
    lastPriceDirection,
    quoteUnit,
    baseUnit,
    locale,
}: MarketDepthPanelProps) {
    const t = getTranslations(locale)
    const asks = useMemo(() => (orderBook?.asks || []).slice(0, MAX_BOOK_ROWS).reverse(), [orderBook?.asks])
    const bids = useMemo(() => (orderBook?.bids || []).slice(0, MAX_BOOK_ROWS), [orderBook?.bids])

    const askTotal = asks.reduce((sum, item) => sum + toNumber(item.price) * toNumber(item.volume), 0)
    const bidTotal = bids.reduce((sum, item) => sum + toNumber(item.price) * toNumber(item.volume), 0)
    const maxTotal = Math.max(askTotal, bidTotal)
    const buyPercent = askTotal + bidTotal > 0 ? (bidTotal / (askTotal + bidTotal)) * 100 : 50
    const sellPercent = 100 - buyPercent

    const askRows = getCumulativeRows(asks, maxTotal, 'ask')
    const bidRows = getCumulativeRows(bids, maxTotal, 'bid')
    const tradeRows = trades.slice(0, MAX_TRADE_ROWS)

    const priceClass = lastPriceDirection === 'up' ? 'is-up' : lastPriceDirection === 'down' ? 'is-down' : ''
    const priceArrow = lastPriceDirection === 'up' ? '↑' : lastPriceDirection === 'down' ? '↓' : ''

    return (
        <aside className="market-depth-panel">
            <section className="panel-section order-book-section">
                <div className="panel-title">{t.orderBook}</div>
                <div className="market-depth-head market-depth-grid">
                    <span>{t.price}{quoteUnit ? `(${quoteUnit})` : ''}</span>
                    <span>{t.amount}{baseUnit ? `(${baseUnit})` : ''}</span>
                    <span>{t.total}{quoteUnit ? `(${quoteUnit})` : ''}</span>
                </div>

                <div className="book-body">
                    {askRows.length === 0 && bidRows.length === 0 ? (
                        <div className="market-depth-empty">{t.noOrderBook}</div>
                    ) : (
                        <>
                            <div className="market-depth-rows">
                                {askRows.map((row, index) => (
                                    <OrderBookRow key={`ask-${row.price}-${index}`} level={row} quoteUnit={quoteUnit} />
                                ))}
                            </div>

                            <div className={`market-last-price ${priceClass}`}>
                                <span>{lastPrice ? lastPrice.toLocaleString(undefined, { maximumFractionDigits: 8 }) : '--'}</span>
                                <span className="market-last-price-arrow">{priceArrow}</span>
                            </div>

                            <div className="market-depth-rows">
                                {bidRows.map((row, index) => (
                                    <OrderBookRow key={`bid-${row.price}-${index}`} level={row} quoteUnit={quoteUnit} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="market-depth-ratio">
                    <div className="market-depth-ratio-text">
                        <span className="is-up">B {buyPercent.toFixed(2)}%</span>
                        <span className="is-down">{sellPercent.toFixed(2)}% S</span>
                    </div>
                    <div className="market-depth-ratio-bar">
                        <div className="buy" style={{ width: `${buyPercent}%` }} />
                        <div className="sell" style={{ width: `${sellPercent}%` }} />
                    </div>
                </div>
            </section>

            <section className="panel-section trades-section">
                <div className="panel-title">{t.trades}</div>
                <div className="market-depth-head market-depth-grid">
                    <span>{t.time}</span>
                    <span>{t.price}{quoteUnit ? `(${quoteUnit})` : ''}</span>
                    <span>{t.amount}{baseUnit ? `(${baseUnit})` : ''}</span>
                </div>
                <div className="trades-body">
                    {tradeRows.length === 0 ? (
                        <div className="market-depth-empty">{t.noTrades}</div>
                    ) : (
                        tradeRows.map((trade) => <TradeRow key={trade.seq || `${trade.tick_time}-${trade.price}-${trade.volume}`} trade={trade} />)
                    )}
                </div>
            </section>

            <style jsx>{`
                .market-depth-panel {
                    width: 320px;
                    min-width: 320px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #131722;
                    border-left: 1px solid #2a2e39;
                    color: #d1d4dc;
                    font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
                    font-size: 12px;
                    overflow: hidden;
                }

                .panel-section {
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .order-book-section {
                    flex: 0 0 auto;
                    border-bottom: 1px solid #2a2e39;
                }

                .trades-section {
                    flex: 1 1 0;
                }

                .panel-title {
                    height: 34px;
                    padding: 0 12px;
                    border-bottom: 1px solid #2a2e39;
                    color: #d1d4dc;
                    font-size: 12px;
                    font-weight: 600;
                    line-height: 34px;
                }

                .market-depth-grid {
                    display: grid;
                    grid-template-columns: minmax(88px, 1.15fr) minmax(86px, 1fr) minmax(82px, 1fr);
                    gap: 10px;
                }

                .market-depth-head {
                    padding: 7px 10px 5px;
                    color: #787b86;
                    font-size: 11px;
                    line-height: 16px;
                    white-space: nowrap;
                }

                .market-depth-head span:nth-child(2),
                .market-depth-head span:nth-child(3) {
                    text-align: right;
                }

                .book-body,
                .trades-body {
                    position: relative;
                    min-height: 0;
                }

                .book-body {
                    height: 390px;
                    overflow: hidden;
                }

                .trades-body {
                    flex: 1;
                    overflow: hidden;
                }

                .market-depth-empty {
                    min-height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #787b86;
                    font-size: 12px;
                }

                .market-depth-rows {
                    padding: 0 4px;
                }

                .market-last-price {
                    height: 38px;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    color: #d1d4dc;
                    font-size: 17px;
                    font-weight: 700;
                    border-top: 1px solid rgba(42, 46, 57, 0.55);
                    border-bottom: 1px solid rgba(42, 46, 57, 0.55);
                }

                .market-last-price-arrow {
                    margin-left: 5px;
                }

                .market-depth-ratio {
                    padding: 8px 10px 10px;
                    border-top: 1px solid #2a2e39;
                }

                .market-depth-ratio-text {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: 11px;
                    line-height: 14px;
                }

                .market-depth-ratio-bar {
                    display: flex;
                    height: 5px;
                    overflow: hidden;
                    border-radius: 2px;
                    background: #2a2e39;
                }

                .market-depth-ratio-bar .buy {
                    background: #089981;
                }

                .market-depth-ratio-bar .sell {
                    background: #f23645;
                }

                .is-up {
                    color: #089981;
                }

                .is-down {
                    color: #f23645;
                }
            `}</style>
        </aside>
    )
}

function OrderBookRow({
    level,
    quoteUnit,
}: {
    level: OrderBookLevel & { total: number; depthPercent: number; side: 'ask' | 'bid' }
    quoteUnit: string
}) {
    const rowClass = level.side === 'ask' ? 'ask' : 'bid'

    return (
        <div className="order-book-row market-depth-grid">
            <div className={`depth-bg ${rowClass}`} style={{ width: `${level.depthPercent}%` }} />
            <span className={rowClass}>{level.price}</span>
            <span>{formatAmount(level.volume)}</span>
            <span>{quoteUnit ? formatTotal(level.total) : '--'}</span>

            <style jsx>{`
                .order-book-row {
                    position: relative;
                    display: grid;
                    grid-template-columns: minmax(88px, 1.15fr) minmax(86px, 1fr) minmax(82px, 1fr);
                    gap: 10px;
                    height: 21px;
                    align-items: center;
                    padding: 0 6px;
                    border-radius: 2px;
                    overflow: hidden;
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
                    font-size: 11px;
                    line-height: 21px;
                }

                .order-book-row:hover {
                    background: #1e222d;
                }

                .order-book-row span {
                    position: relative;
                    z-index: 1;
                    min-width: 0;
                    overflow: hidden;
                    color: #d1d4dc;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .order-book-row span:nth-child(3),
                .order-book-row span:nth-child(4) {
                    text-align: right;
                }

                .order-book-row span.ask {
                    color: #f23645;
                }

                .order-book-row span.bid {
                    color: #089981;
                }

                .depth-bg {
                    position: absolute;
                    top: 0;
                    right: 0;
                    height: 100%;
                    z-index: 0;
                }

                .depth-bg.ask {
                    background: rgba(242, 54, 69, 0.12);
                }

                .depth-bg.bid {
                    background: rgba(8, 153, 129, 0.12);
                }
            `}</style>
        </div>
    )
}

function TradeRow({ trade }: { trade: TradeData }) {
    const rowClass = trade.trade_direction === 2 ? 'ask' : 'bid'

    return (
        <div className="trade-row market-depth-grid">
            <span>{formatTime(trade.tick_time)}</span>
            <span className={rowClass}>{trade.price}</span>
            <span>{formatAmount(trade.volume)}</span>

            <style jsx>{`
                .trade-row {
                    display: grid;
                    grid-template-columns: minmax(88px, 1.15fr) minmax(86px, 1fr) minmax(82px, 1fr);
                    gap: 10px;
                    height: 23px;
                    align-items: center;
                    padding: 0 10px;
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;
                    font-size: 11px;
                    line-height: 23px;
                }

                .trade-row:hover {
                    background: #1e222d;
                }

                .trade-row span {
                    min-width: 0;
                    overflow: hidden;
                    color: #d1d4dc;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .trade-row span:first-child {
                    color: #787b86;
                }

                .trade-row span:nth-child(2),
                .trade-row span:nth-child(3) {
                    text-align: right;
                }

                .trade-row span.ask {
                    color: #f23645;
                }

                .trade-row span.bid {
                    color: #089981;
                }
            `}</style>
        </div>
    )
}
