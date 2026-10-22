---
title: Deadlocks
published: 2026-10-22
description: 死锁的必要条件与资源分配图、死锁预防与避免、安全状态与银行家算法、死锁检测及恢复
tags: [操作系统]
category: 笔记
draft: false
---

## The Deadlock Problem

**死锁（Deadlock）**：一组进程中的每个进程都在等待一个事件，而该事件只能由这组进程中的其他进程触发。

**暂时等待资源不等于死锁。** 判断时要看等待能否通过正常执行与释放资源解除；死锁也可以只涉及系统中的一部分进程。

### Two Disk Drives

系统只有两个磁盘驱动器，两个进程各持有一个，并且都需要再获得一个才能继续。若它们保持已有资源、等待对方释放，双方都会停住。

### Two Semaphores

两个信号量初值均为 `1`。

```text
P0                         P1
wait(A);                   wait(B);
wait(B);                   wait(A);
使用 A、B                  使用 A、B
signal(B);                 signal(A);
signal(A);                 signal(B);
```

<details>
<summary>展开分析：哪一种交错顺序会导致死锁？</summary>

```text
1. P0 执行 wait(A)，获得 A。
2. P1 执行 wait(B)，获得 B。
3. P0 执行 wait(B)，因 B 被占用而阻塞，仍持有 A。
4. P1 执行 wait(A)，因 A 被占用而阻塞，仍持有 B。
```

此时 $P_0$ 等待 $P_1$ 释放 B，$P_1$ 等待 $P_0$ 释放 A。两者都到不了后面的释放操作。

这段程序 **存在导致死锁的执行交错**。若一个进程先拿到两个资源并完成释放，另一个进程随后执行，本轮就可以完成；*一次运行成功无法证明程序不存在死锁风险。*

</details>

<details>
<summary>死锁、饥饿与反复重试</summary>

**死锁**：一组进程因相互依赖而无法推进。**饥饿**：某个进程长期得不到资源或执行机会，其他进程仍可能继续。

持续采取动作、却无法取得有效进展的情形为 **活锁（Livelock）**。

消除死锁，不自动保证没有饥饿或活锁。

</details>

## System Model

系统有 $m$ 种资源类型：

$$
R_1,R_2,\ldots,R_m,
$$

资源类型 $R_j$ 有 $W_j$ 个实例。

进程使用资源的基本顺序为：

```text
Request：申请资源 → Use：使用资源 → Release：释放资源
```

申请暂时无法满足时，进程可能等待。

## Deadlock Characterization

### Necessary Conditions

死锁发生需要同时满足以下四个必要条件。

**互斥（Mutual Exclusion）**：至少有一种资源需要独占使用，一个实例在同一时刻只能由一个进程使用。其他进程只能等待。

**请求并保持（Hold and Wait）**：进程已经持有至少一个资源，又等待其他进程持有的额外资源。这里也包括继续请求同类型的更多实例。

**不可抢占（No Preemption）**：已分配资源只能由持有者按协议主动释放，无法被强制安全收回。CPU 可以被抢占，不代表持有的锁或正在进行的外部操作也能被安全抢占。

**循环等待（Circular Wait）**：存在等待链

$$
P_0\rightarrow P_1\rightarrow\cdots\rightarrow P_{k-1}\rightarrow P_0,
$$

其中每个进程都在等待下一个进程持有的资源。

**保证其中至少一个条件始终不成立，就能预防死锁。**

### Resource-Allocation Graph

**资源分配图（Resource-Allocation Graph）** 是有向图 $G=(V,E)$，顶点分为进程与资源类型两类：

$$
V=P\cup R.
$$

圆形表示进程；矩形表示资源类型；矩形中的小点或小方块表示具体实例。

- **请求边** $P_i\rightarrow R_j$：$P_i$ 已请求该类型的资源实例，正在等待分配。
- **分配边** $R_j\rightarrow P_i$：该类型的某个实例已经分配给 $P_i$，图中通常从实例点引出箭头。

**进程指向资源表示“想要”；资源指向进程表示“已经给出”。** 多实例类型的一条分配边只代表一个实例。

### Example

1. **A Graph Without Deadlock**

**判断当前是否死锁。**

资源数：$R_1$ 有 1 个，$R_2$ 有 2 个，$R_3$ 有 1 个，$R_4$ 有 3 个。

