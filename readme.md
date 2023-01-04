# babel-learning

### parser
const ast = parser.parse(sourceCode, {
  sourceType: 'unambiguous',
  plugins:['jsx']
})


### path
get(key) 获取某个属性的 path
set(key, node) 设置某个属性的值
getSibling(key) 获取某个下标的兄弟节点
getNextSibling() 获取下一个兄弟节点
getPrevSibling() 获取上一个兄弟节点
getAllPrevSiblings() 获取之前的所有兄弟节点
getAllNextSiblings() 获取之后的所有兄弟节点
find(callback) 从当前节点到根节点来查找节点（包括当前节点），调用 callback（传入 path）来决定是否终止查找
findParent(callback) 从当前节点到根节点来查找节点（不包括当前节点），调用 callback（传入 path）来决定是否终止查找
inList() 判断节点是否在数组中，如果 container 为数组，也就是有 listkey 的时候，返回 true
isXxx(opts) 判断当前节点是否是某个类型，可以传入属性和属性值进一步判断，比如path.isIdentifier({name: 'a'})
assertXxx(opts) 同 isXxx，但是不返回布尔值，而是抛出异常
insertBefore(nodes) 在之前插入节点，可以是单个节点或者节点数组
insertAfter(nodes) 在之后插入节点，可以是单个节点或者节点数组
replaceWith(replacement) 用某个节点替换当前节点
replaceWithMultiple(nodes) 用多个节点替换当前节点
replaceWithSourceString(replacement) 解析源码成 AST，然后替换当前节点
remove() 删除当前节点
traverse(visitor, state) 遍历当前节点的子节点，传入 visitor 和 state（state 是不同节点间传递数据的方式）
skip() 跳过当前节点的子节点的遍历
stop() 结束所有遍历
### 作用域 path.scope
scope 是作用域信息，javascript 中能生成作用域的就是模块、函数、块等，而且作用域之间会形成嵌套关系，也就是作用域链。babel 在遍历的过程中会生成作用域链保存在 path.scope 中。

scope.bindings 当前作用域内声明的所有变量
scope.block 生成作用域的 block，详见下文
scope.path 生成作用域的节点对应的 path
scope.references 所有 binding 的引用对应的 path，详见下文
scope.dump() 打印作用域链的所有 binding 到控制台
scope.parentBlock 父级作用域的 block
getAllBindings() 从当前作用域到根作用域的所有 binding 的合并
getBinding(name) 查找某个 binding，从当前作用域一直查找到根作用域
getOwnBinding(name) 从当前作用域查找 binding
parentHasBinding(name, noGlobals) 查找某个 binding，从父作用域查到根作用域，不包括当前作用域。可以通过 noGlobals 参数指定是否算上全局变量（比如console，不需要声明就可用），默认是 false
removeBinding(name) 删除某个 binding
hasBinding(name, noGlobals) 从当前作用域查找 binding，可以指定是否算上全局变量，默认是 false
moveBindingTo(name, scope) 把当前作用域中的某个 binding 移动到其他作用域
generateUid(name) 生成作用域内唯一的名字，根据 name 添加下划线，比如 name 为 a，会尝试生成 _a，如果被占用就会生成 __a，直到生成没有被使用的名字。
### scope.bindings、scope.references（重点）
作用域中保存的是声明的变量和对应的值，每一个声明叫做一个binding。
```javascript
const a = 1;
path.scope.bindings:
bindings: {
    a: {
        constant: true,
        constantViolations: [],
        identifier: {type: 'Identifier', ...}
        kind:'const',
        path: {node,...}
        referenced: false
        referencePaths: [],
        references: 0,
        scope: ...
    }
}
```
var、let、const 分别代表 var、let、const 形式声明的变量
param 代表参数的声明
module 代表 import 的变量的声明
binding 有多种 kind，代表变量是用不同的方式声明的。

binding.identifier 和 binding.path，分别代表标识符、整个声明语句。

