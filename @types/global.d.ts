export interface Product {
    /** 交易品种代码，如 "USDJPY"、"TSLA.US" */
    symbol: string

    /** 品种全称，如 "USD/JPY"、"Tesla Inc" */
    full_name: string

    /** 简要描述，如 "美元兑日元"、"特斯拉公司股票" */
    description: string

    /** 行情显示用的 ticker，一般与 symbol 一致，部分交易所可能不同 */
    ticker: string

    /** 类型，支持外汇、股票、加密货币、贵金属 */
    type: 'us_stock' | 'hk_stock' | 'cn_stock' | 'forex' | 'crypto' | 'metal'

    /** 交易所标识，如 "NASDAQ"、"BINANCE"、"FOREX" 等 */
    exchange: string
}

/**
 * K线历史数据请求参数
 * @see https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/kline_query_cn.md#query%E8%AF%B7%E6%B1%82%E5%8F%82%E6%95%B0
 */
export interface GetKlineParams {
    /** 追踪码，用于日志追踪，请保证唯一（如：UUID、时间戳等） */
    trace: string

    /** K线查询参数对象 */
    data: {
        /** 品种代码（详见官方code列表，如 "BTCUSDT"、"AAPL.US"） */
        code: string

        /** K线类型
         * 1: 1分钟
         * 2: 5分钟
         * 3: 15分钟
         * 4: 30分钟
         * 5: 1小时
         * 6: 2小时（股票不支持）
         * 7: 4小时（股票不支持）
         * 8: 日K
         * 9: 周K
         * 10: 月K
         */
        kline_type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

        /** 查询截止时间戳（秒）：
         * - 0：表示从当前最新交易日往前查K线
         * - >0：指定时间戳，往前查K线（仅外汇/贵金属/加密货币支持，股票不支持时间戳）
         */
        kline_timestamp_end: number

        /** 查询K线数量，每次最多1000根（超限需循环查） */
        query_kline_num: number

        /** 复权类型，仅股票有效
         * - 0：除权
         * - 1：前复权
         * - 默认仅支持0
         */
        adjust_type: 0 | 1
    }
}

/**
 * 单根K线数据结构
 */
export interface KlineItem {
    /** K线时间戳（秒），字符串格式 */
    timestamp: string
    /** 开盘价，字符串格式 */
    open_price: string
    /** 收盘价，字符串格式 */
    close_price: string
    /** 最高价，字符串格式 */
    high_price: string
    /** 最低价，字符串格式 */
    low_price: string
    /** 成交数量（成交量），字符串格式 */
    volume: string
    /** 成交金额，字符串格式 */
    turnover: string
}

/**
 * K线接口返回的 data 字段结构
 */
export interface KlineResponseData {
    /** 品种代码 */
    code: string
    /** K线类型，参见kline_type说明 */
    kline_type: number
    /** K线列表 */
    kline_list: KlineItem[]
}

/**
 * K线接口完整响应结构
 * @see https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/kline_query_cn.md#%E8%BF%94%E5%9B%9E%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84
 */
export interface KlineApiResponse {
    /** 状态码，0为成功，其它为失败 */
    ret: number
    /** 提示信息 */
    msg: string
    /** 追踪码，回显请求 trace */
    trace: string
    /** 数据对象 */
    data: KlineResponseData
}
