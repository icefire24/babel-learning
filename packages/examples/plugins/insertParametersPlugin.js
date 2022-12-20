const targetStr=['log','info','error','debug'].map(item=>`console.${item}`)
module.exports =function(api) {
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