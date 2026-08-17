---
title: 螺旋矩阵
published: 2024-08-14 20:56:00
description: '螺旋矩阵  该题目我的想法是使用分层去做，但是何题解不同的是我没有设置边界，而是使用圈数来动态决定圈数，我的代码就是空间消耗会很大，有很多不必要的定义。   public List spiralOrder(int matrix)'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/spiral-matrix/description/">螺旋矩阵</a>

&emsp;&emsp;该题目我的想法是使用分层去做，但是何题解不同的是我没有设置边界，而是使用圈数来动态决定圈数，我的代码就是空间消耗会很大，有很多不必要的定义。

```
public List<Integer> spiralOrder(int[][] matrix) {
        int iter = 0;
        ArrayList<Integer>arr = new ArrayList<Integer>();
        if(matrix.length==0){
            return arr;
        }else{
            double round1 = Math.ceil(matrix.length/2.0);
            double round2 = Math.ceil(matrix[0].length/2.0);
            if(round1>round2){
                iter = (int)round2;
            }else{
                iter = (int)round1;
            }
            int i = 0;
            while(i<iter){
                int j,n;
                for(j=i;j<matrix[0].length-i;j++){
                    arr.add(matrix[i][j]);
                }
                if(j!=i){
                    j--;
                }
                for(n=i+1;n<matrix.length-i;n++){
                        arr.add(matrix[n][j]);
                }
                 if(n!=i+1){
                        n=n-1;
                        if(j>i){
                            for(j=j-1;j>=i;j--){
                                arr.add(matrix[n][j]);
                            }
                            j++;
                        
                            for(n=n-1;n>i;n--){
                                arr.add(matrix[n][j]);
                            }
                        }
                    }
                i++;
            }
            return arr;
            
        }
        
    }
```
