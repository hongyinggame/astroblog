---
title: hadoop2
published: 2025-07-30 08:23:44
description: 'HDFS  1. 2NN     2NN不是NN的热备，当NN挂掉了，不能立马恢复NN。     工作：     ​	a. 辅助NN，分担工作量，比如定期合并Fsimage和Edits，并推送给NN。     ​	b. 辅助恢复NN。  2...'
tags: [hadoop, 旧文件]
category: 文章示例
draft: false
---

### HDFS

1. 2NN

   2NN不是NN的热备，当NN挂掉了，不能立马恢复NN。

   工作：

   ​	a. 辅助NN，分担工作量，比如定期合并Fsimage和Edits，并推送给NN。

   ​	b. 辅助恢复NN。

2. Client

    工作：

   ​        a. 文件切分

   ​        b. 与NN交互，获取文件位置信息

   ​        c. 与DN交互，读写信息

### HDFS文件块

HDFS分块存储，dfs.blocksize参数配置，2.x/3.x默认为128mb，1.x默认为64mb

- 寻址时间：查询block的时间。
- 寻址时间为传输时间的1%，为最佳状态。
- 普通磁盘传输速率为100mb/s，固态200~300mb/s。
- block大小=传输时间×传输速率=寻址时间/0.01×传输速率。
- 一般寻址时间为10ms，因此一般以128mb与256mb为主。虽然是100mb，但是取二进制整数为128mb。

为什么块的大小不能太小与太大？

- 太小，增加寻址时间。
- 太大，传输时间大于寻址时间，并发性太低，效率低。

### HDFS写流程

1. 选择节点问题？

   	1. 节点间通讯

   2. 负载均衡

2. 传输架构

​	FSDataOutputStream----->DN1（存储并分发DN2）------->DN2（存储并分发DN3）-------->DN3

​	FSDataOutputStream<--(应答成功)---DN1<---(应答成功)----DN2<----(应答成功)----DN3

3. 传送数据 Packet(64k)

​	chunk=数据(512bt)+校验（4bt)

​	Packet(64k) =多个chunk

​	多个Packet进入缓冲队列，传输一个一个Packet。
