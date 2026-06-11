---
title: SQL1
published: 2024-07-08 15:37:38
pinned: false
description: SQL使用;作为结束标志，SQL不区分大小写，但是一般关键字大写是为了更容易阅读，SQL查询结果没特殊说明，不进行排序，SQL对空格不进行处理，所以可以写在一行，也可写在多行。
tags:
- 动态
- 旧文件
- Mysql
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;SQL使用;作为结束标志，SQL不区分大小写，但是一般关键字大写是为了更容易阅读，SQL查询结果没特殊说明，不进行排序，SQL对空格不进行处理，所以可以写在一行，也可写在多行。

``` mysql
SELECT DISTINCT 列名 FROM 表名; DISTINCT 用于查询不同字段，消除重复字段。
```

```mysql
SELECT TOP 5 列名 FROM 表名; TOP 用于指定前几行记录;
```

```mysql
MYSQL使用如下 SELECT 列名 FROM 表名 LIMIT 5 OFFSET 5; LIMIT关键词用于指定输出几行，OFFSET 用于指定开始行号，可简化为LIMIT 5,5; 但是第一个是OFFSET值，第二个为LIMIT值
```
