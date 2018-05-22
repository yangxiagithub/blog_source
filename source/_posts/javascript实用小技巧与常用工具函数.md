---
title: javascript实用小技巧与常用工具函数
date: 2018-03-18 16:19:38
tags:
categories: 'javascript'
---

##### 一. 实用小技巧

1. 对小数取整

常规的对小数取整的方法有parseInt(1.2)，Math.floor(1.2),  Math.ceil(-1.2), Math.round(1.6)

新学的方法：

```javascript
var a = 3.2;
var b = a | 0; // b 为 3 
var a = -3.2;
var b = a | 0; // b 为 3

var c = a >> 0 // c 为 3
```

2. 精确到某一位小数

```
2.345toFiexed(2) 
99.456001.toPrecision(5)
```

缺点：结果会变成字符串类型

3. 两个！！可以快速转换为bool型数据

 undefined, null, 0, false, NaN, ' '

这些数据前面加上!!都会转换为false

4. ~按位取反:  可以理解为取反之后再减1

   ```javascript
   var a = 'abc';
   var arr = ['abc', 'aaa'];
   if (~arr.indexOf(a)) {
       // 如果arr.indexOf(a) === -1 则 ~arr.indexOf(a) === 0
       alert('数组中不包含abc');
   }
   ```

   ```
   var a = 1, b = -1, c = 0, d = 3, e = -3;
   ~a // -2
   ~b // 0
   ~c // -1
   ~d // -4
   ~e // 2
   ```

##### 二. 常用工具函数

1.以下JS函数用于获取url参数:

```
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}
```

使用:

```
url实例：http://www.runoob.com/index.php?id=1&image=awesome.jpg
调用 getQueryVariable("id") 返回 1。
调用 getQueryVariable("image") 返回 "awesome.jpg"。
```

2. 简易版节流函数：**前面的如果没有结束，本次绑定就不生效**。

   ```javascript
   function throttle (delay, action) {
       var last = 0;
       return function () {
           var current = new Date();
           if (current - last > delay) {
               action.apply(this, arguments);
               last = current;
           }
       }
   }
   ```

3. 简易版防抖函数：**让前面的绑定失效，从这次开始计时**。

```javascript
function debounce (idle, action) {
    var last;
    return function () {
        var ctx = this, arg = arguments;
        clearTimeout(last);
        last = setTimeout(function () {
            action.apply(ctx, arg);
        }, idle);
    }
}
```

