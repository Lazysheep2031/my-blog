---
title: The Data Link Layer
published: 2026-10-12
description: 数据链路层概述、分帧、检错与纠错、基本链路协议，以及完整的滑动窗口协议
tags: [计算机网络]
category: 笔记
draft: false
---

## Overview of Data link layer

### The Design Principles of the Data Link Layer

**数据链路层（Data Link Layer）** 使用物理层提供的比特传输能力，组织帧，并向网络层提供相邻节点之间的数据传送服务。

```text
主机 A ── 路由器 R1 ── 路由器 R2 ── 主机 B
       一跳           一跳           一跳
```

**链路层的协议关系对应每一跳。** 完整的主机间路径可以跨越多条链路，各跳分别完成本跳的封装、传输与接收处理。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012202523.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Position and Implementation

发送端从网络层取得**分组（Packet）**，加上本层头尾后形成**帧（Frame）**，再交给物理层；接收端沿相反方向处理。

**逻辑通信**可以画成两端对等层直接联系；**实际传输**必须经过物理层与通信介质。

在主机中，链路层主要由**网络适配器／网卡（NIC）**上的硬件实现，部分功能由运行在主机 CPU 上的软件完成。网卡中的链路层控制器承担分帧、链路访问、流量控制和差错检测等功能。路由器则通常在其线卡中实现链路层功能。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012202749.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Error Control and Flow Control

可靠传输中，三个机制相互配合：

**确认（ACK）** 反馈接收情况；**计时器（Timer）** 避免丢帧后无限等待；**序号（Sequence Number）** 帮助识别重复帧。

## Data link layer: Framing

### Frame Format and Frame Boundaries

一般帧结构为：

```text
[ Header | Payload field | Trailer ]
           网络层分组
```

头部携带本层控制信息，载荷承载上层分组，尾部可携带校验信息。接收方先确定帧边界，再按协议检查和处理帧。

**分帧的目标：容易找到帧边界，同时尽量少占用信道带宽。** 发生错误后能否重新找到后续边界，也很重要。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012203231.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Byte Count

**字节计数法**在头部使用一个字段说明整帧的字节数。

:::EXAMPLE
**计数字段从 5 变成 7**

`5 = 101₂`，`7 = 111₂`，只需要一个比特翻转。接收方会多吞入后面的两个字节，把下一帧的一部分当作当前帧内容，随后又把普通数据当作新的计数字段，导致连续的分帧失步。
:::

即使校验失败，接收方仍可能无法确定应跳过多少字节。因此，字节计数不适合单独承担全部边界识别任务。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012203311.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Flag Bytes with Byte Stuffing

在帧首、帧尾加入特殊的**标志字节（FLAG）**：

```text
FLAG | Header | Payload | Trailer | FLAG
```

前一帧的结束 FLAG 与后一帧的开始 FLAG 可以相邻出现。接收方失步后，可继续寻找可靠的标志序列，重新确定边界。

问题是：**数据本身也可能包含 FLAG。** 为使任意数据都能传输，需要使用**字节填充（Byte Stuffing）**：数据中的 FLAG 前加一个转义字节 `ESC`；数据中的 ESC 前也加一个 ESC。接收端遇到 ESC 时，去掉转义用的 ESC，把紧随其后的字节作为普通数据处理。

#### Examples

```text
原始数据           填充后
A FLAG B        → A ESC FLAG B
A ESC B         → A ESC ESC B
A ESC FLAG B    → A ESC ESC ESC FLAG B
A ESC ESC B     → A ESC ESC ESC ESC B
```

<details>
<summary>展开</summary>

分别处理原始数据中的每一个字节：

```text
A    → A
ESC  → ESC ESC
FLAG → ESC FLAG
B    → B
```

拼接得到 `A ESC ESC ESC FLAG B`。

接收端把 `ESC ESC` 还原成一个 ESC，把 `ESC FLAG` 还原成一个 FLAG，最终恢复原始序列。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012203524.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Flag Bits with Bit Stuffing

**比特填充（Bit Stuffing）** 直接在比特层面工作，帧内容可以包含任意数量的比特。

帧边界使用：

$$
\mathrm{FLAG}=01111110=\mathtt{0x7E}
$$

**发送规则**：在需要填充的帧内部比特流中，每出现连续 **5 个 1**，立即插入一个 0。

**接收规则**：识别出帧内部的数据后，每看到连续 5 个 1，删除紧随其后的那个填充 0。

真正的边界 FLAG 保持原样。这样，帧内部就不会未经处理地出现与边界完全相同的 `01111110`。

#### Examples

**数据中恰好出现 FLAG 的位型：**

```text
原始数据：0 11111 1 0
填充之后：0 11111 [0] 1 0
连写结果：011111010
去填充后：01111110
```

方括号仅用于标出新增位。


```text
原始数据：0110 11111    11111    11111    1 0010
线路数据：0110 11111[0] 11111[0] 11111[0] 1 0010
接收恢复：0110 11111    11111    11111    1 0010
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012203636.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Physical Layer Coding Violations

**物理层编码违例法** 利用正常数据编码不会使用的信号，表示帧的开始或结束。

**4B/5B 的例子**：4 位数据只有 $2^4=16$ 种组合，5 位信号码共有 $2^5=32$ 种组合。正常数据映射之外的部分保留信号，可以用作控制标记。

**曼彻斯特编码**：正常比特在位周期中间有跳变。利用不符合正常跳变规则的信号形式作为帧起始标志。

这种方法依赖物理层确实存在可用的保留编码。由于标记不会由正常数据编码产生，无需再为这一标记对普通数据做同样的填充。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012204257.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Combining Framing Methods

实际协议可以组合使用几种方法。例如，用**前导码（Preamble）＋长度字段**说明：前导码让接收方准备接收、建立同步，长度字段辅助定位帧尾。

## Data link layer: Error Control

### Error Models and Basic Strategies

两种基本策略都需要增加冗余信息：

**纠错码（Error-Correcting Codes）** 加入足够的冗余，使接收方在一定错误范围内推断并恢复原数据。较易出错、重传代价较大的链路适合考虑这种方法。

**检错码（Error-Detecting Codes）** 主要判断数据是否发生错误；发现问题后，可结合重传协议取得正确数据。在低误码率链路上，少量校验加偶发重传往往更经济。

两种主要错误模型：**孤立的单比特错误**，以及由深衰落或瞬态干扰等引起的**突发错误（Burst Error）**。

突发错误描述一段受影响的范围，范围内不要求每一位都翻转。

### Error Correction

#### Block Codes and Code Rate

设原始数据有 $m$ 位，校验位有 $r$ 位，则码字长度为：

$$
n=m+r
$$

**块码（Block Code）** 的校验位由当前这组 $m$ 位数据计算得到。

**系统码（Systematic Code）** 把输入数据位直接保留在码字中，并加入校验位；

**线性码（Linear Code）** 的校验位是数据位的线性函数；二进制线性运算中常用异或。

**码率（Code Rate）** 为有效数据位占整个码字的比例：

$$
R_c=\frac{m}{n}=\frac{m}{m+r}
$$

码率 $1/2$ 表示约一半传输位用于冗余；码率接近 1 表示冗余相对较少。

#### Hamming Distance

两个等长比特串的**海明距离（Hamming Distance）**是对应位置不同的比特数。计算时可以先异或，再统计结果中 1 的个数：

```text
  10001001
⊕ 10110001
----------
  00111000
