---
title: css三栏布局的几种实现方法
date: 2018-04-12 10:30:39
tags:
categories: css
---

需求：css三栏布局，左右两边宽度固定，中间宽度自适应。

1 淘宝的双飞翼布局。关键点，三栏都是float：left；中间栏设置两层，外层向左浮动，设置宽度为100%，内层设置margin：0，-100px；左栏设置左浮动，``margin：-100%`` ; 右栏设置左浮动，``margin：-100px``

```
<html>
    <body>
        <div class="col-main">
            <div class="main-wrap">dddd</div>
        </div>
        <div class="col-left"></div>
        <div class="col-right"></div>
    </body>
</html>
<style>
    .col-main {
        width: 100%;
        height: 100%;
        float: left;
    }
    .main-wrap {
        margin-left: 110px;
        margin-right: 110px;
        height: 100%;
        background: green;
    }
    .col-left {
        float: left;
        width: 100px;
        height: 100%;
        margin-left: -100%;
        background: red;
    }
    .col-right {
        float: left;
        width: 100px;
        height: 100%;
        margin-left: -100px;
        background: pink;
    }
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>
```

2 左栏左浮动，右栏右浮动，中间栏处于文档流占满整行，通过margin为负值给两边留出距离。注意三个栏目的放置顺序：先放置浮动元素，再放置文档流元素。如果先放置文档流元素，那么浮动元素会换行，而先放置浮动元素，再放置文档流元素则不会换行。

```
<html>
    <body>
        <div class="col-left"></div>
        <div class="col-right"></div>
        <div class="col-main">
                dddd
        </div>
    </body>
</html>
<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    .col-main {
        margin: 0 110px;
        height: 100px;
        background: green;
    }
    .col-left {
        float: left;
        width: 100px;
        height: 100px;
        background: red;
    }
    .col-right {
        float: right;
        width: 100px;
        height: 100px;
        background: pink;
    }
</style>
```

3 另外一种是position：absolute的定位

```
<html>
    <body>
        <div class="wrapper">
            <div class="col-main">
                    dddd
            </div>
            <div class="col-left">
            </div>
            <div class="col-right">
            </div>
        </div>
        
    </body>
</html>
<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    .wrapper {
        position: relative;
    }
    .col-main {
        margin: 0 110px;
        height: 100px;
        background: green;
    }
    .col-left {
        position: absolute;
        left: 0;
        top: 0;
        width: 100px;
        height: 100px;
        background: red;
    }
    .col-right {
        position: absolute;
        right: 0;
        top: 0;
        width: 100px;
        height: 100px;
        background: pink;
    }
</style>
```

4 还有一种display：flex的布局

```
<html>
    <body>
        <div class="wrapper">
            <div class="col-left">
            </div>
            <div class="col-main">
                    dddd
            </div>
            <div class="col-right">
            </div>
        </div>
        
    </body>
</html>
<style>
    html, body {
        height: 100%;
        margin: 0;
        padding: 0;
    }
    .wrapper {
        display: flex;
        flex-wrap: nowrap;
    }
    .col-main {
        flex-grow: 1;
        margin: 0 10px;
        height: 100px;
        background: green;
    }
    .col-left {
        width: 100px;
        height: 100px;
        background: red;
    }
    .col-right {
        width: 100px;
        height: 100px;
        background: pink;
    }
</style>
```

