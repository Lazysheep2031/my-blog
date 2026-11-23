---
title: The Network Layer
published: 2026-11-09
description: 网络层基础：路由算法、广播与多播、IPv4/IPv6、子网划分与 CIDR、NAT、DHCP，以及 ICMP 网络诊断与数据包转发机制。
tags: [计算机网络]
category: 笔记
draft: false
---

## The Network Layer

**网络层（Network Layer）** 负责把分组从源主机送到目的主机，途中可以跨越多个网络。实际传送采用 **逐跳转发（Hop-by-Hop Forwarding）**：每到一台路由器，就决定下一跳从哪个接口发出。

数据链路层负责一段链路上相邻节点之间的帧传输；网络层把这些链路连接起来，完成跨网络的分组交付。

```text
源主机 → 路由器 A → 路由器 C → 路由器 E → 目的主机
         每一跳分别使用相应链路的数据链路层协议
```

### Forwarding and Routing

**转发（Forwarding）** 是单台路由器内的操作：从输入接口收到分组，查询转发表，选择输出接口并发送。

**路由选择（Routing）** 是网络范围内的过程：根据拓扑、链路代价等信息计算路径，形成并维护转发所需的信息。

```text
路由协议交换信息 → 路由算法计算路径 → 建立、更新转发表
                                            ↓
                           分组到达 → 查表 → 从输出接口转发
```

**路由表记录路径选择信息，转发表服务于实际查表转发。** 路由器还可能维护邻居表、ARP 表等，各张表承担不同任务。

转发表的索引取决于网络采用的服务方式： **Datagram Network（数据报网络）** 主要按目的地址查找； **Virtual-Circuit Network（虚电路网络）** 按连接标识查找。简化后，一条转发表项可以写成：

$$
\text{目的地}\longrightarrow\text{输出接口／下一跳}.
$$

表项会随路由更新而改变。对某个分组执行转发时，使用当前已经得到的转发信息。

### **Store-and-Forward Packet Switching**

**Store-and-Forward**：先接收完整分组，完成相应检查；检测出错误则丢弃，通过检查后再向下一跳发送。分组接收需要时间，输出链路忙时还要在缓冲区等待。

```text
完整接收 → 检查 → 查转发表 → 等待输出链路 → 发送至下一跳
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109152431.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中的 H1 先把分组交给 A；分组经过 ISP 内部的路由器，到达 E，再经 F 所连接的 **Local Area Network（局域网）** 抵达 H2。**每一跳完成局部转发，沿途共同完成从 H1 到 H2 的交付。**

### Services Provided to the Transport Layer

网络层向运输层提供服务时，需要满足三个设计目标：

1. 服务独立于路由器采用的具体技术。
2. 隐藏路由器的数量、类型和网络拓扑。
3. 网络地址采用统一的编号体系。

运输层可以使用统一的网络层接口，不必逐一处理底层不同网络的差异。

网络层可以提供 **无连接服务** 或 **面向连接服务**，相应的典型实现是 **Datagram Network** 和 **Virtual-Circuit Network**。

### Connectionless Service

**Datagram Network** 中，发送前无须建立网络层连接。每个分组携带目的地址，路由器按当前转发表独立处理。

同一通信中的分组可以经过不同路径；转发表保持不变时，也可以连续经过同一路径。

#### Example

**Routing in a Datagram Network**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109152453.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**H1 向 H2 发送分组 1、2、3、4。A 的转发表发生变化后，分组的路径如何变化？**

<details>
<summary>展开解答</summary>

最初，A 到 E、F 的下一跳均为 C。因此，前三个分组在路由器之间经过：

$$
A\rightarrow C\rightarrow E\rightarrow F.
$$

随后 A 的转发表更新，到 E、F 的下一跳变为 B。第 4 个分组于是经过：

$$
A\rightarrow B\rightarrow D\rightarrow E\rightarrow F.
$$

两条路径前后都连接 H1 和 H2。变化发生在中间的路由选择，分组的最终目的地保持不变。

例如 A 的初始表中 `Dest.=F, Line=C` 表示：**目的地为 F 的分组，先从连接 C 的接口发出。** 一台路由器只需决定下一跳，后续由下一台路由器继续处理。

由于不同路径的时延可以不同，后发的分组可能先到。

</details>

### Connection-Oriented Service

**Virtual-Circuit Network** 先建立一条逻辑路径，沿途路由器保存连接状态；数据分组随后沿这条路径传送，通信结束后释放状态。

```text
建立虚电路 → 沿虚电路传送分组 → 释放虚电路
```

分组携带较短的 **VC Identifier（虚电路标识）**。转发表记录的关系为：

$$
(\text{输入接口},\text{输入标识})
\longrightarrow
(\text{输出接口},\text{输出标识}).
$$

标识只需在相应的链路或接口范围内区分连接，经过路由器时可以更换。

#### Example

**Two Connections on the Same Route**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109152524.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**H1 和 H3 都通过 A → C → E → F 向 H2 发送数据，并且进入 A 时都使用标识 1。A 如何区分两条连接？为什么转发后要改变其中一条连接的标识？**

<details>
<summary>展开解答</summary>

A 可以根据输入接口区分 H1 和 H3。但两条连接从 A 发往 C 时使用同一条链路，C 看到的输入接口都来自 A，因此需要不同的标识。

A 的映射为：

```text
(H1, 1) → (C, 1)
(H3, 1) → (C, 2)
```

后续映射为：

```text
C： (A, 1) → (E, 1)       (A, 2) → (E, 2)
E： (C, 1) → (F, 1)       (C, 2) → (F, 2)
```

所以两条连接可以共享相同的路由器路径，同时通过标识保持区分。**标识无须在整个网络中统一；查表时要结合输入接口。**

</details>

### Virtual-Circuit and Datagram Networks

| 比较项 | **Datagram Network** | **Virtual-Circuit Network** |
| --- | --- | --- |
| 发送前建立连接 | 无须 | 需要 |
| 分组中的寻址信息 | 完整的源、目的地址 | 较短的 **VC Identifier** |
| 路由器保存的状态 | 无须为每条连接保存专用状态 | 每条虚电路需要相应表项 |
| 路径选择 | 每个分组按当前转发表独立转发 | 建立虚电路时选路，后续沿该路径传送 |
| 路由器故障 | 可能丢包，路由恢复后可改走其他路径 | 经过故障路由器的虚电路受到影响 |
| **Quality of Service（服务质量）** 与 **Congestion Control（拥塞控制）** | 逐连接预留和控制较困难 | 可在建立连接时分配资源，较容易实现 |

**虚电路便于提前安排资源，但Quality of Service仍取决于是否实际预留了足够资源。** **Datagram Network** 中，路由器不保存逐连接状态，也仍然需要保存转发表。

## Routing Algorithms

路由算法需要兼顾 **正确性、简单性、鲁棒性、稳定性、公平性和效率**。网络变化后，应能够调整路径；频繁调整又可能造成环路或振荡。

用加权图表示网络：

$$
G=(V,E),
$$

其中 $V$ 是路由器集合，$E$ 是链路集合。路径代价由所经过链路的代价构成。

“最短”取决于代价的定义，可以使用跳数、时延、物理距离、通信费用或负载。带宽也可以转换为代价：**高带宽链路通常对应较低代价，不能直接把带宽越小理解为路径越好。**

### Classification of Routing Algorithms

**按掌握的信息分类：**

- **全局信息算法**：掌握完整拓扑和全部链路代价，再计算最短路径。 **Link-State Routing（链路状态路由，LS）** 属于这一类。
- **分散式算法**：通过邻居交换信息，分布式地迭代计算路径。 **Distance-Vector Routing（距离向量路由，DV）** 属于这一类。

这里“全局”描述算法使用的信息范围。各路由器可以拥有相同的拓扑信息，然后分别进行计算。

**按是否适应网络变化分类：**

- **Static Routing（静态路由）**：由管理员配置，拓扑变化后通常需要人工修改。
- **Dynamic Routing（动态路由）**：根据链路和网络状态更新路由，具有自适应性；同时需要处理路由环路、收敛和振荡。

网络扩大后，完整拓扑的维护成本会上升，距离向量的传播与收敛也会变得困难，因此还需要 **Hierarchical Routing（层次路由）**。

### **Static Routing**

**Static Routing** 由管理员指定“到某个目的网络，应从哪个接口或经过哪个下一跳发送”。小型、稳定的网络比较容易管理；路径变化后需要检查并调整有关路由。

### **Link-State Routing**

**LS**：每台路由器通告自己的邻居及链路代价；链路状态信息传播后，各路由器构建网络拓扑，再独立计算最短路径。

```text
发现邻居、确定链路代价
          ↓
生成并传播本地链路状态
          ↓
汇集链路状态，构建完整拓扑
          ↓
以自身为起点运行 Dijkstra
          ↓
从最短路径得到下一跳与转发表
```

**一致的是拓扑信息；各路由器以自身为源计算，得到的转发表可以不同。** OSPF 使用这一类方法。

### The Optimality Principle

**最优性原理（Optimality Principle）**：如果 J 位于 I 到 K 的一条最优路径上，那么这条路径中 J 到 K 的部分也是最优路径。

<details>
<summary>为什么最优路径的子路径也是最优的？</summary>

把 I 到 K 的路径拆成两段：

$$
I\xrightarrow{r_1}J\xrightarrow{r_2}K.
$$

假设存在从 J 到 K 的另一条路径 $r_2'$，满足：

$$
c(r_2')<c(r_2).
$$

将后半段替换后，就得到：

$$
c(r_1)+c(r_2')<c(r_1)+c(r_2),
$$

这与原路径最优矛盾。因此 $r_2$ 也是最优的。

</details>

### Sink Trees

固定一个目的节点，为各节点选择通向它的最短路径，可以形成以该目的节点为根的 **Sink Tree（汇聚树）**。沿树中的下一跳持续转发，就能到达目的地。

与之对应， **Source Tree（源树）** 固定一个出发点，表示从该点到其他节点的路径。

#### Example

**A Sink Tree for E**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109214727.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**以 E 为目的节点，求各节点到 E 的最短路径。**

图中的无向边及代价为：

```text
AB=4   AE=10
BC=2   BE=4   BF=3   BG=3
CD=2   CE=1   CH=3
DE=2   EF=2   FG=4
```

<details>
<summary>展开解答</summary>

| 起点 | 到 E 的一条最短路径 | 代价 |
| --- | --- | ---: |
| A | A → B → C → E | 7 |
| B | B → C → E | 3 |
| C | C → E | 1 |
| D | D → E | 2 |
| F | F → E | 2 |
| G | G → F → E | 6 |
| H | H → C → E | 4 |

例如，从 A 到 E 可以比较：

$$
\begin{aligned}
A\rightarrow E &: 10,\\
A\rightarrow B\rightarrow E &: 4+4=8,\\
A\rightarrow B\rightarrow C\rightarrow E &: 4+2+1=7,\\
A\rightarrow B\rightarrow F\rightarrow E &: 4+3+2=9.
\end{aligned}
$$

最优路径是 A → B → C → E，其中 B → C → E 也是 B 到 E 的最优路径，体现最优性原理。

G 有两条等代价最短路径：

$$
G\rightarrow F\rightarrow E:4+2=6,
$$

$$
G\rightarrow B\rightarrow C\rightarrow E:3+2+1=6.
$$

选定其中一条，就能构造相应的 **Sink Tree**，因此 **Sink Tree不一定唯一**。若同时保留所有等价路径，得到的结构可以是有向无环图。

在选定的树中，各节点只需保存“到 E 的下一跳”：A 选 B，B 选 C，C 选 E，依次传递即可。

</details>

### Dijkstra's Algorithm

Dijkstra 算法解决 **非负边权图上的单源最短路径问题**，可以用于有向图或无向图，采用贪心策略。

设源节点为 $s$：

- $D(v)$：当前已知从 $s$ 到 $v$ 的最短距离估计。
- $p(v)$：当前路径中 $v$ 的前驱。
- 已确定节点：最短距离已经固定。
- 未确定节点：距离仍可能更新。

#### Initialization and Relaxation

初始化：

$$
D(s)=0,\qquad D(v)=\infty\quad(v\ne s).
$$

每轮从 **所有未确定节点** 中，选择 $D(u)$ 最小的节点 $u$，将其确定，再更新其尚未确定的邻居。

**松弛（Relaxation）** 比较原有路径与经过 $u$ 的新路径：

$$
\boxed{D(v)\leftarrow\min\{D(v),\ D(u)+w(u,v)\}}.
$$

如果经过 $u$ 更短，同时令 $p(v)=u$。

```text
初始化距离和前驱
while 仍有可达的未确定节点：
    u = 所有未确定节点中 D 最小的节点
    将 u 标记为已确定
    对 u 的每个未确定邻居 v：
        若 D(u) + w(u,v) < D(v)：
            D(v) = D(u) + w(u,v)
            p(v) = u
```

**选择节点比较的是到源节点的累计距离；松弛操作才检查当前节点的邻居。**

<details>
<summary>为什么距离最小的未确定节点可以直接确定？</summary>

设本轮选择 $u$。假设还有一条到 $u$ 更短的路径，并令 $y$ 是这条路径上第一个尚未确定的节点。

$y$ 前面的节点已经确定，其边也已被松弛，所以 $D(y)$ 不会大于这条路径到 $y$ 的代价。由于后续边权非负，这个代价又不大于整条路径到 $u$ 的代价。

于是：

$$
D(y)<D(u),
$$

与“$u$ 是未确定节点中距离最小者”矛盾。因此 $D(u)$ 已经最优。

非负边权保证了后续路径不会通过负代价把总距离再降下来。

</details>

#### Example

**Shortest Paths from A**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109214919.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**仍使用 A–H 的加权图，以 A 为源节点，计算到所有节点的最短路径。**

<details>
<summary>展开：逐轮松弛与最终路径</summary>

初始时 $D(A)=0$，其他距离为 $\infty$。按 A、B、C、G、F、E、D、H 的顺序确定节点，得到下表。每行记录本轮松弛完成后的距离，A 的距离始终为 0。

| 本轮确定节点 | $D(B)$ | $D(C)$ | $D(D)$ | $D(E)$ | $D(F)$ | $D(G)$ | $D(H)$ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 初始化 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ |
| A | 4 | ∞ | ∞ | 10 | ∞ | ∞ | ∞ |
| B | 4 | 6 | ∞ | 8 | 7 | 7 | ∞ |
| C | 4 | 6 | 8 | 7 | 7 | 7 | 9 |
| G | 4 | 6 | 8 | 7 | 7 | 7 | 9 |
| F | 4 | 6 | 8 | 7 | 7 | 7 | 9 |
| E | 4 | 6 | 8 | 7 | 7 | 7 | 9 |
| D | 4 | 6 | 8 | 7 | 7 | 7 | 9 |
| H | 4 | 6 | 8 | 7 | 7 | 7 | 9 |

**1. 确定 A。** A 的邻居是 B、E：

$$
D(B)=4,\qquad D(E)=10.
$$

B 的暂定距离最小，下一轮选择 B。

**2. 确定 B。** 经过 B 更新 C、E、F、G：

$$
\begin{aligned}
D(C)&=4+2=6,\\
D(E)&=\min(10,4+4)=8,\\
D(F)&=4+3=7,\\
D(G)&=4+3=7.
\end{aligned}
$$

E 的前驱从 A 改成 B。下一轮选择距离为 6 的 C。

**3. 确定 C。** 更新 D、E、H：

$$
\begin{aligned}
D(D)&=6+2=8,\\
D(E)&=\min(8,6+1)=7,\\
D(H)&=6+3=9.
\end{aligned}
$$

E 的前驱再次改变，从 B 改成 C。

**4. 确定 G、F、E。** 此时三个节点的暂定距离都是 7，可以任意打破平局。按 G、F、E 的顺序处理：

$$
\begin{aligned}
G\rightarrow F &: 7+4=11>7,\\
F\rightarrow E &: 7+2=9>7,\\
E\rightarrow D &: 7+2=9>8.
\end{aligned}
$$

这些尝试都没有缩短距离。

**5. 确定 D、H。** 距离分别为 8、9，松弛后没有新的变化，算法结束。

最终最短路径为：

```text
A → B                  4
A → B → C              6
A → B → C → D          8
A → B → C → E          7
A → B → F              7
A → B → G              7
A → B → C → H          9
```

最短路径树包含：

$$
\{AB,BC,CD,CE,BF,BG,CH\}.
$$

**从 A 发往其余节点的下一跳均为 B。** A 虽然与 E 直连，但经 B、C 到 E 的总代价 7 小于直连代价 10。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215002.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

#### Implementation and Complexity

实现中，每个节点保存 `predecessor`、`length`、`label`，分别对应前驱、距离和暂定／永久标记。

这段实现从目的节点 `t` 开始，令其距离为 0，随后反向构建到 `t` 的最短路径，直到 `s` 被确定。在无向图中，可以据此得到 `s → t` 的路径。核心过程分成两段：

```text
第一段：用当前节点 k 松弛与它相邻、尚未确定的节点。
第二段：扫描全部尚未确定的节点，选 length 最小者作为新的 k。
```

第二段的扫描范围是全部未确定节点。仅在当前节点的邻居中选择，会改变算法。

简单实现每轮线性扫描，选择节点的总工作量为：

$$
n+(n-1)+\cdots+1=\frac{n(n+1)}2.
$$

连同松弛操作，时间复杂度为：

$$
\boxed{O(n^2)}.
$$

### **Oscillation** in **Link-State Routing**

如果链路代价随流量变化，选路会改变流量，变化后的流量又会改变下一轮选路，可能形成 **Routing Oscillation**。

#### Example

**Clockwise and Counterclockwise Routes**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215039.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**w 是接收节点；x、z 各产生 1 单位流量，y 产生 ε 单位流量。若一个方向上的链路代价等于该方向的流量，为什么路径会反复变化？**

<details>
<summary>展开：四个状态如何变化</summary>

**(a) 初始状态。** x 直接向 w 发送，z 也直接向 w 发送，y 的流量经 x 到 w：

$$
x\rightarrow w:1+\varepsilon,\qquad
z\rightarrow w:1,\qquad
y\rightarrow x:\varepsilon.
$$

没有使用的方向代价为 0。

**(b) x、y 改走顺时针方向。** x 看到另一条路径：

$$
x\rightarrow y\rightarrow z\rightarrow w,
$$

在更新前的代价下，其成本为 $0+0+1=1$，低于原先的 $1+\varepsilon$。y 也发现经 z 更便宜，于是二者转向 z 一侧。

改路后，新的流量为：

$$
x\rightarrow y:1,\qquad
y\rightarrow z:1+\varepsilon,\qquad
z\rightarrow w:2+\varepsilon.
$$

另一侧的 $x\rightarrow w$ 反而空了下来。

**(c) 改走逆时针方向。** 按新代价计算，x 直接去 w 的成本为 0；y 经 x 去 w 的成本为 0；z 经 y、x 去 w 的成本也为 0。因此流量转向 x 一侧：

$$
z\rightarrow y:1,\qquad
y\rightarrow x:1+\varepsilon,\qquad
x\rightarrow w:2+\varepsilon.
$$

**(d) 再次改走顺时针方向。** z 一侧又空了下来，下一轮重新选择顺时针路径，回到 (b) 的流量分布。

```text
某条路当前较空 → 大量流量转入 → 这条路代价升高
        ↑                         ↓
      再次转回 ← 原来的路空闲 ← 改走另一条路
