---
title: 异步编程之async-await
date: 2018-02-09 19:57:21
categories: javascript
tags: 异步编程
---

<https://segmentfault.com/a/1190000007535316>

<http://www.ruanyifeng.com/blog/2015/05/async.html>

`一.用法：`

```
async function getStockPriceByName(name) {
  const symbol = await getStockSymbol(name);
  const stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

getStockPriceByName('goog').then(function (result) {
  console.log(result);
});
```



上面代码是一个获取股票报价的函数，函数前面的async关键字，表明该函数内部有异步操作。调用async函数时，会立即返回一个Promise对象。

```
function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}
asyncPrint('hello world', 50);
```



上面代码指定50毫秒以后，输出"hello world"

`二.理解`

（1）async 是“异步”的简写，而 await 可以认为是 async wait 的简写。所以应该很好理解 async 用于申明一个 function 是异步的，而 await 用于等待一个异步方法执行完成。await 只能出现在 async 函数中。

（2）async 函数（包含函数语句、函数表达式、Lambda表达式）会返回一个 Promise 对象，如果在函数中 `return` 一个直接量，async 会把这个直接量通过 `Promise.resolve()` 封装成 Promise 对象。

（3）async 函数返回的是一个 Promise 对象，我们当然应该用原来的方式：`then()`链来处理这个 Promise 对象，如例1.

（4）await在等啥？  一般来说，await函数等待的是一个异步操作的结果。但是，await函数不仅仅用于等 Promise 对象，它可以等任意表达式的结果。所以，await 后面实际是可以接普通函数调用或者直接量的。所以下面这个示例完全可以正确运行

```
function getSomething() {

    return "something";

}

async function testAsync() {

    return Promise.resolve("hello async");

}

async function test() {

    const v1 = await getSomething();

    const v2 = await testAsync();

    console.log(v1, v2);

}

test();

```



（5）await等到了要等的值，然后呢？await 等到了它要等的东西，一个 Promise 对象，或者其它值，然后呢？我不得不先说，`await` 是个运算符，用于组成表达式，await 表达式的运算结果取决于它等的东西。

如果它等到的不是一个 Promise 对象，那 await 表达式的运算结果就是它等到的东西。

如果它等到的是一个 Promise 对象，await 就忙起来了，它会阻塞后面的代码，等着 Promise 对象 resolve，然后得到 resolve 的值，作为 await 表达式的运算结果。

三. 注意点：

1.await命令后面的promise对象，运行结果可能是reject，所以最好把await命令放在try…catch中。

```javascript
async function myFunction() {
  try {
    await somethingThatReturnsAPromise();
  } catch (err) {
    console.log(err);
  }
}

// 另一种写法

async function myFunction() {
  await somethingThatReturnsAPromise()
  .catch(function (err) {
    console.log(err);
  });
}
```



2.多个`await`命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。

```
let foo = await getFoo();
let bar = await getBar();
```

上面代码中，`getFoo`和`getBar`是两个独立的异步操作（即互不依赖），被写成继发关系。这样比较耗时，因为只有`getFoo`完成以后，才会执行`getBar`，完全可以让它们同时触发。

```
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()]);

// 写法二
let fooPromise = getFoo();
let barPromise = getBar();
let foo = await fooPromise;
let bar = await barPromise;
```

上面两种写法，`getFoo`和`getBar`都是同时触发，这样就会缩短程序的执行时间。