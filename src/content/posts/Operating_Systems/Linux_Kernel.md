---
title: Rebuilding the Linux Kernel
published: 2026-09-20
description: Linux 内核的组织与源码目录、内核开发特点、配置与重新编译、/proc 接口，以及 BIOS、MBR、GRUB、init 和 IA-32 启动流程
tags: [操作系统]
category: 笔记
draft: false
---

```text
内核的职责与结构
      ↓
在源码目录中定位实现
      ↓
配置 → 编译 → 安装 → 选择新内核启动
      ↓
固件 → 引导程序 → 内核初始化 → 用户空间初始化 → 登录
```

## Linux Kernel

### Linux System Architecture

**GNU/Linux 系统包含用户程序、系统库、内核和硬件等层次；Linux 内核只是其中的核心部分。**

| 层次 | 主要内容 | 作用 |
| --- | --- | --- |
| 用户空间 | 应用程序、系统工具、GNU C 库 `glibc` | 为用户完成任务，并提供程序调用的库接口 |
| 系统调用接口 | 文件读写、进程操作等受控入口 | 接收用户程序对内核服务的请求 |
| 内核空间 | 调度、内存、文件系统、网络、驱动等 | 管理资源，执行受保护的系统操作 |
| 体系结构相关代码 | 与具体处理器、平台相关的实现 | 把通用内核机制落实到相应硬件 |
| 硬件 | CPU、内存、设备等 | 执行指令，保存与传输数据 |

**`glibc` 位于用户空间。** 它可以整理系统调用参数、封装内核服务，也提供排序、字符串处理等不必对应系统调用的功能。不能把“调用一个 C 库函数”一律等同于“进入一次内核”。

```text
用户程序
   ↓ 调用库函数；需要内核服务时继续向下
glibc
   ↓ 系统调用
Linux 内核
   ↓ 由相应子系统和驱动处理
硬件
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921133505.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Linux Kernel Subsystems

| 子系统 | 核心问题 | 例子 |
| --- | --- | --- |
| 系统调用接口 | 用户程序怎样请求内核服务？ | `read`、`write` 等基本操作 |
| 进程调度 | 当前让谁使用 CPU？ | 控制进程获得 CPU 的机会 |
| 内存管理 | 多个进程怎样安全地使用内存？ | 分配、回收与共享内存区域 |
| 虚拟文件系统（Virtual File System，VFS） | 怎样统一访问不同文件系统？ | 为不同文件系统和设备提供统一接口 |
| 网络子系统 | 怎样进行网络通信？ | 网络协议及相应硬件支持 |
| 进程间通信（Interprocess Communication，IPC） | 进程怎样交换数据、协同工作？ | 共享内存、消息队列、管道 |
| 设备驱动与 I/O 支持 | 怎样操作具体设备？ | 将系统请求落实为设备操作 |

**VFS 是统一的抽象与接口层。** ext2、FAT 等具体文件系统提供各自的实现，内核通过统一接口使用它们。

```text
统一的文件操作
      ↓
     VFS
      ├─ ext2 等文件系统实现
      ├─ FAT 等文件系统实现
      └─ 其他符合接口的实现
```

### Kernel Architecture

**Linux 采用单体内核（Monolithic Kernel）结构，同时支持模块化。** 内核的主要组件在同一内核地址空间内协作，模块之间可以通过内核内部接口和函数调用交互。

单体结构 ：内核的主要组件在同一内核地址空间内协作。
模块化设计 ：模块之间可以通过内核内部接口和函数调用交互。
可加载内核模块（Loadable Kernel Module，LKM）：在内核运行时可以动态加载和卸载的模块。

**支持动态加载，并不会使加载后的代码自动变成用户程序。** 内核模块运行在具有特权的内核态。

## Linux Kernel Source and Development

### Characteristics of Kernel Development

**内核开发需要直接承担系统内部状态、资源和并发正确性的责任，错误的影响可能越过单个应用。**

## Compiling the Linux Kernel

### Kernel Image and Loadable Modules

**源码经过配置和编译，产生内核映像及相应模块；这些产物安装后，才具备被引导程序选择、装入的条件。**

### GRUB Configuration

**GRUB 是引导程序；它可以根据配置选择并加载不同内核。** 它与前面的固件属于不同阶段。

## Linux Boot Process

### Linux System Boot Process

**启动是分阶段建立运行条件的过程。** 内核尚未运行时，先由已有的固件和引导代码找到、装入它；内核初始化之后，再建立用户空间的服务与交互环境。

传统流程如下：

```text
上电
 ↓
