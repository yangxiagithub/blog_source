---
title: 学习nginx
date: 2018-04-23 17:10:41
tags: 工具
categories: nginx
---

参考链接

https://blog.csdn.net/hzsunshine/article/details/63687054

http://seanlook.com/2015/05/17/nginx-location-rewrite/

http://seanlook.com/2015/05/17/nginx-install-and-config/

#### 一 简介

nginx是一个高性能的http和反向代理服务器，同时也是一个IMAP/POP3/SMTP代理服务器。

nginx作为http服务器，有以下几项基本特征：（还有很多其他的特征，由于本文只是基础知识学习，还未体验过其他高端特征）

1. 处理静态文件，索引文件以及自动索引
2. 反向代理加速（无缓存），简单的负载均衡和容错。

#### 二 基础

1. 启动和停止命令

   启动：nginx 

   关闭：nginx -s stop

   重启： nginx -s reload

2. 配置：nginx的配置可以通过`` ./configration``命令来配置，也可以通过配置文件来配置。nginx配置文件存放在/usr/local/etc/nginx文件夹下。

3. nginx配置文件结构

   ![](/image/nginx.png)

   nginx内层配置可以覆盖外层配置。

#### 三 nginx配置具体讲解

location匹配规则

- 以`=`开头表示精确匹配
- `^~` 开头表示uri以某个常规字符串开头，不是正则匹配
- ~ 开头表示区分大小写的正则匹配;
- ~* 开头表示不区分大小写的正则匹配
- / 通用匹配, 如果没有其它匹配,任何请求都会匹配到

优先级:

(location =) > (location 完整路径) > (location ^~ 路径) > (location ~,~* 正则顺序) > (location 部分起始路径) > (/)

#### 四 rewrite规则

1. 功能：rewrite的功能是使用nginx提供的全局变量或者自己设置的变量，结合正则表达式和标志位实现url重写和重定向。

