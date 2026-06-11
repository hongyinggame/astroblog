---
title: post
published: 2024-07-29 16:39:02
pinned: false
description: 学习java mysql的关闭资源方法中，学习到try catch with resource 方法，这个方法需要要求所释放资源类实现了AutoCloseable接口，代码介绍如下：...
tags:
- 动态
- 旧文件
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;学习java mysql的关闭资源方法中，学习到try catch with resource 方法，这个方法需要要求所释放资源类实现了AutoCloseable接口，代码介绍如下：
```
try(将需要关闭的资源语句写在这里){

    ......
}catch(错误){
}
```
&emsp;&emsp;这个方法被常用取代try-catch finally，除了写作简洁外，还有一个就是它避免了错误覆盖，通过addSuppressed()方法将抑制的错误信息存储下来，后面通过getSuppressed()输出。
参考博客地址：<a href = 'https://javabetter.cn/exception/try-with-resources.html'>深入理解 Java 中的 try with resources</a>
