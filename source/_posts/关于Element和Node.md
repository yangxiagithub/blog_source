---
title: 关于Element和Node
date: 2019-05-09 20:05:41
tags: 前端
---

#### 一. Element和Node的关系

EventTarget <=== Node <==== Elememt <==== HTMLElement <===== HTMLDivElement

上图显示的是继承关系，Node继承了EventTarget，Elememt继承了Node，等等。

由此可见Node是Element的父类。

Element的集合叫ElementCollection，Node的集合叫NodeList，他们都是类数组。

#### 二. 继承Node的还有哪些？

继承Node类的除了Element还有TextNode，CommentNode等等。

简单的说就是`Node`是一个基类，DOM中的`Element`，`Text`和`Comment`都继承于它。
换句话说，`Element`，`Text`和`Comment`是三种特殊的`Node`，它们分别叫做`ELEMENT_NODE`,
`TEXT_NODE`和`COMMENT_NODE`。

**所以我们平时使用的html上的元素，即Element是类型为ELEMENT_NODE的Node。**

Node实例node有一个属性是**nodeType**，node.nodeType属性返回节点类型的常数值。不同的类型对应不同的常数值，12种类型分别对应1到12的常数值,他们都是继承了Node的某种特定Node类型。

元素节点            　　Node.ELEMENT_NODE(1)
属性节点            　　Node.ATTRIBUTE_NODE(2)
文本节点            　　Node.TEXT_NODE(3)
CDATA节点            	   Node.CDATA_SECTION_NODE(4)
实体引用名称节点    Node.ENTRY_REFERENCE_NODE(5)
实体名称节点        　Node.ENTITY_NODE(6)
处理指令节点        　Node.PROCESSING_INSTRUCTION_NODE(7)
注释节点            　   Node.COMMENT_NODE(8)
文档节点            　   Node.DOCUMENT_NODE(9)
文档类型节点        　Node.DOCUMENT_TYPE_NODE(10)
文档片段节点        　Node.DOCUMENT_FRAGMENT_NODE(11)
DTD声明节点            Node.NOTATION_NODE(12)

#### 三. Node和Element的应用

**1 方法名字里面有element的一般是返回的Element**

比如 document.getElementById('main');

**2 children() 和 childNodes()区别**

注意： $0 为 浏览器里面选中的dom元素

（1）$0.children 返回的是 子节点中element 元素的集合（不包括text和comment类型的node）
HTMLCollection(2)  长度为2 的HTMLCollection

（2）$0.childNodes 返回的是  所有子节点（包括element，text和comment等类型node）

NodeList(5) 长度为5的NodeList

**3  firstChild() lastChild()  返回的是Node(不一定是Element，可能是Text或者Comment)**

**4 创建不同节点类型**

```
var div = document.createElement('div');
var text = document.createTextNode('测试');

var attr = document.createAttribute('data-a');
attr.value = 'eeeee';
$0.setAttributeNode(attr); // 等效于 $0.setAttribute('data-a', 'eeeee');
```



