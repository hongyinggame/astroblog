---
title: 范围求和2
published: 2024-08-13 19:50:24
description: '范围求和2 该题目分别求出行与列的最小值，两者乘积即为答案，注意：操作数组长度为0时为特殊情况。       public int maxCount(int m, int n, int ops)          if(ops.length...'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
### <a href='https://leetcode.cn/problems/range-addition-ii/description/'>范围求和2</a>
&emsp;&emsp;该题目分别求出行与列的最小值，两者乘积即为答案，注意：操作数组长度为0时为特殊情况。

```
    public int maxCount(int m, int n, int[][] ops) {
        if(ops.length==0){
            return m*n;
        }else{
            int maxrow = 0;
            int maxcol = 0;
            for(int i = 0; i < ops.length; i++){
                if(i == 0){
                    maxrow = ops[i][0];
                    maxcol = ops[i][1];
                }else{
                    if(maxrow> ops[i][0]){
                        maxrow = ops[i][0];
                    }
                    if(maxcol > ops[i][1]){
                        maxcol = ops[i][1];
                    }
            }
        }
            return maxcol*maxrow;
        }
        
    }
```