```

因此两者距离为 **3**。

一套编码的海明距离取所有不同合法码字之间距离的最小值：

$$
d_{\min}=\min_{x,y\in\mathcal C,\,x\ne y}d_H(x,y)
$$

这里 $\mathcal C$ 是**合法码字集合**。

#### Error-Detecting and Error-Correcting Capabilities

若需要保证检测至多 $e$ 位错误，应满足：

$$
\boxed{d_{\min}\ge e+1}
$$

若需要保证纠正至多 $t$ 位错误，应满足：

$$
\boxed{d_{\min}\ge 2t+1}
$$

因此，给定 $d_{\min}$，最大保证检错位数和纠错位数分别为：

$$
e_{\max}=d_{\min}-1,\qquad
t_{\max}=\left\lfloor\frac{d_{\min}-1}{2}\right\rfloor
$$

<details>
<summary>展开</summary>

**检错** 只需保证错误无法把一个合法码字变成另一个合法码字。若任意两个合法码字至少相差 $e+1$ 位，至多翻转 $e$ 位后得到的串就不会成为另一个合法码字，接收方能发现不合法。

**纠错** 需要进一步确定原来是哪一个合法码字。若原码字为 $x$，接收串为 $z$，且 $d_H(x,z)\le t$，对任何其他合法码字 $y$：

$$
d_H(y,z)\ge d_H(x,y)-d_H(x,z)
\ge(2t+1)-t=t+1
$$

因此 $z$ 距离 $x$ 至多为 $t$，距离任何其他合法码字至少为 $t+1$，原码字可被唯一确定。

直观上，每个合法码字周围半径为 $t$ 的可纠错区域不能互相重叠。

</details>

#### Example

**Four Valid Codewords**

给出合法码字：

```text
0000000000
0000011111
1111100000
1111111111
```

求码本的最小海明距离，并分析接收串 `0000000111`。

<details>
<summary>展开解答</summary>

任意两个不同码字之间的距离为 5 或 10，所以：

$$
d_{\min}=5
$$

它可以**保证纠正至多 2 位错误**；用于纯检错时，可以**保证检测至多 4 位错误**。

接收串 `0000000111` 到四个合法码字的距离依次是：

```text
到 0000000000：3
到 0000011111：2
到 1111100000：8
到 1111111111：7
```

在“至多两位错误”的前提下，解码为 `0000011111`。

但若发送方原本发的是 `0000000000`，最后三位恰好翻转，也会得到同一个接收串。按最近码字纠错就会误判。

</details>

#### Lower Bound on the Number of Check Bits

若 $m$ 位数据加上 $r$ 位校验，希望能够纠正**码字任意位置的单比特错误**，需要满足：

$$
\boxed{m+r+1\le 2^r}
$$

<details>
<summary>展开</summary>

共有 $2^m$ 个可能的数据消息，每个消息对应一个合法的 $n$ 位码字。

对于每个合法码字，需要区分：原码字本身，以及分别翻转第 $1,2,\ldots,n$ 位得到的 $n$ 种错误模式，共 $n+1$ 个比特串。

为了唯一纠错，不同合法码字的这些区域不能重叠，而全部 $n$ 位串只有 $2^n$ 种。因此：

$$
(n+1)2^m\le 2^n
$$

代入 $n=m+r$：

$$
(m+r+1)2^m\le 2^{m+r}
\quad\Longrightarrow\quad
m+r+1\le 2^r
$$

</details>

$(7,4)$ 海明码示例取 $m=4,r=3,n=7$，有 $4+3+1=2^3$。

#### Hamming Code

**海明码（Hamming Code）** 利用特定的校验位位置，让校验结果直接指出单比特错误的位置。

**从最右边开始编号，位置号为 $1,2,3,\ldots$，采用偶校验。**

**校验位**放在 $1,2,4,8,\ldots$ 等 2 的幂次位置，其余位置依序填数据位。

位置 $j$ 参与哪些校验，由 $j$ 的二进制表示决定。例如：

$$
11=(1011)_2=8+2+1
$$

所以位置 11 参与 $p_8,p_2,p_1$ 的校验。每组校验包含对应校验位本身。

**快速编码方法**：将所有取值为 1 的**数据位的位置号**转成二进制，再逐位异或；所得结果按高位到低位写入 $p_8,p_4,p_2,p_1$ 等相应校验位置。

#### Example

**Encoding an 8-Bit Message**

原始数据为 `00111001`，求海明编码后的 12 位码字。

<details>
<summary>展开</summary>

由 $8+r+1\le2^r$ 可得最少需要 $r=4$ 位校验，完整长度 $n=12$。

预留位置 1、2、4、8：

```text
位置：12 11 10  9  8  7  6  5  4  3  2  1
内容： 0  0  1  1 p8  1  0  0 p4  1 p2 p1
```

数据位中为 1 的位置是 10、9、7、3：

$$
(1010)_2\oplus(1001)_2\oplus(0111)_2\oplus(0011)_2
=(0111)_2
$$

因此：

$$
(p_8,p_4,p_2,p_1)=(0,1,1,1)
$$

填回原位：

```text
位置：12 11 10  9  8  7  6  5  4  3  2  1
码字： 0  0  1  1  0  1  0  0  1  1  1  1
```

最终发送：

$$
\boxed{001101001111}
$$

</details>

#### Syndrome and Single-Bit Error Correction

接收方重新检查校验关系，得到**伴随式／校验综合（Syndrome）**。在上述偶校验构造中，也可以把收到码字内**所有取值为 1 的位置号**异或，包括校验位的位置。

在“没有错误或至多一个比特错误”的前提下：

- $S=0$：没有检测到错误。
- $S\ne0$：$S$ 的数值给出错误位置，翻转该位即可纠正。
- 若 $S$ 的二进制只有一个 1，则 $S$ 是 2 的幂，对应某个校验位出错。

**例一：数据位出错。** 收到 `001101101111`。

<details>
<summary>展开</summary>

与原码字相比，编号为 6 的数据位由 0 变成了 1。将收到的校验结果与为 1 的数据位位置异或：

$$
S=0111\oplus1010\oplus1001\oplus0111\oplus0110\oplus0011
=0110
$$

所以 $S=6$，翻转右起第 6 位，恢复为 `001101001111`。去掉位置 1、2、4、8 的校验位，得到 `00111001`。

</details>

**例二：校验位出错。** 收到 `001101000111`。

<details>
<summary>为什么原始数据可以直接提取？</summary>

将所有为 1 的位置号异或：

$$
S=1010\oplus1001\oplus0111\oplus0011\oplus0010\oplus0001
=0100
$$

因此错误位置为 4，属于校验位。原始数据位没有变化，直接删除全部校验位仍能取得 `00111001`。

</details>

<details>
<summary>为什么位置异或能够直接定位错误？</summary>

合法码字中，所有取值为 1 的位置号异或为 0。若位置 $j$ 翻转，则无论是 $0\to1$ 还是 $1\to0$，总异或结果都相当于多异或一次 $j$：

$$
S=0\oplus j=j
$$

若有多个位置同时出错，结果变成这些位置号的异或，可能恰好指向另一个位置。因此，普通海明码的单错定位规则不能无条件用于多错情况。

</details>

#### Binary Convolutional Codes

**卷积码（Convolutional Code）** 连续处理输入序列，输出同时依赖当前输入与历史输入，编码器具有记忆。

用 $(n,m,K)$ 描述：每次输入 $m$ 位、输出 $n$ 位。输出依赖当前输入块与前 $K-1$ 个输入块；$K$ 为约束长度。

**例：$(n,m,K)=(3,1,3)$，初始寄存器全为 0，依次输入 `1、0、1`。**

三路输出依次为：

$$
y_1=u_t,\qquad
y_2=u_t\oplus u_{t-2},\qquad
y_3=u_t\oplus u_{t-1}\oplus u_{t-2}
$$

<details>
<summary>展开：三个时刻的寄存器状态与输出</summary>

```text
当前输入    [当前输入, 前一次输入, 前两次输入]    输出
   1                    [1,0,0]                 111
   0                    [0,1,0]                 001
   1                    [1,0,1]                 100
