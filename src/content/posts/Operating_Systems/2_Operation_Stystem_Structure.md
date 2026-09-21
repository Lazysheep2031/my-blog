---
title: Operating-System Structures
published: 2026-09-17
description: 操作系统服务、用户接口、系统调用及其实现、系统程序，以及设计目标与机制和策略的分离
tags: [操作系统]
category: 笔记
draft: false
---

## Operating System Services

### User-Oriented Services

从用户角度需要提供的服务：

**User interface** : CLI, GUI

**Program execution** : 能够跑第三方的应用程序。

**I/O operations** : 插 U 盘，读写文件。

**File-system manipulation** : 创建、删除、读写文件，创建目录。

**Communication** : 进程间通信，网络通信。

**Error detection** : 检测硬件错误，软件错误。

**I/O 关注数据输入输出，文件系统操作还关注文件的命名、组织、属性与权限。** 一次读取 U 盘文件可以同时涉及两类服务。

通信的两种基本方式是**共享内存（Shared Memory）**和**消息传递（Message Passing）**：前者让进程访问共同的内存区域，后者通过发送和接收消息交换信息。

错误检测之后，系统可能返回错误状态、终止出错进程，严重时也可能停止系统。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260918233453.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>除了方便用户，系统自身还需要哪些服务？</summary>

| 服务 | 作用 |
| --- | --- |
| 资源分配 | 为多个进程分配 CPU 时间、主存、文件存储和设备等资源 |
| 记录与统计 | 记录资源使用情况，用于计费、统计或改进系统配置 |
| 保护与安全 | 控制资源访问，限制进程间不当干扰，并防范非法访问 |

**用户能完成任务，与多个任务能够安全、高效地共存，都是操作系统需要考虑的问题。**

</details>

## User Operating System Interface

### Command-Line Interface and Shell

**命令行接口（Command-Line Interface，CLI）** 允许用户直接输入命令。**命令解释器**负责读取、解释并执行命令；不同的命令解释器通常称为不同的 **Shell**。

```text
读取用户命令 → 确定命令及参数 → 执行相应操作 → 继续接收命令
```

命令解释器可以实现在内核中，也可以作为系统程序实现。

命令主要有两种实现方式：

| 方式 | 谁实现命令的具体功能？ | 对扩展的影响 |
| --- | --- | --- |
| **内置命令** | 命令解释器中包含相应代码，必要时请求系统服务 | 增加这类功能通常需要修改解释器 |
| **外部程序** | 命令名指向一个程序文件，由该程序实现具体功能 | 增加程序即可扩展命令集合，不必修改解释器 |

### GUI and Batch Processing

**图形用户界面（Graphical User Interface，GUI）** 以桌面、窗口、图标和菜单等形式组织交互。

**同一个操作系统可以同时提供 CLI 和 GUI。** 

| 方式 | 交互特点 |
| --- | --- |
| 命令行 | 用文本表达操作与参数，适合把重复步骤组织成脚本 |
| 图形界面 | 用可视对象和菜单表达操作，便于浏览与直接选择 |
| 批处理（Batch） | 预先提供一组命令，由系统按约定执行，减少逐步交互 |

用户接口描述的是**用户怎样表达请求**。后面的系统调用接口描述的是**程序怎样请求操作系统服务**。

## System Calls

### System Call Interface

**系统调用（System Call）** 是程序使用操作系统服务的编程接口，例如请求文件读写、创建进程或建立通信。

应用开发通常先使用**应用程序编程接口（Application Programming Interface，API）**，再由库或运行时组织相应系统调用。

### System Call Declarations

```c
#include <sys/socket.h>

int socket(int socket_family, int socket_type, int protocol);
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
```

这些是**函数声明**：给出函数名、参数和返回类型，并没有在头文件中展开内核的全部实现。

### Example

复制一个文件需要哪些系统调用？

假设程序需要获取源文件名和目标文件名，然后把源文件内容复制到目标文件。

<details>
<summary>调用序列、返回状态与错误处理</summary>


```text
输出提示，读取源文件名和目标文件名
            ↓
打开源文件
  └─ 文件不存在或无访问权限：报告错误，结束
            ↓
创建并打开目标文件
  └─ 目标已存在：本例选择报告错误并结束
            ↓
循环读取一批数据
  ├─ 读到数据：将本次实际读到的数据写入目标文件，继续
  ├─ 到达文件末尾：完成复制
  └─ 读取或写入出错：报告失败，进行清理
            ↓
关闭两个文件
            ↓
输出完成信息，正常结束
```

