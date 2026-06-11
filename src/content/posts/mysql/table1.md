---
title: 类型
published: 2024-07-18 16:22:08
pinned: false
description: Varchar与char区别： AUTO_INCREMENT 自增，所修饰字段具备如下特性： 主键创建可以在字段声明时利用PRIMARY
  KEY设定，...
tags:
- 动态
- 旧文件
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;Varchar与char区别：

```
Varchar 是可变长，需要字节存储长度，不大于255，需要1字节，特殊的如果表格使用ROW_FORMAT=FIXED，则变为固定长度。一般不能直接设定最大值，虽然在mysql中看是变长，但是对于内存来说是直接开辟全部长度，以避免放不下情况，会浪费资源，同时Varchar在更新时，也会出现页内存储不够的情况，MylSAM会将行拆成不同的片段存储，InnoDB则需要分裂页来使行可以放进页内，允许最大长度为65535个字节，同时列共享（相加）。
char 是固定长度，不够部分用空格补充，允许最大长度为255个字符，
```

&emsp;&emsp;AUTO_INCREMENT 自增，所修饰字段具备如下特性：

```
1、字段不能为null，即设定NOT NULL;
2、字段必须有唯一索引，即不允许有重复值，UNIQUE标识为唯一索引，不允许重复，但是可以为空，主键索引，通过设置主键自动创建，其不允许重复同时不允许为空，所以一般该字段设定为主键或者是唯一不为空字段;
3、字段类型必须为整型;
4、字段达到最大值时，失效；
```

&emsp;&emsp;主键创建可以在字段声明时利用PRIMARY KEY设定，也可以在字段最后加入PRIMARY KEY('字段1'，'字段2')，我认为应该使用后者，当然如果只设定一个字段为主键可以使用前者，但是后者舍得主键与字段分开，便于阅读，同时便于确定主键。<font color="Red">主键只能指定一个，但是可以包括多个字段。</font>

```
1、CREATE TABLE table_1(
    'id' int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'name' varchar(10) NOT NULL
)ENGINE=InnoDB AUTO_INCREMENT=7 DEAFAULT CHARSET=utf8;
2、CREATE TABLE table_2(
    'id' int NOT NULL ATUO_INCREMENT,
    'name' varchar(10) NOT NULL,
    PRIMARY KEY('id')
)ENGINE=InnoDB AUTO_INCREMENT=7 DEAFALT CHARSET=utf8;
```
&emsp;&emsp;唯一键UNIQUE KEY，设定与PRIMARY KEY差不多，一个是声明字段时加UNIQUE，另一个在最后使用UNIQUE KEY '标识名称' ('字段名1','字段名2'...)，也可以在修改表命令中使用ALTER TABLE <数据表名> ADD CONSTRAINT <唯一约束名> UNIQUE<列名>，也可ALTER TABLE '表名' ADD unique('字段名')，或者create unique index '名称' on '表名' ('字段名')，删除表使用ALTER TABLE <数据表名> DROP INDEX <唯一约束名>；

```
1、创建UNIQUE KEY
a. CREATE TABLE table_1(
    'id' int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'name' varchar(10) NOT NULL,
    'id_card' char(13) NOT NULL UNIQUE,
)ENGINE=InnoDB AUTO_INCREMENT=7 DEAFAULT CHARSET=utf8;
b. CREATE TABLE table_1(
    'id' int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'name' varchar(10) NOT NULL,
    'id_card' char(13) NOT NULL,
    UNIQUE KEY 'id_unique' ('id_card')
)ENGINE=InnoDB AUTO_INCREMENT=7 DEAFAULT CHARSET=utf8;
c. CREATE TABLE table_1(
    'id' int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    'name' varchar(10) NOT NULL,
    'id_card' char(13) NOT NULL
)ENGINE=InnoDB AUTO_INCREMENT=7 DEAFAULT CHARSET=utf8;
   ALTER TABLE table_1 ADD CONSTRAINT 'indexID' UNIQUE 'id_card';
   或者 CREATE UNIQUE INDEX 'indexID' on 'table_1' ('id_card');
3、删除唯一索引
ALTER TABLE table_1 DROP INDEX 'indexID';

```

