---
title: 配置双博客（配置访问两个github）
published: 2024-06-28 16:33:12
pinned: false
description: 因为我有了两个博客，而一个博客如果使用github.io域名，那么一个博客只能对应一个github号，所以我创建了两个github号，所以需要配置一个电脑使用两个github。
  首先，...
tags:
- 动态
- 旧文件
- github
- hexo
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;因为我有了两个博客，而一个博客如果使用github.io域名，那么一个博客只能对应一个github号，所以我创建了两个github号，所以需要配置一个电脑使用两个github。
&emsp;&emsp;首先，配置两个github号我们需要明白根本操作其实是配置两个密钥，目前我们无法使用两个github，根本原因是我们只生成了一个密钥，且电脑只识别id_rsa密钥。
&emsp;&emsp;理解上述原因后，我们就很好的明白如何解决问题了，首先生成不同的两个密钥，只需命名不同即可，然后添加对应的github账号中，随后将其添加SSH agent中，使电脑识别两个密钥，然后就是在.ssh里建立一个config文件（无后缀，可以先创建txt文件，然后删除后缀即可），为其设置不同的host别名，说白了就是用于隐藏域名的指代词，不同别名代表不同的配置，其中，最主要的是配置两个不同别名使用的密钥，随后，我们需要将全局配置删除，然后，我们就可以通过ssh -T git@自己配置的第一个Host别名，来测试是否成功，如果成功，那么我们就成功关联两个github了，每次就可以git@别名来区分操作。
&emsp;&emsp;上面做完后，接下来就是hexo关联github了，这个简单，就是配置hexo的config文件，将deploy中的repository属性配置对应的别名就行了，最后就是因为全局配置没有了，所以我们需要将每个的hexo中的.deploy_git中.git中的config配置[user]选项，告诉hexo我是谁，其中含有email属性与name属性，写对应github的就行。
&emsp;&emsp;经过以上操作我们就完成了一个电脑使用两个博客了。这里具体操作没有展示，因为网上都有介绍，这里主要说一下原理与操作流程，主要是便于我以后忘记时，快速明白其中原理，并明白到底要怎么做。