```text
P1：持有一个 R2，等待 R1。
P2：持有 R1 和一个 R2，等待 R3。
P3：持有 R3，没有画出新的请求。
R4：三个实例均未分配。
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261022234228.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**结论：当前无死锁。**

<details>
<summary>展开分析：为什么两个进程已经阻塞，仍然没有死锁？</summary>

依赖链为 $P_1\rightarrow P_2\rightarrow P_3$，没有闭合。按图中当前请求，$P_3$ 可以继续；它释放 $R_3$ 后，$P_2$ 可继续并释放 $R_1$，随后 $P_1$ 也可继续。

可用以下消解顺序理解：

$$
P_3\rightarrow P_2\rightarrow P_1.
$$

</details>

2. **A Graph With Deadlock**

**增加 $P_3\rightarrow R_2$。**

$P_3$ 需要一个 $R_2$ 实例，但这两个实例分别由 $P_1$、$P_2$ 持有。此时可找到两个环：



$$
P_2\rightarrow R_3\rightarrow P_3\rightarrow R_2\rightarrow P_2,
$$

$$
P_1\rightarrow R_1\rightarrow P_2\rightarrow R_3
\rightarrow P_3\rightarrow R_2\rightarrow P_1.
$$

**结论：$P_1,P_2,P_3$ 均陷入死锁。**

<details>
<summary>展开分析：R₂ 有两个实例，为什么仍然无法解除等待？</summary>

$P_1$ 等 $R_1$，$P_2$ 等 $R_3$，$P_3$ 等 $R_2$。两个 $R_2$ 实例都在已经无法推进的进程手中，没有一个能通过正常继续执行而先释放。

</details>

3. **A Cycle Without Deadlock**

**两种资源各有两个实例。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261022234414.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

```text
R1：分别分配给 P2、P3；P1 正在请求 R1。
R2：分别分配给 P1、P4；P3 正在请求 R2。
P2、P4：没有画出待满足的资源请求。
```

存在环：

$$
P_1\rightarrow R_1\rightarrow P_3\rightarrow R_2\rightarrow P_1.
$$

**结论：有环，但当前无死锁。**

<details>
<summary>展开分析：环外的资源释放怎样帮助环内进程？</summary>

若 $P_4$ 完成并释放一个 $R_2$，$P_3$ 就能获得它；$P_3$ 随后释放 $R_1$，$P_1$ 也可以继续。

</details>

### Basic Facts

普通资源分配图的判定规则为：

$$
\text{无环}\Rightarrow\text{无死锁}.
$$

**每种资源类型都只有一个实例时**：

$$
\text{有环}\Longleftrightarrow\text{死锁}.
$$

**存在多实例资源类型时**：有环只说明可能死锁，还要分析是否存在能够释放资源的进程。

## Methods for Handling Deadlocks

处理思路按介入时机可以分为：

| 策略 | 介入方式 | 主要代价 |
| --- | --- | --- |
| **预防（Prevention）** | 预先限制申请规则，破坏至少一个必要条件 | 资源利用率或并发度可能降低 |
| **避免（Avoidance）** | 每次分配前，依据未来需求检查安全性 | 需要先验信息和安全性检查 |
| **检测与恢复（Detection and Recovery）** | 允许死锁发生，检测后解除 | 检测开销、回滚或丢失已完成工作 |
| **忽略通用死锁处理** | 不提供覆盖所有资源的全局处理方案，由开发者或用户处理相应问题 | 出现死锁时可能需要外部干预 |

## Deadlock Prevention

核心方法：**约束资源申请或使用方式，使至少一个必要条件始终不成立。**

### Mutual Exclusion

对可以安全共享的资源，避免不必要的独占。例如只读文件可供多个进程同时读取。

访问不同数据时，没有必要因为处于同一文件、表格或存储设备，就把整个对象都独占起来。这样可以减少不必要的竞争。

但 **缩小锁范围只能减少竞争，不能独立保证无死锁**；多个细粒度锁之间仍可能形成环。

### Hold and Wait

要求进程在申请资源时不持有其他资源。给出两种协议：

**一次取得全部资源**：在开始执行前申请所需全部资源，全部满足才开始；申请失败时不保留部分资源。

**先释放，再申请**：只有不持有资源时才能提出新的申请。使用已有资源后，如需额外资源，先释放当前资源，再申请下一阶段需要的集合。

<details>
<summary>例子：读取 DVD、磁盘排序、最后打印，为什么资源利用率会降低？</summary>

任务流程为：读取 DVD 数据 → 写入磁盘文件 → 排序 → 打印结果。

若开始前就取得 DVD 驱动器、磁盘相关资源和打印机，打印机会在前面的读取、排序阶段被占用却闲置。分阶段释放和重新申请可以减轻这种浪费，但需要程序能够安全分段。

此外，进程需要的多个热门资源可能一直无法同时空闲，造成长期等待甚至饥饿。**频繁释放并重试可能付出大量无效工作。**

</details>

**注意**：依次执行多个阻塞式 `wait()`，并不等于“一次取得全部资源”。若拿到前几个锁后继续持锁等待，仍然存在请求并保持。

### No Preemption

允许在规定条件下收回资源。协议是：

```text
进程持有部分资源，又申请新资源
        ↓
新资源无法立即获得
        ↓
收回该进程已经持有的资源，将其加入待重新获取集合
        ↓
