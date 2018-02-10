---
title: 异步编程之generator
date: 2018-02-09 18:04:55
tags: 异步编程
categories: javascript
---

#### 前言

异步编程系列的几篇博客借鉴于阮一峰老师的《ECMAScript 6 入门》：[链接地址](http://es6.ruanyifeng.com/#docs/generator-async)

由于javascript是单线程，所以异步编程非常重要。

异步编程的几种方式：

1. 回调函数
2. 事件监听
3. 发布/订阅
4. promise 对象
5. generator
6. async await

现在我们主要介绍的是第五种，generator的方式

#### 一. 写法

```
function* gen(x) {
  var y = yield x + 2;
  return y;
}

var g = gen(1);
g.next() // { value: 3, done: false }
g.next() // { value: undefined, done: true }`
```

普通函数在调用之后就能得到返回结果，而generator函数不一样，他返回的是一个遍历器对象，需要调用遍历器的next函数，才能继续往下执行，所以next方法的作用是分阶段执行generator函数。每次执行g.next()得到一个对象，代表当前阶段的信息。对象的 `value`属性是yield命令后面表达式的值，表示当前阶段的值；`done`属性是一个bool值，表示genenrator函数是否执行完毕。

#### 二. 让generator自动执行

generator函数需要手动调用next函数来执行下一步，很不方便，我们需要想办法让它自动执行，

第一个方法是thunk函数，第二个方法是co模块。

##### thunk

(1)  thunk是将函数替换成一个接受回调函数作为参数的单参数函数。(感觉很像currify)

````
// 正常版本的readFile（多参数版本）
fs.readFile(fileName, callback);

// Thunk版本的readFile（单参数版本）
var Thunk = function (fileName) {
  return function (callback) {
    return fs.readFile(fileName, callback);
  };
};

var readFileThunk = Thunk(fileName);
readFileThunk(callback);
````

任何函数，只要参数有回调函数，就能写成 Thunk 函数的形式。下面是一个简单的 Thunk 函数转换器。

```
// ES5版本
var Thunk = function(fn){
  return function (){
    var args = Array.prototype.slice.call(arguments);
    return function (callback){
      args.push(callback);
      return fn.apply(this, args);
    }
  };
};

// ES6版本
const Thunk = function(fn) {
  return function (...args) {
    return function (callback) {
      return fn.call(this, ...args, callback);
    }
  };
};
```

使用上面的转换器，生成`fs.readFile`的 Thunk 函数.

```
var readFileThunk = Thunk(fs.readFile);
readFileThunk(fileA)(callback);
```

(2)  thunk 怎样实现generator的自执行

在同步情况下，下面的代码就可以实现generator的自执行

```
function* gen() {
  // ...
}

var g = gen();
var res = g.next();

while(!res.done){
  console.log(res.value);
  res = g.next();
}
```

但是，这不适合于异步。如果需要保证上一步执行完，才能执行下一步，上面的代码执行异步操作就会出问题。这时，thunk就可以派上用场。以读取文件为例子。

```
var fs = require('fs');
var thunkify = require('thunkify');
var readFileThunk = thunkify(fs.readFile);

var gen = function* (){
  var r1 = yield readFileThunk('/etc/fstab');
  console.log(r1.toString());
  var r2 = yield readFileThunk('/etc/shells');
  console.log(r2.toString());
};
```

要执行上面的generator函数，需要手动执行。为了便于理解，我们先看如何手动执行上面的generator

```
var g = gen();

var r1 = g.next();
r1.value(function (err, data) {
  if (err) throw err;
  var r2 = g.next(data);
  r2.value(function (err, data) {
    if (err) throw err;
    g.next(data);
  });
});
```

注意理解r1.value得到的是一个函数，这个函数需要接受一个回调函数才能真正执行读取文件的异步操作。

替代手动调用的方法是：使用thunk函数的自动流程管理

```
function run(fn) {
  var gen = fn();

  function next(err, data) {
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

function* g() {
  // ...
}

run(g);
```

只需要将generator函数作为参数传进run函数，就可以实现自动化。这个run函数，就是generator函数的自动执行器。(重点是result.value(next);这句).不管内部有多少个异步操作，直接把 Generator 函数传入`run`函数即可。当然，前提是每一个异步操作，都要是 Thunk 函数，也就是说，跟在`yield`命令后面的必须是 Thunk 函数。如下面例子：

```
var g = function* (){
  var f1 = yield readFileThunk('fileA');
  var f2 = yield readFileThunk('fileB');
  // ...
  var fn = yield readFileThunk('fileN');
};

run(g);
```

总结：thunk的实质还是利用了回调函数来解决异步问题。

##### co模块

