```

所以输出为：

$$
\boxed{111\;001\;100}
$$

每输入一位，旧输入向后移动，并继续影响随后的输出。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012205135.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Convolutional Decoding and Trellis Diagram

译码的基本目标是：找出最可能产生收到的输出序列的输入序列。

**Viterbi 算法**：沿时间展开状态转移，在每个时刻、每个状态保留累计误差较小的候选路径，最后选择误差最少的路径。

<details>
<summary>展开</summary>

编码器的输出为：

$$
y_1=u_t\oplus u_{t-1}\oplus u_{t-2},\qquad
y_2=u_t\oplus u_{t-2}
$$

状态记录前两次输入，故有 $2^2=4$ 个状态：$a=00,b=10,c=01,d=11$。依据接线图计算：

| 当前状态 | 输入 0：下一状态／输出 | 输入 1：下一状态／输出 |
| --- | --- | --- |
| $a=00$ | $a=00$／00 | $b=10$／11 |
| $b=10$ | $c=01$／10 | $d=11$／01 |
| $c=01$ | $a=00$／11 | $b=10$／00 |
| $d=11$ | $c=01$／01 | $d=11$／10 |

将同一组状态沿 $t_0,t_1,t_2,\ldots$ 重复排列，并连接允许的转移，就得到**网格图（Trellis Diagram）**。

图上每条边对应一个输入以及由此产生的输出。把实际收到的输出与候选边输出比较，累积差异；多条路径到达同一状态时，保留累计差异更小的路径。这样利用了整段状态演化关系，无需把每个接收位孤立地判断。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012205239.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>



NASA 二进制卷积码的应用图，每输入 1 位产生 2 位输出，该例码率为 $1/2$，6 个历史寄存器加当前输入，对应约束长度 $K=7$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012205327.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Error Detection

#### Parity

**奇偶校验（Parity）** 只添加一个校验位，使整个码字中 1 的个数满足约定的奇偶性。

原始数据 `1011010` 含 4 个 1：

```text
偶校验：1011010 + 0 → 10110100
奇校验：1011010 + 1 → 10110101
```

**奇数个位翻转会被检测，偶数个位翻转会保持奇偶性而漏检。** 单个奇偶校验位不能定位错误位置。

该码的 $d_{\min}=2$，保证检出 1 位错误，不能保证纠正任何一位错误。

#### Example

**Error Correction versus Detection and Retransmission**

每组数据 1000 bit，共传输 1 Mbit 数据，纠错和“检错＋重传”分别产生多少额外开销？

<details>
<summary>展开计算</summary>

**海明码单错纠正**：令 $m=1000$，有

$$
1000+r+1\le2^r
$$

$r=9$ 时 $1010>512$，不满足；$r=10$ 时 $1011\le1024$，满足。

1 Mbit 数据共有 $10^6/1000=1000$ 个数据块，每块增加 10 位校验，共增加：

$$
1000\times10=10000\text{ bit}
$$

**奇偶检错＋重传**：每块增加 1 位校验，首先增加 1000 bit。按误码率 $10^{-6}$ 的稀少错误近似，1 Mbit 数据平均约有一次比特错误，约需重传一个含校验位的 1001 bit 块。

因此额外开销约为：

$$
1000+1001=\boxed{2001\text{ bit}}
$$

**结论**：低误码率场景可以用较少校验位，偶尔重传一个块，避免每个块都持续承担较多纠错冗余。

</details>

#### Interleaving

单个奇偶位对长突发错误的保护有限。

**交织（Interleaving）** 改变校验分组相对于传输顺序的组织方式，让连续位置的错误分散到不同校验组。

**数据按行发送，校验按列计算**，最后发送各列校验位。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012205917.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**例：发送 `Network`。** 图中部分数据发生下列变化：

```text
第 2 行：e  1100101 → 1100011  c
第 3 行：t  1110100 → 1101100  l
```

两行各翻转 2 位，分别做行奇偶校验可能都漏检；按列看，第 3、4、5、6 列各有一个比特翻转，列校验能够发现问题。

突发范围跨越 7 个比特位置，实际翻转了其中 4 位。

当矩阵宽为 $n$ 位，且只发生一个长度不超过 $n$ 的突发错误时，按行传输会使每列至多受影响一位，列奇偶校验因而能够检出。更长或多个突发错误仍可能漏检。

#### Two-Dimensional Parity

**二维奇偶校验** 同时给每一行、每一列增加校验位。单比特错误会同时破坏所在行与所在列的奇偶性，两者交点即可定位错误。

偶校验示例为：

```text
数据部分       行校验
1 0 1 0 1  | 1
1 1 1 1 0  | 0
0 1 1 1 0  | 1
-----------+--
0 0 1 0 1  | 0   ← 列校验
```

<details>
<summary>展开：单错定位与双错检测</summary>

**单错**：图中第 2 行、第 2 列由 1 变成 0，对应的行校验与列校验都失败，交点确定了这一位。翻转即可恢复。

**双错**：图中另一例把第 1 行中相邻的 `10` 变成 `01`。该行共翻转两位，行奇偶性不变；两个相关列的校验失败。

**任意两位错误都能检测，不能保证纠正任意两位错误。**

</details>

#### The 16-bit Internet Checksum

**校验和（Checksum）** 把数据划成固定长度的字，再做累加。

**反码加法（One’s Complement Arithmetic）**： 16 位 Internet 校验和。

**反码**中，负数是对应正数的逐位取反；**补码**在逐位取反后再加 1。

**回卷进位**：16 位相加发生高位溢出时，把溢出部分加回低 16 位；若仍有进位，继续回卷。最后逐位取反得到校验和。

**发送端**：数据按 16 位分组，校验和字段先置 0；累加、回卷进位、逐位取反，写入校验和字段。

**接收端**：把数据与收到的校验和一起累加并回卷；结果为 `FFFF`，等价于再取反得到 `0000`，表示校验通过。

#### Example

**Computing and Checking the Checksum**

数据字为十六进制 `0001、F203、F4F5、F6F7`。

<details>
<summary>展开：发送端求 220D，接收端验证 FFFF</summary>

发送端普通累加：

```text
    0001
    F203
    F4F5
    F6F7
  + 0000    ← 校验和字段先置零
  ------
   2DDF0
