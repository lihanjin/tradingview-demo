import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(rootDir, 'config/symbols.ts')

function loadSymbolList() {
    const source = readFileSync(configPath, 'utf8')
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
            throw new Error(`Unexpected runtime import while loading symbols: ${id}`)
        },
    }

    vm.runInNewContext(outputText, context, { filename: configPath })

    return module.exports.symbolList
}

const symbolList = loadSymbolList()

assert.ok(Array.isArray(symbolList), 'symbolList should be exported as an array')

const expectedAllTickCodes = {
    XAGUSD: 'Silver',
    XALUSD: 'Aluminum',
    XPDUSD: 'Palladium',
    XPTUSD: 'Platinum',
    XNIUSD: 'Nickel',
    XPBUSD: 'Lead',
    XZNUSD: 'Zinc',
}

for (const [displaySymbol, allTickCode] of Object.entries(expectedAllTickCodes)) {
    const product = symbolList.find((item) => item.symbol === displaySymbol)

    assert.ok(product, `${displaySymbol} should be present in symbolList`)
    assert.equal(product.ticker, allTickCode, `${displaySymbol} should request AllTick code ${allTickCode}`)
    assert.match(
        `${product.full_name} ${product.description}`,
        new RegExp(displaySymbol),
        `${displaySymbol} should remain visible in product metadata`,
    )
}

assert.equal(
    symbolList.find((item) => item.symbol === 'GOLD')?.ticker,
    'GOLD',
    'GOLD should keep its documented AllTick code',
)
assert.equal(
    symbolList.find((item) => item.symbol === 'COPPER')?.ticker,
    'COPPER',
    'COPPER should keep its documented AllTick code',
)
