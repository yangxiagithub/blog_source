---
title: shell编程语法学习
date: 2018-12-20 12:19:08
tags: 
catogories: shell
---

具体内容查看菜鸟教程

### 一.记录之前的练习文件

```
#!/bin/bash
x=5
if [ $x = 5 ] ; then 
    echo 'x equals 5'
else 
    echo 'x not equals 5'
fi
str="abcd"
# 字符串
echo "长度："
strLength=${#str}
echo "abcd的长度${#str}, ${strLength}"

echo "提取子字符串,类似js的substr，第一个参数是起始index，第二个参数是长度。原来的字符串不受影响"
strSub=${str:2:2}
echo "提取结果${strSub}"
echo "提取后的str：${str}"

# 数组
echo "数组"

array_name=("abcd" "aaa" "vvv")
echo "数组各项为${array_name[@]}"
echo "数组长度${#array_name[@]}"
echo "数组第一个元素长度${#array_name[0]}"

# shell参数
echo "shell传递参数"
echo "执行的文件名$0"
echo "第一个参数 $1"
echo "第二个参数 $2"
echo "传递的参数个数$#"
echo "以一个单字符串显示所有向脚本传递的参数。$*"
echo "以每个字符形式显示所有向脚本传递的参数。$@"
for i in $*; do
    echo $i
done

for i in $@; do
    echo $i
done
echo "脚本当前运行的进程ID号$$"

# 运算
a=10
b=10
c=$(($a + $b))
echo "两数之和是"$c

# if----else
if [ $a == $b ]; then 
    echo "a 和 b 相等"
elif [ $a -gt $b -a $a -gt 0 ]; then
    echo "a 大于 b"
    diff=$(($a - $b))
    echo "相差${diff}"
else
    echo "a 小于 b"
    diff=$(($b - $a))
    echo "相差${diff}"
fi

echo "字符串运算符"
s1="acx"
s2="rrr"
s3="rrr"
emp="    "
echo '在if 条件判断里, test 和 [] 的作用一样 '
if [ -z $s1 ]; then
    echo "字符串长度为0"
fi
if [ emp ]; then
    echo "字符串为空"
fi
if [ $s2 = $s2 ]; then
    echo "字符串相等"
fi
# 文件运算符省略了
echo "文件测试运算符"

echo "date"
date=`date`
echo ${date}

# 函数
echo "函数"
myFunc() {
    echo "第一个参数 $1"
    echo "第二个参数 $2"
    echo '这是一个函数, 函数返回值在调用该函数后通过 $? 来获得。'
    sum=0;
    if [ $1 ] ; then 
        echo "$1"
    else 
        echo "没有"
    fi
    for i in $*; do
        sum=$(($sum + $i))
    done
    return $sum;
}
inputFunc() {
    echo "请输入第一个数字"
    read first
    echo "请输入第二个数字"
    read second
    return $(($first * $second))
}
myFunc 3 5
echo "函数返回值$?"
myFunc
echo "$?"
inputFunc
echo "上一个命令执行结果$?"
```

### 二. 查看和切换shell类型

``chsh -s  /bin/bash``   或者``chsh -s /bin/bash``  来切换shell类型（-s  代表shell的意思）

``echo $SHELL`` 来查看shell类型

或者使用$0来查看shell类型