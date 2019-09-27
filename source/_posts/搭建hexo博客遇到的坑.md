---
title: 搭建hexo博客遇到的坑
date: 2018-02-09 15:08:21
tags: 工具
categories: git
---

### 一. github的仓库名字

仓库必须以.github.io结尾，比如yangxiagithub.github.io。如果直接用yangxiagithub就不行。

### 二. 站点配置文件的仓库地址

```yaml
deploy:
  type: git
  repo: git@github.com:yangxiagithub/yangxiagithub.github.io.git
  branch: master
```

注意：repo是仓库地址（直接去仓库复制下来就行）

### 三. 多个ssh key 

1. 背景：如果～/.ssh文件夹下面已经有了其他的ssh key，这时候你在命令行输入

`ssh-keygen -t rsa`

会导致原来的ssh key被覆盖，那么以前的key就会失效。

2. 解决方案：让多个key共存

3. 解决办法：

   ##### 第一步

   `ssh-keygen -t rsa -f ~/.ssh/github_id-rsa`

   上面的命令会在～/.ssh下面生成一对名字为github_id-rsa的公钥和密钥，不与原来的发生冲突。

   ##### 第二部

   在～/.ssh文件夹下见一个名为config的文件，如已经有，则使用原来的。

   在文件里加上

   ```
   Host github.com
       HostName github.com
       PreferredAuthentications publickey
       IdentityFile ~/.ssh/github_id-rsa
   ```

   ​