BIOS 执行硬件自检、按启动顺序寻找设备
 ↓
执行启动记录及后续引导代码
 ↓
引导程序选择并装入内核映像
 ↓
解压内核 → 内核初始化
 ↓
建立 init 进程
 ↓
读取配置、执行初始化脚本、启动服务
 ↓
建立终端 → 用户登录 → 启动 shell
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921140522.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### BIOS, POST, and Boot Sequence

**基本输入输出系统（Basic Input/Output System，BIOS）** 启动模型中的初始固件。上电后先执行这部分代码，进行**上电自检（Power-On Self-Test，POST）**，检查硬件是否满足基本运行条件。

检查之后，固件按设定的**启动顺序（Boot Sequence）**尝试外部存储设备。排序决定哪个设备先被尝试，并不直接等同于选择某个内核版本。

### Master Boot Record (MBR)

传统磁盘启动模型中，设备的第一个扇区保存**主引导记录（Master Boot Record，MBR）**，共 **512 字节**。

检查最后两个字节是否依次为 `0x55`、`0xAA`；符合该签名时继续尝试引导，否则尝试后续设备。

| 字节编号，从 1 开始 | 长度 | 内容 |
| --- | --- | --- |
| 1–446 | 446 B | 初始引导机器代码 |
| 447–510 | 64 B | 分区表 |
| 511–512 | 2 B | 结束签名 `0x55 0xAA` |

$$
446+64+2=512\ \text{B}.
$$

**MBR 整体是 512 B，其中的分区表是 64 B。** 
MBR 的空间有限，作用是参与后续程序的定位和引导；完整内核映像放在另外的位置。

### Partition Table and Active Partition

分区表由四个条目组成，每个条目 **16 字节**。单个条目布局如下：

| 条目内的字节编号 | 含义 |
| --- | --- |
| 1 | 活动标记；`0x80` 表示活动分区 |
| 2–4 | 起始扇区的物理位置，如柱面、磁头、扇区信息 |
| 5 | 分区类型 |
| 6–8 | 结束扇区的物理位置 |
| 9–12 | 起始扇区的逻辑地址 |
| 13–16 | 此分区包含的扇区总数 |

<details>
<summary>为什么说最多有四个主分区？</summary>

MBR 布局：

$$
\text{分区表项数}=\frac{64\ \text{B}}{16\ \text{B/项}}=4.
$$

四个表项可以描述至多四个主分区。

这个数量限制来自这里讨论的 MBR 表结构。

</details>

### VBR, Extended Partitions, and Boot Loader

三种相关情况：

| 情况 | 后续处理 |
| --- | --- |
| 通过活动主分区继续启动 | 读取该分区的第一个扇区，即卷引导记录（Volume Boot Record，VBR），继续定位分区中的操作系统 |
| 四个主分区表项不够用 | 将一个表项用于扩展分区，通过它组织更多分区；规定最多使用一个扩展分区表项 |
| 通过已安装的引导程序启动 | 引导代码进入 GRUB 等程序，由用户选择要启动的系统 |

**MBR 对应整块磁盘的起始记录；VBR 对应某个分区的起始记录。** 通过这些较小的记录和引导代码，逐步找到真正的内核映像。

### The /boot Directory

同一目录中同时保存两个内核版本：

```text
/boot/
├─ config-3.2.0-3-amd64
├─ config-3.2.0-4-amd64
├─ grub/
├─ initrd.img-3.2.0-3-amd64
├─ initrd.img-3.2.0-4-amd64
├─ System.map-3.2.0-3-amd64
├─ System.map-3.2.0-4-amd64
├─ vmlinuz-3.2.0-3-amd64
└─ vmlinuz-3.2.0-4-amd64
```

**新内核安装后，旧内核与其相关文件可以仍然存在。** 

<details>
<summary>内核需要文件系统，内核文件又保存在文件系统里，最初怎样启动？</summary>

```text
固件与引导代码先工作
          ↓
引导程序装入内核映像及必要的启动辅助内容
          ↓
内核建立早期执行环境，获得所需驱动和文件系统支持
          ↓
访问并挂载真正的根文件系统
          ↓
继续建立正常运行环境
```

</details>

## Init Stage

### User-Space Initialization

**内核能执行，并不等于整个用户环境已经就绪。** 系统还要配置主机信息、加载所需模块、启动服务、建立终端，并提供登录入口。