原资源与新资源能够一起获得后，再恢复执行
```

例如，$P_0$ 持有 A、申请 B 失败时，释放 A；持有 B 的 $P_1$ 就有机会获得 A、完成操作并释放资源。

该方案要求资源状态能够保存、恢复。

正在更新共享数据时，强行让另一个进程进入可能破坏一致性。

### Circular Wait

给资源类型规定全序 $F$，要求进程 **按严格递增的编号申请**：

$$
F(\text{tape drive})=1,
\quad F(\text{disk drive})=5,
\quad F(\text{printer})=12.
$$

同时需要三者时，按磁带 → 磁盘 → 打印机申请。持有打印机时，不能继续持有它再申请更小编号的磁盘。

例子：需要锁 `0、3、5` 的进程按此顺序申请；需要 `3、5、10` 的进程也按同一全序申请。不同进程可以需要不同资源，**共同遵守的顺序必须一致**。

<details>
<summary>证明：为什么按资源编号递增申请可以消除循环等待？</summary>

假设仍有循环等待。环中每个进程持有一种资源，再等待下一种资源。按照协议，后者的编号必须更大。

沿环依次得到：

$$
F(R_0)<F(R_1)<\cdots<F(R_k)<F(R_0).
$$

由传递性推出 $F(R_0)<F(R_0)$，矛盾。因此不存在这样的循环。

</details>

## Deadlock Avoidance

### Additional Information

死锁避免保留动态申请资源的能力，但在批准分配前判断：**分配后是否仍能保证所有进程完成？**

为此需要先验信息。课件采用的模型要求进程预先声明每种资源的 **最大需求量**，并维护可用资源、已分配资源和剩余需求。

准确知道未来最大需求在实际程序中可能很困难。

### Safe State and Safe Sequence

**安全状态（Safe State）**：存在一个包含全部进程的 **安全序列（Safe Sequence）**，即便每个进程都提出其声明范围内的最大剩余需求，也可以按照这个顺序依次满足、完成并回收资源。

设安全序列为 $\langle P_{i_1},P_{i_2},\ldots,P_{i_n}\rangle$，则每一步需满足：

$$
Need_{i_k}\le Available+\sum_{j<k}Allocation_{i_j}.
$$

当前可用资源，加上排在前面的进程完成后释放的资源，足以满足当前进程的剩余最大需求。

**安全序列至少存在一个即可，可以不唯一。** 它是证明资源分配可行的顺序。

### Safe, Unsafe, and Deadlocked States

$$
\text{Safe}\Rightarrow\text{当前无死锁},
\qquad
\text{Deadlocked}\Rightarrow\text{Unsafe}.
$$

但 **不安全状态（Unsafe State）不等于已经死锁**：找不到应对最大剩余需求的安全序列时，进程可能还在执行，也可能在用足最大需求前就释放资源或结束。

死锁避免采用保守策略：从安全状态出发，只批准仍然保持安全的分配，不冒险进入不安全区域。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261022235708.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>例题：当前请求能够满足，为什么仍可能不能批准？</summary>

系统有 12 个同类资源，三进程状态为：

```text
进程       最大需求    已持有    最大剩余需求
P0            10        5           5
P1             4        2           2
P2             9        2           7
Available = 12 - 5 - 2 - 2 = 3
```

原状态可按 $\langle P_1,P_0,P_2\rangle$ 完成，模拟可用量依次为：

$$
3\xrightarrow{P_1\text{ 释放 }2}5
\xrightarrow{P_0\text{ 释放 }5}10
\xrightarrow{P_2\text{ 释放 }2}12.
$$

若额外给 $P_2$ 一个资源，空闲量降到 2，$P_2$ 最大剩余需求变成 6。此时只有 $P_1$ 可完成；它释放资源后空闲量为 4，仍无法满足 $P_0$ 的 5 或 $P_2$ 的 6，故变为不安全状态。

这个时刻不必已经死锁；若两者随后持有现有资源，并实际请求这些剩余数量，就会无法继续。

</details>

### Resource-Allocation Graph Algorithm

在普通资源分配图上增加 **声明边（Claim Edge）**：

$$
P_i\dashrightarrow R_j,
$$

虚线表示 $P_i$ 将来可能请求 $R_j$，目前尚未发出实际请求。资源需求应预先声明。

```text
声明边：P → R，虚线
    ↓ 实际提出请求
请求边：P → R，实线
    ↓ 请求获准、资源分配
分配边：R → P，实线
    ↓ 释放资源
重新变为声明边：P → R，虚线
```

资源可用时，**试把请求边改为分配边**，检查包括其余声明边在内的整张图。转换后无环才批准；有环则延迟请求。声明边变成同向的请求边仅改变边的状态，安全性检查的关键是后续分配时的边反向。

#### Example

**Safe and Unsafe Allocations**

**$R_1,R_2$ 各有一个实例。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261022235816.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

$R_1\rightarrow P_1$，$P_2\rightarrow R_1$；$P_1$、$P_2$ 都有指向 $R_2$ 的声明边，$R_2$ 空闲。

**结论：可以保证 $P_1$ 先完成，再满足 $P_2$；但不能把 $R_2$ 提前分配给 $P_2$。**

<details>
<summary>展开推演：为什么不安全，又为什么尚未必死锁？</summary>

原状态可先让 $P_1$ 在需要时取得 $R_2$，结束并释放 $R_1,R_2$；之后 $P_2$ 可以取得所需资源。因此存在安全顺序 $\langle P_1,P_2\rangle$。

若试分配 $R_2$ 给 $P_2$，会得到 P25 的环：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261022235936.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

$$
P_1\dashrightarrow R_2\rightarrow P_2\rightarrow R_1\rightarrow P_1.
$$

其中 $P_1\dashrightarrow R_2$ 仍是声明边，因此当前还没有形成全由实际请求与分配边构成的死锁环；但 $P_1$ 一旦请求 $R_2$，双方就会相互等待。

若 $P_1$ 最终没有使用 $R_2$，也可能直接完成并释放 $R_1$。避免算法不能靠这种可能性作保证，所以拒绝使系统进入 P25 状态的分配。


</details>

**两种有环**：单实例普通图中的实际请求环表示死锁；加入声明边的避免算法中，含潜在请求的环表示不安全，可能尚未形成实际死锁。

### Banker's Algorithm

**银行家算法（Banker's Algorithm）** 处理多实例资源：先试分配，再检查安全性，只有新状态安全才正式批准。

前提：进程预先声明每种资源的最大需求，最大需求不超过系统相应资源总量；请求可能需要等待；进程取得所需资源后，能够在有限时间内完成并释放资源。

#### Data Structures

设 $n$ 为进程数，$m$ 为资源类型数。

| 数据结构 | 维度 | 含义 |
| --- | --- | --- |
| `Available[j]` | $m$ | 当前第 $j$ 类资源还有多少空闲实例 |
| `Max[i][j]` | $n\times m$ | $P_i$ 对第 $j$ 类资源声明的最大需求量 |
| `Allocation[i][j]` | $n\times m$ | 当前已经分配给 $P_i$ 的第 $j$ 类资源数量 |
| `Need[i][j]` | $n\times m$ | $P_i$ 剩余的最大资源需求量 |

$$
\boxed{Need=Max-Allocation}
$$

例如 $Max_1=(3,2,2)$，$Allocation_1=(2,0,0)$，则 $Need_1=(1,2,2)$。

`Max` 是所需持有量的上界
`Need` 表示达到该上界最多还需多少；实际下一次请求可以小于 `Need`。

`Need` 可以由另外两个矩阵计算，无须把四个数据结构当成相互独立的信息。对每种资源还可检查守恒关系：

$$
Total[j]=Available[j]+\sum_i Allocation[i][j].
$$

向量比较必须逐分量进行：

$$
X\le Y\iff\forall j,\ X[j]\le Y[j].
$$

例如 $(1,2,2)\le(3,3,2)$ 成立

#### Safety Algorithm

用两个临时变量模拟后续执行：

**`Work`**：长度为 $m$，初始化为 `Available`，表示模拟过程中可供后续进程使用的资源。

**`Finish`**：长度为 $n$，初始化全部为 `false`；置为 `true` 表示该进程已经在本次模拟中被安排完成。

```text
Work ← Available 的副本
Finish[i] ← false，i = 0, ..., n-1
sequence ← 空序列

