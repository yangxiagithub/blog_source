---
title: css 3D 动画
date: 2018-06-03 10:33:34
tags: 动画
catagories: css
---

#### 一. css 3D动画基本知识

##### 1. 坐标系

![](/image/css-coordinate.png)

注意：旋转的时候，都是以顺时针方向为正

##### 2. 重要属性

1️⃣  ``perspective: 300px``

`perspective` 属性指定了观察者与 **z=0**  平面的距离，使具有三维位置变换的元素产生透视效果。

当为元素定义 perspective 属性时，其子元素会获得透视效果，而不是元素本身。

目前浏览器都不支持 perspective 属性。Chrome 和 Safari 支持替代的 -webkit-perspective 属性。

2️⃣   ``perspective-origin: 30% 30%``

``perspective-origin`` 表示你眼睛看的位置，默认就是所看舞台或元素的中心（即50%， 50%）

一般我们需要将元素置于舞台中间，否则所看到的就不是元素的正前方了。

3️⃣  `` transform-style: preserve-3d``

一般而言，该声明应用在3D变换的兄弟元素们的父元素上，也就是舞台元素。

perspective属性和 transform-style属性最好不要申明在同一级。应该让perspective申明在外层，transform-style申明在下一层，否则无法让包含所有3D元素的最外层div作为一个整体去旋转，而只能让每一个单独的3D元素旋转。（据说safari上即使申明在不同层也无法整体旋转？）

4️⃣  ``transform-origin: 50% 40% 30%``

更改一个元素变形的原点。默认元素变形中心点是元素自身中心点，如果手动进行设置，则是相对于元素左上角位置。

注意区分perspective-origin和transform-origin。perspective-origin是指观看视角相对于整个舞台的位置，它只有2个值（x轴位置和y轴位置），z轴距离通过perspective的值来确定。transform-origin是设置元素自身转换时候的中心点，它有3个值（x，y，z三轴的位置）。

4️⃣  ``backface-visibility:hidden``

是否可以看见3D元素的背面，默认情况下是可以看见，但是在现实世界中，元素的背面是无法看见的，所以一般我们设置成hidden。

#### 二. 动画 demo

##### 1. 旋转的八面体

```
<html>
    <div class="box">
        <div class="wrapper">
            <div class="block block1">11111</div>
            <div class="block block2">22222</div>
            <div class="block block3">3333</div>
            <div class="block block4">4444</div>
            <div class="block block5">5555</div>
            <div class="block block6">6666</div>
            <div class="block block7">7777</div>
            <div class="block block8">8888</div>
        </div>
    </div>
</html>
<style>
    .box {
        perspective: 800px;
    }
    .wrapper {
        margin: 300px;
        width: 200px;
        height: 200px;
        transform-style: preserve-3d;
        animation: blockRotate 5s infinite 1s;
    }
    .block {
        position: absolute;
        top: 0px;
        width: 100%;
        height: 100%;
        transition: transform 0.2s;
    }
    .block1 {
        transform: rotateY(0) translateZ(241.4px);
        background: red;
    }
    .block2 {
        transform: rotateY(45deg) translateZ(241.4px);
         background: pink;
    }
    .block3 {
        transform: rotateY(90deg) translateZ(241.4px);
        background: yellow;
    }
    .block4 {
        transform: rotateY(135deg) translateZ(241.4px);
        background: #565656;
    }
    .block5 {
        transform: rotateY(180deg) translateZ(241.4px);
        background: green;
    }
    .block6 {
        transform: rotateY(225deg) translateZ(241.4px);
        background: blue;
    }
    .block7 {
        transform: rotateY(270deg) translateZ(241.4px);
        background: purple;
    }
    .block8 {
        transform: rotateY(315deg) translateZ(241.4px);
        background: #778833;
    }
    @keyframes blockRotate {
        to {
           transform: rotateY(360deg);
        }
    }
```

注意：先rotate 再 translate 和 先translate 再 rotate得到的结果不一样。因为rotate会改变元素的坐标系的方向。尝试将上面 

```css
.block2 {
    transform: rotateY(45deg) translateZ(241.4px);
    background: pink;
}
// 将上面的改成下面的代码，两者结果不一样
.block2 {
    transform: translateZ(241.4px）rotateY(45deg);
    background: pink;
}
```