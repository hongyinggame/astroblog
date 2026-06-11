---
title: 注解二
published: 2024-09-28 16:11:54
pinned: false
description: 注解的解析 注解的解析 需要解析那个对象的注解就加载那个对象，例如：解析类则获取Class对象（反射）； 常用方法： isAnnotationPresent(Class
  class);是否存在该注解；...
tags:
- 动态
- 旧文件
category: 文章示例
draft: false
image: ./images/firefly2.avif
---

## 注解的解析

#### 注解的解析

* 需要解析那个对象的注解就加载那个对象，例如：解析类则获取Class对象（反射）；
* 常用方法：
  * isAnnotationPresent(Class<?> class);是否存在该注解；
  * getDeclaredAnnotation(Class<?> class); 获取注解对象（需要强转）；
  * getDeclaredAnnotations();获取所有注解构成的数组；
  * 注解对象.属性（方法）获取属性值。
