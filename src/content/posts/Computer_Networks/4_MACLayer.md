---
title: The Medium Access Control Sublayer
published: 2026-10-26
description: 信道分配、排队论基础、ALOHA、CSMA、无冲突与有限竞争协议，以及无线局域网中的 MACA
tags: [计算机网络]
category: 笔记
draft: false
---


## The Key Issue in This Chapter

**介质访问控制子层（Medium Access Control，MAC）** 属于数据链路层，处理的问题是：

**多个站点共享同一条信道时，谁可以在什么时候发送？**

```text
静态划分为何不适合突发流量？
        ↓
允许按需共享，但必须协调多个发送者
        ↓
ALOHA：直接尝试，失败后随机重传
        ↓
CSMA：发送前侦听；CSMA/CD：发送时检测冲突
        ↓
无冲突协议：预约、令牌、逐位仲裁
        ↓
有限竞争：根据负载调整竞争组
        ↓
无线局域网：以接收端为中心，用 RTS/CTS 协调邻居
```

## The Channel Allocation Problem

### Static Channel Allocation

**静态信道分配** 预先为用户划出固定份额。以频分多址（FDMA）为例，若共有 $N$ 个用户，总容量为 $C$，则每个用户固定获得 $C/N$。

用户数少且稳定、各用户持续产生流量时，这种方式简单有效；但计算机通信常有 **突发性（Bursty Traffic）**：长时间没有数据，一有需求便连续产生多帧。

**问题在于闲置份额无法及时借给有需求的用户。** 例如，$N-1$ 个用户空闲，只有一个用户集中发送时，它仍只能使用自己的 $C/N$，其他份额同时闲置。

**动态信道分配** 按实际需求共享资源。但按需共享还需要解决多个站点同时请求访问时的协调问题。

### Preliminary Queueing Theory

#### Arrival and Service Processes

把信道看成一个服务台，把等待发送的帧看成顾客。排队来自两种随机性：**顾客何时到达**，以及 **每个顾客需要服务多久**。即使平均需求低于平均处理能力，短时间的集中到达或较长服务仍会产生排队。

网络中，帧长不同会使发送时间不同。

| 符号 | 含义 | 单位／说明 |
| --- | --- | --- |
| $\tau_n$ | 第 $n$ 个顾客的到达时刻 | s |
| $t_n=\tau_n-\tau_{n-1}$ | 相邻两次到达的间隔 | s |
| $x_n$ | 第 $n$ 个顾客的服务时间 | s |
| $\lambda$ | 平均到达率 | 帧/s |
| $\mu_s$ | 平均服务率 | 帧/s |
| $T$ | 在系统内的平均总时间 | 排队时间与服务时间之和 |
| $W$ | 平均排队等待时间 | 尚未开始接受服务的时间 |
| $N_{\mathrm{sys}},N_q$ | 系统内、等待队列内的平均帧数 | $N_{\mathrm{sys}}$ 为系统内平均帧数，$N_q$ 为等待队列内平均帧数 |

**用 $\mu_s$ 表示服务率。**

用随机变量 $\widetilde t,\widetilde x$ 分别表示到达间隔与服务时间：

$$
E[\widetilde t]=\frac1\lambda,
\qquad
E[\widetilde x]=\frac1{\mu_s}.
$$

分布函数与密度函数分别为：

$$
A(t)=P(\widetilde t\le t),\qquad B(x)=P(\widetilde x\le x),
$$

$$
a(t)=\frac{dA(t)}{dt},\qquad b(x)=\frac{dB(x)}{dx}.
$$

这里 $A,B$ 是累积分布函数，$a,b$ 是相应概率密度。

#### Queueing Models

排队系统用 **$A/B/m$** 表示：前两项分别描述到达间隔、服务时间的分布，$m$ 表示服务台数量。

**M/M/1**：到达间隔服从指数分布，服务时间服从指数分布，只有一个服务台；泊松到达过程与独立同分布的指数到达间隔相对应。

<details>
<summary>分布符号</summary>

- $M$：指数分布，具有马尔可夫性。
- $E_r$：$r$ 阶 Erlang 分布。
- $H_r$：$r$ 阶超指数分布。
- $D$：确定性的时间。
- $G$：一般分布。

</details>

#### Utilization and Little’s Result

**利用率（Utilization）** 表示服务能力的平均占用比例。单服务台时：

$$
\boxed{\rho=\lambda E[\widetilde x]=\frac{\lambda}{\mu_s}}
$$

若有 $m$ 个相同服务台，则每台的平均利用率为：

$$
\rho=\frac{\lambda E[\widetilde x]}{m}.
$$

**系统总时间与排队时间：**

$$
\boxed{T=E[\widetilde x]+W}
$$

**Little 定律：** 在长期平均量存在、统计边界一致的稳定系统中，

$$
\boxed{N_{\mathrm{sys}}=\lambda T},\qquad
\boxed{N_q=\lambda W}.
$$

系统中的平均帧数包括正在服务的帧；等待队列中的平均帧数不包含它们。因此，对于 $m$ 个相同服务台：

$$
N_q=N_{\mathrm{sys}}-m\rho.
$$

队列过长可能导致丢包，增大缓冲区又有成本。

#### Poisson Arrivals

泊松分布描述一个时间区间内的到达数量。设 $A_t$ 表示长度为 $t$ 的区间内到达的帧数，则：

$$
\boxed{P(A_t=k)=\frac{(\lambda t)^k}{k!}e^{-\lambda t}},
\qquad k=0,1,2,\ldots
$$

其中 $\lambda t$ 是该时间区间内的平均到达数量。

<details>
<summary>从二项分布得到泊松分布</summary>

把长度为 $t$ 的区间分成 $n$ 个小区间，每个长 $t/n$。在独立、恒定到达率的小区间模型中，用概率 $p_n=\lambda t/n$ 表示一次到达，多次到达的高阶小量在极限中消失。

相应的离散近似为：

$$
P_n(k)=\binom nk\left(\frac{\lambda t}{n}\right)^k
\left(1-\frac{\lambda t}{n}\right)^{n-k}.
$$

固定 $k$，整理成：