重复：
    找到一个 i，使 Finish[i] = false 且 Need[i] ≤ Work
    如果找不到：结束循环

    Work ← Work + Allocation[i]
    Finish[i] ← true
    把 Pi 加到 sequence 末尾

若 Finish 全部为 true：安全，sequence 是一个安全序列
否则：不安全
```

**检查只是模拟。** 已“完成”的行通过 `Finish` 跳过。最终 `Work` 等于资源总量。

<details>
<summary>公式推导：为什么完成一个进程后加 Allocation，而不直接加 Max？</summary>

当 $Need_i\le Work$ 时，可以假设把剩余需求全部给它。借出后可用量为 $Work-Need_i$。

进程完成时归还原先持有的资源和刚取得的资源，总量为 $Allocation_i+Need_i$。因此：

$$
\begin{aligned}
Work'
&=Work-Need_i+(Allocation_i+Need_i)\\
&=Work+Allocation_i.
\end{aligned}
$$

直接加 `Max` 会把刚从 `Work` 借出的那部分重复计算。

</details>

<details>
<summary>算法理解：需要找“Need 最小”的进程或枚举所有排列吗？</summary>

不需要。选取任意满足 $Need_i\le Work$ 的未完成进程即可。

每次模拟完成都只会使 `Work` 逐分量不减，因此选择一个当前可完成的进程，不会让其他进程的资源条件变差。安全性检查无需枚举 $n!$ 个排列。

先找容易满足的进程用于手算加速，但多维向量未必有唯一“最小值”，也无须按 `Need` 的分量总和排序。某一行暂时不满足时继续看其他行；只有所有未完成行都不满足，才能停止。

朴素实现最多安排 $n$ 个进程，每次寻找可能扫描 $n$ 行，每行比较 $m$ 个分量，因此复杂度为：

$$
O(mn^2).
$$

</details>

#### Resource-Request Algorithm

$Request_i$ 表示 $P_i$ **本次** 请求的资源向量，按以下顺序处理。

**第一步：检查声明上界。**

$$
Request_i\le Need_i.
$$

不满足则超过最大声明，是错误请求。

**第二步：检查当前可用量。**

$$
Request_i\le Available.
$$

不满足则等待，当前状态保持不变；此时不需要试分配。

**第三步：试分配并调用安全性算法。**

$$
\begin{aligned}
Available'&=Available-Request_i,\\
Allocation_i'&=Allocation_i+Request_i,\\
Need_i'&=Need_i-Request_i.
\end{aligned}
$$

其他进程的行不变。若新状态安全，提交此次分配；若不安全，恢复试分配前状态，让请求等待。

```text
未超过最大声明？ → 当前资源足够？ → 试分配后的状态安全？
        ↓否                ↓否                  ↓否
      请求错误            等待               撤销试分配，等待
                                                 ↓是
                                             正式批准
