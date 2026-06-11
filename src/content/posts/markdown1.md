---
title: markdown学习记录(一)
published: 2022-11-14 15:04:25
pinned: false
description: 参考连接 Markdown教程-代码块 问题：&emsp出现了无法渲染的情况 首先，观察你的渲染插件hexo-render有无问题，查询插件代码：
  npm ls ----列出所有插件 没有插件时，...
tags:
- 动态
- 旧文件
- markdown
category: 文章示例
draft: false
image: ./images/firefly2.avif
---


### 参考连接
<a href="https://www.imooc.com/wiki/markdownlesson/markdowncodeblock.html" target="_blank">Markdown教程-代码块</a>

#### 问题：&emsp出现了无法渲染的情况

<p>&emsp;首先，观察你的渲染插件hexo-render有无问题，查询插件代码：
    
    npm ls ----列出所有插件

没有插件时，使用如下命令进行下载：注：这里用hexo-renderer-markdown-it-plus作为例子，其他渲染器只需将插件名修改即可，同时看看有没有将以前的渲染器删除代码如下。
    
    npm un hexo-renderer-marked --save 卸载以前的渲染器
    npm i hexo-renderer-markdown-it-plus --save 安装现有的渲染器
</p>

#### 问题：代码块的定义
<p>首先，由于个人的习惯，写东西总是用空格来间隔，因此会出现所写东西高亮显示，查阅知道了该主题有代码块高亮显示，而代码块的定义有通过四个空格定义的规则，因此误打误撞定义成代码块了，借此机会整理下代码块定义的几个方法，同时提醒自己以后不能通过空格来进行间隔了。</p>
<p style="color:red;">代码块两种定义方法：</p>
<ul>
    <li>四个空格定义代码块</li>
    <li>三个连续的反引号分别作为代码块的开始与结束</li>
</ul>

<p style="color:red;">代码块的注意事项：
<ul>
    <li>当使用 4 个空格声明代码块时，转换后的代码文本会自动删除掉缩进的距离，也就是会从行首自动删掉 4 个空格，以保持格式；</li>
    <li>当使用 4 个空格声明代码块时，代码块的结束声明在后面首个缩进不足 4 个空格的行；</li>
    <li>常规的 Markdown 语义，比如「星号 *」在代码块中的转义作用失效;</li>
</ul>
    


</p>