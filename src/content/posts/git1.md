---
title: git1
published: 2022-11-14 20:45:34
pinned: false
description: 'git push 报错：fatal: unable to access ''https://github.com/hongyinggame/shanaweb.git/'':
  Failed to...'
tags:
- 动态
- 旧文件
- git项目提交
category: 文章示例
draft: false
image: ./images/firefly2.avif
---



#### git push 报错：fatal: unable to access 'https://github.com/hongyinggame/shanaweb.git/': Failed to connect to github.com port 443 after 21108 ms: Timed out

<p>解决方法：取消代理
```
git config --global --unset http.proxy

git config --global --unset https.proxy
```
</p>