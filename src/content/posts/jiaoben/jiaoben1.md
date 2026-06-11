---
title: 脚本延时变量
published: 2024-07-12 17:27:21
pinned: false
description: 在进行编写脚本时，发现了延时变量与非延时变量，记录一下。一般if语句被认为是一行命令，而if中往往有几行命令，此时命令可以被认为是并行的，但是如果使用了延时扩展，就如同被认为不同命令，相继执行。
tags:
- 动态
- 旧文件
- 脚本
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;在进行编写脚本时，发现了延时变量与非延时变量，记录一下。一般if语句被认为是一行命令，而if中往往有几行命令，此时命令可以被认为是并行的，但是如果使用了延时扩展，就如同被认为不同命令，相继执行。

```
setlocal enabledelayedexpansion ::开启延时扩展
set a = 2
if %a% =;=2 (::括号前要有空格

    set a=3
    echo !a!::当使用!!才会变成延时变量
    echo %a%
    ::此时!a!输出3，而%a%输出2。

)
pause
```
