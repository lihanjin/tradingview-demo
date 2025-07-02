import React from 'react'

import Script from 'next/script'

import { TVChartContainer } from './TVChartContainer'

export default function TradingChart() {
    return (
        <>
            <Script src="/static/datafeeds/udf/dist/bundle.js" strategy="lazyOnload" />
            <TVChartContainer />
        </>
    )
}