以 `/sbin/init` 为例，给出它的 **进程标识 PID 为 1**。随后通过这个用户空间初始化进程组织服务和登录环境。

| 名称 | 所处位置与职责 |
| --- | --- |
| 内核源码 `init/`、`start_kernel()` 等 | 完成内核本身的初始化 |
| `/sbin/init` 进程 | 组织用户空间初始化和服务启动 |
| `/etc/inittab` | 供 `init` 读取的配置文件 |
| `/etc/init.d/` 等脚本目录 | 保存服务与系统初始化脚本 |


### Run Levels

**运行级别（Run Level）** 用于选择一种系统运行与服务组合。

RHS 的运行级别例子：

| 级别 | 该例中的含义 |
| --- | --- |
| 0 | 停机，不应设为正常默认级别 |
| 1 | 单用户维护模式 |
| 2 | 多用户，但不包含 NFS 支持；应以该页配置注释为准 |
| 3 | 完整多用户模式，文本界面 |
| 4 | 此例未使用 |
| 5 | X11 图形界面 |
| 6 | 重启，不应设为正常默认级别 |

Windows 安全模式类比级别 1 的维护用途：启动较少服务，以便检查和恢复。


<details>
<summary>id:2:initdefault: 与 id:5:initdefault: 各表示什么？</summary>

```text
id:2:initdefault:
```

表示默认采用级别 2。

```text
id:5:initdefault:
```

表示默认采用级别 5；在该页采用的运行级别约定下，对应图形启动。

</details>

### Format of the inittab File

记录格式为：

```text
id:runlevel:action:process
```

| 字段 | 含义 |
| --- | --- |
| `id` | 该条配置记录的标识 |
| `runlevel` | 适用的运行级别 |
| `action` | 怎样执行、何时执行 |
| `process` | 要执行的程序路径及命令行参数 |

八种动作：

| 动作 | 含义 |
| --- | --- |
| `sysinit` | 指定系统初始化命令 |
| `respawn` | 所执行命令终止后，重新启动它 |
| `askfirst` | 类似 `respawn`，但先提示用户 |
| `wait` | 执行命令并等待它结束 |
| `once` | 执行一次，`init` 不必等待其结束 |
| `ctrlaltdel` | 响应 Ctrl+Alt+Del 对应的动作 |
| `shutdown` | 系统关闭时执行 |
| `restart` | 执行重启动作时指定的命令 |


<details>
<summary>逐行阅读一份 inittab 配置</summary>

```text
::sysinit:/etc/init.d/rcS
::respawn:/sbin/getty 115200 ttyS0
::respawn:/control-module/bin/init
::restart:/sbin/init
::shutdown:/bin/umount -a -r
```

| 配置行 | 行为 |
| --- | --- |
| `::sysinit:/etc/init.d/rcS` | 执行系统初始化脚本 `rcS` |
| `::respawn:/sbin/getty 115200 ttyS0` | 在 `ttyS0` 串口上启动登录入口，速率参数为 115200；程序结束后重新启动 |
| `::respawn:/control-module/bin/init` | 启动控制模块的自定义程序，退出后重新启动 |
| `::restart:/sbin/init` | 为重启动作指定 `/sbin/init` |
| `::shutdown:/bin/umount -a -r` | 系统关闭时执行所列的文件系统卸载命令 |

第三行虽然也有一个名为 `init` 的程序，但它位于自定义目录，不等同于系统的 PID 1。

</details>

### Tasks During the Init Stage

两组目录风格的例子

**一组例子使用 `/etc/rc.d/`。** 首先执行系统初始化脚本，设置默认路径、主机名、网络信息等：

```text
si::sysinit:/etc/rc.d/rc.sysinit
```

随后根据运行级别调用对应脚本，列出 0–6 共七条配置：

```text
l0:0:wait:/etc/rc.d/rc 0
l1:1:wait:/etc/rc.d/rc 1
l2:2:wait:/etc/rc.d/rc 2
l3:3:wait:/etc/rc.d/rc 3
l4:4:wait:/etc/rc.d/rc 4
l5:5:wait:/etc/rc.d/rc 5
l6:6:wait:/etc/rc.d/rc 6
```

以 `l3:3:wait:/etc/rc.d/rc 3` 为例：标识为 `l3`，适用于级别 3，执行 `/etc/rc.d/rc 3`，并等待该脚本结束。

**另一组例子使用 `/etc/rc0.d/` 到 `/etc/rc6.d/`。** 不同目录对应不同级别，目录里的条目通过链接指向实际脚本。

