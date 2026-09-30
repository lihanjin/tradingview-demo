import type { Product } from '@/@types/global'
import { symbolList } from '@/config/symbols'

export const CURRENT_SYMBOL_INFO_STORAGE_KEY = 'currentSymbolInfo'

type SymbolStorage = Pick<Storage, 'getItem' | 'setItem'>

function getBrowserStorage(): SymbolStorage | null {
    if (typeof window === 'undefined') return null
    return window.localStorage
}

function findSymbolInfo(storedValue: unknown): Product | undefined {
    if (!storedValue || typeof storedValue !== 'object') return undefined

    const product = storedValue as Partial<Product>

    return symbolList.find(
        (item) =>
            (typeof product.symbol === 'string' && item.symbol === product.symbol) ||
            (typeof product.ticker === 'string' && item.ticker === product.ticker),
    )
}

/** 从图表入口参数中匹配受支持的代码；未知值不能进入 TradingView 数据源。 */
export function findLinkedSymbolInfo(symbol: string | null): Product | undefined {
    if (!symbol) return undefined
    return symbolList.find((item) => item.ticker === symbol || item.symbol === symbol)
}

/**
 * 选择入口指定的品种，否则恢复本地保存的选择。
 * @param storage - 浏览器存储；不可用时传 null。
 * @param linkedSymbol - 旧版链接的 symbol 查询参数，默认读取当前浏览器 URL。
 * @param pathname - 入口路径，默认读取浏览器路径；路径品种优先于查询参数。
 * @returns 支持的入口品种、本地保存的品种或目录默认品种。
 * @remarks 仅完整匹配目录中的品种；未知代码沿用本地选择及默认品种的回退逻辑。
 */
export function getInitialSymbolInfo(
    storage: SymbolStorage | null = getBrowserStorage(),
    linkedSymbol: string | null = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('symbol'),
    pathname: string = typeof window === 'undefined' ? '' : window.location.pathname,
): Product {
    /** /chart 下的单段品种代码；根路径入口继续使用原有查询参数。 */
    const pathSymbol = pathname.match(/^\/chart\/([^/]+)\/?$/)?.[1] ?? null
    /** 路径品种优先，未知代码不能进入行情数据源。 */
    const linkedProduct = findLinkedSymbolInfo(pathSymbol || linkedSymbol)
    if (linkedProduct) return linkedProduct
    if (!storage) return symbolList[0]

    try {
        const rawValue = storage.getItem(CURRENT_SYMBOL_INFO_STORAGE_KEY)
        const product = rawValue ? findSymbolInfo(JSON.parse(rawValue)) : undefined

        return product ?? symbolList[0]
    } catch {
        return symbolList[0]
    }
}

export function persistCurrentSymbolInfo(product: Product, storage: SymbolStorage | null = getBrowserStorage()) {
    try {
        storage?.setItem(CURRENT_SYMBOL_INFO_STORAGE_KEY, JSON.stringify(product))
    } catch {
        // Storage can be unavailable in private browsing or SSR-like environments.
    }
}