```

**每次计算都能找到当前代价下的最短路径，连续运行却可能无法稳定。** 本例的关键是代价与流量耦合，并且多个节点同时响应这一变化。

</details>

### **Distance-Vector Routing**

**DV** 让节点与直接邻居交换“到各个目的地的距离”，再利用邻居的结果更新自己的距离。

它具有三个特点：

- **分布式**：各节点分别计算，只与直接邻居交换信息。
- **迭代式**：更新结果会继续影响邻居，重复计算直到稳定。
- **异步**：各节点无须同时执行，收到新信息就可以更新。

**LS** 使用完整拓扑计算； **DV** 使用“本地链路代价＋邻居通告的距离”计算。RIP 是 **DV** 的应用；BGP 采用相关的路径向量思想，后续再讨论它携带的路径信息。

#### Bellman-Ford Equation

设 $d_x(y)$ 是从节点 $x$ 到节点 $y$ 的最小路径代价，$N(x)$ 为 $x$ 的邻居集合，$c(x,v)$ 为直连链路的代价。

当 $y\ne x$ 时：

$$
\boxed{d_x(y)=\min_{v\in N(x)}\{c(x,v)+d_v(y)\}}.
$$

自身距离为 $d_x(x)=0$。

这个式子把一条路径分成两部分：**先走到某个邻居，再从该邻居走到目的地。** 枚举所有可能的第一跳，取总成本最小者。

#### Example

**The Least-Cost Path from u to z**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215119.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**求 u 到 z 的最小代价及下一跳。** u 的三个邻居为 x、v、w，已知：

$$
c(u,x)=1,\qquad c(u,v)=2,\qquad c(u,w)=5,
$$

$$
d_x(z)=3,\qquad d_v(z)=5,\qquad d_w(z)=3.
$$

<details>
<summary>展开解答</summary>

先看邻居到 z 的距离：

- x → y → z：$1+2=3$。
- v → x → y → z：$2+1+2=5$。
- w → y → z：$1+2=3$，小于 w → z 的直连代价 5。

枚举 u 的第一跳：

$$
\begin{aligned}
d_u(z)
&=\min\{c(u,x)+d_x(z),\ c(u,v)+d_v(z),\ c(u,w)+d_w(z)\}\\
&=\min\{1+3,\ 2+5,\ 5+3\}\\
&=\boxed{4}.
\end{aligned}
$$

下一跳选 x，完整路径为：

$$
\boxed{u\rightarrow x\rightarrow y\rightarrow z}.
$$

计算时先列出当前节点的直接邻居，再对每个邻居计算“走到它的成本＋它报告的剩余成本”。

</details>

#### Distance Estimates and Local State

算法运行过程中，节点掌握的是当前估计值，用大写 $D$ 表示：

$$
D_x(y)=\text{x 当前估计的到 y 的最短距离}.
$$

把到所有目的地的估计值按固定顺序排在一起，就是 **距离向量**：

$$
\mathbf D_x=(D_x(y):y\in V).
$$

**$D_x(y)$ 是一个标量，$\mathbf D_x$ 才是整个向量。** 小写 $d_x(y)$ 表示真正的最短距离；在网络稳定并完成信息传播后，希望 $D_x(y)$ 收敛到 $d_x(y)$。

节点 x 需要维护：自己与各邻居之间的链路代价、自己的距离向量，以及各邻居最近通告的距离向量。还要记录每个目的地对应的下一跳，才能用于转发。

#### Initialization and Updates

初始化时：

$$
D_x(y)=
\begin{cases}
0,&y=x,\\
c(x,y),&y\text{ 是直连邻居},\\
\infty,&\text{其他目的地}.
\end{cases}
$$

尚未收到的邻居向量标为未知。随后，x 将自己的距离向量发给全部邻居。

以下两类事件会触发重新计算：

1. 与某个邻居的直连链路代价变化。
2. 收到某个邻居的新距离向量。

收到通告后，先保存邻居的最新向量，再对各目的地计算：

$$
\boxed{D_x(y)\leftarrow\min_{v\in N(x)}\{c(x,v)+D_v(y)\}},\qquad y\ne x.
$$

若自己的距离向量改变，就把新向量发送给邻居；没有改变，就不因本次计算发送新的变化通告。

```text
收到新向量／发现本地链路变化
              ↓
保存新信息，重新计算到各目的地的最小代价
              ↓
        自己的向量改变了吗？
          是             否
          ↓              ↓
     通知全部邻居      等待下一事件
```

这里要 **重新计算最小值**。链路恶化后，正确距离可以变大，不能只接受比旧值更小的结果。

没有新变化需要传播时，算法进入 **Quiescent State（静止状态）**。节点仍然保留对后续事件的响应能力。

#### Example

**A Three-Node Network**


**三个节点 x、y、z 的链路代价为 2、1、7。逐轮交换距离向量，直到稳定。**

```text
       y
      / \
     2   1
    /     \
   x───7───z
```

下文所有向量都按 **(到 x，到 y，到 z)** 的顺序排列。

<details>
<summary>展开：初始化、第一次交换与第二次交换</summary>

**初始状态。** 每个节点只知道自己到各节点的直接代价：

$$
\mathbf D_x=(0,2,7),\qquad
\mathbf D_y=(2,0,1),\qquad
\mathbf D_z=(7,1,0).
$$

此时 x 的本地表可写为：

```text
所记录的向量来自      到 x   到 y   到 z
x                    0      2      7
y                    ?      ?      ?
z                    ?      ?      ?
```

**行表示向量由谁通告，列表示该向量的目的地。** y、z 两行在收到通告前未知，不能提前填入全网最终结果。

**第一次交换：x 收到 y、z 的初始向量。**

$$
\begin{aligned}
D_x(y)&=\min\{2+0,\ 7+1\}=2,\\
D_x(z)&=\min\{2+1,\ 7+0\}=3.
\end{aligned}
$$

因此 x 的向量从 $(0,2,7)$ 改为 $(0,2,3)$，到 z 的下一跳改为 y。

**y 收到 x、z 的初始向量。**

$$
\begin{aligned}
D_y(x)&=\min\{2+0,\ 1+7\}=2,\\
D_y(z)&=\min\{2+7,\ 1+0\}=1.
\end{aligned}
$$

y 的向量仍为 $(2,0,1)$，没有变化。

**z 收到 x、y 的初始向量。**

$$
\begin{aligned}
D_z(x)&=\min\{7+0,\ 1+2\}=3,\\
D_z(y)&=\min\{7+2,\ 1+0\}=1.
\end{aligned}
$$

z 的向量从 $(7,1,0)$ 改为 $(3,1,0)$，到 x 的下一跳改为 y。

三轮状态汇总如下：

| 状态 | $\mathbf D_x$ | $\mathbf D_y$ | $\mathbf D_z$ | 本轮之后的变化通告 |
| --- | --- | --- | --- | --- |
| 初始化 | (0, 2, 7) | (2, 0, 1) | (7, 1, 0) | 三个节点都发送初始向量 |
| 第一次交换后 | (0, 2, 3) | (2, 0, 1) | (3, 1, 0) | x、z 发送；y 不发送 |
| 第二次交换后 | (0, 2, 3) | (2, 0, 1) | (3, 1, 0) | 没有新的变化通告 |

**第二次交换。** x、z 通知邻居自己的新结果。例如 y 再次计算：

$$
D_y(x)=\min\{2+0,1+3\}=2,
$$

$$
D_y(z)=\min\{2+3,1+0\}=1.
$$

其余节点重新计算后也不再改变，网络进入 **Quiescent State**。

注意，第一次交换完成后，x 已经算出自己的新向量 $(0,2,3)$，但缓存的 z 向量仍是旧的 $(7,1,0)$；到第二次交换时，才得到 z 的新向量 $(3,1,0)$。

最终：x 到 z 走 x → y → z，z 到 x 走 z → y → x，代价均为 3。

这里按“轮”展示信息传播；异步执行时，各节点收到和处理通告的时间可以不同。

</details>

### The **Count-to-Infinity** Problem

**DV** 的一个重要问题是 **坏消息可能传播很慢**。邻居通告一个距离时，通常不附带完整路径，接收方无法直接知道自己是否位于这条路径上。

#### Example

**A Chain of Five Routers**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215507.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**网络为 A—B—C—D—E，各链路代价均为 1。比较 A 恢复和 A 故障时，其余节点到 A 的距离怎样变化。**

<details>
<summary>展开：A 恢复后，好消息逐跳传播</summary>

初始时 A 不可用，B、C、D、E 到 A 的距离都为 $\infty$。A 恢复后：

| 交换轮数 | B 到 A | C 到 A | D 到 A | E 到 A |
| --- | ---: | ---: | ---: | ---: |
| 初始 | ∞ | ∞ | ∞ | ∞ |
| 1 | 1 | ∞ | ∞ | ∞ |
| 2 | 1 | 2 | ∞ | ∞ |
| 3 | 1 | 2 | 3 | ∞ |
| 4 | 1 | 2 | 3 | 4 |

B 首先发现可达的直连 A；C 收到 B 的通告后得到 $1+1=2$；D 再得到 $1+2=3$；最后 E 得到 $1+3=4$。

每轮向外推进一跳，较短的可达路径逐步传播。

</details>

<details>
<summary>展开：A 故障后，距离为什么越算越大？</summary>

网络最初已经收敛：

$$
(D_B(A),D_C(A),D_D(A),D_E(A))=(1,2,3,4).
$$

现在 A 故障，或 A—B 断开。B 发现直连路径失效，但缓存中 C 仍报告“我到 A 的距离是 2”。B 于是计算：

$$
D_B(A)=1+D_C(A)=1+2=3.
$$

B 选择 C 为下一跳，而 C 原来的路径是 C → B → A，于是形成：

$$
B\rightarrow C\rightarrow B\rightarrow\cdots
$$

随后 C 收到 B 的新距离 3，又把自己到 A 的距离改为 $1+3=4$。B 再收到 C 的 4，就变成 5。其他节点也受到影响。

按每轮使用上一轮邻居通告的方式计算：

| 交换轮数 | B 到 A | C 到 A | D 到 A | E 到 A |
| --- | ---: | ---: | ---: | ---: |
| 故障前 | 1 | 2 | 3 | 4 |
| 1 | 3 | 2 | 3 | 4 |
| 2 | 3 | 4 | 3 | 4 |
| 3 | 5 | 4 | 5 | 4 |
| 4 | 5 | 6 | 5 | 6 |
| 5 | 7 | 6 | 7 | 6 |
| 6 | 7 | 8 | 7 | 8 |

例如第三轮中，D 对比两个邻居：

$$
D_D(A)=\min\{1+D_C(A),\ 1+D_E(A)\}
=\min\{1+4,1+4\}=5.
$$

明明已经不存在到 A 的路径，节点却持续相信邻居给出的旧信息，距离逐步增加，这就是 **Count-to-Infinity**。

**B 已经发现直连故障；出错的是它把 C 通告的旧路径当成了有效替代路径。** 使用有限的“无穷大”阈值，可以让这种增长最终结束，但不能消除中间的错误路由过程。

</details>

### **Link-State** and **Distance-Vector** Compared

| 比较项 | **LS** | **DV** |
| --- | --- | --- |
| 传播的内容 | 本地链路状态 | 到各目的地的距离估计 |
| 信息交换范围 | 链路状态传播到路由范围内的各节点 | 只向直接邻居发送向量 |
| 节点计算依据 | 完整拓扑与链路代价 | 本地链路代价及邻居向量 |
| 主要计算 | Dijkstra，简单实现 $O(n^2)$ | Bellman-Ford 更新，多轮迭代 |
| 消息开销 | n 个节点、E 条链路时，一轮完整泛洪约 $O(nE)$ | 总量取决于更新次数和收敛过程 |
| 典型问题 | 流量相关代价可能引起振荡 | 路由环路与 **Count-to-Infinity** |

**鲁棒性。** **LS** 中，错误节点可能通告错误链路代价，但每个节点独立计算自己的路由。 **DV** 中，某节点算出的路径距离会直接成为邻居下一轮计算的输入，错误结果可能在迭代中继续传播。

二者都需要处理错误信息。 **LS** 的 $O(n^2)$ 是本地计算复杂度，$O(nE)$ 是消息数量级，不能混为同一个指标。

### **Hierarchical Routing**

当网络很大时，每台路由器都保存每个远端节点的详细信息，会使路由表和更新开销不断扩大。

**Hierarchical Routing** 把网络划分成区域：本区域内部保留详细路由；对外部区域只保留汇总后的到达方式。进一步扩大时，还可以把区域组成更高层的簇。

#### Example

**Five Regions**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215540.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**以 1A 为例，采用Hierarchical Routing后，表项如何变化？会损失什么信息？**

<details>
<summary>展开解答</summary>

五个区域分别包含 3、4、2、3、5 台路由器，共：

$$
3+4+2+3+5=17.
$$

按图中包含自身的统计口径，1A 的完整表有 17 项。 **Hierarchical Routing** 保留本区域的 1A、1B、1C，再给区域 2、3、4、5 各保留一项，共：

$$
\boxed{3+4=7\text{ 项}}.
$$

层次表为：

```text
目的地       下一跳       图示跳数
1A             —            —
1B            1B            1
1C            1C            1
区域 2        1B            2
区域 3        1C            2
区域 4        1C            3
区域 5        1C            4
```

发往区域 2 的分组统一先交给 1B；发往区域 3、4、5 的分组统一先交给 1C。到达相应区域后，再使用该区域内部的路由信息。

区域表项的跳数表示图中的区域到达成本。例如“区域 5，4 跳”可以到达 5A，不代表区域 5 中每台路由器都只需要 4 跳。

**缩表的代价是可能失去全局最短路径。** 完整表中，1A 到 5C 选择 1B，存在：

$$
1A\rightarrow1B\rightarrow2A\rightarrow2B\rightarrow2D\rightarrow5C,
$$

共 5 跳。汇总为“整个区域 5 都经 1C”后，可以走：

$$
1A\rightarrow1C\rightarrow3B\rightarrow4A\rightarrow5A\rightarrow5B\rightarrow5C,
$$

共 6 跳。把区域内部细节隐藏起来，降低了信息维护成本，也可能增加路径长度。

</details>

#### Autonomous Systems and Gateway Routers

**Autonomous System（自治系统，AS）** 可以作为互联网路由的分层单位。 **AS** 内部运行内部路由协议，不同 **AS** 可以采用不同的内部协议。

连接其他 **AS** 的路由器称为 **网关路由器（Gateway Router）**。在上面的区域模型中，1B 通向区域 2，1C 通向区域 3，承担区域出口的作用。

**AS** 内部还可以继续分层。例如 OSPF 可以将一个 **AS** 划分成多个 Area，Area 0 是骨干区域。**AS 与 OSPF Area 属于不同层次。**

在 **Hierarchical Routing** 的理想模型中，最优层次数约为 $\ln N$，每台路由器约需 $e\ln N$ 个表项。其意义是：网络规模增加时，多级汇总能显著减缓路由表的增长。

### Broadcast Routing

**广播（Broadcast）** 要把源节点发出的分组送到指定网络范围内的所有其他节点。关键问题是：既要覆盖全部节点，又要避免同一个分组被不断复制。

#### Multiple Unicasts and Flooding

一种直接办法是由源节点 **给每个目的地分别发送一个单播副本**。它不要求网络提供专门的广播机制，但源节点需要知道全部目的地，而且公共路径上会重复传送相同内容。

**泛洪（Flooding）** 则由沿途节点复制分组：收到分组后，除到达接口外，向其他相邻接口各发送一个副本。

```text
源节点向邻居发送
        ↓
邻居分别向其他邻居复制
        ↓
副本继续传播到更远的节点
```

网络有环路时，同一个副本可能绕一圈回来，再次被复制。没有相应限制，就会形成大量重复分组，造成 **Broadcast Storm（广播风暴）**。

**逐目的地单播要求源知道接收者列表；泛洪只要求各节点知道自己的邻居。** 两者都会产生冗余，但复制发生的位置不同。

#### Sequence-Number-Controlled Flooding

为每个广播分组附加：

$$
\boxed{(\text{源地址},\text{广播序号})}.
$$

每个节点记录已经处理的标识对。新分组到达时，先查记录：处理过就丢弃；未处理过就先记录，再向其他邻居转发。

源地址用于区分不同发送者，序号用于区分同一发送者先后产生的广播。

这种方法使每个节点对同一个广播只执行一次复制，阻止无限传播。**重复副本仍可能抵达节点，只是不会再被继续转发。**

#### **Reverse Path Forwarding (RPF)**

**RPF** 利用现有单播路由判断广播分组的到达方向。

收到源地址为 S 的广播分组时，路由器检查：**如果我向 S 单播，会从哪个接口出去？**

- 分组恰好从这个接口到达：通过检查，向其余接口复制转发。
- 从其他接口到达：丢弃，不再继续转发。

$$
\boxed{\text{接收接口}=\text{单播到源地址的输出接口}}
$$

满足这个条件才通过 **RPF** 检查。这里查的是 **广播源地址** 的反向路由。

好处是可以复用单播路由信息，无须为每个广播分组保存已经见过的序号记录。判据基于接口方向，不能简单用“第一个到达的副本”代替。

#### Example

**A Broadcast from A**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215610.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**A 发起广播。哪些副本能够继续转发，哪些在接收节点处被丢弃？**

<details>
<summary>展开：逐节点检查反向路径</summary>

按图示的单播路由，各节点朝向 A 的下一跳为：

```text
B → A       C → A
D → B       E → C       F → C
G → D
```

因此，通过检查并用于向下传播的方向为：

```text
A → B → D → G
└→ C → E
     └→ F
