---
title: shell学习
date: 2018-05-28 15:43:44
tags: 基础
categories: linux
---

#### 一. 硬件，核心与shell的关系

![](/image/shell.jpg)

shell是一个程序，他接受从键盘输入的命令，然后把命令传递给操作系统去执行。

也就是说，我们必须要透过『 Shell 』将我们输入的命令与 Kernel 沟通，好让 Kernel 可以控制硬件来正确无误的工作！

#### 二. shell相关操作

1.查看shell的种类： 合法shell的类型放在/etc/shells文件里面

2.查看当前shell类型：`` echo $SHELL `` 或者 `` echo $0 `` 或者 `` 或者  ps -p $$``

($$表示当前进程id.    $0表示当前进程名字,  $?表示上个运行命令的回传值)

3.切换shell类型：切换shell  ：chsh -s /bin/bash

4.**PS1**设置**shell**命令提示字符串

5.``export PATH="$PATH :/usr/bin"`` 将变量export出去，这样子程序就能使用这个变量

#### 三. 常用命令

##### 首先说明什么是命令，命令可以是下面四种形式之一：

1. 是一个可执行程序。就像我们看到的位于/usr/bin中的文件一样，属于这一类的程序，可以编译成二进制文件。它可以是用c和c++写成的程序，也可以是有脚本语言写成的程序，比如shell，perl，Python，ruby等。
2. 是一个内置于shell的命令（builtins）。比如cd命令。
3. 是一个命令别名，用aliass生成的命令。
4. 是一个shell函数，把他们放到环境变量中就可以直接执行。

##### 常用命令

type：查看**命令**类型(是上面四种的哪一种)

which：显示**可执行程序**位置，注意只是命令里面的可执行程序的位置。

Whereis: 不只可以查找命令，其他文件类型都可以, 范围比which大。但是一般使用which

file查看文件类型

#### 四. shell的执行顺序

命令运行的顺序可以这样看：

1. 以相对/绝对路径运行命令，例如『 /bin/ls 』或『 ./ls 』；

2. 由 alias 找到该命令来运行；

3. 由 bash 内建的 (builtin) 命令来运行；

4. 透过 $PATH 这个变量的顺序搜寻到的第一个命令来运行。

   注意：使用source或者. 来执行的脚本是在当前shell环境中，如 source b.sh 或者 ./b.sh

   使用shell b.sh 命令来执行的脚本是在自己的shell环境下执行的

**注意**  关于shell的执行命令 ：  . 和source是等价的，他们都是在当前shell里面执行，不会建立子shell

```
. ./a.sh
source ./a.sh
./a.sh
```

上面三个命令都可以执行当前路径下的a.sh

前面已经说了. 和source是等价的。然而. ./a.sh 和./a.sh的区别在于：

. ./a.sh是执行当前路径下的a脚本（ . 表示执行，**文件名是参数**），

./a.sh是传入了一个**文件名作为命令**，需要在文件内部去通过#!/bin/bash 或者#!/usr/bin/env node 来指定脚本解释器

而且./a.sh 是新开子shell来执行脚本，子shell里面的变量无法被父shell获取

#### 五. 父子shell参数传递问题

1. 父shell给子shell传参：

   父亲定义的变量如果使用source方式则儿子可以直接使用，如果是用./a.bash 的方式执行子shell，那么需要付shell  export 变量才能让儿子拿到数据。

2. 子shell给父shell传参

   （1）在子shell里面将数据echo出去

   （2）父shell如果使用source方式执行儿子（其实使用source执行，父子之间变量都是公用的，其实他们是在同一个shell里，也没有父子之说，为了区分两个shell，我暂时这么称呼）

   ```bash
   #! /bin/bash
   # 当前文件名字为father.sh
   export fatherVar="i am father"
   chmod +x ./son.sh
   ./son.sh
   sonA=$(. ./son.sh)
   echo "我是父亲，我打印来自儿子shell中的变量${sonVar}"
   echo "我是父亲，我打印来自儿子shell echo得到的数据：${sonA}"
   ```

   ```bash
   #! /bin/bash
   # 当前文件名字为son.sh
   sonVar="i am son"
   echo "我是儿子，我打印来自父亲的变量${fatherVar}"
   echo "abc"
   ```