$$
P_n(k)=\frac{(\lambda t)^k}{k!}
\frac{n(n-1)\cdots(n-k+1)}{n^k}
\left(1-\frac{\lambda t}{n}\right)^n
\left(1-\frac{\lambda t}{n}\right)^{-k}.
$$

当 $n\to\infty$，后三个因子分别趋向 $1,e^{-\lambda t},1$，因此：

$$
P(A_t=k)=\frac{(\lambda t)^k}{k!}e^{-\lambda t}.
$$

</details>

<details>
<summary>为什么 E[Aₜ] = λt？</summary>

$$
\begin{aligned}
E[A_t]
&=\sum_{k=0}^{\infty}k\frac{(\lambda t)^k}{k!}e^{-\lambda t}\\
&=\lambda t\,e^{-\lambda t}
  \sum_{k=1}^{\infty}\frac{(\lambda t)^{k-1}}{(k-1)!}\\
&=\lambda t\,e^{-\lambda t}e^{\lambda t}
=\lambda t.
\end{aligned}
$$

期望是以概率为权重的平均数量，可以为非整数。

</details>

<details>
<summary>泊松到达为何对应指数到达间隔？</summary>

在齐次泊松过程中，设从一个到达时刻起，到下一次到达的间隔为 $X$。等待超过 $t$，等价于这段时间零次到达：

$$
P(X>t)=P(A_t=0)=e^{-\lambda t}.
$$

因此：

$$
F_X(t)=1-e^{-\lambda t},\qquad
f_X(t)=\lambda e^{-\lambda t},\qquad t\ge0,
$$

$$
E[X]=\int_0^{\infty}P(X>t)\,dt=\frac1\lambda.
$$

泊松分布描述区间内的**到达次数**；指数分布描述**到达间隔**。

</details>

**例题：** 平均每秒到达 2 帧，接下来 1 秒内“恰好到达一帧”和“至少到达一帧”的概率分别是多少？

<details>
<summary>答案</summary>

$$
P(A_1=1)=2e^{-2}\approx27.07\%,
$$

$$
P(A_1\ge1)=1-P(A_1=0)=1-e^{-2}\approx86.47\%.
$$

“至少一次”包含 1、2、3、……次

</details>

#### The M/M/1 Queue

设 $P_k(t)$ 表示时刻 $t$ 系统内恰有 $k$ 帧的概率；稳态下记作 $p_k$。

**区间内到达 $k$ 帧** 与 **某时刻系统内有 $k$ 帧** 是不同的事件：前者只数到达，后者同时受到到达和离开的影响。

M/M/1 的核心结果为：

$$
\boxed{p_k=(1-\rho)\rho^k},\qquad
\boxed{N_{\mathrm{sys}}=\frac{\rho}{1-\rho}},
$$

$$
\boxed{T=\frac{1/\mu_s}{1-\rho}=\frac1{\mu_s-\lambda}},
\qquad
\boxed{W=T-\frac1{\mu_s}=\frac{\lambda}{\mu_s(\mu_s-\lambda)}}.
$$

<details>
<summary>推导：状态平衡 → 稳态分布 → 平均帧数 → 平均时延</summary>

**1. 状态平衡。** 发生一次到达，帧数增加 1；系统非空时完成一次服务，帧数减少 1。

$$
\frac{dP_0(t)}{dt}=\mu_sP_1(t)-\lambda P_0(t),
$$

$$
\frac{dP_k(t)}{dt}
=\lambda P_{k-1}(t)+\mu_sP_{k+1}(t)
-(\lambda+\mu_s)P_k(t),\quad k\ge1.
$$

稳态下，跨越相邻状态边界的两个方向概率流相等：

$$
\lambda p_k=\mu_s p_{k+1}
\quad\Longrightarrow\quad
p_{k+1}=\rho p_k.
$$

**2. 归一化。** 递推得 $p_k=p_0\rho^k$，又有：

$$
1=\sum_{k=0}^{\infty}p_k
=p_0\sum_{k=0}^{\infty}\rho^k
=\frac{p_0}{1-\rho},
$$

所以 $p_0=1-\rho$，$p_k=(1-\rho)\rho^k$。

**3. 求系统平均帧数。** 利用几何级数的导数：

$$
\sum_{k=1}^{\infty}k\rho^{k-1}
=\frac{d}{d\rho}\frac1{1-\rho}
=\frac1{(1-\rho)^2},
$$

得到：

$$
N_{\mathrm{sys}}
=\sum_{k=0}^{\infty}kp_k
=(1-\rho)\frac{\rho}{(1-\rho)^2}
=\frac{\rho}{1-\rho}.
$$

**4. 使用 Little 定律。** 对 $\lambda>0$，

$$
T=\frac{N_{\mathrm{sys}}}{\lambda}
=\frac{\lambda/\mu_s}{\lambda(1-\lambda/\mu_s)}
=\frac1{\mu_s-\lambda}.
$$

减去平均服务时间 $1/\mu_s$ 就得到 $W$。另外：

$$
N_q=N_{\mathrm{sys}}-\rho
=\frac{\rho^2}{1-\rho}
=\lambda W.
$$

$\lambda=0$ 时没有实际到达；$T$ 的公式可理解为轻负载极限下，一帧只需接受服务。

</details>

**利用率接近 100% 时，时延会急剧上升。** 固定服务率，有：

$$
\frac{T}{1/\mu_s}=\frac1{1-\rho}.
$$

当 $\rho=0.5,0.9,0.99$ 时，总时延分别是平均服务时间的 $2,10,100$ 倍。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026144249.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**例题：** $\lambda=9$ 帧/s，$\mu_s=10$ 帧/s，求利用率、平均总时间与平均排队时间。

<details>
<summary>解答</summary>

$$
\rho=0.9,\qquad
T=\frac1{10-9}=1\ \mathrm{s},\qquad
W=1-\frac1{10}=0.9\ \mathrm{s}.
$$

每帧平均服务仅需 $0.1$ s，平均等待却达 $0.9$ s。

</details>

### The Performance of Static FDM

设总信道容量为 $C$ bit/s，帧的总到达率为 $\lambda$ 帧/s，平均帧长为 $1/\mu$ bit。