```

**B 的判断。** 来自 A 的副本通过检查，B 将它发往 C、D；若之后收到 C 发来的副本，由于 B 单播到 A 应走 A 接口，就把这个副本丢弃。

**C 的判断。** 来自 A 的副本通过检查，C 向 B、E、F 复制；来自 B 的副本被丢弃。

**D 的判断。** 接受来自 B 的副本，并向 E、G 转发。来自 E 的副本被丢弃。

**E、F 的判断。** 两者朝 A 的下一跳都是 C，因此都接受来自 C 的副本。E、F 之间互相发送的副本会被对方丢弃；E 与 D 之间的交叉副本同样被丢弃。

G 接受来自 D 的分组，已经没有其他邻居需要转发。

图中带灰色短条的箭头表示：**副本已经经过链路传到了接收路由器，但在那里被丢弃，后续不再传播。**

本图有 6 次成功向新节点传播的发送，另有 B↔C、D↔E、E↔F 上的 6 次冗余发送，共 12 次。 **RPF** 控制了后续传播，仍没有消除这些链路上的额外传输。

</details>

#### Spanning-Tree Broadcast

**Spanning Tree（生成树）** 包含网络中的全部节点且没有环路。若广播只沿树边传播，每个节点就能收到一份分组，无须在其他边上发送副本。

源节点向它的所有树上邻居发送；其他节点接收后，向 **除接收方向以外的树上邻居** 继续转发。

一棵有 $n$ 个节点的 **Spanning Tree** 具有 $n-1$ 条边，因此一次完整广播只需：

$$
\boxed{n-1\text{ 次链路传输}}.
$$

各节点无须保存整棵树，只需知道自己的哪些接口属于树。主要开销转移到 **Spanning Tree的建立与维护**。

#### Center-Based Tree Construction

**基于中心的建树方法** 先选择一个中心节点，也称 **Rendezvous Point（会合点）** 或核心（Core）。

希望加入的节点向中心发送单播 `Tree-Join` 消息，沿已有单播路由前进。消息到达中心，或到达已经属于树的节点时，便把此次经过的路径接到树上，称为 **嫁接（Grafting）**。

#### Example

**Building a Tree Rooted at E**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215624.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**选择 E 为中心，依次让其他节点加入，说明最终Spanning Tree如何形成。**

<details>
<summary>展开解答</summary>

**1. F 加入。** F 直接向 E 发送加入消息，新增边 EF。

**2. B 加入。** B 到 E 的单播路径经 D，因此消息走：

$$
B\rightarrow D\rightarrow E.
$$

把 BD、DE 两条边接入树，D 也随这条路径加入。

**3. A 加入。** A 到 E 的单播路径经 B。加入消息到达 B 时，B 已经在树中，所以只需新增 AB，无须重复添加 B → D → E。

**4. C 加入。** C 直接向 E 发送加入消息，新增 CE。

**5. G 加入。** G 向 E 发送的加入消息先到 D；D 已在树中，因此新增 GD。

最终树边为：

$$
\boxed{\{EF,DE,BD,AB,CE,DG\}}.
$$

7 个节点恰好使用 6 条边。假设现在由 A 广播，分组会先经过 A → B → D；D 向 E、G 分支，E 再向 C、F 分支。每条树边传输一次。

**中心 E 用于建树，广播源可以是其他节点。** 图中仍然存在的非树边，不参与这次 **Spanning Tree** 广播。

</details>

### Multicast Routing

**多播／组播（Multicast）** 把分组发送给某个指定接收组的成员。例如 Web 缓存更新和交互式游戏中，只需要让相关节点接收数据。

它需要解决两个问题：**哪些主机属于接收组，以及如何用一个目的地址表示这个组。**

共享路径上的分组可以先只传一份，在不同接收分支分开的位置再复制。多播路由负责建立连接发送者与接收者的分发结构。

#### Source-Based Trees

**Source-Based Tree（基于源的树）** 为每个发送源分别建立分发树。不同源到各接收者的路径可能不同，因此树也可能不同。

可以利用 **RPF** 形成从源向外的传播结构，再进行 **剪枝（Pruning）**：删除下游没有组成员的分支，只保留到达接收者所需的路径。

这种方法能够围绕各个源选择路径；发送源增多时，需要维护更多树状态。

#### Group-Shared Trees

**Group-Shared Tree（组共享树）** 让同一多播组共享一棵树，通常围绕选定中心建立。

连接组成员的边缘路由器向中心发送加入消息。沿途路由器加入分发结构，后续把多播数据转交给这些边缘路由器，再送到主机。

它复用了前面的中心建树与嫁接方法，不过只需要覆盖有组成员的分支。共享树减少逐源建树的状态，但某个源沿共享树到接收者的路径未必最短。

**Source Tree按发送源区分；共享树按接收组共享。**

#### Group Membership and Multicast Routing

IPv4 使用 D 类多播地址标识接收组。互联网多播由两个部分配合完成：

**IGMP（Internet Group Management Protocol）** 管理主机与其本地多播路由器之间的组成员关系，使路由器知道某条接入链路上有没有组成员。

**多播路由协议** 在路由器之间建立分发路径，把数据送到存在组成员的网络。

IGMP 消息封装在 IP 数据报中，对应的 IP Protocol 值为 **2**。在组成员管理过程中，主要关注三类动作：

- **查询**：路由器发送 Membership Query，询问所连接网络上的成员情况。
- **报告**：主机使用 Membership Report 报告自己的组成员关系。
- **离开**：通知退出，或通过后续查询、响应与超时更新成员状态。

这里按功能理解查询、报告和离开，具体报文类型取决于 IGMP 版本。

#### **Distance Vector Multicast Routing Protocol (DVMRP)** and **Protocol Independent Multicast (PIM)**

**DVMRP** 使用 **Source-Based Tree**，结合 **RPF** 与剪枝，把没有接收者的分支去掉。

**PIM** 主要区分两类分布：

**密集模式（Dense Mode）**：接收者分布较密，采用先泛洪、再剪枝的思路。

**稀疏模式（Sparse Mode）**：接收者分布较稀疏，使用 **Rendezvous Point** 组织分发树，让需要接收的分支加入。

### Anycast Routing

**任播（Anycast）** 让多个服务实例使用同一个服务地址。发往这个地址的分组，由路由系统送到其中一个合适的实例。

```text
单播：送到一个指定目的地。
广播：送到网络范围内的所有节点。
多播：送到指定组中的所有接收者。
任播：送到多个候选实例中的一个。
```

任播适合“获得所需服务即可，不要求由某一台特定机器提供”的情形，例如时间服务、DNS 和内容分发。

#### Example

**Multiple Destinations Named 1**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215651.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**若多个服务节点都使用地址 1，普通路由算法为什么能够把分组送到较近的一个？**

<details>
<summary>展开解答</summary>

在图 (a) 中，多个目的节点都标为 1，其他节点可以分别沿路径到达其中一个。

对距离向量算法来说，来自不同邻居的通告都声称可以到达“目的地 1”。节点比较：

$$
D_x(1)=\min_{v\in N(x)}\{c(x,v)+D_v(1)\},
$$

选择代价最低的下一跳即可。不同节点可能选择不同的服务实例。

图 (b) 把多个标为 1 的终点在路由视角下表示成同一个逻辑目的地，帮助说明：**路由算法只需寻找通向地址 1 的较优路径，无须先指定某台物理服务器。** 这些服务器在物理上仍然位于不同位置。

因此，已有的距离向量或链路状态方法可以支持这种寻址思路。

</details>

实际跨网络部署时，多个站点还需要通告这个共同地址或前缀，例如通过 BGP。仅在服务器上配置相同地址，不能让远端网络自动知道如何到达它。

“最近”由路由所使用的代价与策略决定，不能直接等同于地理距离最近。分布在不同网络中的实例可以共同服务同一地址，也有助于分散流量及部分攻击流量；任播本身不保证任何攻击都能被抵御。

## The Network Layer in the Internet

### A Common Internetwork Layer

不同网络的帧格式、地址和传输方式可能不同。连接它们有两种基本思路：

**逐种转换**：为不同类型网络设计转换机制，把一种网络的分组转换成另一种网络的格式。

**建立共同层**：在不同底层网络上使用统一协议，让每个网络负责承载共同的网络层分组。

IP 采用共同层的思路，提供路由器可以识别的统一数据报格式，屏蔽不同底层网络的差异。

```text
             统一的 IP 数据报与地址体系
                         ↓
      Ethernet、Wi-Fi 等不同底层网络分别承载
```

IP 有 IPv4、IPv6 两个版本；同时实现两套协议的节点具有 **Dual Stack（双协议栈）**。

### Internet Network-Layer Components

互联网网络层相关机制分成三组：

**IP 协议**：规定数据报格式和网络层寻址，支持分组传递。

**控制与辅助协议**： **Internet Control Message Protocol（互联网控制报文协议，ICMP）**、 **Dynamic Host Configuration Protocol（动态主机配置协议，DHCP）**、ARP 等，分别协助错误报告、地址配置和地址解析。

**路由协议**：RIP、OSPF、BGP 等，交换路由信息，形成转发所需的路径。

前面的最短路径算法解释了路径如何计算；接下来需要读懂真正沿这些路径传输的 IP 数据报。

### The IPv4 Datagram

**IPv4 数据报由首部和数据部分组成。首部有 20 字节固定部分，以及可变长度的可选部分。** 图中每行宽 32 bit，即 4 字节。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215724.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

```text
IPv4 数据报 = 固定首部 20 B + 可选部分 + 数据部分
```

网络字节序采用 **Big-Endian（大端序）**：多字节数值的高位字节在前。阅读首部图时按从左到右、从上到下的顺序对应字段。

#### Version and Header Length

**Version** 占 4 bit，指出 IP 版本；IPv4 的值为 4。

**IHL（Internet Header Length）** 占 4 bit，表示首部包含多少个 32-bit 字：

$$
\boxed{\text{首部字节数}=4\times\mathrm{IHL}}.
$$

IHL = 5 对应 20 字节，表示只有固定首部；IHL > 5 表示还包含可选部分。

**读取十六进制首部时，要区分字段的数值与字段所用的单位。** IHL 的单位是 4 字节。

#### Differentiated Services and Total Length

**Differentiated Services** 用于标记分组所需的服务处理。

**Total Length** 表示整个 IPv4 数据报的长度，包括首部和数据。由它与 IHL 可以计算数据部分长度：

$$
\boxed{\text{数据部分字节数}=\mathrm{Total\ Length}-4\times\mathrm{IHL}}.
$$

这里的“数据部分”是交给上层处理的内容，其中可以包含 TCP 或 UDP 首部。

#### Fragmentation-Related Fields

第二行的 **Identification、DF、MF、Fragment Offset** 与分片有关，分别涉及原始数据报的识别、是否允许分片、后续是否还有分片，以及分片在原始数据中的位置。

读图时先把这几个字段归为同一组，区分它们与总长度、首部长度的作用。

#### **Time to Live (TTL)**

**TTL** 限制分组在网络中的持续转发。每经过一台路由器， **TTL** 减 1；减到 0 时，路由器丢弃分组，并向源端报告相应错误。

因此，即使出现路由环路，分组也不会一直绕圈。沿途路由器返回的 **ICMP** 错误信息，也是 traceroute／tracert 探测路径所利用的机制。

#### Protocol

**Protocol** 标识数据部分应该交给哪一种上层协议处理。例如：

```text
6  → TCP
17 → UDP
2  → IGMP
```

结合前面的多播部分可以看出，Protocol 字段能够标识运输层协议，也能标识直接封装在 IP 中的其他协议。

**Protocol 区分 IP 所承载的协议；TCP／UDP 的端口号进一步区分应用端点。**

#### **Header Checksum** and Addresses

**Header Checksum** 用于检查 IPv4 首部。路由器转发时会修改 **TTL**，因此必须相应更新 **Header Checksum**。

**Source Address、Destination Address** 分别保存源、目的 IPv4 地址，各占 **32 bit**。

读一段 IPv4 首部时，重点是把字段解释连起来：从 Version 判断版本，从 IHL 找到数据开始的位置，从 Total Length 算出数据大小，从 Protocol 判断承载的协议，再结合 **TTL** 和 **Checksum（校验和）** 理解沿途路由器的处理。

#### Header Limits and Service Marking

IHL 的最大值为 $2^4-1=15$，因此首部最长为 $15\times4=60$ B，可选部分最多为 $60-20=40$ B。

Total Length 占 16 bit，以 **字节** 为单位，最大值为：

$$
2^{16}-1=65535\ \mathrm{B}.
$$

使用 20 B 首部时，最大数据部分为：

$$
65535-20=65515\ \mathrm{B}.
$$

**IP 数据报总长度、IP 数据部分长度、链路 Maximum Transmission Unit（最大传输单元，MTU） 要分开计算。** 以太网常见 **MTU** 为 1500 B，承载的是整个 IP 数据报，因而通常还要从中扣除 IP 首部。

区分服务字段共 8 bit：高 6 位标记服务类别，低 2 位用于 **Explicit Congestion Notification（显式拥塞通知，ECN）**。实时语音关心较低时延，文件传输更关心完整交付，可以采用不同的服务处理。

#### Computing the **Header Checksum**

**Header Checksum** 占 16 bit，只检查 IPv4 首部。计算时，将 **Checksum** 字段暂置为 0，把首部按 16 bit 分组，使用反码加法求和，再按位取反。

```text
校验和字段置 0
    ↓
每 16 bit 作为一个数相加；最高位进位回加到最低位
    ↓
对最终 16-bit 和取反，填入校验和字段
```

接收方可以重新计算并与报文携带值比较，也可以把 **Checksum** 字段一起相加：无误时，反码和为 `0xFFFF`，再取反为 `0x0000`。

**“校验结果为 0”与“首部中的Checksum字段为 0”是两件事。** 转发时 **TTL** 改变，需要更新 **Checksum**；可选字段发生变化时也一样。

#### Options

可选部分放在固定首部之后，并填充到 4 B 的整数倍。几种典型选项的用途为：

| 选项 | 含义 |
| --- | --- |
| Security | 标记信息的保密级别 |
| Strict Source Routing | 指定需要严格遵循的完整路径 |
| Loose Source Routing | 指定必须依次经过的节点，其间可以经过其他路由器 |
| Record Route | 让沿途路由器记录自己的 IP 地址 |
| Timestamp | 记录沿途地址及时间戳 |

可选部分结束后，就是 IPv4 的数据部分；没有可选部分时，数据紧接在 20 B 固定首部之后。

### Packet Fragmentation

不同链路允许承载的最大分组长度不同。 **MTU** 限制一个网络层分组在该链路上能有多大。

以太网常见 **MTU** 为 1500 B；802.11 的例子给出加密前帧体上限 2304 B。IPv4 自身允许的数据报可以大得多，因此分组可能无法直接通过下一条链路。

有两种处理思路：**源端先获知路径允许的大小，发送合适长度的分组；或在必要时将分组拆成多个分片。** 每个分片都携带自己的 IP 首部，独立进行转发。

#### Transparent and **Nontransparent Fragmentation**

**Transparent Fragmentation（透明分片）**：分组进入某个网络时被分片，离开该网络前重新组装。下一段网络需要时，再重新分片。

```text
大分组 → 入口 G₁ 分片 → 网络 1 → 出口 G₂ 重组
      → 入口 G₃ 再分片 → 网络 2 → 出口 G₄ 再重组
