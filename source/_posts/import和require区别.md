---
title: import和require区别
date: 2018-07-16 11:54:54
tags: 
catagories: javascript
---

#### 一. import 得到的变量是只读的，require得到的变量可以修改。

1. Import

```
// a.js
const a = 1;
setTimeout(() => {
    console.log('在a文件里', a);
}, 1000);
export {
    a
}
```

```
// test.js
import { a } from './a';  
console.log('a======111', a);
a = 3;
console.log('a=====222', a);
```

运行之后会得到：**"a" is read-only**

2. require

```
// test.js
let a = require('./a');
console.log('a======', a);
a = 3;
console.log('a', a);
```

运行之后得到：

```
a====== { a: 1 }
a 3
在a文件里 1
```

只修改了test.js里面的数据

#### 二. import 会进行提升，Import are hoisted。Require不会。

比如这个例子：

```
// a.js
global.log = (str) => console.log(str);
import './b';

// b.js
global.log('hello world');
```

由于 import 被提升所以这个例子会报 log undefined，用 babel 转义一下会得到：

```
// a.js

'use strict';

require('./b');

global.log = function (str) {

  return console.log(str);

};

// b.js

'use strict';

global.log('hello world');
```

#### 三. import静态编译，import的地址不能通过计算。require就可以。

例如 const url = "a" + "b";

Import url 直接报错了

require(url)不会报错

所以require都会用在动态加载的时候。

#### 四. require 输出的是一个值的拷贝：

#### (如果是基本类型，则得到的是一个值，如果是对象，则得到的是一个地址的引用)

#### export 模块输出的是值的引用：

#### (给module.exports上的每一个属性比如'name'，定义了一个属性描述对象Object.defineProperty(exports, 'name', { enumerable: true, get: getter }，属性描述对象有一个getter，所以每次获取这个属性的时候其实都执行了函数getter，而不是像require对应的输出一样每次使用的都是缓存值)

参考资料：http://es6.ruanyifeng.com/#docs/module-loader#ES6-%E6%A8%A1%E5%9D%97%E4%B8%8E-CommonJS-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82

1️⃣rquire会对引入进来的数据进行缓存

在test.js里面require(''./a')之后再修改a则只会修改a文件内的数据，（如果a是导出一个对象，则都会修改，因为是地址引用，test和a所指向的是一个内存。如果a导出的是基本数据类型，则test里面拥有的是一个副本，也就是前面说的对数据做缓存）

2️⃣import之后对数据做修改会同时影响test和a里面的数据

注意不能 import a from 'a'; a = 1;

上面已经说了import 是只读的。

但是  import a from 'a';      a.theProp = 1;  是可以的，因为这并没有改a的引用地址，只是加一个属性

#### 五. require和import 对于 a文件都是只执行一次

```
// a.js
function a() {
    console.log('aaaa');
}
const instance = new a();
module.exports = instance;
```

```
// b.js
function a() {
    console.log('aaaa');
}
const instance = new a();
module.exports = instance;
```

```
// test.js
require('./a');
require('./b');
```

babel-node test.js 

运行结果   aaaa

说明a文件只执行一次。

在爱这个方面import 和require都是一样的，a文件都是只执行一次。

#### 注意：

其实一个文件就是对应一个module对象，module对象里面有个属性是module.exports.

每个文件在最终都会变成一个函数的执行体，这个函数有三个入参：

module, module.exports, webpack_require

(1)在commonjs（也就是上面说的require）模块里，有两种导出方式：

1. module.exports = {a: 1, b:2}

2. exports.a = 1; exports.b = 2;

   这两种是完全等价的。之所以不能写成exports = {a:1, b:2}是因为exports作为形参传进来之后，如果执行的是exports = {a:1, b:2z}这样的赋值语句，是不会改变传入的实参的。而我们的目的是改变传入的实参，所以需要写成上面的两种方式之一，这两种方式都是可以改变实参的。

require的时候可以直接拿到module.exports的值，然后再分别取出里面的属性。

（2）在ES（也就是上面说的import）模块里，有很多种导出方式:

```
const a = {a1: 1; a2: 2};
```

1. export { a }; // 在module.exports 上定义一个a属性,属性值是a;

   import  { a } ;

2. exports const a = a；// 在module.exports 上定义一个a属性,属性值是a;

   Import { a };

3. exports default a; // 在module.exports 上定义一个default属性, 属性值是a；

   Import  a;

对上面3种情况进行解释： import  的时候，如果不是对象结构赋值的话（也就是{ a }），会默认是import default，就像第3种情况，import  a 会解析成import default as a，其实就是取出了module.exports的default属性。

现在假如这么写

```
// a.js
export { a };
```

```javascript
// index.js
import a from './a'; // a 得到的值是undefined。因为这句话会被解析成
// import default as a from './a'；
// 而我们在导出的时候是没有定义default的，只定义了a属性，所以会返回undefined.
// 在ES模块中，我们是没有办法获取到整个module.exports对象的，因为只要你写的不是对象解构赋值的形式，
// webpack 就会解析成default形式，所以要拿到整个module.exports对象，需要这样写：
// import * as Req from './ajax.js'; 这样取得的Req就是整个module导出的对象。【他是一个Module类的
// 实例】
// 而在commonjs模块里面直接require('./ajax.js')能拿到module.exports对象，【他是没经过处理的原对象】
```

