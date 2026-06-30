import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
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

const { getChartResolution } = loadTsModule('section/TradingChart/TVChartContainer/utils.ts', {
    dayjs: require('dayjs'),
})

assert.equal(getChartResolution(null), '1', 'missing widget should fall back to 1-minute resolution')
assert.equal(getChartResolution({}), '1', 'widget without activeChart should fall back to 1-minute resolution')
assert.equal(
    getChartResolution({ activeChart: () => undefined }),
    '1',
    'widget without an active chart should fall back to 1-minute resolution',
)
assert.equal(
    getChartResolution({ activeChart: () => ({ resolution: () => '15' }) }),
    '15',
    'ready widget should return active chart resolution',
)
