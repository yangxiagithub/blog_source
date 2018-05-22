---
title: node之require顺序
date: 2018-03-05 14:01:19
tags:
categories: node
---

#### require的加载顺序

[源码](https://github.com/nodejs/node/blob/v5.x/lib/module.js#L142:8)

总体流程：

![](/image/nodejs-require.jpg)

###### 一：首先解析文件名字：（如果是核心模块名字，则直接返回，如果不是，则进行下面流程）

1. 先从缓存中读取，如果没有则继续往下

2. 判断模块路径是否是以“/”结尾，如果不是，则要判断：

   a. 检查是否是一个文件，如果是，则转换为真实路径

   b. 否则如果是一个目录，则调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename。

   c. 如果没有读到路径上的文件，则通过tryExtension方法尝试在该路径后依次加上.js, .json和.node后缀，判断是否存在，若存在则返回加上后缀后的路径。

3. 如果依然不存在，则同样调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename

4. 如果依然不存在，则尝试在该路径后依次加上index.js，index.json和index.node，判断是否存在，若存在则返回拼接后的路径

5. 若解析成功，则把解析得到的文件名cache起来，下次require就不用再次解析了，否则若解析失败，则返回false

###### 二：通过文件名字加载模块

1.如果是文件名字对应的模块在缓存中，则直接从缓存读取。

2.否则通过文件名新建模块并加载模块，并且将模块进行缓存。



