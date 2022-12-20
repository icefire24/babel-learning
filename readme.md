#babel-learning

###parser
const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins:['jsx']
})


###path
获取路径属性值path.get(propername).toString()
跳过path.skip()





###types
生成字符串节点types.stringLiteral(string)
生成数组表达式types.arrayExpression([node,node])




###generator
const { code,map } = generator(ast)


###template
生成指定节点template.expression(expression)()

###traverse
traverse(ast,{
    nodetype(path.state){
        进行节点操作
    }
})


###core
将文件生成ast
```javascript
const { code,ast } = transformFileSync(path.join(__dirname, './sourceCode.js'), {
  plugins: [insertParametersPlugin],
  parserOpts: {
    sourceType: 'unambiguous',
    plugins: ['jsx'],
  },
})
```


###babel插件
```javascript
const targetStr=['log','info','error','debug'].map(item=>`console.${item}`)
module.exports =function(api,option) {
    return {
    visitor: {
        CallExpression(path, state) {
          if (path.node.isNew) {
              return;
          }
          const calleeName = path.get('callee').toString().trim();
           if (targetStr.includes(calleeName)) {
              const { line, column } = path.node.loc.start;
              const newNode =api.template.expression(`console.log("filename: (${line}, ${column})")`)();
              newNode.isNew = true;
      
              if (path.findParent(path => path.isJSXElement())) {
                  path.replaceWith(api.types.arrayExpression([newNode, path.node]))
                  path.skip();
              } else {
                  path.insertBefore(newNode);
              }
          }
      }
      }
    }
}
```