**此处 $\mu$ 是平均帧长的倒数，实际服务率为 $\mu C$ 帧/s。**

$$
E[\widetilde x]=\frac{1/\mu}{C}=\frac1{\mu C},
\qquad \mu_s=\mu C,
\qquad \rho=\frac{\lambda}{\mu C}.
$$

不划分信道、由一条理想集中队列使用全部容量时：

$$
\boxed{T=\frac1{\mu C-\lambda}}.
$$

把它静态平分成 $N$ 条独立子信道，每条子信道容量为 $C/N$，到达率为 $\lambda/N$，则：

$$
\boxed{T_N=NT}.
$$

<details>
<summary>推导：为什么分成 N 份，平均时延扩大 N 倍？</summary>

每条子信道服务率为 $\mu C/N$，代入同一个 M/M/1 公式：

$$
T_N
=\frac1{\mu C/N-\lambda/N}
=\frac{N}{\mu C-\lambda}
=NT.
$$

利用率却没有变化：

$$
\rho_N=\frac{\lambda/N}{\mu C/N}
=\frac{\lambda}{\mu C}=\rho.
$$

发送同样长度的一帧，子信道需要原来 $N$ 倍的服务时间；在相同利用率下，平均总时间和平均排队时间也随之扩大 $N$ 倍。

**相同利用率不意味着相同的时延。**

</details>

**例题：** 总容量 $C=100$ Mbps，平均帧长 $10{,}000$ bit，到达率 $\lambda=5000$ 帧/s。求未划分时的平均总时延；再将信道静态分成 10 条各 10 Mbps 的子信道，求平均总时延。

<details>
<summary>解答：发送时延 100 μs，总时延 200 μs；划分后总时延 2 ms</summary>

未划分时，服务率为：

$$
\mu_s=\frac{100\times10^6}{10^4}=10{,}000\ \text{帧/s}.
$$

平均服务时间为 $100\,\mu\mathrm{s}$，但总时间还包含排队：

$$
T=\frac1{10{,}000-5000}
=200\,\mu\mathrm{s},
\qquad W=100\,\mu\mathrm{s}.
$$

划分后，每条子信道到达率为 $500$ 帧/s、服务率为 $1000$ 帧/s：

$$
T_{10}=\frac1{1000-500}
=2\,\mathrm{ms}=10T.
$$

两种方案的利用率均为 $50\%$。

</details>

### Key Assumptions of Dynamic Channel Allocation

研究动态分配之前，需要说明模型的边界。

1. **独立流量（Independent Traffic）。** $N$ 个站点独立产生帧，产生时间不可预测、平均速率恒定。简化模型中，一个站点生成帧后，直到该帧成功发送才继续产生下一帧。
2. **单一信道（Single Channel）。** 所有站点共享同一条信道，都可以发送与接收，没有额外的带外信道帮助协调。基本模型假设站点能力相同。
3. **冲突可观测（Observable Collisions）。** 帧在时间上重叠时，模型视其为冲突并要求重传；
4. **连续时间或时隙时间（Continuous or Slotted Time）。** 连续时间允许任意时刻开始发送；时隙模型只允许在边界启动。理想时隙中，0 次发送为空闲，1 次为成功，多次为冲突。
5. **有无载波侦听（Carrier Sense or No Carrier Sense）。** 有侦听能力的站点先判断信道忙闲；没有这种能力时，先尝试发送，之后再判断是否成功。

## Multiple Access Protocols

### ALOHA

**纯 ALOHA** 与 **时隙 ALOHA**，区别在于能否任意时刻开始发送。

#### Frame Time, Offered Load, and Throughput

以下分析假设 **固定帧长**。用 $T_f$ 表示发送一帧所需的时间，区别于前面排队论的平均总时间 $T$：

$$
T_f=\frac{\ell}{R},
$$

其中 $\ell$ 为帧长，$R$ 为链路速率。

| 量 | 含义 |
| --- | --- |
| $N$ | 平均每个帧时间产生的新帧数|
| $G$ | 平均每个帧时间的总发送尝试次数，包含新帧与重传 |
| $P_0$ | 一次发送尝试成功的概率 |
| $S$ | 平均每个帧时间成功发送的帧数，即归一化吞吐量 |

$$
\boxed{G\ge N},\qquad \boxed{S=GP_0}.
$$

低负载时冲突少、重传少，$G\approx N$；高负载时重传会明显增加 $G$。$G$ 可以大于 1，因为多次尝试可能相互重叠；$S$ 只统计成功帧。

每个帧时间最多成功传一帧，因此 $N>1$ 已超过信道原始处理能力。

在忽略额外开销、所有帧等长的模型中，实际成功帧率为 $S/T_f$，相应帧比特吞吐量为 $SR$。

#### Pure ALOHA

**规则：有数据就发送，不预先侦听，也不等待时隙；失败后随机等待，再重传。**

原始系统用中心站重广播来帮助发送者判断帧是否成功送达。随机等待用来打散原本发生冲突的发送者；若都等待相同固定时长，可能反复一起重传。

在本节的理想冲突模型中，即使一帧的第一个比特只与另一帧的最后一个比特重叠，也视为两帧均被破坏，需要重传。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152017.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**易受冲突影响的区间（Vulnerable Period）：$2T_f$。**

设目标帧从时刻 $s$ 开始，在 $s+T_f$ 结束。其他等长帧从 $u$ 开始，与目标帧重叠的条件为：

$$
u<s+T_f,\qquad u+T_f>s.
$$

因此：

$$
\boxed{s-T_f<u<s+T_f}.
$$

前半段中启动的其他帧，其尾部可能撞上目标帧的头部；后半段中启动的其他帧，其头部可能撞上目标帧的尾部。区间总长为 $2T_f$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152200.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**成功概率与吞吐量：** 一个帧时间内平均有 $G$ 次尝试，两个帧时间内平均有 $2G$ 次。指定目标尝试要成功，易受冲突区间内须没有其他尝试：

$$
P_0=P(X=0)=\frac{(2G)^0}{0!}e^{-2G}=e^{-2G}.
$$

