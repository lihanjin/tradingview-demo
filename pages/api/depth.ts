import type { NextApiRequest, NextApiResponse } from 'next'

import axios from 'axios'

import { guid } from '@/section/TradingChart/TVChartContainer/utils'

const DEPTH_API_MAP: Record<string, string> = {
    stock: 'https://quote.alltick.io/quote-stock-b-api/depth-tick',
    other: 'https://quote.alltick.io/quote-b-api/depth-tick',
}

type ApiErrorPayload = string | Record<string, unknown> | unknown[]

function getApiUrl(type: string): string {
    if (type === 'us_stock' || type === 'hk_stock' || type === 'cn_stock' || type === 'index') {
        return DEPTH_API_MAP.stock
    }
    return DEPTH_API_MAP.other
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' })
        return
    }

    try {
        const { code, type } = req.query
        const url = getApiUrl(type as string)

        const queryData = JSON.stringify({
            trace: guid(),
            data: {
                symbol_list: [{ code }],
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
