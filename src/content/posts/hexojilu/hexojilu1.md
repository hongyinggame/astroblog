---
title: Hexo在post文件夹中子文件夹中创建文档
published: 2024-07-13 10:14:10
pinned: false
description: 随着hexo创建博客增多，我发现如果都是hexo new 文件时，所有文件都会出现在_post文件夹中，然后就无法很好地整理与查找文件了，因此需要通过子文件夹来进行分类，...
tags:
- 动态
- 旧文件
- Hexo记录
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;随着hexo创建博客增多，我发现如果都是hexo new 文件时，所有文件都会出现在_post文件夹中，然后就无法很好地整理与查找文件了，因此需要通过子文件夹来进行分类，所以需要在创建时就将其分文件夹创建。

```
hexo new [post] -p 子文件夹/文件名 "文件题目"
[]是说创建什么模式，一般有post、draft、page模式，当使用post是会在/source/_post文件夹下创建，而draft则是在source/_draft文件夹下创建，page则是在source下创建。
附：
Usage: hexo new [layout] <title>

Description:
Create a new post.

Arguments:
  layout  Post layout. Use post, page, draft or whatever you want.
  title   Post title. Wrap it with quotations to escape.

Options:
  -p, --path     Post path. Customize the path of the post.
  -r, --replace  Replace the current post if existed.
  -s, --slug     Post slug. Customize the URL of the post.
```
