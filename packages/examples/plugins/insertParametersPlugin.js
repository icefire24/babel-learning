const targetStr=['log','info','error','debug'].map(item=>`console.${item}`)
module.exports =function(api) {
    return {
    visitor: {
        CallExpression(path, state) {
            //TAG return为什么要加这个判断？？？新加入节点无loc信息，会报错
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
                  //TAG path.skip()为什么要加这个判断？？？
                  path.skip();
              } else {
                  path.insertBefore(newNode);
              }
          }
      }
      }
    }
}