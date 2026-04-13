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
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            'no-new-native-nonconstructor': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/consistent-type-assertions': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-param-reassign': 'off',
            'react/self-closing-comp': 'off',
            'arrow-body-style': ['warn', 'as-needed'],
            'react/no-unstable-nested-components': 'off',
        },
    },
]

export default eslintConfig