```

把高位 `2` 加回低 16 位：

$$
\mathtt{DDF0}+\mathtt{0002}=\mathtt{DDF2}
$$

逐位取反：

$$
\boxed{\text{Checksum}=\mathtt{220D}}
$$

接收端将校验和一并累加：

$$
\mathtt{0001}+\mathtt{F203}+\mathtt{F4F5}+\mathtt{F6F7}+\mathtt{220D}
=\mathtt{2FFFD}
$$

回卷后：

$$
\mathtt{FFFD}+\mathtt{0002}=\mathtt{FFFF}
$$

再取反为 `0000`，校验通过。

</details>

这种方法比单个奇偶位提供更多检测信息，计算也简单；但求和具有局限，例如**在保持分组方式的条件下，加入或删除全零数据字、交换完整数据字的位置**，可能不改变结果。

**校验通过只表示未检测到错误，不能证明数据绝对无误。** 后面的 CRC 也有同样的逻辑限制。

#### Cyclic Redundancy Check

**循环冗余校验（Cyclic Redundancy Check，CRC）** 选择一段冗余，使发送的完整码字能够被双方约定的生成模式整除。所有运算都在模 2 意义下进行。

- $D$：$m$ 位原始数据；$T$：$n$ 位完整发送码字。
- $F$：附在末尾的 $r=n-m$ 位帧校验序列（FCS）。
- $P$：双方约定的 $r+1$ 位生成模式；$Q$、$R$：除法的商与余数。

$P$ 的最高位与最低位都为 1，长度比 FCS 多一位。教材还将位串解释为多项式的系数，例如：

$$
10011\;\longleftrightarrow\;x^4+x+1
$$

模 2 加法与减法都等同于**异或**，不产生普通二进制加减中的进位或借位。

#### CRC Encoding and Verification

设生成多项式 $P(x)$ 的次数为 $r$。

**先补零**：在 $D$ 末尾补 $r$ 个 0，对应 $x^rD(x)$。

**再求余数**：用 $P(x)$ 做模 2 长除法，得到次数小于 $r$ 的余数 $R(x)$；不足 $r$ 位时在左边补 0。

**形成完整码字**：将余数填入末尾 $r$ 位：

$$
T(x)=x^rD(x)\oplus R(x)
$$

因为模 2 下同一余数异或两次为 0，所以：

$$
\boxed{T(x)\bmod P(x)=0}
$$

接收端用同一个 $P$ 去除收到的完整码字。余数非零表示检测到错误；余数为零表示通过本次 CRC 检查。

#### Example

**CRC Long Division**

```text
数据 D：1101011111
生成 P：10011
```

求 FCS 和完整发送码字。

<details>
<summary>展开：模 2 长除法与验算</summary>

$P$ 有 5 位，所以 $r=4$，先补 4 个 0：

```text
11010111110000
```

下面省略商为 0 时的无效异或，只保留各次用移位后的 `10011` 消去最高位的步骤：

```text
  11010111110000
⊕ 10011000000000
----------------
  01001111110000
⊕ 01001100000000
----------------
  00000011110000
⊕ 00000010011000
----------------
  00000001101000
⊕ 00000001001100
----------------
  00000000100100
⊕ 00000000100110
----------------
  00000000000010
```

余数补足 4 位得到：

$$
F=\boxed{0010}
$$

最终码字：

$$
T=D\Vert F=\boxed{11010111110010}
$$

</details>

#### Undetected Error Patterns

**错误模式本身能被 $P$ 整除，会怎样？**

<details>
<summary>展开：从错误多项式推导 CRC 漏检条件</summary>

把传输中翻转的位置写成错误模式 $E(x)$。接收串为：

$$
T'(x)=T(x)\oplus E(x)
$$

其中正常码字满足 $T(x)\bmod P(x)=0$，所以：

$$
T'(x)\bmod P(x)=E(x)\bmod P(x)
$$

若 $E(x)\ne0$ 且 $E(x)$ 恰好是 $P(x)$ 的倍数，接收串依然余数为 0，**错误会漏检**。

因此，CRC 检测能力与生成多项式有关。仅仅选一个任意生成模式，不能保证发现所有错误。

</details>

## Elementary data link protocols

前面的编码解决“收到的比特是否正确”，接下来要解决**帧丢失、确认丢失、接收方来不及处理，以及重传造成重复**等协议问题。

### Protocol Model and Primitives

网络层交给链路层的是**分组**，链路层把它装入**帧**后交给物理层。接收端反向处理。

```text
发送端：网络层 → 分组 → 数据链路层 → 帧 → 物理层
接收端：物理层 → 帧 → 数据链路层 → 分组 → 网络层
```

四个接口：

- `from_network_layer(&buffer)`：从本机网络层取出待发送分组。
- `to_physical_layer(&s)`：把构造好的帧交给物理层发送。
- `from_physical_layer(&r)`：取得物理层收到的帧。
- `to_network_layer(&r.info)`：把帧内分组交付本机网络层。

`frame_arrival`、`cksum_err`、`timeout` 分别表示完整帧到达、校验出错、定时器超时等事件。

### A Utopian Simplex Protocol

**理想单工协议：发送方一直发，接收方一直收。**

它建立在五个很强的假设上：数据仅单向传送；双方网络层始终就绪；处理时间忽略；接收缓冲无限；信道既不损坏帧，也不丢帧。

<details>
<summary>展开：协议 1 的最小逻辑</summary>

```text
发送方循环：
    从网络层取一个分组
    把分组放入帧的数据字段
    发送帧

接收方循环：
    等待帧到达
    取出收到的帧
    把数据字段交给网络层
```

在这些假设下，无须等待确认，也无须设置定时器、序号或重传。实际信道与接收设备通常不满足这些假设。

</details>

### A Simplex Stop-and-Wait Protocol for an Error-Free Channel

现在保留“信道无错”，但允许接收方处理速度有限、缓冲有限。

**停等（Stop-and-Wait）**：发送一帧后暂停，直到接收方返回允许继续的确认，再发送下一帧。

```text
发送方 A                         接收方 B
   ├──── 数据帧 0 ───────────────→│
   │                             │ 接收并交付网络层
   │←──── 确认／允许继续 ──────────┤
   ├──── 数据帧 1 ───────────────→│
   │            ……               │
```

这里的确认首先承担**流量控制**作用：接收方处理完当前帧后，才放行下一帧。由于仍假定帧及确认不会丢失或损坏，协议 2 无须超时重传，也无须用序号区分重复帧。

> **单向数据与双向通信**：分组仍只从 A 发往 B，但确认需要从 B 返回 A。因此，承载它的链路至少要允许双向交替通信。

### A Simplex Stop-and-Wait Protocol for a Noisy Channel

进一步允许**数据帧或确认帧损坏、丢失**，仅靠“发送后等待”会出现永久等待。

协议模型假设损坏帧都能被检错机制识别；保留信道按发送次序传递帧的假设。

采用**自动重传请求（Automatic Repeat reQuest，ARQ）**的思路，把以下机制组合起来：

**检错码**判断收到的帧是否损坏；**ACK**反馈接收结果；**定时器**避免无限等待；**序号**区分新帧与旧帧的重传副本；**发送缓冲**保留尚未确认的分组，以便重传。

#### Why a Timer Is Needed

发出帧后启动定时器。如果一直得不到有效确认，就重传当前帧。

**超时只能说明“尚未取得有效确认”**。原数据可能未到达，也可能已经到达但 ACK 丢失或延迟。

定时器过短会制造不必要的重传；过长则使真实丢帧后的恢复变慢。

#### Why a Sequence Number Is Needed

**数据正确到达，ACK 丢失。**

<details>
<summary>没有序号会重复交付</summary>

假设 A 发送分组 $P_0$：

1. B 收到 $P_0$，交给网络层，并返回 ACK。
2. ACK 在途中丢失；A 无法知道 B 已经收到。
3. A 超时，重传 $P_0$。
4. 若帧中没有可区分新旧的序号，B 可能把它当成下一份分组，再交付一次。

加入序号后，B 可以辨认“这份数据已经交付过”，丢弃重复数据，同时重新确认，帮助 A 继续前进。

**重传可能产生重复到达，协议必须避免重复交付。**

</details>

#### Why One Bit Is Sufficient

停等时，同一方向最多有一帧尚未确认。在按序传输的信道假设下，接收方只需区分**当前期待的新帧**与**上一帧的重传副本**。

因此，序号交替使用即可：

$$
0\to1\to0\to1\to\cdots
$$

<details>
<summary>为什么不需要给所有分组永久编号？</summary>

发送方只有收到帧 $m$ 的确认，才会开始发送帧 $m+1$。既然已经发送过 $m$，帧 $m-1$ 的确认也已经处理过。

在这些假设下，当前需要消除的歧义局限于相邻两帧。1 位序号提供两个取值，已经足够。

**序号会循环复用，分组本身可以不断产生。**

</details>

#### Sender and Receiver Logic

**`ACK n` 表示已经正确接收序号为 $n$ 的帧**。

发送方维护 `next_frame_to_send`，接收方维护 `frame_expected`，均在 0、1 间切换。

**发送方**保留当前分组。只有正确收到与当前发送序号匹配的 ACK，才停止相应定时器、取得下一分组并切换序号；未取得有效确认时，继续处理当前分组。

**接收方**在帧通过检错后比较序号：期待的新帧只交付一次，然后切换 `frame_expected`；重复帧不再交付。两种情况都返回最近正确接收帧的确认。

$$
\text{ACK}=1-\texttt{frame\_expected}
$$

这个公式使用的是**处理本次接收之后**的 `frame_expected`。

<details>
<summary>展开：核心伪代码</summary>

```text
发送方：
    next_frame_to_send = 0
    从网络层取当前分组 buffer
    循环：
        用 buffer 和 next_frame_to_send 构造帧
        发送帧，启动定时器，等待事件
        若收到未损坏的 ACK，且 ACK 匹配当前序号：
            停止定时器
            从网络层取下一分组
            next_frame_to_send = 1 - next_frame_to_send
        进入下一轮发送

