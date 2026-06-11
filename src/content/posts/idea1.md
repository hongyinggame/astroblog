---
title: IDEA全局配置
published: 2022-12-04 15:24:42
pinned: false
description: IDEA中的坑 解决在IDEAmaven配置中，出现使用setting设置只能作用于该项目的问题 本人使用的是 IDEA2022.3版本
  ,在进行maven配置时，...
tags:
- 动态
- 旧文件
- IDEA
category: 文章示例
draft: false
image: ./images/firefly2.avif
---



#### IDEA中的坑

### 解决在IDEAmaven配置中，出现使用setting设置只能作用于该项目的问题

&emsp;本人使用的是<span style="color:red">IDEA2022.3版本</span>,在进行maven配置时，通过setting进行配置maven，出现了该配置只能作用于该项目，不能迁移到另一个项目中。

## 解决

&emsp;新版IDEA的全局设置放到了初始化界面中，如果你已经进入项目可以通过如下图所示操作退出项目，然后就会进入初始化界面。
![项目退出](/images/projectexit.png)

&emsp;进入初始化界面后，找到全局配置，如下图：
![全局配置](/images/allsetting.png)

&emsp;最后就是进行全局配置了，但是你以为这就完了吗？
![](/images/heshui.gif) 
![](/images/paobu.gif)

&emsp;好了休息完了，接下来是将勾选自动编译到项目中，如果这个不勾选，还是出现无法应用的情况，操作如下图：
![自动编译项目](/images/bianyi.png)

&emsp;ok!现在全局配置生效了，你终于不用每次都配置了。
![](/images/haoyun.jpg)