所以：

$$
\boxed{S(G)=Ge^{-2G}}.
$$

<details>
<summary>推导：Pure ALOHA 的最大吞吐量</summary>

$$
S'(G)=e^{-2G}-2Ge^{-2G}=e^{-2G}(1-2G).
$$

当 $G<1/2$ 时导数为正，当 $G>1/2$ 时导数为负，因此：

$$
G^*=\frac12,
\qquad
\boxed{S_{\max}=\frac1{2e}\approx0.1839}.
$$

此时单次尝试成功概率是：

$$
P_0=e^{-1}\approx0.3679.
$$

**18.39% 是最大归一化吞吐量，36.79% 是此时单次尝试成功的概率。**

</details>

吞吐量随负载先上升后下降：尝试太少会闲置信道；尝试过多又会增加碰撞与重传。当 $G\to\infty$ 时，$Ge^{-2G}\to0$。

#### Slotted ALOHA

**时隙 ALOHA（Slotted ALOHA）** 把时间划成长度为 $T_f$ 的时隙，只允许在时隙起点发送，要求站点同步。

相邻时隙的帧在理想模型中首尾相接，只有 **同一时隙内的其他发送尝试** 会破坏目标帧。因此易受冲突区间缩短为一个时隙：

$$
T_{\mathrm{vulnerable}}=T_f.
$$

设某个时隙的总尝试次数 $X\sim\operatorname{Poisson}(G)$。时隙中恰有一次尝试才成功：

$$
\boxed{S=P(X=1)=Ge^{-G}}.
$$

从指定尝试的角度，其他竞争者均不发送的概率为 $P_0=e^{-G}$，同样得到 $S=GP_0$。

<details>
<summary>推导：Slotted ALOHA 的最大吞吐量</summary>

$$
S'(G)=e^{-G}(1-G).
$$

导数在 $G=1$ 两侧由正变负，所以：

$$
\boxed{G^*=1},\qquad
\boxed{S_{\max}=\frac1e\approx0.3679}.
$$

两种协议各自的最大吞吐量之比为：

$$
\frac{1/e}{1/(2e)}=2.
$$

“最大吞吐量翻倍”比较的是两个各自的最优工作点；两者在相同 $G$ 下的比值由各自公式决定。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152308.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

对于随机选取的一个时隙：

$$
\begin{aligned}
P(\text{空闲})&=e^{-G},\\
P(\text{恰好一次尝试，成功})&=Ge^{-G},\\
P(\text{至少两次尝试，冲突})&=1-(1+G)e^{-G}.
\end{aligned}
$$

对于指定的一次发送尝试：

$$
P(\text{成功})=e^{-G},\qquad
P(\text{碰撞})=1-e^{-G}.
$$

**例子：** $G=1$ 时，约 36.8% 的时隙空闲、36.8% 成功、26.4% 冲突；但单次尝试碰撞的概率约为 63.2%。碰撞时隙包含多次失败尝试。

#### Expected Number of Transmissions

研究成功交付一帧所需的发送尝试次数。设每次尝试独立，成功概率保持为：

$$
p_s=e^{-G},\qquad q_f=1-p_s.
$$

若 $K$ 表示直到首次成功的 **总尝试次数**，则恰好第 $k$ 次成功意味着前 $k-1$ 次失败：

$$
\boxed{P(K=k)=q_f^{k-1}p_s
=e^{-G}(1-e^{-G})^{k-1}}.
$$

这是几何分布，由此得到：

$$
\boxed{E[K]=e^G},\qquad
\boxed{E[\text{重传次数}]=e^G-1}.
$$

<details>
<summary>推导：错位相减求和</summary>

$$
E[K]=p_s\sum_{k=1}^{\infty}kq_f^{k-1}.
$$

令 $H=1+2q_f+3q_f^2+\cdots$。

$$
q_fH=q_f+2q_f^2+3q_f^3+\cdots.
$$

两式相减：

$$
(1-q_f)H=1+q_f+q_f^2+\cdots=\frac1{1-q_f}.
$$

于是：

$$
H=\frac1{(1-q_f)^2}=\frac1{p_s^2},
$$

$$
E[K]=p_sH=\frac1{p_s}=e^G.
$$

第一次发送也计入 $K$；每帧的重传次数是 $K-1$，所以其期望为 $e^G-1$。

</details>

$G$ 增大使平均尝试次数指数增长。**碰撞增加 → 重传增加 → 总尝试负载进一步增加**，解释了高负载时性能恶化的趋势。该

**例题：** 时隙 ALOHA 的 $G=2$，求单次成功概率、吞吐量、平均总尝试次数与平均重传次数。

<details>
<summary>解答</summary>

$$
P_0=e^{-2}\approx0.1353,\qquad
S=2e^{-2}\approx0.2707,
$$

$$
E[K]=e^2\approx7.389,\qquad
E[K-1]=e^2-1\approx6.389.
$$

**成功概率、吞吐量、尝试次数分别作答，不能只看到指数项就互相替代。**

</details>

#### Pure vs. Slotted ALOHA

| 比较项 | Pure ALOHA | Slotted ALOHA |
| --- | --- | --- |
| 开始发送 | 任意时刻 | 时隙边界 |
| 发送前侦听 | 无 | 无 |
| 时隙同步 | 不要求 | 要求 |
| 易受冲突区间 | $2T_f$ | $T_f$ |
| 单次成功概率 | $e^{-2G}$ | $e^{-G}$ |
| 吞吐量 | $Ge^{-2G}$ | $Ge^{-G}$ |
| 最优 $G$ 与最大吞吐量 | $G=1/2$，$1/(2e)$ | $G=1$，$1/e$ |

### Carrier Sense Multiple Access Protocols

**载波侦听多路访问（Carrier Sense Multiple Access，CSMA）**：发送前先判断信道是否正在被使用，再根据侦听结果行动。ALOHA 缺少这一信息，因此容易干扰已经开始的传输。

载波侦听仍不能保证无冲突：**信号到达其他站点需要时间**；多个站点也可能同时等待一帧结束，在同一时刻抢占刚空闲的信道。

#### 1-persistent CSMA