```

**能够立即拿出这些资源，仅说明通过第二步；能否批准还取决于第三步。**

#### Example

**Initial Safety Check**

**判断初始时刻 $T_0$ 是否安全。**

资源总量为 $(A,B,C)=(10,5,7)$，$Available=(3,3,2)$。以下表格将 P31 原始数据与 P32 的 `Need` 合并展示。

| 进程 | Allocation | Max | Need = Max − Allocation |
| --- | --- | --- | --- |
| $P_0$ | $(0,1,0)$ | $(7,5,3)$ | $(7,4,3)$ |
| $P_1$ | $(2,0,0)$ | $(3,2,2)$ | $(1,2,2)$ |
| $P_2$ | $(3,0,2)$ | $(9,0,2)$ | $(6,0,0)$ |
| $P_3$ | $(2,1,1)$ | $(2,2,2)$ | $(0,1,1)$ |
| $P_4$ | $(0,0,2)$ | $(4,3,3)$ | $(4,3,1)$ |

**结论：安全，一个安全序列为 $\langle P_1,P_3,P_4,P_2,P_0\rangle$。**

<details>
<summary>完整演算：Need、Work、Finish 与安全序列</summary>

**1. 计算并校验初始数据。**

```text
Need0 = (7,5,3) - (0,1,0) = (7,4,3)
Need1 = (3,2,2) - (2,0,0) = (1,2,2)
Need2 = (9,0,2) - (3,0,2) = (6,0,0)
Need3 = (2,2,2) - (2,1,1) = (0,1,1)
Need4 = (4,3,3) - (0,0,2) = (4,3,1)
```

已分配资源之和为 $(7,2,5)$，加上 $(3,3,2)$ 得到 $(10,5,7)$，符合资源总量。

**2. 初始化。**

$$
Work=(3,3,2),\qquad Finish=(F,F,F,F,F).
$$

下文 `Finish` 始终按 $P_0,P_1,P_2,P_3,P_4$ 的顺序书写。

初始只有 $P_1$、$P_3$ 的需求可立即满足。$P_0$ 的 A、B、C 都不够；$P_2$ 的 A 不够；$P_4$ 的 A 不够。

**3. 按安全序列逐轮模拟。**

| 选择的进程 | Need | 检查前 Work | 加回 Allocation 后的 Work | Finish |
| --- | --- | --- | --- | --- |
| $P_1$ | $(1,2,2)$ | $(3,3,2)$ | $(5,3,2)$ | `F T F F F` |
| $P_3$ | $(0,1,1)$ | $(5,3,2)$ | $(7,4,3)$ | `F T F T F` |
| $P_4$ | $(4,3,1)$ | $(7,4,3)$ | $(7,4,5)$ | `F T F T T` |
| $P_2$ | $(6,0,0)$ | $(7,4,5)$ | $(10,4,7)$ | `F T T T T` |
| $P_0$ | $(7,4,3)$ | $(10,4,7)$ | $(10,5,7)$ | `T T T T T` |

每行都满足 `Need ≤ Work`。例如第一行：

$$
(1,2,2)\le(3,3,2),\qquad
Work'=(3,3,2)+(2,0,0)=(5,3,2).
$$

安全序列依次扩展：

```text
⟨P1⟩ → ⟨P1,P3⟩ → ⟨P1,P3,P4⟩
     → ⟨P1,P3,P4,P2⟩ → ⟨P1,P3,P4,P2,P0⟩
```

`Need` 在安全性模拟中始终保持上表的值，已完成进程由 `Finish` 标记。所有标记最终为 `true`，证明初始状态安全。

**4. 另一条选择路径。**

先选 $P_3$，得到：

$$
(3,3,2)+(2,1,1)=(5,4,3).
$$

再选 $P_1$，得到 $(7,4,3)$，之后也可以完成其余进程。例如：

$$
\langle P_3,P_1,P_4,P_2,P_0\rangle.
$$
同样正确。

</details>

**P1 Requests Additional Resources**

**从 $T_0$ 出发，$P_1$ 请求 $(1,0,2)$。能否批准？**

**结论：可以批准。**

<details>
<summary>完整演算：合法性检查、试分配及安全性验证</summary>

**1. 检查是否超过剩余最大需求。**

$$
Request_1=(1,0,2)\le Need_1=(1,2,2).
$$

**2. 检查空闲资源是否足够。**

$$
(1,0,2)\le Available=(3,3,2).
$$

两项均成立。

**3. 试分配。**

$$
\begin{aligned}
Available'&=(3,3,2)-(1,0,2)=(2,3,0),\\
Allocation_1'&=(2,0,0)+(1,0,2)=(3,0,2),\\
Need_1'&=(1,2,2)-(1,0,2)=(0,2,0).
\end{aligned}
$$

只有 $P_1$ 对应的行改变，`Max` 不变：

| 进程 | 试分配后的 Allocation | 试分配后的 Need |
| --- | --- | --- |
| $P_0$ | $(0,1,0)$ | $(7,4,3)$ |
| $P_1$ | $(3,0,2)$ | $(0,2,0)$ |
| $P_2$ | $(3,0,2)$ | $(6,0,0)$ |
| $P_3$ | $(2,1,1)$ | $(0,1,1)$ |
| $P_4$ | $(0,0,2)$ | $(4,3,1)$ |

**4. 从新状态重新初始化安全性检查。**

$$
Work=(2,3,0),\qquad Finish=(F,F,F,F,F).
$$

此时只有 $P_1$ 能满足全部剩余需求；$P_3$ 虽然需求较小，仍缺 C，暂时无法选取。

| 选择的进程 | Need | 检查前 Work | 加回 Allocation 后的 Work | Finish |
| --- | --- | --- | --- | --- |
| $P_1$ | $(0,2,0)$ | $(2,3,0)$ | $(5,3,2)$ | `F T F F F` |
| $P_3$ | $(0,1,1)$ | $(5,3,2)$ | $(7,4,3)$ | `F T F T F` |
| $P_4$ | $(4,3,1)$ | $(7,4,3)$ | $(7,4,5)$ | `F T F T T` |
| $P_0$ | $(7,4,3)$ | $(7,4,5)$ | $(7,5,5)$ | `T T F T T` |
| $P_2$ | $(6,0,0)$ | $(7,5,5)$ | $(10,5,7)$ | `T T T T T` |

第一轮加回的是试分配后的 $Allocation_1'=(3,0,2)$：

$$
Work'=(2,3,0)+(3,0,2)=(5,3,2).
$$

因此得到安全序列：

$$
\boxed{\langle P_1,P_3,P_4,P_0,P_2\rangle}.
$$

**5. 正式提交此次请求。**

真实系统保留试分配后的状态：$Available=(2,3,0)$，$Allocation_1=(3,0,2)$，$Need_1=(0,2,0)$。模拟中的五个进程没有真的完成，所以不能把真实 `Available` 改成 $(10,5,7)$。

</details>

**Two Subsequent Requests**

**均从 $P_1$ 的 $(1,0,2)$ 已获批后的状态出发。**

此时 $Available=(2,3,0)$。

**问题一：$P_4$ 请求 $(3,3,0)$。结论：当前资源不足，等待。**

<details>
<summary>展开计算：为什么不需要运行安全性算法？</summary>

请求未超过声明：

$$
(3,3,0)\le Need_4=(4,3,1).
$$

但当前 A 只有 2 个，请求需要 3 个：

$$
(3,3,0)\nleq Available=(2,3,0).
$$

第二步已经失败，无须试分配。实际 `Available / Allocation / Need` 均不变，系统仍保留原来的安全状态。

因此，应记录为 **资源不足导致等待**。课堂此处口头联系到了不安全状态，但不能据此把尚未改变的当前状态判为不安全。

</details>

**问题二：$P_0$ 请求 $(0,2,0)$。结论：资源虽足够，试分配后不安全，撤销并等待。**

<details>
<summary>完整演算：为什么这次找不到安全序列的第一个进程？</summary>

前两步均通过：

$$
(0,2,0)\le Need_0=(7,4,3),\qquad
(0,2,0)\le Available=(2,3,0).
$$

试分配后：

$$
\begin{aligned}
Available'&=(2,1,0),\\
Allocation_0'&=(0,3,0),\\
Need_0'&=(7,2,3).
\end{aligned}
$$

初始化 $Work=(2,1,0)$，逐一检查：

| 进程 | Need | 无法满足的资源 |
| --- | --- | --- |
| $P_0$ | $(7,2,3)$ | A、B、C |
| $P_1$ | $(0,2,0)$ | B |
| $P_2$ | $(6,0,0)$ | A |
| $P_3$ | $(0,1,1)$ | C |
| $P_4$ | $(4,3,1)$ | A、B、C |

没有任何一行满足 $Need_i\le Work$，故 `Work` 无法增加，`Finish` 全为 `false`，安全序列为空。试分配状态不安全。

撤销 $P_0$ 本次试分配：

$$
Available=(2,3,0),\quad
Allocation_0=(0,1,0),\quad
Need_0=(7,4,3).
$$

$P_1$ 此前已获批的分配保持不变。检查结果表示 **这次请求不能立即批准**，不表示真实系统已经发生死锁。

</details>

#### Practical Costs and Exam Workflow

**预先声明最大需求不容易；每次请求都运行安全性检查也有开销。**

计算题可固定按以下流程处理：

```text
核对题目基于哪一个状态
        ↓