其中，显示提示、接收输入、打开与创建文件、读写、关闭和结束进程，都可能需要系统服务。只数“读一次、写一次”会遗漏大量准备与收尾工作。

| 情况 | 应如何理解？ |
| --- | --- |
| 源文件不存在／无权限 | 打开失败，不能进入正常复制循环 |
| 目标文件已存在 | 采用中止策略；也可以选择覆盖或询问用户等选择 |
| 到达文件末尾 | 表示内容已读完，需要与真正的读取错误区分 |
| 磁盘空间不足／设备错误 | 写入或读取可能失败，不能仍报告复制成功 |
| 函数返回 | 需要检查返回状态，并使用实际传输的数据量 |

一次 `write()` 成功也可能只写入部分数据。实际程序需要继续处理剩余数据及可能出现的错误，不能假设每次都写满。

</details>

### Example

**读懂 `ReadFile()` 的参数**

```c
BOOL ReadFile(
    HANDLE file,
    LPVOID buffer,
    DWORD bytesToRead,
    LPDWORD bytesRead,
    LPOVERLAPPED ovl
);
```

| 参数 | 含义 | 需要分清的内容 |
| --- | --- | --- |
| `file` | 要读取的文件或设备句柄 | 句柄用于标识已打开的对象 |
| `buffer` | 接收数据的缓冲区地址 | 数据写入调用者提供的缓冲区 |
| `bytesToRead` | 本次最多请求读取的字节数 | 请求量未必等于实际读取量 |
| `bytesRead` | 接收实际读取字节数的变量地址 | 在这里讨论的同步读取中，通过指针返回数量 |
| `ovl` | 指向重叠 I/O 所用信息结构的指针 | 与异步／重叠操作有关；本章先识别其作用 |

**返回状态、实际读到的字节数、读到的数据，分别通过不同位置交给调用者。** 不应把布尔返回值当成字节数，也不应把 `bytesRead` 当成数据缓冲区。

<details>
<summary>申请读取 1,024 字节，为什么只处理其中 300 字节？</summary>

假设使用同步文件句柄，读取成功，而从当前位置到文件末尾只剩 300 字节。

本次请求量为 1,024，实际读取量为 300。程序只应把缓冲区中本次得到的 300 字节当成有效读取结果，不能把余下空间也视为新读到的文件内容。

文件读取，实际数量通过返回值给出；到达文件末尾返回 `0`，出错返回 `-1`。

</details>

### System Call Numbers and Dispatch

程序发起系统调用时，操作系统需要知道：**请求哪一种服务，以及用什么参数完成它。**

操作系统会维护一张表，里面存放 number 和指针，指针指向处理这个 system call 的代码。

```text
用户程序调用 API
        ↓
库／运行时准备系统调用编号与参数
        ↓
通过受控入口进入内核
        ↓
系统调用接口根据编号查表
        ↓
执行对应服务，得到状态与返回值
        ↓
返回用户程序，继续执行
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919001644.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

调用者不需要知道内核处理函数的全部实现，但必须遵守接口约定：传入正确参数，理解操作含义，并检查返回结果。

<details>
<summary>系统调用、软中断与进程切换</summary>

系统调用可认为是“软中断”：程序主动触发受控的内核入口，CPU 转入内核执行服务。

进入内核改变了执行权限和代码路径，**不必然切换到另一个进程**。当前进程可以进入内核完成服务后再返回；若期间需要等待 I/O 等事件，系统也可能安排其他进程运行。

</details>

### Example

`printf()` 怎样使用 `write()`？

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919001905.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

```text
用户程序：printf("Greetings")
                 ↓
标准 C 库：处理格式与输出流
                 ↓ 需要向外输出时
系统调用接口：请求 write()
                 ↓
内核：完成相应输出服务
                 ↓
结果返回库函数与用户程序
```

C 语言的 Printf 对应到 system call 的 write 要对应到像素级别的操作。所以每一个简单操作都有可能需要多个 system call 来完成。

### Parameter Passing

参数传递方法。

| 方法 | 做法 | 优点与限制 |
| --- | --- | --- |
| **寄存器** | 直接把参数放入约定的寄存器 | 简单直接，但寄存器数量与宽度有限 |
| **内存参数块／表** | 参数集中存入内存，把该区域地址放入寄存器 | 可传递较多或较复杂的参数；内核按地址取得内容 |
| **栈** | 程序将参数压栈，操作系统按约定取得参数 | 不受可用参数寄存器个数的直接限制 |

内存参数块与栈缓解了寄存器限制，仍受内存大小、地址有效性及接口约定约束，不能理解为参数真正无限。

#### Example

**通过地址 `X` 传递一组参数**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919002105.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开分析：系统调用编号与参数表地址分别解决什么问题？</summary>

假设用户程序已在内存位置 `X` 保存好某次调用需要的参数。

```text
用户程序在内存中准备参数表 X
               ↓