**空闲立即发，忙碌持续听。**

站点有帧要发送时先侦听：空闲就以概率 1 开始发送；忙碌就持续侦听，直到信道空闲；发生冲突则随机等待后重试。

“1”表示空闲条件下的发送概率，不表示成功概率。优点是空闲时不额外等待；缺点是多个站点等待同一帧结束时，容易集中发送并碰撞。

#### Nonpersistent CSMA

**空闲立即发，忙碌则随机等待后重新侦听。**

它放弃持续守候信道变空闲的瞬间，让各个竞争者的再次检查分散到不同时间。相对 1-坚持型，通常能够提高信道利用率，但可能增加等待时延。

**随机等待后必须重新侦听。** 等待到期并不自动获得发送许可。

#### p-persistent CSMA

适用于 **时隙信道**。检测到空闲时：

$$
\begin{cases}
\text{以概率 }p\text{ 发送},\\
\text{以概率 }1-p\text{ 推迟到下一时隙}.
\end{cases}
$$

若下一时隙仍空闲，就再次作同样的决策；初次发现忙碌时，等待下一时隙再检查。若推迟期间已有别的站点开始发送，本站点随机等待后重新竞争。

产生一个均匀随机数 $U\in[0,1)$，$U<p$ 时发送，否则放弃当前机会。**即使发现空闲，也可能主动推迟**，这是它与非坚持型的重要区别。

$p$ 大时积极抢占，多个站点同发的风险也较高；$p$ 小时分散竞争，但会增加主动等待。

<details>
<summary>例题：三个站点都以 p = 0.5 竞争一个空闲时隙</summary>

各站点独立决策，恰有一个站点发送的概率为：

$$
3\times0.5\times(1-0.5)^2=\frac38.
$$

这里计算的是这一轮竞争恰好只有一个发送者的概率。

</details>

#### Performance Comparison

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152703.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **1-坚持型** 比 ALOHA 有所改善，但负载升高后，集中竞争仍使吞吐量下降。
- **非坚持型** 在图示高负载区保持较高吞吐量；与其他策略的曲线存在交叉，不能脱离负载比较。
- **较小 $p$ 的坚持型** 在图示范围内能有效分散竞争，$p=0.01$ 的曲线接近 1。

**对照侦听后的动作：** 忙时持续听是 1-坚持型；忙时随机等待是非坚持型；空闲时仍按概率选择发送是 $p$-坚持型。

#### CSMA with Collision Detection

**带冲突检测的 CSMA（CSMA/CD）** 在发送期间监测信道，一旦发现冲突，提前中止已无法正常完成的传输，避免继续浪费整帧发送时间。它是经典共享介质以太网的基础。

冲突检测是 **模拟信号层面的过程**：硬件在发送时监测介质，判断观察到的信号是否与自身发送相符。

信道运行在三个状态之间切换：**竞争期、成功传输期、空闲期**。竞争期内仍可能碰撞；若某站点已经可靠取得信道，其他站点侦听到忙碌便暂缓发送。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152747.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**两个时间量：**

$$
\boxed{T_{\mathrm{tx}}=\frac{\ell}{R}},\qquad
\boxed{\tau=\frac{d}{v}}.
$$

$T_{\mathrm{tx}}$ 是把整帧送入信道的时间；$\tau$ 是信号传播单程所需时间。以下 $\tau$ 取共享网络两个最远站点间的单程传播时延。

**最坏冲突检测时间接近 $2\tau$。**

<details>
<summary>推导：为什么需要 2τ？</summary>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026152925.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

令 A 在 $t=0$ 开始发送，最远端 B 在 $t=\tau-\varepsilon$ 开始发送，其中 $\varepsilon>0$ 很小。B 此时尚未收到 A 的信号，侦听结果仍为空闲。

| 时刻 | 事件 |
| --- | --- |
| $0$ | A 开始发送 |
| $\tau-\varepsilon$ | A 的首个信号即将到达 B，B 开始发送 |
| $\tau$ | A 的信号到达 B，B 几乎立即发现冲突 |
| $2\tau-\varepsilon$ | B 发出的信号／造成的扰动传播到 A，A 才发现冲突 |

因此：

$$
t_{\mathrm{detect}}=(\tau-\varepsilon)+\tau
=2\tau-\varepsilon.
$$

当 $\varepsilon\to0^+$，检测时间接近 $2\tau$。

</details>

**竞争阶段** 可类比为槽宽 $2\tau$ 的时隙 ALOHA：一次成功竞争后，站点继续发送余下的数据帧。

**最小帧长的推论：** 为保证最坏冲突到达时仍处于发送状态，需要：

$$
\boxed{T_{\mathrm{tx}}\ge2\tau}
\quad\Longrightarrow\quad
\boxed{\ell_{\min}\ge2\tau R}.
$$

<details>
<summary>无论帧多长，B 都能在 A 快发完时启动吗？</summary>

载波侦听限制了 B 的合法启动时刻。假设 A 从 0 开始，连续发送 $T_{\mathrm{tx}}$：

- A 的首个信号在 $\tau$ 到达 B。
- A 的最后一个比特在 $T_{\mathrm{tx}}+\tau$ 到达 B。
- 因此 B 在区间 $[\tau,T_{\mathrm{tx}}+\tau)$ 内能侦听到忙碌，不能启动新发送。

后发 B 若要因“尚未听到 A”而与这帧碰撞，必须在 $t_B<\tau$ 时启动。于是：

$$
t_{\mathrm{detect}}=t_B+\tau<2\tau.
$$

只要 A 的发送时间达到 $2\tau$，就覆盖了这个检测窗口。**增加帧长会延长发送时间，却不会延长 B 看不到 A 首个信号的传播窗口。**

</details>

**例题：** $\tau=10\,\mu\mathrm{s}$，A 从 0 开始，整帧发送时间为 $20\,\mu\mathrm{s}$。分析 B 在 $9.9\,\mu\mathrm{s}$、$19.9\,\mu\mathrm{s}$ 和 $25\,\mu\mathrm{s}$ 的情况。

<details>
<summary>解答与短帧反例</summary>

