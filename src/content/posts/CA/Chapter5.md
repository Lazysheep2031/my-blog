---
title: DLP and TLP
published: 2026-05-25
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

**ICN（Interconnection Network，互联网络）**位于并行计算机内部，用来连接：

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

