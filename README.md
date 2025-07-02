[English](./README.en.md) | [中文](./README.md) | [日本語](./README.jp.md)

# TradingView Demo (Alltick)

## 简介

本项目是基于 Alltick 行情实现 TradingView Charting Library 的多市场行情演示，支持美股、港股、A股、外汇、贵金属、加密货币等多品种实时K线与分时图展示。

## 特性

- 多市场、多品种行情展示
- 实时K线、分时图推送
- 支持多分辨率切换（1min, 5min, 1D, 1W, 1M等）
- 产品搜索与切换

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

# AllTick TradingView 多市场行情开源演示

## 项目简介

本项目基于 AllTick 行情与 TradingView Charting Library，支持美股、港股、A股、外汇、贵金属、加密货币等多品种实时K线与分时图展示。开箱即用，适合二次开发、学习与商业集成。

- 🚀 **全市场支持**：美股、港股、A股、外汇、贵金属、加密货币等主流市场一站式接入
- 🔥 **实时行情推送**：毫秒级推送，支持多分辨率K线与分时图
- 🛠️ **TradingView原生体验**：集成官方Charting Library，交互流畅
- 🧩 **易于扩展**：支持自定义数据源、产品列表、主题等
- 🌏 **开源免费**：代码完全开源，欢迎Star与Fork

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 配置 AllTick API Token

1. 注册 AllTick 账号： https://www.alltick.co
2. 登录后前往控制台获取您的 API Token。
3. 打开项目根目录下的 .env 文件，将 API_TOKEN 设置为您的 Token：
    ```
    API_TOKEN=你的 AllTick Token
    ```
    ⚠️ 未配置有效 Token 时，行情接口将无法正常拉取数据。

### 启动开发服务器

```
npm run dev
```

浏览器访问 http://localhost:3000 查看效果。

### 生产环境构建

```
npm run build
npm run start
```

## 目录结构

```
├── config/           # 产品列表配置
├── pages/            # Next.js 页面与 API 接口
├── section/          # TradingView 图表核心组件
├── public/           # 静态资源
├── .env              # 环境变量（API_TOKEN 配置）
└── README.md         # 项目说明文档
```

## 常见问题

- API_TOKEN 无法获取？
    - 请前往 AllTick 官网注册并登录，在用户中心获取。
- 行情数据拉取失败？
    - 请检查 .env 文件中的 API_TOKEN 是否填写正确。
- 如何自定义产品列表？
    - 修改 config/symbols.ts 文件，按需增删品种。

## 官网与 API 文档

- AllTick 官网： https://www.alltick.co
- API 文档入口：登录后在用户中心查看
