import type { AppProps } from 'next/app'

import '@/public/styles/global.scss'

export default function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}
