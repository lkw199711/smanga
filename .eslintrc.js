module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": ["error"],
        'no-unused-labels':'off',
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["off"],
        '@typescript-eslint/no-explicit-any': ["off"],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        '@typescript-eslint/no-empty-function': ['off'],
    }
}