接收方：
    frame_expected = 0
    循环等待事件：
        若完整帧到达并通过检错：
            若 r.seq == frame_expected：
                向网络层交付 r.info
                frame_expected = 1 - frame_expected
            返回 ACK(1 - frame_expected)
        若校验失败：
            不交付该帧
```

例如，B 原来期待 0：收到正确帧 0 后，期待值变为 1，回复 ACK0；再收到重复帧 0，期待值仍为 1，仍回复 ACK0。

</details>

#### Operations of Stop-and-Wait

| 情形 | 发送方与接收方的行为 |
| --- | --- |
| 正常传输 | 正确数据到达，ACK 返回，双方按规则切换序号 |
| ACK 丢失 | 发送方重传；接收方丢弃重复数据，再次回复对应 ACK |
| 数据帧丢失或损坏 | 接收方没有交付该分组；发送方重传当前帧，必要时多次重试 |
| ACK 晚于超时 | 重传可能已经发出；接收方仍按序号去重，发送方按当前等待的序号处理 ACK |

**丢失 ACK 不应导致分组重复交付；损坏数据不应被交付；旧 ACK 不应误确认当前新帧。**

## Sliding window protocols

滑动窗口把**双向传输、确认、发送缓冲与流量控制**统一起来。窗口大于 1 时，还允许多帧在途，减少停等造成的闲置。

### Piggybacking

双方都有数据要发时，一个方向上传送的数据帧，可以同时携带对另一方向数据的确认。

**捎带确认／驮运（Piggybacking）**：把 ACK 暂时留住，放到随后发往对端的数据帧中，一起发送。

```text
A ─── 数据 A0 ──────────────────→ B
A ←── 数据 B0 ＋ 对 A0 的 ACK ─── B
A ─── 数据 A1 ＋ 对 B0 的 ACK ──→ B
```

这样可以减少独立确认帧的头尾、传输与处理开销；

`seq` 标识本帧携带的数据；`ack` 确认对端先前发来的数据。

#### How Long Should an ACK Wait?

不能无限等待下一份反向数据，否则发送方可能一直收不到确认。

基本办法是设置一段有限的捎带等待时间：期间有反向数据就捎带；到期仍无数据，就发独立 ACK。

这段等待时间足够短，避免因确认被拖延而引起对端不必要的超时重传。

> 后面的协议 5 为简化代码，只使用捎带确认；协议 6 增加独立 ACK 与 ACK 定时器。

### The Essence of All Sliding Window Protocols

#### Sequence Space and Window Size

若序号字段为 $k$ 位，记序号空间大小为 $M$：

$$
M=2^k=\texttt{MAX\_SEQ}+1
$$

序号为 $0,1,\ldots,M-1$，递增时按模 $M$ 循环：

$$
\operatorname{inc}(s)=(s+1)\bmod M
$$

**序号空间大小**决定可用编号有多少；**窗口大小**决定同时允许多少帧处于相应状态。

#### Sending Window

发送窗口包含当前允许发送、且尚未得到确认的帧所对应的序号。窗口中的帧可能已经发出，也可能已准备好、允许发送。

**已发出但未确认的帧必须保留副本**，因为它们可能在途中损坏或丢失。

记最大发送窗口为 $W_s$，当前已占用、尚未确认的帧数为 `nbuffered`：

$$
0\le\texttt{nbuffered}\le W_s
$$

取入并发送新分组，会增加未确认帧数；收到有效确认后，释放已确认帧的缓冲，窗口前沿可以继续推进。窗口满时暂停接收网络层的新分组，空位出现后再放行，这就是流量控制。

#### Receiving Window

接收窗口由**当前允许接收的帧序号集合**构成。

通过检错、位于窗口内且尚未接收的帧可以进入缓冲；窗口外的帧不作为新数据接收。窗口的下边界表示下一份需要按序交付网络层的分组。

- $W_r=1$：只能接收当前期待的那一帧。
- $W_r>1$：可以先缓存后到序号的帧，等待前面缺失的帧补齐。

**允许乱序接收，不代表允许乱序交付网络层。** 必须从窗口下边界开始，把连续齐备的分组依次向上交付，然后移动窗口。

发送窗口与接收窗口的大小、上下边界不必相同。例如，接收方已经收到一帧并推进窗口时，ACK 可能仍在途中，发送方尚未推进。

#### Example

**A Window of Size One**

使用 **3 位序号、最大窗口为 1**

| 阶段 | 发送方尚未确认的帧 | 接收窗口 |
| --- | --- | --- |
| 初始 | 空，下一帧可用序号 0 | $\{0\}$ |
| 发出帧 0 | $\{0\}$ | $\{0\}$ |
| 接收方收到并交付帧 0 | 仍为 $\{0\}$，ACK 尚未回来 | $\{1\}$ |
| 发送方收到 ACK0 | 空，下一帧可用序号 1 | $\{1\}$ |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261019101016.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### A One-Bit Sliding Window Protocol

**协议 4 是双向停等协议**：双方同时具有发送和接收职责，最大发送窗口与接收窗口均为 1，序号为 0、1。

每台机器维护两个相互独立的状态：

**`next_frame_to_send`**：本机当前发送分组的序号。

**`frame_expected`**：本机接下来期待从对端收到的序号。

#### Two Independent Checks

收到一个未损坏的帧后，需要分别处理其数据与捎带确认：

```text
if r.seq == frame_expected:
    向网络层交付 r.info
    切换 frame_expected

if r.ack == next_frame_to_send:
    停止当前发送帧的定时器
    从网络层取得下一分组
    切换 next_frame_to_send
