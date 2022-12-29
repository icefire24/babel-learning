const babelParsers = require("prettier/parser-babel").parsers;
const typescriptParsers = require("prettier/parser-typescript").parsers;
const { types } = require("@babel/core");
const { default: generate } = require("@babel/generator");
const parser =require("@babel/parser");
const { default: traverse } = require("@babel/traverse");
const _ =require("lodash")
function myPreprocessor(code, options) {
  const { ast } = parser.parse(code, {
    plugins: ["jsx", "typescript"],
    sourceType: "module",
  })
  const imports = [];
  traverse(ast, {
    ImportDeclaration(path) { 
      imports.push(path.node)
      path.remove()
    }
  })
  const newImports = _.shuffle(imports)
  const newast = types.file({
    type: "Program",
    body:newImports
  })
  const newcode = generate(newast).code + "\n" + generate(ast, {
    retainLines: true,
  }).code
  return newcode;
}
//prettier插件,指定解析器的预处理器
module.exports = {
  parsers: {
    babel: {
      ...babelParsers.babel,
      //preprocess: 预处理器，prettier会在解析代码之前(parser之前)调用这个函数，可以在这里做一些代码的预处理,
      preprocess: myPreprocessor,
    },
    typescript: {
      ...typescriptParsers.typescript,
      preprocess: myPreprocessor,
    },
  },
};
