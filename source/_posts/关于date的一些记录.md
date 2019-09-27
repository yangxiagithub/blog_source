---
title: 关于date的一些记录
date: 2018-08-09 18:52:11
tags: 前端
categories: javascript
---

#### 一. 关于GMT时间和UTC时间

1. GMT即「格林威治标准时间」(Greenwich Mean Time，简称G.M.T.)，指位于英国伦敦郊区的皇家格林威治天文台的标准时间，因为本初子午线被定义为通过那里的经线。然而由于地球的不规则自转，导致GMT时间有误差，因此目前已不被当作标准时间使用。

2. UTC比GMT来得更加精准。其误差值必须保持在0.9秒以内，若大于0.9秒则由位于巴黎的国际地球自转事务中央局发布闰秒，使UTC与地球自转周期一致。不过日常使用中，GMT与UTC的功能与精确度是没有差别的。

   协调世界时区会使用“Z”来表示

#### 二. 关于时间戳

Unix时间戳表示的是当前时间到1970年1月1日00:00:00 UTC对应的**秒数**。

javascript时间戳指的是1970年1月1日00:00:00 UTC对应的**毫秒数**。

#### 三. 时间数字字符串格式

1. RFC2822

   ```
   YYYY/MM/DD HH:MM:SS ± timezone(时区用4位数字表示)
   // eg 1992/02/12 12:23:22+0800
   ```

2. ISO 8601

   ```
   YYYY-MM-DDThh:mm:ss ± timezone(时区用HH:MM表示)
   1997-07-16T08:20:30Z
   // “Z”表示UTC标准时区，即"00:00",所以这里表示零时区的`1997年7月16日08时20分30秒`
   //转换成位于东八区的北京时间则为`1997年7月17日16时20分30秒`

   1997-07-16T19:20:30+01:00
   // 表示东一区的1997年7月16日19时20秒30分，转换成UTC标准时间的话是1997-07-16T18:20:30Z
   ```

#### 四. Date

1. 返回结果为字符串————— Date 构造函数 

   ① Date() 直接返回

   ```
   Date()
   // "Thu Aug 09 2018 19:09:07 GMT+0800 (中国标准时间)"
   // Date()直接返回当前时间字符串，不管参数是什么 
   ```

   ② new Date()

   而new Date()则是会根据参数来返回对应的值，无参数的时候，返回当前时间的字符串形式；有参数的时候返回参数所对应时间的字符串。

   new Date()对参数不管是格式还是内容都要求,且只返回字符串

   这里需要注意的是，**月份month参数，其计数方式从0开始，而天day参数，其计数方式从1开始**。

   ```
   new Date(); // 什么都不传
   //"Thu Aug 09 2018 19:09:07 GMT+0800 (中国标准时间)"
   new Date(1293879600000);  // 传时间戳
   new Date('2011-01-01T11:00:00') // 2011-01-01T11:00:00
   new Date('2011/01/01 11:00:00') // 2011/01/01 11:00:00
   new Date('jan 01 2011,11 11:00:00')
   new Date('Sat Jan 01 2011 11:00:00')

   // 代表年、月、日、小时、分钟、秒、毫秒
   new Date(2013, 0, 1, 0, 0, 0, 0)

   // 所有能被Date.parse()方法解析的字符串，都可以当作参数。
   new Date('2013-2-15')
   new Date('2013/2/15')
   new Date('02/15/2013')
   new Date('2013-FEB-15')
   new Date('FEB, 15, 2013')
   new Date('FEB 15, 2013')
   new Date('Feberuary, 15, 2013')
   new Date('Feberuary 15, 2013')
   new Date('15 Feb 2013')
   new Date('15, Feberuary, 2013')
   ```

   ```
   // Invalid Date
   new Date('sss');
   new Date('2011/01/01T11:00:00');
   new Date('2011-01-01-11:00:00')
   new Date('1293879600000');
   ```

2. 返回结果为时间戳

​      ① new Date().getTime()

​      ② new Date().valueOf()

​      ③ Date.UTC()

```
// 参数代表 年、月、日、时、分、秒、毫秒
console.log(Date.UTC(1970));//NaN
console.log(Date.UTC(1970,0));//0
console.log(Date.UTC(1970,0,2));//86400000
console.log(Date.UTC(1970,0,1,1));//3600000
console.log(Date.UTC(1970,0,1,1,59));//714000
console.log(Date.UTC(1970,0,1,1,59,30));//717000
```

​    ④ Date.parse()

​	上面new Date()里面有 Date.parse()使用案例

3. 时间对象操作

   ① get类 

   ```
   getTime()：返回实例距离1970年1月1日00:00:00的毫秒数，等同于valueOf方法。
   getDate()：返回实例对象对应每个月的几号（从1开始）。
   getDay()：返回星期几，星期日为0，星期一为1，以此类推。
   getYear()：返回距离1900的年数。
   getFullYear()：返回四位的年份。
   getMonth()：返回月份（0表示1月，11表示12月）。
   getHours()：返回小时（0-23）。
   getMilliseconds()：返回毫秒（0-999）。
   getMinutes()：返回分钟（0-59）。
   getSeconds()：返回秒（0-59）。
   getTimezoneOffset()：返回当前时间与 UTC 的时区差异，以分钟表示，返回结果考虑到了夏令时因素。
   ```

   ② set类

   ```
   setDate(date)：设置实例对象对应的每个月的几号（1-31），返回改变后毫秒时间戳。
   setYear(year): 设置距离1900年的年数。
   setFullYear(year [, month, date])：设置四位年份。
   setHours(hour [, min, sec, ms])：设置小时（0-23）。
   setMilliseconds()：设置毫秒（0-999）。
   setMinutes(min [, sec, ms])：设置分钟（0-59）。
   setMonth(month [, date])：设置月份（0-11）。
   setSeconds(sec [, ms])：设置秒（0-59）。
   setTime(milliseconds)：设置毫秒时间戳。
   ```

   `set*`方法的参数都会自动折算。以`setDate`为例，如果参数超过当月的最大天数，则向下一个月顺延，如果参数是负数，表示从上个月的最后一天开始减去的天数

   ```
   var d = new Date ('January 6, 2013');

   d // Sun Jan 06 2013 00:00:00 GMT+0800 (CST)
   d.setDate(9) // 1357660800000
   d // Wed Jan 09 2013 00:00:00 GMT+0800 (CST)
   ```

   ```
   var d1 = new Date('January 6, 2013');

   d1.setDate(32) // 1359648000000
   d1 // Fri Feb 01 2013 00:00:00 GMT+0800 (CST)

   var d2 = new Date ('January 6, 2013');

   d.setDate(-1) // 1356796800000
   d // Sun Dec 30 2012 00:00:00 GMT+0800 (CST)
   ```

   ```Javascript
   // set类方法和get类方法，可以结合使用，得到相对时间。
   var d = new Date();

   // 将日期向后推1000天
   d.setDate(d.getDate() + 1000);
   // 将时间设为6小时后
   d.setHours(d.getHours() + 6);
   // 将年份设为去年
   d.setFullYear(d.getFullYear() - 1);
   ```

   [参考链接1](http://javascript.ruanyifeng.com/stdlib/date.html#toc4)       

​      [参考链接2](https://juejin.im/entry/5835b54cc4c9710054a6093c)