把 X 的地址放入约定的寄存器
               ↓
发起图中示例的系统调用 13
               ↓
内核根据编号 13 找到处理代码
               ↓
处理代码根据地址 X 取得本次参数
```

**调用编号说明“请求什么服务”，地址 X 说明“这次调用的参数在哪里”。** 两者作用不同。寄存器只携带表的地址，无需装下表中的每一项。

其中，`13` 是图中的示意编号，`X` 是示意地址；具体接口还必须约定参数布局与访问方式。

</details>

## Types of System Calls

### System Call Categories


| 类型 | 典型操作 | 理解重点 |
| --- | --- | --- |
| **进程控制（Process Control）** | 创建与终止进程，装入与执行程序，获取／设置进程属性，等待与通知事件，分配与释放内存 | 管理程序的执行、资源和相互协调 |
| **文件管理（File Management）** | 创建、删除、打开、关闭、读写、调整文件位置、获取／设置文件属性 | 文件内容与文件属性都需要管理 |
| **设备管理（Device Management）** | 请求与释放设备，读写，获取／设置设备属性，逻辑连接与分离 | 处理设备使用权和设备操作 |
| **信息维护（Information Maintenance）** | 获取／设置时间日期、系统数据，以及进程、文件、设备的信息 | 查询状态、维护属性、支持统计与调试 |
| **通信（Communications）** | 建立与关闭通信连接，发送与接收消息，传递状态，建立与附接共享内存 | 为不同执行者交换信息提供接口 |

现在目前大概有200多个 system call 支持操作系统的全部功能，操作系统也有其他的手段，比如发送信号，来实现一些功能。

### Communication Models

| 模型 | 系统提供什么？ | 进程怎样交换信息？ |
| --- | --- | --- |
| 消息传递 | 建立通信关系、发送与接收消息等能力 | 通过消息操作传递信息，可用于本机或跨机器通信 |
| 共享内存 | 创建、附接共享内存区域等能力 | 访问共同的内存区域，直接读写其中的数据 |

共享内存建立后，进程还要协调谁在什么时候读写，避免不当的并发更新。**获得共享区域，与正确使用共享数据，是两个需要分别解决的问题。** 

### Example

**MS-DOS 与 FreeBSD 的进程控制**

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px;">
<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919002308.png"  style="width: calc((100% - 16px) / 2); max-width: 320px; height: auto; display: block; margin: 0;" />
<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919002405.png"  style="width: calc((100% - 16px) / 2); max-width: 320px; height: auto; display: block; margin: 0;" />
</div>

#### MS-DOS: Partial Shell Overwrite

启动时，内存中有内核、命令解释器和空闲区域；运行程序后，进程占据部分空闲区域，也覆盖了命令解释器原来占用的一部分空间，下面仍保留内核与一部分解释器。

#### FreeBSD: Shell and Process Coexistence

命令解释器与多个进程可以同时驻留

```text
Shell 接收运行某程序的命令
             ↓
fork()：建立子进程
             ↓
子进程通过 exec() 装入并执行目标程序
             ↓
父进程 Shell 根据前台／后台方式组织后续执行
  ├─ 前台：等待程序结束，再继续处理下一条命令
  └─ 后台：继续接收命令，目标程序也参与系统调度
             ↓
