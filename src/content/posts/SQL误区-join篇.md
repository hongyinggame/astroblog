---
title: SQL误区-JOIN篇
published: 2026-07-09
description: ''
image: ./images/cover1.jpg
tags: [Sql]
category: 'Sql'
draft: false
lang: ''
---

&emsp;&emsp;SQL的Join链接作为数据常用语句，之前一直对于ON和where有个误区，一直认为筛选条件在on中加与在where中加效果是一致的，但是在一次使用中发现了其中是有一定的区别的。
&emsp;&emsp;先上两个sql：
```sql
--on中筛选
select * from employee t1
left join department t2
on t1.id = t2.employeeId 
and t2.on=1

--wehre中筛选
select * from employee t1
left join department t2
on t1.id = t2.employeeId
where t2.on=1

############
employee 表
id    name
1     张三
2     李四
3     王五

############
departemnt 表
id   employeeId   on
1      1          0
2      1          1
3      2          1
4      3          0
```

&emsp;&emsp;好了，从上面可以看到有两个sql，一个筛选是在on中，一个是在where中，这两个查询结果实际执行是有很大区别的。
&emsp;&emsp; 首先，先看执行过程，过程明确了，结果也就一目了然了。先说结论，on是局部过滤，而where是全局过滤。

> [!NOTE]
> on中筛选,对于 employee 表 先逐行扫描并进行与department进行配对，
> 首先 张三与department配对时, 先判断on匹配，先对右表进行筛选符合t2.on =1的数据
>
> | t2.id | t2.employeeId | on |
> | :---: | :---: | :---: |
> | 2 | 1 | 1 |
> | 3 | 2 | 1 |
>
> 然后基于t1.id = t2.employeeId 来和t1拼接，由于是左连接，所以对于t1没有匹配的还会保留，对应t2的字段为null,结果如下：
>
> | t1.id | t1.name | t2.id | t2.employeeId | on |
> | :---: | :---: | :---: | :---: | :---: |
> | 1 | 张三 | 2 | 1 | 1 |
> | 2 | 李四 | 2 | 2 | 1 |
> | 3 | 王五 | NULL | NULL | NULL |
>
> 对于where 有点sql基础的都能理解，直接说答案：
> | t1.id | t1.name | t2.id | t2.employeeId | on |
> | :---: | :---: | :---: | :---: | :---: |
> | 1 | 张三 | 2 | 1 | 1 |
> | 2 | 李四 | 2 | 2 | 1 |
>

&emsp;&emsp;这样就明确了，wehre是全局筛选，而on对于左连接可能会有遗留，但是inner join 则会没有遗留。