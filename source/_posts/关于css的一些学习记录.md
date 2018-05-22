---
title: 关于css的一些学习记录
date: 2018-03-18 16:20:00
tags:
categories: css
---

#### 1.单行文本溢出(部分浏览器需要加上高度)

```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

#### 2.多行文本溢出

```css
overflow : hidden;
text-overflow: ellipsis;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
```

上面方法合适WebKit浏览器或移动端（绝大部分是WebKit内核的）浏览器。

其他浏览器解决方案：

目前没有什么CSS的属性可以直接控制多行文本的省略显示，比较靠谱的办法应该就是利用相对定位在最后面加上一个省略号了，代码可以参考下面

```
p {
    position:relative;
    line-height:1.5em;
    /* 高度为需要显示的行数*行高，比如这里我们显示两行，则为3 */
    height:3em;
    overflow:hidden;
}
p:after {
    content:"...";
    position:absolute;
    bottom:0;
    right:0;
    padding: 0 5px;
    background-color: #fff;
}
```

不过这样会有一点问题：

1）需要知道显示的行数并设置行高才行；

2）IE6/7不支持`after`和`content`，需要添加一个标签来代替；

3）省略号的背景颜色跟文本背景颜色一样，并且可能会遮住部分文字，建议可以使用渐变的png背景图片代替。

#### 3. 纯css实现容器高度随着宽度等比例变化

1）利用一个隐藏图片来实现

假如你想要容器的宽高比是4：3，那就选一个宽高比正好是4：3的图片，把这个图片放到容器里。设置图片宽度100%，高度auto，那么图片会把这个容器撑开，正好撑开到4：3。然后可以隐藏这个图片。

```
 #container {
    width: 100%;
  }
  .attr {
    background-color: #008b57;
  }
  .attr img{
    width: 100%;
    height: auto;
  }
  </style>
<div id='container'>
  <div class='attr'>
    <img src="1.png" alt="">
  </div>
</div>
```

如果你觉得增加img标签多发了http请求，那么你可以把图片变成base64格式，由于我们的图片没有实际显示作用，我们可以大胆压缩。所以既没有http请求，还可以让图片很小。

2)可以利用css3的calc函数.(利用第二种情况来实现)

第一种情况 ``position:absolute``

如果元素是position：absolute的话，那么百分比基准是相对他父级元素中第一个position：relative元素的宽和高为基准的。

比如position：relative元素的width为200px，height为100px

那么position：absolute元素里

```Css
width：calc(10%)  // 20px
height: calc(10%) // 10px
```

第二种情况 ``普通文档流中元素``

这种情况元素的宽和高的百分比基准都是父元素的宽度。

比如一个div的父元素宽度是200px，高度是100px.

这个div设置

```
width：calc(10%)  // 20px
height: calc(10%) // 20px
```

3）使用padding-bottom实现

padding-bottom属性值百分比是按照父容器宽度来计算的，所以所以这里我们设置容器宽度为父容器的50%；padding-bottom也为50%；就都是父容器宽度的50%；显示出来就是一个完美的正方形了

```
<style type="text/css">
#container {
    width: 80%;
    height: 500px;
}

.attr {
    width: 50%;
    height: 0;
    padding-bottom: 50%;
    background-color: #008b57;
}
</style>

<div id='container'>
    <div class='attr'></div>
</div>
```
#### 4. 行高

1）line-height的含义

```
line-height:26px; 表示行高为26个像素
line-heigth:120%;表示行高为元素本身字体大小font-size的120%(如果自身没有设置font-size，那就				是父容器的font-size，因为font-size也和line-height一样也有继承)
line-height:2.6em; 表示行高为元素字体大小font-size的2.6倍
line-height:2.6;表示行高为当前字体大小的2.6倍
```

2）line-height的继承性

 （a）带单位的行高继承的是计算值（em，%）都算是单位。

​	如父元素的字体大小为14px，定义行高line-height:2em;则计算值为 28px，不会因其子元素改变字		体尺寸而改变行高。(例如：父元素14px，子元素12px,那么行高就是28px，子元素虽然字体是12px，行高还是父元素的行高)

（b）不带单位的行高是直接继承（数字），比如父容器line-height：2，那么子元素line-hieght也是2。

​	如父元素字体尺寸为14px，行高line-height:2;子元素字体为12px，不需要再定义行高，他默认的行高为24px。（例如：子元素12px，他的行高是24px,不会继承父元素的28px）

例子：

````Css
<style>
    .haorooms_bfb{font-size:14px;line-height: 150%; background: green;padding:10px}
    .haorooms_nodw{font-size:14px;line-height: 1.5; background: green;padding:10px}
    .haorooms_children{font-size:26px;background: red}
</style>

<div class="haorooms_bfb">
    <div class="haorooms_children">行高测试</div>
</div>

<br/><br/>

<div class="haorooms_nodw">
    <div class="haorooms_children">行高测试</div>
</div>
// 有百分比的haorooms_children 继承了父级元素14*1.5=21px
// 没有百分比，不带单位的是自己的1.5倍，也就是26*1.5=39px;
````

####  5.图片在容器里水平垂直居中

```Css
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
margin: auto; // 这个是关键点
```

适用场景：图片比容器小。

如果图片比容器大，则只会进行上下居中，左右不会居中。并且图片不会进行缩放，如果想要缩放，请自行设置`` height: 100%`` 或者`` width: 100%``

#### 6. 层叠顺序

![](/image/stacking-order.png)

