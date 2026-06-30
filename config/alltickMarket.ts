export const ALLTICK_HTTP_BASE_URLS = {
    stock: 'https://quote.alltick.io/quote-stock-b-api',
    other: 'https://quote.alltick.io/quote-b-api',
} as const

export const ALLTICK_WS_BASE_URLS = {
    stock: 'wss://quote.alltick.io/quote-stock-b-ws-api',
    other: 'wss://quote.alltick.io/quote-b-ws-api',
} as const

const STOCK_MARKET_TYPES = new Set(['us_stock', 'hk_stock', 'cn_stock'])

export function isAllTickStockMarket(type: unknown): boolean {
    return typeof type === 'string' && STOCK_MARKET_TYPES.has(type)
}

export function getAllTickHttpApiBaseUrl(type: unknown): string {
    return isAllTickStockMarket(type) ? ALLTICK_HTTP_BASE_URLS.stock : ALLTICK_HTTP_BASE_URLS.other
}

export function getAllTickWsApiBaseUrl(type: unknown): string {
    return isAllTickStockMarket(type) ? ALLTICK_WS_BASE_URLS.stock : ALLTICK_WS_BASE_URLS.other
}