```

**这里是两个独立的 `if`。** 即使该帧的数据部分属于重复数据，其 `ack` 也可能确认本机当前的发送帧，仍要检查。

随后构造发出的帧：

```text
s.info = 当前待发送分组
s.seq  = next_frame_to_send
s.ack  = 1 - frame_expected
```

#### Example

**Normal and Simultaneous Starts**

用三元组 **`(seq, ack, packet number)`** 标注帧。

其中 `packet number` 用来追踪真正的数据分组，`seq` 会循环。

<details>
<summary>展开：正常启动的前几次交换</summary>

用 $A_0,A_1,\ldots$ 表示 A 的真实分组，$B_0,B_1,\ldots$ 表示 B 的真实分组。

```text
A → B：(0, 1, A0)
B → A：(0, 0, B0)
A → B：(1, 0, A1)
B → A：(1, 1, B1)
A → B：(0, 1, A2)
```

例如，A 收到 `(0,0,B0)` 后，一方面把期待的 $B_0$ 交给网络层，另一方面知道自己的 $A_0$ 已被确认。因此，它接下来可以发送 $A_1$，并在该帧中确认 $B_0$。

最初 `frame_expected=0`，按公式计算出的 `ack=1` 是循环编号下的初始值。

</details>

<details>
<summary>展开：双方同时发送第一帧，为什么仍正确但效率下降？</summary>

双方最初都发出 `(seq=0, ack=1)`。

收到对方第一帧时，数据序号 0 符合期待，可以交付；但其中 ACK1 不匹配本机正在等待确认的序号 0。因此，本机尚不能换成下一分组，只能继续发送当前分组，同时把 ACK 更新为 0。

这样会出现额外副本。接收端依靠 `frame_expected` 去重，仍可保持每份分组只交付一次；但部分帧的传送没有带来新分组，浪费了带宽。

红箭头为超时重传；该实现每轮事件处理后都会发送当前帧，未确认当前发送帧的接收事件也可能触发重复发送。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012211600.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Pipelining and Link Utilization

**停等的主要效率问题是：传播时延较长时，链路的大量时间花在等待 ACK。** 窗口扩大后，可以在等待前面帧的确认期间继续发送后面的帧，形成**流水线（Pipelining）**。

#### Example

**A Satellite Channel**

速率 $R=50\,\mathrm{kbps}$；往返传播时延 $500\,\mathrm{ms}$；帧长 $L=1000\,\mathrm{bit}$。忽略 ACK 自身的发送时间和处理时间。

**停等利用率约为 3.85%；持续发送需要至少 26 帧的窗口。**

<details>
<summary>展开：停等利用率与时间线</summary>

发送一整帧所需时间：

$$
T_f=\frac{L}{R}=\frac{1000}{50\times10^3}=20\,\mathrm{ms}
$$

单向传播时延 $T_p=250\,\mathrm{ms}$。于是：

```text
t =   0 ms：发送方开始发送第一帧
t =  20 ms：整帧发送完毕
t = 270 ms：接收方完整收到该帧，并立即返回 ACK
t = 520 ms：ACK 回到发送方，才能开始下一帧
```

一个周期只有 20 ms 在发送数据：

$$
U=\frac{20}{520}=\frac1{26}\approx3.85\%
$$

等待比例为 $500/520\approx96.15\%$，只有 4% 带宽被使用。

这里的 500 ms 是**往返传播时间**，还需要另外计入完整数据帧的 20 ms 发送时间。

</details>

<details>
<summary>展开：为什么窗口至少需要 26 帧？</summary>

单向链路的带宽时延积：

$$
R T_p=50\times10^3\times250\times10^{-3}=12500\,\mathrm{bit}
$$

折算为帧数，课件记为 $BD$：

$$
BD=\frac{R T_p}{L}=12.5\ \text{帧}
$$

若发送方不断发送，在第一个 ACK 返回前必须有足够的窗口容纳这些未确认帧：

$$
W T_f\ge T_f+2T_p
$$

所以：

$$
W_{\min}=\left\lceil1+\frac{2T_p}{T_f}\right\rceil
=\left\lceil2BD+1\right\rceil
=\boxed{26}
$$

“乘 2”考虑确认返回的往返传播；“加 1”考虑接收方完整收完一帧后才产生确认。

连续发送 26 帧耗时 $26\times20=520\,\mathrm{ms}$，恰好等到第一份 ACK 返回。此时释放一个空位，就可以无缝继续发送下一帧。

</details>

#### General Form

根据上述时间线，设 $a=T_p/T_f$，在**无差错、发送方始终有数据、帧长相同、忽略 ACK 发送和处理时间**时，可归纳为：

$$
U=\min\left(1,\frac{W}{1+2a}\right)
$$

**填满链路所需的窗口下限，与避免序号歧义的窗口上限，需要同时满足。**

### A Protocol Using Go Back N

**回退 N 帧（Go-Back-N，GBN）** 允许发送方连续发送多帧，但接收窗口仍为 1。接收方只接受当前期待的帧；中间有一帧丢失后，后续即使正确到达，也暂时不能交付并会被丢弃。

发生超时时，发送方从**最早未确认帧**开始，把当前所有尚未确认的帧依次重传。

```text
第一次：  0   1   2丢失   3   4   5
接收方： 收  收   等2    丢弃 丢弃 丢弃
超时后：         重传2 → 重传3 → 重传4 → 重传5
```

它减少接收端缓存与重排的复杂性，代价是出错时可能重传多份原本已经正确到达过的数据。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012211943.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Cumulative Acknowledgement

**累计确认（Cumulative ACK）**：ACK$n$ 表示截至帧 $n$ 的分组已经连续正确收到，相应窗口内更早的帧也一并得到确认。

例如，A 连发 0、1、2、3，收到 ACK3 后可以一次释放这四帧，无须分别等 ACK0、ACK1、ACK2。

如果接收方只连续收到 0、1，而 2 丢失，即使随后看见 3、4，也不能把累计确认推进到 4；最近连续正确接收的位置仍为 1。

不给被丢弃的帧发送确认表示不会把确认推进到这些被丢弃的新序号；这不妨碍反向帧继续捎带最近连续正确接收位置的 ACK。

#### Assumptions of Protocol 5

协议 5 使用**双向数据和捎带累计确认，不发送独立 ACK 帧**。它允许有噪声，网络层也不必一直有分组，新的可发送分组通过 `network_layer_ready` 事件到来。

仅捎带 ACK 这一条件下，若反向业务很少，确认会延迟；完全没有反向数据时，发送窗口可能一直无法释放。协议 6 将解除这一限制。

#### State Variables

| 变量 | 含义 | 主要更新时机 |
| --- | --- | --- |
| `next_frame_to_send` | 下一次使用的发送序号；重传期间兼作重传游标 | 每发一帧递增；超时时先回到 `ack_expected` |
| `ack_expected` | 最早尚未确认的发送帧 | 有效累计 ACK 到来后，跳过本次确认的帧 |
| `frame_expected` | 本机下一帧期待接收的序号 | 正确收到期待帧并交付后递增 |
| `nbuffered` | 当前未确认帧数 | 发送新分组时增加，确认释放时减少；重传不增加 |

帧内捎带的 ACK 为：

$$
\texttt{s.ack}=(\texttt{frame\_expected}-1)\bmod M
$$

代码写作 `(frame_expected + MAX_SEQ) % (MAX_SEQ + 1)`，以避免负数取模问题。

初始化 `frame_expected=0` 时，ACK 为 `MAX_SEQ`。例如 $M=8$ 时初始 ACK7；发送端还会检查这个 ACK 是否落在当前未确认范围内，不会把它当成“已确认了所有帧”。

#### Circular Interval and the between Function

序号循环后，窗口可能跨过 0。例如，$M=8$ 时区间 $[6,2)$ 包含：

$$
6,7,0,1
$$

因此，不能仅用普通数值比较 `6 <= seq < 2` 判断窗口归属。

<details>
<summary>展开：如何判断循环区间？</summary>

`between(a,b,c)` 判断 $b$ 是否位于循环区间 $[a,c)$，左端包含、右端不包含。协议 5 的实现为：

```c
return ((a <= b) && (b < c)) ||
       ((c < a) && (a <= b)) ||
       ((b < c) && (c < a));
