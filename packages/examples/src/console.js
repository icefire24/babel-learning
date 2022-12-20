const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;
const types = require('@babel/types');
const template = require('@babel/template').default;
const sourceCode = `
    console.log(1);
let a=<div>{console.error(4)}</div>
    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;
const targetStr=['log','info','error','debug'].map(item=>`console.${item}`)
console.log('targetStr: ', targetStr);
const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins:['jsx']
})
traverse(ast, {
  CallExpression(path, state) {
    if (path.node.isNew) {
        return;
    }
    const calleeName = generator(path.node.callee).code;
     if (targetStr.includes(calleeName)) {
        const { line, column } = path.node.loc.start;

        const newNode = template.expression(`console.log("filename: (${line}, ${column})")`)();
        newNode.isNew = true;

        if (path.findParent(path => path.isJSXElement())) {
            path.replaceWith(types.arrayExpression([newNode, path.node]))
            path.skip();
        } else {
            path.insertBefore(newNode);
        }
    }
}
})
const { code,map } = generator(ast)
console.log(code)