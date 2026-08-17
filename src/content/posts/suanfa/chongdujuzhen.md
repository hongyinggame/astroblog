---
title: 重塑矩阵
published: 2024-08-15 21:07:30
description: '重塑矩阵   第一种：用一个index来计算，这样内存低，但是多了乘除的复杂计算。      public int matrixReshape(int mat, int r, int c)          int x = new intr...'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/reshape-the-matrix/">重塑矩阵</a>

```
第一种：用一个index来计算，这样内存低，但是多了乘除的复杂计算。
     public int[][] matrixReshape(int[][] mat, int r, int c) {
        int[][] x = new int[r][c];
        int m = mat.length;
        int n = mat[0].length;
        double index = 0.0;
        if(m*n != r*c){
            return mat;
        }else{
            while(index < r*c){
                x[(int)(index/c)][((int)index) % c] = mat[(int)(index/n)][((int)index)%n];
                index++;
            }
            return x;
        }

    }
第二种：虽然也用index，但是这里的index只是用于确定一个矩阵的索引，减少了乘除运算，所以时间会快，但是内存会增加，因为另一个矩阵用了两个变量i,j来确定。注意：整数除以整数为0的情况。
 public int[][] matrixReshape(int[][] mat, int r, int c) {
        int[][] x = new int[r][c];
        int m = mat.length;
        int n = mat[0].length;
        int index=0;
        if(m*n != r*c){
            return mat;
        }else{
            for(int i = 0;i<r;i++){
                for(int j=0;j<c;j++){
                    if( index < n){
                        x[i][j] = mat[0][index%n];
                    }else{
                        x[i][j] = mat[index/n][index%n];
                    }
                    index ++;
                    
                }   
            }
            // while(index < r*c){

            //     x[(int)(index/c)][((int)index) % c] = mat[(int)(index/n)][((int)index)%n];
            //     index++;
            // }
            return x;
        }

    }
```
