module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true
    },
    extends: ['plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/recommended-requiring-type-checking'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'import', 'prefer-arrow'],
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/ban-types': 'error',
        '@typescript-eslint/class-name-casing': 'error',
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit'
            }
        ],
        '@typescript-eslint/indent': [
            'error',
            4,
            {
                ArrayExpression: 'first',
                ObjectExpression: 'first',
                SwitchCase: 1
            }
        ],
        '@typescript-eslint/interface-name-prefix': ['error', { prefixWithI: 'always' }],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'semi',
                    requireLast: true
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false
                }
            }
        ],
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/promise-function-async': 'error',
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/unbound-method': 'error',
        '@typescript-eslint/unified-signatures': 'error',
        'arrow-parens': ['error', 'as-needed'],
        'camelcase': 'error',
        'comma-dangle': 'error',
        'complexity': 'off',
        'constructor-super': 'error',
        'dot-notation': 'off',
        'eol-last': 'error',
        'eqeqeq': ['error', 'always'],
        'guard-for-in': 'error',
        'id-match': 'error',
        'no-return-await': 'error',
        'import/no-deprecated': 'error',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: false
            }
        ],
        'import/order': 'error',
        'linebreak-style': ['error', 'unix'],
        'max-classes-per-file': 'off',
        'max-len': [
            'error',
            {
                code: 120
            }
        ],
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'error',
        'no-debugger': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-fallthrough': 'off',
        'no-invalid-this': 'error',
        'no-new-wrappers': 'error',
        'no-sequences': 'error',
        'no-shadow': [
            'error',
            {
                hoist: 'all'
            }
        ],
        'no-template-curly-in-string': 'error',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'error',
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': ['error', 'never'],
        'prefer-const': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        'prefer-template': 'error',
        'radix': 'off',
        'spaced-comment': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'off',
        'yoda': 'error',
        'quotes': [
            'error',
            'single',
            {
                avoidEscape: true
            }
        ]
    }
};
