import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

import { getAllTickHttpApiBaseUrl } from '@/config/alltickMarket'
import { guid } from '@/section/TradingChart/TVChartContainer/utils'

type ApiErrorPayload = string | Record<string, unknown> | unknown[]

function getApiUrl(type: string): string {
    return `${getAllTickHttpApiBaseUrl(type)}/kline`
}

function getErrorPayload(error: unknown): ApiErrorPayload {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data

        if (typeof responseData === 'string') {
            return responseData
        }

        if (Array.isArray(responseData)) {
            return responseData
        }

        if (responseData && typeof responseData === 'object') {
            return responseData as Record<string, unknown>
        }

        return error.message
    }

    if (error instanceof Error) {
        return error.message
    }

    return 'Internal Server Error'
}

/**
 * Get historical K-line data
 * @see https://github.com/alltick/alltick-realtime-forex-crypto-stock-tick-finance-websocket-api/blob/main/http_interface/kline_query_cn.md
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' })
        return
    }

    try {
        const { code, kline_type, kline_timestamp_end, query_kline_num, adjust_type, type } = req.query

        const url = getApiUrl(type as string)

        const queryData = JSON.stringify({
            trace: guid(),
            data: {
                code,
                kline_type,
                kline_timestamp_end,
                query_kline_num,
                adjust_type,
            },
        })

        const response = await axios.get(url, {
            params: {
                token: process.env.API_TOKEN,
                query: queryData,
            },
        })

        res.status(200).json(response.data)
    } catch (error: unknown) {
        res.status(500).json({
            error: getErrorPayload(error),
        })
    }
}
