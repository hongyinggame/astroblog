---
title: 螺旋矩阵2
published: 2024-08-14 21:25:33
description: '螺旋矩阵2 螺旋矩阵2其实就是在1的基础上将遍历的数组值变为我们的值，思路和1一样。    public int generateMatrix(int n)          int i = 1;         int left = 0;...'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/spiral-matrix-ii/description/">螺旋矩阵2</a>
&emsp;&emsp;螺旋矩阵2其实就是在1的基础上将遍历的数组值变为我们的值，思路和1一样。

```
 public int[][] generateMatrix(int n) {
        int i = 1;
        int left = 0;
        int right = n;
        int top = 0;
        int bottom = n;
        int row = 0;
        int col = 0;
        int [][] matrix = new int[n][n];
        while(top<bottom||left<right){
            for(col = left;col<right;col++){
                matrix[top][col] = i;
                i++;
            }
            for(row =top+1;row < bottom; row++){
                matrix[row][right-1] = i;
                i++;
            }
            if(top<bottom&&left<right){
                for(col = right-2;col>=left;col--){
                    matrix[bottom-1][col] = i;
                    i++;
                }
                for(row = bottom-2; row > top; row-- ){
                    matrix[row][left] = i;
                    i++;
                }
            }
            left++;
            right--;
            bottom--;
            top++;
        }
        return matrix;
    }
```