B 在 $9.9\,\mu\mathrm{s}$ 尚未收到 A 的信号，可以启动并造成碰撞；其信号在 $19.9\,\mu\mathrm{s}$ 到达 A，此时 A 尚未发送完毕，能检测冲突。

B 在 $19.9\,\mu\mathrm{s}$ 或 $25\,\mu\mathrm{s}$ 侦听时都为忙碌：A 的信号从 $10\,\mu\mathrm{s}$ 持续到 $30\,\mu\mathrm{s}$ 抵达 B，因此 B 必须等待。

若改成 A 只发送 $5\,\mu\mathrm{s}$，B 仍可能在 $9.9\,\mu\mathrm{s}$ 启动，但扰动到 A 时 A 已发送结束。这正说明最小发送时间约束的作用。

</details>

**计算：** 最大单程传播时延 $5\,\mu\mathrm{s}$，速率 100 Mbps，忽略其他延迟，最小帧长是多少？

<details>
<summary>解答</summary>

$$
\ell_{\min}=2\times5\times10^{-6}\times100\times10^6
=1000\ \mathrm{bit}=125\ \mathrm{byte}.
$$

</details>

### Collision-Free Protocols

CSMA/CD 能减少碰撞造成的浪费，但竞争阶段仍有冲突，发送等待时间也会变化。传播时延较长、帧较短时，竞争开销尤其明显；实时业务也不希望遇到难以预测的等待。

**无冲突协议（Collision-Free Protocols）** 通过事先协调发送权，避免正常竞争过程中的碰撞。

#### A Bit-Map Protocol

**位图协议（Bit-Map Protocol）** 也称预约协议：**先逐站预约，再按编号发送。**

共有 $N$ 个站点，编号 $0,1,\ldots,N-1$。每轮先经过 $N$ 个预约时隙：站点 $j$ 仅在第 $j$ 个时隙发送一个 `1`，表示自己有帧要发；无需求时该槽空闲。预约结束后，全体站点都知道发送名单，按编号依次发送，每个已预约站点发送一帧。

**预约不会撞车，因为每个槽只有一个指定站点可以使用；数据不会撞车，因为发送顺序已经确定。** 错过自己预约槽后才产生的帧，需要等下一轮。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153200.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

代价是每轮固定扫描 $N$ 个预约槽。

<details>
<summary>推导：预约开销怎样影响效率？</summary>

以一个预约比特时间为单位，设每帧长 $d$，本轮有 $k$ 个站点发送。忽略其他开销，数据时间为 $kd$，预约时间为 $N$：

$$
\eta=\frac{kd}{N+kd}.
$$

两个典型情形：

$$
\eta_{\mathrm{low}}=\frac{d}{N+d}
\quad(k=1),
$$

$$
\eta_{\mathrm{high}}=\frac{Nd}{N+Nd}
=\frac{d}{1+d}
\quad(k=N).
$$

高负载时，一轮预约开销被多帧共同分摊；低负载时，单帧可能承担整轮预约开销。

例如 $N=1000,d=1000,k=1$ 时，本轮效率为 $1/2$；这只是本轮开销计算，未包含此前空转预约轮次的等待。

</details>

#### Token Passing

**令牌传递（Token Passing）** 用一个小控制消息表示发送许可。令牌按预先规定的顺序传递：持有者有帧就先发一帧，再交给下一站；没有帧就直接传递。

**正常情况下只有持有有效令牌的站点拥有发送权。** 多个站点都有数据时，也须按令牌顺序获得机会，无需同时抢占。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153239.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

数据帧沿环传播后，需要由发送站在绕行一圈后移除，或由目的站移除，具体取决于设计。**这里需要阻止无限循环的是数据帧；令牌负责继续分配发送权。**

令牌传递避免随机碰撞，但仍有传递开销与等待轮转的时间。

#### Binary Countdown

**二进制倒计数（Binary Countdown）** 通过地址逐位仲裁，减少逐站预约的开销。

所有竞争站点使用同样长度的二进制地址，从 **最高位到最低位** 同步发送。在假设的信道中，同一位时间上的多个比特执行逻辑 **OR（或）**，`1` 对 `0` 具有支配作用。

**淘汰规则：** 自己发 `0`，却观察到信道为 `1`，就退出本轮；仍在竞争的站点继续比较下一位。退出者在后续位保持静默。

这一机制依赖可进行支配位仲裁的物理信道，以及可忽略传播时延的假设，不能直接套到任意无线共享信道。

**例题：** `0010`、`0100`、`1001`、`1010` 同时竞争，谁获胜？

<details>
<summary>逐位解答</summary>

| 位次（从最高位起） | 仍在竞争的站点发出的位 | 信道 OR 结果 | 退出者 |
| --- | --- | --- | --- |
| 1 | `0, 0, 1, 1` | `1` | `0010`、`0100` |
| 2 | `1001` 与 `1010` 均发 `0` | `0` | 无 |
| 3 | `1001` 发 `0`，`1010` 发 `1` | `1` | `1001` |
| 4 | `1010` 发 `0` | `0` | 无 |

结果为 **`1010` 获胜**，因为它的地址数值最高。

**必须边比较边淘汰。** 把四个完整地址一次性 OR 得到 `1111`，无法代表真实的逐位仲裁结果；前面已退出的站点不会继续发送后续位。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153355.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**高编号优先。** 由规则可推知，持续有高优先级站点竞争时，低优先级站点可能长期得不到机会，因此无冲突与公平性需要分别考虑。

<details>
<summary>仲裁开销</summary>

若 $N$ 个站点采用紧凑编码，地址长度 $m=\lceil\log_2N\rceil$，一轮仲裁需要 $m$ 个比特时间。单帧数据长 $d$ 时，理想效率为：

$$
\eta=\frac{d}{d+m}.
$$

若仲裁地址恰好兼作帧首部，地址位还可被复用。

</details>

### Limited-Contention Protocols

**有限竞争协议（Limited-Contention Protocols）** 希望兼顾两个指标：低负载时的访问时延，以及高负载时的信道效率。

低负载下，竞争者少，直接竞争通常比整轮预约或等待令牌更快；高负载下，频繁碰撞使竞争代价增大，有序发送更有利。

