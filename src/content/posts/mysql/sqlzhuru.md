---
title: sql注入
published: 2024-07-23 09:51:46
pinned: false
description: sql注入是常见的攻击形式，通过注入sql语句，导致程序的安全以及数据库安全。 sql注入一般见效于拼接sql语句中，通过破坏输入规则，插入期望的sql语句，以此达到所要达到的目的。
  两个例子：...
tags:
- 动态
- 旧文件
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

&emsp;&emsp;sql注入是常见的攻击形式，通过注入sql语句，导致程序的安全以及数据库安全。
&emsp;&emsp;sql注入一般见效于拼接sql语句中，通过破坏输入规则，插入期望的sql语句，以此达到所要达到的目的。
&emsp;&emsp;两个例子：

```
1.查找sql注入，一般用于登录界面。
拼接sql语句：
    String sql = "SELECT * FROM student where username ='"+username+"' AND password = '"+password+"';" 
//AND 运行优先级高于 OR
注入sql语句：
    username = "123";
    password = "'or '1'='1";
SQL最终语句: 
    SELECT * FROM student where username ='123' AND password = '' or '1'='1';
因而可以将所有数据查出，造成登录成功。
2.在查询操作中插入删除操作。
拼接sql语句：
    String sql = "SELECT * FROM student where username ='"+username+"' AND password = '"+password+"';" 

注入sql语句：
    username = "123";
    password = "'; DELETE FROM student where '1'='1"
SQL最终语句：
    SELECT * FROM student where username ='123' AND password =''; DELETE FROM student where '1'='1';
注：该操作是批处理操作，但是java 中mysql执行方法execute不支持此操作。
```
&emsp;&emsp;因此为了避免sql注入，我们需要使用参数化sql语句，即预编译好的sql语句，除此之外做好用户输入数据的验证与过滤操作，以及最小化用户权限。<font color =Red>即使是参数化sql语句，我们也要避免拼接sql语句，否则依旧会有被sql注入的可能。</font>
&emsp;&emsp;这里主要是学习参数化sql语句，其他的会在后面项目中学习。
&emsp;&emsp;参数化sql语句就是使用占位符？代替部分参数，通过prepareStatement(String sql)，创建一个preparedStatement，随后使用不带参数的execute/executeUpdate/executeQuery命令执行操作，不过在这之前通过preparedStatement对象的setInt与setString方法对？占位参数赋值，其中第一个参数为int型，表示第几个占位符，后面则为要赋的值。下面展示一个例子：

```
Connection conn = DriverManager.getConnection(url,username,password);
String sql = "INSERT INTO student(name,id_card) VALUES(?,?);";
PreparedStatement pstm = conn.prepareStatemnet(sql);
pstm.setString(1,"1234");
pstm.setString(2,"1234");
pstm.executeUpdate();
ResultSetMetaData rsmd = rs.getMetaData();int columnCount = rsmd.getColumnCount();这个可以获取字段数目，当我们忘记原本的数据库字段数时使用。
```

