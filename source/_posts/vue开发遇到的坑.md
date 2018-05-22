---
title: vue开发遇到的坑
date: 2018-02-28 15:02:16
tags:
categories: javascript
---

1. 设置组件的key时最好不要使用列表的index，而是设置一个独特的值，比如相关的id或者其他能保证独特性的值。

   ```
   <component-answer v-for="(answer, index) in answerList" :key="answer.ansid"></component-answer>
   ```

   最好不要像下面那样，用index作为key

   ```
   <component-answer v-for="(answer, index) in answerList" :key="index"></component-answer>
   ```

   上面代码是显示一个回答列表。如果只是作为页面显示组件的话，两种写法都可以。但是当我要去删除其中一个的时候，并且你在删除之后（或者之前）还进行另外的操作。

   ```javascript
   deleteAnswer: function (ansid) {
               this.answerList = this.answerList.filter(function (item) {
                   return item.ansid !== ansid;
               }.bind(this));
           },
   ```

   如果你使用index作为key，你会发现这些另外的操作所对应的this指向了你想删除的组件的下一个组件，从而影响了下一个组件。而使用特殊的id作为key则不会有这种副作用。

   比如，你想删除第一个组件，并且在删除第一个组件之前将第一个组件的opacity设为0，如果你使用index作为key，你会发现再删除第一个组件后，第二个组件的opacity变成了0。

   原因：由于删除了第一个组件之后，原来的第二个组件的key与被删除的第一个组件的key相同了，所以针对被删除组件的操作被运用到了第二个组件上，从而产生bug。

   总结：使用唯一而不可替代的值作为key，最好不要用index作为key。

2. ```javascript
   <div class="video_container" tabIndex="-1" @keydown="keydown">
   <div>
   ```

   **键盘事件只能在可以聚焦的元素上触发**（页面刚刚加载完成时，焦点处于`` document`` 元素上）。而普通div不是可获焦元素，所以如果你写成下面这样是无法捕获keydown事件的。

   ```
   <div class="video_container" @keydown="keydown">
   <div>
   ```

   **但是写上 `` tabIndex="-1"`` 之后，再调用focues方法**就可以获取焦点了，之后就可以捕捉到键盘事件了。

   下面我们来说一说javascript的焦点管理：

   ![链接]https://www.cnblogs.com/xiaohuochai/p/5874447.html

   （1）焦点元素

   默认情况下，只有表单元素可以获得焦点，因为只有表单元素可以交互。

   ```
   <input type="text" value="223">
   ```

   要让非表单元素获得焦点也是可以的，办法是先将该元素tabIndex属性设置为-1，再让该元素调用focus方法。

   **activeElement**

   document.activeElement属性用于管理焦点，保存着当前获得焦点的元素。但是IE不支持该属性。

   ```
   <div id="test" style="height:30px;width:100px;background:lightgreen">div</div>
   <button id="btn">div元素获得焦点</button>
   <script>
   console.log(document.activeElement);//<body>
   btn.onclick = function(){
       console.log(document.activeElement);//<button>
       test.tabIndex = -1;
       test.focus();    
       console.log(document.activeElement);//<div>
   }
   </script>
   ```

   (2)  获得焦点

   元素获得焦点有4种方法：页面加载，用户输入，focus()方法，autofocus属性

   **页面加载**：默认情况下，文档刚刚加载完成时，document.activeElement中保存的是body元素的引用。文档加载期间，document.activeElement的值为null

   **用户输入**：用户通常使用tab键移动焦点，使用空格键激活焦点。

   说到tab键，就不得不提tabIndex属性。tabIndex属性用来指定当前html元素是否被tab键遍历，默认值是0。

   ​