**设计思路：低负载时允许大组竞争，高负载时缩小每次允许竞争的组。**

#### Optimal Transmission Probability

设当前有 $k$ 个准备发送的站点，每个站点独立地以概率 $p$ 尝试发送。恰好一个站点发送才成功：

$$
\boxed{P_{\mathrm{success}}=kp(1-p)^{k-1}}.
$$

其中 $p$ 表示某一指定站点发送，$(1-p)^{k-1}$ 表示其余站点全部推迟，$k$ 表示唯一发送者有 $k$ 种互斥选择。

<details>
<summary>推导：最优 p = 1/k，以及最大成功概率的极限</summary>

先取 $k\ge2$，对 $p$ 求导：

$$
\begin{aligned}
f'(p)
&=k(1-p)^{k-1}-kp(k-1)(1-p)^{k-2}\\
&=k(1-p)^{k-2}(1-kp).
\end{aligned}
$$

在 $0<p<1$ 内，导数在 $p=1/k$ 两侧由正变负，故：

$$
\boxed{p^*=\frac1k}.
$$

两端 $p=0,1$ 的成功概率均为 0，因此这是全局最大值。$k=1$ 时直接取 $p=1$，成功概率为 1；$k=0$ 时没有可发送者，不使用 $1/k$。

代入最优值：

$$
\boxed{P_{\max}=\left(1-\frac1k\right)^{k-1}},\quad k\ge2.
$$

利用指数极限：

$$
\lim_{k\to\infty}
\left(1-\frac1k\right)^{k-1}
=\frac1e.
$$

直觉上，最优点使平均尝试数 $kp=1$。但“平均一次”仍允许空闲与多站点同发，因此不保证每个时隙成功。

</details>

当 $k=2,3,5$ 时，最优成功概率分别为 $0.5,4/9,0.4096$，随着竞争者增多逐渐逼近 $1/e$。**即使发送概率选得最优，很多站点一起竞争仍会带来明显开销。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153519.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这里的 $1/e$ 是 **一个竞争槽中恰好一个发送者获胜的概率极限**。

#### Grouping Stations

将站点分组：某个槽只允许指定组的成员竞争。组可以重叠，并不要求互不相交。

极端情况下，每组只有一个站点，就不会发生组内碰撞，但轮询空组的开销可能很大；所有站点都在同一组，则回到大范围随机竞争。协议需要按负载在这两端之间调整。

#### The Adaptive Tree Walk Protocol

**自适应树遍历协议（Adaptive Tree Walk Protocol）** 用二叉树组织竞争集合：叶子代表实际站点，内部节点代表其子树包含的一组站点。树是逻辑分组结构，不要求物理网络真的连接成二叉树。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153602.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中节点 1 包含 A–H，节点 2 包含 A–D，节点 3 包含 E–H；节点 4、5、6、7 分别包含 A/B、C/D、E/F、G/H。

**每次测试一个竞争组，根据反馈决定下一步：**

- **空闲**：该组没有待发送站点，不再搜索这棵子树。
- **成功**：该组只有一个站点发送，先完成其数据帧，再处理尚未解决的组。
- **碰撞**：该组至少有两个竞争者，递归拆成左右子组，先处理左侧，再处理右侧。

可完整过程描述为 **深度优先搜索**。成功或空闲后结束当前子树，再按已有遍历顺序处理下一棵子树。

**推演例题：** 按树形结构，假设本轮仅 A、B、E 有帧，期间没有新的竞争者加入。从根开始，不使用跳过节点的优化，竞争过程如何进行？

<details>
<summary>解答：7 个竞争槽，依次识别 A、B、E</summary>

| 竞争槽 | 本槽对应节点／组 | 实际竞争者 | 结果 |
| --- | --- | --- | --- |
| 0 | 节点 1：A–H | A、B、E | 冲突，拆分 |
| 1 | 节点 2：A–D | A、B | 冲突，拆分 |
| 2 | 节点 4：A、B | A、B | 冲突，拆分 |
| 3 | 叶子 A | A | 成功，发送 A 的帧 |
| 4 | 叶子 B | B | 成功，发送 B 的帧 |
| 5 | 节点 5：C、D | 无 | 空闲，结束该子树 |
| 6 | 节点 3：E–H | E | 成功，发送 E 的帧 |

节点 3 已经只有一个竞争者，无须再访问其下面的每个节点。

</details>

<details>
<summary>例子：只有 G、H 活跃时，怎样省掉必然碰撞的测试？</summary>

根节点 1 碰撞，而节点 2 空闲，说明两个以上的活跃站点必然全部位于节点 3。于是无需再测试节点 3，可直接测试节点 6。

若节点 6 也空闲，就知道竞争者都在节点 7 内；节点 7 的碰撞也可以跳过，直接分别访问 G、H。

优化的依据是先前的空闲／碰撞反馈已经提供了信息。

</details>

#### Choosing the Starting Level

高负载时，从根开始往往连续碰撞，因此可以从更深层的小组开始搜索。

设共有 $q$ 个准备发送的站点，均匀分布在平衡二叉树的叶子上，根为第 0 层。第 $i$ 层有 $2^i$ 组，每组活跃站点的期望数为：

$$
E[K_i]=\frac{q}{2^i}.
$$

用“每组平均一个竞争者”估计合适的起始层：

$$
\frac{q}{2^i}\approx1
\quad\Longrightarrow\quad
\boxed{i\approx\log_2q}.
$$

**这是搜索起始层数的估计。** 整棵树的高度取决于总站点数；起始层还要取合法整数，且不得超出树高。也可以根据近期流量估计活跃站点数 $q$。

例如，64 个站点作为叶子构成满二叉树时，叶子位于第 6 层；若 $q=8$，建议从第 $\log_2 8=3$ 层附近开始。

### Wireless LAN Protocols

无线网络面对两个额外困难：**各站点覆盖范围有限且不同；发送时自身信号远强于收到的远端信号，难以直接检测冲突。** 因此经典共享有线信道的 CSMA/CD 不能直接照搬。

#### Different Coverage Areas

