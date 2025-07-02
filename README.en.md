[English](./README.en.md) | [中文](./README.md)

# TradingView Multi-Market Demo (AllTick)

## Introduction

This project is a multi-market demo based on AllTick market data and TradingView Charting Library, supporting real-time candlestick and time-sharing charts for US stocks, Hong Kong stocks, A-shares, Forex, precious metals, cryptocurrencies, and more.

## Features

- Multi-market, multi-product data display
- Real-time candlestick and time-sharing chart push
- Multiple resolution switching (1min, 5min, 1D, 1W, 1M, etc.)
- Product search and switching

## Quick Start

### Requirements

- Node.js 16+
- npm or yarn

### Install Dependencies

```bash
npm install
# or
yarn install

### Configure AllTick API Token
1. Register an AllTick account: https://www.alltick.co
2. After login, get your API Token from the user center.
3. Open the .env file in the project root and set API_TOKEN to your token:
```

API_TOKEN=your AllTick Token

```⚠️ Without a valid token, the data API will not work properly.
### Start Development Server
```

npm run dev

```
Visit http://localhost:3000 in your browser.

### Production Build
```

npm run build
npm run start

```
## Directory Structure
```

├── config/           # Product list configuration
├── pages/            # Next.js pages and API endpoints
├── section/          # TradingView chart core components
├── public/           # Static resources
├── .env              # Environment variables (API_TOKEN config)
└── README.md         # Project documentation

```
## FAQ
- How to get API_TOKEN?
  - Register and log in at AllTick official website, then get it in the dashboard.
- Data fetch failed?
  - Please check if API_TOKEN in .env is correct.
- How to customize product list?
  - Edit config/symbols.ts as needed.
## Official Website & API Docs
- AllTick: https://www.alltick.co
- API Docs: View in user center after login
```