2. 作用范围：rewrite只能放在server{}，location{}，if{}中，并且只能对域名后边的出去参数外的字符串起作用。

   例如 `http://seanlook.com/a/we/index.php?id=1&u=str` 只对/a/we/index.php重写。语法`rewrite regex replacement [flag];

   如果想对域名或者参数起作用，可以使用全局变量匹配，或者使用proxy—pass作反向代理

3. rewrite和location区别和联系

   联系：都能实现跳转

   区别：rewrite是在统一域名内更改获取资源的路径，location是对一类路径做控制访问或反向代理，可以proxy_pass到其他机器。

   很多情况rewrite也会写在location里面，他的执行顺序是：

   1. 执行server块的rewrite指令
   2. 执行location匹配
   3. 执行选定的location中的rewrite指令

4. rewrite之flag标志位

   - `last` : 相当于Apache的[L]标记，表示完成rewrite

   - `break` : 停止执行当前虚拟主机的后续rewrite指令集

   - `redirect` : 返回302临时重定向，地址栏会显示跳转后的地址

   - `permanent` : 返回301永久重定向，地址栏会显示跳转后的地址

     因为301和302不能简单的只返回状态码，还必须有重定向的URL，这就是return指令无法返回301,302的原因了。

     理解last和break的区别：(last和break都会阻止后续erwrite指令的执行)

     last：

     ​    重新将rewrite后的地址在server标签中执行

     break：

     ​    将rewrite后的地址在当前location标签中执行

5. rewrite之if指令与全局变量

   ##### if

   语法为`if(condition){...}`，对给定的条件condition进行判断。如果为真，大括号内的rewrite指令将被执行，if条件(conditon)可以是如下任何内容：

   - 当表达式只是一个变量时，如果值为空或任何以0开头的字符串都会当做false
   - 直接比较变量和内容时，使用`=`或`!=`
   - `~`正则表达式匹配，`~*`不区分大小写的匹配，`!~`区分大小写的不匹配

   `-f`和`!-f`用来判断是否存在文件
   `-d`和`!-d`用来判断是否存在目录
   `-e`和`!-e`用来判断是否存在文件或目录
   `-x`和`!-x`用来判断文件是否可执行

   ```
   if ($http_user_agent ~ MSIE) {
       rewrite ^(.*)$ /msie/$1 break;
   } //如果UA包含"MSIE"，rewrite请求到/msid/目录下

   if ($http_cookie ~* "id=([^;]+)(?:;|$)") {
       set $id $1;
    } //如果cookie匹配正则，设置变量$id等于正则引用部分

   if ($request_method = POST) {
       return 405;
   } //如果提交方法为POST，则返回状态405（Method not allowed）。return不能返回301,302

   if ($slow) {
       limit_rate 10k;
   } //限速，$slow可以通过 set 指令设置

   if (!-f $request_filename){
       break;
       proxy_pass  http://127.0.0.1;
   } //如果请求的文件名不存在，则反向代理到localhost 。这里的break也是停止rewrite检查

   if ($args ~ post=140){
       rewrite ^ http://example.com/ permanent;
   } //如果query string中包含"post=140"，永久重定向到example.com

   location ~* \.(gif|jpg|png|swf|flv)$ {
       valid_referers none blocked www.jefflei.com www.leizhenfang.com;
       if ($invalid_referer) {
           return 404;
       } //防盗链
   }
   ```

   ##### 全局变量

   - `$args` ： #这个变量等于请求行中的参数，同`$query_string`
   - `$content_length` ： 请求头中的Content-length字段。
   - `$content_type` ： 请求头中的Content-Type字段。
   - `$document_root` ： 当前请求在root指令中指定的值。
   - `$host` ： 请求主机头字段，否则为服务器名称。
   - `$http_user_agent` ： 客户端agent信息
   - `$http_cookie` ： 客户端cookie信息
   - `$limit_rate` ： 这个变量可以限制连接速率。
   - `$request_method` ： 客户端请求的动作，通常为GET或POST。
   - `$remote_addr` ： 客户端的IP地址。
   - `$remote_port` ： 客户端的端口。
   - `$remote_user` ： 已经经过Auth Basic Module验证的用户名。
   - `$request_filename` ： 当前请求的文件路径，由root或alias指令与URI请求生成。
   - `$scheme` ： HTTP方法（如http，https）。
   - `$server_protocol` ： 请求使用的协议，通常是HTTP/1.0或HTTP/1.1。
   - `$server_addr` ： 服务器地址，在完成一次系统调用后可以确定这个值。
   - `$server_name` ： 服务器名称。
   - `$server_port` ： 请求到达服务器的端口号。
   - `$request_uri` ： 包含请求参数的原始URI，不包含主机名，如：”/foo/bar.php?arg=baz”。
   - `$uri` ： 不带请求参数的当前URI，$uri不包含主机名，如”/foo/bar.html”。
   - `$document_uri` ： 与$uri相同。

#### 五 try_file指令可以替代rewrite

```
try_files $uri $uri/ /index.php?q=$uri&$args;
```

按顺序检查文件是否存在，返回第一个找到的文件。结尾的斜线表示为文件夹 -$uri/。如果所有的文件都找不到，会进行一个内部重定向到最后一个参数。

务必确认只有最后一个参数可以引起一个内部重定向，之前的参数只设置内部URI的指向。 最后一个参数是回退URI且必须存在，否则将会出现内部500错误。

命名的location也可以使用在最后一个参数中。与rewrite指令不同，如果回退URI不是命名的location那么$args不会自动保留，如果你想保留​$args，必须明确声明。

例如：

```
try_files /app/cache/ $uri @fallback;
index index.php index.html;
# 它将检测$document_root/app/cache/index.php,$document_root/app/cache/index.html 和 
# $document_root$uri是否存在，如果不存在着内部重定向到 @fallback 。
```

需要明确的是处最后一个参数外 try_files 本身不会因为任何原因产生内部重定向。 