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

    return symbolList.find((item) => {
        return (
            (typeof product.symbol === 'string' && item.symbol === product.symbol) ||
            (typeof product.ticker === 'string' && item.ticker === product.ticker)
        )
    })
}

export function getInitialSymbolInfo(storage: SymbolStorage | null = getBrowserStorage()): Product {
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
