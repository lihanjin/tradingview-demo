export interface Product {
    /** Trading symbol code, e.g. "USDJPY", "TSLA.US" */
    symbol: string

    /** Full name, e.g. "USD/JPY", "Tesla Inc" */
    full_name: string

    /** Brief description, e.g. "US Dollar to Japanese Yen", "Tesla Inc Stock" */
    description: string

    /** Ticker for market data display, usually same as symbol, may differ for some exchanges */
    ticker: string

    /** Type, supports forex, stock, crypto, metal */
    type: 'us_stock' | 'hk_stock' | 'cn_stock' | 'forex' | 'crypto' | 'metal'

    /** Exchange identifier, e.g. "NASDAQ", "BINANCE", "FOREX" etc. */
    exchange: string
}

/**
 * K-line historical data request parameters
 * @see https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/kline_query_cn.md#query%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0
 */
export interface GetKlineParams {
    /** Trace code for log tracking, ensure uniqueness (e.g. UUID, timestamp, etc.) */
    trace: string

    /** K-line query parameter object */
    data: {
        /** Symbol code (see official code list, e.g. "BTCUSDT", "AAPL.US") */
        code: string

        /** K-line type
         * 1: 1 minute
         * 2: 5 minutes
         * 3: 15 minutes
         * 4: 30 minutes
         * 5: 1 hour
         * 6: 2 hours (not supported for stocks)
         * 7: 4 hours (not supported for stocks)
         * 8: Daily
         * 9: Weekly
         * 10: Monthly
         */
        kline_type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

        /** Query end timestamp (seconds):
         * - 0: Query K-line from the latest trading day
         * - >0: Specify timestamp to query K-line backward (only supported for forex/metal/crypto, not for stocks)
         */
        kline_timestamp_end: number

        /** Number of K-lines to query, up to 1000 per request (loop if exceeded) */
        query_kline_num: number

        /** Adjustment type, only valid for stocks
         * - 0: Ex-right
         * - 1: Forward adjustment
         * - Only 0 is supported by default
         */
        adjust_type: 0 | 1
    }
}

/**
 * Single K-line data structure
 */
export interface KlineItem {
    /** K-line timestamp (seconds), string format */
    timestamp: string
    /** Open price, string format */
    open_price: string
    /** Close price, string format */
    close_price: string
    /** High price, string format */
    high_price: string
    /** Low price, string format */
    low_price: string
    /** Volume, string format */
    volume: string
    /** Turnover, string format */
    turnover: string
}

/**
 * Data field structure returned by K-line API
 */
export interface KlineResponseData {
    /** Symbol code */
    code: string
    /** K-line type, see kline_type description */
    kline_type: number
    /** K-line list */
    kline_list: KlineItem[]
}

/**
 * Complete response structure of K-line API
 * @see https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/kline_query_cn.md#%E8%BF%94%E5%9B%9E%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84
 */
export interface KlineApiResponse {
    /** Status code, 0 for success, others for failure */
    ret: number
    /** Message */
    msg: string
    /** Trace code, echo request trace */
    trace: string
    /** Data object */
    data: KlineResponseData
}