```

第一种情况处理未跨 0 的普通区间；后两种情况处理跨 0 后的高序号部分与低序号部分。

ACK 到达时，代码执行：

```text
while between(ack_expected, r.ack, next_frame_to_send):
    释放 ack_expected 对应的发送缓冲
    停止该帧的定时器
    nbuffered -= 1
    inc(ack_expected)
```

假设当前未确认区间是 $[0,4)$，收到 ACK3，循环会依次释放 0、1、2、3，最终 `ack_expected=4`。

</details>

#### Event Handling

**网络层就绪**：取得新分组，放入发送缓冲，增加 `nbuffered`，发出并启动定时器，然后推进发送序号。

**正确帧到达**：数据部分只有在 `r.seq == frame_expected` 时才交付并推进期待序号；随后独立处理帧中的累计 ACK，释放已确认的发送缓冲。

**校验出错**：不信任该帧的内容及确认字段，忽略这份损坏帧。

**超时**：将发送游标退回 `ack_expected`，依次重传当前 `nbuffered` 帧。这里没有取得新分组，未确认帧数保持不变。

每次事件处理后，根据发送缓冲是否已满，启用或暂停网络层继续向下交付分组。

#### Example

1. **Normal Case**

取 $M=8$、$W_s=4$、$W_r=1$。图中的状态三元组为：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012212444.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

$$
(\texttt{next\_frame\_to\_send},\ \texttt{frame\_expected},\ \texttt{ack\_expected})
$$

<details>
<summary>展开：逐次解释正常收发中的状态变化</summary>

双方初始状态均为 `(0,0,0)`。

**A 连发 $A_0$ 到 $A_3$。** 四帧分别使用序号 0–3，均捎带 ACK7，因为 A 尚未接收过 B 的数据。A 发完后为 `(4,0,0)`；B 连续收到四帧后为 `(0,4,0)`。

**B 发出 $B_0$，携带 `seq=0, ack=3`。** A 收到后，接收期待序号推进为 1；ACK3 一次确认 $A_0$–$A_3$，停止这四帧的定时器。A 变为 `(4,1,4)`。

**B 再发 $B_1$，携带 `seq=1, ack=3`。** A 交付 $B_1$，但 ACK3 已经处理过，不会重复释放缓冲。A 变为 `(4,2,4)`。

**A 发出 $A_4$，携带 `seq=4, ack=1`。** ACK1 累计确认 $B_0$、$B_1$。发送后 A 为 `(5,2,4)`，B 收到后为 `(2,5,2)`。

**B 发出 $B_2$，携带 `seq=2, ack=4`。** A 收到后交付 $B_2$，确认并释放 $A_4$，状态变为 `(5,3,5)`。

</details>


2. **A Damaged or Lost Frame**

沿用相同参数，但 $A_1$ 损坏或丢失。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012212549.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开：为什么 A2、A3 也要重传？</summary>

A 发出 $A_0$–$A_3$ 后为 `(4,0,0)`。B 只收下 $A_0$，随后一直期待序号 1；$A_2$、$A_3$ 虽然正确到达，仍被丢弃，B 为 `(0,1,0)`。

B 发出的 $B_0$、$B_1$ 都只能携带 ACK0：

```text
A 收到 B0 后：(4,1,1)    只确认并停止 A0 的定时器
A 收到 B1 后：(4,2,1)    ACK0 重复，仍等待 A1
```

发生超时后，A 将发送游标退回 `ack_expected=1`，依次重传 $A_1$、$A_2$、$A_3$。由于 A 已经收到 $B_0$、$B_1$，这些重传帧会捎带 ACK1。

B 收到重传的 $A_1$ 后，同时完成两个方向的推进：交付 $A_1$，并由 ACK1 确认自己的 $B_0$、$B_1$；其状态为 `(2,2,2)`。收完 $A_2$、$A_3$ 后变为 `(2,4,2)`。

A 重传结束后游标回到 4，但仍未收到这批数据的确认，状态为 `(4,2,1)`。

最后 B 发送 $B_2$，携带 ACK3。A 收到后，一次释放 $A_1$–$A_3$，状态变为 `(4,3,4)`。

**协议 5 一次超时事件就会触发整批未确认帧重传，无须等待每一帧的定时器分别到期。** 重传期间 `next_frame_to_send` 会变化，但分组内容与原序号保持对应。

</details>

#### Maximum Sending Window

使用 $k$ 位序号、接收窗口为 1 时，GBN 的最大发送窗口为：

$$
\boxed{W_s\le M-1=2^k-1},\qquad W_r=1
$$

**需要在序号空间中保留一个未被当前发送窗口占用的编号，避免整圈复用产生确认歧义。**

<details>
<summary>展开：8 个序号例子</summary>

设序号为 0–7。

**若 $W_s=8$：**

发送方先发第一批 0–7，并收到 ACK7；接着又发第二批 0–7。

第二批可能全部丢失，也可能全部正确到达。但接收方随后发来的捎带 ACK 都可能为 7：全部丢失时，7 是第一批最后确认的位置；全部到达时，7 是第二批最后确认的位置。发送方无法仅凭 ACK7 区分这两种情况。

**若 $W_s=7$：**

第一批发送 0–6，收到 ACK6 后，第二批发送 7、0、1、2、3、4、5。

第二批全部丢失时，最近确认位置仍是 6；全部成功时，确认位置为 5。这样就不会出现上面的整圈歧义。

因此，序号共 8 个时，最多允许 7 帧未确认。

</details>

#### Multiple Timers

协议 5 为每一份未确认帧维护**逻辑定时器**。各帧发送时刻不同，可以独立超时；任一超时事件进入上述整批重传处理。

多个逻辑定时器不要求多只物理时钟。图 3-20 用一个软件队列记录各个到期时间或时间差，由一只时钟驱动。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012212637.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### A Sliding Window Protocol Using Selective Repeat

**选择重传（Selective Repeat，SR）** 允许接收方把丢失帧之后正确到达的帧先缓存起来；需要恢复时，只重传具体缺失或超时的帧，避免 GBN 的整批重复发送。

发送方、接收方都维护窗口。接收端窗口大于 1 时，可以乱序接收，但仍须按序向网络层交付。

#### Example

**Buffering Out-of-Order Frames**

<details>
<summary>展开：同样丢失帧 2，SR 怎样节省重传？</summary>

假设 0、1 正确到达，2 损坏，接下来的 3、4、5 正确到达且都在接收窗口内。

```text
第一次：      0   1   2损坏   3   4   5
接收方：     交付 交付  等2   缓存 缓存 缓存
补到帧2后：           依次交付 2 → 3 → 4 → 5
```

接收方可以用 NAK 请求补发 2；即使该请求未能生效，发送方最终仍可通过超时补发。

补到 2 后，连续缺口被填上，已经缓存的 3–5 无须重传。图中随后发出的 ACK5 表示连续收到 0–5，**从序号 0 开始计算，这里一共是六帧**。

“收到 5”与“可以累计确认到 5”有区别：只有 2 的缺口补齐后，累计确认才能越过该缺口。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012212729.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Sender and Receiver Buffers

协议 6 中，发送端当前占用从 0 增长到预设上限；接收窗口大小固定，每个可接收序号对应一个缓冲位置。

除前面的发送、接收序号外，还需关注：

**`out_buf`**：保留本机尚未确认的发送分组。

**`in_buf` 与 `arrived`**：保存乱序到达的分组，并记录相应缓冲是否已占用。

**`too_far`**：接收窗口上边界，不包含该序号。接收窗口为循环区间 `[frame_expected, too_far)`。

帧只有**在窗口内且尚未被保存**时才写入接收缓冲。然后检查窗口最前端，只要它已经到达，就连续交付、清空相应标志，并同时推进上下边界。

<details>
<summary>展开：接收缓冲的核心循环</summary>

```text
若收到的是未损坏的数据帧：
    若序号在接收窗口内，且该位置尚未收到：
        保存数据
        arrived[对应缓冲位置] = true

    while 窗口最前端对应的 arrived 为 true：
        将最前端分组交付网络层
        清除该位置的 arrived
        inc(frame_expected)
        inc(too_far)
        安排发送更新后的确认