目标进程结束，返回退出状态
```

<details>
<summary>为什么启动程序既需要 fork，又需要 exec？图中多个进程是否一定并行？</summary>

在 UNIX 风格路径中，两步解决不同问题：**`fork()` 创建新的进程，`exec()` 让相应进程执行目标程序**。父进程 Shell 因而可以保留自己的执行环境，负责后续交互。

图中多个进程同时驻留，也不保证指令在同一时刻执行。单个 CPU 核心可以交替运行多个进程，实现并发；并行执行还需要相应硬件与调度条件。

</details>

## System Programs

### Program Development and Execution

**系统程序（System Programs）** 把基础服务组织成便于使用的工具，为程序开发、执行和系统管理提供环境。部分工具只是系统调用的简单用户接口，另一些则包含复杂逻辑。

| 类别 | 典型功能或工具 |
| --- | --- |
| **文件管理** | 创建、删除、复制、重命名、打印、转储、列出文件与目录 |
| **状态信息** | 查看日期时间、空闲内存、磁盘空间、用户数；提供性能、日志与调试信息 |
| **文件修改** | 使用文本编辑器修改内容，搜索内容或进行文本转换 |
| **程序设计语言支持** | 编译器、汇编器、解释器、调试器 |
| **程序装入与执行** | 绝对装入器、可重定位装入器、链接编辑器、覆盖装入器，以及相应调试支持 |
| **通信** | 用户间发送消息、浏览网页、电子邮件、远程登录、跨机器传送文件 |
| **应用程序** | 系统提供的软件环境； |

**文件管理** 侧重文件对象及目录组织；**文件修改** 侧重文件内部的内容。状态工具通常还会把取得的数据整理、格式化后显示出来；一些系统通过 **注册表（Registry）** 存储和检索配置。

<details>
<summary>系统自带的软件与自己安装的软件，怎样区分？</summary>

系统程序侧重提供开发、执行、管理环境，应用程序侧重完成用户的具体任务。两者都可能通过系统调用使用内核服务，系统程序这一名称本身也不表示它必然在内核态运行。

</details>

### Example

用 DTrace 观察系统调用路径

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260919002846.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>调用箭头与缩进分别表示什么？</summary>

删去中间细节后，可以读成：

```text
XEventsQueued             U
  ……
  -> ioctl                U
    -> ioctl              K
      -> getf             K
        ……
      <- getf             K
      ……
    <- ioctl              K
  <- ioctl                U
  ……
```

`U` 标记用户侧执行，`K` 标记内核侧执行；`->` 与 `<-` 展示函数进入和返回，缩进体现调用嵌套。图中可看到用户侧 `ioctl` 进入内核处理，之后又逐层返回。

**内核中出现多行函数名，不等于应用发起了同样多次系统调用。** 一次系统调用的内核实现可以继续调用多个内部函数。顶部的 `matched 52377 probes` 是匹配到的探针数量。

</details>

## Operating System Design and Implementation

### Design Goals and Constraints

### Separation of Mechanism and Policy

**机制（Mechanism）** 决定怎样完成操作；**策略（Policy）** 决定要采用什么选择。

| 概念 | 要回答的问题 | 定时器例子 |
| --- | --- | --- |
| 机制 | 怎样做到？ | 定时器到期产生中断，让系统重新取得 CPU 控制权 |
| 策略 | 做什么选择？ | 让某个程序运行多久，再通过定时器收回控制？ |

机制提供可用能力，策略利用这些能力作出选择。**将二者分离后，修改策略时可以尽量复用已有机制，提高系统灵活性。**

优先级：同一套优先级机制，可以支持“I/O 密集型程序优先”，也可以支持“CPU 密集型程序优先”。选择哪一类优先，属于策略。

#### Example

**改变时间片，需要重新设计定时器吗？**

<details>
<summary>展开分析</summary>

假设定时器机制支持设置不同的到期时间。将运行时限由一个值改为另一个值，主要改变的是策略参数，可以继续复用原有定时器机制。

分离的价值就在于：**经常变化的选择不必与底层实现绑死。**

但这有一个前提：新策略仍在机制能支持的范围内。如果原有机制不能表达新的要求，单纯修改参数仍然不够。因此，“分离”保证的是更好的可变更性，不保证任何新策略都无需修改机制。

</details>

### Example

**门禁卡系统中的机制与策略**

| 部分 | 在例子中的内容 |
| --- | --- |
| **机制** | 磁卡读取器、可远程控制的门锁，以及连接安全服务器的通信设施 |
| **策略** | 哪些人、在什么时间、可以进入哪些门 |
| **决策的组织方式** | 集中安全服务器查询门禁规则数据库，作出是否允许进入的决定 |

```text
读卡器读取卡片信息
        ↓
安全服务器依据“人、门、时间”等信息查询规则
        ↓
得到允许／拒绝的决定
        ↓