```

出口必须等到属于同一分组的全部分片，才能重组；所有分片也必须经过同一个出口。重复分片和重组增加处理及等待开销。

**Nontransparent Fragmentation**：中间路由器不重组，分片一直传到目的主机，最后统一重组。IPv4 采用这种方式，减轻中间路由器的负担。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116154136.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116154233.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Identification, Flags, and Offset

**Identification** 占 16 bit。同一原始数据报产生的分片使用相同标识，帮助接收方把分片归组。

3 位 Flags 包含一个保留位，以及两个分片标志：

- **DF（Don't Fragment）**：1 表示禁止分片。
- **MF（More Fragments）**：1 表示后面还有分片；0 表示没有后续分片。

**Fragment Offset** 占 13 bit，表示该片数据在 **原始数据部分** 中的起始位置，单位为 **8 B**：

$$
\boxed{\text{字节偏移}=8\times\text{Fragment Offset}}.
$$

偏移不计算每片新增的 IP 首部。除最后一片外，各片的数据长度必须为 8 B 的整数倍，才能让下一片的起点用这个字段表示。最后一片的数据长度可以不是 8 的倍数。

13 位偏移可表示 $0\sim8191$，共 8192 个偏移单位位置。实际分片数量还受原始数据长度与分片大小约束。

#### Fragment Size Calculation

设下一条链路的 **MTU** 为 $M$，每片首部长度为 $H$，原始数据报总长为 $T$。原始数据长度为：

$$
P=T-H.
$$

按尽可能装满的方式分片时，非末片最多承载：

$$
\boxed{L=8\left\lfloor\frac{M-H}{8}\right\rfloor\ \mathrm{B}}.
$$

先减首部，再向下取到 8 的倍数。第 $i$ 片的偏移为它前面所有 **数据字节数之和除以 8**；每片总长度则是本片数据长度加本片首部。

#### Example

**Fragmenting a 4000-Byte Datagram**

**一个 IPv4 数据报总长 4000 B，首部 20 B，标识为 777，要经过 MTU = 1500 B 的链路。求分片数量，以及每片的数据长度、总长度、偏移和 MF。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116154407.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

原始数据部分为：

$$
P=4000-20=3980\ \mathrm{B}.
$$

每个非末片最多承载：

$$
L=8\left\lfloor\frac{1500-20}{8}\right\rfloor
=8\times185=1480\ \mathrm{B}.
$$

分成三片：

$$
3980=1480+1480+1020.
$$

| 分片 | 数据在原始数据中的范围 | 数据长度 | IP 总长度 | Offset | MF |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | 第 0–1479 字节 | 1480 B | 1500 B | 0 | 1 |
| 2 | 第 1480–2959 字节 | 1480 B | 1500 B | 185 | 1 |
| 3 | 第 2960–3979 字节 | 1020 B | 1040 B | 370 | 0 |

偏移分别为：

$$
0,\qquad \frac{1480}{8}=185,\qquad
\frac{1480+1480}{8}=370.
$$

三个分片的 Identification 都是 **777**；允许这次分片时 DF 为 0。第三片的 1020 B 数据无须再凑成 8 的倍数。

**每片都新增自己的首部。** 三片合计发送的 IP 字节数为：

$$
1500+1500+1040=4040\ \mathrm{B},
$$

比原来的 4000 B 多出两个 20 B 首部。原始数据本身仍然只有 3980 B。

目的主机按标识归组、按偏移摆放数据，并由末片位置与长度确定原始数据的末端。收到 MF = 0 的分片后，仍需等其余位置的数据齐全，才能重组。

</details>

#### Path **MTU** Discovery

**路径 MTU（Path MTU）** 是整条路径上各链路 **MTU** 的最小值，决定一个分组在该路径上不分片时的最大长度。

IPv4 路径 **MTU** 发现利用 DF：源端发送禁止分片的数据报；某台路由器发现它超过输出链路的 **MTU**，就丢弃并返回 **ICMP** 差错，源端再调整发送大小。

#### Example

**From 1400 Bytes to 900 Bytes**

**源端先发送 1400 B 的分组，沿途先遇到只能通过 1200 B 的链路，再遇到只能通过 900 B 的链路。发送大小如何调整？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116154452.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

第一次发送 1400 B，在第一处瓶颈被拒绝，收到“尝试 1200 B”的反馈。

第二次发送 1200 B，可以通过第一处瓶颈，但在下一处被拒绝，收到“尝试 900 B”的反馈。

第三次发送 900 B，可以通过这两条链路：

$$
1400\longrightarrow1200\longrightarrow900.
$$

该例最终发现的路径 **MTU** 为 900 B。源端随后直接发送合适大小的分组，减少中间分片及目的端重组的需要。

代价是启动阶段可能经历多次往返探测。路由或链路 **MTU** 改变后，可能需要重新调整。

</details>

### IPv4 Addressing

IPv4 地址长 **32 bit**，用于标识网络接口。一个路由器连接多个子网，其相应接口需要配置各自的地址。

IP 地址具有层次结构：高位是 **网络前缀**，低位是 **主机部分**。 **Medium Access Control（介质访问控制，MAC）** 地址本身不提供这种网络位置层次。

#### Dotted Decimal and Hexadecimal Notation

点分十进制把 32 bit 分成四个 8-bit 组，每组写成 $0\sim255$ 的十进制数。十六进制则用两个数字表示一个字节。

#### Example

**Converting 128.208.2.151**

**把 `128.208.2.151` 写成十六进制字节序列。**

<details>
<summary>展开解答</summary>

逐字节转换：

$$
128=\texttt{0x80},\quad208=\texttt{0xD0},\quad
2=\texttt{0x02},\quad151=\texttt{0x97}.
$$

所以：

```text
128.208.2.151 → 80 D0 02 97 → 0x80D00297
```

每个字节占两个十六进制数字，因此 `2` 要写成 `02`。读取抓包的原始字节时，可以用这四个字节定位 IP 地址，再结合首部格式识别前面的长度、 **TTL** 和 Protocol。

</details>

#### Prefixes and Subnet Masks

长度为 $L$ 的前缀包含所有高 $L$ 位相同的地址，其余 $32-L$ 位可以变化：

$$
\boxed{\text{地址数}=2^{32-L}}.
$$

前缀记法为 `网络地址/L`。网络地址取块内最低地址，即主机部分全为 0；地址块起点必须按块大小对齐。

**Subnet Mask（子网掩码）** 的高 $L$ 位为 1，其余位为 0。它用于提取地址中的网络部分：

$$
\boxed{\text{网络地址}=\text{IP 地址}\mathbin{\&}\text{子网掩码}}.
$$

例如，`/24` 的掩码为 `255.255.255.0`。前缀越长，地址块越小，表示的范围越具体；前缀越短，覆盖的地址越多。

#### Example

**The Prefix 128.13.0.0/16**

**求地址范围、地址总数和普通子网中的可用主机地址数。**

<details>
<summary>展开解答</summary>

前 16 位固定，后 16 位变化，因此：

```text
网络地址：    128.13.0.0
子网掩码：    255.255.0.0
整个地址范围：128.13.0.0 – 128.13.255.255
广播地址：    128.13.255.255
主机地址范围：128.13.0.1 – 128.13.255.254
```

总地址数为 $2^{16}=65536$。普通广播型子网保留主机部分全 0 的网络地址和全 1 的广播地址，因此常规可用主机地址数为：

$$
\boxed{2^{16}-2=65534}.
$$

同理，普通 `/24` 子网包含 256 个地址，常规可用主机地址有 254 个。

`/32` 则表示一个确定的地址，常用于单主机路由或路由器的逻辑回环接口；这里直接按一个地址理解。

**网络地址与未指定地址要分开。** `128.13.0.0/16` 标识这个网络；尚未取得 IPv4 地址的 **DHCP** 客户端使用 `0.0.0.0` 作为源地址。

</details>

### Subnets and **Subnetting**

**子网（Subnet）** 是主机和路由器接口所在的一个网络范围。识别拓扑中的子网时，可以把路由器各接口从路由器本体上拆开，看形成多少个相互隔离的“岛”。

同一个岛上的接口共享相应的网络前缀。路由器连接这些不同的岛，并在它们之间转发分组。

#### Example

**Counting Six Subnets**

**三个路由器 R1、R2、R3 两两相连，每个路由器还连接一个主机Local Area Network。各网段按 `/24` 理解，图中有多少个子网？三个Local Area Network的默认网关分别是什么？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116200208.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：子网数量与接口配置</summary>

三个主机 **Local Area Network** 分别为：

```text
R1 所连局域网：223.1.1.0/24
R2 所连局域网：223.1.2.0/24
R3 所连局域网：223.1.3.0/24
```

三条路由器间链路又各自形成一个子网：

```text
R1 — R2：223.1.9.0/24
R1 — R3：223.1.7.0/24
R2 — R3：223.1.8.0/24
```

因此共：

$$
\boxed{3+3=6\text{ 个子网}}.
$$

路由器之间的链路同样要配置地址，不能只数连接了 PC 的 **Local Area Network**。

图中三个 **Local Area Network** 的默认网关分别为：

```text
223.1.1.0/24 内的主机 → 223.1.1.3
223.1.2.0/24 内的主机 → 223.1.2.6
223.1.3.0/24 内的主机 → 223.1.3.27
```

**默认网关是本机可以直接到达的路由器接口地址。** 网关不必以 `.1` 结尾，图中的 `.3`、`.6`、`.27` 都承担这个角色。

配置这种拓扑时，同一条路由器间链路的两端属于同一子网；同一路由器连接不同子网的接口，则分别使用对应子网的地址。

</details>

#### Splitting an Address Block

**Subnetting** 把一个较大的地址块分成多个更小的块，供组织内部的不同网络使用；外部仍可以用一个较短前缀表示整个组织。

内部子网不必一样大。每个子网都需要满足地址块大小与边界对齐要求，且分配范围不能重叠。

#### Example

**Three Departments in 128.208.0.0/16**

**把 `128.208.0.0/16` 分给计算机、电气工程和艺术三个院系，分别使用 `/17`、`/18`、`/19`。分析各自的地址范围及剩余空间。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116200243.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

前两个字节固定为 `128.208`，主要看第三个字节的高位：

```text
计算机：128.208.1xxxxxxx.xxxxxxxx    /17
电气：  128.208.00xxxxxx.xxxxxxxx   /18
艺术：  128.208.011xxxxx.xxxxxxxx   /19
```

这里第三、第四组用二进制表示，`x` 对应可变的主机位。

| 院系 | 前缀 | **Subnet Mask** | 整个地址范围 | 地址数 |
| --- | --- | --- | --- | ---: |
| 计算机 | 128.208.128.0/17 | 255.255.128.0 | 128.208.128.0–128.208.255.255 | 32768 |
| 电气 | 128.208.0.0/18 | 255.255.192.0 | 128.208.0.0–128.208.63.255 | 16384 |
| 艺术 | 128.208.96.0/19 | 255.255.224.0 | 128.208.96.0–128.208.127.255 | 8192 |

三个地址块分别占原 `/16` 的 $1/2$、$1/4$、$1/8$。剩余的 $1/8$ 为：

$$
\boxed{128.208.64.0/19},
$$

范围是 `128.208.64.0–128.208.95.255`，共有 8192 个地址。

内部路由器根据三个更具体的前缀区分院系；外部只需知道 `128.208.0.0/16` 朝学校方向转发。

</details>

#### Selecting a Subnet with a Mask

路由器收到分组后，对目的地址应用各条路由的掩码，检查结果是否等于对应的网络地址：

$$
\boxed{(D\mathbin{\&}M_i)=P_i}.
$$

这里 $D$ 是目的地址，$M_i$ 是掩码，$P_i$ 是该路由的前缀地址。匹配意味着目的地址位于该前缀的覆盖范围内。

<details>
<summary>例：128.208.2.151 应转发到哪个院系？</summary>

检查计算机院系 `/17`：

```text
128.208.2.151 AND 255.255.128.0 = 128.208.0.0
```

结果与 `128.208.128.0` 不同，因此不匹配。

检查电气院系 `/18`：

```text
128.208.2.151 AND 255.255.192.0 = 128.208.0.0
```

结果等于该院系的前缀地址，所以应从通向 **电气院系** 的接口发送。

判断时既要做 AND，也要把结果与该条路由的网络地址比较；仅得到一个 AND 结果还没有完成匹配。

</details>

### Classful Addressing and Address Allocation

#### Historical Address Classes

早期分类地址把单播网络的前缀长度限制为 `/8`、`/16`、`/24`。类别由地址的高位确定：

| 类别 | 起始比特 | 网络前缀长度 | 主机位数／用途 |
| --- | --- | --- | --- |
| A | `0` | /8 | 24 位主机部分 |
| B | `10` | /16 | 16 位主机部分 |
| C | `110` | /24 | 8 位主机部分 |
| D | `1110` | — | 多播，224.0.0.0–239.255.255.255 |
| E | `1111` | — | 保留范围 |

A、B、C 的类别标志也属于前缀，因此剩余的网络编号位分别是 7、14、21 位。

固定块大小会造成浪费：C 类容量较小，B 类又可能远超需求。使用可变长度前缀后，可以按所需地址数量选择块大小。

#### Hierarchical Allocation

公网地址按层次分配：全球协调（ICANN）→ 区域互联网注册机构 → ISP／组织 → 网络接口。区域机构的例子包括 ARIN、RIPE NCC、APNIC 和 LACNIC。

组织取得地址块后，再划分内部子网，并为接口分配地址；主机地址还可以由 **DHCP** 自动配置。**给组织分配一块地址，与给一台主机分配地址，是不同层次的工作。**

### **Classless Inter-Domain Routing (CIDR)** and **Route Aggregation**

**CIDR** 使用 `地址/前缀长度` 描述网络，不再由 A、B、C 类固定前缀长度。

```text
子网划分：一个大地址块 → 多个小地址块；前缀变长。
路由聚合：多个小前缀 → 一个覆盖范围更大的前缀；前缀变短。
```

**Route Aggregation** 让远端路由器用一个汇总表项表示多个朝同一方向转发的网络，减少路由表项和通告量。靠近目的地的路由器仍保留区分各子网的详细表项。

#### Example

**Cambridge, Edinburgh, and Oxford**

**从 `192.24.0.0` 开始，有连续 8192 个地址。Cambridge 使用 2048 个，Edinburgh 使用 1024 个，Oxford 使用 4096 个。分析分配结果及对外聚合。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201213.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：地址分配、对齐与聚合</summary>

整个地址块包含 $8192=2^{13}$ 个地址，所以前缀为：

$$
192.24.0.0/19.
$$

分配结果为：

| 网络 | 地址数 | 前缀 | 地址范围 |
| --- | ---: | --- | --- |
| Cambridge | 2048 | 192.24.0.0/21 | 192.24.0.0–192.24.7.255 |
| Edinburgh | 1024 | 192.24.8.0/22 | 192.24.8.0–192.24.11.255 |
| 尚未分配 | 1024 | 192.24.12.0/22 | 192.24.12.0–192.24.15.255 |
| Oxford | 4096 | 192.24.16.0/20 | 192.24.16.0–192.24.31.255 |

其中 $2048=2^{11}$，对应 `/21`；$1024=2^{10}$，对应 `/22`；$4096=2^{12}$，对应 `/20`。

Oxford 的 `/20` 需要按 4096 个地址对齐。在前两个字节固定时，第三个字节应从 16 的倍数开始，所以它使用 `192.24.16.0/20`。

London 要区分三个大学，保留三个具体前缀；New York 到这些地址都先发往 London，只需保存：

```text
192.24.0.0/19 → London
```

第三个字节范围为 $0\sim31$，其二进制高 3 位相同：

```text
00000000 … 00011111
^^^
公共 3 位
```

加上前两个字节的 16 位，得到 $16+3=19$ 位共同前缀。聚合范围也包含尚未分配的 `192.24.12.0/22`。

</details>

#### Longest Prefix Matching

路由表中的前缀允许包含关系。目的地址同时匹配多条路由时，选择 **Longest Prefix Match（最长匹配前缀）**，也就是覆盖范围最具体的一条。

检查顺序是：**先确认匹配，再在匹配项中比较长度。** 一个很长但不匹配的前缀不能被选中。

#### Example

**London or San Francisco?**

**New York 原来把 `192.24.0.0/19` 都发往 London。现在其中的 `192.24.12.0/22` 分配给 San Francisco，怎样用两条表项正确转发？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201244.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

保留原来的汇总路由，再增加一条更具体的路由：

```text
192.24.0.0/19  → London
192.24.12.0/22 → San Francisco
```

`/22` 覆盖 `192.24.12.0–192.24.15.255`，这个范围也在 `/19` 内。两个前缀都匹配时，选择较长的 `/22`，转发到 San Francisco。

例如，目的地址 `192.24.13.1` 同时匹配两条，去 San Francisco；目的地址 `192.24.18.1` 只匹配 `/19`，去 London。

**汇总路由负责大范围，更具体路由负责例外。** 无须为了一个子块迁出，就把所有其他子块逐项拆回路由表。

</details>

#### Example

**Allocating Addresses to Four Organizations**

**从 `172.16.0.0` 开始有大量连续地址。A、B、C、D 按顺序分别申请 2000、4000、4000、8000 个地址，按地址从小到大分配。求各组织的首地址、末地址及前缀。**

<details>
<summary>展开：先确定块大小，再按边界分配</summary>

**第一步：向上取到 2 的幂。** 设需要 $n$ 个地址，选择最小的 $h$，使 $2^h\ge n$。块大小为 $2^h$，前缀长度为 $32-h$。

```text
A：2000 → 2048 = 2¹¹ → /21
B：4000 → 4096 = 2¹² → /20
C：4000 → 4096 = 2¹² → /20
D：8000 → 8192 = 2¹³ → /19
```

**第二步：把起点对齐。** 前两个字节固定时，`/21`、`/20`、`/19` 的第三个字节分别按 8、16、32 对齐。

A 从 0 开始，占第三个字节 $0\sim7$。

B 需要 `/20`，不能直接从 8 开始：12 位主机部分必须从全 0 开始，因此第三个字节要跳到下一个 16 的倍数，即 16，范围为 $16\sim31$。

C 同样使用 `/20`，从 32 开始，范围为 $32\sim47$。

D 需要 `/19`。48 不是 32 的倍数，要从 64 开始，范围为 $64\sim95$。

| 组织 | 首地址 | 末地址 | 前缀 |
| --- | --- | --- | --- |
| A | 172.16.0.0 | 172.16.7.255 | 172.16.0.0/21 |
| B | 172.16.16.0 | 172.16.31.255 | 172.16.16.0/20 |
| C | 172.16.32.0 | 172.16.47.255 | 172.16.32.0/20 |
| D | 172.16.64.0 | 172.16.95.255 | 172.16.64.0/19 |

这里列的是 **整个地址块** 的首尾，包括网络地址和末尾地址。题目问可分配给普通主机的范围时，才另行扣除保留地址。

分配过程中留下两个空段：

```text
172.16.8.0  – 172.16.15.255
172.16.48.0 – 172.16.63.255
```

**数量够用与边界正确必须同时满足。** 例如把 B 写成 `172.16.8.0/20`，应用 `/20` 掩码后实际得到 `172.16.0.0/20`，会覆盖 A，不能作为本题的新块起点。

</details>

<details>
<summary>继续：这四块地址怎样对外汇总？</summary>

需要区分汇总范围：

**按整个 `/16` 地址块统一对外表示**，可以写 `172.16.0.0/16`，覆盖第三个字节 $0\sim255$。

**只求覆盖这四块的最小单一前缀**，则要比较最小地址 `172.16.0.0` 与最大地址 `172.16.95.255`。第三个字节分别为：

```text
 0 = 00000000
95 = 01011111
     ^