声明之后的变量会被引用和修改，binding.referenced 代表声明的变量是否被引用，binding.constant 代表变量是否被修改过。如果被引用了，就可以通过 binding.referencePaths 拿到所有引用的语句的 path。如果被修改了，可以通过 binding.constViolations 拿到所有修改的语句的 path。




### types
生成字符串节点types.stringLiteral(string)
生成数组表达式types.arrayExpression([node,node])




### generator
const { code,map } = generator(ast)


### template
生成指定节点template.expression(expression)()

### traverse
traverse(ast,{
    nodetype(path.state){
        进行节点操作
    }
    enter(path, state) {
           console.log('enter>>>', path, state)
      },
     exit(path, state) {
           console.log('exit>>>', path, state)
      }

})


### core
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

### babel-plugin-tester 就是对比生成的代码的方式来实现的。

可以直接对比输入输出的字符串，也可以对比文件，还可以对比快照：
```javascript
import pluginTester from 'babel-plugin-tester';
import xxxPlugin from '../xxx-plugin';

pluginTester({
  plugin: xxxPlugin,
  fixtures: path.join(__dirname, '__fixtures__'), // 保存测试点的地方
  tests: {
    'case1:xxxxxx': '"hello";', // 输入输出都是同个字符串
    'case2:xxxxxx': { // 指定输入输出的字符串
      code: 'var hello = "hi";',
      output: 'var olleh = "hi";',
    },
    'case3:xxxxxx': { // 指定输入输出的文件，和真实输出对比
      fixture: 'changed.js',
      outputFixture: 'changed-output.js',
    },
    'case4:xxxxxx': { // 指定输入字符串，输出到快照文件中，对比测试
      code: `
        function sayHi(person) {
          return 'Hello ' + person + '!'
        }
      `,
      snapshot: true,
    },
  },
});
```
这三种方式本质上都一样，但是根据情况，如果比较少的内容可以直接对比字符串，内容比较多的时候可以使用快照测试，或者指定输出内容，然后对比测试。
### babel插件
```javascript
export default function(api, options, dirname) {
  return {
    inherits: parentPlugin,
    manipulateOptions(options, parserOptions) {
        options.xxx = '';
    },
    pre(file) {
      this.cache = new Map();
    },
    visitor: {
      StringLiteral(path, state) {
        this.cache.set(path.node.value, 1);
      }
    },
    post(file) {
      console.log(this.cache);
    }
  };
} 
```
首先，插件函数有 3 个参数，api、options、dirname。

api 里包含了各种 babel 的 api，比如 types、template 等，这些包就不用在插件里单独单独引入了，直接取来用就行。
options 就是外面传入的参数
dirname 是目录名（不常用）
返回的对象有 inherits、manipulateOptions、pre、visitor、post 等属性。

inherits 指定继承某个插件，和当前插件的 options 合并，通过 Object.assign 的方式。
visitor 指定 traverse 时调用的函数。
pre 和 post 分别在遍历前后调用，可以做一些插件调用前后的逻辑，比如可以往 file（表示文件的对象，在插件里面通过 state.file 拿到）中放一些东西，在遍历的过程中取出来。
manipulateOptions 用于修改 options，是在插件里面修改配置的方式，比如 syntaxt plugin一般都会修改 parser options： 
插件做的事情就是通过 api 拿到 types、template 等，通过 state.opts 拿到参数，然后通过 path 来修改 AST。可以通过 state 放一些遍历过程中共享的数据，通过 file 放一些整个插件都能访问到的一些数据，除了这两种之外，还可以通过 this 来传递本对象共享的数据。
### visitor模式
visitor 模式（访问者模式）是 23 种经典设计模式中的一种。visitor 模式的思想是：当被操作的对象结构比较稳定，而操作对象的逻辑经常变化的时候，通过分离逻辑和对象结构，使得他们能独立扩展。