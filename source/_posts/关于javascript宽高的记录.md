---
title: 关于javascript宽高的记录
date: 2018-12-10 15:07:54
tags:
catogories: javascript
---

| client类                                              | offset类                                                     | scroll类                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| clientWidth:  **元素尺寸** (注意不是内容尺寸)+内边距  | offsetWidth:  **元素尺寸**+内边距+边框                       | scrollWidth: **元素尺寸** + 内边距 + **内容**超出元素尺寸和内边距的部分 |
| clientHeight：**元素尺寸** (注意不是内容尺寸)+内边距  | offsetHeight: **元素尺寸**+内边距+边框                       | scrollHeight: **元素尺寸** + 内边距 + **内容**超出元素尺寸和内边距的部分 |
| clientLeft: border-left的宽度，也就是 border-left厚度 | offsetLeft: 定位祖先元素的**外padding**到当前元素的**外border**之间的距离 | scrollLeft: 当元素内容超过元素尺寸的时候，内容被卷起来的宽度，可以理解为滚动条的宽度   **可读可写** |
| clientTop: border-top的宽度，也就是border-top厚度     | offsetTop:定位祖先元素的**外padding**到当前元素的**外border**之间的距离 | scrollTop: 当元素内容超过元素尺寸的时候， 内容被卷起来的高度，可以理解为滚动条的高度     **可读可写** |

1. 获取**元素距离视口的坐标**：getBoundingClientRect方法，返回的坐标包括元素的边框和内边距，**不包括外边距**。

2. 获取**元素距离文档的坐标**：

   ```
   function getElePos(ele){
           var x = 0,y = 0 ;
           while(ele != null ){
               x += ele.offsetLeft;
               y += ele.offsetTop;
               ele = ele.offsetParent;
               console.log(ele);
           }
           return {x : x ,y: y }
       }
   ```

3. 获取**视口的大小**，也就是窗口的大小：

```
function getClient(){
  return {
  	width : window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
  	height : window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight
	 }
  }
```
4. 获取**文档滚动高度**，也就是窗口滚动条高度

```
function getSCroll(){
    return {
      left : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      top : window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
        }
    }
```

