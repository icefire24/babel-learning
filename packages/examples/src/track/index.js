const parser = require('@babel/parser')
const { transformFileSync, transformFromAstSync } = require('@babel/core')
const importModule = require('@babel/helper-module-imports')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const types = require('@babel/types')
const template = require('@babel/template').default
const fs = require('fs')
const path = require('path')
const ast = parser.parse(fs.readFileSync('./sourceCode.js', 'utf-8'), {
  sourceType: 'unambiguous',
})
traverse(ast, {
  Program(path, state) {
    //插入import语句
    importModule.addDefault(path, 'tracker', {
      nameHint: path.scope.generateUid('tracker'),
    })
  },
  ImportDeclaration(path, state) {
    const source = path.node.source.value
    //删除import语句
    if (source === 'aa') {
      path.remove()
    }
  },

  'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration'(path, state) {
    const bodyPath = path.get('body')
    if (bodyPath.isBlockStatement()) {
      // 有函数体就在开始插入埋点代码
      bodyPath.node.body.unshift(template.statement(`tracker.track()`)())
    } else {
      // 没有函数体要包裹一下，处理下返回值
      const ast = template.statement(`{${state.trackerImportId}();return PREV_BODY;}`)({ PREV_BODY: bodyPath.node })
      bodyPath.replaceWith(ast)
    }
  },
})
const { code } = transformFromAstSync(ast, {
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['jsx'],
  },
})
console.log(code)