只有最高 1 位共同固定为 0
```

加上前两个字节的 16 位，共同前缀长 17 位，所以最小覆盖前缀为：

$$
\boxed{172.16.0.0/17}.
$$

它覆盖 `172.16.0.0–172.16.127.255`，也包含上述空段及 `172.16.96.0–172.16.127.255`。

因此 `/16` 是更宽的汇总范围，`/17` 是覆盖四块地址的最小单前缀。**把首地址按位 AND 得到 `172.16.0.0`，只能帮助确定地址部分，不能单凭这个结果确定前缀长度。**

</details>

### Special IPv4 Addresses

几个特殊地址有固定用途：

| 地址 | 含义与用途 |
| --- | --- |
| `0.0.0.0` | 未指定地址；主机尚未取得地址时，可以在初始化报文中用作源地址 |
| `255.255.255.255` | 本地受限广播，发送给当前网络中的主机，不由普通路由器继续转发 |
| `127.0.0.1` | 本机回环测试；`127.0.0.0/8` 保留用于回环 |

`127.0.0.1` 的通信在本机协议栈内完成。能够 ping 通它，只能说明本机相应处理可用，不能据此判断外部网络是否连通。

`255.255.255.255` 与某个子网的广播地址也要区分。例如 `128.13.255.255` 的含义由 `128.13.0.0/16` 决定，它的 **主机部分** 为全 1。

### **Network Address Translation (NAT)**

**NAT** 在内部网络和外部网络之间修改地址，使许多内部主机共享较少的外部 IPv4 地址。

内部网络可以使用私有地址。三个保留范围为：

```text
10.0.0.0/8      → 10.0.0.0–10.255.255.255
172.16.0.0/12   → 172.16.0.0–172.31.255.255
192.168.0.0/16  → 192.168.0.0–192.168.255.255
```

这些地址供内部使用，不作为公网直接寻址的地址。不同内部网络可以重复使用相同的私有地址块。

常见共享方式还修改 TCP／UDP 端口号，通过映射表保存：

$$
(\text{内部 IP},\text{内部端口})
\longleftrightarrow
(\text{外部 IP},\text{外部端口}).
$$

外部服务器把回复送到公网地址和端口， **NAT** 查表后恢复内部目的端点。 **NAT** 常与防火墙集成；防火墙负责允许或拒绝流量，地址转换负责改写与映射。

#### Example

**A Web Request through NAT**

**内部主机 `10.0.0.1:3345` 访问 `128.119.40.186:80`。NAT 的内部接口为 `10.0.0.4`，外部接口为 `138.76.29.7`，为这次通信分配外部端口 5001。请求与回复经过 NAT 时怎样变化？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201351.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：四个位置的地址和端口</summary>

**NAT** 保存：

```text
内部：10.0.0.1:3345  ↔  外部：138.76.29.7:5001
```

四个位置的报文为：

| 位置 | 源 IP : 端口 | 目的 IP : 端口 |
| --- | --- | --- |
| ① 内部主机发出请求 | 10.0.0.1:3345 | 128.119.40.186:80 |
| ② **NAT** 向外转发 | 138.76.29.7:5001 | 128.119.40.186:80 |
| ③ 服务器返回响应 | 128.119.40.186:80 | 138.76.29.7:5001 |
| ④ **NAT** 向内转发 | 128.119.40.186:80 | 10.0.0.1:3345 |

请求出去时， **NAT** 改写 **源 IP 和源端口**；回复进来时， **NAT** 改写 **目的 IP 和目的端口**。

`10.0.0.4` 是内部主机将外部流量交出的网关接口。服务器看到的通信端点是 `138.76.29.7:5001`，返回包也先到这里，再由映射表找到 `10.0.0.1:3345`。

端口 80 对应本例的 HTTP 服务。地址和端口被修改后，受影响的 **Checksum** 也需要相应调整。

</details>

#### Example

**Three Internal Endpoints, One Public Address**

**下列三个内部端点共用一个公网 IP，如何避免两台主机都使用内部端口 1234 时发生混淆？**

```text
内部端点               外部端点
10.0.1.2:5544    ↔     128.143.71.21:3344
10.0.1.3:1234    ↔     128.143.71.21:3345
10.0.1.4:1234    ↔     128.143.71.21:3346
```

<details>
<summary>展开解答</summary>

内部端点由 **IP 地址和端口共同区分**。`10.0.1.3:1234` 与 `10.0.1.4:1234` 虽然端口相同，IP 地址不同，因此属于不同端点。

**NAT** 为它们选用不同的外部端口 3345、3346。收到发往 `128.143.71.21:3345` 的回复时，交给 `10.0.1.3:1234`；收到发往端口 3346 的回复时，交给 `10.0.1.4:1234`。

端口字段占 16 bit，取值范围为 $0\sim65535$；$0\sim1023$ 属于知名端口范围。**同一台主机可以建立多条端口映射**，不能直接把端口数量当成可连接主机数量。

</details>

#### State and Layering

**NAT** 节约地址，同时引入几方面的依赖：

**端到端寻址受到影响。** 中间设备会修改通信端点的地址和端口，外部无法直接用内部地址定位相应主机。

**需要理解运输层格式。** 普通 IP 转发主要处理网络层首部；端口转换还要定位并修改 TCP／UDP 字段，使不同协议层之间产生额外耦合。

**依赖映射状态。** **NAT** 的映射表丢失后，原有通信的返回包可能无法交给正确的内部端点。中间设备因此保存了与通信有关的状态，增加了故障恢复的要求。

### **Dynamic Host Configuration Protocol**

**DHCP** 为主机自动提供 IP 地址、 **Subnet Mask**、默认网关和 DNS 服务器等配置。

服务器维护可分配的地址池，并通过 **租约（Lease）** 控制地址使用时间。客户端在有效租期内使用地址，继续使用时申请续租；地址被释放或租约失效后可重新分配。

例如 11:45 获得租约、12:45 到期，对应租期为 1 小时。网络配置详情中，可以一起查看地址、掩码、网关、 **DHCP** 服务器、DNS 服务器和租约时间。

#### Discover, Offer, Request, and ACK

新客户端初次获取地址，采用四步交互：

$$
\boxed{\text{Discover}\rightarrow\text{Offer}\rightarrow
\text{Request}\rightarrow\text{ACK}}.
$$

**Discover：寻找服务器。** 客户端还没有 IP 地址，也不知道服务器位置，以 `0.0.0.0` 为源地址，向 `255.255.255.255` 发送发现广播。

**Offer：提供候选配置。** 服务器从地址池中提供地址及租约等参数。存在多个服务器时，客户端可能收到多个 Offer。

**Request：选择一个方案。** 客户端请求使用选中的地址和服务器配置。在本次初始获取流程中，广播请求还能让其他服务器知道其选择。

**ACK：确认租约。** 服务器确认分配结果，客户端完成地址配置，并在租期内使用该地址。

**DHCP** 使用 UDP：**服务器端口为 67，客户端端口为 68。**

#### Example

**Leasing 223.1.2.4**

**DHCP 服务器为 `223.1.2.5`，给新客户端分配 `223.1.2.4`，租约为 3600 s。分析四个报文的源、目的地址和端口。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201423.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

| 消息 | 源 IP : UDP 端口 | 目的 IP : UDP 端口 | 主要含义 |
| --- | --- | --- | --- |
| Discover | 0.0.0.0:68 | 255.255.255.255:67 | 寻找服务器 |
| Offer | 223.1.2.5:67 | 255.255.255.255:68 | 提供 223.1.2.4，租期 3600 s |
| Request | 0.0.0.0:68 | 255.255.255.255:67 | 选择服务器 223.1.2.5 提供的地址 |
| ACK | 223.1.2.5:67 | 255.255.255.255:68 | 确认地址与租约 |

**本例四个报文的目的 IP 都是广播地址。** 不能把“报文内容里给出的候选地址 `223.1.2.4`”与“外层 IP 首部的目的地址”混在一起。

客户端在 Request 阶段仍未完成本次分配，所以源地址仍为 `0.0.0.0`。收到 ACK 后，完成这次租约获取：

$$
3600\ \mathrm{s}=1\ \mathrm{h}.
$$

后续续租属于已有地址状态下的交互，不能由这个初次获取的广播例子推出所有 **DHCP** 消息都必须广播。

</details>

#### **DHCP** Relay

本地广播不能直接穿过普通路由器到达另一个子网。 **DHCP** 服务器位于远端时，需要 **DHCP 中继代理（DHCP Relay Agent）**：接收本地请求，携带客户端所属网络的信息转交给服务器，再把服务器的回答送回客户端网络。

#### Example

**A DHCP Server in Another Subnet**

**PC1 位于 `192.168.1.0/24`，该子网没有 DHCP 服务器。服务器位于 `192.168.2.0/24`，地址为 `192.168.2.2`。两个子网通过 R1 连接，PC1 如何取得地址？**

```text
PC1 ── SW1 ── R1 ── DHCP Server
              │         192.168.2.2
              │
R1 G0/0：192.168.1.254/24，面向 PC1
R1 G0/1：192.168.2.1/24，面向服务器
```

<details>
<summary>展开：为什么需要中继，四步交互如何跨子网？</summary>

PC1 广播 **DHCP** Discover，但广播只在 `192.168.1.0/24` 内传播。服务器在另一个子网中，无法直接收到它。

在 R1 面向客户端的接口上配置 **DHCP** Relay，并指定服务器 `192.168.2.2`，交互过程变为：

```text
PC1  ── Discover 广播 ──→ R1 ── 转交请求 ──→ DHCP Server
PC1  ←─ Offer          ── R1 ←─ 候选配置 ── DHCP Server
PC1  ── Request        ─→ R1 ── 转交选择 ─→ DHCP Server
PC1  ←─ ACK            ── R1 ←─ 确认租约 ── DHCP Server
```

服务器依据中继提供的客户端网络信息，从 **`192.168.1.0/24` 对应地址池** 中选择地址，再经 R1 返回。服务器本身位于 `192.168.2.0/24`，不意味着要给 PC1 分配 `192.168.2.x`。

**中继转交 DHCP 请求和响应；普通路由转发本身不会自动把本地广播扩散到另一个子网。**

</details>

#### Broadcast Domains

理解 **DHCP** Relay，需要把 **广播域** 和 **Collision Domain（冲突域）** 分开：

**二层交换机未划分多个 Virtual LAN（虚拟局域网，VLAN） 时**，各端口通常位于同一个广播域；不同端口形成独立的 **Collision Domain**。

**划分 VLAN 后**，每个 **VLAN** 形成自己的广播域，二层广播不会直接跨越不同 **VLAN**。

**路由器的不同三层接口** 连接不同广播域，通常隔离本地广播。因此，位于不同子网的 **DHCP** 客户端与服务器需要中继配合。

**NAT** 与 **DHCP** 的分工也不同：**DHCP 配置主机的地址，NAT 改写经过设备的分组地址和端口。** 同一台设备可以同时提供这两种功能。

### IPv6

IPv6 把地址长度从 32 bit 扩展到 **128 bit**，即每个地址 **16 B**。它还简化固定首部，将可选功能放入 **Extension Header（扩展首部）**，减少基本转发过程中的处理负担。

IPv4 与 IPv6 的报文格式不同，不能仅修改 Version 字段完成转换。TCP、UDP 等上层通信仍然可以由 IPv6 承载。

#### The Fixed Header

IPv6 固定首部长度为 **40 B**。其中源、目的地址各占 16 B，合计 32 B；其余字段共占 8 B。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201853.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

| 字段 | 位数 | 作用 |
| --- | ---: | --- |
| Version | 4 | IPv6 取值为 6 |
| Traffic Class / Differentiated Services | 8 | 服务类别与拥塞指示 |
| Flow Label | 20 | 标记数据流，供一致的流处理使用 |
| Payload Length | 16 | 40 B 固定首部之后的字节数 |
| Next Header | 8 | 指明紧随其后的首部类型 |
| Hop Limit | 8 | 限制转发跳数 |
| Source Address | 128 | 源地址 |
| Destination Address | 128 | 目的地址 |

**Flow Label** 为相关分组标记流身份，便于按流识别与处理；特殊服务还需要相应的转发策略配合。

**Payload Length 包含Extension Header，但不包含 40 B 固定首部。** 与 IPv4 的 Total Length 对比：

$$
\begin{aligned}
\text{IPv4 总长}&=\text{IPv4 首部长}+\text{数据长度},\\
\text{IPv6 总长}&=40+\text{Payload Length}.
\end{aligned}
$$

IPv6 固定首部长度已知，因此无须用 IHL 再描述其长度。

**Next Header** 可以指向 **Extension Header**，也可以直接指向 TCP、UDP。没有 **Extension Header** 时，取值 6 表示后接 TCP，17 表示后接 UDP。

**Hop Limit** 与 IPv4 **TTL** 的逐跳限制作用对应：每经过一台转发路由器减 1，耗尽后丢弃。

#### Address Representation

IPv6 地址通常写成 **8 组、每组 4 个十六进制数字**，组间用冒号分隔：

$$
8\times4\times4=128\ \mathrm{bit}.
$$

可使用两种压缩：省略一组内部的 **前导 0**；用 `::` 代替连续的全零组。一个地址最多使用一次 `::`，才能唯一确定需要补回多少组。

#### Example

**Compressing and Expanding an IPv6 Address**

**将 `8000:0000:0000:0000:0123:4567:89AB:CDEF` 压缩，并说明怎样恢复。**

<details>
<summary>展开解答</summary>

先省略各组前导 0：

```text
8000:0:0:0:123:4567:89AB:CDEF
```

再把中间连续三组 0 压缩为 `::`：

```text
8000::123:4567:89AB:CDEF
```

恢复时，当前明确写出的组有 5 组，因此 `::` 补成 $8-5=3$ 组 `0000`；`123` 再补成 `0123`。

`8000` 末尾的三个 0 不能省略：`8000` 和 `8` 表示不同数值。可以去掉的是 **组内前导 0**。

</details>

<details>
<summary>例：::192.31.20.46 表示什么？</summary>

这是一种把地址最低 32 位写成 IPv4 点分十进制的混合记法。四个十进制字节转成十六进制为：

```text
192.31.20.46 → C0 1F 14 2E → C01F:142E
```

所以其完整 128-bit 表示为：

```text
0000:0000:0000:0000:0000:0000:C01F:142E
```

这一例子说明文本表示方法。用 IPv6 记法写出 IPv4 数值，不会自动把一个 IPv4 报文转换成 IPv6 报文。

</details>

#### Changes from IPv4

**路由器不执行 IPv6 分片。** 分组超过输出链路 **MTU** 时，路由器丢弃它，返回 ICMPv6 的 Packet Too Big 信息；源端调整发送大小，确需分片时由源端处理，目的端重组。

**没有 IPv6 Header Checksum。** 减少逐跳修改 Hop Limit 后的 **Checksum** 更新工作，其他层继续承担各自的差错检测。

**固定首部中不放可变长 Options。** 可选功能改由 **Extension Header** 提供，使基本首部始终保持 40 B。

#### Extension Headers

**Extension Header** 放在固定首部之后，由 Next Header 串联，最后指向所承载的上层协议：

```text
IPv6 固定首部 → 扩展首部 1 → 扩展首部 2 → TCP／UDP → 上层数据
           Next Header    Next Header    Next Header
```

主要类型包括：

**逐跳选项（Hop-by-Hop Options）**：承载供沿途处理的选项。

**目的选项（Destination Options）**：承载供目的节点处理的信息。

**路由首部（Routing Header）**：携带路由相关信息；格式中可包含下一首部、扩展长度、路由类型、剩余段数（Segments Left）等。

**分片首部（Fragment Header）**：保存源端分片所需的信息。

**认证首部（AH）** 与 **封装安全载荷（ESP）**：分别提供认证、完整性及加密等安全机制。

部分选项采用 **TLV（Type, Length, Value）** 编码：Type 占 1 B，说明选项种类；Length 占 1 B，给出后续 Value 的字节数；Value 保存实际内容。

选项类型中的高 2 位还规定不认识该选项时的动作：跳过；丢弃；丢弃并报告 **ICMP** 错误；或根据目的地址是否为多播决定是否报告。这样可以在扩展功能时保留明确的处理规则。

### Transition from IPv4 to IPv6

IPv4 与 IPv6 需要逐步共存，主要理解 **Dual Stack** 与 **隧道**。

#### **Dual Stack**

**Dual Stack** 表示同一设备完整实现 IPv4 和 IPv6，两套协议分别处理相应报文。

```text
IPv4 报文 → IPv4 协议栈与转发处理
IPv6 报文 → IPv6 协议栈与转发处理
```

双栈提供两种处理能力；在 IPv4、IPv6 报文格式之间互相转换，还需要额外的转换机制。

#### Example

**What Happens to the Flow Label?**

**A → B → C → D → E → F 中，中间 C、D 只能处理 IPv4。若在 B 把 IPv6 报文转换为 IPv4，在 E 再转换回来，会出现什么问题？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201924.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

A 发出的 IPv6 报文包含 Flow Label = X。IPv4 首部没有对应的 Flow Label 字段，因此把报文改成 IPv4 格式时，这项信息可能无法保留。

到 E 再恢复 IPv6 格式时，仅凭中间的 IPv4 报文，无法知道原来的 X，所以图中标为 `Flow: ??`。

这个例子说明 **格式转换可能丢失某一协议特有的字段**。双栈本身只负责让节点能处理两种协议，不会自动完成图示的两次转换。

</details>

#### Tunneling

**隧道（Tunneling）** 把整个 IPv6 数据报放入 IPv4 的数据部分，让中间 IPv4 网络负责承载：

```text
外层 IPv4 首部 | 内层 IPv6 首部 | 内层数据
              └──── IPv4 的数据部分 ────┘
```

入口封装，出口解封装。中间节点按外层地址转发，内层 IPv6 地址与协议特有信息可以保留下来。

#### Example

**An IPv6 Tunnel from B to E**

**仍考虑 A → B → C → D → E → F，以 B、E 为隧道端点。分析隧道内外的源、目的地址。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116201942.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：封装、穿越与解封装</summary>

**A → B：** 发送普通 IPv6 数据报。

```text
IPv6：源 A，目的 F，Flow Label = X
```

**B → C → D → E：** B 增加外层 IPv4 首部。

```text
外层 IPv4：源 B 的 IPv4 地址，目的 E 的 IPv4 地址
内层 IPv6：源 A 的 IPv6 地址，目的 F 的 IPv6 地址，Flow Label = X
```

C、D 只需识别外层 IPv4 首部，把分组送到 E，无须理解里面的 IPv6 格式。

**E → F：** E 去掉外层 IPv4 首部，取出原来的 IPv6 数据报，再按目的地址 F 转发。

内层的 A、F、Flow Label = X 保留，避免了逐字段转换造成的信息丢失。代价是增加外层首部，并需要相应的隧道端点处理。

</details>

#### Example

**Paris to London**

**Paris 与 London 的两端网络都使用 IPv6，中间网络使用 IPv4。怎样连接两端？**

<details>
<summary>展开解答</summary>

在两侧边界路由器之间建立 IPv6-over-IPv4 隧道：

```text
Paris 主机      隧道入口       IPv4 中间网络       隧道出口      London 主机
    ── IPv6 ──→  封装  ── IPv4[IPv6 分组] ──→  解封装 ── IPv6 ──→
```

隧道中的外层目的地是出口，因此封装后的内层分组需要到达出口后才能继续按 IPv6 转发；中间 IPv4 主机无法直接接收这个内层 IPv6 分组。

**Virtual Private Network（虚拟专用网络，VPN）** 也可以利用类似的封装思路，具体安全功能由所采用的 **VPN** 协议提供。

</details>

### Internet Control Protocols

IP 负责数据传送，配套的控制与辅助协议承担错误报告、地址配置和地址解析。IPv4 中包括 **ICMP、DHCP、ARP**；IPv6 中也有相应的 **ICMP**、 **DHCP** 机制，并用邻居发现协议 NDP 完成相关链路上的发现与解析。

### **ICMP**

**ICMP** 用于报告 IP 分组处理中的异常，也用于网络诊断。例如，路由器无法找到目的网络，或转发时 **TTL** 耗尽，就可以向源主机发送相应的 **ICMP** 报文。

**ICMP** 直接封装在 IPv4 数据报中，对应 **Protocol = 1**：

```text
以太网首部 | IPv4 首部（Protocol = 1）| ICMP 报文
```

**ICMP** 首部中的 **Type** 指定消息类别，**Code** 进一步说明该类别中的具体情况。它还包含自己的 **Checksum**，用于检查 **ICMP** 报文。

#### Message Types

| Type | Code | 含义 |
| --- | --- | --- |
| 0 | 0 | Echo Reply，回显应答 |
| 3 | 0、1、2、3 | 分别表示目的网络、主机、协议、端口不可达 |
| 3 | 6、7 | 分别表示目的网络未知、目的主机未知 |
| 4 | 0 | Source Quench，早期用于通知源端降低发送速率 |
| 8 | 0 | Echo Request，回显请求 |
| 9 | 0 | 路由器通告 |
| 10 | 0 | 路由器发现请求 |
| 11 | 0 | 转发途中 **TTL** 耗尽 |
| 12 | 0 | IP 首部参数有问题 |

重点记住四组：**请求 `(8,0)`、应答 `(0,0)`、TTL 到期 `(11,0)`、端口不可达 `(3,3)`**。Source Quench 属于早期的拥塞通知机制。

#### Quoting the Original Datagram

**差错报告需要指出：哪个原始分组出了什么问题。** 因此， **ICMP** 差错报文中会带回触发错误的原始 IPv4 首部和数据开头的一部分。经典格式至少包含原始数据部分的前 8 字节，实际抓包中也可能带回更多内容。

```text
外层 IPv4：把错误报告送回原发送者
└── ICMP：Type、Code、Checksum 等
    └── 原始 IPv4 首部
        └── 原始数据的开头，例如 UDP 首部或 ICMP Echo 首部
