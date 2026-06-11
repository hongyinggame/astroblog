---
title: java_UI_font_1
published: 2024-06-27 10:22:26
pinned: false
description: 在进行JAVA贪吃蛇时，发现UI窗口中文字体乱码情况，起初以为是JAVA编码原因，经过查找资料得知，罪魁祸首是Windows系统本身是GBK，而非utf-8,只有Beta版可以设置，...
tags:
- 动态
- 旧文件
- java
- UI
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;在进行JAVA贪吃蛇时，发现UI窗口中文字体乱码情况，起初以为是JAVA编码原因，经过查找资料得知，罪魁祸首是Windows系统本身是GBK，而非utf-8,只有Beta版可以设置，具体可以通过系统设置的时间与语言模块查看，具体原因为：我们java是UTF-8编码，但是窗口是基于windows的，windows解析展示时乱码导致，所以我们添加一个jvm参数，具体内容为-Dfile.encoding=gbk。
![配置位置](/images/java/UI/fig1.png)


