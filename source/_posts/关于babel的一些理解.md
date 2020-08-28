---
title: 关于babel的一些理解
date: 2018-12-12 14:27:03
tags: 前端
catogories: javascript
---

### 一. 为什么要使用babel

由于有些浏览器不支持es6+ 语法，而我们在写代码的时候又希望能使用es6语法，享受其带来的简单方便。这时候我们需要babel来对我们的代码进行转换，将es6+ 语法转换成es5语法，让浏览器能识别。

### 二. 什么是babel

babel是一个转译器，感觉相对于编译器compiler，叫转译器transpiler更准确，因为它只是把同种语言的高版本规则翻译成低版本规则，而不像编译器那样，输出的是另一种更低级的语言代码。

(1) babel的编译过程可以分成三个步骤：

- The parser: [`@babel/parser`](https://github.com/babel/babel/blob/master/packages/babel-parser) (解析：将代码转换成AST)
- The transformer[s]: All the plugins/presets （转换：访问AST节点进行转换生成新的AST）
  - These all use [`@babel/traverse`](https://github.com/babel/babel/blob/master/packages/babel-traverse) to traverse through the AST
- The generator: [`@babel/generator`](https://github.com/babel/babel/blob/master/packages/babel-generator) （生成：以新的AST为基础生成代码）

(2) babel工作流：input string -> `@babel/parser` parser -> `AST` -> transformer[s] -> `AST` -> `@babel/generator` -> output string

(3) babel包的构成：

##### 核心包

1. babel-core： babel转译器本身，提供了babel的转译API，如babel.transform等，用于对代码进行转译。像webpack的babel-loader就是调用这些API来完成转译过程的。
2. babel-parser：babel的词法解析器
3. babel-traverse：用于对AST抽象语法树的遍历，主要给plugin用
4. babel-generator：根据AST生成代码

##### 工具包

1. babel-cli：babel的命令工具，通过命令对js代码进行转译
2. babel-register：通过修改nodejs的require来自动转译require引用的js代码文件

##### 功能包

1. babel-type: 用于检验，构建和改变AST树的节点
2. babel-template：辅助函数，用于从字符串形式的代码来构建AST树的节点
3. babel-helpers: 一系列预制的babel-template函数，英语提供给一些plugins用
4. babel-code-frames：用于生成错误信息，指出错误位置
5. **babel-plugin-xxx**：bable转译过程中用到的插件。其中babel-plugin-transform-xxx是transform步骤中使用到的
6. **babel-preset-xxx**：transform阶段使用到的一系列plugin
7. **babel-polyfill**：js标准新增的原生对象和API的shim，实现上仅仅是对**core-js**和**gennerator-runtime**两个包的封装
8. **babel-runtime**：功能类似于babel-polyfill，一般用于library或plugin中，因为他不会污染全局作用域

preset其实就是一些plugin的集合

### 三. polyfill和runtime

由于babel默认只是转译新标准引入的语法，比如ES6的箭头函数转译成ES5的函数；而**新标准引入的新的原生对象，部分原生对象新增的原型方法，新增的API（如**Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise等全局对象**等）**以及一些定义在全局对象上的方法（比如Object.assign**)，这些babel是不会转译的。需要用户自行引入polyfill来解决**

引入垫片（polyfill）有几种方式，其中他们各有优缺点：

**方法一：使用babel-polyfill**

​	1. 先安装包： npm install --save babel-polyfill

​	2. 要确保**在入口处导入polyfill**，因为polyfill代码需要在所有其他代码前先被调用
​	代码方式： `import "babel-polyfill"`
​	或者webpack配置： `module.exports = { entry: ["babel-polyfill", "./app/js"] };`

优点：引入之后可以放心使用es6语法，他对所有的方法都进行了polyfill

缺点：这种方式是改变的全局作用域，也就是说污染了全局（比如在Array的prototype上添加includes方法等）

打出来的包也会比较大。



**方法二：使用transform-runtime**

让重复定义变成重复引用，解决babel代码重复问题

babel-plugin-transform-runtime插件依赖babel-runtime，babel-runtime是真正提供runtime环境的包；也就是说transform-runtime插件是把js代码中使用到的新原生对象和静态方法转换成对runtime实现包的引用，举个例子如下：

```
// 输入的ES6代码
var sym = Symbol();
// 通过transform-runtime转换后的ES5+runtime代码 
var _symbol = require("babel-runtime/core-js/symbol"); 
// 另外，这里我们也可以隐约发现，babel-runtime其实也不是真正的实现代码所在，真正的代码实现是在core-js中
var sym = (0, _symbol.default)();
```

优点：从上面这个例子可见，原本代码中使用的ES6新原生对象Symbol被transform-runtime插件转换成了babel-runtime的实现，既保持了Symbol的功能，同时又没有像polyfill那样污染全局环境（因为最终生成的代码中，并没有对Symbol的引用）

缺点：但是由于他不能污染全局环境，所以对于实例上的方法则无法使用，比如[].includes()

不过对于有些类上的静态方法可以使用，比如Array.from方法



**方法三：使用babel-preset-env插件**

这款preset能灵活决定加载哪些插件和polyfill，不过还是得开发者手动进行一些配置。

```
// cnpm install -D babel-preset -env
{
    "presets": [
        ["env", {
            "targets": { //指定要转译到哪个环境
                //浏览器环境
                "browsers": ["last 2 versions", "safari >= 7"],
                //node环境
                "node": "6.10", //"current"  使用当前版本的node
                
            },
             //是否将ES6的模块化语法转译成其他类型
             //参数："amd" | "umd" | "systemjs" | "commonjs" | false，默认为'commonjs'
            "modules": 'commonjs',
            //是否进行debug操作，会在控制台打印出所有插件中的log，已经插件的版本
            "debug": false,
            //强制开启某些模块，默认为[]
            "include": ["transform-es2015-arrow-functions"],
            //禁用某些模块，默认为[]
            "exclude": ["transform-es2015-for-of"],
            //是否自动引入polyfill，开启此选项必须保证已经安装了babel-polyfill
            //参数：Boolean，默认为false.
            "useBuiltIns": false
        }]
    ]
}
```

关于最后一个参数`useBuiltIns`，有两点必须要注意：

1. 如果useBuiltIns为true，项目中必须引入babel-polyfill。
2. babel-polyfill只能被引入一次，如果多次引入会造成全局作用域的冲突。

### 四. core-js介绍

core-js包才上述的babel-polyfill、babel-plugin-transform-runtime、bable-runtime的核心，因为polyfill和runtime其实都只是对core-js和regenerator的再封装，方便使用而已。

但是polyfill和runtime都是整体引入的，不能做细粒度的调整，如果我们的代码只是用到了小部分ES6而导致需要使用polyfill和runtime的话，会造成代码体积不必要的增大（runtime的影响较小）。所以，按需引入的需求就自然而然产生了，这个时候就得依靠core-js来实现了。

#### core-js的组织结构

首先，core-js有三种使用方式：

- 默认方式：require('core-js')
  这种方式包括全部特性，标准的和非标准的

- 库的形式： var core = require('core-js/library')
  这种方式也包括全部特性，只是它不会污染全局名字空间

  **注意文件路径里面有library的就代表是用于类库，不会污染全局作用域的**

  **默认方式和库的形式一个是直接require让其执行而对全局产生影响，另一个是对执行结果赋值（里面的代码不对全局产生影响，只导出一个结果让外部使用）**

- 只是shim： require('core-js/shim')或var shim = require('core-js/library/shim')
  这种方式只包括标准特性（就是只有polyfill功能，没有扩展的特性）

#### core-js的按需使用

1、类似polyfill，直接把特性添加到全局环境，这种方式体验最完整

```
require('core-js/fn/set');
require('core-js/fn/array/from');
require('core-js/fn/array/find-index');

Array.from(new Set([1, 2, 3, 2, 1])); // => [1, 2, 3]
[1, 2, NaN, 3, 4].findIndex(isNaN);   // => 2

```

2、类似runtime一样，以库的形式来使用特性，这种方式不会污染全局名字空间，但是不能使用实例方法

```
var Set       = require('core-js/library/fn/set');
var from      = require('core-js/library/fn/array/from');
var findIndex = require('core-js/library/fn/array/find-index');

from(new Set([1, 2, 3, 2, 1]));      // => [1, 2, 3]
findIndex([1, 2, NaN, 3, 4], isNaN); // => 2
```

所以，我理解的babel-polyfill这个包对core-js的引用方式应该是第一种，而babel-runtime对core-js的引用方式是第二种

###总结：babel的难点在于理解polyfill，runtime和core-js，通过本文理解清楚三者之间的关系和区别



babel-polyfill 与 babel-runtime 的一大区别:  前者改造目标浏览器，让你的浏览器拥有本来不支持的特性；后者改造你的代码，让你的代码能在所有目标浏览器上运行，但不改造浏览器。

[参考链接](https://www.jianshu.com/p/3b27dfc6785c)