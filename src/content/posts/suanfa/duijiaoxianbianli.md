---
title: 对角线遍历
published: 2024-08-15 21:32:51
description: '对角线遍历       public int findDiagonalOrder(int mat)                   if(mat.length==0mat==null)             return null;'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/diagonal-traverse/description/">对角线遍历</a>

```
    public int[] findDiagonalOrder(int[][] mat) {
        
        if(mat.length==0||mat==null){
            return null;
        }else{
            
            int top = 0;
            int bottom = mat.length;
            int left = 0;
            int right = mat[0].length;
            int row =0;
            int col =0;
            int index = 0;
            int[] ord = new int[right*bottom];
            while(row < bottom-1||col < right-1){
                while(row > top && col < right-1){
                    ord[index] = mat[row][col];
                    index++;
                    row--;
                    col++;
                }
                ord[index] = mat[row][col];
                index++;
                if(col+1 < right){
                    col++;
                    while(row < bottom-1 && col > left){
                        ord[index] = mat[row][col];
                        index++;
                        row++;
                        col--;
                    }
                ord[index] = mat[row][col];
                index++;
                if(row+1<bottom){
                    row++;
                }else{
                    col++;
                }
                }else if(row+1 < bottom){
                    row++;
                    while(row < bottom-1 && col > left){
                        ord[index] = mat[row][col];
                        index++;
                        row++;
                        col--;
                    }
                    ord[index] = mat[row][col];
                    index++;
                    if(row+1<bottom){
                        row++;
                    }else{
                        col++;
                    }
                }

            }
            if(row == bottom-1&&col==right-1){
                ord[index] = mat[row][col];
            }
            return ord;
        }
    }
```
