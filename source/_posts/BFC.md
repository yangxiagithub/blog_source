---
title: BFC
date: 2018-05-04 19:57:31
tags: 前端
categories: css
---

定义：BFC:  块级格式化上下文，他决定了块级元素如何对他的内容进行布局，以及与其他元素关系及相对关系。BFC里面的元素与外面的元素不会发生影响。  

1⃣️触发BFC的方式（一下任意一条就可以）

​       1.float的值不为none

​        2.overflow的值不为visible

​        3.display的值为table-cell、tabble-caption和inline-block之一

​        4.position的值不为static或者releative中的任何一个（即为absolute或fixed）

2⃣️BFC布局与普通文档流布局的区别：

普通文档流布局规则：

​	A.浮动元素不会被父元素计算高度。

​	B.浮动元素会覆盖非浮动元素的位置。

​	C.margin会传递给父级。

​	D.相邻元素margin会重叠。

BFC布局规则：

​	A.浮动元素会被父级元素计算高度。（父级触发BFC）	

​	B.浮动元素不会覆盖非浮动元素位置。（非浮动元素触发BFC）

​	C.margin 不会传递给父级。（父级触发BFC）

​	D.相邻元素margin不会重叠（给其中一个元素增加一个父级，让他的父级触发BFC）