---
title: npm link的原理
date: 2018-05-28 14:14:55
tags: 工具
categories: linux
---

#### 一：npm link

首先讲一讲npm link 的原理

假设我们开发了一个模块叫 hello ，然后我们在 test-project 里引用这个模块 ，每次 hello 模块的变动我们都需要反映到 test-project 模块里。使用npm link将会非常有效

第一步：将hello模块放到全局上

```
cd /Users/yangxia/myproject/test-project # 进入test-project模块目录，这个目录是hello模块的开发目录
npm link # 建立软链接
```

第二步：在某一个项目里使用上一步的hello模块

```
cd /Users/yangxia/myproject/use-hello-project # 进入use-hello-project模块目录，这个目录是使用方，而test-project是提供方
npm link hello # 在执行
```

生效原因：

第一步：

因为test-project下的package.json下的bin字段是这样的

```
"bin": {
    "hello": "./hello"
  },
```

所以当执行`` npm link `` 的时候，命令行会出现：

```
/usr/local/bin/hello -> /usr/local/lib/node_modules/test-project/hello
/usr/local/lib/node_modules/test-project -> /Users/yangxia/myproject/test-project
```

意思是在/usr/local/bin/目录下的hello指向了/usr/local/lib/node_modules/test-project/hello，

/usr/local/lib/node_modules/目录下的test-project指向了/Users/yangxia/myproject/test-project

也就是建立了两个软连接。

第二步：

当在需要的项目里执行第二步的npm link hello时，use-hello-project这个项目下的node_modules下的hello模块就指向全局的hello，即：

```
/Users/yangxia/myproject/use-hello-project/hello -> /usr/local/lib/node_modules/test-project/hello
```

如果使用

```
ll -d /usr/local/lib/node_modules/test-project
```

会得到

```
lrwxr-xr-x  1 yangxia  admin    37B  5 28 15:18 /usr/local/lib/node_modules/test-project -> /Users/yangxia/myproject/test-project
```

代表这个目录只是一个软连接

同时

```
ll /usr/local/bin/hello
```

会得到

```
lrwxr-xr-x  1 yangxia  admin    38B  5 28 15:18 /usr/local/bin/hello -> ../lib/node_modules/test-project/hello
```

代表这个文件也是一个软连接

总结：npm link就是通过一个文件链接和一个目录链接来达到将一个模块放到全局上，让所有目录都可以访问到此模块的目的。

#### 二 . npx

根据 [zkat/npx](https://link.zhihu.com/?target=https%3A//github.com/zkat/npx) 的描述，npx 会帮你执行依赖包里的二进制文件。

举例来说，之前我们可能会写这样的命令：

```
npm i -D webpack
./node_modules/.bin/webpack -v
```

如果你对 bash 比较熟，可能会写成这样

```
npm i -D webpack
`npm bin`/webpack -v
```

有了 npx，你只需要这样

```
npm i -D webpack
npx webpack -v
```

也就是说 npx 会自动查找当前依赖包中的可执行文件，如果找不到，就会去 PATH 里找。如果依然找不到，就会帮你安装！