Need = Max - Allocation
        ↓
检查 Request ≤ Need，再检查 Request ≤ Available
        ↓
只修改本次申请进程的一行，得到试分配状态
        ↓
Work = 新 Available，Finish 重新初始化
        ↓
反复找 Need ≤ Work 的进程，加回它的新 Allocation
        ↓
全部完成：批准；中途停住：撤销试分配并等待
```

**安全性检查得出的“不安全”，与下面死锁检测得出的“已死锁”，判断目标不同。**

## Deadlock Detection

检测策略允许系统进入死锁，再通过 **检测算法＋恢复机制** 处理。其任务是判断当前请求和资源占有关系是否已经无法继续，不要求预先知道所有进程的最大需求。

### Single Instance of Each Resource Type

每种资源只有一个实例时，可将资源分配图转成 **等待图（Wait-for Graph）**：只保留进程节点，将

$$
P_i\rightarrow R_j\rightarrow P_k
$$

合并为：

$$
P_i\rightarrow P_k.
$$

这条边表示 $P_i$ 正在等待 $P_k$ 释放所需资源。图中使用当前实际等待关系，不使用表示未来需求的声明边。

在单实例模型下：

$$
\boxed{\text{等待图存在有向环}\Longleftrightarrow\text{存在死锁}}.
$$

**只需找到任意一个环，不要求环覆盖所有进程。**

#### Example

**Resource-Allocation Graph and Wait-for Graph**

**将左侧资源分配图简化，并判断哪些进程死锁。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261023002135.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开分析：逐条转换，以及深度优先搜索的路径</summary>

```text
P1 → R1 → P2  转为  P1 → P2
P2 → R3 → P5  转为  P2 → P5
P2 → R4 → P3  转为  P2 → P3
P2 → R5 → P4  转为  P2 → P4
P3 → R5 → P4  转为  P3 → P4
P4 → R2 → P1  转为  P4 → P1
```

$P_5$ 没有向外的等待边。根据搜索思路，从 $P_1$ 出发可找到：

$$
P_1\rightarrow P_2\rightarrow P_3\rightarrow P_4\rightarrow P_1,
$$

以及：

$$
P_1\rightarrow P_2\rightarrow P_4\rightarrow P_1.
$$

另一条路径 $P_1\rightarrow P_2\rightarrow P_5$ 到此结束，不构成环。

因此，$P_1,P_2,P_3,P_4$ 陷入死锁，$P_5$ 不在这些死锁环中。$P_5$ 释放 $R_3$ 也不足以解除其余环，因为还存在 $R_1,R_2,R_4,R_5$ 的循环依赖。

</details>

**深度优先搜索（Depth-First Search）** 可沿等待边推进；若再次走到当前搜索路径上的节点，就找到了环。实现时需要区分“仍在当前路径上”与“以前访问过、已经搜索结束”，不能把所有指向已访问节点的边都当成环。

### Several Instances of a Resource Type

多实例情形不能仅凭普通等待关系中的环判断死锁。检测算法使用：

**`Available`**：长度为 $m$ 的当前可用资源向量。

**`Allocation`**：$n\times m$ 矩阵，记录每个进程已经持有的资源。

**`Request`**：$n\times m$ 矩阵，记录每个进程 **当前尚未满足的请求**。

**这里不使用 `Max`，也不计算 `Need = Max − Allocation`。** 银行家算法中的 `Request_i` 是本次申请向量；这里把所有进程当前待满足请求逐行放入一个矩阵。

### Detection Algorithm

初始化：

$$
Work=Available,
$$

$$
Finish[i]=
\begin{cases}
false,&Allocation_i\ne\mathbf 0,\\
true,&Allocation_i=\mathbf 0.
\end{cases}
$$

$Allocation_i\ne\mathbf 0$ 表示 **至少持有一种资源的一个实例**，不要求这一行每个分量都非零。

之后反复找满足下列条件的进程：

$$
Finish[i]=false\quad\land\quad Request_i\le Work.
$$

找到后模拟其继续执行并释放资源：

$$
Work\leftarrow Work+Allocation_i,\qquad Finish[i]\leftarrow true.
$$

若不存在可选进程则停止；最终仍有 `Finish[i] = false`，课件算法判定系统存在死锁，并将相应进程列为死锁进程。朴素实现的复杂度同样为 $O(mn^2)$。

```text
Work ← Available 的副本
Finish[i] ← (Allocation[i] 是零向量)