通过门锁控制机制执行决定
```

### X Window System Design Principles

**X 窗口系统（X Window System）** 七条原则可以归纳如下。

| 原则 | 理解 |
| --- | --- |
| **由真实需求推动功能** | 只有缺少某项功能会妨碍真实应用实现时，才考虑把它加入系统 |
| **明确系统边界，并保留扩展能力** | 同时决定系统承担哪些职责、哪些职责留给外部；通过向上兼容的扩展满足额外需求 |
| **避免缺乏依据的泛化** | 从单个例子作概括已经有风险，完全没有实例支撑的抽象更应谨慎 |
| **问题未理解充分时，避免仓促固定方案** | 不要过早把尚未弄清的问题固化成底层接口或功能 |
| **优先采用足够好的简单方案** | 若少量工作可以取得大部分效果，优先考虑更简单的实现 |
| **尽量隔离复杂性** | 让复杂细节集中在边界清晰的部分，减少向其他部分扩散 |
| **提供机制，把界面策略交给客户端** | 提供实现交互所需的基础能力，由客户端决定具体的用户界面政策 |

这些原则共同强调：**基础系统保持清晰的职责和通用能力，具体选择尽量留在可以变化的位置。**

## Operating System Structure

### Simple Structure: MS-DOS

MS-DOS 的设计目标是在很小的空间内提供尽可能多的功能。它没有清晰的模块划分，各层功能与接口之间也缺少良好分离。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920161655.png" alt="MS-DOS 的层次及跨层访问关系" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />


应用程序 ：使用系统和底层设备提供的功能
常驻系统程序 ：提供系统运行所需的基本服务
MS-DOS 设备驱动 ：与具体设备交互
ROM BIOS 设备服务 ： 固件中的基本输入输出能力

箭头允许跨过中间部分直接访问底层。因此，**没有实现严格的层间边界。**

### Layered Approach

**分层结构（Layered Approach）** 把系统划分成若干层。

最低层 `layer 0` 是硬件，最高层 `layer N` 是用户接口；每层使用较低层提供的操作与服务。

一层可以看成“**数据结构＋操作这些数据的函数**”。它对上提供接口，并隐藏内部实现。

```text
用户接口                         第 N 层
    ↓ 使用下层提供的服务
……
    ↓
较底层的服务与设备访问
    ↓
硬件                             第 0 层
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921142603.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

便于分工开发 ：先约定接口，不同层的实现可相对独立推进
便于理解与维护 ：使用下层服务时，不必了解全部实现细节
便于调试与验证 ：可以从最底层开始，逐层检查

分层代价：
首先，**层次不一定容易划分**：内存、进程、文件等功能可能互相依赖。
其次，一个请求经过多个中间层，会增加接口处理、数据传递等开销。

### Monolithic Structure: Traditional UNIX

**单体内核（Monolithic Kernel，也称宏内核）** 将大量内核功能放在同一内核地址空间中实现。
传统 UNIX 分为两大部分：**系统程序与内核**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920162438.png" alt="传统 UNIX 的系统调用接口、内核与硬件" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中**系统调用接口以下、物理硬件以上**的区域属于内核，包含文件系统、CPU 调度、内存管理、终端处理和设备驱动等功能。

| 特点 | 影响 |
| --- | --- |
| 多种服务在同一内核空间运行 | 内部函数间交互直接，通信开销较低 |
| 功能联系紧密 | 修改某一部分可能影响其他部分 |
| 大量代码具有内核权限 | 错误的影响范围可能较大 |

Linux 既具有单体内核的特点，也支持可加载模块。

### Microkernel System Structure

**微内核（Microkernel）** 尽量缩小内核中的功能集合，将其他服务放入用户空间，并通过消息传递协作。

| 留在内核的核心机制 | 可以移到用户空间的服务 |
| --- | --- |
| 基本调度、内存管理、通信等 | 文件服务、部分设备服务等，具体划分依系统设计而定 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921142927.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

**Application Reading a File**

<details>
<summary>微内核中的文件请求怎样完成？</summary>

```text
用户态应用提出文件请求
          ↓ 消息
微内核提供通信机制
          ↓
用户态文件服务处理请求
          ↓ 消息回复
应用取得结果
```

与多个服务都处于同一内核空间的组织相比，这里需要协调不同服务进程。
**一次完整的文件服务，可能包含多次跨边界交互。** 但具体消息数和切换次数依实现而定。
</details>

### Modules

**可加载内核模块（Loadable Kernel Module）** 将内核的一部分功能组织成独立组件，按需要在启动时或运行期间加载。各组件通过已定义的接口协作。

这具有面向对象思想：核心组件各自封装功能，通过接口联系。

| 与其他结构比较 | 区别 |
| --- | --- |
| 与严格分层比较 | 模块之间可按接口直接调用，依赖关系更灵活 |
| 与典型微内核比较 | 内核模块仍在内核空间工作，模块间可直接调用，不必统一通过跨进程消息传递 |
| 与固定编入全部功能比较 | 可以把不常用、当前不需要的功能留在磁盘，需要时再加载 |