```

外层与内层各自有一套源、目的 IP：**外层说明谁在报告错误、报告发给谁；内层说明哪个原始分组触发了错误。** 读取抓包时应分别展开。

Echo Request／Reply 用于回显测试，其内容包含标识、序号与测试数据，与这里的差错引用格式不同。

### Ping

`ping` 向目标发送 **Echo Request（Type 8，Code 0）**；目标收到后返回 **Echo Reply（Type 0，Code 0）**。

```text
源主机 ── Echo Request ──→ 目的主机
源主机 ←── Echo Reply ─── 目的主机
```

**Identifier** 辅助区分不同组的回显请求；**Sequence Number** 区分同一组中的不同请求。应答保留相应的标识、序号和测试数据，使发送者能够配对请求与响应，并计算往返时延：

$$
\boxed{RTT=t_{\mathrm{reply}}-t_{\mathrm{request}}}.
$$

收到正确应答说明这次探测成功往返；没有收到应答，也可能与报文丢失或过滤有关。

#### Example

1. **Matching an Echo Request and Reply**

**本机地址为 `10.192.3.220`，执行 `ping 36.152.44.96`。分析第 16437、16438 号帧，判断它们是否为一对请求与应答。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202059.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202112.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：报文方向、标识匹配与 RTT</summary>

**第 16437 号帧为请求：**

```text
IPv4：10.192.3.220 → 36.152.44.96
ICMP：Type = 8，Code = 0
Identifier (BE) = 1
Sequence Number (BE) = 42
Checksum = 0x4d31，校验正确
Data = 32 bytes
Response frame = 16438
```

**第 16438 号帧为应答：**

```text
IPv4：36.152.44.96 → 10.192.3.220
ICMP：Type = 0，Code = 0
Identifier (BE) = 1
Sequence Number (BE) = 42
Checksum = 0x5531，校验正确
Data = 32 bytes
Request frame = 16437
Response time = 14.067 ms
```

源、目的 IP 对调，标识和序号一致，且两个关联帧号相互对应，所以这是一对请求与应答。本次往返时延为 **14.067 ms**。

Type 从 8 改成 0 后， **ICMP** 报文内容发生变化， **Checksum** 也随之改变。应答保留了请求中的 32 字节测试数据。

Wireshark 同时显示 BE、LE 两种解释。例如序号的两个字节是 `00 2a`：按大端解释为 42，按小端解释为 10752。**它们对应同一段字节，不能当作两次请求的序号。**

</details>

2. **Reading the IPv4 Header in Hexadecimal**

**仍看第 16437 号帧。其 IPv4 首部为下列 20 字节，求首部长度、IP 总长度、TTL、承载协议，以及源、目的地址。为什么整个抓包帧显示为 74 字节？**

```text
45 00 00 3c 19 cb 00 00 80 01 c1 62 0a c0 03 dc 24 98 2c 60
```

<details>
<summary>展开：从字段位置读取数值</summary>

首字节 `45` 的高 4 bit 为 4，表示 IPv4；低 4 bit 为 5，表示：

$$
H=5\times4=20\ \mathrm{B}.
$$

`00 3c` 是总长度，按大端解释：

$$
\mathrm{Total\ Length}=\mathrm{0x003c}=60\ \mathrm{B}.
$$

`80` 是 **TTL**，即 128；紧随其后的 `01` 是 Protocol，即 **ICMP**。

两个地址分别是：

```text
0a c0 03 dc → 10.192.3.220
24 98 2c 60 → 36.152.44.96
```

IP 的数据部分长 $60-20=40$ 字节，其中包括 **8 字节 ICMP Echo 首部与 32 字节测试数据**。

在这次抓包的显示口径下：

$$
\underbrace{14}_{\text{以太网首部}}+
\underbrace{20}_{\text{IPv4 首部}}+
\underbrace{8}_{\text{ICMP Echo 首部}}+
\underbrace{32}_{\text{测试数据}}
=\boxed{74\ \mathrm{B}}.
$$

因此，抓包的帧长度、IPv4 总长度和 Ping 测试数据长度分别是 **74、60、32 字节**，统计范围不同。

</details>

### Traceroute and Tracert

**路由追踪** 通过逐步增加探测报文的 **TTL**，找到沿途返回 **ICMP** 报告的路由器。

#### Increasing the **TTL**

假设路径为：

```text
源主机 → R1 → R2 → R3 → 目的主机
```

发送 **TTL** = 1 的探测包，R1 转发前将 **TTL** 减到 0，丢弃该包，并向源主机返回 **Time Exceeded（11,0）**。源主机从响应的源 IP 得到第一跳地址。

再发送 **TTL** = 2 的新探测包：它经过 R1 后还剩 1，到 R2 时耗尽，R2 返回相同类型的错误。继续使用 **TTL** = 3、4……，就能依次探测更远的位置。

```text
TTL = 1：R1 返回 Time Exceeded
TTL = 2：R2 返回 Time Exceeded
TTL = 3：R3 返回 Time Exceeded
TTL = 4：探测报文到达目的主机
```

每次探测都以最终主机为目的 IP，只改变起始 **TTL**。记录发送与响应时刻，可以计算 **源主机到该响应节点再返回的 RTT**；相邻两行 RTT 的差值不能直接当作两台路由器之间的链路时延。

#### Recognizing the Destination

中间路由器通过 `(11,0)` 报告 **TTL** 到期；到达目的主机时，结束标志取决于探测方式。

**UDP 方式。** 传统 traceroute 向一个预期没有应用监听的 UDP 目的端口发送探测包。目的主机收到后，返回 **Destination Port Unreachable（3,3）**，发送端据此结束追踪。

**ICMP Echo 方式。** Windows `tracert` 发送 Echo Request。到达目标后收到 **Echo Reply（0,0）**，据此结束追踪。

| 探测方式 | 探测报文 | 中间节点的典型响应 | 到达目标的典型响应 |
| --- | --- | --- | --- |
| UDP traceroute | UDP 数据报 | **ICMP** `(11,0)` | **ICMP** `(3,3)` |
| Windows tracert | **ICMP** Echo Request `(8,0)` | **ICMP** `(11,0)` | **ICMP** Echo Reply `(0,0)` |

#### Example

1. **Reading a Tracert Result**

**本机地址为 `192.168.1.145`，执行 `tracert 36.152.44.96`。为什么每一跳有三个时延？为什么中间出现 `*`，后面仍能看到目的主机？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202149.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：跳数、RTT 与超时</summary>

结果中的几行是：

```text
跳数    RTT 1    RTT 2    RTT 3    响应地址
 1       4 ms     4 ms     2 ms    192.168.1.1
 2       4 ms     7 ms     4 ms    10.214.161.1
 3      10 ms     6 ms     6 ms    10.214.255.3
 4         *        *        *    请求超时
 ...
12         *        *        *    请求超时
13      24 ms    10 ms    10 ms    36.152.44.96
```

**同一个 TTL 发送三次探测**，所以每行有三个独立的 RTT。第一跳 `192.168.1.1` 是此次通信的默认网关。

`*` 表示相应探测在规定时间内没有收到响应。第 4、12 跳没有及时响应，但后续探测仍抵达了更远的节点和目的主机，因此不能仅凭这些星号判定后续路径已经断开。

第 13 跳出现目标地址 `36.152.44.96`，说明这次追踪已经抵达目标。

</details>

2. **Three Probes for Each TTL**

**观察 Wireshark 中连续发送的 Echo Request，解释 TTL = 1、TTL = 2 两组报文。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202202.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：把请求与错误报告配对</summary>

**TTL** = 1 的请求分别为第 **126、128、130** 号帧，返回的 Time Exceeded 分别为第 **127、129、131** 号帧，响应源地址都是 `192.168.1.1`。

**TTL** = 2 的请求分别为第 **144、146、148** 号帧，返回的 Time Exceeded 分别为第 **145、147、149** 号帧，响应源地址都是 `10.214.161.1`。

```text
TTL = 1：126 → 127，128 → 129，130 → 131
TTL = 2：144 → 145，146 → 147，148 → 149
```

请求方向始终为 `192.168.1.145 → 36.152.44.96`；错误报告由 **TTL** 耗尽处的路由器发回本机。

</details>

3. **Time Exceeded and the Quoted Echo Request**

**展开第 127 号帧。为什么同一个 Wireshark 详情树里出现了两层 IPv4、两层 ICMP？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202250.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：外层报告错误，内层指出原始探测</summary>

第 126 号帧从本机发向目标， **TTL** = 1。第一个路由器 `192.168.1.1` 将它丢弃，并生成第 127 号帧：

```text
外层 IPv4
    Source      = 192.168.1.1
    Destination = 192.168.1.145
    Protocol    = ICMP (1)
└── 外层 ICMP
        Type = 11，Code = 0
        Time to live exceeded in transit
    └── 被引用的原始 IPv4
            Source      = 192.168.1.145
            Destination = 36.152.44.96
        └── 被引用的原始 ICMP
                Type = 8，Code = 0
                Identifier (BE) = 1
                Sequence Number (BE) = 1
```

外层的 Type 11 说明“转发途中 **TTL** 到期”；内层的 Type 8 说明触发错误的是之前发出的回显请求。原始报文的目的 IP 仍是 `36.152.44.96`，错误报告的目的 IP 则是本机。

按抓包时间戳，本次探测的往返时延为：

$$
128.303652-128.299651
=0.004001\ \mathrm{s}
=\boxed{4.001\ \mathrm{ms}}.
$$

</details>

4. **The Final Hop Uses Echo Reply**

**追踪抵达第 13 跳后，为什么没有看到作为结束标志的 UDP Port Unreachable？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202310.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

最后三组报文是：

```text
请求 323 → 应答 324
请求 325 → 应答 326
请求 327 → 应答 328
```

请求由 `192.168.1.145` 发往 `36.152.44.96`，初始 **TTL** = 13， **ICMP** Type = 8。目标直接返回 Type = 0 的 Echo Reply，源、目的 IP 对调。

这里运行的是 Windows `tracert`，探测使用 **ICMP** Echo。它以 **目标的 Echo Reply** 作为结束标志，因此不需要出现 UDP 端口不可达，也没有 TCP／UDP 端口字段。

</details>

5. **Port Unreachable and the Quoted UDP Datagram**

**使用过滤条件 `icmp && udp`，选中第 71 号帧。分析两层 IPv4 和内层 UDP，说明这个端口不可达错误对应什么通信。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202327.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261116202341.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：为什么 <strong>ICMP</strong> 报文能同时匹配 UDP？</summary>

先读外层：

```text
外层 IPv4
    Source      = 192.168.1.1
    Destination = 192.168.1.145
    Header Length = 20 bytes
    Total Length  = 106 bytes
    Protocol      = ICMP (1)
└── ICMP
        Type = 3：Destination Unreachable
        Code = 3：Port Unreachable
```

这表示 `192.168.1.1` 向本机报告“目标端口不可达”。继续展开 **ICMP** 引用的原始分组：

```text
原始 IPv4
    Source      = 192.168.1.145
    Destination = 192.168.1.1
    Header Length = 20 bytes
    Total Length  = 78 bytes
    Protocol      = UDP (17)
└── UDP
        Source Port      = 137
        Destination Port = 137
        Length           = 58 bytes
