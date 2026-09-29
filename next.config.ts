import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    basePath: '/chart',
    env: {
        API_TOKEN: process.env.API_TOKEN,
    },
}

export default nextConfig