重复：
    找到 i，使 Finish[i] = false 且 Request[i] ≤ Work
    如果找不到：结束循环
    Work ← Work + Allocation[i]
    Finish[i] ← true

返回所有 Finish[i] = false 的进程
返回集合非空：检测到死锁
```

<details>
<summary>为什么没有持有资源的进程，Finish 初值可以设为 true？</summary>

这是按算法初始化规则作出的解释：它没有占住任何资源，因此不会成为通过资源占有维持循环等待的一环，也没有可回收资源需要加入 `Work`。

这里的 `true` 只是本次检测中的排除标记，不能解释成该进程真实运行结束，或保证它不会长期等待。它可能因依赖已经死锁的资源而受到影响，但不承担占有资源、维持该环的作用。

</details>

<details>
<summary>为什么满足当前 Request 后，就可以假设进程完成并释放全部资源？</summary>

采用 **乐观假设**：当前请求能够满足时，先认为该进程不会再索取额外资源，可以继续完成并归还已分配资源。

这一检查用于判定当前是否已经死锁。若该进程以后又提出新请求并造成死锁，留待下一次检测；因此检测通过无法保证所有未来请求都安全。

安全性算法则使用最大剩余需求 `Need`，为未来声明范围内的请求预留完成路径，两者的保证强度不同。

</details>

### Example

1. **No Available Resources but No Deadlock**

**资源总量为 $(7,2,6)$，$Available=(0,0,0)$。系统是否死锁？**

| 进程 | Allocation | Request |
| --- | --- | --- |
| $P_0$ | $(0,1,0)$ | $(0,0,0)$ |
| $P_1$ | $(2,0,0)$ | $(2,0,2)$ |
| $P_2$ | $(3,0,3)$ | $(0,0,0)$ |
| $P_3$ | $(2,1,1)$ | $(1,0,0)$ |
| $P_4$ | $(0,0,2)$ | $(0,0,2)$ |

**结论：当前无死锁。空闲资源为零，不意味着没有进程能够继续。**

<details>
<summary>完整演算：Work 与 Finish 的每轮变化</summary>

五个进程都持有资源，所以：

$$
Work=(0,0,0),\qquad Finish=(F,F,F,F,F).
$$

$P_0$ 与 $P_2$ 的当前请求均为零，可先选择其中任意一个。按顺序：

| 选择的进程 | Request | 检查前 Work | 加回 Allocation 后的 Work | Finish |
| --- | --- | --- | --- | --- |
| $P_0$ | $(0,0,0)$ | $(0,0,0)$ | $(0,1,0)$ | `T F F F F` |
| $P_2$ | $(0,0,0)$ | $(0,1,0)$ | $(3,1,3)$ | `T F T F F` |
| $P_3$ | $(1,0,0)$ | $(3,1,3)$ | $(5,2,4)$ | `T F T T F` |
| $P_1$ | $(2,0,2)$ | $(5,2,4)$ | $(7,2,4)$ | `T T T T F` |
| $P_4$ | $(0,0,2)$ | $(7,2,4)$ | $(7,2,6)$ | `T T T T T` |

关键的前两步为：

$$
(0,0,0)+(0,1,0)=(0,1,0),
$$

$$
(0,1,0)+(3,0,3)=(3,1,3).
$$

因此可通过消解顺序

$$
\langle P_0,P_2,P_3,P_1,P_4\rangle
$$

将所有进程标为 `true`。这证明当前请求没有形成死锁；由于没有 `Max` 信息，此处不额外声称已证明银行家算法意义上的安全状态。

`Request=(0,0,0)` 表示当前没有待满足请求，不表示进程完全不使用资源，也不表示它未来不可能继续申请。

</details>

2. **One Additional Request Causes Deadlock**

**仅把 $P_2$ 的当前请求改成 $(0,0,1)$。**

这表示它额外申请一个 C，**资源尚未分配**，因此 `Available` 仍为 $(0,0,0)$，所有 `Allocation` 行也保持原值。

**结论：$P_1,P_2,P_3,P_4$ 死锁；$P_0$ 可完成。**

<details>
<summary>完整演算：为什么只能消去 P₀？</summary>

重新初始化 `Work=(0,0,0)`、`Finish=(F,F,F,F,F)`。

$P_0$ 的请求为零，因此可模拟完成：

$$
Work=(0,0,0)+(0,1,0)=(0,1,0),
$$

$$
Finish=(T,F,F,F,F).
$$

剩余进程的当前请求如下：

| 进程 | Request | 相比 Work = $(0,1,0)$ 的缺口 |
| --- | --- | --- |
| $P_1$ | $(2,0,2)$ | A、C 不足 |
| $P_2$ | $(0,0,1)$ | C 不足 |
| $P_3$ | $(1,0,0)$ | A 不足 |
| $P_4$ | $(0,0,2)$ | C 不足 |

没有进程满足 `Request ≤ Work`，模拟停止，四个 `false` 对应死锁进程集合：

$$
\boxed{\{P_1,P_2,P_3,P_4\}}.
$$

与 P41 相比，$P_2$ 原先可以不再等待资源就继续执行，并释放大量 A、C。新增请求使它也必须等待，系统因而失去了这条资源释放路径。

P41 上一次模拟最终得到的 $(7,2,6)$ 不是真实释放后的资源；分析 P42 时必须使用原快照重新初始化。

</details>

### Safety Algorithm vs Detection Algorithm

| 比较项 | 安全性算法 | 死锁检测算法 |
| --- | --- | --- |
| 回答的问题 | 按声明的最大需求，能否保证全部完成？ | 当前是否已经形成死锁？ |
| 输入 | `Available, Allocation, Need` | `Available, Allocation, Request` |
| 是否需要最大需求 | 需要，`Need = Max − Allocation` | 不需要 |
| `Finish` 初始化 | 全部 `false` | 未持有资源的进程先置 `true` |
| 可消去进程的条件 | `Need[i] ≤ Work` | `Request[i] ≤ Work` |
| 更新 | `Work += Allocation[i]` | `Work += Allocation[i]` |
| 最后有 `false` | 不安全，未必已经死锁 | 按检测模型判为已死锁 |

### Detection-Algorithm Usage

检测频率需要考虑：死锁可能多频繁地发生，以及延迟发现会影响多少进程、付出多大恢复代价。

**更频繁检测** 可以更早发现问题，减少资源长时间被占和死锁影响扩大；代价是维护等待关系与运行算法的开销。**降低检测频率** 可以节省正常运行开销，但发现时可能已有多个环交织，恢复成本更高。

选择包括：请求无法立即满足时检测，或按一定时间间隔检测。任意时刻发现多个环后，通常难以仅凭当前快照判断哪一个请求最先使系统陷入死锁；死锁由相互依赖共同形成，也不宜简单归咎于单一进程。

## Recovery from Deadlock

检测后可通知操作者手动处理，也可以自动恢复。两条主要路径是：**终止部分进程，或从进程处抢占资源**，使其余进程能够继续。

处理的目标在于 **解除资源依赖，让系统重新推进**。终止进程和回滚都会付出代价，需要结合资源语义清理状态。

### Process Termination

**终止全部死锁进程**：可以直接打破这些进程之间的死锁，但会丢弃大量已完成工作，可能需要整体重做。

**逐个终止，直到死锁解除**：每次终止后重新检测，可能减少损失，但反复检测也有开销。消除某一个环后，其他环仍可能存在。

<details>
<summary> 终止一个环上的进程，为什么可能仍有死锁？</summary>

图中同时存在：

$$
P_1\rightarrow P_2\rightarrow P_3\rightarrow P_4\rightarrow P_1
$$

与：

$$
P_1\rightarrow P_2\rightarrow P_4\rightarrow P_1.
$$

终止 $P_3$ 可以破坏第一条环，但第二条环仍在。选择多个环共享的进程可能更有效，但真实系统还要比较终止代价。

</details>

### Victim Selection

选择因素包括：进程优先级、已运行多久与预计剩余时间、已经使用的资源、完成还需要的资源、总共需要终止多少进程，以及它是交互式任务还是批处理任务。

**优先级与任务性质**：保留高优先级、交互式任务有利于服务重要工作，但反复牺牲低优先级后台任务可能造成饥饿。

**已经付出的工作与剩余工作**：终止接近完成的任务可能浪费较大；但准确估计剩余工作通常困难，CPU 时间也无法概括全部资源操作。

**资源与解环效果**：持有更多关键资源的进程，结束后可能释放更多机会；但持有量大也可能意味着已经投入更多工作。需要同时看资源类型、其他进程的实际需求以及仍存在的环。

**这些目标可能冲突，没有一种简单排序在所有场景下都最优；把所有指标堆入复杂策略也不自动带来更好结果。**

### Resource Preemption

依次从部分进程收回资源，交给其他进程，直到死锁解除。三个问题：

**选择牺牲者（Selecting a Victim）**：决定抢占谁、哪些资源及顺序，尽量降低损失。只收回无关资源不能解除当前依赖。

**回滚（Rollback）**：失去必要资源的进程无法直接沿原路径继续，需要返回一个可恢复的状态，再重新执行。最简单的办法是从头重来；只回滚到足以解除死锁的位置可以节省工作，但需要保存更多状态信息。

**防止饥饿**：若总挑“代价最小”的同一个进程，它可能永远无法完成。把 **已经回滚的次数** 纳入选择代价，避免反复牺牲同一进程。
