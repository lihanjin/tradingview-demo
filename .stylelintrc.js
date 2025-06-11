module.exports = {
    extends: ['stylelint-config-standard', 'stylelint-config-prettier', 'stylelint-config-recommended-scss'],
    plugins: ['stylelint-order'],
    overrides: [
        {
            files: ['**/*.(html|vue)'],
            customSyntax: 'postcss-html',
        },
    ],
    ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json'],
    rules: {
        indentation: 4,
        'font-family-no-missing-generic-family-keyword': null,
        'selector-class-pattern': null,
        'string-quotes': 'single',
        // 禁止空注释
        'comment-no-empty': true,
        // 要求在注释标签内有空白。
        'comment-whitespace-inside': 'always',
        // 要求在注释之前有空行。
        'comment-empty-line-before': 'always',

        // 禁止使用无效的十六进制颜色。
        'color-no-invalid-hex': true,
        // 指定十六进制颜色使用缩写。
        'color-hex-length': 'short',

        // 要求使用数字或命名的 (可能的情况下) font-weight 值。
        'font-weight-notation': 'numeric',

        // 禁止在 calc 函数内使用不加空格的操作符。
        'function-calc-no-unspaced-operator': true,
        // 要求 url 使用引号。
        'function-url-quotes': 'always',
        // 根据标准语法，禁止 linear-gradient() 中无效的方向值。
        'function-linear-gradient-no-nonstandard-direction': true,
        //禁止在简写属性中使用冗余值
        'shorthand-property-no-redundant-values': true,
        // 禁止值的浏览器引擎前缀
        'value-no-vendor-prefix': true,
        // property-no-vendor-prefix
        'property-no-vendor-prefix': true,
        // 禁止小于 1 的小数有一个前导零
        'number-leading-zero': 'never',
        // 禁止空第一行
        'no-empty-first-line': true,
        // 指定样式的排序
        'order/properties-order': [
            'position',
            'top',
            'right',
            'bottom',
            'left',
            'z-index',
            'display',
            'justify-content',
            'align-items',
            'float',
            'clear',
            'overflow',
            'overflow-x',
            'overflow-y',
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            'width',
            'min-width',
            'max-width',
            'height',
            'min-height',
            'max-height',
            'font-size',
            'font-family',
            'text-align',
            'text-justify',
            'text-indent',
            'text-overflow',
            'text-decoration',
            'white-space',
            'color',
            'background',
            'background-position',
            'background-repeat',
            'background-size',
            'background-color',
            'background-clip',
            'border',
            'border-style',
            'border-width',
            'border-color',
            'border-top-style',
            'border-top-width',
            'border-top-color',
            'border-right-style',
            'border-right-width',
            'border-right-color',
            'border-bottom-style',
            'border-bottom-width',
            'border-bottom-color',
            'border-left-style',
            'border-left-width',
            'border-left-color',
            'border-radius',
            'opacity',
            'filter',
            'list-style',
            'outline',
            'visibility',
            'box-shadow',
            'text-shadow',
            'resize',
            'transition',
        ],
    },
}
