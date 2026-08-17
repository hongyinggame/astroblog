---
title: 生命周期
published: 2024-08-19 21:53:34
description: '生命周期 这个官方文档的解法更好，更巧妙，而我的一方面另开了空间，同时我判断也比较复杂，不太支持用我的。   public void gameOfLife(int board)          int m = board.length;'
tags: [算法, 旧文件]
category: 文章示例
draft: false
---
<a href="https://leetcode.cn/problems/game-of-life/description/">生命周期</a>
&emsp;&emsp;这个官方文档的解法更好，更巧妙，而我的一方面另开了空间，同时我判断也比较复杂，不太支持用我的。

```
public void gameOfLife(int[][] board) {
        int m = board.length;
        int n = board[0].length;
        int[][] flag = new int[m][n];
        int r;
        int c;
        int count;
        for(int i = 0;i<m;i++){
            for(int j = 0; j < n; j++){
                r = i-1;
                c = j-1;
                count = 0;
                if(r>=0){
                    if(board[r][j]==1){
                            count++;
                    }
                    if(c>=0){
                        if(board[r][c]==1){
                            count++;
                        }
                        if(board[i][c]==1){
                            count++;
                        }
                        if(i+1<m){
                            if(board[i+1][c]==1){
                                count++;
                            }
                            if(board[i+1][j]==1){
                                count++;
                            }
                        }
                    }else{
                        if(i+1<m){
                            if(board[i+1][j]==1){
                                count++;
                            }
                        }
                    } 
                    if(j+1<n){
                        if(board[r][j+1]==1){
                            count++;
                        }
                        if(board[i][j+1]==1){
                            count++;
                        }
                        if(i+1<m){
                            if(board[i+1][j+1]==1){
                                count++;
                            }
                        }
                    } 
                }else{
                        if(c>=0){
                            if(board[i][c]==1){
                                count++;
                            }
                            if(i+1<m){
                                if(board[i+1][c]==1){
                                    count++;
                                }
                                if(board[i+1][j]==1){
                                    count++;
                                }
                            }
                        }else{
                            if(i+1<m){
                                if(board[i+1][j]==1){
                                    count++;
                                }
                            }
                        } 
                        if(j+1<n){
                            if(board[i][j+1]==1){
                                count++;
                            }
                            if(i+1<m){
                                if(board[i+1][j+1]==1){
                                    count++;
                                }
                            }
                        }
                }
                if(board[i][j]==1){
                    if(!(count==2||count==3)){
                        flag[i][j] = 1;
                    }
                }else{
                    if(count==3){
                        flag[i][j] = 1;
                    }
                }
            } 
        }
        for(int i = 0;i<m;i++){
            for(int j = 0;j<n;j++){
                if(flag[i][j]==1){
                    if(board[i][j] == 0){
                        board[i][j] = board[i][j]+1;
                    }else{
                        board[i][j] = board[i][j]-1;
                    }
                    // board[i][j] = board[i][j]^flag[i][j];
                }
            }
        }
    }
```
