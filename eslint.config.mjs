import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        // 关闭document不能加载css
        '@next/next/no-css-tags': 'off',
        'no-new-native-nonconstructor': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        // 关闭禁止直接使用类型断言
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'no-param-reassign': 'off',
        // 是否自动闭合单标签
        // 'react/self-closing-comp': 'off',
        // 根据箭头函数的复杂度决定是否省略大括号和 return 语句，例如 (x) => x * 2 可以省略，但 (x) => { return x * x; } 不可以省略。
        'arrow-body-style': ['warn', 'as-needed'],
        'react/no-unstable-nested-components': 'off',
    },
]

export default eslintConfig
