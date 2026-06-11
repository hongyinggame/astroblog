---
title: 删除表
published: 2024-07-23 16:23:51
pinned: false
description: 删除表有三种方式：
tags:
- 动态
- 旧文件
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;删除表有三种方式：

```
1.删除表
    DROP TABLE 表名;
2.删除表数据，而不是删除表结构，不能使用where指定具体内容。
    TRUNCATE TABLE 表名;
3.删除表数据，可与where搭配使用，删除指定内容。
    DELETE FROM 表名 WHERE 或者DELETE FROM 表名。

不同点：
    1.DROP 与 TRUNCATE 为数据库定义语言DDL，执行后自动提交，DELETE为数据库操作语言。
    2.truncate和delete 只删除数据不删除表结构，truncate 删除后将重建索引（新插入数据后id从0开始记起），而 delete不会删除索引 （新插入的数据将在删除数据的索引后继续增加），drop语句将删除表的结构包括依赖的约束，触发器，索引等；
    3.drop和truncate删除时不记录MySQL日志，不能回滚，delete删除会记录MySQL日志，可以回滚；
    4.返回值：delete 操作后返回删除的记录数，而 truncate 返回的是0或者-1（成功则返回0，失败返回-1）
```
