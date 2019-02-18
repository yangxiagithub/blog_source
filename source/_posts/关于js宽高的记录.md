---
title: 关于js宽高的记录
date: 2018-09-13 19:01:41
tags: 
categories: javascript
---

| client类                                              | offset类                                                     | scroll类                                                     |
| ----------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| clientWidth:  **元素尺寸** (注意不是内容尺寸)+内边距  | offsetWidth:  **元素尺寸**+内边距+边框                       | scrollWidth: **元素尺寸** + 内边距 + **内容**超出元素尺寸和内边距的部分 |
| clientHeight：**元素尺寸** (注意不是内容尺寸)+内边距  | offsetHeight: **元素尺寸**+内边距+边框                       | scrollHeight: **元素尺寸** + 内边距 + **内容**超出元素尺寸和内边距的部分 |
| clientLeft: border-left的宽度，也就是 border-left厚度 | offsetLeft: 定位祖先元素的**外padding**到当前元素的**外border**之间的距离 | scrollLeft: 当元素内容超过元素尺寸的时候，内容被卷起来的宽度，可以理解为滚动条的宽度   **可读可写** |
| clientTop: border-top的宽度，也就是border-top厚度     | offsetTop:定位祖先元素的**外padding**到当前元素的**外border**之间的距离 | scrollTop: 当元素内容超过元素尺寸的时候， 内容被卷起来的高度，可以理解为滚动条的高度     **可读可写** |



1. 获取**元素距离视口的坐标**：getBoundingClientRect方法，返回的坐标包括元素的边框和内边距，**不包括外边距**。
2. 获取**元素距离文档的坐标**：
3. 获取**视口的大小**，也就是窗口的大小：

```javascript
function getViewPortSize(w) {
	var w = w || window;
	if (w.innerWidth != null)
	return { w: w.innerWidth, h: w.innerHeight };
	var d = w.document;
	if (document.compatMode == "CSS1Compat") 
    // 标准模式返回CSS1Compat，通过document.documentElement访问文档根元素
    // 混杂模式返回backcompat，通过documnet.body访问文档根元素
	return { w: d.documentElement.clientWidth, h: d.documentElement.clientHeight };
	return { w: d.body.clientWidth, h: d.body.clientHeight };
}
```