#### 六. bash 环境中的特殊符号

| 符号  | 内容                                                         |
| ----- | ------------------------------------------------------------ |
| #     | 批注符号：这个最常被使用在 script 当中，视为说明！在后的数据均不运行 |
| \     | 跳脱符号：将『特殊字符或通配符』还原成一般字符               |
| &#124; | 管线 (pipe)：分隔两个管线命令的界定(后两节介绍)              |
| ;     | 连续命令下达分隔符：连续性命令的界定 (注意！与管线命令并不相同) |
| ~     | 用户的家目录                                                 |
| $     | 取用变量前导符：亦即是变量之前需要加的变量取代值             |
| &     | 工作控制 (job control)：将命令变成背景下工作                 |
| !     | 逻辑运算意义上的『非』 not 的意思！                          |
| /     | 目录符号：路径分隔的符号                                     |
| >, >> | 数据流重导向：输出导向，分别是『取代』与『累加』             |
| <, << | 数据流重导向：输入导向 (这两个留待下节介绍)                  |
| ' '   | 单引号，不具有变量置换的功能                                 |
| " "   | 具有变量置换的功能！                                         |
| ``    | 两个『 ` 』中间为可以先运行的命令，亦可使用 $( )             |
| ( )   | 在中间为子 shell 的起始与结束                                |
| { }   | 在中间为命令区块的组合！                                     |

关于减号 - 的用途

管线命令在 bash 的连续的处理程序中是相当重要的！另外，在 log file 的分析当中也是相当重要的一环， 所以请特别留意！另外，在管线命令当中，常常会使用到前一个命令的 stdout 作为这次的 stdin ， 某些命令需要用到文件名 (例如 tar) 来进行处理时，该 stdin 与 stdout 可以利用减号 "-" 来替代， 举例来说：

``tar -cvf - /home | tar -xvf -``

上面这个例子是说：『我将 /home 里面的文件给他打包，但打包的数据不是纪录到文件，而是传送到 stdout； 经过管线后，将 tar -cvf - /home 传送给后面的 tar -xvf - 』。后面的这个 - 则是取用前一个命令的 stdout， 因此，我们就不需要使用 file 了！这是很常见的例子喔！注意注意！

#### 七. 文件压缩命令

##### 1. zip和unzip

1. 我想把一个文件abc.txt和一个目录dir1压缩成为yasuo.zip：

``＃ zip -r yasuo.zip abc.txt dir1``

2.我下载了一个yasuo.zip文件，想解压缩：

``# unzip yasuo.zip``

3.我当前目录下有abc1.zip，abc2.zip和abc3.zip，我想一起解压缩它们：

``＃ unzip abc\?.zip``

4.我有一个很大的压缩文件large.zip，我不想解压缩，只想看看它里面有什么：(v:verbose)

``# unzip -v large.zip``

5.我下载了一个压缩文件large.zip，想验证一下这个压缩文件是否下载完全了(t:test)

``# unzip -t large.zip``

##### 2.tar 

-c 建立压缩文档（create）

-x 解压（extract）

-t 查看内容（list）

-r 向压缩归档文件末尾添加文件（accretion）

-u 更新原压缩包中的文件（update）

这5个是独立的命令，解压压缩都要用到其中的一个，可以和别的命令连用，但只能用其中一个。

<b>下面的参数是根据需要在压缩或者解压的时候可选用的：</b>

-z 带有gzip属性的

-j 带有bz2属性的

-v 显示所有过程（verbose）

参数-f是必须的：代表使用档案的名字（就是目标文件名），切记这个参数是最后一个参数，他的后面只能跟文件名（file）

**例子**

解压：

tar -xvf file.tar 解压file.tar

tar -xzvf file.tar.gz 解压file.tar.gz

tar -xjvf file.tar.bz2 解压file.tar.bz2

tar -xjvf file.tar.bz2 index.html 只解压file.tar.bz2里面的index.html文件

tar -xjvf file.tar.bz2 -C /etc 解压file.tar.bz2到/etc目录下

压缩：

tar -cvf jpg.tar *.jpg 将所有jpg文件打包压缩成tar.jpg