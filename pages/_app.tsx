import type { AppProps } from 'next/app'

import '@/public/styles/global.css'

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