```

由此可知，触发错误的是：

$$
\boxed{192.168.1.145:137\longrightarrow192.168.1.1:137}
$$

这是一条发向网关 UDP 137 端口的通信。**按这张抓包图的目的地址和协议判断，它不对应前面发往 `36.152.44.96` 的 ICMP Echo 探测。** 137 端口在这个例子中与 **Local Area Network** 名字查询有关。

过滤器 `icmp && udp` 能匹配，是因为解析树同时包含 **外层 ICMP 与被引用的内层 UDP**：外层 IPv4 的 Protocol 为 1，内层原始 IPv4 的 Protocol 为 17。

长度也能对应起来：

$$
\begin{aligned}
\text{原始 IPv4 长度}&=20+58=78\ \mathrm{B},\\
\text{外层 IPv4 长度}&=20+8+78=106\ \mathrm{B},\\
\text{抓包帧长度}&=14+106=120\ \mathrm{B}.
\end{aligned}
$$

本例带回了完整的 78 字节原始数据报，因而能继续看到内层 UDP 的内容。**“原始首部＋数据开头”说明错误报告所引用的内容，实际引用长度可以更长。**

图中的 **Checksum** 状态 `Unverified`／`validation disabled` 表示没有执行对应校验，不能直接理解为校验失败； **ICMP** 自身的校验结果显示为 `correct`。

</details>


### Address Resolution Protocol

**地址解析协议（Address Resolution Protocol，ARP）** 根据同一链路上的 IPv4 地址，查询对应的 MAC 地址。以太网使用 48 bit 的 MAC 地址标识帧的发送者和接收者。

发送一个 IP 数据报，需要先确定下一跳，再填写这一跳的以太网首部：

- **目的主机在本地子网**：下一跳就是目的主机，查询它的 MAC 地址。
- **目的主机在其他子网**：按路由表选择下一跳，查询相邻路由器接口的 MAC 地址。

**IP 地址用于跨网络寻址和路由；MAC 地址用于当前链路上的帧交付。** 路由器先确定从哪个接口、向哪个下一跳转发，ARP 再补齐发送帧需要的地址。

#### Requests and Replies

发送方先查 **ARP 缓存**。没有可用映射时，在本地链路广播请求：“谁拥有这个 IP 地址？请告诉我你的 MAC 地址。”

1. **请求使用广播**：以太网目的地址为 `ff:ff:ff:ff:ff:ff`，本地链路上的设备都能收到。
2. **目标主机单播应答**：拥有目标 IP 的主机把自己的 MAC 地址发回请求方。
3. **记录映射并发送数据**：请求方保存 IP 到 MAC 的对应关系，再把 IP 数据报装入发往该 MAC 的帧。

ARP 请求同时携带发送者的 IP 和 MAC，因此应答方已经知道该向谁回复。交换机把广播送到同一广播域内的其他端口，路由器把广播限制在当前链路内。

ARP 直接封装在以太网帧中，EtherType 为 `0x0806`；其外面没有 IPv4 首部。

#### Example

1. **Two Hosts on the CS Network**

**CS 网络为 `192.32.65.0/24`，EE 网络为 `192.32.63.0/24`，二者通过路由器连接。Host 1 要向同一 CS 网络中的 Host 2 发送数据，已知 Host 2 的名字，如何完成地址解析和发送？**

地址配置为：

- CS 网络：Host 1 为 `192.32.65.7`、MAC 为 E1；Host 2 为 `192.32.65.5`、MAC 为 E2；路由器接口为 `192.32.65.1`、MAC 为 E3。
- EE 网络：Host 3 为 `192.32.63.3`、MAC 为 E5；Host 4 为 `192.32.63.8`、MAC 为 E6；路由器接口为 `192.32.63.1`、MAC 为 E4。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152417159.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：从主机名到以太网帧</summary>

**第一步，取得目的 IP。** Host 1 通过 DNS 查询 Host 2 的名字 `eagle.cs.uni.edu`，得到 `192.32.65.5`。

**第二步，判断是否同网。** 两台主机的地址与 `/24` 掩码按位与，结果均为 `192.32.65.0`，因此可以在 CS 网络中直接交付。

**第三步，广播查询 E2。** 若缓存未命中，Host 1 发出 ARP 请求：

> 谁拥有 `192.32.65.5`？请回复 `192.32.65.7`，我的 MAC 是 E1。

Host 2 发现目标 IP 是自己，单播回复自己的映射 `192.32.65.5 → E2`。Host 1 将其写入缓存。

**第四步，发送数据帧。** 以太网首部为 `E1 → E2`，其中封装的 IP 数据报为 `192.32.65.7 → 192.32.65.5`。

交换机把帧转发给 Host 2。Host 2 接收发往 E2 的帧，取出 IP 数据报，再向上交付。

</details>

2. **Reading an ARP Request**

**第 43 号帧显示 `Who has 192.168.1.156? Tell 192.168.1.145`，捕获长度为 42 B。分析发送者、查询对象及广播地址所在的位置。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152524954.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：以太网首部与 ARP 字段</summary>

以太网首部中的源 MAC 为 `18:4f:32:f7:e6:99`，目的 MAC 为 `ff:ff:ff:ff:ff:ff`，类型为 `ARP (0x0806)`。

ARP 内容为：

| 字段 | 值 | 含义 |
| --- | --- | --- |
| Hardware Type | 1 | 链路类型为以太网 |
| Protocol Type | `0x0800` | 解析 IPv4 地址 |
| Hardware Size | 6 | MAC 地址长 6 B |
| Protocol Size | 4 | IPv4 地址长 4 B |
| Opcode | 1 | ARP 请求 |
| Sender MAC | `18:4f:32:f7:e6:99` | 发送者的 MAC |
| Sender IP | `192.168.1.145` | 发送者的 IP |
| Target MAC | `00:00:00:00:00:00` | 待查询，暂填全 0 |
| Target IP | `192.168.1.156` | 希望解析的 IP |

**广播地址填写在以太网首部的目的 MAC 字段中；ARP 内部的 Target MAC 暂时未知。** 两处字段作用不同，所以一个为全 `ff`，另一个为全 `00`。

捕获部分包含 14 B 以太网首部和 28 B ARP 内容：

$$
14+28=42\ \mathrm{B}.
$$

收到应答后，发送方才能把发往 `192.168.1.156` 的数据帧填写为目标主机的实际 MAC。

</details>

#### ARP Cache and Gratuitous ARP

主机和路由器都维护 ARP 缓存，保存 **IP 地址、MAC 地址及老化时间**。再次向同一邻居发送时，可以直接使用缓存中的映射；表项老化后重新解析，以适应设备和地址的变化。

接收方还可以利用请求中的发送者信息更新缓存。例如 Host 2 收到前面的请求时，就能记录 `192.32.65.7 → E1`，回复数据时可直接使用。

**免费 ARP（Gratuitous ARP）** 主动广播本机的 IP 到 MAC 映射。它可以使用请求或应答格式，常见特征是发送者 IP 与目标 IP 相同。

它主要用于：

- **发现地址冲突**：查询自己准备使用或正在使用的 IP；若其他设备也声称拥有该地址，就需要处理冲突。
- **更新邻居缓存**：地址配置变化后，及时通告新的映射。
- **主备切换**：备用设备接管相同 IP 后，通告新的 MAC，使后续帧转向接管设备。

#### Example

**A Gratuitous ARP Reply**

**抓包中连续出现 `Gratuitous ARP for 10.162.0.1 (Reply)`，每帧 60 B。根据第 1 号帧判断它通告的映射，并解释为什么它是广播帧。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152533184.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：主动通告地址映射</summary>

| 字段 | 抓包值 |
| --- | --- |
| 以太网源 MAC | `74:3a:20:b9:e8:02` |
| 以太网目的 MAC | `ff:ff:ff:ff:ff:ff` |
| Opcode | 2，即 Reply |
| Sender IP | `10.162.0.1` |
| Sender MAC | `74:3a:20:b9:e8:02` |
| Target IP | `10.162.0.1` |
| Target MAC | `ac:d6:18:72:ec:04` |

发送者主动通告：

$$
\boxed{10.162.0.1\longrightarrow\texttt{74:3a:20:b9:e8:02}}.
$$

Sender IP 与 Target IP 相同，表示这次通告针对发送者自己的地址。Opcode 为 2，说明这里采用 ARP 应答格式。

**以太网目的 MAC 为全 `ff`，所以这是广播帧。** ARP 内容中的 Target MAC 为 `ac:d6:18:72:ec:04`，不改变外层帧的广播方式。

60 B 由 14 B 以太网首部、28 B ARP 内容和 18 B 填充组成；抓包中未列出 4 B FCS。

</details>

#### The Default Gateway

目的主机位于其他子网时，主机按路由表选择下一跳。**默认网关（Default Gateway）** 提供没有更具体路由时的转发出口，其地址是连接本地子网的路由器接口地址。

发送方用 ARP 查询网关的 MAC，IP 数据报仍填写最终目的主机的 IP。网关收到后，再继续查路由表并完成下一跳发送。

路由器直接管理自身各接口的地址。分组在其内部从输入接口转到输出接口，由路由表和转发逻辑完成；准备从以太网接口发出时，才需要取得相邻接收方的 MAC。

#### Example

1. **From the CS Network to the EE Network**

**Host 1（`192.32.65.7`，E1）向 Host 4（`192.32.63.8`，E6）发送数据。路由器的 CS 接口为 `192.32.65.1`、E3，EE 接口为 `192.32.63.1`、E4。两个接口分别连接 `/24` 子网，相关 ARP 缓存为空。求两次 ARP 的查询对象，以及两段传输的 IP 和 MAC 地址。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152539343.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：先交给网关，再送到目标</summary>

**第一步，Host 1 解析网关。** `192.32.63.8` 不属于本地的 `192.32.65.0/24`，因此下一跳为默认网关 `192.32.65.1`。Host 1 广播查询这个网关地址，得到 E3。

**第二步，Host 1 发送给路由器。** 以太网帧发往 E3，内部 IP 数据报仍发往 `192.32.63.8`。

**第三步，路由器解析 Host 4。** 路由器拆除收到的以太网首部，按目的 IP 查表，确定从 EE 接口转发；随后在 EE 网络广播查询 `192.32.63.8`，得到 E6。

**第四步，路由器重新封装。** 新帧使用 EE 接口的 E4 作为源 MAC，E6 作为目的 MAC，发送给 Host 4。

| 所在网络 | 源 IP | 目的 IP | 源 MAC | 目的 MAC |
| --- | --- | --- | --- | --- |
| CS 网络 | `192.32.65.7` | `192.32.63.8` | E1 | E3 |
| EE 网络 | `192.32.65.7` | `192.32.63.8` | E4 | E6 |

**这两次 ARP 分别查询网关和目标主机，发生在两个独立的广播域中。** 两段传输的源、目的 IP 保持不变；路由器转发时会递减 TTL，并更新 IPv4 首部校验和。

</details>

2. **Across Two Routers and Three Subnets**

**PC1 经过 R1、R2 向 PC2 发送数据。各路由器已有正确路由，相关 ARP 缓存为空，途中不进行 NAT。说明逐跳处理过程、ARP 查询对象及各段帧的地址。**

三个子网均为 `/24`，地址配置如下：

- **子网 1：`192.168.1.0/24`。** PC1 为 `192.168.1.11`、`MAC_PC1`；R1 的 fa3/0 为 `192.168.1.1`、`MAC_R1a`，是 PC1 的默认网关。
- **子网 2：`192.168.2.0/24`。** R1 的 fa0/1 为 `192.168.2.1`、`MAC_R1b`；R2 的 fa0/1 为 `192.168.2.2`、`MAC_R2a`。
- **子网 3：`192.168.3.0/24`。** R2 的 fa3/0 为 `192.168.3.1`、`MAC_R2b`，是 PC2 的默认网关；PC2 为 `192.168.3.22`、`MAC_PC2`。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152544711.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：三次 ARP 与逐跳重新封装</summary>

**1. PC1 构造 IP 数据报。**

源 IP 为 `192.168.1.11`，目的 IP 为 `192.168.3.22`。目标不在子网 1，PC1 选择默认网关 `192.168.1.1`。

**2. PC1 解析 R1 的入口接口并发送。**

PC1 在子网 1 广播查询 `192.168.1.1`，R1 的 fa3/0 回复 `MAC_R1a`。PC1 封装帧，源 MAC 为 `MAC_PC1`，目的 MAC 为 `MAC_R1a`。

**3. R1 查表，转向 R2。**

R1 接收发往自己接口的帧，取出 IP 数据报，按 `192.168.3.22` 查路由表，确定从自己的 fa0/1 发出，下一跳为 R2 的 `192.168.2.2`。

R1 在子网 2 查询 `192.168.2.2`，得到 `MAC_R2a`。随后重新封装，使用本机出口的 `MAC_R1b` 作为源 MAC，使用 `MAC_R2a` 作为目的 MAC。

**4. R2 查表，直接交付 PC2。**

R2 取出 IP 数据报，发现目的地址属于 fa3/0 直连的子网 3。它在这个子网查询 `192.168.3.22`，得到 `MAC_PC2`，再以 `MAC_R2b → MAC_PC2` 封装发送。

**5. PC2 接收。**

PC2 接收发往自身 MAC 的帧，取出目的 IP 为 `192.168.3.22` 的数据报，交给相应上层协议。

三段帧的地址变化为：

| 传输方向 | 源 MAC | 目的 MAC |
| --- | --- | --- |
| PC1 → R1 | `MAC_PC1` | `MAC_R1a` |
| R1 → R2 | `MAC_R1b` | `MAC_R2a` |
| R2 → PC2 | `MAC_R2b` | `MAC_PC2` |

三段传输的源 IP 都是 `192.168.1.11`，目的 IP 都是 `192.168.3.22`；经过 R1、R2 时，TTL 分别减 1。

本次共发生 **3 次 ARP 请求与应答**，查询对象依次为：

$$
\texttt{192.168.1.1},\quad
\texttt{192.168.2.2},\quad
\texttt{192.168.3.22}.
$$

**每个发送者只解析当前链路上的下一跳。** PC1 取得 R1 的 MAC 后即可发送，最后一跳由 R2 解析 PC2 的 MAC。

</details>

#### Proxy ARP

**代理 ARP（Proxy ARP）** 由路由器代替远端主机回应 ARP 查询，向请求方提供自己在本地链路上的 MAC。请求方随后把帧交给该路由器，路由器再按目的 IP 转发。

#### Example

**Answering for Host 4**

**仍使用 CS、EE 两网拓扑。假设 Host 1 把 Host 4 的 `192.32.63.8` 当作本地链路上的地址，直接发出 ARP 请求。路由器已启用代理 ARP，并有到 Host 4 的路由。Host 1 会得到哪个 MAC？随后如何发送？**

<details>
<summary>展开：代理应答与后续转发</summary>

Host 1 在 CS 网络广播查询 `192.32.63.8`。Host 4 位于 EE 网络，收不到这个本地广播。

路由器使用 CS 接口的 E3 代为应答，于是 Host 1 保存：

$$
\boxed{192.32.63.8\longrightarrow E3}.
$$

Host 1 发出的帧采用 `E1 → E3`，内部 IP 数据报仍为 `192.32.65.7 → 192.32.63.8`。路由器收到后，通过 EE 接口继续转发，帧地址改为 `E4 → E6`。

这里由路由器在 CS 网络中生成应答，Host 1 的原始 ARP 广播始终留在 CS 网络。

</details>

#### DNS and ARP

**域名系统（Domain Name System，DNS）** 把主机名解析为 IP 地址，查询对象可以位于远端网络。例如执行 `nslookup www.baidu.com`，可以查询该域名对应的 IP 地址。

ARP 处理本地链路上的 **IP 到 MAC 映射**。两者在一次发送中的位置为：

1. 已知主机名时，先用 DNS 得到目的 IP。
2. 根据目的 IP 查路由，确定当前下一跳。
3. 用 ARP 缓存或 ARP 查询取得下一跳的 MAC，完成帧封装。

ARP 连接了 IPv4 寻址与链路层交付，工作范围跨越这两个层次的交界。

## Routing in the Internet

### Autonomous Systems

**自治系统（Autonomous System，AS）** 是由同一管理机构控制、采用统一路由策略的一组网络和路由器。一个大学、企业或运营商可以管理自己的 AS，再通过边界路由器与其他 AS 互联。

把整个 Internet 当作一个路由域，会遇到两个问题：

- **规模。** 全网拓扑、路由表和更新消息过多，存储、计算与传播开销都很大。
- **管理自治。** 不同机构需要自行决定内部协议、链路代价和对外转发策略。

因此，Internet 采用两级路由：

1. **域内路由（Intradomain Routing）**：在一个 AS 内寻找路径，使用内部网关协议（IGP），如 RIP、OSPF。
2. **域间路由（Interdomain Routing）**：在 AS 之间交换可达信息，使用 BGP。

不同 AS 可以选择不同的域内协议。跨 AS 的可达信息通过 BGP 交换，数据分组在各个 AS 内再沿其内部路由传送。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152551013.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

Internet 的主要骨干包括 **Tier-1 网络**，它们使用高速链路和路由器，与区域网、ISP、数据中心等互联；家庭、学校、企业和移动网络再接入这些网络。网络之间也可以直接互联，因此整体包含多种层次和横向连接。**IP 为这些不同网络提供共同的数据报格式和寻址方式。**

### Devices and Forwarding

不同设备处理的对象和转发依据不同：

- **中继器、集线器** 工作在物理层，转送信号或比特。
- **网桥、二层交换机** 工作在数据链路层，根据目的 MAC 地址转发帧。
- **路由器** 工作在网络层，从帧中取出 IP 分组，根据目的 IP 查表，再按输出链路重新封装。
- **高层网关** 可以在运输层或应用层进行协议转换。

### Routing Information Protocol

**路由信息协议（[Routing Information Protocol](https://www.rfc-editor.org/rfc/rfc2453.html)，RIP）** 使用距离向量算法，以 **跳数** 衡量路径代价。每个路由器维护目的子网、下一跳和距离，并与邻居交换到各个子网的距离。

在下面的计数方式中，直连目标子网计 **1 跳**；经过一个邻居再到目标子网，就把邻居通告的距离加 1。

$$
D_x(y)=\min_v\{1+D_v(y)\}.
$$

RIP 的几个数值要分清：

- **有效距离最大为 15，16 表示不可达。** 跳数上限限制了适用的网络规模。
- 邻居约每 **30 秒** 交换一次路由通告，路由发生变化时也可以触发更新。
- 使用 **UDP 520 端口** 发送请求和响应。
- 一个普通响应最多携带 **25 条路由项**；RIPv2 使用占用一个条目位置的认证项时，可携带 24 条路由项。

RIP 的更新依赖邻居逐步传播，因此仍需处理距离向量算法中的无穷计数与收敛问题。**RIP 服务于网络层路由，协议处理可以由应用进程实现，通过 UDP 交换报文。** 得到的路由用于指导 IP 分组转发。

#### Example

1. **Counting Hops to Six Subnets**

**A、B、C、D 形成四边形连接。A 直连子网 u，B 直连 v、w，C 直连 z，D 直连 x、y。求 A 到六个子网的 RIP 跳数。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152557386.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

A 直接到达 u，因此距离为 1。

经过 B 到 v、w，经过 C 到 z，距离都为 2。到 x、y 需要先到 D，可以经过 B 或 C，距离为 3。

$$
\boxed{
\begin{aligned}
D_A(u)&=1,\\
D_A(v)=D_A(w)=D_A(z)&=2,\\
D_A(x)=D_A(y)&=3.
\end{aligned}}
$$

例如到 x 的一条路径是 $A\rightarrow B\rightarrow D\rightarrow x$，按本例的子网跳数计为 3。

</details>

2. **Updating Router D's Table**

**D 当前的路由表如下。约 30 秒后，A 通告：到 z 经 C、距离为 4；w、x 都是 A 的直连子网，距离为 1。D 如何更新？**

| 目的子网 | D 当前的下一跳 | 当前跳数 |
| --- | --- | --- |
| w | A | 2 |
| y | B | 2 |
| z | B | 7 |
| x | 直连 | 1 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152601646.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152607223.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：先加上到邻居的一跳，再比较</summary>

D 经 A 到 z 的候选距离为：

$$
1+D_A(z)=1+4=5<7.
$$

因此更新为：

$$
\boxed{\text{目的子网 }z,\quad\text{下一跳 }A,\quad\text{跳数 }5}.
$$

A 自己到 z 的下一跳是 C；D 先把分组交给 A，所以 **D 的下一跳填写 A**。

其余已列出的路由保持原值：到 w 经 A 仍为 $1+1=2$；到 x 经 A 为 2，大于直连的 1；到 y 仍经 B、距离为 2。

</details>

### Open Shortest Path First

**开放最短路径优先（[Open Shortest Path First](https://www.rfc-editor.org/rfc/rfc2328.html)，OSPF）** 使用链路状态算法。路由器发布相邻链路及其代价，通过洪泛交换信息，建立 **链路状态数据库（Link-State Database，LSDB）**，再以自己为根运行 Dijkstra 算法。

同一区域内的路由器最终获得一致的拓扑信息；各自计算的树以不同路由器为根，因此得到的下一跳可以不同。

**链路状态变化会触发更新；即使内容没有变化，自生成的链路状态通告（LSA）也会在 30 分钟时刷新。** OSPF 报文直接封装在 IP 中，IPv4 首部的 **Protocol = 89**。

#### Link Costs and Equal-Cost Paths

OSPF 将路由器和网络抽象成带权有向图。一条路径的代价是沿途输出接口代价之和：

$$
C(P)=\sum_{e\in P}c(e).
$$

链路的两个方向可以配置不同代价。对于共享局域网，可以增加一个代表该网络的节点：路由器到网络的边具有接口代价，网络到路由器的边取 0，从而避免重复计算穿越该网络的代价。

如果到同一目的地存在多条最短路径，OSPF 可以保留这些路径并分担流量，这称为 **等价多路径（Equal-Cost Multipath，ECMP）**。比较的是完整路径的总代价。

#### Example

1. **Representing an AS as a Directed Graph**

**R1、R2、R3 通过点到点链路互联，R3、R4、R5 连接在共享 LAN 3 上，R5 再连接 LAN 4。如何把网络画成带权图？R1 到 LAN 4 的一条最短路径代价是多少？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152612695.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：有向边与共享网络节点</summary>

点到点链路分别画出两个方向。例如 $R2\rightarrow R3$ 的代价为 7，$R3\rightarrow R2$ 的代价为 8。

共享 LAN 3 用一个网络节点表示。进入它的代价分别为：R3 为 3、R4 为 3、R5 为 4；从 LAN 3 到各路由器的代价均为 0。

R1 到 LAN 4 可以经过：

$$
R1\rightarrow R3\rightarrow\mathrm{LAN\ 3}\rightarrow R5\rightarrow\mathrm{LAN\ 4},
$$

代价为：

$$
5+3+0+5=\boxed{13}.
$$

若先经过 R2 再到 R3，代价为 $4+7+3+0+5=19$，所以不会选择这条更长的路径。

</details>

2. **Calculating Interface Costs**

**以 100 Mb/s 为参考带宽，根据接口带宽计算代价。为什么 100 Mb/s、1 Gb/s 和 10 Gb/s 的接口都可能得到 1？**

<details>
<summary>展开：参考带宽与整数代价</summary>

这组带宽代价使用：

$$
c=\max\left(1,\left\lfloor\frac{100\ \mathrm{Mb/s}}{B}\right\rfloor\right).
$$

| 接口 | 带宽 | Cost |
| --- | --- | --- |
| 串行接口 | 1.544 Mb/s | 64 |
| E1 | 2.048 Mb/s | 48 |
| Ethernet | 10 Mb/s | 10 |
| Fast Ethernet | 100 Mb/s | 1 |
| Gigabit Ethernet | 1000 Mb/s | 1 |
| 10 Gigabit Ethernet | 10000 Mb/s | 1 |
| ATM | — | 1 |

例如：

$$
\left\lfloor\frac{100}{1.544}\right\rfloor=64,\qquad
\left\lfloor\frac{100}{2.048}\right\rfloor=48.
$$

带宽越高，计算出的代价越小；最小代价取 1，因此达到参考带宽后，这组设置无法继续区分更高速的接口。需要区分这些链路时，可以提高参考带宽或手动配置接口代价。

</details>

#### Areas and Router Roles

OSPF 可以把一个 AS 划分为多个 **区域（Area）**。各区域内部维护详细拓扑，向外提供目的网络及到达代价，减少拓扑信息的传播和计算范围。

**Area 0 是骨干区域。** 其他区域与骨干相连，必要时通过虚链路建立逻辑连接。跨区域的路径经过源区域、骨干区域、目的区域。

路由器按所在位置和承担的任务分为：

- **内部路由器（Internal Router）**：所有 OSPF 接口属于同一区域。
- **骨干路由器（Backbone Router）**：至少一个接口属于 Area 0。
- **区域边界路由器（Area Border Router，ABR）**：连接骨干和其他区域，分别维护所连接区域的 LSDB，并向其他区域通告网络可达信息和代价。
- **AS 边界路由器（AS Boundary Router，ASBR）**：向 OSPF 引入 AS 外部的路由。

**这些角色可以重叠。** 例如 ABR 同时是骨干路由器；一台骨干路由器也可以承担 ASBR 的任务。

ABR 为各区域分别运行最短路径计算。同一区域内的通信使用区域内路径，跨区通信结合区域内路径和 ABR 通告的信息选择出口。

**末梢区域（Stub Area）** 可以通过配置阻止 AS 外部 LSA 进入，访问 AS 外部目的地时使用 ABR 提供的默认路由，从而减小区域内的数据库。

#### Example

**Routing between Area 2 and Area 1**

**一个 AS 包含中央的 Area 0、左侧的 Area 2 和右侧的 Area 1。Area 2 通过一个 ABR 连接骨干。Area 2 中的主机如何到达 Area 1？图中的几种路由器各承担什么任务？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152617862.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：区域内路径与跨区路径</summary>

分组先到达 Area 2 的 ABR，进入 Area 0，再经连接 Area 1 的 ABR 到达目的区域，最后沿 Area 1 内部路径送达主机。

Area 2 内的路由器掌握本区域拓扑，利用 ABR 通告的可达信息选择跨区出口。ABR 掌握自己所连接的各区域拓扑，但其他区域只需获得可达网络和代价。

图中左侧连接 Area 2 和骨干的节点是 ABR；中央只参与骨干转发的节点是骨干路由器；右上方连接外部网络并引入外部路由的节点是 ASBR；Area 1 内部的节点是内部路由器。

Area 2 被配置为 Stub 区域。它访问 AS 外部网络时，可以把分组按默认路由交给 ABR。

</details>

#### Neighbors and Adjacencies

路由器通过 **Hello** 报文发现并维护邻居关系；满足条件的邻居进一步建立 **邻接关系（Adjacency）**，同步链路状态数据库。

在广播型多路访问网络上，如果每台路由器都与其余路由器同步数据库，开销会随路由器数量迅速增长。因此，在该网络上选出 **指定路由器（Designated Router，DR）** 和 **备用指定路由器（Backup Designated Router，BDR）**。

普通路由器与 DR、BDR 建立邻接，普通路由器之间可以只保持邻居关系。BDR 同样保持数据库同步，在 DR 故障后接替其工作。

DR 协调该网络上的链路状态交换；数据分组仍按计算出的路由转发。

#### OSPF Messages

OSPF 使用五类报文完成邻居发现、数据库同步和可靠洪泛：

| 报文 | 作用 |
| --- | --- |
| Hello | 发现、维护邻居，参与 DR／BDR 选举 |
| Database Description | 交换数据库摘要，比较已有 LSA |
| Link State Request | 请求缺失或较新的 LSA |
| Link State Update | 携带一个或多个 LSA |
| Link State Acknowledgment | 确认收到的 LSA |

建立邻接的过程中，双方先比较数据库摘要，再请求缺失或较新的信息，通过更新报文传送并确认。

**LSA 的序号用于判断新旧，确认与重传使洪泛可靠。** 新信息逐步传遍区域，使路由器的数据库收敛到一致状态，再据此更新最短路径和路由表。

### Border Gateway Protocol

**边界网关协议（Border Gateway Protocol，BGP）** 用于自治系统之间交换路由。每个 AS 由 **自治系统号（ASN）** 标识，通告的目的地用 CIDR 前缀表示，可以对应一个子网或一组聚合后的子网。

BGP 采用 **路径向量（Path Vector）**：记录到达目的前缀要经过哪些 AS，并结合本地策略选择路由。跨 AS 的路径选择还涉及费用、安全和管理要求，距离短的路径也可能不被采用。

BGP 对等体通过 **TCP 179 端口** 建立连接、交换路由信息。

#### Policies and Interconnection

不同 ISP 可以在 **互联网交换点（Internet Exchange Point，IXP）** 互联，交换路由和流量。

只有一个对外出口的末端网络（Stub Network），通常设置默认路由即可。连接多个 ISP 的 **多宿主网络（Multihoming）** 则可以利用 BGP 宣告自己的前缀、选择出口，并在一条外部链路故障时使用其他链路。

#### Example

**Routing Policy Constraints**

**跨自治系统的路由，为什么不能只比较路径长度？以下五种限制分别会怎样影响选路？**

考虑以下五种策略设定：

1. 教育网不承载商业流量。
2. 五角大楼的流量避开经过伊拉克的路径。
3. TeliaSonera 的费用低于 Verizon，优先使用前者提供的路径。
4. AT&T 在澳大利亚的某条路径性能较差，避开这条路径。
5. 以 Apple 为起点或终点的流量不经过 Google。

<details>
<summary>展开解答</summary>

这五条约束依次限制业务类型、经过的地区、使用的提供商、具体链路以及允许经过的网络，分别来自业务范围、安全、费用、性能和组织之间的关系。

**先满足策略，再比较候选路径。** 被策略排除的路径，即使经过的 AS 较少，也不会被采用。

</details>

#### eBGP and iBGP

- **eBGP**：在不同 AS 的路由器之间交换路由。
- **iBGP**：在同一个 AS 内传播 BGP 路由，让其他路由器也知道外部前缀可以从哪里到达。

域内的 OSPF 等协议负责计算到下一跳、出口路由器的内部路径。**iBGP 分发外部可达信息，IGP 提供内部可达性。**

#### Example

**Sharing an External Prefix**

**AS1 中有路由器 1a、1b、1c、1d。1c 与 AS3 的 3a 相连，1b 与 AS2 的 2a 相连。1c 从 AS3 学到一个新前缀后，AS1 中的其他路由器怎样使用这条路由？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152622702.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

1. 3a 通过 eBGP 向 1c 通告外部前缀。
2. 1c 通过 iBGP 把这条路由传播给 AS1 内的其他 BGP 路由器。
3. 各路由器根据策略选择路由；选中的路由及其下一跳用于建立转发表项。
4. 发送数据时，域内路由把分组送到相应出口，再交给相邻 AS。

同理，1b 从 AS2 学到的路由也需要在 AS1 内传播。这样，1a、1d 等路由器都能选择合适的外部出口。

</details>

#### Routes and Path Attributes

一条 BGP 路由由 **目的前缀和路径属性** 组成。两个重要属性是：

- **AS_PATH**：到达前缀所经过的 AS 序列，用于选路和检测 AS 级环路。
- **NEXT_HOP**：到达该前缀所使用的下一跳 IP 地址。它可以是本 AS 内较远的出口，需要通过域内路由找到通往它的具体路径。

向另一个 AS 通告路由时，路由器把自己的 ASN 加到 AS_PATH 前面。收到路由后，如果 AS_PATH 已经包含自己的 ASN，就丢弃这条通告，避免形成 AS 级环路。在本 AS 内通过 iBGP 传播时，AS_PATH 保持不变。

**路由通告由目的网络向外传播；数据分组沿学到的路由走向目的网络。**

#### Example

**Propagating a Route to Prefix C**

**前缀 C 位于 AS3。AS2 为 AS1 和 AS3 提供中转，上下两条路径分别经过 R3a、R2c、R2a、R1a，以及 R3b、R2d、R2b、R1b。写出各位置的 AS_PATH 和 NEXT_HOP，并说明数据与通告的方向。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152646528.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

图中所有通告的目的前缀都是 C。NEXT_HOP 用路由器名代指其相应接口的 IP 地址。

| 通告位置 | AS_PATH | NEXT_HOP |
| --- | --- | --- |
| R3a 向 R2c 通告 | AS3 | R3a |
| R2a 向 R1a 通告 | AS2, AS3 | R2a |
| AS1 内的上路表项 | AS2, AS3 | R1a |
| R3b 向 R2d 通告 | AS3 | R3b |
| R2b 向 R1b 通告 | AS2, AS3 | R2b |
| AS1 内的下路表项 | AS2, AS3 | R1b |

AS3 发出通告时，路径为 `AS3`。AS2 向 AS1 转发通告时，在前面加入自己的编号，得到 `AS2, AS3`。之后在 AS1 内传播，AS_PATH 不变。

图中在 AS 内把出口 R1a 或 R1b 设为 NEXT_HOP，可通过 `next-hop-self` 配置实现；**iBGP 默认保留传入的 NEXT_HOP。**

通告从 C 向左传播；A、B 发往 C 的数据向右传送。上路数据经过 R1a、R2a、R2c、R3a，下路经过 R1b、R2b、R2d、R3b，最后到 C。

</details>

#### Transit and Peering

**中转服务（Transit）**：客户向提供商付费，由提供商承载去往其他网络以及返回客户网络的流量。

**对等互联（Peering）**：两个网络按约定直接交换彼此及各自客户的流量，减少经上游提供商中转的开销。

两种关系决定了通告哪些路由、允许转发哪些流量。一个网络愿意交换对方发给自己的流量，并不自动承担对方去往第三方的中转。

#### Example

**Four Autonomous Systems**

**AS2、AS3、AS4 都向 AS1 购买中转服务；AS2 与 AS3 对等互联，AS3 与 AS4 也对等互联。A、B、C 分别接入 AS2、AS3、AS4。A 向 C 发送分组时走哪条路径？能否通过 AS3 免费中转？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152652722.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

A 向 C 发送数据，路径为 **AS2 → AS1 → AS4**。

相应的路由通告方向为 **AS4 → AS1 → AS2**：

1. AS4 向 AS1 宣告自己可以到达 C。
2. AS1 再把到 C 的路由通告给客户 AS2。
3. AS2 据此把发往 C 的数据交给 AS1，由 AS1 中转到 AS4。

AS2 与 AS3 可以直接交换 A、B 之间的流量；AS3 与 AS4 可以直接交换 B、C 之间的流量。

但 AS3 没有承诺为 AS2 和 AS4 提供免费中转。因此，AS3 不向 AS2 导出从对等方 AS4 学到的 C 路由，也不向 AS4 导出从对等方 AS2 学到的 A 路由。**物理上连通的 AS2 → AS3 → AS4 路径，不满足这里的中转策略。**

</details>

#### Route Selection and Hot-Potato Routing

BGP 策略作用在两个位置：

- **路由导出**：只向允许使用该路径的邻居通告路由。
- **路由选择**：从学到的候选路由中选择本地偏好的路径。

一种常用的选路策略是：先优先客户路径、再考虑对等路径，最后考虑付费上游路径；策略优先级相同时，再比较 AS_PATH 长度等属性。

AS_PATH 较短表示经过的 AS 较少。不同 AS 的内部规模差别很大，因此它不能直接表示物理距离或总时延。

当其他优先条件相同时，可以选择 **域内代价最低的出口**，尽快把流量交给下一个 AS。这称为 **热土豆路由（Hot-Potato Routing）**，也叫就近出口。

#### Example

**Choosing the Nearest Exit**

**沿用前面的两条路径。A 靠近 R1a，B 靠近 R1b，C 靠近 AS3 的上方出口。假设两条路由的策略优先级和 AS_PATH 长度相同，采用就近出口时，A、B 怎样到达 C？C 返回 B 时会沿原路返回吗？**

<details>
<summary>展开解答</summary>

A 经域内代价较小的 R1a 离开 AS1，使用上方路径；B 经 R1b 离开 AS1，使用下方路径。AS2 也按自己的域内代价选择出口。

B 发往 C 的数据经下路进入 AS3，再由 AS3 内部转发到 C。

C 返回 B 时，会从较近的上方出口离开 AS3，经 AS2 上路进入 AS1，再在 AS1 内转发到 B。**去程和回程可以不同。**

这也说明域内路由的代价会影响 BGP 出口选择。同一个 AS 中，不同位置的路由器可以为同一目的前缀选择不同出口。

</details>

#### BGP Queries and Traceroute

1. **Reading Announced Prefixes**

**一次 BGP Toolkit 查询显示，访问源地址为 `222.205.46.119`，相关通告包括 `222.205.0.0/17`、`222.205.0.0/16` 和 `222.192.0.0/12`。这些前缀都包含该地址吗？如果路由表同时安装了这三条路由，应选择哪条？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152657589.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

三个前缀的地址范围分别为：

- `222.205.0.0/17`：`222.205.0.0–222.205.127.255`。
- `222.205.0.0/16`：`222.205.0.0–222.205.255.255`。
- `222.192.0.0/12`：`222.192.0.0–222.207.255.255`。

`222.205.46.119` 同时落在三个范围内，因此选择 **`222.205.0.0/17`**，它的匹配前缀最长。

该 IPv4 地址的查询结果将 ISP 标为 **AS4538**。

</details>

2. **Looking Up an Autonomous System**

**在 BGP Toolkit 中搜索 `Zhejiang University`，结果显示 `AS24367 — CERNET2 IX at Zhejiang University`。如何理解这条记录？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152701943.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

`AS24367` 是这条记录中的自治系统号，描述指向浙江大学的 **CERNET2 IPv6 交换节点**。

IX 表示网络交换点：不同网络在这里互联，通过 BGP 交换可达信息，并交换相应流量。

</details>

3. **Tracing a Route to 8.8.8.8**

**执行 `tracert 8.8.8.8`，记录中第 14 跳出现 `as6453.net`，第 10、15 跳超时，第 19 跳到达 `dns.google [8.8.8.8]`。从这些结果能读出哪些信息？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152705440.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开解答</summary>

第 14 跳为：

```text
ix-xe-1-2-0-0.tcore1.hk2-hongkong.as6453.net
180.87.112.109
RTT：66 ms、67 ms、66 ms
```

主机名中的 `as6453` 提供 AS 归属线索，`hongkong` 提供节点位置线索。

第 19 跳收到 `8.8.8.8` 的应答，三个 RTT 为 **70 ms、69 ms、71 ms**，本次探测已经到达目的地。第 10、15 跳超时，但后续仍有应答，说明这些超时没有阻止此次探测继续到达后面的节点。

**Tracert 显示逐跳路径，AS_PATH 显示经过的自治系统。** 一个 AS 内可以经过多台路由器，两种路径的计数范围不同。

</details>

## Multiprotocol Label Switching

**多协议标签交换（Multiprotocol Label Switching，MPLS）** 在分组前增加标签。进入 MPLS 网络后，路由器根据固定长度的标签查表，决定输出接口及标签操作；离开该网络后，分组可以继续按 IP 地址转发。

IP 转发使用目的地址做最长前缀匹配。标签转发使用当前标签查找已建立的映射，便于把多条流组织到共同路径上，也便于按业务要求安排路径和服务等级。

### Label Stack Entry

MPLS 标签栈位于 **数据链路层首部与网络层首部之间**，常被称为“第 2.5 层”。原有 IP 首部仍然保留，所以标签交换可以与 IP 数据报转发配合使用。

每个标签栈项占 **32 bit，即 4 B**，包含四个字段：

| 字段 | 长度 | 作用 |
| --- | --- | --- |
| Label | 20 bit | 用于查找标签转发表 |
| TC／QoS | 3 bit | 表示流量类别，用于区分转发处理 |
| S | 1 bit | 栈底标志，最底层标签为 1，其他标签为 0 |
| TTL | 8 bit | 限制分组可继续转发的跳数，耗尽时丢弃 |

**20 bit 是标签字段的长度，4 B 是一个完整标签栈项的长度。** 多个标签叠加时，每增加一个栈项就增加 4 B。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152711550.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中的 TCP 段先封装进 IP 分组，前面加入 MPLS 标签栈项，再装入 PPP 帧。每经过一跳，链路层封装按该跳的链路协议处理。

### Label Switching

**标签交换路由器（Label Switching Router，LSR）** 根据输入标签查表，需要时结合输入接口，得到输出接口和相应操作。典型的转发表关系为：

$$
(\text{输入接口},\text{输入标签})
\longrightarrow
(\text{输出接口},\text{输出标签或出栈操作}).
$$

**标签只在局部有意义。** 相邻路由器通过控制协议约定标签的含义，经过一跳时按表完成映射。不同链路上的相同数值可以对应不同的转发处理。

边缘的 **标签边缘路由器（Label Edge Router，LER）** 负责把普通分组接入标签路径，或在离开时移除标签。常见操作有：

- **Push**：压入标签，把分组送入一条标签路径。
- **Swap**：替换栈顶标签，沿路径继续转发。
- **Pop**：弹出栈顶标签，露出下一层标签或原来的 IP 分组。

### Forwarding Equivalence Classes

**转发等价类（Forwarding Equivalence Class，FEC）** 把采用相同转发处理的分组归为一组。分类可以结合目的前缀、出口、业务类别等信息。

多个流如果要经过同一段路径，并接受相同的转发处理，可以在这一段使用同一套标签映射。它们仍携带各自的 IP 首部，离开公共路径后，可以按最终目的地址继续分流。

#### Example

**Forwarding and Aggregating IP Packets**

**若干 IP 分组要穿过同一个 MPLS 网络，最终目的主机可以不同。入口、内部和出口路由器分别做什么？为什么多个流共享标签路径后仍能到达各自的目的地？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152716061.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：入口分类、内部换标、出口继续按 IP 转发</summary>

**入口 LER** 检查目的 IP 及其他分类字段，确定 FEC 和相应路径，然后压入标签。

**内部 LSR** 按栈顶标签查表，确定输出接口及下一跳使用的标签，完成标签交换。

**出口 LER** 移除已经完成任务的标签，得到原来的 IP 分组，再根据最终目的地址继续转发。

因此，多个最终目的地可以共享一段标签路径。**标签指导公共路段上的转发，保留的 IP 目的地址用于后续区分。**

</details>

### Label Stacks

MPLS 可以叠加多个标签，形成 **标签栈（Label Stack）**。当前转发主要使用栈顶标签；到达这一层路径的终点后，弹出栈顶，继续处理下一层。

栈底是最靠近 IP 首部的标签，其 **S = 1**；其他标签的 **S = 0**。S 表明弹出当前栈项后，下面是否还有标签。

#### Example

**Sharing a Path with an Outer Label**

**若干分组已经带有不同标签，但接下来都要经过同一段公共路径。如何让公共路径只维护一套转发关系，同时保留分组之后的不同转发需求？**

<details>
<summary>展开：外层共享，内层保留</summary>

在公共路径入口，为这些分组再压入一层外部标签。公共路段按外层标签转发，原来的不同标签保留在内层。

到达公共路径出口后，弹出外层标签，各分组重新露出原有标签，再按各自的后续路径处理。

若恰好有两层标签，外层的 S 为 0，内层的 S 为 1。移除外层后仍有标签；移除内层后才露出 IP 分组。

两层标签增加的总长度为：

$$
2\times4=\boxed{8\ \mathrm{B}}.
$$

</details>

### Establishing Label-Switched Paths

**标签交换路径（Label-Switched Path，LSP）** 是分组按标签转发表经过的一条路径。路由和标签分发由网络内的控制协议完成，终端主机可以直接发送普通 IP 数据报。

一种建立过程为：

1. 路由器确定自己可到达的目的前缀，将相应分组归入 FEC，并为 FEC 分配标签。
2. 将标签与 FEC 的绑定关系通告给邻居。
3. 上游路由器结合已有路由，确定下一跳及其分配的标签，建立本地转发表项，再向更上游通告自己的标签绑定。
4. 逐跳形成连续的标签转发路径，入口即可把分组送入这条路径。

**控制协议负责建立和更新表项，数据分组到达后按现有表项转发。** 网络还可以按带宽、服务等级等要求设置路径和安排资源。

### Interworking across Different Networks

不同链路可以采用不同的帧格式、最大分组大小和转发方式。只要共同承载 IP 分组，端点就可以通过统一的网络层服务通信。

#### Example

**From Wi-Fi through MPLS to Ethernet**

**源主机接入 802.11 网络，中间经过 MPLS 网络，目的主机位于 Ethernet。分组经过三种网络时，哪些信息保留，哪些封装变化？后续链路能容纳的分组较小时怎么办？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123152721815.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：共同 IP 层与逐段封装</summary>

源主机把运输层数据装入 IP 分组，再封装为 802.11 帧。第一台路由器取出 IP 分组，确定进入 MPLS 的路径，加入标签后继续转发。

离开 MPLS 网络时，移除相应标签，再根据下一段 Ethernet 的要求封装以太网帧。目的主机取出 IP 分组，将数据交给相应的运输层协议。

**端点的源、目的 IP 地址贯穿整个过程，下层封装随网络变化。** MPLS 中的标签路径可以与两端的数据报传送配合使用。

若 IPv4 数据报超过后续链路的 MTU，且允许分片，路由器会将它分成可通过该链路的多个片；各片携带 IP 首部，最后由目的主机重组。图中最后一段画出的多个分组对应这种分组大小的调整。

</details>