#### Example

**On-Demand Loading of Device Drivers and Game Resources**

<details>
<summary>为什么无需把所有功能都在开机时装入内存？</summary>

机器当前没有使用这些设备时，对应功能可以不必一开始就全部驻留。需要支持相应设备时，再通过模块机制提供功能。

**磁盘中保存的全部内容，不要求同时驻留内存。**

</details>

#### Solaris Modular Approach

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920163432.png" alt="Solaris 核心内核与不同类型的可加载模块" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中核心 Solaris 内核周围包含：**调度类、文件系统、可加载系统调用、可执行文件格式、STREAMS 模块、其他模块，以及设备与总线驱动**。


### Mac OS X Structure

**混合结构（Hybrid Structure）** 结合不同组织方式，在性能、功能、可维护性和隔离之间进行取舍。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920163457.png" alt="Mac OS X 的 Mach、BSD 与上层应用环境" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

上部是应用环境与公共服务，下部的内核环境结合 **Mach 与 BSD**。
Mach 提供调度、内存和通信等基础能力，BSD 提供相应 UNIX/POSIX 功能；为了减少跨地址空间的开销，相关内核组成部分被结合到同一地址空间中。

### Comparison of Operating-System Structures

| 结构 | 核心组织方式 | 主要收益 | 主要限制 |
| --- | --- | --- | --- |
| 简单结构 | 功能边界与接口分离较弱 | 在有限条件下实现功能 | 耦合强，维护和保护困难 |
| 分层结构 | 按较低层到较高层组织依赖 | 便于分工、理解、逐层验证 | 层次难划分，逐层交互有开销 |
| 单体内核 | 多种服务在同一内核空间实现 | 内部交互直接、效率较高 | 功能联系紧密，错误影响可能较广 |
| 微内核 | 核心保留基本机制，其他服务移至用户空间 | 有利于隔离、扩展、移植 | 服务间通信与切换有开销 |
| 可加载模块 | 核心加按需加载的组件 | 灵活扩展并减少不必要的驻留 | 内核模块仍具有较高权限 |
| 混合结构 | 结合不同组织方式 | 根据目标综合取舍 | 实际结构复杂，需具体分析 |

**这些分类并非全部互斥。** 例如，单体内核可以具有模块化设计；一个系统也可以局部采用分层，在其他部分使用不同组织方式。

## Virtual Machines

### Virtual Machine Abstraction

**虚拟机（Virtual Machine，VM）** 把一台物理计算机的硬件能力抽象成多个执行环境。每个环境可运行自己的操作系统，使其中的程序看到独立的处理器、内存和设备视图。

**虚拟机监控器（Virtual Machine Monitor，VMM，也称 Hypervisor）** 负责建立、运行和管理这些虚拟机，并协调它们对真实资源的使用。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920163954.png" alt="非虚拟机系统与多个虚拟机的结构对比" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

左图是一套内核管理多个进程；右图在物理硬件之上加入虚拟化实现，每个虚拟机拥有自己的内核和进程。

**分时系统为进程提供执行机会，系统虚拟机进一步提供可供客户操作系统使用的机器环境。**

### How the Illusion of a Dedicated Machine Is Created

虚拟化的基本思想：

| 物理资源 | 向上提供的表象或功能 |
| --- | --- |
| CPU | 通过调度，使不同环境获得自己的执行机会 |
| 内存 | 向各环境提供其可使用的内存视图 |
| 文件系统与假脱机 | 提供虚拟读卡机、虚拟行式打印机 |
| 分时终端 | 作为虚拟机操作者的控制台 |

这些虚拟资源最终仍需映射到物理资源。**逻辑上独立，物理硬件数量不增加。**

### VMware Architecture

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920164240.png" alt="宿主操作系统、虚拟化层与多个客户操作系统" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

上面运行虚拟化层，再运行 FreeBSD、Windows NT、Windows XP 等客户系统。每个客户系统有自己的虚拟 CPU、虚拟内存和虚拟设备；宿主系统也可以直接运行本地应用。

| 名称 | 含义 |
| --- | --- |
| **宿主操作系统（Host OS）** | 运行虚拟化软件并管理底层资源的系统 |
| **客户操作系统（Guest OS）** | 虚拟机内部运行的系统 |
| 虚拟化层 | 为客户系统提供虚拟硬件环境并协调资源 |