```

代码用 `seq % NR_BUFS` 把循环序号映射到物理缓冲槽。槽数为窗口大小；帧序号的种类可以比槽数更多。

例如 $M=8$、`NR_BUFS=4` 时，序号 0 和 4 都映射到槽 0，但在正确设置的接收窗口内，它们不会同时占用该槽。因此，**先判断是否在窗口内，再使用模运算索引缓冲**。

</details>

#### Separate ACKs and the ACK Timer

为避免仅捎带确认造成的等待，协议 6 增加 **ACK 定时器**。

收到需要确认的数据后，先等待短时间，争取与反向数据捎带发送；若发生 `ack_timeout`，仍没有反向数据可用，就发送独立 ACK。

发送任何携带当前确认信息的帧之后，都可以停止 ACK 定时器。若它已经运行，再次调用启动操作不能不断把原到期时间推后，否则持续接收可能让确认迟迟发不出去。

**两类定时器的职责不同：** 数据定时器控制“多久没有确认就重传数据”；ACK 定时器控制“最多等多久就主动发出确认”。后者应设置得更短，给确认返回留出时间。

#### Negative Acknowledgements

**否定确认（Negative Acknowledgement，NAK）** 用于主动报告发现的缺口或损坏，要求对端重传相应帧。

接收方发现损坏帧，或收到不符合当前期待序号的数据帧时，可以发 NAK。为了避免对同一缺口反复请求，协议设置 `no_nak` 标志：

- `true`：对当前缺口尚未发送过 NAK，可以发送。
- 发出 NAK 后置为 `false`；等待同一缺口期间不重复发送。
- 期待帧到达并推动按序交付后，恢复为 `true`，可以报告后续新的缺口。

**NAK 加快恢复，数据定时器仍负责兜底。** 即使 NAK 丢失，发送方还会因超时而重传。

<details>
<summary>展开：协议 6 中的 ACK、NAK 字段约定</summary>

协议 6 继续使用**累计 ACK**。选择性体现在“缓存乱序数据”和“只重传指定帧”。

发送帧时统一设置：

$$
\texttt{s.ack}=(\texttt{frame\_expected}-1)\bmod M
$$

当 `kind=nak` 时，请求重传的序号是这个字段的后一个序号：

$$
\text{requested sequence}=(\texttt{r.ack}+1)\bmod M
$$

例如，接收方缺少 2，NAK 帧可带 `ack=1`，发送方据此重传 2。时序图中的“NAK2”描述的是所请求的帧，并不要求代码中的 `ack` 字段直接填 2。

</details>

#### Maximum Window Size

对**发送、接收最大窗口相等**的 SR 协议，窗口最多占序号空间的一半：

$$
\boxed{W_s=W_r=W\le\frac M2=2^{k-1}}
$$

原因是接收窗口推进以后，仍可能有上一批帧的旧副本重传过来。**新窗口与可能重传的旧窗口需要避免序号重叠。**

<details>
<summary>展开：为什么 GBN 可以取 7，SR 在 8 个序号下最多取 4？</summary>

**尝试 $M=8,W=7$。**

发送方发送 0–6。接收方全部收到并交付，返回 ACK6；假设这一批所需的确认未能到达发送方。

接收窗口已经从：

$$
\{0,1,2,3,4,5,6\}
$$

推进为：

$$
\{7,0,1,2,3,4,5\}
$$

发送方仍可能重传旧帧 0。它落在新的接收窗口内，接收方可能把它当成下一轮的新帧 0 缓存。等新帧 7 补到并推进窗口，就存在把旧分组再次交付的风险。

**改为 $W=4$。**

发送 0–3，接收后窗口从 $\{0,1,2,3\}$ 推进到 $\{4,5,6,7\}$。即使 ACK3 丢失，旧帧 0–3 的重传副本也都在新窗口外，不会被误收为新分组。

在这两个最大窗口大小均为 $W$ 的安排中，要容纳不重叠的两段序号：

$$
2W\le M
$$

所以 $M=8$ 时 $W\le4$。这是支持乱序接收后新增的约束。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261012213026.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Event Handling in Protocol 6

| 事件 | 核心处理 |
| --- | --- |
| `network_layer_ready` | 保存并发送一个新分组，启动其数据定时器，推进发送序号 |
| `frame_arrival` | 根据 `kind` 区分数据、ACK、NAK；数据按窗口缓存并按序交付；处理有效累计 ACK；有效 NAK 请求只触发指定帧重传 |
| `cksum_err` | 不交付损坏帧；若当前缺口尚未报告，可发 NAK |
| `timeout` | 只重传具体到期的那一帧，并重启它的定时器 |
| `ack_timeout` | 发送独立 ACK，避免继续等待反向数据 |

源代码中的 `oldest_frame` 用于指明这次实际到期的帧，不能始终用 `ack_expected` 替代。某帧被重传并重启定时器后，定时器到期顺序与序号顺序可能不同。

最后仍根据 `nbuffered` 是否达到 `NR_BUFS`，决定是否允许网络层再交付新分组。

### Comparison of Sliding Window Protocols

$M=2^k$ 为序号空间，窗口大小均指最大允许值。

| 项目 | One-Bit：协议 4 | Go-Back-N：协议 5 | Selective Repeat：协议 6 |
| --- | --- | --- | --- |
| 发送窗口 | 1 | $W_s\le M-1$ | $W_s=W\le M/2$ |
| 接收窗口 | 1 | 1 | $W_r=W$ |
| 乱序数据 | 不接收为新分组 | 丢弃 | 窗口内先缓存 |
| 重传范围 | 当前帧 | 从最早未确认帧开始，重传全部未确认帧 | 指定缺失或超时帧 |
| 确认方式 | 双向数据捎带 ACK | 捎带累计 ACK，无独立 ACK | 捎带／独立累计 ACK，加 NAK |
| 缓冲与实现代价 | 最小 | 发送端需缓存多帧 | 双方都需缓存，接收端需重排与状态标志 |
| 主要效率问题 | 长往返时延导致大量等待 | 出错时重传已正确到达过的后续帧 | 更多缓冲及控制复杂性 |

**共同要求：损坏数据不交付，重复数据不重复交付，分组向网络层按序交付；发送方在取得确认前保留重传所需副本。**

<details>
<summary>延伸计算：卫星例题需要 26 帧窗口，序号至少要几位？</summary>

GBN 要求：

$$
26\le2^k-1\quad\Rightarrow\quad k\ge5
$$

相等窗口的 SR 要求：

$$
26\le2^{k-1}\quad\Rightarrow\quad k\ge6
$$

所以在相同的持续发送需求下，GBN 至少需要 5 位序号，SR 至少需要 6 位序号。

</details>
