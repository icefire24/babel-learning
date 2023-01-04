const { transformFileSync } = require("@babel/core");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const fs = require("fs");
const path = require("path");
let str=` //鹰眼地图
d.prototype.loadIfcMap = function (contain) {
  let floorInfo = this.getIfcFloorsInfo();
  this.isolateAndCenter([floorInfo[2].floorNode]);
  this.generateIfcMinMap(floorInfo[2], 300, 300, true, { stroke: "#000", hover: "#f381817d" });
};


/**获取模型的楼层信息(适用ifc模型)*/
d.prototype.getIfcFloorsInfo = function () {
  var _genericStoreyType = "IFCBUILDINGSTOREY";
  var _ifcFloorTypes = new Set(["IFCSLAB"]);
  var _ifcSpaceTypes = new Set(["IFCSPACE"]);
  var _ifcFloorplanCreationTypes = new Set(["IFCWALL", "IFCWALLSTANDARDCASE", "IFCCURTAINWALL", "IFCSLAB", "IFCCOLUMN"]);
  var storyFloor = this.hwv.getModel().getNodesByGenericType(_genericStoreyType);
  var floorPlanInfo = [];
  for (var c of storyFloor) {
    var a = [],
      d = [],
      k = [];
    floorPlanInfo.push({
      floorNode: c,
      floorName: this.hwv.getModel().getNodeName(c),
      floorplanMeshCreationNodes: this.generateIfcDescendNode(c, _ifcFloorplanCreationTypes, k),
      slabNodes: this.generateIfcDescendNode(c, _ifcFloorTypes, a),
      spaceNodes: this.generateIfcDescendNode(c, _ifcSpaceTypes, d),
    });
  }
  return floorPlanInfo;
};
d.prototype.generateIfcDescendNode = function (b, c, f) {
  var a = 0;
  for (b = this.hwv.getModel().getNodeChildren(b); a < b.length; a++) {
    var d = b[a],
      k = this.hwv.getModel().getNodeGenericType(d);
    null !== k && c.has(k) && f.push(d);
    this.generateIfcDescendNode(d, c, f);
  }
  return f;
};
/**生成指定楼层鹰眼地图(适用ifc模型)*/
d.prototype.generateIfcMinMap = function (floor, w, h, highlight, style) {
  if (!floor || !w || !h || typeof w !== "number" || typeof h !== "number" || typeof highlight !== "boolean" || typeof style !== "object") return -1;
  var self = this;
  var nodeList = [floor.floorNode];
  var promiseList = [self.hwv.getModel().getNodesBounding([floor.floorNode])];
  floor.floorplanMeshCreationNodes.forEach((id) => {
    nodeList.push(id);
    promiseList.push(self.hwv.getModel().getNodesBounding([id]));
  });
  floor.slabNodes.forEach((id) => {
    nodeList.push(id);
    promiseList.push(self.hwv.getModel().getNodesBounding([id]));
  });
  floor.spaceNodes.forEach((id) => {
    nodeList.push(id);
    promiseList.push(self.hwv.getModel().getNodesBounding([id]));
  });
  Promise.all(promiseList).then((list) => {
    let floorArray = [];
    list.forEach((item, i) => {
      if (item.max.x - item.min.x > 2 && item.max.y - item.min.y > 2) {
        floorArray.push({
          id: nodeList[i],
          b: item,
          w: item.max.x - item.min.x,
          h: item.max.y - item.min.y,
        });
      }
    });
    // self.createMinMap(id, floorArray, w, h, highlight, style);
    self.createCvanvasMap(floorArray, w, h, highlight, style);
  });
};`
let str2=fs.readFileSync(path.join(__dirname, "railbox-test.js"), "utf-8")
const ast = parser.parse(
    str,
  {
    sourceType: "unambiguous",
  }
);
let file={};
traverse(ast, {
    ExpressionStatement(path, state) {
      if (path.node.leadingComments) {

          path.traverse({
              AssignmentExpression(_path) {

                file[path.node.expression.left.property.name] =
                  path.node.leadingComments[0].value;
                }
            })
        }
    },
});
console.log(file);
