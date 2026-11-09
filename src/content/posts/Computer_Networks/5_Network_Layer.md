---
title: The Network Layer
published: 2026-11-09
description: 网络层概述、链路状态与距离向量路由、层次路由、广播／多播／任播，以及 IPv4 首部基础；
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

转发表的索引取决于网络采用的服务方式：数据报网络主要按目的地址查找；虚电路网络按连接标识查找。简化后，一条转发表项可以写成：

$$
\text{目的地}\longrightarrow\text{输出接口／下一跳}.
$$

表项会随路由更新而改变。对某个分组执行转发时，使用当前已经得到的转发信息。

### Store-and-Forward Packet Switching

**存储转发（Store-and-Forward）**：先接收完整分组，完成相应检查；检测出错误则丢弃，通过检查后再向下一跳发送。分组接收需要时间，输出链路忙时还要在缓冲区等待。

```text
完整接收 → 检查 → 查转发表 → 等待输出链路 → 发送至下一跳
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109152431.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中的 H1 先把分组交给 A；分组经过 ISP 内部的路由器，到达 E，再经 F 所连接的局域网抵达 H2。**每一跳完成局部转发，沿途共同完成从 H1 到 H2 的交付。**

### Services Provided to the Transport Layer

网络层向运输层提供服务时，需要满足三个设计目标：

1. 服务独立于路由器采用的具体技术。
2. 隐藏路由器的数量、类型和网络拓扑。
3. 网络地址采用统一的编号体系。

运输层可以使用统一的网络层接口，不必逐一处理底层不同网络的差异。

网络层可以提供 **无连接服务** 或 **面向连接服务**，相应的典型实现是数据报网络和虚电路网络。

### Connectionless Service

**数据报网络（Datagram Network）** 中，发送前无须建立网络层连接。每个分组携带目的地址，路由器按当前转发表独立处理。

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

**虚电路网络（Virtual-Circuit Network）** 先建立一条逻辑路径，沿途路由器保存连接状态；数据分组随后沿这条路径传送，通信结束后释放状态。

```text
建立虚电路 → 沿虚电路传送分组 → 释放虚电路
```

分组携带较短的 **虚电路标识（VC Identifier）**。转发表记录的关系为：

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

| 比较项 | 数据报网络 | 虚电路网络 |
| --- | --- | --- |
| 发送前建立连接 | 无须 | 需要 |
| 分组中的寻址信息 | 完整的源、目的地址 | 较短的虚电路标识 |
| 路由器保存的状态 | 无须为每条连接保存专用状态 | 每条虚电路需要相应表项 |
| 路径选择 | 每个分组按当前转发表独立转发 | 建立虚电路时选路，后续沿该路径传送 |
| 路由器故障 | 可能丢包，路由恢复后可改走其他路径 | 经过故障路由器的虚电路受到影响 |
| 服务质量与拥塞控制 | 逐连接预留和控制较困难 | 可在建立连接时分配资源，较容易实现 |

**虚电路便于提前安排资源，但服务质量仍取决于是否实际预留了足够资源。** 数据报网络中，路由器不保存逐连接状态，也仍然需要保存转发表。

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

- **全局信息算法**：掌握完整拓扑和全部链路代价，再计算最短路径。链路状态路由属于这一类。
- **分散式算法**：通过邻居交换信息，分布式地迭代计算路径。距离向量路由属于这一类。

这里“全局”描述算法使用的信息范围。各路由器可以拥有相同的拓扑信息，然后分别进行计算。

**按是否适应网络变化分类：**

- **静态路由（Static Routing）**：由管理员配置，拓扑变化后通常需要人工修改。
- **动态路由（Dynamic Routing）**：根据链路和网络状态更新路由，具有自适应性；同时需要处理路由环路、收敛和振荡。

网络扩大后，完整拓扑的维护成本会上升，距离向量的传播与收敛也会变得困难，因此还需要层次路由。

### Static Routing

静态路由由管理员指定“到某个目的网络，应从哪个接口或经过哪个下一跳发送”。小型、稳定的网络比较容易管理；路径变化后需要检查并调整有关路由。

### Link-State Routing

**链路状态路由（Link-State，LS）**：每台路由器通告自己的邻居及链路代价；链路状态信息传播后，各路由器构建网络拓扑，再独立计算最短路径。

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

固定一个目的节点，为各节点选择通向它的最短路径，可以形成以该目的节点为根的 **汇聚树（Sink Tree）**。沿树中的下一跳持续转发，就能到达目的地。

与之对应，**源树（Source Tree）** 固定一个出发点，表示从该点到其他节点的路径。

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

选定其中一条，就能构造相应的汇聚树，因此 **汇聚树不一定唯一**。若同时保留所有等价路径，得到的结构可以是有向无环图。

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

### Oscillation in Link-State Routing

如果链路代价随流量变化，选路会改变流量，变化后的流量又会改变下一轮选路，可能形成 **路由振荡（Oscillation）**。

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

### Distance-Vector Routing

**距离向量路由（Distance-Vector，DV）** 让节点与直接邻居交换“到各个目的地的距离”，再利用邻居的结果更新自己的距离。

它具有三个特点：

- **分布式**：各节点分别计算，只与直接邻居交换信息。
- **迭代式**：更新结果会继续影响邻居，重复计算直到稳定。
- **异步**：各节点无须同时执行，收到新信息就可以更新。

LS 使用完整拓扑计算；DV 使用“本地链路代价＋邻居通告的距离”计算。RIP 是 DV 的应用；BGP 采用相关的路径向量思想，后续再讨论它携带的路径信息。

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

没有新变化需要传播时，算法进入 **静止状态（Quiescent State）**。节点仍然保留对后续事件的响应能力。

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

其余节点重新计算后也不再改变，网络进入静止状态。

注意，第一次交换完成后，x 已经算出自己的新向量 $(0,2,3)$，但缓存的 z 向量仍是旧的 $(7,1,0)$；到第二次交换时，才得到 z 的新向量 $(3,1,0)$。

最终：x 到 z 走 x → y → z，z 到 x 走 z → y → x，代价均为 3。

这里按“轮”展示信息传播；异步执行时，各节点收到和处理通告的时间可以不同。

</details>

### The Count-to-Infinity Problem

DV 的一个重要问题是 **坏消息可能传播很慢**。邻居通告一个距离时，通常不附带完整路径，接收方无法直接知道自己是否位于这条路径上。

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

明明已经不存在到 A 的路径，节点却持续相信邻居给出的旧信息，距离逐步增加，这就是 **无穷计数（Count-to-Infinity）**。

**B 已经发现直连故障；出错的是它把 C 通告的旧路径当成了有效替代路径。** 使用有限的“无穷大”阈值，可以让这种增长最终结束，但不能消除中间的错误路由过程。

</details>

### Link-State and Distance-Vector Compared

| 比较项 | LS | DV |
| --- | --- | --- |
| 传播的内容 | 本地链路状态 | 到各目的地的距离估计 |
| 信息交换范围 | 链路状态传播到路由范围内的各节点 | 只向直接邻居发送向量 |
| 节点计算依据 | 完整拓扑与链路代价 | 本地链路代价及邻居向量 |
| 主要计算 | Dijkstra，简单实现 $O(n^2)$ | Bellman-Ford 更新，多轮迭代 |
| 消息开销 | n 个节点、E 条链路时，一轮完整泛洪约 $O(nE)$ | 总量取决于更新次数和收敛过程 |
| 典型问题 | 流量相关代价可能引起振荡 | 路由环路与无穷计数 |

**鲁棒性。** LS 中，错误节点可能通告错误链路代价，但每个节点独立计算自己的路由。DV 中，某节点算出的路径距离会直接成为邻居下一轮计算的输入，错误结果可能在迭代中继续传播。

二者都需要处理错误信息。LS 的 $O(n^2)$ 是本地计算复杂度，$O(nE)$ 是消息数量级，不能混为同一个指标。

### Hierarchical Routing

当网络很大时，每台路由器都保存每个远端节点的详细信息，会使路由表和更新开销不断扩大。

**层次路由（Hierarchical Routing）** 把网络划分成区域：本区域内部保留详细路由；对外部区域只保留汇总后的到达方式。进一步扩大时，还可以把区域组成更高层的簇。

#### Example

**Five Regions**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215540.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**以 1A 为例，采用层次路由后，表项如何变化？会损失什么信息？**

<details>
<summary>展开解答</summary>

五个区域分别包含 3、4、2、3、5 台路由器，共：

$$
3+4+2+3+5=17.
$$

按图中包含自身的统计口径，1A 的完整表有 17 项。层次路由保留本区域的 1A、1B、1C，再给区域 2、3、4、5 各保留一项，共：

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

**自治系统（Autonomous System，AS）** 可以作为互联网路由的分层单位。自治系统内部运行内部路由协议，不同自治系统可以采用不同的内部协议。

连接其他自治系统的路由器称为 **网关路由器（Gateway Router）**。在上面的区域模型中，1B 通向区域 2，1C 通向区域 3，承担区域出口的作用。

AS 内部还可以继续分层。例如 OSPF 可以将一个 AS 划分成多个 Area，Area 0 是骨干区域。**AS 与 OSPF Area 属于不同层次。**

在层次路由的理想模型中，最优层次数约为 $\ln N$，每台路由器约需 $e\ln N$ 个表项。其意义是：网络规模增加时，多级汇总能显著减缓路由表的增长。

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

网络有环路时，同一个副本可能绕一圈回来，再次被复制。没有相应限制，就会形成大量重复分组，造成 **广播风暴（Broadcast Storm）**。

**逐目的地单播要求源知道接收者列表；泛洪只要求各节点知道自己的邻居。** 两者都会产生冗余，但复制发生的位置不同。

#### Sequence-Number-Controlled Flooding

为每个广播分组附加：

$$
\boxed{(\text{源地址},\text{广播序号})}.
$$

每个节点记录已经处理的标识对。新分组到达时，先查记录：处理过就丢弃；未处理过就先记录，再向其他邻居转发。

源地址用于区分不同发送者，序号用于区分同一发送者先后产生的广播。

这种方法使每个节点对同一个广播只执行一次复制，阻止无限传播。**重复副本仍可能抵达节点，只是不会再被继续转发。**

#### Reverse Path Forwarding

**反向路径转发（Reverse Path Forwarding，RPF）** 利用现有单播路由判断广播分组的到达方向。

收到源地址为 S 的广播分组时，路由器检查：**如果我向 S 单播，会从哪个接口出去？**

- 分组恰好从这个接口到达：通过检查，向其余接口复制转发。
- 从其他接口到达：丢弃，不再继续转发。

$$
\boxed{\text{接收接口}=\text{单播到源地址的输出接口}}
$$

满足这个条件才通过 RPF 检查。这里查的是 **广播源地址** 的反向路由。

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

本图有 6 次成功向新节点传播的发送，另有 B↔C、D↔E、E↔F 上的 6 次冗余发送，共 12 次。RPF 控制了后续传播，仍没有消除这些链路上的额外传输。

</details>

#### Spanning-Tree Broadcast

**生成树（Spanning Tree）** 包含网络中的全部节点且没有环路。若广播只沿树边传播，每个节点就能收到一份分组，无须在其他边上发送副本。

源节点向它的所有树上邻居发送；其他节点接收后，向 **除接收方向以外的树上邻居** 继续转发。

一棵有 $n$ 个节点的生成树具有 $n-1$ 条边，因此一次完整广播只需：

$$
\boxed{n-1\text{ 次链路传输}}.
$$

各节点无须保存整棵树，只需知道自己的哪些接口属于树。主要开销转移到 **生成树的建立与维护**。

#### Center-Based Tree Construction

**基于中心的建树方法** 先选择一个中心节点，也称会合点（Rendezvous Point）或核心（Core）。

希望加入的节点向中心发送单播 `Tree-Join` 消息，沿已有单播路由前进。消息到达中心，或到达已经属于树的节点时，便把此次经过的路径接到树上，称为 **嫁接（Grafting）**。

#### Example

**Building a Tree Rooted at E**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215624.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**选择 E 为中心，依次让其他节点加入，说明最终生成树如何形成。**

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

**中心 E 用于建树，广播源可以是其他节点。** 图中仍然存在的非树边，不参与这次生成树广播。

</details>

### Multicast Routing

**多播／组播（Multicast）** 把分组发送给某个指定接收组的成员。例如 Web 缓存更新和交互式游戏中，只需要让相关节点接收数据。

它需要解决两个问题：**哪些主机属于接收组，以及如何用一个目的地址表示这个组。**

共享路径上的分组可以先只传一份，在不同接收分支分开的位置再复制。多播路由负责建立连接发送者与接收者的分发结构。

#### Source-Based Trees

**基于源的树（Source-Based Tree）** 为每个发送源分别建立分发树。不同源到各接收者的路径可能不同，因此树也可能不同。

可以利用 RPF 形成从源向外的传播结构，再进行 **剪枝（Pruning）**：删除下游没有组成员的分支，只保留到达接收者所需的路径。

这种方法能够围绕各个源选择路径；发送源增多时，需要维护更多树状态。

#### Group-Shared Trees

**组共享树（Group-Shared Tree）** 让同一多播组共享一棵树，通常围绕选定中心建立。

连接组成员的边缘路由器向中心发送加入消息。沿途路由器加入分发结构，后续把多播数据转交给这些边缘路由器，再送到主机。

它复用了前面的中心建树与嫁接方法，不过只需要覆盖有组成员的分支。共享树减少逐源建树的状态，但某个源沿共享树到接收者的路径未必最短。

**源树按发送源区分；共享树按接收组共享。**

#### Group Membership and Multicast Routing

IPv4 使用 D 类多播地址标识接收组。互联网多播由两个部分配合完成：

**IGMP（Internet Group Management Protocol）** 管理主机与其本地多播路由器之间的组成员关系，使路由器知道某条接入链路上有没有组成员。

**多播路由协议** 在路由器之间建立分发路径，把数据送到存在组成员的网络。

IGMP 消息封装在 IP 数据报中，对应的 IP Protocol 值为 **2**。在组成员管理过程中，主要关注三类动作：

- **查询**：路由器发送 Membership Query，询问所连接网络上的成员情况。
- **报告**：主机使用 Membership Report 报告自己的组成员关系。
- **离开**：通知退出，或通过后续查询、响应与超时更新成员状态。

这里按功能理解查询、报告和离开，具体报文类型取决于 IGMP 版本。

#### DVMRP and PIM

**距离向量多播路由协议（DVMRP）** 使用基于源的树，结合反向路径转发与剪枝，把没有接收者的分支去掉。

**协议无关多播（PIM）** 主要区分两类分布：

**密集模式（Dense Mode）**：接收者分布较密，采用先泛洪、再剪枝的思路。

**稀疏模式（Sparse Mode）**：接收者分布较稀疏，使用会合点组织分发树，让需要接收的分支加入。

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

IP 有 IPv4、IPv6 两个版本；同时实现两套协议的节点具有双协议栈。

### Internet Network-Layer Components

互联网网络层相关机制分成三组：

**IP 协议**：规定数据报格式和网络层寻址，支持分组传递。

**控制与辅助协议**：ICMP、DHCP、ARP 等，分别协助错误报告、地址配置和地址解析。

**路由协议**：RIP、OSPF、BGP 等，交换路由信息，形成转发所需的路径。

前面的最短路径算法解释了路径如何计算；接下来需要读懂真正沿这些路径传输的 IP 数据报。

### The IPv4 Datagram

**IPv4 数据报由首部和数据部分组成。首部有 20 字节固定部分，以及可变长度的可选部分。** 图中每行宽 32 bit，即 4 字节。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261109215724.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

```text
IPv4 数据报 = 固定首部 20 B + 可选部分 + 数据部分
```

网络字节序采用 **大端序（Big-Endian）**：多字节数值的高位字节在前。阅读首部图时按从左到右、从上到下的顺序对应字段。

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

#### Time to Live

**生存时间（Time to Live，TTL）** 限制分组在网络中的持续转发。每经过一台路由器，TTL 减 1；减到 0 时，路由器丢弃分组，并向源端报告相应错误。

因此，即使出现路由环路，分组也不会一直绕圈。沿途路由器返回的 ICMP 错误信息，也是 traceroute／tracert 探测路径所利用的机制。

#### Protocol

**Protocol** 标识数据部分应该交给哪一种上层协议处理。例如：

```text
6  → TCP
17 → UDP
2  → IGMP
```

结合前面的多播部分可以看出，Protocol 字段能够标识运输层协议，也能标识直接封装在 IP 中的其他协议。

**Protocol 区分 IP 所承载的协议；TCP／UDP 的端口号进一步区分应用端点。**

#### Header Checksum and Addresses

**首部校验和（Header Checksum）** 用于检查 IPv4 首部。路由器转发时会修改 TTL，因此必须相应更新首部校验和。

**Source Address、Destination Address** 分别保存源、目的 IPv4 地址，各占 **32 bit**。

读一段 IPv4 首部时，重点是把字段解释连起来：从 Version 判断版本，从 IHL 找到数据开始的位置，从 Total Length 算出数据大小，从 Protocol 判断承载的协议，再结合 TTL 和校验和理解沿途路由器的处理。
