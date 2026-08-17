---
title: 矩阵置零
published: 2024-08-17 22:07:00
description: '矩阵置零 如何达到空间复杂度为O(1)这个没有想到，通过看题解明白了，采用内部矩阵记录，我还是想偏了，我以为用有限个值记录就行了，所以就想不明白不记录全部怎么保证记录正确的，结果发现还是需要足够的值，只不过采用内部矩阵来记录，不新创开辟空间...'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/set-matrix-zeroes/description/">矩阵置零</a>
&emsp;&emsp;如何达到空间复杂度为O(1)这个没有想到，通过看题解明白了，采用内部矩阵记录，我还是想偏了，我以为用有限个值记录就行了，所以就想不明白不记录全部怎么保证记录正确的，结果发现还是需要足够的值，只不过采用内部矩阵来记录，不新创开辟空间，现在了解了，下次注意。
&emsp;&emsp;附我的代码，当然不如题解代码：
```
public void setZeroes(int[][] matrix) {
        int m = matrix.length;
        int n = matrix[0].length;
        HashSet<Integer> row = new HashSet<Integer>();
        HashSet<Integer> col = new HashSet<Integer>();
        int index = 0;
        for(int i =0;i<m;i++){
            for(int j = 0;j<n;j++){
                if(matrix[i][j] == 0){
                    row.add(i);
                    col.add(j);
                }
            }
        }
        for(int i: row){
            for(int j = 0;j<n;j++){
                if(matrix[i][j]!=0){
                    matrix[i][j] = 0;
                }
                
            }
        }
        for(int i: col){
            for(int j = 0;j<m;j++){
                if(matrix[j][i]!=0){
                    matrix[j][i] = 0;
                }
                
            }
        }
    }
```
