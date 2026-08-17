---
title: 旋转图像
published: 2024-08-17 22:16:33
description: '旋转图像 该算法就是找对应位置，偏数学，大部分算法都得需要数学，数学对于算法来说很重要，不要忽视，更不要将其分开思考。这个题我的想法是分每圈考虑，就如同螺旋矩阵那道题一样，然后进行位置对应。题解给了一个对应关系，但是整体考虑，这个会更好，然...'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/rotate-image/description/">旋转图像</a>
&emsp;&emsp;该算法就是找对应位置，偏数学，大部分算法都得需要数学，数学对于算法来说很重要，不要忽视，更不要将其分开思考。这个题我的想法是分每圈考虑，就如同螺旋矩阵那道题一样，然后进行位置对应。题解给了一个对应关系，但是整体考虑，这个会更好，然后还有一个思路就是将旋转变为翻转，这个也不错。

```
  public void rotate(int[][] matrix) {
        if(matrix!=null&&matrix.length!=0){
            int top =0;
            int bottom = matrix.length-1;
            int left = 0;
            int right = matrix[0].length-1;
            int temp1,temp2;
            int index =0;
            while(bottom - top>0 && right-left>0){
        
                for(int i = left;i < right; i++){
                    temp1 = matrix[i][right];
                    matrix[i][right] = matrix[top][i];
                    temp2 = matrix[bottom][right-i+index];
                    matrix[bottom][right-i+index] = temp1;
                    temp1 = matrix[right-i+index][left];
                    matrix[bottom-i+index][left] = temp2;
                    matrix[top][i] = temp1;
                }
                top++;
                bottom--;
                left++;
                right--;
                index++;
            }
        }
    
    }
```
