---
title: javascript中的二进制
date: 2020-03-06 18:20:07
tags: javascript
---

**一.类型数组**

1. Javascript类型数组是什么：JavaScript类型化数组是一种类似数组的对象，并提供了一种用于访问原始二进制数据的机制。正如你可能已经知道，[Array](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Array) 存储的对象能动态增多和减少，并且可以存储任何JavaScript值。JavaScript引擎会做一些内部优化，以便对数组的操作可以很快。然而，随着Web应用程序变得越来越强大，尤其一些新增加的功能例如：音频视频编辑，访问WebSockets的原始数据等，很明显有些时候如果使用JavaScript代码可以快速方便地通过类型化数组来操作原始的二进制数据将会非常有帮助。
2. 类型化数组和普通数组：但是，不要把类型化数组与正常数组混淆，因为在类型数组上调用  [Array.isArray()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)  会返回false。此外，并不是所有可用于正常数组的方法都能被类型化数组所支持（如 push 和 pop）。
3. 缓冲和视图：
    缓冲：一个缓冲（由 [ArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 对象实现）描述的是一个数据块。缓冲没有格式可言，并且不提供机制访问其内容
    视图：为了访问在缓冲对象中包含的内存，你需要使用视图。视图提供了上下文 — 即数据类型、起始偏移量和元素数 — 将数据转换为实际有类型的数组。

![](/image/js-binary-1.png)

4. 缓冲(ArrayBuffer)

 [ArrayBuffer](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 是一种数据类型，用来表示一个通用的、固定长度的二进制数据缓冲区。你不能直接操纵一个ArrayBuffer中的内容；你需要创建一个类型化数组的视图或一个描述缓冲数据格式的[DataView](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView)，使用它们来读写缓冲区中的内容

5. 类型数组视图
    类型化数组视图具有自描述性的名字和所有常用的数值类型像Int8，Uint32，Float64 等等。有一种特殊类型的数组Uint8ClampedArray。它仅操作0到255之间的数值。例如，这对于[Canvas数据处理](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)非常有用。

![](/image/js-binary-2.png)

（1）这里可以说下 [Uint8ClampedArray](http://www.javascripture.com/Uint8ClampedArray) 和 [Uint8Array](http://www.javascripture.com/Uint8Array)的区别：就在于处理超出边界的值时有区别。
 [具体解析可以看stackoverflow链接](https://stackoverflow.com/questions/21819870/difference-between-uint8array-and-uint8clampedarray)

（2）用代码看看ArrayBuffer和类型数组

![](/image/js-binary-3.png)

（3）转换为普通数组

![](/image/js-binary-4.png)

6. 数据视图(DataView)
    [DataView](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView) 是一种底层接口，它提供有可以操作缓冲区中任意数据的读写接口。这对操作不同类型数据的场景很有帮助，例如：类型化数组视图都是运行在本地字节序模式(参考 [Endianness](https://developer.mozilla.org/zh-CN/docs/Glossary/Endianness))，可以通过使用 DataView 来控制字节序。默认是大端字节序(Big-endian)，但可以调用读写接口改为小端字节序(Little-endian)。

    

**二. Blob对象**

Blob: Binary Large Object 二进制类型的大对象

在Web中，Blob类型的对象表示不可变的类似文件对象的原始数据，通俗点说，Blob对象就是二进制数据，但它是类似文件对象的二进制数据，因此可以像操作File对象一样操作Blob对象，实际上，File继承自Blob
 （1）通过代码认识Blob

![](/image/js-binary-6.png)

![](/image/js-binary-7.png)

（2）从Blob中提取数据

![](/image/js-binary-8.png)

疑问：既然Blob有blob.arrayBuffer()方法来获取blob对象的ArrayBuffer，为啥还要使用FileReader？

回答：其实两个都可以获取到blob的arrayBuffer

**三.ReadableStream**

这部分可以直接看掘金文章：[从 Fetch 到 Streams —— 以流的角度处理网络请求](https://juejin.im/post/5e0013e1f265da33db49b17a)

 