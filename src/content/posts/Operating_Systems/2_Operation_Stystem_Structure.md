---
title: Operating-System Structures
published: 2026-09-17
description: 
tags: [操作系统]
category: 笔记
draft: false
---

## Operating System Services

从用户角度需要提供的服务：

**User interface** : CLI, GUI

**Program execution** : 能够跑第三方的应用程序。

**I/O operations** : 插 U 盘，读写文件。

**File-system manipulation** : 创建、删除、读写文件，创建目录。

**Communication** : 进程间通信，网络通信。

**Error detection** : 检测硬件错误，软件错误。

## User Operating System Interface

CLI 和 GUI

## System Calls

只有 C 和 C++ 语言可以直接调用系统调用，其他语言需要通过库函数间接调用。

```c
#include <sys/socket.h>
int socket(int socket_family, int socket_type, int protocol);
int bind(int sockfd, const struct sockaddr *addr, socklen_t
addrlen);
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
int connect(int sockfd, const struct sockaddr *addr, 
socklen_t addrlen);
```

里面就是 API，也是 System call。

高阶语言是很多个 system call 的组合。

system call 是一种中断（软中断），由软件产生。每个system call 都有一个唯一的 number。

操作系统会维护一张表，里面存放 number 和指针，指针指向处理这个 system call 的代码。

C 语言的 Printf 对应到 system call 的 write 要对应到像素级别的操作。所以每一个简单操作都有可能需要多个 system call 来完成。

## Types of System Calls

分为以下几大类：

1. Process control
2. File management
3. Device management
4. Information maintenance
5. Communications

现在目前大概有200多个 system call 支持操作系统的全部功能，操作系统也有其他的手段，比如发送信号，来实现一些功能。

### Example 

Example of process control system calls:

MS-DOS 

FreeBSD Running Multiple Programs

## System Programs

用户应用程序和系统应用程序没有一个明确的区分，一般认为 windows 卖给你后自带的应用程序是系统应用程序（磁盘应用整理，系统工具），用户自己安装的应用程序是用户应用程序。

## Operating System Design and Implementation

最优操作系统是不可解的。

Policy: What will be done?
Mechanism: How to do it?

## Operating System Structure