### Example

用户看到的是分配给虚拟环境的资源配置，背后可能与其他虚拟机共享同一物理服务器。

<details>
<summary>为什么 10 台物理机器可能承载更多份逻辑资源需求？</summary>

有 10 台物理机器，但提供给用户的虚拟资源需求合计达到约 20 台机器的计算能力。

前提是：**不同用户不会一直同时满载**。当实际需求错峰出现时，系统能让同一份硬件服务更多用户；当需求同时升高时，就可能发生资源竞争，实际性能受到影响。

</details>

### Isolation, Development, Testing, and Sharing

| 用途或特征 | 价值 |
| --- | --- |
| **隔离** | 将不同客户系统的执行环境分开，减少直接干扰 |
| **系统开发与测试** | 在虚拟环境中修改、运行和测试系统，尽量避免破坏主力环境 |
| **多系统共存** | 在同一物理机器上使用不同系统进行开发或兼容性测试 |
| **资源整合** | 把多台低负载系统的工作合并到较少的物理机器上 |

虚拟化系统还可以提供暂停、快照、克隆等功能，使测试前保存状态、失败后恢复更加方便。

<details>
<summary>虚拟机相互隔离，是否就完全无法通信或共享文件？</summary>

可以通过**受控的共享文件系统或虚拟网络**提供共享和通信。

</details>

### Why Virtual Machines Are Difficult to Implement

客户系统既要看到类似真实硬件的接口，又不能不受限制地控制整台物理机器。
**虚拟用户态与虚拟内核态**也要得到正确处理。

<details>
<summary>客户内核想执行特权操作时怎么办？</summary>

在一种传统双模式模型中，客户系统的“虚拟内核态”仍不能等同于物理机器的最高管理权限。客户内核执行受保护操作时，可以由 VMM 获得控制，再代表客户执行或模拟相应效果。

这样，客户系统保留“自己有内核”的视图，真实资源仍由虚拟化层管理。

若客户程序使用与宿主不同的 CPU 指令集，还涉及指令集模拟。

</details>

### VM vs Docker

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921144040.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**容器（Container）** 为应用及其依赖提供相对独立的运行环境。
**系统虚拟机通常各有客户内核；图中的多个容器共享运行它们的宿主内核。**

| 比较项 | 系统虚拟机 | 图中的容器模型 |
| --- | --- | --- |
| 提供的环境 | 虚拟硬件及其上的操作系统 | 应用、库、配置等运行环境 |
| 内核 | 每个客户系统有自己的内核 | 多个容器共享同一个宿主内核 |
| 不同系统的支持 | 可以承载不同客户系统，需满足虚拟化或模拟条件 | 应用仍受共享内核及接口兼容性的约束 |
| 资源开销 | 还要维护客户系统本身 | 通常更轻量，无需每个容器各运行一套客户内核 |
| 隔离边界 | 以虚拟机器环境为边界 | 以操作系统提供的容器隔离机制为基础 |
| 典型用途 | 运行不同系统、系统开发与测试 | 分离应用环境、管理依赖与部署 |


#### Example:

**Dependency Conflicts Between Two Model Projects**

<details>
<summary>人脸识别项目与卫星图像项目需要不同版本的依赖，怎么办？</summary>

项目 A 使用 PyTorch 2.1 一类的新依赖，项目 B 依赖 1.x 一类的旧版本。如果整个机器只维护一套全局环境，修改版本来满足 B，就可能破坏 A。

可分别组织环境：

```text
项目 A → 环境 A → A 所需的软件、库、配置
项目 B → 环境 B → B 所需的软件、库、配置
```

重点在于**把应用的依赖集合分开管理**。容器可以保存更完整的应用运行环境；

</details>

<details>
<summary>在 Mac 上使用 Docker，容器里就是另一套 macOS 吗？</summary>

Docker Desktop 的官方文档说明，它通过 Linux 虚拟机运行 Linux 容器；在 Mac 上使用这种方式时，可以概括为：

```text
macOS → Linux 虚拟机 → Docker Engine → 多个 Linux 容器
```

容器共享的是这台 Linux 虚拟机的内核。**虚拟机和容器可以组合使用**，所以“容器共享内核”与“Docker Desktop 内部使用虚拟机”并不矛盾。

</details>

### The Java Virtual Machine

**Java 虚拟机（Java Virtual Machine，JVM）** 提供的是程序语言的执行环境。它接受 Java 字节码，并由对应平台上的实现完成执行。