无线信号广播传播，但只有信噪比足够时才能被附近站点有效接收。A 能与 B 通信、B 能与 C 通信，不保证 A 能听到 C。

以下采用圆形覆盖范围简化模型，并假设同一信道上互相干扰的帧会发生冲突；真实环境的覆盖边界还会受到障碍物、反射等因素影响。

#### The Hidden Terminal Problem

**隐藏终端（Hidden Terminal）**：潜在竞争者彼此听不到，却可能干扰同一个接收端。

```text
A ───→ B ←─── C
A、C 互相听不到，但它们的信号都能到达 B。
```

A 已向 B 发送时，C 在本地侦听不到 A，可能误判为空闲并向 B 发送；两个信号在 **B 的接收位置** 造成干扰。A 与 C 互为隐藏终端。

$$
\boxed{\text{发送端侦听为空闲}\ \not\Rightarrow\ \text{接收端没有干扰}}
$$

目标是避免这类缺少协调导致的碰撞。

#### The Exposed Terminal Problem

**暴露终端（Exposed Terminal）**：发送者能听见另一发送者，因而推迟了一次本可以并行完成的传输。

```text
A ←─── B     C ───→ D
       B、C 能互相听到；C 不干扰 A，B 不干扰 D。
```

B 向 A 发送时，C 能听到 B，若仅凭“本地忙碌”就停止向 D 发送，会浪费并发机会。在此图的覆盖模型中，B→A 与 C→D 的两个 **目的接收端** 均不会受到另一发送者的有害干扰。

$$
\boxed{\text{发送端侦听为忙碌}\ \not\Rightarrow\ \text{目标接收端必然不能接收}}
$$

**隐藏终端要减少不合适的并发；暴露终端要恢复本来可行的并发。** 判断时始终先画清数据方向，再检查各接收端。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153847.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Nodes Cannot Hear while Sending

远端接收信号可能比本机发射信号弱约一百万倍。常规无线设备发送时，自身强信号会掩盖微弱接收信号，难以像有线 CSMA/CD 一样及时发现冲突。

有线设备能在发现冲突后提前中止；无线发送者往往已经把整帧发完，才通过后续反馈判断是否成功，浪费可能更大。缺少期望的确认可用于推断失败，但失败原因也可能包含其他误码。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026153936.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### The MACA Protocol

**MACA（Multiple Access with Collision Avoidance）** 通过短控制帧握手，在发送长数据帧之前协调周围站点。

两个控制帧：

- **RTS（Request To Send）**：发送方发出发送请求，包含后续数据帧的长度信息。
- **CTS（Clear To Send）**：接收方回复允许发送，并复制相应长度信息，供周围站点判断需静默多久。

A 向 B 发送的基本过程：

```text
A ── RTS（后续帧长）──→ B
A ←─ CTS（相应帧长）── B
A ────── DATA ──────→ B
```

**RTS 与 CTS 保护不同位置上的接收过程：**

听到 A 的 RTS 的旁站位于 A 附近，应先保持静默，让 **A 能够收到 B 返回的 CTS**；听到 B 的 CTS 的旁站位于 B 附近，应在后续数据传输期间保持静默，让 **B 能够收到 A 的数据帧**。

这里的静默规则针对旁听到控制帧的竞争站点；预定发送方 A 收到发给自己的 CTS 后，应按协议发送数据。

#### The Five-Station Example

A 要向 B 发送，C 只在 A 的覆盖内，D 只在 B 的覆盖内，E 在两者覆盖交集内。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026154157.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**问题：C、D、E 分别听到什么？应静默到什么时候？**

<details>
<summary>逐节点解答</summary>

| 旁站 | 能听到的控制帧 | 在 MACA 模型中的动作 | 保护的接收过程 |
| --- | --- | --- | --- |
| C | A 的 RTS，听不到 B 的 CTS | 先等待 CTS 返回阶段结束；之后，在不干扰相应接收端的条件下可争取其他发送机会 | A 接收 CTS |
| D | 听不到 A 的 RTS，能听到 B 的 CTS | 按 CTS 给出的信息，在 A→B 数据接收期间保持静默 | B 接收数据 |
| E | RTS 与 CTS 都能听到 | 先保护 CTS 返回，再持续静默至数据交换的相应结束时刻 | A 接收 CTS、B 接收数据 |

**C 的短等待不能省。** 若 B 返回 CTS 时 C 同时发送，A 可能同时收到 B 和 C 的信号，从而读不出 CTS。

D、E 的静默较长，是因为后续数据帧通常比短控制帧长。

本图的 C 只在 A 附近；下一页隐藏终端图中的 C 位于 B 附近。

</details>

#### MACA: Hidden Terminals

回到 A→B←C，A 与 C 互相听不到的场景：

1. A 向 B 发 RTS，C 听不到。
2. B 回复 CTS，A 与 C 都能听到。
3. C 得知 B 即将接收数据，在对应期间保持静默；A 收到 CTS 后发送数据。

**通过接收方 B 的广播，让 A 原本无法直接通知的隐藏竞争者 C 暂缓发送。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026154246.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### MACA: Exposed Terminals

用 B→A、C→D，B 与 C 互相覆盖的例子。图示的一组可并发交换为：

```text
B ── RTS ──→ A       C ── RTS ──→ D
B ←─ CTS ─── A       C ←─ CTS ─── D
B ── DATA ─→ A       C ── DATA ─→ D
```

在假设下，C 的发送不影响 A 接收，B 的发送不影响 D 接收，因此两个数据方向可以并行。B、C 处于发送状态时并不承担这两帧的目的接收任务。

只听到对方发送者的 RTS，意味着先保护返回 CTS 的短时段；若未听到相应接收者的 CTS，就不必仅因听到该 RTS 而静默整个数据帧时段。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261026154314.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Limits of RTS/CTS

RTS/CTS **不能彻底消除碰撞**。例如两个隐藏站点同时向同一个接收方发送 RTS，接收方仍可能无法解码。没有按时收到 CTS 的发送者随机等待后再尝试。

短握手有机会把竞争的浪费限制在较短的控制帧上，并协调接收端附近的邻居；同时也增加控制开销。