---
title: Memory Hierarchy
published: 2026-04-17
description: Cache and Memory Hierarchy
tags: [计算机体系结构]
category: 笔记
draft: false
---

## 概述

这一章讨论的是**当处理器越来越快，而主存没有跟着一样快地提升时，系统怎样靠层次化存储把大容量和高速度尽量兼顾起来**。

- **cache 的目标不是让每次访存都更快，而是让平均访存时间更低**；
- cache 能成立的根本前提是 **temporal locality（时间局部性）** 和 **spatial locality（空间局部性）**；

---

## 目录
- [概述](#概述)
- [目录](#目录)
- [Introduction](#introduction)
  - [从 Load/Store 到 Memory Hierarchy](#从-loadstore-到-memory-hierarchy)
  - [Locality](#locality)
  - [Cache](#cache)
    - [Cache Hit / Cache Miss](#cache-hit--cache-miss)
    - [Block / Line](#block--line)
- [Technology Trend and Memory Hierarchy](#technology-trend-and-memory-hierarchy)
  - [Processor-Memory Gap](#processor-memory-gap)
  - [SRAM / DRAM / Storage](#sram--dram--storage)
  - [Memory Hierarchy](#memory-hierarchy)
  - [Cache Miss](#cache-miss)
  - [3C Misses](#3c-misses)
  - [Split Cache vs Unified Cache](#split-cache-vs-unified-cache)
  - [Three classes of computers with different concerns in memory hierarchy](#three-classes-of-computers-with-different-concerns-in-memory-hierarchy)
- [Four Questions for Cache Designers](#four-questions-for-cache-designers)
  - [Q1：Block Placement](#q1block-placement)
    - [Direct Mapped](#direct-mapped)
    - [Fully Associative](#fully-associative)
    - [Set Associative](#set-associative)
    - [Example](#example)
  - [Q2：Block Identification](#q2block-identification)
    - [查找方式](#查找方式)
      - [Direct Mapped](#direct-mapped-1)
      - [Fully Associative](#fully-associative-1)
      - [Set Associative](#set-associative-1)
    - [FSM Control Simple Cache](#fsm-control-simple-cache)
      - [FSM](#fsm)
    - [State Machine](#state-machine)
      - [Idle](#idle)
      - [Compare Tag](#compare-tag)
      - [Write-Back](#write-back)
      - [Allocate](#allocate)
    - [Cache 容量计算](#cache-容量计算)
      - [地址划分](#地址划分)
        - [行存储内容](#行存储内容)
      - [完整 Cache 容量的一般公式](#完整-cache-容量的一般公式)
    - [Example](#example-1)
      - [Example 1](#example-1)
      - [Example 2](#example-2)
      - [Example 3](#example-3)
  - [Q3：Block Replacement](#q3block-replacement)
    - [替换策略](#替换策略)
      - [Random](#random)
      - [FIFO](#fifo)
    - [LRU](#lru)
      - [OPT](#opt)
    - [Example](#example-2)
    - [Thrashing and Belady Anomaly](#thrashing-and-belady-anomaly)
    - [Thrashing](#thrashing)
      - [Belady Anomaly](#belady-anomaly)
      - [Stack Property](#stack-property)
    - [Comparison Pair](#comparison-pair)
  - [Q4：Write Strategy](#q4write-strategy)
    - [Write Hit](#write-hit)
      - [Write-Through](#write-through)
      - [Write-Back](#write-back-1)
    - [Write Miss](#write-miss)
      - [Write Allocate](#write-allocate)
      - [No-Write-Allocate](#no-write-allocate)
    - [常见组合](#常见组合)
    - [Write Stall and Write Buffer](#write-stall-and-write-buffer)
    - [Example](#example-3)
- [Memory System Performance](#memory-system-performance)
  - [CPU Execution Time and Memory Stall Cycles](#cpu-execution-time-and-memory-stall-cycles)
  - [AMAT](#amat)
  - [Example](#example-4)
- [Improve Cache Performance](#improve-cache-performance)
  - [Reducing the Hit Time](#reducing-the-hit-time)
    - [Small and Simple First-Level Caches](#small-and-simple-first-level-caches)
    - [Way Prediction](#way-prediction)
  - [Increasing Cache Bandwidth](#increasing-cache-bandwidth)
    - [Pipelined Caches](#pipelined-caches)
    - [Multibanked Caches](#multibanked-caches)
    - [Nonblocking Caches](#nonblocking-caches)
  - [Reducing the Miss Penalty](#reducing-the-miss-penalty)
    - [Multilevel Caches](#multilevel-caches)
    - [Critical Word First / Early Restart](#critical-word-first--early-restart)
    - [Read Miss Priority Over Write Miss](#read-miss-priority-over-write-miss)
    - [Merging Write Buffers](#merging-write-buffers)
    - [Victim Cache](#victim-cache)
  - [Reducing the Miss Rate](#reducing-the-miss-rate)
    - [Larger Block Size](#larger-block-size)
    - [Larger Cache Size](#larger-cache-size)
    - [Higher Associativity](#higher-associativity)
    - [Compiler Optimizations](#compiler-optimizations)
      - [Loop Interchange](#loop-interchange)
      - [Blocking / Tiling](#blocking--tiling)
  - [Reducing Miss Penalty or Miss Rate via Parallelism](#reducing-miss-penalty-or-miss-rate-via-parallelism)
    - [Hardware Prefetching](#hardware-prefetching)
    - [Compiler-Controlled Prefetching](#compiler-controlled-prefetching)
  - [Extending the Memory Hierarchy](#extending-the-memory-hierarchy)
    - [Using HBM to Extend the Memory Hierarchy](#using-hbm-to-extend-the-memory-hierarchy)
    - [Using CXL to Extend the Memory Hierarchy](#using-cxl-to-extend-the-memory-hierarchy)
    - [Using UnifiedBus to Extend the Memory Hierarchy](#using-unifiedbus-to-extend-the-memory-hierarchy)
- [Additional Techniques Often Discussed with Cache Optimization](#additional-techniques-often-discussed-with-cache-optimization)
  - [Skewed-Associative Cache](#skewed-associative-cache)
  - [Pseudo-Associative Cache](#pseudo-associative-cache)
  - [Cache Coloring](#cache-coloring)
  - [System-Level Cache](#system-level-cache)
- [GPU Memory and Cache-Related Topics](#gpu-memory-and-cache-related-topics)
  - [GPU Shared Memory](#gpu-shared-memory)
  - [GPU Memory Hierarchy](#gpu-memory-hierarchy)
  - [Unified Memory Architecture](#unified-memory-architecture)
- [How to Compare These Techniques](#how-to-compare-these-techniques)
- [A Compact Takeaway Table](#a-compact-takeaway-table)

---

## Introduction

### 从 Load/Store 到 Memory Hierarchy

处理器真正和 memory 打交道，最直接的入口其实就是两类指令：

- `Load`
- `Store`

**只要程序在读数据或写数据，它就一定绕不开 memory system（存储系统）**。

问题在于：

- 寄存器很快，但太小；
- 主存够大，但太慢；
- 如果每次 load/store 都直接等主存，CPU 就会被严重拖慢。

因此系统自然会沿着下面这条思路演化：

1. 先有寄存器，解决最靠近执行单元的临时数据保存；
2. 仅靠寄存器仍然不够，因为程序访问的数据规模远大于寄存器容量；
3. 于是要在处理器和主存之间放一层更快的临时存储；
4. 如果一层不够，就继续分层，形成 **memory hierarchy（存储层次）**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604151631590.png" alt="memory hierarchy overview" style="width: 620px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

从图里能直接看出 hierarchy 的基本规律：

- 越靠近 CPU，速度越快；
- 越靠近 CPU，容量越小；
- 越往下层，容量越大，但访问代价也越高。

几个典型量级：

- Register：大约 `300ps`
- L1 cache：大约 `1ns`
- L2 cache：大约 `5-10ns`
- Main memory：大约 `50-100ns`
- Storage：已经到 `us` 甚至 `ms` 量级

全部都用和寄存器一样快的存储是不现实的：

- 成本太高；
- 功耗太大；
- 容量根本做不起来。

所以 memory hierarchy 的本质是一种系统折中：

- **用少量快存储去吸收大多数高频访问**
- **把大容量低成本存储留给不那么频繁的访问**

### Locality

cache 不是凭空有效的，它依赖的是 **principle of locality（局部性原理）**。

两种最基本的 locality 是：

1. **Temporal locality（时间局部性）**
   - 如果某个数据刚被访问过，那么它很可能在不久之后再次被访问。

2. **Spatial locality（空间局部性）**
   - 如果某个地址刚被访问过，那么它附近地址的数据也很可能很快会被访问。

:::NOTE
如果一本书刚被你从书柜拿到桌上，你大概率不会看一眼就立刻再也不用它；
如果你刚看完上册、中册，那么接下来去看下册也很自然；
**历史访问对未来访问有预测价值。**
:::

:::TIP
- 时间局部性强调**刚访问过的对象还会再来**；
- 空间局部性强调**附近的数据通常会被一起用到**。

cache 的两个最基本设计动作，正好就对应这两点：

- 时间局部性 -> 把最近访问过的数据留在更靠近 CPU 的地方；
- 空间局部性 -> 不是只搬一个 word，而是把一整块相邻数据一起搬上来。
:::

---

### Cache

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171011939.png" alt="cache overview" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

> **Cache（高速缓存）** 是一种小而快的存储，用来降低访问较慢下层存储的平均时间。
> In computer architecture, almost everything is a cache.

- Register 可以看成软件和硬件共同管理的最靠近计算的数据缓存；
- L1 是对 L2 / memory 的 cache；
- L2、L3 继续往下缓存；
- 从更大的视角看，memory 甚至还可以看成 disk 上数据的**上层缓存**。

#### Cache Hit / Cache Miss

1. **cache hit（命中）**
   - 处理器要的数据已经在 cache 中；
   - 这时直接从 cache 返回，处理器几乎感觉不到“下面还有主存”这件事。

2. **cache miss（失效）**
   - 处理器要的数据不在 cache 中；
   - 这时就必须继续访问下层存储，把数据取回来。

对处理器来说，hit 和 miss 的差别非常大：

- hit 时，控制逻辑很简单；
- miss 时，不仅要访问下层 memory，还可能要 replacement、write-back，甚至让整个处理器 stall。

#### Block / Line

cache 和 memory 之间传输数据时，基本单位不是单个 word，而是：

- **block（块）**
- 也常叫 **cache line（缓存行）**

它表示的是：

> 一组固定大小的数据，其中包含了当前请求的那个 word。

:::NOTE
**为什么不只搬一个 word？**
- 空间局部性说明：既然访问了这个地址，附近地址的数据很可能也快要用了；
- 所以一次 miss 时顺手把整个 block 一起搬上来，通常更划算。

对应而生的参数：

- `byte offset` 决定 block 内具体取哪个字节；
- `index` 决定这个 block 去 cache 的哪一行/哪一组；
- `tag` 决定当前这行里放的是不是我要的那个 block。
:::

---

## Technology Trend and Memory Hierarchy

### Processor-Memory Gap

**processor-memory performance gap（处理器与主存的性能鸿沟）**

- CPU 核心的速度提升得很快；
- 主存并不是完全不提升，但提升速度明显慢得多；
- 结果就是：**处理器越来越像在等内存**。

既然主存不可能又大又快，那就只能靠多级 hierarchy 来把快和大拆开实现。

memory hierarchy 的目标：

1. **尽量给用户呈现出便宜技术所能提供的大容量**
2. **同时尽量提供接近最快技术的访问速度**

这正是 locality 能带来的收益：

- 高频访问的数据，被上层快存储命中；
- 低频访问的数据，仍然待在下层大容量存储里。

### SRAM / DRAM / Storage

- **SRAM（Static RAM，静态随机存取存储器）**
  - 快，但贵、面积大；
  - 适合做 cache。

- **DRAM（Dynamic RAM，动态随机存取存储器）**
  - 比 SRAM 慢，但容量更大、成本更低；
  - 适合做 main memory。

- **Storage（外存）**
  - 如 SSD / Flash / HDD；
  - 更慢，但容量更大、单比特成本更低。

**cache 主要靠 SRAM**
**主存主要靠 DRAM**
**更往下的层次则是 SSD / Flash / Disk 等存储设备**

### Memory Hierarchy

从 hierarchy 角度看，一个现代系统常见的层次关系大致是：

- Register
- L1 cache
- L2 cache
- L3 cache
- Main memory
- Storage

接近真实机器的多级 cache 组织图：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161946603.png" alt="multi-level cache organization" style="width: 520px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

1. **cache 往往不是单级的，而是多级的**
   - L1 最小最快；
   - L2 更大但更慢；
   - 再往下才到 main memory。

2. **I-cache / D-cache 可能是分开的**
   - instruction cache（指令 cache）
   - data cache（数据 cache）

这就引出了后面常见的 split vs unified。

### Cache Miss

miss 发生以后，miss 所需时间主要有两部分：

1. **latency（延迟）**
   - 取回 block 的第一个 word 所需要的时间。

2. **bandwidth（带宽相关时间）**
   - 在第一个 word 到达之后，把这个 block 其余部分传完所需要的时间。

miss penalty（失效代价）：

- 第一个字到来的等待；
- 整个 block 传输完成的等待。

这也是为什么 block size 不是越大越好的原因：

- block 大，空间局部性利用得更充分；
- 但一次 miss 时要搬的数据更多，miss penalty 也会变大。

### 3C Misses

**Compulsory / Capacity / Conflict**

cache miss 常见地分成三类，也就是经典的 **3C model**：

1. **Compulsory miss（强制失效）**
   - 第一次访问某个 block；
   - cache 之前从来没见过它，所以必 miss。

2. **Capacity miss（容量失效）**
   - cache 容量不够；
   - 某个 block 被挤掉了，之后又要重新取回来。

3. **Conflict miss（冲突失效）**
   - cache 不是 fully associative；
   - 不同 block 因为映射到同一位置/同一组，互相挤掉。

这三类 miss 后面会反复影响设计选择：

- 增大 block size 往往主要影响 compulsory miss；
- 增大 cache size 通常主要缓解 capacity miss；
- 提高 associativity 通常主要缓解 conflict miss。

### Split Cache vs Unified Cache

**split cache（分离式 cache）** 
**unified cache（统一 cache）**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171014849.png" alt="split vs unified cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

1. **Unified cache**
   - 所有 memory request 都经过同一个 cache；
   - 硬件更省；
   - 但容易产生指令和数据的竞争。

2. **Split I-cache / D-cache**
   - 指令和数据分别走不同的 cache；
   - 硬件更多；
   - 但前端取指和数据访问的并行性更好。

L1 一般是 split
  - 因为最靠近 CPU，需要尽量高带宽；
  - I-cache 只读，逻辑也更简单。

更低层如 L2/L3 一般是 unified
  - 因为这一级更关注容量共享和整体利用率。

### Three classes of computers with different concerns in memory hierarchy

1. **Desktop computers**
   - 通常以单用户、单应用体验为主；
   - 更关注 average latency（平均延迟）。

2. **Server computers**
   - 同时服务很多用户和应用；
   - 更关注 bandwidth（带宽）。

3. **Embedded computers**
   - 常是实时场景；
   - 更关注 worst-case performance、功耗和电池寿命；
   - 保护需求有时没那么强，主存也可能很小，甚至没有 disk。

- cache 设计没有唯一最优；
- **同样的 hierarchy，在不同系统目标下会选出不同折中**。

---

## Four Questions for Cache Designers

对于 cache / memory hierarchy 设计者来说，最基本的就是四个问题。

1. **Where can a block be placed?**
2. **How is a block found if it is there?**
3. **Which block should be replaced on a miss?**
4. **What happens on a write?**


### Q1：Block Placement

#### Direct Mapped

**direct mapped cache（直接映射）** :

一个 memory block 只能去 cache 里的一个固定位置。

$$
\text{cache block number} = (\text{block address}) \bmod (\text{number of blocks in cache})
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171017149.png" alt="direct mapped cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171018473.png" alt="fully associative cache" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

优点：

- 实现最简单；
- 查找快；
- hit time 往往较小。

缺点：

- 灵活性最差；
- 很容易出现 conflict miss。

#### Fully Associative

**fully associative cache（全相联）** :
一个 memory block 可以放到 cache 中任意位置。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171019996.png" alt="fully associative cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

优点：

- 放置最灵活；
- conflict miss 最少。

缺点：

- 查找最贵；
- 需要比较所有 tag；
- 硬件开销大。

#### Set Associative

**set associative cache（组相联）** 处于两者之间。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171020068.png" alt="set associative cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

如果是 `n-way set associative`，表示：

- cache 被分成若干 set（组）；
- 每个 set 里有 `n` 个 block；
- 一个 memory block 先确定自己属于哪一组；
- 进入该组后，再从这组里的 `n` 个位置中挑一个。

三者其实可以都看作 Set Associative：

- direct mapped = `1-way set associative`
- fully associative = 整个 cache 只有一组

:::TIP
- associativity 不是越大越好；
- associativity 越高，冲突越少，但查找和 replacement 逻辑也越复杂；
- 实际系统里，很多 cache 的 associativity 常见是 `n ≤ 4`。
:::

:::NOTE
**why index with the middle bits**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171021895.png" alt="cache address format" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

核心原因是：

- 低位已经被 block offset 占掉，不能再用来选 set；
- 如果直接拿高位做 index，那么很多连续地址会扎堆映射到同一个 set；
- 这会破坏空间局部性本来带来的好处。

所以更常见的做法是：

- **保留最低位给 offset**
- **用中间若干位做 index**
- **把更高位留给 tag**

这样连续地址更容易分散到相邻 set，局部性利用会更自然。
:::

#### Example

设：

- $M$：Cache 总块数
- $n$：每组中的块数，即相联度（associativity）
- $G$：组数（number of sets）

则有：

$$
M = n \times G
$$

- **全相联（full-associative）**
  - $n = M$
  - $G = 1$
  - 整个 Cache 只有一组，主存块可放入任意 Cache 块中

- **直接映射（direct mapped）**
  - $n = 1$
  - $G = M$
  - 每组只有一个块，主存块只能映射到唯一位置

- **组相联（set-associative）**
  - $1 < n < M$
  - $1 < G < M$
  - 主存块先映射到某一组，再放入该组内任意一个块中

相联度 $n$ 越大，优点：

- Cache 空间利用更充分
- **块冲突（block collision）** 更少
- **冲突失效（conflict miss）** 降低
- 整体 **miss rate** 往往下降

缺点：

- 命中判断更复杂，需要比较更多 tag
- 硬件成本更高
- 功耗增加
- 命中时间（hit time）可能变长
- 替换策略（如 LRU）实现更复杂

实际设计中，大多数 Cache 的相联度不会太高，常见为：

$$
n \le 4
$$

即通常采用 **2-way** 或 **4-way set-associative cache**。


<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171024913.png" alt="cache 8 block summary" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />



### Q2：Block Identification

Q1 解决的是能放哪；Q2 解决的是放进去以后怎么找到它。

这就引出 cache address format（地址格式）：

- **Tag**
- **Index**
- **Byte Offset**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171030092.png" alt="cache address format" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

其中：

1. **Index**
   - direct mapped 时选中某一行；
   - set associative 时选中某一组。

2. **Byte Offset**
   - 选中 block 内具体哪个字节；
   - 如果 block 有多个 word，还可以再细分 word offset。

3. **Tag**
   - 用来确认“这一行/这一组里放的到底是不是我要的 block”。

此外每个 cache line 通常还带有：

- **valid bit（有效位）**

它表示：

- `valid = 0`：这行目前无效，没有可用数据；
- `valid = 1`：这行里确实放了某个有效 block。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171031082.png" alt="cache line format" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

一次访问的判断顺序：

1. 根据 index 找到对应行/对应组；
2. 先看 valid bit；
3. 再比较 tag；
4. 若命中，再根据 offset 取出具体数据。

- **先看 valid**
- **再看 tag**
- **最后才是 offset 取值**


#### 查找方式

##### Direct Mapped

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171032241.png" alt="direct mapped cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171100132.png" alt="direct mapped cache example" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- index 选中唯一一行；
- 看这一行的 valid；
- 再把请求地址的 tag 和该行的 tag 比较；
- 相等则 hit，否则 miss。

特点：

- 查找路径最短；
- 但如果别的 block 映射到同一行，就一定会冲突。

##### Fully Associative

Assume cache has 4 blocks

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171033712.png" alt="fully associative cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171100639.png" alt="fully associative cache example" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

fully associative 最灵活，也最贵：

- 没有传统意义上的 index；
- 访问时必须对所有行的 tag 做比较；
- 任意一行匹配就算 hit。

因此它通常只在规模较小、对灵活性要求很高的结构里更适合。

##### Set Associative
- Assume cache has 4 blocks and each block is 1 word
- 2 blocks per set, hence 2 sets per cache

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171034659.png" alt="set associative cache" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171100975.png" alt="set associative cache example" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- index 先选中一组；
- 组内每一行都要看 valid，并比较 tag；
- 只要组内某一行匹配，就 hit。

因此它比 direct mapped 多出来的，是：

- 组内并行比较多个 tag；
- 以及 miss 时还得在组内决定替换谁。


#### FSM Control Simple Cache

Cache 的行为是一个**时序过程**。  
一次访存请求到来后，控制器可能需要依次完成：

- 接收 CPU 请求
- 比较 Tag
- 判断命中 / 失效
- 判断被替换块是否为脏块（dirty）
- 若脏，则先写回主存（write-back）
- 再从主存读入新块（allocate）
- 最后通知 CPU Cache 已准备好

Cache Controller 适合建模成一个 **有限状态机**。

##### FSM

一个有限状态机通常包括三部分：

- **当前状态（current state）**
- **输入（inputs）**
- **输出（outputs）**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171044517.png" alt="fsm overview" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

并由两类逻辑决定行为：

1. 下一状态函数
根据：当前状态、当前输入，决定：下一拍进入哪个状态
1. 输出函数
根据：当前状态、有时还包括输入，产生：对数据通路（datapath）的控制信号  
例如：是否读主存、是否写主存、是否更新 valid/tag/dirty、是否通知 CPU ready 等。

#### State Machine

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171045463.png" alt="cache controller fsm" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Idle
空闲状态，表示当前没有正在处理的 Cache 请求。

- 如果收到 **valid CPU request**
- 则进入 **Compare Tag**

##### Compare Tag
比较 Tag，判断当前访问是 **cache hit** 还是 **cache miss**。

- 检查对应块是否 **valid**
- 比较 tag 是否匹配
- 若命中：
  - 读请求：直接返回数据
  - 写请求：更新 cache 内容，并把 **dirty 位置 1**
- 然后返回 **Idle**
- 同时向 CPU 发出 **cache ready**

若失效（miss），则还要进一步判断被替换的旧块是否为脏块：

- **旧块干净（clean）** → 进入 **Allocate**
- **旧块是脏块（dirty）** → 进入 **Write-Back**

##### Write-Back
写回状态，把被替换的旧脏块写回主存。

- 如果 **memory ready**
  - 写回完成后进入 **Allocate**
- 如果 **memory not ready**
  - 停留在当前状态等待

只有在替换脏块时，才需要真正写主存。

##### Allocate
分配状态，从主存中读取新块到 Cache。

- 如果 **memory ready**
  - 新块装入 Cache
  - 然后回到 **Compare Tag**
- 如果 **memory not ready**
  - 停留在当前状态等待

**Compare Tag** :新块装入后，还要重新完成一次当前 CPU 请求的命中访问。

- **exception** 处理往往要保存大量架构状态；
- **cache miss** 更像是 stall / freeze 当前机器状态，等数据回来后再继续。
- 
#### Cache 容量计算

- 地址长度：$A$ bits  
  （例如 64 位地址时，$A=64$）
- Cache 数据区共有 $L$ 个 cache line（或 block）
- 每个 block 大小为 $2^m$ words
- 每个 word = 4 bytes = 32 bits
- 相联度（associativity）为 $k$
  - direct-mapped：$k=1$
  - $k$-way set-associative：$1<k<L$
  - full-associative：$k=L$
- 组数为 $S$

则有：

$$
L = k \times S
$$


##### 地址划分

一个地址通常划分为：

$$
\text{Tag} + \text{Set Index} + \text{Block Offset} + \text{Byte Offset}
$$

其中：

- **Byte offset**：2 bits  
  （因为 1 word = 4 bytes）
- **Block offset**：$m$ bits  
  （因为每块有 $2^m$ words）
- **Set index**：$\log_2 S$ bits
- **Tag**：剩余高位

所以：

$$
\text{tag bits} = A - (\log_2 S + m + 2)
$$

###### 行存储内容

每个 cache line 至少包含：

- **Data**
- **Tag**
- **Valid bit**

若考虑 write-back cache，还常常需要：

- **Dirty bit**

因此每一行总位数可写成：

1. 不考虑 dirty 位
$$
\text{line size} = 2^m \times 32 + \text{tag bits} + 1
$$

2. 考虑 dirty 位
$$
\text{line size} = 2^m \times 32 + \text{tag bits} + 2
$$

##### 完整 Cache 容量的一般公式

完整 Cache 容量 = 行数 × 每行位数

1. 不考虑 dirty 位
$$
C_{\text{total}} = L \left(2^m \times 32 + A - (\log_2 S + m + 2) + 1\right)
$$

2. 考虑 dirty 位
$$
C_{\text{total}} = L \left(2^m \times 32 + A - (\log_2 S + m + 2) + 2\right)
$$

**Direct-Mapped Cache**

direct-mapped 时：

- 相联度 $k=1$
- 每组 1 行
- 所以：
  $$
  S=L
  $$

因此：

$$
\log_2 S = \log_2 L
$$

1. tag 位数
$$
\text{tag bits} = A - (\log_2 L + m + 2)
$$

2. 完整容量
不计 dirty
$$
C_{\text{DM}} = L \left(2^m \times 32 + A - \log_2 L - m - 1\right)
$$
计 dirty
$$
C_{\text{DM}} = L \left(2^m \times 32 + A - \log_2 L - m\right)
$$

**$k$-way Set-Associative Cache**

$k$-路组相联时：

- 每组 $k$ 行
- 组数：
  $$
  S = \frac{L}{k}
  $$

所以：

$$
\log_2 S = \log_2 \frac{L}{k}
$$

1. tag 位数
$$
\text{tag bits} = A - \left(\log_2 \frac{L}{k} + m + 2\right)
$$

2. 完整容量
不计 dirty
$$
C_{k\text{-way}} = L \left(2^m \times 32 + A - \log_2 \frac{L}{k} - m - 1\right)
$$

计 dirty
$$
C_{k\text{-way}} = L \left(2^m \times 32 + A - \log_2 \frac{L}{k} - m\right)
$$

**Full-Associative Cache**

full-associative 时：

- 相联度 $k=L$
- 整个 Cache 只有 1 组
- 所以：
  $$
  S=1
  $$

因此：

$$
\log_2 S = 0
$$

1. tag 位数
$$
\text{tag bits} = A - (m + 2)
$$

2. 完整容量

不计 dirty
$$
C_{\text{FA}} = L \left(2^m \times 32 + A - m - 1\right)
$$

计 dirty
$$
C_{\text{FA}} = L \left(2^m \times 32 + A - m\right)
$$

**数据容量：**
$$
C_{\text{data}} = L \times 2^m \times 32 \text{ bits}
$$

#### Example

##### Example 1

> 一个 **16 KiB data** 的 direct-mapped cache，block size 是 **4 words**，地址长度 **64 bit**。问这个 cache 一共需要多少 bit？

- `16 KiB = 2^14 bytes = 2^12 words`
- block size = `4 words = 2^2 words`

因此：

1. block 内 word offset 需要

$$
m = 2
$$

2. cache block 数量为

$$
2^{12} / 2^2 = 2^{10}
$$

所以：

$$
n = 10
$$

3. block 内一共有 `4 words = 16 bytes`，因此 block 内总 offset 为：

- `2 bit` 选 word
- `2 bit` 选 byte

4. tag 位数为：

$$
\text{Tag bits}=64-n-m-2=64-10-2-2=50
$$

每个 block 里保存的内容包括：

- data：`4 × 32 = 128 bit`
- tag：`50 bit`
- valid：`1 bit`

因此每个 block 总位数：

$$
128 + 50 + 1 = 179 \text{ bit}
$$

总块数是 `1024`，所以 cache 总位数为：

$$
1024 \times 179 = 183296 \text{ bit}
$$

换成字节就是：

$$
183296 / 8 = 22912 \text{ bytes}
$$

**cache 的总实现开销并不只是 data 本身，还要把 tag 和控制位一起算进去**。

##### Example 2

> 一个 cache 有 `64 blocks`，每个 block 大小是 `16 bytes`。问 byte address `1200` 会映射到哪个 cache block number？

先算 block address：

$$
\text{Block address} = \frac{1200}{16} = 75
$$

再对 cache block 数取模：

$$
75 \bmod 64 = 11
$$

所以地址 `1200` 对应的 cache block number 是：

$$
11
$$

而且不仅 `1200`，地址 `1200` 到 `1215` 都属于同一个 16-byte block。  

- **cache 搬运的基本单位是整个 block**
- **不是某个单独的 byte，也不是某个单独的 bit**

##### Example 3

direct-mapped 访问过程
- data cache 大小：`16KB`
- direct-mapped
- block size：`4 words`
- 依次读取 4 个地址：
  - `0x00000014`
  - `0x0000001C`
  - `0x00000034`
  - `0x00008014`

- 主存
$$
\begin{align}
&0x00000010 → a\\
&0x00000014 → b\\
&0x00000018 → c\\
&0x0000001C → d\\
&...\\
&0x00000030 → e\\
&0x00000034 → f\\
&0x00000038 → g\\
&0x0000003C → h\\
&...\\
&0x00008010 → i\\
&0x00008014 → j\\
&0x00008018 → k\\
&0x0000801C → l\\
\end{align}
$$

这里 block size 是 `4 words = 16 bytes`，因此：

- byte offset 一共 `4 bit`
- cache block 数量 `= 16KB / 16B = 1024`
- index 一共 `10 bit`

四个地址的核心信息：

| 地址 | block address | index | tag | offset |
| --- | --- | --- | --- | --- |
| `0x00000014` | `1` | `1` | `0` | `0x4` |
| `0x0000001C` | `1` | `1` | `0` | `0xC` |
| `0x00000034` | `3` | `3` | `0` | `0x4` |
| `0x00008014` | `2049` | `1` | `2` | `0x4` |


**1. Read `0x00000014`**

index = `1`，此时假设机器刚上电，cache 全空：对应行 `valid = 0`

- 没有有效数据；
- 发生 **cache miss（失效）**。

下一步：

1. 到 memory 中把对应 block `[0x10, 0x14, 0x18, 0x1C]` 取回来；
2. 把 tag 写入该行；
3. 把 valid 置 1；
4. 再根据 offset 取值。

因为 `0x14` 在这个 block 中的 offset 是 `0100`，对应的就是第二个 word，因此返回：

$$
\text{return } b
$$

**2. Read `0x0000001C`**
index = `1`这次和上一步一样，还是同一行。此时：
- `valid = 1`
- tag 也匹配

这是一次 **cache hit（命中）**。

然后根据 offset：

- `0x1C` 对应该 block 中最后一个 word

所以返回：

$$
\text{return } d
$$

这刚好说明 spatial locality：

- 虽然第一次只想读 `0x14`；
- 但因为整个 block 已经被搬上来；
- 所以随后访问同一个 block 内的 `0x1C` 直接 hit。

**3. Read `0x00000034`**

- block address = `3`
- index = `3`

对应行一开始无效，所以：

- `valid = 0`
- 发生 miss

于是把 `[0x30, 0x34, 0x38, 0x3C]` 这一整块数据装入对应 cache line。

再看 offset：

- `0x34` 对应第二个 word

因此返回：

$$
\text{return } f
$$

**4. Read `0x00008014`**
**wrong data miss**

先看 index：

- `0x00008014 / 16 = 0x801 = 2049`
- `2049 mod 1024 = 1`

所以它还是落在 **index = 1** 这行。

但现在这行里原本放的是：tag = `0`

而当前请求地址需要的是：tag = `2`

- valid 是 1；
- 但 tag **不匹配**；
- 这不是空，而是这行已经放了“别的 block”。

于是发生：

- **cache miss**
- 且必须 **replacement（替换）**

因为是 direct mapped，能替换的只有这一行本身。  
新 block `[0x8010, 0x8014, 0x8018, 0x801C]` 进入该行后，再按 offset 取值，得到：

$$
\text{return } j
$$

可以把四次访问汇总成表：

| 访问地址 | 状态 | 关键原因 | 返回值 |
| --- | --- | --- | --- |
| `0x00000014` | miss | 对应行无效 | `b` |
| `0x0000001C` | hit | valid 且 tag match | `d` |
| `0x00000034` | miss | 对应行无效 | `f` |
| `0x00008014` | miss + replacement | valid 但 tag mismatch | `j` |

**5. Read `0x00000030`**

- block address = `3`
- index = `3`
- 当前该行 valid = 1
- tag 仍然匹配

因此：

- **hit**
- offset = `0`
- 返回该 block 的第一个 word

$$
\text{return } e
$$

**6. Read `0x0000001C`**
第二次访问 `0x0000001C` 时它 hit 过；  
但第四次访问 `0x00008014` 时，**同一个 index = 1 的那一行已经被替换掉了**。

因此现在再来读 `0x0000001C`：

- index 仍然是 `1`
- valid 仍然是 `1`
- 但 tag 已经不再是 `0`，而是 `2`

所以这次：

- **miss**
- 且是 **tag mismatch 导致的 replacement miss**

把原来的 `[0x10, 0x14, 0x18, 0x1C]` 再装回来后，根据 offset 取到：

$$
\text{return } d
$$

### Q3：Block Replacement

Q3 解决的是：

> miss 之后，如果可以放的位置不止一个，或者目标位置已经被占了，到底替换谁？

**direct mapped 也会发生 replacement**，只是它**没有 replacement policy 的选择空间**

需要选择策略的的，是：

- set associative
- fully associative

#### 替换策略

常见的替换策略有：Random / FIFO / LRU / OPT

##### Random

- 随便选一个 block 替换；
- 实现成本低；
- 硬件上甚至只需要一个随机数发生器。

优点：

- 不跟踪复杂历史；
- 平均意义上也未必很差。

缺点：

- 可能刚好把马上又要用的数据替换掉。

##### FIFO

**FIFO（First In, First Out）** 

- 谁先进入这组；
- 谁就先被替换掉。

优点：

- 比 LRU 简单；
- 容易实现。

缺点：

- 可能把虽然进来较早、但其实还在频繁使用的数据赶走。

#### LRU

**LRU（Least Recently Used，最近最少使用）** 是最经典也最符合 locality 直觉的策略之一：

- 认为最近刚访问过的 block，更可能很快又被访问；
- 因此优先淘汰最久没被访问过的 block。

>既然无法预测未来，那就让已经发生的访问历史来帮助猜测未来。

优点：

- 和 temporal locality 很契合；
- 通常表现优于纯随机和 FIFO。

缺点：

- 需要额外记录访问顺序；
- associativity 一大，硬件代价就会上升得很快。

##### OPT

**OPT（Optimal replacement）** ：

- 如果真的知道未来；
- 那就淘汰未来最晚才会再被访问，甚至根本不再访问的那个 block。

它当然性能最好，但基本不能真实实现，因为：

- 它需要已知未来访问序列。

OPT 的意义更多是作为理论最优上界；



#### Example

`2, 3, 2, 1, 5, 2, 4, 5, 3, 4`

- cache block 数量：`3`
- 访问序列：

```text
2, 3, 2, 1, 5, 2, 4, 5, 3, 4
```

hit 次数：

| 策略 | 命中次数 | 评论 |
| --- | --- | --- |
| FIFO | `3` | 只看进入顺序，容易换错对象 |
| LRU | `4` | 更符合 temporal locality |
| OPT | `5` | 理论最优，因为“知道未来” |

- replacement policy 确实会直接影响 hit rate；
- 而 hit rate 的变化，最终又会传导到 `miss rate` 和 `AMAT`。



#### Thrashing and Belady Anomaly

#### Thrashing

如果工作集比 cache 能承受的更大，并且访问序列不断在几组数据之间来回切换，就会出现 **thrashing（抖动）**。

典型序列：

```text
1, 2, 3, 4, 1, 2, 3, 4
```

当 cache 太小、映射又不友好时：

- 刚装进来的数据很快又被挤掉；
- hit 非常少；
- 系统大部分时间都花在 miss 和 replacement 上。

thrashing 的本质就是：

- **工作集大于有效 cache 容量**
- **映射冲突太严重**

##### Belady Anomaly

**Belady anomaly（Belady 异常）** ：

> 某些替换算法下，cache block 数量增加，hit rate 反而可能下降。

也就是说，**block 数变多并不自动保证命中率一定提升**。

这件事最常见于 FIFO 这类不具备 stack property 的算法。

而对 LRU 来说：

- hit ratio 会随着 block 数增加而单调不减；
- 这正是它作为 **stack replacement algorithm（栈型替换算法）** 的重要性质。

##### Stack Property

$$
B_t(n) \subseteq B_t(n+1)
$$

含义是：

- 在时间 `t`，容量为 `n` 的 cache 中保存的 block 集合；
- 一定是容量为 `n+1` 的 cache 中 block 集合的子集。

这个性质说明：

- cache 容量增加时，LRU 不会丢掉原本更小 cache 能保住的数据；
- 所以其 hit rate 不会因为 block 数增加而下降。

所以 LRU 在 n 增加时，hit rate 不会下降；而 FIFO 就没有这个保证，可能出现 hit rate 反而下降的情况。


#### Comparison Pair

如果想精确实现 LRU，可以使用 **comparison pair method（成对比较法）**。

基本思想是：

- 对组内每两个 block 记录谁比谁更新近；
- 然后用这些 pairwise 状态推导出谁是最久未使用者。

例如 3 个 block `A, B, C` 时，可以维护：

- `T_AB`
- `T_AC`
- `T_BC`

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171127402.png" alt="comparison pair method" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

但这个方法的代价增长非常快。  $C_p^2$
- 3 个 block：需要 `3` 个 flip-flop
- 4 个 block：需要 `6` 个 flip-flop
- 8 个 block：需要 `28` 个 flip-flop
- 64 个 block：需要 `2016` 个 flip-flop

所以：

- **精确 LRU 在 associativity 较高时硬件代价非常大**
- 这也是为什么实际处理器里经常用 **pseudo-LRU（近似 LRU）**，而不是严格 LRU

### Q4：Write Strategy

Q4 讨论的是：

> 如果这次访问是 write，会发生什么？

1. **write hit 时怎么写**
2. **write miss 时怎么写**

而这两层组合起来，才构成完整的 write policy。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171134354.png" alt="write policy flowchart" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **write-through + no-write-allocation**
  - 结构简单；
  - 写 miss 直接往下写；
  - 不在 cache 中留副本。

- **write-back + write-allocation**
  - 流程更长；
  - replacement 时要检查 dirty；
  - miss 时可能要先回写旧块，再装入新块，再更新数据。

#### Write Hit

Write-Through vs Write-Back

##### Write-Through

**write-through（写直达）** 的：

- 一次 write hit 时；
- 同时把数据写到 cache 和 main memory。

特点：

- 一致性强；
- main memory 永远保存最新值；
- 控制位通常只需要 `valid bit`。

优点：

- 语义直观；
- memory 中总是最新数据；
- 出现系统故障时，丢失尚未回写数据的风险更小。

缺点：

- 每次写都要碰 memory；
- memory bandwidth 压力大；
- 容易产生 write stall。


**real-time systems（实时系统）**、flight control（飞控）这些场景往往更在意：

- 数据一致性；
- 可预测性；
- 而不是单纯追求写性能。

所以会采用 write-through。

##### Write-Back

**write-back（写回）** 的规则是：

- write hit 时只改 cache；
- 先不立刻写 main memory；
- 等这个 block 之后被替换出去时，再把它写回下层。

这时就需要一个额外控制位：

- **dirty bit（脏位）**

它表示：

- `dirty = 1`：cache 中这份数据已经被改过，但 main memory 还没同步；
- `dirty = 0`：cache 与 memory 中对应块内容一致。

优点：

- 大幅减少对 memory 的直接写入；
- 对局部反复写同一块数据的程序更友好；
- 性能通常更高。

缺点：

- 控制更复杂；
- replacement 时如果 block 是 dirty，还得先 write-back；
- 系统异常掉电时，cache 中尚未写回的数据可能丢失。

**general-purpose processors（通用处理器）**、desktop CPU系统通常更看重 average performance，一般会采用 write-back；

#### Write Miss

Write Allocate vs No-Write-Allocate

write miss 时，策略分歧主要在：

要不要先把目标 block 装进 cache？

##### Write Allocate

**write allocate（写分配）** ：

- write miss 时；
- 先把对应 block 从 main memory 调到 cache；
- 再在 cache 中执行写操作。

它的思想体现：

- temporal locality：既然现在要写，后面可能还要读或继续写；
- spatial locality：同一 block 中的其他数据可能也很快用到。

因此 **write allocate** 常和 **write-back** 搭配，因为：

- 既然块已经进 cache 了；
- 后续对这个块的多次写就都能在 cache 中完成。

##### No-Write-Allocate

**no-write-allocate（写不分配）**，也常叫 **write around**：

- write miss 时；
- 直接把数据写到 main memory；
- 不把该 block 拉进 cache。

优点：

- 避免**把一次性写、以后很少再访问**的数据塞进 cache；
- 防止 cache pollution（cache 污染）。

所以它更适合这类访问：

- 日志写入
- streaming data
- 很少被重新读取的写操作

#### 常见组合

理论上 write hit 和 write miss 策略可以自由组合，但有两种最常见组合：

1. **write-back + write-allocate**
   - 写 miss 时先把 block 调上来；
   - 后续读写都更可能 hit；
   - 真正回 memory 等 replacement 再说。

2. **write-through + no-write-allocate**
   - 写 miss 时直接写 main memory；
   - 不把数据引入 cache；
   - 简单、直观，也避免无意义占用 cache。


性能优先 -> 更偏 `write-back + write-allocate`
一致性 / 可预测性优先 -> 更偏 `write-through + no-write-allocate`

#### Write Stall and Write Buffer

write-through 的一个直接问题是：

- 每次写都可能要等 main memory；
- CPU 很容易被迫停下来。

这就是 **write stall（写停顿）**。

一种非常常见的优化是：

- **write buffer（写缓冲）**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604171134562.png" alt="write buffer" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

它的思路是：

- CPU 先把要直写的数据放入一个小 buffer；
- 然后继续执行后续指令；
- 由 buffer 在后台慢慢把数据推到 memory。

这样可以明显减轻 write-through 的性能损失。  
但它也不是万能的，因为：

- 如果短时间内写太密集；
- buffer 还是可能被写满；
- 写满后 CPU 仍然要 stall。


#### Example

No-Write-Allocate vs Write-Allocate

条件：

- fully associative
- write-back
- cache 很大，不考虑 replacement
- 初始为空
- 访问序列如下：

```text
1. write Mem[100]
2. write Mem[100]
3. read  Mem[200]
4. write Mem[200]
5. write Mem[100]
```

比较：

- `no-write-allocate`
- `write-allocate`

**Case 1：No-Write-Allocate**

1. `write Mem[100]`
   - write miss
   - 直接写 memory，不装入 cache
   - `miss`

2. `write Mem[100]`
   - cache 中仍没有这个 block
   - 还是 `miss`

3. `read Mem[200]`
   - 读 miss
   - 把 block 200 调入 cache
   - `miss`

4. `write Mem[200]`
   - 此时 block 200 已在 cache 中
   - `hit`

5. `write Mem[100]`
   - 100 对应 block 仍不在 cache 中
   - `miss`

因此结果是：

| 操作 | no-write-allocate |
| --- | --- |
| `write Mem[100]` | miss |
| `write Mem[100]` | miss |
| `read Mem[200]` | miss |
| `write Mem[200]` | hit |
| `write Mem[100]` | miss |

总计：

- `1 hit`
- `4 misses`



**Case 2：Write-Allocate**

1. `write Mem[100]`
   - write miss
   - 但因为采用 write allocate，要先把 100 所在 block 调到 cache
   - 再写入 cache
   - `miss`

2. `write Mem[100]`
   - 100 所在 block 已经在 cache 中
   - `hit`

3. `read Mem[200]`
   - 第一次访问 200
   - `miss`
   - 并把 200 所在 block 调入 cache

4. `write Mem[200]`
   - 200 所在 block 刚才已经调入
   - `hit`

5. `write Mem[100]`
   - 100 所在 block 也还在 cache 中
   - `hit`

所以结果是：

| 操作 | write-allocate |
| --- | --- |
| `write Mem[100]` | miss |
| `write Mem[100]` | hit |
| `read Mem[200]` | miss |
| `write Mem[200]` | hit |
| `write Mem[100]` | hit |

总计：

- `3 hits`
- `2 misses`

>如果后续确实还要继续访问这个 block；那么 write allocate 往往更合适。也就是说，write allocate 的效果本质上还是靠 locality 在支撑。

---

## Memory System Performance

Cache 的性能：

真正影响系统性能的，不只是有没有 cache，而是 cache 的三个关键量：

- **hit time（命中时间）**
- **miss rate（失效率）**
- **miss penalty（失效代价）**

所有后面的优化，几乎都可以看成是在想办法改善这三者中的一个或多个。

### CPU Execution Time and Memory Stall Cycles

$$
\text{CPU Execution time}=(\text{CPU clock cycles} + \text{Memory stall cycles}) \times \text{Clock cycle time}
$$

- 即使处理器本身执行逻辑很快；
- 只要 memory stall cycles 很多；
- 总执行时间还是会被拉长。

对 cache 而言，一个很重要的展开式是：

$$
\text{Memory stall cycles}=IC \times \frac{\text{MemAccess}}{\text{Inst}} \times \text{MissRate} \times \text{MissPenalty}
$$

- `IC`：instruction count
- `MemAccess / Inst`：平均每条指令有多少次 memory access
- `MissRate`：这些访问里有多少比例会 miss
- `MissPenalty`：每次 miss 要额外付出多少周期

把它代回去，就得到：

$$
\text{CPUtime}=IC \times\left(CPI_{Execution}+\frac{\text{MemAccess}}{\text{Inst}}\times \text{MissRate}\times \text{MissPenalty}\right)\times\text{CycleTime}
$$

如果把 `MissRate × MemAccess / Inst` 进一步合并成 `MemMisses / Inst`，也可以写成：

$$
\text{CPUtime}=IC \times\left(
CPI_{Execution}
+
\frac{\text{MemMisses}}{\text{Inst}}
\times \text{MissPenalty}
\right)
\times
\text{CycleTime}
$$

这两个写法本质一样，只是视角不同：

- 一个从 miss rate 出发；
- 一个从每条指令平均 miss 次数出发。

### AMAT

AMAT:Average Memory Access Time

$$
AMAT = \text{Hit time} + \text{Miss rate} \times \text{Miss penalty}
$$

1. **Hit time**
   - cache 命中时，从发起访问到拿到数据所需时间；
   - 包括 tag 比较、选择 line、读取 data 等。

2. **Miss rate**
   - 访问中 miss 的比例；
   - 也可以转换成 `misses per instruction` 来写。

3. **Miss penalty**
   - miss 以后，多出来的额外等待时间；
   - 往往包括访问下层 memory、搬运 block、必要时做 replacement / write-back 等开销。

其实就是把所有 memory access 分成两类：

1. **命中**
   - 花 `hit time`

2. **失效**
   - 先付出 hit 检查代价；
   - 再额外付出 `miss penalty`

:::TIP
- `hit time` 不是“整个访存时间”；
- `miss penalty` 也不是“从头到尾全部时间”，而是 **相对 hit 多出来的那部分代价**。
:::

### Example

假设：

- 基础执行 `CPI = 1.0`（先忽略 memory stalls）
- cache miss penalty = `200` clock cycles
- miss rate = `2%`
- 平均每条指令有 `1.5` 次 memory reference
- 平均每 `1000` 条指令有 `30` 次 cache miss

问：把 cache 行为算进来后，对性能有什么影响？

**Case 1:用Miss Rate 来算**

每条指令带来的 memory stall cycles 为：

$$
1.5 \times 0.02 \times 200 = 6
$$

所以总 `CPI` 变成：

$$
CPI = 1.0 + 6 = 7
$$


**Case 2: 用 Misses Per Instruction 来算**

题目还给了另一个等价条件：

$$
\frac{30}{1000} = 0.03 \text{ miss / inst}
$$

于是：

$$
0.03 \times 200 = 6
$$

因此同样得到：

$$
CPI = 1.0 + 6 = 7
$$

如果完全没有 cache，那么可以粗略理解为：

- 每次 memory reference 都要直接付出主存代价

这时：

$$
CPI = 1.0 + 1.5 \times 200 = 301
$$

- 有 cache 时：`CPI = 7`
- 没有 cache 时：`CPI = 301`

如果只看这个简化模型下的比值，则 cache 带来的改善大约是：

$$
\frac{301}{7} \approx 43
$$

- **哪怕 miss rate 只有 2%，只要 miss penalty 足够大，cache 仍然会深刻影响整体性能**

---
## Improve Cache Performance

衡量 cache 优化，最核心的还是三件事：

$$
AMAT = \text{Hit time} + \text{Miss rate} \times \text{Miss penalty}
$$

但在现代处理器里，只看这个式子还不够。因为很多优化还会影响：

- **cache bandwidth（缓存带宽）**
- **power / area（功耗与面积）**
- **clock cycle time（时钟周期）**
- **complexity（实现复杂度）**

所以判断一种方法是否“值得”，不能只看 `miss rate` 是否下降，还要看它会不会拖慢 hit path、增加功耗，或者让控制逻辑复杂很多。

:::TIP
一个很重要的判断原则是：

- **hit path 上付代价**：每次访问都要承担；
- **miss path 上付代价**：只有 miss 时才承担。

很多方法的设计思想，本质上就是在这两种代价之间做折中。
:::

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604231329256.png" alt="Cache Optimization Summary" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Reducing the Hit Time

#### Small and Simple First-Level Caches

L1 cache 几乎每次访存都会经过，所以 **L1 的 hit time 往往比它的 miss rate 更敏感**。

核心思路：

- L1 不做得太大；
- associativity 不做得太高；
- 让 tag compare、data access、way select 这条关键路径尽量短。

优点：

- hit 更快；
- 往往也更省电。

代价：

- 容量小、相联度低时，可能增加 miss rate；
- 需要依赖更大的 L2 / L3 来兜底。

所以经典设计通常是：

- **小而快的 L1**
- **大而慢的 L2 / L3**

---

#### Way Prediction

组相联 cache 的问题在于：  
为了知道哪一 way 命中，通常要比较多个 tag，再做数据选择，这会拉长 hit time。

**way prediction** 的做法是：

- 先预测“这次大概率命中哪一 way”；
- 先按这个预测去访问；
- 如果预测正确，就接近 direct-mapped 的 hit path；
- 如果预测错误，再补查其他 way，付出额外延迟。

本质上它是在做这样的折中：

- **用少量预测状态**
- 换取 **平均 hit time 的下降**

适合场景：

- 组相联 cache；
- 对 hit time 很敏感的前端 / L1。

代价：

- 预测错时会有额外 penalty；
- 数据 cache 上做 way prediction 一般比 I-cache 更麻烦，因为误判更容易影响后续流水线。


### Increasing Cache Bandwidth

这一类方法的目标，不是直接减少单次访问延迟，而是让 cache **在单位时间内能接更多请求**。

#### Pipelined Caches

把一次 cache access 拆成多个 pipeline stage，例如：

- 地址/index 处理
- tag compare
- data array access
- 返回结果

这样做的好处是：

- 可以提高时钟频率；
- cache 本身吞吐更高。

但要注意：

- **带宽上升，不代表单次访问 latency 下降**
- 有时 latency 反而更高了

影响：

- I-cache pipeline 更深，会放大 branch misprediction 的代价；
- D-cache pipeline 更深，会增加 load-use latency。

所以 pipelined cache 更像是在用 **更长的访问流水**，换 **更高的频率和吞吐**。

#### Multibanked Caches

把一个 cache 分成多个独立 bank，让不同访问可以并行落到不同 bank：

- 若两个请求去不同 bank，可以同周期并行；
- 若两个请求撞到同一个 bank，就会出现 **bank conflict**。

优点：

- 提高并发访问能力；
- 对 superscalar、多发射、多 load/store 系统尤其重要。

代价：

- bank 映射和仲裁逻辑更复杂；
- 存在 bank conflict；
- 程序访问模式会直接影响收益。

所以它本质上是在做：

- **把一个大缓存拆成多个可并行的小通道**

#### Nonblocking Caches

传统 blocking cache 在 miss 时会卡住后续访问。  
**nonblocking cache** 则允许：

- **hit under miss**：一个 miss 正在处理时，后续 hit 还能继续；
- **miss under miss**：甚至允许多个 miss 并行在途。

直观理解：

- miss 不再把整个 cache 前端“封死”；
- 处理器能把部分等待隐藏掉。

关键实现点：

- 要记录多个 outstanding misses；
- 常见做法是用 **MSHR（Miss Status Handling Register）** 跟踪每个 miss 的去向、返回数据该填到哪里、唤醒哪条 load/store。

优点：

- 显著降低 effective miss penalty；
- 对 memory-level parallelism 较高的程序很有效。

代价：

- 控制逻辑明显更复杂；
- 需要处理返回乱序、命中/失效碰撞、coherence 等问题。


### Reducing the Miss Penalty

#### Multilevel Caches

这是最基本也最常见的方法：

- L1 miss 后先查 L2；
- L2 miss 后再查 L3；
- 最后才去 main memory。

作用：

- 把“直接掉到主存”的昂贵 miss，改成“更低一级 cache hit”的相对便宜 miss；
- 从而降低 **effective miss penalty**。

代价：

- hierarchy 更复杂；
- inclusive / exclusive / non-inclusive 等策略会影响设计；
- 多级之间的一致性和替换关系更复杂。


#### Critical Word First / Early Restart

一次 miss 往往是按 block 为单位搬运的。  
但处理器真正急需的，常常只是其中一个 word。

因此可以：

- **Critical Word First**：先取当前最需要的那个 word；
- **Early Restart**：只要关键 word 到了，就先让处理器继续执行，剩余部分稍后补齐。

作用：

- 不一定减少总传输量；
- 但可以减少处理器真正“卡住”的时间。

适合场景：

- block 较大；
- miss penalty 中“首字返回延迟”占比较高。


#### Read Miss Priority Over Write Miss

读 miss 往往直接阻塞程序继续执行；  
写请求很多时候可以先暂存在 write buffer 里。

所以常见策略是：

- **读优先于写**
- 尤其是 **read miss priority over write miss**

这样做可以：

- 让关键路径上的 stall 更少；
- 避免写流量把读请求拖住。


#### Merging Write Buffers

如果 write buffer 中有多次写，目标恰好落在同一 cache line 或相邻区域，就可以合并：

- 减少总线事务数；
- 减少下层存储压力；
- 降低写流量对读 miss 的干扰。

优点：

- 对 write-through cache 特别常见；
- 硬件代价通常不算太夸张。

代价：

- 需要检测可合并性；
- buffer 管理更复杂。


#### Victim Cache

**victim cache** 是一个很小的、通常是 fully-associative 的缓冲区，  
专门保存 **刚从主 cache 被替换出去的 block**。

工作方式：

- L1 hit：直接返回；
- L1 miss 且 victim cache hit：通常执行 **swap**，把 victim cache 中的目标块和 L1 中冲突块交换；
- L1 miss 且 victim cache miss：再访问下层存储。

它针对的核心问题是：

- **conflict miss**
- 且通常是 **被替换后很快又重用** 的那类 conflict miss

优点：

- 不把额外复杂度放到 L1 正常 hit path 上；
- 对 direct-mapped cache 很有吸引力；
- 常能以很小硬件代价显著缓解“ABAB 式冲突抖动”。

局限：

- 对 capacity miss 帮助有限；
- 对长 reuse distance、流式访问帮助也有限；
- 它不是一个“正常的额外 cache level”，而是一个 **专门接住 victim line 的小旁路结构**。


### Reducing the Miss Rate

#### Larger Block Size

block 变大以后，一次 miss 会顺带把附近更多数据带上来，因此：

- **spatial locality** 利用更充分；
- **compulsory miss** 往往下降。

但副作用也很明显：

- miss penalty 变大；
- 同样 cache 容量下，block 数变少；
- 可能加重 conflict miss / capacity miss。

所以 block size 永远是 locality 和 penalty 的折中。


#### Larger Cache Size

cache 更大时，能留下更多 block，因此：

- **capacity miss** 一般下降。

但代价是：

- 成本和面积增加；
- 功耗上升；
- hit time 可能变长。

因此：

- L1 通常不会做得很大；
- 更大的容量往往放到 L2 / L3 / LLC。

#### Higher Associativity

提高 associativity 的核心作用是：

- 把“只能放一个位置”变成“能在同组多个位置中选一个”
- 从而减少 **conflict miss**

优点：

- 对冲突敏感的工作负载常常有效。

代价：

- tag compare 更多；
- replacement 逻辑更复杂；
- hit time 往往更长；
- 功耗也会增加。

所以常见的理解就是：

- **direct-mapped：快，但脆弱**
- **higher associativity：稳，但贵**

#### Compiler Optimizations

有些 miss 不是硬件“命不好”，而是程序访问顺序本身写得不友好。

编译器常见优化包括：

##### Loop Interchange

通过交换嵌套循环次序，让数组访问更接近其内存布局顺序。

作用：

- 提高 spatial locality；
- 让一个 cache block 中的数据尽可能被连续用完。

##### Blocking / Tiling

把大问题切成能留在 cache 里的小块，再对子块反复运算。

作用：

- 提高 temporal locality；
- 在数据被替换前多用几次。

这一类优化说明一个关键事实：

- **locality 不只是硬件属性，也是程序组织属性**


### Reducing Miss Penalty or Miss Rate via Parallelism

#### Hardware Prefetching

核心思想：

- 在处理器真正发出 demand access 之前，
- 预测它很快会用到哪些数据，
- 然后提前取回来。

常见形式：

- next-line prefetch
- stream buffer
- stride prefetch
- 更复杂的相关性预取

优点：

- 若预取及时，可把后续 miss 变成 hit；
- 若不够及时，也能降低 miss penalty。

代价：

- 预取错会浪费带宽；
- 还可能污染 cache；
- 对功耗也可能有负面影响。

所以 prefetch 的本质是：

- **用多做一点“可能没必要的工作”**
- 去换 **关键时刻少等一点**

#### Compiler-Controlled Prefetching

这类方法由编译器显式插入 prefetch 指令：

- 在真正用到数据之前若干迭代，先发预取；
- 目标通常是让访问和计算重叠。

优点：

- 编译器更了解循环结构和访问模式；
- 对规则数组访问特别有效。

前提：

- 必须给预取留出足够“提前量”；
- cache 通常需要是 **nonblocking** 的，否则预取本身又会把执行卡住。

代价：

- 会增加指令数；
- 预取距离不好选；
- 程序行为稍变，效果可能就明显波动。


### Extending the Memory Hierarchy

这一类方法关注的已经不只是“传统 cache 怎么做更好”，而是：

- **如何把更大容量、更高带宽、更多设备的内存也纳入同一 hierarchy**

#### Using HBM to Extend the Memory Hierarchy

**HBM（High Bandwidth Memory）** 是把 DRAM 堆叠起来，放得更靠近处理器/加速器的一种近存储方案。

特点：

- 总线非常宽；
- 带宽很高；
- 容量通常不如外部大容量 DRAM；
- 成本和封装要求更高。

在 hierarchy 中，HBM 常见角色是：

- 作为高带宽近内存；
- 作为比 DDR 更快但更贵的一层；
- 有时也可视作 **L4 / near-memory cache**。

它解决的主要矛盾是：

- **传统 DDR 容量够，但带宽不够**
- **HBM 带宽很强，但容量和成本受限**

#### Using CXL to Extend the Memory Hierarchy

**CXL（Compute Express Link）** 可以把外部内存设备、加速器和主机以 cache-coherent 的方式连起来。

从 memory hierarchy 视角看，它的重要价值是：

- 支持 **memory expansion（内存扩展）**
- 支持 **memory pooling（内存池化）**
- 支持 **memory sharing（内存共享）**
- 让部分“原本不在本机板上的内存”也能进入层次结构

可以把它理解成：

- 在本地 DDR / HBM 之下，
- 引入一层 **更远、通常更慢、但更灵活、更大** 的扩展内存层。

优点：

- 提升容量弹性；
- 资源利用率更高；
- 对数据中心和大规模异构系统很重要。

代价：

- 延迟通常高于本地 DRAM；
- QoS、coherence、资源管理都更复杂；
- 更适合作为“较远的一层内存”，不适合作为最靠近核心的高速层。


#### Using UnifiedBus to Extend the Memory Hierarchy

这里把 **UnifiedBus** 理解为近年来“**统一互连 / memory-semantic fabric / 资源池化总线**”这一类方案。

它的目标通常是：

- 把 CPU、GPU、NPU、内存和 I/O 设备放到更统一的互连语义下；
- 让远端内存、池化内存、异构设备内存更容易被系统按层次结构使用；
- 支持更大范围的资源共享与扩展。

直观理解：

- 传统 memory hierarchy 多是在单机板内分层；
- UnifiedBus 这类方案是在 **更大系统范围** 上继续分层。

优点：

- 容量扩展强；
- 资源池化能力强；
- 对大规模 AI / 数据中心系统有吸引力。

代价：

- 延迟一定高于本地 cache / DRAM；
- 流控、QoS、容错、隔离、安全都更难；
- 软件栈和资源调度复杂度明显上升。

## Additional Techniques Often Discussed with Cache Optimization

### Skewed-Associative Cache

普通组相联 cache 中，同一个 block 先确定 set，再在该 set 里挑 way。  
**skewed-associative cache** 的特殊点在于：

- **不同的 way 使用不同的索引/哈希函数**
- 因此两个在某一 way 中冲突的 block，可能在另一 way 中并不冲突

作用：

- 进一步降低 conflict miss；
- 尤其适合那些“普通组相联里仍然老撞同一组”的模式。

优点：

- 比直接增加 associativity 更有针对性；
- 有时能以较低 way 数取得不错效果。

代价：

- 索引和替换逻辑更复杂；
- 查找路径也更难实现得非常规整。

---

### Pseudo-Associative Cache

它想同时保住两件事：

- direct-mapped 的快 hit time；
- set-associative 的较低 conflict miss

基本思路：

- 先按 direct-mapped 的主位置查一次；
- 如果主位置没命中，再去查一个“备用位置”；
- 若备用位置命中，这种命中叫 **pseudo-hit**

因此它的访问特征是：

- 正常 hit 很快；
- pseudo-hit 比正常 hit 慢；
- miss rate 介于 direct-mapped 和 set-associative 之间。

本质上它是在做：

- **把部分 associativity 延迟到第二次检查**


### Cache Coloring

**cache coloring** 更多是 OS / allocator 级别的方法，也常叫 **page coloring**。

核心想法：

- 物理页号会影响它映射到 LLC 的哪些 set；
- OS 可以控制不同页面分配到哪些“颜色”；
- 从而减少热点数据在 LLC 中互相冲突。

用途：

- 减少 cache conflicts；
- 做 cache partition / isolation；
- 提高多程序系统中的可预测性。

这类方法说明：

- cache 行为并不完全由硬件决定；
- **内存分配策略也能改变 cache 冲突模式**

---

### System-Level Cache

**system-level cache（系统级缓存）** 常见于 SoC：

- 它不只服务 CPU；
- 还可能同时服务 GPU、NPU、DSP、ISP、媒体单元等。

作用：

- 降低多个 IP 对外部 DRAM 的访问压力；
- 减少跨设备数据搬运；
- 提高整个 SoC 的能效。

优点：

- 对异构 SoC 很重要；
- 能显著减少 off-chip traffic。

代价：

- coherence 更复杂；
- 多主设备竞争更激烈；
- QoS / priority / partitioning 都更关键。

---

## GPU Memory and Cache-Related Topics

GPU 的优化重点和 CPU 不完全一样。  
CPU 通常更依赖 cache 去降低延迟；  
GPU 除了使用 cache，还大量依赖：

- **multithreading**
- **coalescing**
- **shared memory / scratchpad**
- **高带宽显存**

### GPU Shared Memory

GPU shared memory 本质上是：

- 每个 SM / 线程块附近的一块 **on-chip scratchpad**
- 延迟低、带宽高
- 由程序员显式管理

作用：

- 保存会被线程块内多次复用的数据；
- 减少反复访问全局显存；
- 让局部数据交换不经过更慢的 global memory。

优点：

- 非常快；
- 可控性强；
- 对 tile-based 算法尤其有效。

代价：

- 容量小；
- 需要程序员显式管理；
- 会有 **bank conflict** 问题。

### GPU Memory Hierarchy

GPU 常见的 memory hierarchy 可以粗略理解为：

- registers
- shared memory / scratchpad
- L1 / texture cache
- L2 cache
- HBM / GDDR global memory
- host memory

和 CPU 相比，GPU 的几个特点是：

- 更强调 **高带宽**；
- 更依赖 **大量线程隐藏延迟**；
- cache 往往没有 CPU 那么“全能”，shared memory 反而很关键；
- 访存模式是否能 **coalescing（合并访存）** 非常重要。

所以 GPU memory hierarchy 的优化重点通常是：

- 提高带宽利用率；
- 减少 global memory traffic；
- 增强 locality；
- 降低线程间资源争用。


### Unified Memory Architecture

GPU 的 **unified memory** 指的是：

- CPU 和 GPU 共享一个统一虚拟地址空间；
- 数据页可以在 CPU 与 GPU 之间按需迁移；
- 程序员不必总是手写显式 memcpy。

优点：

- 编程简单很多；
- CPU/GPU 协同更自然；
- 适合复杂数据结构和快速原型开发。

代价：

- 页迁移和 page fault 会带来额外开销；
- 若访问模式不好，可能频繁来回迁移，性能下降很明显。

所以 unified memory 更像是：

- **用更强的软件透明性**
- 换取 **对访问模式更高的要求**

---

## How to Compare These Techniques

更稳妥的比较维度是：

1. **它主要针对哪一类问题？**
   - hit time
   - bandwidth
   - miss penalty
   - miss rate
   - system-level capacity / sharing

2. **它把代价放在 hit path 还是 miss path？**

3. **它最擅长处理哪种 miss？**
   - conflict
   - capacity
   - compulsory
   - streaming / predictable access

4. **它的代价是什么？**
   - latency
   - power
   - area
   - complexity
   - programmability

---

## A Compact Takeaway Table

| Technique | Main Goal | Best For | Main Cost |
|---|---|---|---|
| Small/simple L1 | Reduce hit time | latency-sensitive L1 | higher miss rate |
| Way prediction | Reduce average hit time | set-associative L1 | misprediction penalty |
| Pipelined cache | Increase bandwidth / freq | high-frequency cores | higher access latency |
| Multibanked cache | Increase bandwidth | multiple accesses per cycle | bank conflicts |
| Nonblocking cache | Hide miss latency | MLP-rich workloads | high control complexity |
| Critical word first / early restart | Reduce miss penalty | large block refill | refill control complexity |
| Merging write buffer | Reduce write-related penalty | write-through / heavy write traffic | merge logic |
| Compiler optimization | Reduce miss rate | regular loop kernels | compile dependence |
| Hardware prefetch | Reduce miss penalty / rate | predictable streams | bandwidth waste / pollution |
| Compiler prefetch | Reduce miss penalty / rate | regular loops with lookahead | instruction overhead |
| Victim cache | Reduce conflict miss | short-reuse conflicts | small extra buffer |
| Skewed-associative | Reduce conflict miss | stubborn conflict patterns | hashing/replacement complexity |
| Pseudo-associative | Reduce conflict miss with fast first hit | between DM and SA | pseudo-hit latency |
| Cache coloring | Reduce LLC conflicts | OS-level placement / isolation | allocator complexity |
| System-level cache | Reduce off-chip traffic | heterogeneous SoC | coherence/QoS complexity |
| HBM | Extend bandwidth-rich memory layer | bandwidth-bound systems | cost / packaging |
| CXL | Extend/pool memory hierarchy | servers / composable systems | higher latency, management complexity |
| UnifiedBus | Extend system-scale memory hierarchy | large heterogeneous systems | software+fabric complexity |
| GPU shared memory | programmer-managed fast reuse | tiled GPU kernels | small capacity, bank conflicts |
| Unified memory | simplify CPU-GPU memory use | heterogeneous programming | migration overhead |
