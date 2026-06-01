---
title: DLP and TLP
published: 2026-06-01
description: Data-Level Parallelism and Thread-Level Parallelism
tags: [计算机体系结构]
category: 笔记
draft: false
---

## 概述

这一章讨论的是 **DLP（Data-Level Parallelism，数据级并行）** 与 **TLP（Thread-Level Parallelism，线程级并行）**。研究：**怎样利用数据之间或线程之间天然存在的并行性，构造更强的并行机器**。

---

## 目录

- [概述](#概述)
- [目录](#目录)
- [From ILP to DLP and TLP](#from-ilp-to-dlp-and-tlp)
  - [脉络](#脉络)
  - [DLP 与 TLP](#dlp-与-tlp)
- [Flynn Classification](#flynn-classification)
- [](#)
- [SIMD: Vector Processor](#simd-vector-processor)
  - [Vector Processor 与 Scalar Processor](#vector-processor-与-scalar-processor)
  - [为什么向量特别适合流水线](#为什么向量特别适合流水线)
- [Vector Processing Methods](#vector-processing-methods)
  - [Horizontal Processing Method](#horizontal-processing-method)
  - [Vertical Processing Method](#vertical-processing-method)
  - [Vertical and Horizontal Processing Method](#vertical-and-horizontal-processing-method)
- [Register-Register Vector Processor: CRAY-1](#register-register-vector-processor-cray-1)
  - [CRAY-1 的基本结构](#cray-1-的基本结构)
  - [向量寄存器与功能部件连接](#向量寄存器与功能部件连接)
  - [Vi Conflict](#vi-conflict)
  - [Functional Conflict](#functional-conflict)
  - [CRAY-1 中的向量指令类型](#cray-1-中的向量指令类型)
- [Improving Vector Processor Performance](#improving-vector-processor-performance)
  - [Multiple Functional Units](#multiple-functional-units)
  - [Vector Chaining](#vector-chaining)
    - [基本思想](#基本思想)
    - [例子：$D=A\\times(B+C)$](#例子datimesbc)
    - [三种执行方式的时间比较](#三种执行方式的时间比较)
      - [三条向量指令顺序执行](#三条向量指令顺序执行)
      - [前两条指令并行，第三条等待完整向量](#前两条指令并行第三条等待完整向量)
      - [使用 vector chaining](#使用-vector-chaining)
  - [Segmented Vector](#segmented-vector)
  - [Multi-Processor System](#multi-processor-system)
- [Modern Vector Architecture: RV64V](#modern-vector-architecture-rv64v)
  - [RV64V 的结构](#rv64v-的结构)
  - [DAXPY：从标量循环到向量指令](#daxpy从标量循环到向量指令)
    - [Scalar RISC-V 实现](#scalar-risc-v-实现)
    - [RV64V 向量实现](#rv64v-向量实现)
  - [Multiple Lanes: One Cycle 处理多个元素](#multiple-lanes-one-cycle-处理多个元素)
  - [Gather-Scatter: 稀疏数据的向量访问](#gather-scatter-稀疏数据的向量访问)
- [SIMD: Array Processor](#simd-array-processor)
  - [阵列处理机的基本概念](#阵列处理机的基本概念)
  - [Vector Processor 与 Array Processor 的侧重点](#vector-processor-与-array-processor-的侧重点)
- [Memory Organization of Array Processors](#memory-organization-of-array-processors)
  - [Distributed Memory](#distributed-memory)
  - [Centralized Shared Memory](#centralized-shared-memory)
- [Interconnection Network](#interconnection-network)
  - [为什么需要 ICN](#为什么需要-icn)
  - [直接连接路径的代价](#直接连接路径的代价)
  - [ICN 的组成与设计因素](#icn-的组成与设计因素)
  - [ICN 的分类与目标](#icn-的分类与目标)
  - [Interconnection Function](#interconnection-function)
- [Single-Stage Interconnection Network](#single-stage-interconnection-network)
  - [Cube Single-Stage Interconnection Network](#cube-single-stage-interconnection-network)
    - [例子：$N=8$ 的 cube 网络](#例子n8-的-cube-网络)
  - [PM2I Single-Stage Interconnection Network](#pm2i-single-stage-interconnection-network)
    - [例子：$N=8$ 的 PM2I 网络](#例子n8-的-pm2i-网络)
  - [Shuffle Exchange Network](#shuffle-exchange-network)
    - [例子：$N=8$ 的 shuffle](#例子n8-的-shuffle)
  - [单级互联网络的特点](#单级互联网络的特点)
- [Static Network Topologies](#static-network-topologies)
  - [Linear Array](#linear-array)
  - [Circular Array](#circular-array)
  - [Loop with Chord Array](#loop-with-chord-array)
  - [Tree Array](#tree-array)
  - [Star Array](#star-array)
  - [Grid 与 2D Torus](#grid-与-2d-torus)
  - [Hypercube 与 Cube with Loop](#hypercube-与-cube-with-loop)
- [Dynamic Interconnection Network](#dynamic-interconnection-network)
  - [Bus](#bus)
  - [Crosspoint Switches](#crosspoint-switches)
  - [Multi-Stage Interconnection Network](#multi-stage-interconnection-network)
  - [Multi-Stage Cube Interconnection Network](#multi-stage-cube-interconnection-network)
  - [Multi-Stage Shuffle Exchange Network / Omega Network](#multi-stage-shuffle-exchange-network--omega-network)
  - [Omega Network 与 n-cube Network 的比较](#omega-network-与-n-cube-network-的比较)
  - [动态互联网络比较](#动态互联网络比较)
- [SIMD](#simd)
- [DLP in GPU](#dlp-in-gpu)
  - [GPU 的基本思想](#gpu-的基本思想)
  - [CUDA 与 SIMT](#cuda-与-simt)
  - [例子：DAXPY 的 CUDA 写法](#例子daxpy-的-cuda-写法)
  - [Grid, Thread Blocks and Threads](#grid-thread-blocks-and-threads)
  - [GPU Memory Structures](#gpu-memory-structures)
  - [Memory Hierarchy in GPU](#memory-hierarchy-in-gpu)
  - [GPU Organization 的演化](#gpu-organization-的演化)
  - [NVIDIA GPU 与 Vector Machine 的比较](#nvidia-gpu-与-vector-machine-的比较)
- [Loop-Level Parallelism](#loop-level-parallelism)
  - [基本概念](#基本概念)
  - [Example 1：无 loop-carried dependence](#example-1无-loop-carried-dependence)
  - [Example 2：存在循环携带相关，难以并行](#example-2存在循环携带相关难以并行)
  - [Example 3：有 loop-carried dependence，但可以改写为并行](#example-3有-loop-carried-dependence但可以改写为并行)

---

## From ILP to DLP and TLP

### 脉络

- **pipelining**：通过重叠不同指令的执行过程提高吞吐率；
- **pipeline hazards**：结构冲突、数据相关与控制相关如何限制流水；
- **memory hierarchy**：存储系统对整体性能的影响；
- **ILP**：通过动态调度、乱序执行等手段挖掘指令级并行。

这些技术主要仍然围绕单个处理器内部的执行效率展开。而并行层次：

1. **DLP（Data-Level Parallelism）**：对大量数据元素执行相同或相似的运算；
2. **TLP（Thread-Level Parallelism）**：让多个线程或任务并行执行。

### DLP 与 TLP

1. **Data-Level Parallelism**

同一操作可以作用于大量彼此独立的数据。例如：

$$
C[i] = A[i] + B[i], \quad i=0,1,\ldots,N-1
$$

其中每个元素的加法都可以独立进行，因此天然适合并行执行。

2. **Thread-Level Parallelism**

程序能够划分为多个相对独立的线程或任务，每个执行实体运行自己的指令流，并在需要时通信或同步。

---

## Flynn Classification

Flynn 分类法按照 **instruction stream（指令流）** 与 **data stream（数据流）** 的数量，将计算机体系结构划分为四类：

| 类型 | 全称 | 基本含义 | 本课程对应内容 |
| --- | --- | --- | --- |
| SISD | Single Instruction Stream, Single Data Stream | 单指令流、单数据流 | 普通标量处理器、流水线、ILP |
| SIMD | Single Instruction Stream, Multiple Data Streams | 单指令流、多数据流 | 向量处理机、阵列处理机 |
| MISD | Multiple Instruction Streams, Single Data Stream | 多指令流、单数据流 | 实际较少使用 |
| MIMD | Multiple Instruction Streams, Multiple Data Streams | 多指令流、多数据流 | shared memory、message passing 等多处理器结构 |

SIMD 的核心特点是：

- 只有一条控制指令流；
- 同一条指令作用于多个数据元素；
- 特别适合规则的数据并行任务。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202132.png"  style="width: 520px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />
---

## SIMD: Vector Processor

### Vector Processor 与 Scalar Processor

1. **Vector processor（向量处理机）**

具有向量数据表示与对应向量指令的流水处理器。它可以用一条向量指令处理一整个向量中的多个元素。

2. **Scalar processor（标量处理器）**

没有专门的向量数据表示与向量指令，只能把各个元素的运算展开为标量指令逐项处理。

例如，对两个向量求和：

$$
C = A + B
$$

向量处理机可以从结构上把它视为一次向量运算；标量处理器通常需要通过循环逐项执行：

```text
C[0] = A[0] + B[0]
C[1] = A[1] + B[1]
...
C[N-1] = A[N-1] + B[N-1]
```

### 为什么向量特别适合流水线

向量运算的重要特点是：**同一向量运算中的不同元素之间通常没有数据相关性**。

例如：

$$
C[i] = A[i] + B[i]
$$

其中：

- $C[0]$ 的计算不依赖 $C[1]$；
- $C[1]$ 的计算不依赖 $C[2]$；
- 所有元素都执行相同类型的运算。

这恰好符合流水线最理想的工作负载：

- 功能一致；
- 数据不断流入；
- 相邻任务之间没有 RAW 依赖阻塞；
- 流水线一旦装满，就可以持续输出结果。

但如果向量处理方式选择不当，仍然可能引入：

- 数据相关；
- 频繁的功能切换；
- 向量寄存器或功能部件冲突。

因此，向量处理机设计的核心问题是：**怎样组织向量运算，使流水线真正保持高吞吐率**。

---

## Vector Processing Methods

如下运算作为贯穿例子：

$$
D = A \times (B + C)
$$

其中 $A,B,C,D$ 都是长度为 $N$ 的向量，乘法表示逐元素相乘：

$$
D_i = A_i \times (B_i + C_i), \quad i=1,2,\ldots,N
$$

### Horizontal Processing Method

**Horizontal processing（横向处理）**按元素从左到右完成整个表达式：

```text
D1 = A1 × (B1 + C1)
D2 = A2 × (B2 + C2)
...
DN = AN × (BN + CN)
```

等价于循环中的两步计算：

```text
Ki = Bi + Ci
Di = Ai × Ki
```

对于每一个元素，都必须先做加法，再做乘法。因此：

| 指标 | 次数 |
| --- | ---: |
| 数据相关 | $N$ 次 |
| 功能切换 | $2N$ 次 |

问题在于：

1. 每个元素内部都存在 RAW 相关：

$$
K_i = B_i + C_i \rightarrow D_i = A_i \times K_i
$$

2. 若使用静态多功能流水线，每处理一个元素都要在加法与乘法功能之间切换，甚至需要先排空已有流水；
3. 流水线不断被相关和切换打断，吞吐率很低，性能可能接近顺序执行。

因此：**横向处理不适合向量处理机**。

### Vertical Processing Method

**Vertical processing（纵向处理）**先对整个向量执行一种运算，再切换到下一种运算：

$$
K \leftarrow B + C
$$

$$
D \leftarrow A \times K
$$

执行过程是：

```text
K1 = B1 + C1
K2 = B2 + C2
...
KN = BN + CN

D1 = A1 × K1
D2 = A2 × K2
...
DN = AN × KN
```

此时：

| 指标 | 次数 |
| --- | ---: |
| 向量指令之间的数据相关 | 1 次 |
| 功能切换 | 2 次 |

优点非常明显：

- 做 $B+C$ 时，加法流水线持续工作；
- 做 $A\times K$ 时，乘法流水线持续工作；
- 功能切换从每个元素都发生，下降到每个向量运算阶段才发生。

但它要求保存完整的中间向量 $K$。早期纵向处理常使用 **memory-memory structure**：

- 源向量和目标向量都存放在 memory 中；
- 中间结果 $K$ 也需要写回 memory；
- 后续乘法再从 memory 取出 $K$。

典型机器包括：

- STAR-100；
- CYBER-205。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202300.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Vertical and Horizontal Processing Method

如果向量长度 $N$ 很大，硬件无法一次容纳整个向量，就需要使用 **vertical and horizontal processing（纵横处理 / 分组处理）**。

设：

$$
N = S \times n + r
$$

其中：

- $N$：完整向量长度；
- $n$：一个向量寄存器组一次能够容纳的元素数；
- $S$：完整长度分组数；
- $r$：剩余元素数。

当 $r>0$ 时，剩余元素也构成一组，因此共处理 $S+1$ 组。

处理原则是：

- **组内纵向处理**：一组内部先完成 $B+C$，再完成 $A\times K$；
- **组间横向推进**：第一组处理完后，再处理第二组，直到最后一组。

在 $r>0$ 的情况下：

| 指标 | 次数 |
| --- | ---: |
| 数据相关 | $S+1$ 次 |
| 功能切换 | $2(S+1)$ 次 |

这种方式对应于 **register-register structure**：

- 设置可以快速访问的向量寄存器；
- 源向量、目标向量和中间结果尽可能保存在向量寄存器中；
- 运算部件直接与向量寄存器相连；
- 避免每个中间向量都来回访问 memory。

典型寄存器型向量机包括：

- CRAY-1；
- 银河一号（YH-1）；
- GRAP-3；
- Earth Simulator 中的 SX-8 vector processor。

---

## Register-Register Vector Processor: CRAY-1

### CRAY-1 的基本结构

CRAY-1 是经典的寄存器型向量处理机，也是课堂用于说明向量流水结构的主要例子。

结构特征包括：

- 采用 **register-register** 的向量运算方式；
- 具有 12 条能够并行工作的单功能流水线，可分别支持地址、标量和向量运算；
- 具有向量寄存器组，用于保存源向量、目标向量与中间结果；
- 向量寄存器规模可表示为 8 个向量寄存器，每个寄存器含 64 个元素，每个元素为 64 bit；
- 典型性能描述为 100 MFLOPS，clock period 为 12.5 ns。

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202340.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202348.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

### 向量寄存器与功能部件连接

CRAY-1 中：

- 每个向量寄存器 $V_i$ 都通过独立总线连接到多个向量功能部件；
- 每个向量功能部件也具有将结果送回向量寄存器的结果通路；
- 当指令之间没有寄存器冲突和功能部件冲突时，不同向量指令可以并行工作。

这类结构的优势在于：

- 中间结果不必频繁写回 memory；
- 多条独立向量指令可以同时占用不同流水线；
- 能够进一步支持后面的 chaining 技术。

### Vi Conflict

**Vi conflict** 指并行工作的向量指令使用了同一个向量寄存器作为源或目标，从而出现相关或通路争用。

1. 写后读相关：

```text
V0 ← V1 + V2
V3 ← V0 × V4
```

第二条指令需要读取第一条指令写出的 $V0$，存在 RAW 相关。

2. 共同读取同一向量寄存器：

```text
V0 ← V1 + V2
V3 ← V1 × V4
```

两条指令都需要读取 $V1$。是否能并行执行取决于寄存器与通路是否支持并行读出。

### Functional Conflict

**Functional conflict** 指多条同时希望执行的向量指令需要使用同一个功能部件，而硬件中对应部件数量不足。

例如，两条向量乘法指令同时需要使用唯一的 vector multiply pipeline，就会发生功能部件争用。

因此，向量机器虽然适合流水线，也仍然要检查：

- 向量寄存器之间的相关或端口冲突；
- 功能部件是否足够；
- 是否存在能够支持并行/链接的数据通路。

### CRAY-1 中的向量指令类型

CRAY-1 中的主要向量操作分为四类：

| 类型 | 形式 | 含义 |
| --- | --- | --- |
| Vector-Vector | $V_k \leftarrow V_i \operatorname{op} V_j$ | 两个向量逐元素运算，结果写入向量寄存器 |
| Scalar-Vector | $V_k \leftarrow S_i \operatorname{op} V_j$ | 标量与向量逐元素运算 |
| Memory Load | $V_k \leftarrow \text{Memory}$ | 从 memory 读入向量 |
| Memory Store | $\text{Memory} \leftarrow V_i$ | 将向量写回 memory |

在后面的性能计算例子中，采用如下启动延迟设定：

| 操作 | 中间功能部件拍数 | 加上输入/输出传输后的首元素时间 |
| --- | ---: | ---: |
| Memory load | 6 | $1+6+1=8$ |
| Vector add | 6 | $1+6+1=8$ |
| Vector multiply | 7 | $1+7+1=9$ |

其中，流水线在输出第一个元素后，可以继续每拍输出一个后续元素。

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202432.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202446.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

---

## Improving Vector Processor Performance

四类向量性能优化方法：

1. 设置多个能够并行工作的功能部件；
2. 使用 **vector chaining** 加速存在依赖关系的向量指令串；
3. 当向量长度超过硬件可容纳长度时，使用 **segmented vector**；
4. 引入多个向量处理器，构成多处理器系统。

### Multiple Functional Units

最直接的方式是增加硬件资源，使不同种类的向量操作可以并行执行。

在 CRAY-1 中，不同单功能流水线可以分别执行：

- 向量加减与逻辑运算；
- 浮点乘法等运算；
- 标量运算；
- 地址计算；
- 向量 load / store。

只要指令之间：

- 没有 Vi conflict；
- 没有 functional conflict；
- 不存在必须等待的数据相关；

就可以同时占用不同的功能部件，提高吞吐率。

这种方法本质上是：**通过叠加硬件并行度换取更高性能**。

### Vector Chaining

#### 基本思想

**Vector chaining（向量链接）**用于处理存在 RAW 相关、但可以由不同功能部件完成的向量指令。

普通纵向执行需要等待前一条向量指令把全部 $N$ 个元素算完，后一条指令才开始。链接技术则允许：

> 当前一条向量指令产生第一个结果元素后，后一条指令立即消费该元素；后续元素按流水方式继续传递。

可以使用 chaining 的重要条件是：

- 两条指令存在可逐元素传递的写后读相关；
- 两条指令使用不同功能部件，不发生 functional conflict；
- 硬件存在从前一功能部件输出到后一功能部件输入的数据通路。

#### 例子：$D=A\times(B+C)$

$$
D=A\times(B+C)
$$

并作出如下假设：

- 向量长度 $N\le 64$，可以一次装入 CRAY-1 的向量寄存器，不需要分段；
- $B$ 和 $C$ 已经分别存放在 $V0$ 与 $V1$ 中；
- 需要从 memory 载入 $A$；
- load 与 add 的首元素时间都是 $8$ 拍；
- multiply 的首元素时间是 $9$ 拍。

对应三条向量指令为：

```text
(1) V3 ← A          // load A from memory
(2) V2 ← V0 + V1    // compute B + C
(3) V4 ← V2 × V3    // compute A × (B + C)
```

依赖关系如下：

- 指令 (1) 与指令 (2) 互相独立，可以并行执行；
- 指令 (3) 同时依赖指令 (1) 的 $V3$ 与指令 (2) 的 $V2$；
- 指令 (3) 使用乘法部件，而前两条分别使用 memory pipeline 与加法部件，因此不存在 functional conflict；
- 所以指令 (3) 可以与前两条建立向量链接。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202544.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### 三种执行方式的时间比较

##### 三条向量指令顺序执行

对于长度为 $N$ 的向量，一条流水向量指令在产生第一个元素后，还需要 $N-1$ 拍输出剩余元素。

因此：

$$
T_{seq}
= [1+6+1+(N-1)]
+ [1+6+1+(N-1)]
+ [1+7+1+(N-1)]
$$

$$
T_{seq}=3N+22
$$

##### 前两条指令并行，第三条等待完整向量

指令 (1) 与 (2) 可以完全并行，其完成时间取两者最大值；完成后再执行指令 (3)：

$$
T_{parallel}
= \max\{1+6+1+(N-1),\;1+6+1+(N-1)\}
+ [1+7+1+(N-1)]
$$

$$
T_{parallel}=2N+15
$$

##### 使用 vector chaining

指令 (1) 与 (2) 的第一个结果都在第 $8$ 拍后到达。此时，不需要等待完整的 $V2$ 和 $V3$ 生成，就可以立即送入乘法流水线。

第一个乘法结果产生所需时间为：

$$
\max\{1+6+1,\;1+6+1\} + (1+7+1)=8+9=17
$$

随后每拍输出一个结果，因此：

$$
T_{chain}=17+(N-1)=N+16
$$

三种方式对比如下：

| 执行方式 | 时间 |
| --- | ---: |
| 三条指令顺序执行 | $3N+22$ |
| 前两条并行，第三条等待完整向量 | $2N+15$ |
| Vector chaining | $N+16$ |

关键结论是：

- 并行功能部件已经能把时间从 $3N+22$ 降到 $2N+15$；
- chaining 进一步把整个依赖链变为逐元素流动，将时间降到 $N+16$；
- 向量越长，省下的周期越明显。

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202643.png" style="width: 420px; max-width: 32%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202652.png" style="width: 420px; max-width: 32%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202701.png" style="width: 420px; max-width: 32%; height: auto;" />
</div>

### Segmented Vector

当向量长度大于向量寄存器能够一次处理的最大长度时，需要使用 **segmented vector（分段向量）** 技术。

核心做法是：

- 把长向量分解为若干固定长度的 segment；
- 每次循环只处理一个 segment；
- 每个 segment 内仍然采用向量指令和流水执行；
- 系统由硬件与软件共同控制这一过程，对程序员尽可能透明。

这一点与前面纵横处理方法一致：**硬件资源有限时，必须通过分段让长向量继续享受向量执行优势**。

### Multi-Processor System

另一种提升向量性能的方法是增加更多向量处理器。

slides 给出的例子包括：

| 系统 | 结构特征 | 性能说明 |
| --- | --- | --- |
| CRAY-2 | 4 个 vector processors | 浮点计算速度最高可达 1800 MFLOPS |
| CRAY Y-MP / C90 | 最多 16 个 vector processors | 进一步提升并行向量吞吐率 |

这种方法的本质仍然是：**通过更多硬件执行资源提高整体并行能力**。

---

## Modern Vector Architecture: RV64V

### RV64V 的结构

现代处理器中的向量结构仍然能够看到 CRAY-1 的设计思想。

RV64V 的结构特点包括：

- 整体设计 loosely based on Cray-1；
- 具有向量寄存器文件；
- register file 具有 16 个 read ports 与 8 个 write ports；
- 向量功能部件 fully pipelined，并检测 data hazards 与 control hazards；
- vector load-store unit fully pipelined，在初始延迟之后可以每个 clock cycle 传输一个 word；
- 同时保留标量寄存器：31 个 general-purpose registers 与 32 个 floating-point registers。


<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202739.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### DAXPY：从标量循环到向量指令

**DAXPY（Double Precision $a\times X$ plus $Y$）** 计算：

$$
Y \leftarrow a \times X + Y
$$

#### Scalar RISC-V 实现

```asm
fld   f0, a             # Load scalar a
addi  x28, x5, #256     # Last address to load
Loop:
fld   f1, 0(x5)         # Load X[i]
fmul.d f1, f1, f0       # a × X[i]
fld   f2, 0(x6)         # Load Y[i]
fadd.d f2, f2, f1       # a × X[i] + Y[i]
fsd   f2, 0(x6)         # Store into Y[i]
addi  x5, x5, #8        # Increment index to X
addi  x6, x6, #8        # Increment index to Y
bne   x28, x5, Loop     # Check if done
```

#### RV64V 向量实现

```asm
vsetdcfg  4*FP64        # Enable 4 DP FP vregs
fld       f0, a         # Load scalar a
vld       v0, x5        # Load vector X
vmul      v1, v0, f0    # Vector-scalar mult
vld       v2, x6        # Load vector Y
vadd      v3, v1, v2    # Vector-vector add
vst       v3, x6        # Store the sum
vdisable                 # Disable vector regs
```

在示例设定下：

- 标量实现需要执行 loop，动态执行约 **258 条指令**；
- 向量实现只需 **8 条指令**。

但这种大幅压缩指令数并不是无条件成立的。能否向量化取决于：

> **不同循环迭代之间是否不存在数据相关性。**

对 DAXPY 而言，每个 $Y[i]$ 只依赖对应的 $X[i]$ 与原 $Y[i]$，不同 $i$ 之间互不依赖，因此可以安全地向量化。

### Multiple Lanes: One Cycle 处理多个元素

单条向量指令本身已经表达了多个元素的并行任务；硬件还可以进一步增加多个 **lane**，使同一个 clock cycle 内处理多个元素。

RV64V 类型向量指令具有一个非常重要的规律：

- 向量寄存器 $A$ 的第 $n$ 个元素只与向量寄存器 $B$ 的第 $n$ 个元素运算；
- 不会出现 $A[n]$ 与 $B[m]$、$n\ne m$ 的任意配对。

因此，硬件可以把不同元素稳定映射到不同 lane：

- 单 lane：每拍完成 1 个元素运算；
- 4 lanes：每拍完成 4 个元素运算；
- 多条 lane 同时生成的一组结果称为 **element group**。

这种固定的逐元素对应关系显著简化了高度并行向量单元的设计。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202827.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Gather-Scatter: 稀疏数据的向量访问

连续数组容易向量化，但稀疏矩阵或稀疏向量中的有效元素往往分散在不同位置。此时需要 **gather-scatter** 支持按索引向量完成不连续访存。

示例为：

```c
for (i = 0; i < n; i = i + 1)
    A[K[i]] = A[K[i]] + C[M[i]];
```

其中：

- $K$ 指定 $A$ 中需要访问的非零元素位置；
- $M$ 指定 $C$ 中需要访问的非零元素位置；
- 运算本质是对两个稀疏向量的有效元素求和。

使用索引向量后的 RV64V 风格代码为：

```asm
vsetdcfg  4*FP64        # 4 64b FP vector registers
vld       v0, x7        # Load K[]
vldx      v1, x5, v0    # Load A[K[]]
vld       v2, x28       # Load M[]
vldi      v3, x6, v2    # Load C[M[]]
vadd      v1, v1, v3    # Add them
vstx      v1, x5, v0    # Store A[K[]]
vdisable                 # Disable vector registers
```

这里：

- `vldx` / `vldi` 表示依据索引向量进行非连续读取；
- `vstx` 表示依据索引向量写回离散位置；
- 向量结构不只适用于连续内存，也可以用于带索引的数据访问模式。

---

## SIMD: Array Processor

### 阵列处理机的基本概念

SIMD 的另一种实现方式是 **array processor（阵列处理机）**。

阵列处理机由多个 processing element 构成：

$$
PE_0, PE_1, \ldots, PE_{N-1}
$$

其基本特征是：

- 设置 $N$ 个 processing elements；
- 这些 PE 以某种互联方式组成阵列；
- 在单个控制单元控制下，多个 PE 对各自数据并行执行同一条指令；
- 因此它也属于 SIMD；
- 阵列处理机有时也称为 parallel processor。

典型历史机器是 **ILLIAC IV**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202913.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Vector Processor 与 Array Processor 的侧重点

比较了两者的出发点：

| 结构 | 更依赖什么 | 核心直觉 |
| --- | --- | --- |
| Vector processor | 程序中的向量化机会 | 循环迭代无相关时，用少量向量指令表达大量并行操作 |
| Array processor | 硬件本身的 PE 与互联组织 | 构造大量 processing elements，让它们在统一控制下同时执行 |

因此：

- 向量处理机首先要求程序具有适合向量化的数据并行模式；
- 阵列处理机首先要解决大量 PE 如何连接、如何访问数据的问题。

---

## Memory Organization of Array Processors

按照系统中 memory 的组织方式，阵列处理机可以分为两类基本结构：

1. **Distributed memory（分布式存储器）**；
2. **Centralized shared memory（集中共享存储器）**。

### Distributed Memory

在 distributed memory 结构中：

- 系统包含 $N$ 个 processing elements；
- 通常每个 PE 对应一个自己的 local memory；
- 本地 PE 访问自己的 local memory 最直接、速度最快；
- 当 PE 需要访问其他节点保存的数据时，需要通过内部互联网络进行通信。

其抽象结构为：

```text
PE0  ↔ Local Memory 0
PE1  ↔ Local Memory 1
...
PEN-1 ↔ Local Memory N-1
       \ connected by ICN /
```

slides 说明：**distributed memory configuration 是 SIMD array processor 的主流组织形式**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526202957.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Centralized Shared Memory

在 centralized shared memory 结构中：

- 系统包含 $N$ 个 processing elements；
- 系统集中设置 $K$ 个 memory modules；
- 多个 PE 通过内部互联网络共同访问这些 memory modules；
- ICN 既要连接处理器，也要连接共享存储器模块。

其抽象结构为：

```text
PE0, PE1, ..., PEN-1
        ↓
       ICN
        ↓
MM0, MM1, ..., MMK-1
```

与 distributed memory 相比：

| 对比点 | Distributed Memory | Centralized Shared Memory |
| --- | --- | --- |
| 存储器位置 | 每个 PE 具有自己的 local memory | 多个 PE 共享 $K$ 个 memory modules |
| 常见快速访问 | 访问自身 local memory | 通过 ICN 访问共享 memory |
| ICN 任务 | 连接 PE，使 PE 可以访问远程节点数据 | 在 PE 与 memory modules 之间提供访问通路 |

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526203043.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260526203052.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

---

## Interconnection Network

### 为什么需要 ICN

无论是 distributed memory 还是 centralized shared memory，阵列处理机都需要解决一个核心问题：

> 多个 PE 之间，或 PE 与 memory 之间，怎样以可实现的硬件成本建立数据通信路径？

并行计算机的 **communication architecture（通信体系结构）** 是系统设计的核心，它既包括底层互联网络，也与高层语言、软件工具、编译器和操作系统提供的通信支持有关。因此，并行计算机设计不仅要讨论互联网络，还要讨论由互联带来的性能与软件问题。

**ICN（Interconnection Network，互联网络）** 位于并行计算机内部，用来连接：

- 不同 processing elements；
- processing elements 与 memory modules；
- 相关的控制与数据通路。

从结构上看，ICN 是按照一定的 **topology（拓扑）** 与 **control mode（控制方式）** 组织 switching units，从而完成计算机内部多个处理器或功能部件之间互联的网络。

ICN 与普通计算机网络具有相似的术语和工作原理，但这里关注的是并行机器内部节点之间的高效数据交换；部分并行系统也可能直接采用高速 Ethernet 或 ATM 等网络技术作为互联基础。

### 直接连接路径的代价

如果要求 $N$ 个 processing units 中任意两个都具有一条直接连接路径，那么所需无向连接对数为：

$$
C_N^2 = \frac{N(N-1)}{2}
$$

也就是说，连接数量随 $N$ 以 $O(N^2)$ 增长。

例如，当 PE 数量达到几万级别时，完整直接连接所需的通路数量会极其庞大，几乎无法实际实现。

因此，阵列处理机必须考虑：

- 能否通过间接通路完成节点间通信；
- 怎样设计互联网络拓扑，使连接数可控；
- 怎样在硬件成本、通信能力与性能之间折中。

### ICN 的组成与设计因素

Interconnection network 一般由五类部分构成：

1. **CPU / PE**：发起计算与通信请求的处理单元；
2. **memory**：被访问的数据存储单元，可以是 PE 的 local memory，也可以是 shared memory module；
3. **interface**：从 CPU 或 memory 获取信息，并把信息发送到其他 CPU 或 memory 的接口设备，典型形式是 network interface card；
4. **link**：传输 bit 的物理通道，可以是线缆、双绞线或光纤，也可以是串行或并行通路；
5. **switch node**：互联网络中的交换与控制节点，具有多个输入端口和多个输出端口，可以进行数据缓冲与路径选择。

设计 ICN 时需要同时考虑四类问题：

| 设计因素 | 典型分类 | 含义 |
| --- | --- | --- |
| topology | static topology / dynamic topology | 节点之间连接路径的组织方式 |
| timing mode | synchronous / asynchronous | 是否使用统一时钟 |
| exchange method | circuit switching / packet switching | 数据交换采用电路交换还是分组交换 |
| control strategy | centralized / distributed | 是否有全局控制器统一管理网络状态 |

其中 SIMD array processor 通常属于同步系统：多个 PE 在统一控制下执行同一条指令，因此更容易采用统一时钟。更一般的多处理器系统中，各处理器可能独立运行，此时就需要异步通信和更复杂的同步机制。

### ICN 的分类与目标

按照连接路径是否在程序运行过程中变化，互联网络可以分为两类。

1. **Static network**

静态网络的连接路径在系统构造后固定，程序执行过程中不会改变。它的重点是通过固定拓扑提供可预测的通信路径。

2. **Dynamic network**

动态网络由开关构成，可以根据应用需求改变开关状态，从而改变连接路径。典型结构包括：

- bus；
- crossbar switch；
- multi-stage switching network。

互联网络的目标可以概括为：

> 用有限数量的连接方式，使任意两个 PE 能够在一步或少数几步内完成信息传输，从而支持并行算法执行。

如果只使用一个层次的连接来完成任意两个处理单元之间的传输，称为 **single-stage interconnection network**；如果把多个单级网络串联起来，称为 **multi-stage interconnection network**。

### Interconnection Function

设互联网络有 $N$ 个输入端：

$$
0,1,\ldots,j,\ldots,N-1
$$

如果输入端 $j$ 与输出端 $f(j)$ 存在对应关系，那么 $f$ 就描述了该互联网络的连接规律，称为 **interconnection function（互联函数）**。

通常把输入编号和输出编号都写成二进制。根据二进制位之间的变化规律，就可以写出对应的互联函数。

---

## Single-Stage Interconnection Network

单级互联网络在一个网络层次上给出固定或有限的连接方式。它的结构简单、规则性强、成本低，适合构造大规模阵列的基本连接单元。

### Cube Single-Stage Interconnection Network

对于 $N$ 个输入和输出，令：

$$
n = \log_2 N
$$

每个输入端编号写成 $n$ bit 二进制：

$$
P_{n-1}\cdots P_i\cdots P_1P_0
$$

cube 网络有 $n$ 个互联函数。第 $i$ 个 cube 函数翻转编号中的第 $i$ 位，其余位保持不变：

$$
Cube_i(P_{n-1}\cdots P_i\cdots P_1P_0)
= P_{n-1}\cdots \overline{P_i}\cdots P_1P_0
$$

因此，cube 网络中的一条边表示两个节点的二进制编号只相差一位。

#### 例子：$N=8$ 的 cube 网络

当 $N=8$ 时，节点编号为 3 bit：

$$
X_2X_1X_0
$$

三个互联函数分别翻转不同 bit。

| 函数 | 翻转位 | 连接关系 |
| --- | --- | --- |
| $Cube_0$ | $X_0$ | $(0,1),(2,3),(4,5),(6,7)$ |
| $Cube_1$ | $X_1$ | $(0,2),(1,3),(4,6),(5,7)$ |
| $Cube_2$ | $X_2$ | $(0,4),(1,5),(2,6),(3,7)$ |

如果把 8 个节点看成一个三维立方体，那么 $Cube_0, Cube_1, Cube_2$ 分别对应立方体在三个维度上的边。

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601192851.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601192858.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>
<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601192914.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601192922.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

三维 cube 中，任意两个节点最多只需要经过 3 条边即可互相到达。推广到 $n$ 维 hypercube：

- 节点数：$N=2^n$；
- 每个节点度数：$n$；
- 网络直径：$n$；
- 最多经过 $n$ 次传输即可完成任意两个 PE 之间的数据传递。

当 $n>3$ 时，图形已经很难在三维空间直观画出，但二进制翻转 bit 的规律仍然成立。

### PM2I Single-Stage Interconnection Network

PM2I 的含义是 **Plus Minus $2^i$**。它包括加 $2^i$ 与减 $2^i$ 两类连接。

对于 $N$ 个节点：

$$
PM2_{+i}(j)=(j+2^i)\bmod N
$$

$$
PM2_{-i}(j)=(j-2^i)\bmod N
$$

其中：

$$
0\le j\le N-1,\quad 0\le i\le \log_2N-1
$$

它的直观含义是：每个节点可以与编号相差 $2^i$ 的节点相连，并且采用模 $N$ 形成环状连接。

#### 例子：$N=8$ 的 PM2I 网络

当 $N=8$ 时：

| $i$ | 步长 | 连接含义 |
| --- | --- | --- |
| $i=0$ | $2^0=1$ | 连接相邻节点：$j\leftrightarrow j\pm1$ |
| $i=1$ | $2^1=2$ | 连接距离为 2 的节点：$j\leftrightarrow j\pm2$ |
| $i=2$ | $2^2=4$ | 连接距离为 4 的节点：$j\leftrightarrow j\pm4$ |

以节点 0 为例：

- 一步可以到达：$1,2,4,6,7$；
- 两步可以到达：$3,5$。

因此 PM2I 通过少量规则连接，就能让节点在少数步数内到达其他节点。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601193341.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

ILLIAC IV 的阵列互联使用了 $PM2_{\pm0}$ 和 $PM2_{\pm n/2}$，从而在二维阵列中实现 PE 之间的上下左右相邻连接。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601193451.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Shuffle Exchange Network

Shuffle exchange network 由两部分构成：

1. **shuffle**：混洗函数；
2. **exchange**：交换函数。

对于 $N$ 个节点，设：

$$
n=\log_2N
$$

输入编号为：

$$
P_{n-1}P_{n-2}\cdots P_1P_0
$$

shuffle 函数把最高位移动到最低位，其余位整体左移：

$$
shuffle(P_{n-1}P_{n-2}\cdots P_1P_0)
= P_{n-2}\cdots P_1P_0P_{n-1}
$$

exchange 函数通常对应最低位翻转，也就是相邻奇偶节点之间的交换。

#### 例子：$N=8$ 的 shuffle

当 $N=8$ 时：

$$
shuffle(P_2P_1P_0)=P_1P_0P_2
$$

一次 shuffle 的映射关系为：

| 节点 | 二进制 | shuffle 后 | 连接到 |
| --- | --- | --- | --- |
| 0 | 000 | 000 | 0 |
| 1 | 001 | 010 | 2 |
| 2 | 010 | 100 | 4 |
| 3 | 011 | 110 | 6 |
| 4 | 100 | 001 | 1 |
| 5 | 101 | 011 | 3 |
| 6 | 110 | 101 | 5 |
| 7 | 111 | 111 | 7 |

二次 shuffle 的映射关系为：
| 节点 | 二进制 | shuffle 后 | 连接到 |
| --- | --- | --- | --- |
| 0 | 000 | 000 | 0 |
| 1 | 001 | 100 | 4 |
| 2 | 010 | 001 | 1 |
| 3 | 011 | 101 | 5 |
| 4 | 100 | 010 | 2 |
| 5 | 101 | 110 | 6 |
| 6 | 110 | 011 | 3 |
| 7 | 111 | 111 | 7 |

三次 shuffle 的映射关系为：

| 节点 | 二进制 | shuffle 后 | 连接到 |
| --- | --- | --- | --- |
| 0 | 000 | 000 | 0 |
| 1 | 001 | 001 | 1 |
| 2 | 010 | 010 | 2 |
| 3 | 011 | 011 | 3 |
| 4 | 100 | 100 | 4 |
| 5 | 101 | 101 | 5 |
| 6 | 110 | 110 | 6 |
| 7 | 111 | 111 | 7 |

连续 shuffle $n$ 次后，所有节点恢复到初始排列。对于 $N=8$，连续 shuffle 3 次后恢复。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601194422.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

shuffle exchange 的最大距离为：

$$
2n-1
$$

也就是最多需要 $n$ 次 exchange 和 $n-1$ 次 shuffle。例如从全 0 编号节点到全 1 编号节点，需要经过 3 次 exchange 和 2 次 shuffle。

### 单级互联网络的特点

单级互联网络的优点主要有：

- 结构简单，硬件成本低；
- 连接规则灵活，可以配合算法需求；
- 传输步数较少，有利于提高阵列操作速度；
- 规则性和模块化较好，便于扩展；
- 适合大规模集成。

它的限制也很明显：单级网络只提供有限种连接关系，若要支持更多连接模式，通常需要多次使用单级网络，或者把多个单级网络组合成多级网络。

---

## Static Network Topologies

除了 cube、PM2I、shuffle exchange 这些互联函数，slides 还总结了常见的静态拓扑。它们可以从以下几个指标比较：

- **scale**：节点规模；
- **degree**：节点度数，即一个节点直接连接多少条边；
- **diameter**：网络直径，即任意两点之间最短路径长度的最大值；
- **width / bisection width**：把网络大致分成两半时需要切断的连接数量；
- **symmetry**：不同节点在拓扑中的地位是否等价；
- **link**：总连接数。

### Linear Array

线性阵列有 $N$ 个节点和 $N-1$ 条边：

- 直径：$N-1$；
- 节点度数：内部节点为 2，端点为 1；
- 对分宽度：1；
- 对称性差。

当 $N$ 很大时，端到端距离过长，通信效率较低。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601194732.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Circular Array

环形阵列把线性阵列首尾相连。

- 双向环：
  - 连接数：$N$；
  - 直径：$N/2$；
  - 节点度数：2；
  - 对称性好。
- 单向环：
  - 连接数：$N$；
  - 直径：$N-1$；
  - 只能沿一个方向传输。

环比线性阵列更均匀，但每个节点仍然只有两个邻居，扩展到大规模时路径仍然较长。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601194852.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Loop with Chord Array

在环上增加 chord（弦）可以缩短通信路径，提高网络可靠性。对于 slides 中 12 个节点的双向环加弦：

- 节点度数为 3 时，连接数为 18；
- 节点度数为 4 时，连接数为 24。

增加 chord 的本质是用更多连接换取更小直径和更强容错能力。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601194922.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Tree Array

对于 $K$ 层完全二叉树：

$$
N=2^K-1
$$

其特点是：

- 最大节点度数：3；
- 直径：$2(K-1)$，对应最左叶子到最右叶子的路径；
- 对分宽度：1；
- 对称性差。

树结构容易形成根部或高层节点瓶颈，因此可以扩展为 **fat tree** 或 **tree with loop**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195018.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195102.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Star Array

星形阵列可以看成两层树。

- 连接数：$N-1$；
- 直径：2；
- 中心节点度数：$N-1$；
- 对分宽度：1；
- 对称性差。

星形结构路径很短，但中心节点压力极大，单点瓶颈明显。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195040.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />


### Grid 与 2D Torus

二维网格常用于规则并行计算。

对于 $r\times r$ 网格，$N=r^2$：

- 连接数：$2N-2r$；
- 直径：$2(r-1)$；
- 节点度数最多为 4；
- 对分宽度：$r=\sqrt{N}$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195121.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

2D torus 在二维网格的基础上把每一行和每一列首尾相连：

- 连接数：$2N$；
- 直径约为 $2\lfloor r/2\rfloor$；
- 节点度数为 4；
- 对称性更好。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195128.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Hypercube 与 Cube with Loop

$n$ 维 hypercube 有：

$$
N=2^n
$$

- 节点度数：$n$；
- 直径：$n$；
- 对分宽度：$N/2$；
- 连接数：$nN/2$；
- 对称性好。


<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195145.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

Cube with loop 则在 cube 结构上加入环形结构，使每个节点组内部也具有环状连接。slides 中给出的形式是：

- 总节点数：$n2^n$；
- 节点度数：3；
- 对称性好。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195207.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />


|  | Scale | Degree | Diameter | Width | Symmetry | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Linear | $N$ | $2$ | $N-1$ | $1$ | No | $N-1$ |
| Circular | $N$ | $2$ | $\lfloor N/2 \rfloor$ | $1$ | Yes | $N$ |
| Binary tree | $N$ | $3$ | $2(\lfloor \log N \rfloor - 1)$ | $1$ | No | $N-1$ |
| Star | $N$ | $N-1$ | $2$ | $N/2$ | No | $N-1$ |
| Grid | $N$ | $4$ | $2(\sqrt{N}-1)$ | $\sqrt{N}$ | No | $2(N-\sqrt{N})$ |
| 2D torus | $N$ | $4$ | $2\lfloor \sqrt{N}/2 \rfloor$ | $2\sqrt{N}$ | Yes | $2N$ |
| Hypercube | $N=2^n$ | $n$ | $n$ | $N/2$ | Yes | $nN/2$ |
| Cube with loop | $N=k2^k$ | $3$ | $2k-1+\lfloor k/2 \rfloor$ | $N/2^k$ | Yes | $3N/2$ |

---

## Dynamic Interconnection Network

动态互联网络的连接关系可以在程序运行期间改变。它依靠主动的 switching elements，通过设置开关状态重构链路。

动态网络主要包括三类：

1. bus；
2. crossbar switches；
3. multi-stage interconnection networks。

### Bus

Bus 是一组连接 processor、memory、I/O 等部件的导线和插槽。

其特征是：

- 同一时刻只能支持一对 source 和 destination 传输数据；
- 多对节点同时请求使用 bus 时，需要 bus arbitration；
- CPU 数量较多时，bus contention 会非常严重；
- slides 给出的经验规模是通常不超过约 32 个 CPU。

Bus 与 linear array 的区别在于：

| 结构 | 特征 |
| --- | --- |
| linear array | 不同源/目的节点可以同时使用系统的不同部分 |
| bus | 多个节点共享同一传输介质，通过时间分割使用，同一时刻只有一对节点传输 |

因此 bus 结构简单、成本低，但扩展性差。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195841.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Crosspoint Switches

Crosspoint switch 在输入和输出之间布置交叉开关点。

对于 $N$ 个输入和 $N$ 个输出，完整 crossbar 需要 $N^2$ 个交叉点。每个交叉点可以打开或关闭，从而控制某个输入是否连接到某个输出。

优点：

- 连接能力强；
- 可以支持较高并行通信带宽；
- 任意输入输出之间的连接较直接。

缺点：

- 硬件复杂度随 $N^2$ 增长；
- 大规模系统中开关数量和布线成本都很高。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195851.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Multi-Stage Interconnection Network

Multi-stage interconnection network 通过多个 switch stage 串联来降低全交叉开关的硬件成本。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200102.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

基本 switch unit 具有 $m$ 个输入和 $m$ 个输出，记为 $m\times m$ switch unit，其中：

$$
m=2^k
$$

常见规模包括 $2\times2$、$4\times4$、$8\times8$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601195926.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

对于 $2\times2$ switch unit，基本状态有四种：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200212.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

| 状态 | 含义 |
| --- | --- |
| straight | 上输入到上输出，下输入到下输出 |
| exchange | 上输入到下输出，下输入到上输出 |
| upper broadcast | 上输入广播到两个输出 |
| lower broadcast | 下输入广播到两个输出 |

因此：

- **two-function switch**：只支持 straight 和 exchange；
<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200222.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **four-function switch**：支持 straight、exchange、upper broadcast、lower broadcast；

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200232.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **multi-end switch**：进一步加入 broadcast 和 multicast 模块。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200244.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

不同多级网络的差异主要来自三点：

1. switch function；
2. switch control method；
3. topology。

在拓扑层面，常见多级网络包括：

- multi-stage cube；
- multi-stage shuffle exchange；
- multi-stage PM2I；
- 上述网络的组合。

### Multi-Stage Cube Interconnection Network

multi-stage cube 网络的特征是：

- switch unit：two-function switch；
- control mode：stage control、part stage control、unit control；
- topology：cube structure。

构造 $N$ 个单元的 multi-stage cube 网络：

1. 计算 $n=\log_2N$；
2. 从输入到输出设置 stage 编号为 $0,1,\ldots,n-1$；
3. 每一级放置 $N/2$ 个 two-function switch；
4. 第 $i$ 级的 switch 端口按照 $Cube_i$ 关系编号；
5. 相同编号的端点在相邻 stage 之间连接。

对于 $N=8$，共有 3 级：

```text
input -> Cube0 -> Cube1 -> Cube2 -> output
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200337.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

如果采用 **stage control**，同一级内所有 switch 共享同一个控制信号。设 stage 控制信号为：

$$
K_2K_1K_0
$$

其中 $K_i$ 表示第 $i$ 级：

- $K_i=0$：straight；
- $K_i=1$：exchange。

对于 $N=8$，不同控制信号对应的输出重排如下：

| 控制信号 | 输出序列 | 等价函数 |
| --- | --- | --- |
| 000 | 0 1 2 3 4 5 6 7 | identity |
| 001 | 1 0 3 2 5 4 7 6 | $Cube_0$ |
| 010 | 2 3 0 1 6 7 4 5 | $Cube_1$ |
| 011 | 3 2 1 0 7 6 5 4 | $Cube_0+Cube_1$ |
| 100 | 4 5 6 7 0 1 2 3 | $Cube_2$ |
| 101 | 5 4 7 6 1 0 3 2 | $Cube_0+Cube_2$ |
| 110 | 6 7 4 5 2 3 0 1 | $Cube_1+Cube_2$ |
| 111 | 7 6 5 4 3 2 1 0 | $Cube_0+Cube_1+Cube_2$ |

这说明多级 cube 网络可以通过每一级的 straight/exchange 控制，实现多种规则重排。

multi-stage cube 还可以分为：

- switched network；
- mobile number network；
- indirect binary n-cube network。

其中采用 stage control 的 multi-stage cube 网络称为 **switching network / flip network**，主要实现成组元素的对称交换。

### Multi-Stage Shuffle Exchange Network / Omega Network

multi-stage shuffle exchange network 又称为 **Omega network**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601201123.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

其特征是：

- stage 数：$n=\log_2N$；
- stage 编号从输入到输出为 $n-1,n-2,\ldots,1,0$；
- 每一级有 $N/2$ 个 switch unit；
- 拓扑为 shuffle topology 后接 four-function switch；
- 控制方式通常是 unit control。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601200804.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

如果把 Omega network 的 switch unit 限制为只使用 straight 和 exchange，则它变成 $n$-cube network 的逆网络。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601201147.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Omega Network 与 n-cube Network 的比较

两者的主要差异如下：

| 对比项 | Omega Network | n-cube Network |
| --- | --- | --- |
| 数据流 stage 顺序 | $n-1,n-2,\ldots,1,0$ | $0,1,\ldots,n-1$ |
| switch unit | four-function switch | two-function switch |
| broadcast | 可以实现一定的一对多广播 | 不支持广播 |

slides 中给出的 $N=8$ 例子强调了多级网络的一个重要特点：

- $5\rightarrow0$ 与 $7\rightarrow1$ 可以同时实现；
- $0\rightarrow5$ 与 $1\rightarrow7$ 无法同时实现。

原因是多级网络内部路径可能发生冲突。即使每条单独连接都可实现，多个连接同时存在时也可能竞争同一个内部 switch 或 link，这就是动态多级网络中的 blocking 问题。


<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601201250.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601201421.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

### 动态互联网络比较

slides 从带宽、链路复杂度、开关复杂度和寻路能力比较了三种动态互联网络。

| 网络 | 带宽 | Link 复杂度 | Switch 复杂度 | 连接能力 |
| --- | --- | --- | --- | --- |
| Bus system | $O(w/n)$ 到 $O(w)$ | $O(w)$ | $O(n)$ | 同一时刻一对一传输 |
| Multi-stage network | $O(w)$ 到 $O(nw)$ | $O(nw\log_k n)$ | $O(n\log_k n)$ | 支持一定程度的 broadcast 和 exchange |
| Crosspoint switches | $O(w)$ 到 $O(nw)$ | $O(n^2w)$ | $O(n^2)$ | 全交换能力最强 |

其中：

- $n$ 是 processor 数量；
- $w$ 是数据通路宽度；
- multi-stage network 假设采用 $k\times k$ switch 构造 $n\times n$ MIN；
- crosspoint switches 需要 $n\times n$ 个交叉开关。

整体来看：

- bus 成本最低，但争用最严重；
- crossbar 能力最强，但成本随 $n^2$ 增长；
- multi-stage network 处于两者之间，是常见折中方案。

---

## SIMD 

SIMD 结构适合利用 data-level parallelism，典型应用包括：

- matrix-oriented scientific computing；
- media-oriented image and sound processors；
- GPU 中的大规模数据并行任务。

SIMD 相比 MIMD 更节能的原因之一是：一次 instruction fetch 可以驱动多个数据操作，控制开销被多个数据元素摊薄。

因此 SIMD 对 personal mobile devices、图像音频处理和深度学习等数据并行应用很有吸引力。

从程序员视角看，SIMD 仍然允许程序在较高层次上以顺序逻辑思考；编译器或编程模型负责把可并行的数据操作映射到向量、阵列或 GPU 线程结构上。

---

## DLP in GPU

### GPU 的基本思想

GPU 最初面向图形处理，但现代 GPU 已经成为通用数据并行计算的重要平台。它的基本思想是采用异构执行模型：

```text
CPU: host
GPU: device
```

CPU 负责组织程序执行、发起 kernel 调用和管理数据传输；GPU 负责执行大量高度并行的计算任务。

GPU 的硬件特征是：

- 核心数量多；
- 单个核心较小；
- 适合大规模并行；
- 典型应用包括 graphics 和 deep learning。

从体系结构脉络看，GPU 可以理解为从 SIMD 进一步扩展到 **SIMT（Single Instruction Multiple Thread）**。在 vector processor 中，最小并行单元可以看成向量元素；在 GPU 编程模型中，最小执行抽象是 thread。thread 除了数据元素，还包含寄存器、上下文等执行状态。

### CUDA 与 SIMT

CUDA 的全称是 **Compute Unified Device Architecture**。

NVIDIA 使用 **CUDA thread** 统一表达 GPU 中的多种并行形式。执行一个 thread block 的硬件可以看成 **multithreaded SIMD processor**。

SIMT 的关键直觉是：

- 程序员写的是很多 thread；
- 硬件以 SIMD / multithreaded SIMD 的方式组织这些 thread；
- 同一组 thread 通常执行相同指令，但作用于不同数据；
- 线程管理主要由 GPU 硬件负责，而不是应用程序或操作系统显式调度每个 thread。

### 例子：DAXPY 的 CUDA 写法

DAXPY 的数学形式是：

$$
y[i] = a\times x[i] + y[i]
$$

标量 C 程序写法为：

```c
// Invoke DAXPY
daxpy(n, 2.0, x, y);

// DAXPY in C
void daxpy(int n, double a, double *x, double *y)
{
    for (int i = 0; i < n; ++i)
        y[i] = a * x[i] + y[i];
}
```

CUDA 写法把每个元素的计算交给一个 thread：

```c
// Invoke DAXPY with 256 threads per Thread Block
__host__
int nblocks = (n + 255) / 256;
daxpy<<<nblocks, 256>>>(n, 2.0, x, y);

// DAXPY in CUDA
__global__
void daxpy(int n, double a, double *x, double *y)
{
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n)
        y[i] = a * x[i] + y[i];
}
```

这里：

- `<<<nblocks, 256>>>` 表示启动 `nblocks` 个 thread block，每个 block 有 256 个 thread；
- `blockIdx.x` 表示当前 block 的编号；
- `blockDim.x` 表示每个 block 的 thread 数；
- `threadIdx.x` 表示当前 thread 在 block 内的编号；
- `i = blockIdx.x * blockDim.x + threadIdx.x` 把二维层次中的 thread 映射为全局数组下标；
- `if (i < n)` 用来处理 $n$ 不能被 256 整除时最后一个 block 中多出来的 thread。


### Grid, Thread Blocks and Threads

CUDA 的执行组织是三层结构：

```text
Grid
 ├── Thread Block 0
 │    ├── Thread 0
 │    ├── Thread 1
 │    └── ...
 ├── Thread Block 1
 │    └── ...
 └── ...
```

核心关系是：

- 一个 thread 通常对应一个数据元素；
- 多个 thread 组成一个 thread block；
- 多个 block 组成一个 grid；
- GPU 硬件负责 thread 管理。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202239.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

以 vector addition 为例：

```c
__global__ void vecadd_kernel(float* A, float* B, float* C, int N) {
    int i = blockDim.x * blockIdx.x + threadIdx.x;
    C[i] = A[i] + B[i];
}

vecadd_kernel<<<numBlocks, numThreadsPerBlock>>>(A_d, B_d, C_d, N);
```

每个 thread 负责一个下标 $i$ 的加法：

$$
C[i] = A[i] + B[i]
$$

多个相邻元素被分配到同一个 thread block，不同 block 一起构成一个 grid。

<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202436.png" style="width: 420px; max-width: 32%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202445.png" style="width: 420px; max-width: 32%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202454.png" style="width: 420px; max-width: 32%; height: auto;" />
</div>

### GPU Memory Structures

GPU 的 memory 结构与 CUDA 层次直接相关。


<div style="display: flex; gap: 16px; justify-content: center; align-items: flex-start; flex-wrap: wrap; margin: 12px 0;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202316.png" style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202404.png" style="width: 420px; max-width: 48%; height: auto;" />
</div>

| 存储层次 | 作用范围 | 直观含义 |
| --- | --- | --- |
| global memory / GPU memory | 所有 grid / block 可见 | 大容量、延迟高，位于 GPU DRAM 中 |
| shared memory | 一个 thread block 内共享 | 位于 SM 内，程序员可控制，适合 block 内协作 |
| private / local memory | 单个 CUDA thread 私有 | 保存单个 thread 的私有数据和溢出数据 |
| register file | 单个 thread 的寄存器上下文 | 支持快速 thread 切换和大量并发 thread |

硬件执行模型与 CUDA 编程模型可以对应为：

| 硬件执行模型 | CUDA 编程模型 |
| --- | --- |
| GPU | Grid |
| Streaming Multiprocessor（SM） | Thread Block |
| CUDA core / lane | Thread |

这个对应关系是理解 GPU 的核心：程序员写 thread 和 block，硬件把 block 分配到 SM 上执行，并在 SM 内调度大量 thread。

### Memory Hierarchy in GPU

GPU 同样需要 memory hierarchy。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202640.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

原因是：

- GPU thread 数量巨大；
- global memory 延迟较高；
- 如果没有 cache / shared memory，访存会成为严重瓶颈；
- GPU 通过多线程隐藏内存延迟，同时仍需要利用空间局部性和时间局部性。

常见结构是 two-level cache：

- **L1 cache**：位于 SM 内，靠近执行单元；
- **L2 cache**：多个 SM 共享，位于 GPU 更全局的位置；
- **shared memory**：通常与 L1 位置相近，受程序员显式控制。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202702.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

例如：A100 强调

- 增加 instruction cache；
- shared memory 由程序员控制；
- L1 cache / shared memory 位于 SM 内；
- L2 cache 连接多个 SM 与 GPU DRAM。


### GPU Organization 的演化

NVIDIA GPU 代际展示了 GPU 组织结构的变化。

| 代际 / 示例 | 结构特点 |
| --- | --- |
| Tesla | 使用 Core、SM、GPU 的层次组织 |
| Fermi | 集成 L1 和 shared memory；SM 内 core 数增加 |
| Kepler | 巨型 SM，一个 SM 可含 192 cores；问题是更大的 SM 是否一定更好 |
| Maxwell | 把 SM 拆成 4 个 block，调度和功耗控制更灵活；L1 和 shared memory 分离 |
| Pascal | 增大 L2 cache，slides 中给出 4MB，约为上一代的 7 倍 |
| Volta | 再次集成 L1 和 shared memory；instruction buffer 变为 L0 instruction cache |
| Ampere | L2 进一步增大到 40MB；增加 global memory 到 shared memory 的额外数据通路 |
| Hopper | 继续沿着更大规模、更复杂 memory hierarchy 和更强数据通路方向演进 |

这组例子说明：GPU 的性能并不只由 core 数决定，还受到 SM 组织、cache/shared memory 结构、调度粒度、数据通路和功耗控制共同影响。


### NVIDIA GPU 与 Vector Machine 的比较

NVIDIA GPU 与传统 vector machine 有许多相似点：

- 都适合 data-level parallel problems；
- 都支持 scatter-gather transfers；
- 都使用 mask / predicate 机制处理条件执行；
- 都具有较大的 register file。

主要差异是：

| 对比项 | Vector Machine | NVIDIA GPU |
| --- | --- | --- |
| 执行抽象 | 向量指令作用于多个元素 | CUDA thread / warp / block |
| 标量处理器 | 通常有 scalar processor 配合 vector unit | GPU 中没有传统向量机意义上的 scalar processor |
| 隐藏延迟方式 | 深流水 vector functional units | 大量 multithreading 隐藏 memory latency |
| 功能部件组织 | 少数深流水功能部件 | 很多较小的 functional units |

从课程主线看，两者都服务于 DLP，只是 GPU 把数据级并行包装成更接近线程的编程模型。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260601202803.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

---

## Loop-Level Parallelism

### 基本概念

程序中的循环是并行性的主要来源。很多 DLP、TLP 以及更激进的静态 ILP 方法，都需要从循环中发现可并行的迭代。

Loop-level parallelism 的核心问题是：

> 后面迭代中的数据访问，是否依赖前面迭代产生的数据值？

如果存在这种依赖，就称为 **loop-carried dependence（循环携带相关）**。

需要区分两类相关：

| 类型 | 含义 | 对并行化的影响 |
| --- | --- | --- |
| iteration-internal dependence | 同一次迭代内部语句之间存在相关 | 仍可能跨迭代并行，只要每次迭代内部保持顺序 |
| loop-carried dependence | 第 $i+1$ 次迭代依赖第 $i$ 次迭代的结果 | 可能迫使迭代顺序执行，限制向量化和并行化 |

循环计数变量 `i` 本身也跨迭代变化，但它属于 induction variable，编译器通常可以识别和消除，不构成主要限制。

### Example 1：无 loop-carried dependence

```c
for (i = 999; i >= 0; i = i - 1)
    x[i] = x[i] + s;
```

每次迭代只读写自己的 `x[i]`，不同迭代访问的数组元素不同。因此：

- `x[i]` 的读写相关只发生在同一次迭代内部；
- 不存在对其他迭代结果的依赖；
- 循环可以并行化或向量化。

这类循环是最典型的数据级并行来源。

### Example 2：存在循环携带相关，难以并行

```c
for (i = 0; i < 100; i = i + 1) {
    A[i+1] = A[i] + C[i];      /* S1 */
    B[i+1] = B[i] + A[i+1];   /* S2 */
}
```

把两条语句分别记为：

```text
S1: A[i+1] = A[i] + C[i]
S2: B[i+1] = B[i] + A[i+1]
```

依赖关系有三类：

1. **S1 对 S1 的 loop-carried dependence**

第 $i$ 次迭代计算 `A[i+1]`，第 $i+1$ 次迭代需要读取 `A[i+1]`。

```text
S1(i) -> S1(i+1)
```

2. **S2 对 S2 的 loop-carried dependence**

第 $i$ 次迭代计算 `B[i+1]`，第 $i+1$ 次迭代需要读取 `B[i+1]`。

```text
S2(i) -> S2(i+1)
```

3. **S1 到 S2 的同迭代相关**

同一次迭代中，`S2` 使用 `S1` 刚产生的 `A[i+1]`。

```text
S1(i) -> S2(i)
```

其中第 1、2 类跨越迭代边界，会强制相邻迭代按顺序推进。为了保持正确性，就很难把这个循环直接向量化或完全并行化。

这也是老师强调的点：如果循环体之间存在跨迭代相关，就不能简单地把每一次迭代拆开并行执行；硬件再强，也必须服从程序语义。

### Example 3：有 loop-carried dependence，但可以改写为并行

原始循环为：

```c
for (i = 0; i < 100; i = i + 1) {
    A[i] = A[i] + B[i];        /* S1 */
    B[i+1] = C[i] + D[i];      /* S2 */
}
```

依赖关系是：

```text
S2(i) -> S1(i+1)
```

原因是第 $i$ 次迭代的 `S2` 产生 `B[i+1]`，第 $i+1$ 次迭代的 `S1` 需要使用 `B[i+1]`。

这个相关是 loop-carried dependence，但它没有形成环：

- `S1` 依赖前一次迭代的 `S2`；
- `S2` 本身不依赖 `S1`；
- 两个语句之间没有形成互相依赖的闭环。

因此可以通过重排暴露并行性。

改写过程的关键是：

1. 先单独执行第一条 `S1(0)`，因为它需要循环开始前已经存在的 `B[0]`；
2. 在循环体中先执行 `S2(i)`，产生 `B[i+1]`；
3. 再执行 `S1(i+1)`，使用刚产生的 `B[i+1]`；
4. 最后补上原循环最后一次 `S2(99)` 产生的 `B[100]`。

改写后的代码为：

```c
A[0] = A[0] + B[0];

for (i = 0; i < 99; i = i + 1) {
    B[i+1] = C[i] + D[i];
    A[i+1] = A[i+1] + B[i+1];
}

B[100] = C[99] + D[99];
```

改写后，循环体内部仍然有 `B[i+1] -> A[i+1]` 的同迭代相关，但跨迭代相关被消除。因此多个迭代可以并行处理，或者用向量指令配合 chaining 执行。

这一例子说明：

- 出现 loop-carried dependence 后，不能立刻判断一定无法并行；
- 需要看 dependence graph 中是否存在环；
- 没有环的依赖可以通过语句重排、循环剥离、循环重写等方式暴露并行性；
- 有些循环携带相关无法消除，此时必须保留顺序执行。
