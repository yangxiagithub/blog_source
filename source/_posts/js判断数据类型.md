---
title: js判断数据类型
date: 2018-12-07 11:00:43
tags: 前端
categories: javascript
---

Js判断数据类型一般用的方法有：typeof     Object.prototype.toString  instance     

1. typeof 用来判断基本数据类型.

   返回值包括: boolean, number, string , function , undefined, object, symbol

   ```
   typeof true ;  typeof Boolean(true) // "boolean"
   typeof 4 ;     typeof Number (4)    // "number"
   typeof 'abc'   typeof String('abc') // "string"
   typeof (function a(){})             // "function" 
   typeof undefined                    // "undefined"
   typeof null ; typeof {} ; typeof {a: 1} //"object"
   typeof Symbol(1)                    //"symbol" 
   ```

   可以使用如下函数判断是否是基本类型：

   ```
   export function isPrimitive {
     return (
       typeof value === 'string' ||
       typeof value === 'number' ||
       typeof value === 'symbol' ||
       typeof value === 'boolean'
     )
   }
   ```

   注意，所有new出来的对象返回都是'object'。 

   ```
   typeof(new Number(1))  // "object"
   ```

2. 当用typeof 判断出类型不是基本类型(即返回object时)，用Object.prototype.toString判断对象构造函数。

   可以使用如下函数：

   （返回function 和 undefined也可以判断出值得类型了）

   ```
   // 判断是否是一个对象(包括用其他构造函数生成的对象)
   export function isObject(obj) {
     return obj !== null && typeof obj === 'object'
   }
   ```

   ```
   // 判断对象是否是纯对象(也就是构造函数是Object)
   export function isPlainObject(obj) {
     return Object.prototype.toString.call(obj) === '[object Object]'
   }
   ```

   使用：

   ```
   const test = {a: 1};
   const date = new Date();
   isObject(test)  // true
   isObject(date)  // true
   isPlainObject(test)  // true
   isPlainObject(date)  // false
   ```

3. 如上面的date对象，得到isPlainObject(date)为false ，可以用instanceof 判断date是否是某个构造函数的实例

   ```
   date instance Date // true
   ```

   或者使用下面代码来获取某个实例的构造函数是什么

   ```
   date.constructor.name // "Date"
   ```

   ​