<details>
<summary>Apache 怎样在系统启动时被启动？</summary>

`ls -l /etc/rc2.d` 输出包括：

```text
S01motd           -> ../init.d/motd
S13rpcbind        -> ../init.d/rpcbind
S14nfs-common     -> ../init.d/nfs-common
S16binfmt-support -> ../init.d/binfmt-support
S16rsyslog        -> ../init.d/rsyslog
S16sudo           -> ../init.d/sudo
S17apache2        -> ../init.d/apache2
S18acpid          -> ../init.d/acpid
```

以 Apache 为例，可以沿路径理解：

```text
采用相应运行级别
      ↓
处理 /etc/rc2.d/ 中的启动安排
      ↓
S17apache2 指向 /etc/init.d/apache2
      ↓
相应脚本启动 Apache 服务
```

**注册开机启动，与把 Apache 编入内核，是两件不同的事。**

</details>

### User Login and Shell

系统初始化完成后，还要给用户提供交互入口。

命令行路径为：

```text
init 组织启动
      ↓
getty／mingetty 建立终端登录入口
      ↓
login 完成用户认证
      ↓
按用户配置启动 shell
      ↓
用户输入命令
```

## Example

**IA-32 Linux Boot**

### Power-On, BIOS, and Boot Loader

| 阶段 | 行为 | 关键位置 |
| --- | --- | --- |
| CPU 上电 | 寄存器进入规定的复位状态，从初始入口取指 | 初始取指地址为 `0xfffffff0` |
| BIOS | 初始化设备，为系统准备 E820、MPS 等信息 | 初始固件代码所在区域 |
| 装入 MBR | 把启动设备的第一个扇区复制到内存，并跳转执行 | `0x7c00` |
| 引导程序 | LILO／GRUB 装入内核映像和 `initrd`，进入内核早期代码 | 由该启动协议规定的装载位置 |

**寄存器进入复位状态，不等于所有寄存器都被统一清零。**

### Real Mode and Protected Mode Initialization

| 阶段 | 工作 |
| --- | --- |
| `setup.S`：实模式初始化 | 入口位于内核映像偏移 `0x200`；处理 E820 等内存信息，切换到保护模式，将内核放到 `0x100000`，转向 `startup_32` |
| `head.S::startup_32`：保护模式初始化 | 入口物理地址 `0x100000`；清零 BSS、复制启动参数，初始化寄存器以及 GDT／IDT 等，再进入 C 入口 `start_kernel` |

**先完成早期机器状态和必要环境的准备，后续 C 代码才能继续进行复杂的内核初始化。**

<details>
<summary>0x200、0x7c00、0x100000、0xfffffff0 应怎样区分？</summary>

| 数值 | 含义 | 关键 |
| --- | --- | --- |
| `0x200` | 内核映像内部偏移，十进制为 512 | 偏移需要与映像基址一起理解 |
| `0x7c00` | MBR 被复制到的内存位置 | 与磁盘上的“第一个扇区”分属不同地址空间 |
| `0x100000` | 内核保护模式阶段位置，即 1 MiB 处 | 这是本例中的物理地址 |
| `0xfffffff0` | 初始取指地址 | 数值为 $2^{32}-16$，不能与 1 MiB 混为一谈 |

因此，看到十六进制数时先确定：**它表示文件内偏移、磁盘位置，还是内存地址？** 再判断对应的启动阶段。


</details>

### start_kernel Initialization

C 语言初始化归入 `main.c` 中的 `start_kernel` 阶段，主要工作包括：

| 初始化内容 | 作用 |
| --- | --- |
| `setup_arch` | 完成体系结构相关的准备 |
| 直接内存映射、伙伴系统等 | 建立内存管理所需的基础 |
| 内核各子系统 | 使调度、设备等系统功能逐步具备运行条件 |
| 其他 CPU | 在多处理器系统中启动其他处理器 |
| `populate_rootfs`、`initcalls` | 准备早期根文件系统内容，并执行初始化调用 |
| 为 `init` 准备文件 0、1、2 | 准备其基本输入输出环境 |
| 挂载根文件系统 | 使后续用户空间所需文件可访问 |
| 建立新任务并执行 `/sbin/init` | 转入用户空间初始化过程 |

```text
固件和引导代码
      ↓
setup.S → head.S / startup_32
      ↓
main.c / start_kernel 及后续内核初始化路径
      ↓
/sbin/init（PID 1，用户空间）
      ↓
初始化脚本 → 服务 → 登录入口 → shell
```
