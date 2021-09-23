module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: [],

  rules: {
    "prettier/prettier": "error", // 标注prettier验证
    "no-param-reassign": 0, // 禁止参数变量重新分配 0 off 1 warning 2 error
    "no-async-promise-executor": 0, // 禁止Promise的callback使用async function 0 off 1 warning 2 error
    "class-methods-use-this": 0, // 类方法必须使用this 0 off 1 warning 2 error
    "consistent-return": 0, // 总是有返回值 0 off 1 warning 2 error
    "no-unused-vars": 1, // 禁止出现未使用过的变量 0 off 1 warning 2 error
    "no-shadow": 0, // 禁止声明跟外部作用域同名变量 0 off 1 warning 2 error
    "no-console": 0, // 禁止console 0 off 1 warning 2 error
    "import/extensions": 1, // 禁止扩展名检测 0 off 1 warning 2 error
    "import/no-unresolved": [2, { ignore: ["^@/"] }], // import检测,禁用webpack的alias 0 off 1 warning 2 error
  },
};
