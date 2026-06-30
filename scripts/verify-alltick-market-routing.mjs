import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadTsModule(relativePath) {
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
            throw new Error(`Unexpected runtime import while loading ${relativePath}: ${id}`)
        },
    }

    vm.runInNewContext(outputText, context, { filename: filePath })

    return module.exports
}

const { ALLTICK_HTTP_BASE_URLS, ALLTICK_WS_BASE_URLS, getAllTickHttpApiBaseUrl, getAllTickWsApiBaseUrl, isAllTickStockMarket } =
    loadTsModule('config/alltickMarket.ts')

for (const stockType of ['us_stock', 'hk_stock', 'cn_stock']) {
    assert.equal(isAllTickStockMarket(stockType), true, `${stockType} should use the stock market endpoints`)
    assert.equal(
        getAllTickHttpApiBaseUrl(stockType),
        ALLTICK_HTTP_BASE_URLS.stock,
        `${stockType} HTTP requests should use quote-stock-b-api`,
    )
    assert.equal(
        getAllTickWsApiBaseUrl(stockType),
        ALLTICK_WS_BASE_URLS.stock,
        `${stockType} websocket requests should use quote-stock-b-ws-api`,
    )
}

for (const cfdType of ['index', 'forex', 'metal', 'crypto']) {
    assert.equal(isAllTickStockMarket(cfdType), false, `${cfdType} should use the quote-b endpoints`)
    assert.equal(getAllTickHttpApiBaseUrl(cfdType), ALLTICK_HTTP_BASE_URLS.other, `${cfdType} HTTP requests should use quote-b-api`)
    assert.equal(getAllTickWsApiBaseUrl(cfdType), ALLTICK_WS_BASE_URLS.other, `${cfdType} websocket requests should use quote-b-ws-api`)
}