```text
Java 源程序
     ↓ javac 编译
字节码 .class 文件
     ↓ 类加载与执行
对应平台上的 JVM
     ↓
宿主操作系统与硬件
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260920164751.png" alt="Java 字节码、类加载器、解释器与宿主系统" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中，**类加载器（Class Loader）** 装入程序和 Java API 的 `.class` 文件，再交给执行部分处理，没有直接产生特定 CPU 的本地机器码。不同平台具有对应的 JVM 实现，字节码与统一接口使程序不必直接处理全部平台差异。


<details>
<summary>JVM 只会逐条解释执行吗？</summary>

**即时编译（Just-in-Time Compilation，JIT）**：把相应字节码编译为宿主机器的本地指令，再使用编译后的代码执行。

字节码验证：检查装入的字节码是否满足相应要求

垃圾回收：回收不再使用的对象所占空间。

因此，“Java 编译为字节码”与“运行时还可以编译成本地代码”属于不同阶段，可以同时成立。跨平台也需要相应 JVM 与依赖支持，不是完全不受版本和外部库约束。

</details>

### Distinguishing Different Virtual Environments

| 对象 | 主要提供什么？ | 是否各有独立客户内核？ |
| --- | --- | --- |
| 系统虚拟机 | 虚拟硬件上的操作系统环境 | 通常有 |
| 容器 | 共享宿主内核上的应用环境 | 通常没有 |
| JVM | Java 字节码与语言运行时环境 | 没有 |
| Python 虚拟环境 | 独立的 Python 包及相关环境配置 | 没有 |

## Operating System Generation

### Configuring the System for Specific Hardware

**系统生成（System Generation，SYSGEN）** 关注怎样使一套操作系统适合具体机器。操作系统可能面向一类机器设计，但实际机器的设备与配置各不相同，需要取得相应硬件信息并选择功能。

```text
取得或编写操作系统代码
          ↓
根据目标硬件与需求进行配置
          ↓
生成相应系统：编译或选择、链接模块等
          ↓
安装到可供启动的存储环境
          ↓
启动系统
```

`SYSGEN` 表示配置与生成系统的概念；

### Three Operating-System Generation Approaches

| 方式 | 何时选择所需功能？ | 取舍 |
| --- | --- | --- |
| 按配置重新编译 | 编译时 | 定制程度高，但生成工作较多 |
| 选择已有目标模块再链接 | 链接时 | 不必全部重新编译，但灵活性受模块划分影响 |
| 模块化系统按参数选择功能 | 运行时 | 便于适应配置变化，需要相应动态机制 |

系统生成决定**系统包含什么、怎样适应机器**；系统启动决定**机器如何找到并开始执行它**。

## System Boot

### Where the Initial Boot Code Comes From

计算机刚上电时，操作系统还没有运行，因此不能依赖已经存在的操作系统服务来装入自己。

**引导程序（Bootstrap Program／Boot Loader）** 负责找到内核、把它装入内存，并开始执行。

上电后执行从硬件规定的位置开始，初始启动代码保存在**固件（Firmware）** 中。

```text
上电或复位
    ↓
从规定入口执行固件中的初始代码
    ↓
初始化必要状态，找到后续引导代码
    ↓
找到内核映像，装入内存
    ↓
开始执行内核
    ↓
内核继续初始化、建立文件系统与服务环境
```

### Multistage Boot Process

一种分阶段方式：位于固定存储位置的**引导块（Boot Block）** 先装入更完整的引导程序，再由它装入内核。
> 初始代码空间有限，因此可以逐步装入功能更完整的后续代码。

| 对象 | 主要职责 |
| --- | --- |
| 固件中的初始代码 | 在操作系统运行前开始执行，准备并定位后续启动阶段 |
| 引导块中的代码 | 在相应启动方案中，衔接到后续引导程序 |
| 引导程序 | 定位、装入并启动内核 |
| **内核映像（Kernel Image）** | 内核本身的可装入表示 |
| 已运行的内核 | 完成后续初始化并建立系统服务 |

<details>
<summary>引导扇区、MBR 与内核映像</summary>

**引导扇区／引导块中的代码负责启动衔接；内核映像保存内核代码。** 

</details>

## AI Era

### Two Control Planes in the AI Era

```text
传统系统：应用 → API／系统调用 → 内核 → 硬件

智能体系统：用户意图
              ↓
           LLM／智能体：理解目标并规划行动
              ↓
           应用、工具、API
              ↓
           内核：管理资源并执行受保护操作
              ↓
           硬件
```

