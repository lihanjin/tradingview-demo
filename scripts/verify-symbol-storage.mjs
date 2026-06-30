import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadTsModule(relativePath, requireMap = {}) {
    const filePath = path.join(rootDir, relativePath)
    const source = readFileSync(filePath, 'utf8')
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            esModuleInterop: true,
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
        },
    })

    const module = { exports: {} }
    const context = {
        exports: module.exports,
        module,
        require(id) {
            if (Object.hasOwn(requireMap, id)) {
                return requireMap[id]
            }

            throw new Error(`Unexpected runtime import while loading ${relativePath}: ${id}`)
        },
    }

    vm.runInNewContext(outputText, context, { filename: filePath })

    return module.exports
}

function createStorage(initialValues = {}) {
    const values = new Map(Object.entries(initialValues))

    return {
        getItem(key) {
            return values.has(key) ? values.get(key) : null
        },
        setItem(key, value) {
            values.set(key, value)
        },
    }
}

const { symbolList } = loadTsModule('config/symbols.ts')
const { CURRENT_SYMBOL_INFO_STORAGE_KEY, getInitialSymbolInfo, persistCurrentSymbolInfo } = loadTsModule(
    'section/TradingChart/TVChartContainer/symbolStorage.ts',
    {
        '@/config/symbols': { symbolList },
    },
)

const staleStoredAluminum = JSON.stringify({
    symbol: 'XALUSD',
    full_name: 'XALUSD',
    description: 'XALUSD',
    ticker: 'XALUSD',
    type: 'metal',
    exchange: 'AllTick',
})

const aluminumStorage = createStorage({
    [CURRENT_SYMBOL_INFO_STORAGE_KEY]: staleStoredAluminum,
})
const aluminum = getInitialSymbolInfo(aluminumStorage)

assert.equal(aluminum.symbol, 'XALUSD', 'refresh should restore the previously selected display symbol')
assert.equal(aluminum.ticker, 'Aluminum', 'refresh should use the latest AllTick ticker for restored symbols')

const invalidStorage = createStorage({
    [CURRENT_SYMBOL_INFO_STORAGE_KEY]: '{bad json',
})
assert.equal(
    getInitialSymbolInfo(invalidStorage).symbol,
    symbolList[0].symbol,
    'invalid stored product data should fall back to the default symbol',
)

const unknownStorage = createStorage({
    [CURRENT_SYMBOL_INFO_STORAGE_KEY]: JSON.stringify({ symbol: 'UNKNOWN', ticker: 'UNKNOWN' }),
})
assert.equal(
    getInitialSymbolInfo(unknownStorage).symbol,
    symbolList[0].symbol,
    'unknown stored symbols should fall back to the default symbol',
)

const writeStorage = createStorage()
const btc = symbolList.find((item) => item.symbol === 'BTC/USDT')
assert.ok(btc, 'BTC/USDT should exist for storage write verification')

persistCurrentSymbolInfo(btc, writeStorage)
assert.equal(
    JSON.parse(writeStorage.getItem(CURRENT_SYMBOL_INFO_STORAGE_KEY)).symbol,
    'BTC/USDT',
    'selected product should be persisted for the next refresh',
)
