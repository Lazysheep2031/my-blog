---
title: Turing Machine
published: 2026-11-23
description: 图灵机的定义与计算、机器组合、多带模拟、无限制文法、原始递归函数与极小化
tags: [计算理论]
category: 笔记
draft: false
---

## Turing Machines

### From Finite Memory to an Unbounded Tape

**图灵机（Turing Machine，TM）** 由有限控制器、读写头和向右无限延伸的纸带组成。读写头可以左右移动，也可以改写当前格的符号。

- **确定性有限自动机（DFA）** 用有限个状态保存信息，输入带只读，读头向右移动。
- **下推自动机（PDA）** 增加了可写的栈，但只能访问栈顶。
- **TM** 可以把中间结果写在纸带上，再移动读写头重新访问。

纸带没有预设的容量上限；每次有限步计算只访问有限多个格子。**状态数和符号种类仍然有限，能够随计算增长的是纸带上的信息。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190143180.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**可计算性（Computability）** 研究一个问题能否由算法解决。例如：

- 判断两个 DFA 是否等价、判断串是否属于给定的 **正则语言（Regular Language）**，都有算法。
- 判断任意两份 **上下文无关文法（Context-free Grammar，CFG）** 是否等价，以及判断任意 **上下文无关语言（Context-free Language，CFL）** 的补集是否为空，都不存在通用的判定算法。后一个问题等价于问该 CFL 是否等于整个 $\Sigma^*$；判断 CFL 自身是否为空则有算法。

### Formal Definition

TM 是五元组

$$
M=(K,\Sigma,\delta,s,H),
$$

其中：

- $K$：有限状态集。
- $\Sigma$：**纸带字母表（Tape Alphabet）**，包含空白符 $\sqcup$ 和左端标记 $\triangleright$。
- $s\in K$：初态。
- $H\subseteq K$：**停机状态（Halting State）** 的集合。
- $\delta$：**转移函数（Transition Function）**，定义为

$$
\delta:(K-H)\times\Sigma
\longrightarrow K\times\bigl(\Sigma\cup\{\leftarrow,\rightarrow\}\bigr).
$$

若 $\delta(q,a)=(p,b)$，先把状态改为 $p$，再根据 $b$ 执行动作：

- $b\in\Sigma$：把当前格的 $a$ 改写为 $b$，读写头不动。
- $b=\leftarrow$：向左移动一格，纸带内容不变。
- $b=\rightarrow$：向右移动一格，纸带内容不变。

**每一步执行一次写入或一次移动。** 写完再移动，需要两个步骤。$\leftarrow,\rightarrow$ 是动作，均不属于 $\Sigma$。

左端标记满足两个限制：

$$
\delta(q,\triangleright)=(p,\rightarrow),
\qquad
\delta(q,a)=(p,b)\Longrightarrow b\ne\triangleright.
$$

即读到 $\triangleright$ 时必须向右移动，也不能把任何格改写成 $\triangleright$。这样，纸带的左边界始终保留。

$\delta$ 对每个非停机状态和每个纸带符号都有定义；进入 $H$ 后停止，$H$ 上没有后续转移。

### Example

1. **Erasing a Block of a's**

设

$$
K=\{q_0,q_1,h\},\quad
\Sigma=\{a,\sqcup,\triangleright\},\quad
s=q_0,\quad H=\{h\},
$$

转移如下。这台 TM 会怎样运行？

| 当前状态 | 当前符号 | 下一状态与动作 |
| --- | --- | --- |
| $q_0$ | $a$ | $(q_1,\sqcup)$ |
| $q_0$ | $\sqcup$ | $(h,\sqcup)$ |
| $q_0$ | $\triangleright$ | $(q_0,\rightarrow)$ |
| $q_1$ | $a$ | $(q_0,a)$ |
| $q_1$ | $\sqcup$ | $(q_0,\rightarrow)$ |
| $q_1$ | $\triangleright$ | $(q_1,\rightarrow)$ |

<details>
<summary>展开解析</summary>

从 $q_0$ 开始扫描一段连续的 $a$：

1. 在 $q_0$ 读到 $a$，把它擦成 $\sqcup$，进入 $q_1$。
2. 此时仍在同一格；$q_1$ 读到刚写入的 $\sqcup$，向右移动并回到 $q_0$。
3. 重复，直到 $q_0$ 读到原本就存在的空白，进入 $h$。

若最初指向 `aaaa` 的第一个 $a$，则擦除四个 $a$ 用 $8$ 步，再用 $1$ 步停机，共 $9$ 步。

从 $q_0$ 正常启动时，$\delta(q_1,a)$ 不会被用到，但完整的 $\delta$ 仍须为这一组合指定转移。

</details>

2. **A Machine That May Never Halt**

设 $K=\{q_0,h\}$，$\Sigma=\{a,\sqcup,\triangleright\}$，初态为 $q_0$，且

$$
\delta(q_0,a)=(q_0,\leftarrow),\qquad
\delta(q_0,\sqcup)=(h,\sqcup),\qquad
\delta(q_0,\triangleright)=(q_0,\rightarrow).
$$

<details>
<summary>展开解析</summary>

机器向左寻找空白，找到后停机。若读写头与左端标记之间全是 $a$，就会到达 $\triangleright$，被迫向右，随后又因读到 $a$ 而向左：

$$
\triangleright\,\underline a\,a
\longrightarrow
\underline{\triangleright}\,aa
\longrightarrow
\triangleright\,\underline a\,a
\longrightarrow\cdots
$$

机器在左端附近永久往返。**确定性只保证下一步唯一，无法保证最终停机。**

</details>

### Configurations

**格局（Configuration）** 记录三个信息：当前状态、纸带内容、读写头位置。

采用三元组

$$
(q,x,y),
$$

其中 $x$ 包含从左端到当前格的全部符号，**$x$ 的最后一个符号就是当前读到的符号**；$y$ 是当前格右侧的有效内容。若右边全为空白，则 $y=e$。

形式上，Configuration 属于

$$
K\times\triangleright\Sigma^*
\times\bigl(\Sigma^*(\Sigma-\{\sqcup\})\cup\{e\}\bigr).
$$

**$y$ 不能以空白结尾。** 最后一个非空白符号之后的空白由无限纸带自动提供；读写头正在扫描的空白则必须保留在 $x$ 中。

也可把

$$
(q,wa,u)
$$

简写为

$$
(q,w\underline a u),
$$

用下划线标出读写头。若 $q\in H$，称为 **停机格局（Halted Configuration）**。

### Example

**Reading Configurations**

下面三种写法分别表示什么？

$$
\begin{aligned}
&(q,\triangleright a,aba),\\
&(h,\triangleright\sqcup\sqcup\sqcup,\sqcup a),\\
&(q,\triangleright\sqcup a\sqcup\sqcup,e).
\end{aligned}
$$

<details>
<summary>展开解析</summary>

对应的带下划线写法为

$$
\begin{aligned}
&(q,\triangleright\underline a aba),\\
&(h,\triangleright\sqcup\sqcup\underline{\sqcup}\sqcup a),\\
&(q,\triangleright\sqcup a\sqcup\underline{\sqcup}).
\end{aligned}
$$

第一种正在读第一个 $a$；第二种正在读左端后的第三个空白，右侧还有一个空白和一个 $a$；第三种正在读 $a$ 右侧的第二个空白，之后全部为空白。

第三种中的 $e$ 只表示右侧字符串为空，纸带上没有名为 $e$ 的格子。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190148194.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### One-Step Computation

用

$$
C_1\vdash_M C_2
$$

表示 TM 从 $C_1$ 经过一步得到 $C_2$。三类动作如下。

**写入：** 若 $\delta(q,a)=(p,b)$，$b\in\Sigma$，则

$$
(q,w\underline a u)\vdash_M(p,w\underline b u).
$$

**左移：** 若 $\delta(q,a)=(p,\leftarrow)$，则

$$
(q,wb\underline a u)\vdash_M(p,w\underline b au).
$$

当 $a=\sqcup$ 且 $u=e$ 时，移走后原格成为多余的末尾空白，简写为

$$
(q,wb\underline{\sqcup})\vdash_M(p,w\underline b).
$$

**右移：** 若 $\delta(q,a)=(p,\rightarrow)$，则

$$
(q,w\underline a bu)\vdash_M(p,wa\underline b u).
$$

若当前格之后全为空白，则新扫描到的空白要显式写出：

$$
(q,w\underline a)\vdash_M(p,wa\underline{\sqcup}).
$$

$\vdash_M^*$ 是 $\vdash_M$ 的自反传递闭包，表示零步或多步。计算序列

$$
C_0\vdash_M C_1\vdash_M\cdots\vdash_M C_n
$$

有 $n$ 步，也记为 $C_0\vdash_M^n C_n$。**$n$ 步计算包含 $n+1$ 个 Configuration。**

## A Notation for Turing Machines

### Basic Machines

把常用的简单 TM 当作模块，可以直接用模块名描述复杂机器。

- $a$：在当前格写入符号 $a$，然后停止；$a\ne\triangleright$。
- $L$：向左移动一格，然后停止。
- $R$：向右移动一格，然后停止。

统一记为 $M_a$ 时，

$$
M_a=(\{s,h\},\Sigma,\delta,s,\{h\}),\qquad
\delta(s,b)=(h,a)\quad(b\ne\triangleright),
$$

其中 $a$ 可以是可写入的符号，也可以是 $\leftarrow,\rightarrow$。在左端仍遵守

$$
\delta(s,\triangleright)=(s,\rightarrow).
$$

因此，模块若恰好从 $\triangleright$ 开始，会先向右离开左端，再执行指定动作。

### Combining Machines

图中的节点可以表示一整台 TM。对于

$$
M_1\xrightarrow{a}M_2,
$$

含义是：先运行 $M_1$；它停机后，若当前扫描符号为 $a$，就从 $M_2$ 的初态继续，保留当时的纸带和读写头位置。

例如 $M_1\xrightarrow{a}M_2$、$M_1\xrightarrow{b}M_3$ 表示按当前符号分支。拼接时先把各模块的状态重命名为互不相交，再把 $M_1$ 原来的停机位置接到相应模块的入口；没有匹配分支时，组合机器停止。

常见简写：

- 一条边写多个符号，表示这些符号都选择同一分支。
- 无标签边表示无条件进入下一模块。
- $MN$ 表示先运行 $M$，再运行 $N$；$R^2$ 表示 $RR$。
- $\bar a$ 表示当前符号不为 $a$。
- 标签 $a\ne\sqcup$ 可以把当前读到的非空白符号记为 $a$，后续模块 $a$ 再把它写出。符号种类有限，可用有限控制状态记住。

**边上的标签检查当前格，不会自行移动读写头。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190156258.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190201362.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Scanning Machines

四个常用扫描模块为

$$
R_{\sqcup},\quad R_{\bar\sqcup},\quad
L_{\sqcup},\quad L_{\bar\sqcup}.
$$

它们分别寻找当前格**严格右侧或严格左侧**的第一个空白或非空白格。例如 $R_{\sqcup}$ 先执行一次 $R$，若新位置非空白，就继续 $R$；遇空白时停止。

因此，当前位置已经为空白，也不能直接省掉 $R_{\sqcup}$：它会继续找右侧的下一个空白。若搜索方向上没有目标，扫描可能一直运行。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190206788.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Example

1. **Two Moves to the Right**

先执行一个 $R$，若新位置读到 $a,b,\triangleright,\sqcup$ 中任一符号，就再执行一个 $R$。

<details>
<summary>展开解析</summary>

若 $\Sigma=\{a,b,\triangleright,\sqcup\}$，这些分支覆盖所有符号，故可以写成

$$
R\longrightarrow R=RR=R^2.
$$

从普通纸带格出发，读写头最终右移两格。

</details>

2. **The Copying Machine**

**复制机器（Copying Machine）** $C$ 完成

$$
\underline{\sqcup}\,w\sqcup
\quad\longmapsto\quad
\sqcup w\sqcup w\underline{\sqcup},
$$

其中 $w$ 不含空白，可以为空串。两份 $w$ 之间保留一个空白。

<details>
<summary>展开构造与运行过程</summary>

从左向右逐个复制原串中的字符。读到非空白符号 $a$ 时，用控制状态记住它，执行

$$
\sqcup\;(R_{\sqcup})^2\;a\;(L_{\sqcup})^2\;a.
$$

各部分的作用：

1. 暂时擦掉当前 $a$，留下返回时能找到的空白标记。
2. 第一个 $R_{\sqcup}$ 越过原串剩余部分，找到两份串之间的分隔空白。
3. 第二个 $R_{\sqcup}$ 越过已复制部分，找到末尾空白，在这里写入 $a$。
4. 两个 $L_{\sqcup}$ 依次返回分隔空白、原串中暂时擦除的位置。
5. 写回 $a$，再右移处理下一个字符。

当右移后读到原串末尾的分隔空白，执行一次 $R_{\sqcup}$，越过复制出的整串并停在其右侧空白。

以 $w=\texttt{aab}$ 为例，完成各轮后的主要 Configuration 为

$$
\begin{aligned}
\underline{\sqcup}aab\sqcup
&\longmapsto\sqcup\underline a ab\sqcup a\\
&\longmapsto\sqcup a\underline a b\sqcup aa\\
&\longmapsto\sqcup aa\underline b\sqcup aab\\
&\longmapsto\sqcup aab\sqcup aab\underline{\sqcup}.
\end{aligned}
$$

每轮恢复原串，同时向右侧副本增加一个字符；因此顺序保持不变。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190212018.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190216648.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

3. **The Left-Shifting Machine**

**左移机器（Left-Shifting Machine）** $S_{\leftarrow}$ 把非空白串 $w$ 整体左移一格：

$$
\sqcup w\underline{\sqcup}
\quad\longmapsto\quad
w\underline{\sqcup}.
$$

<details>
<summary>展开构造与运行过程</summary>

先向左找到 $w$ 前的空白，把它视为一个待填的“空位”。随后重复：

1. 右移一格，查看空位右侧的字符。
2. 若为非空白 $a$，记住 $a$ 并擦掉这一格，再左移把 $a$ 写入空位。
3. 右移回刚擦出的新空位，继续处理。
4. 若右侧已经是空白，左移回当前空位并停机。

例如

$$
\sqcup aab\underline{\sqcup}
\longmapsto a\sqcup ab\sqcup
\longmapsto aa\sqcup b\sqcup
\longmapsto aab\underline{\sqcup}.
$$

每次把空位右边的一个字符搬到左边，空位向右推进一格。最终所有字符左移，原来的最后一格成为空白。

右移机器 $S_{\rightarrow}$ 可从右向左逐个搬运字符，完成相反方向的移动。

</details>

4. **Erasing with Basic Machines**

从一段连续 $a$ 左侧的空白出发：执行 $R$；若读到 $a$ 就执行 $\sqcup$，然后回到 $R$；遇第一个非 $a$ 的符号时停止。

<details>
<summary>展开解析</summary>

对应循环为“右移 → 若为 $a$ 则擦除 → 继续右移”，会擦掉紧邻起始位置右侧的整个 $a$ 块。

例如 $\underline{\sqcup}aaa\sqcup$ 变成连续空白；若纸带为 $\underline{\sqcup}aabaa$，则擦掉最前面的两个 $a$，停在 $b$ 上。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190220257.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

## Computing with Turing Machines

### Input Convention

设 **输入字母表（Input Alphabet）** 为

$$
\Sigma_0\subseteq\Sigma-\{\sqcup,\triangleright\}.
$$

输入 $w\in\Sigma_0^*$ 写在最左侧空白之后，初始 Configuration 为

$$
\boxed{(s,\triangleright\underline{\sqcup}w)}.
$$

读写头最初扫描 $\triangleright$ 右侧的空白。$\Sigma$ 可以包含输入以外的工作符号，供计算过程中标记、复制和计数。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190223895.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Deciding Languages

取 $H=\{y,n\}$，分别表示接受和拒绝：

- 从初始 Configuration 到达状态 $y$，称为 **接受（Accept）** $w$。
- 到达状态 $n$，称为 **拒绝（Reject）** $w$。
- 始终不到达 $H$，则机器不停机。

TM **判定（Decide）** 语言 $L\subseteq\Sigma_0^*$，要求对每个输入 $w$ 都满足

$$
w\in L\Longrightarrow M\text{ 接受 }w,
\qquad
w\notin L\Longrightarrow M\text{ 拒绝 }w.
$$

**Decide 要求所有输入都停机，并给出正确答案。** 这样的 TM 称为 **判定器（Decider）**。能被 TM Decide 的语言称为 **递归语言（Recursive Language）**。

### Example

**Deciding Equal Numbers of a's, b's, and c's**

构造 TM 判定

$$
L=\{a^nb^nc^n:n\ge0\}.
$$

<details>
<summary>展开构造、运行示例与正确性</summary>

使用 $d,e,f$ 分别标记已经配对的 $a,b,c$。

**第一步：检查顺序。** 从左到右确认输入属于 $a^*b^*c^*$，进入 $b$ 段后不能再出现 $a$，进入 $c$ 段后不能再出现 $a,b$。顺序不符就 Reject；空串直接 Accept。

**第二步：每轮配对一个 $a,b,c$。**

1. 回到输入左端，跳过 $d$，寻找第一个未标记的 $a$，把它改为 $d$。
2. 向右跳过剩余的 $a$ 和已经标记的 $e$，寻找 $b$；找到后改为 $e$。若先遇到 $c,f$ 或末尾空白，Reject。
3. 继续向右跳过剩余的 $b$ 和已经标记的 $f$，寻找 $c$；找到后改为 $f$。若先到末尾空白，Reject。
4. 返回输入左端，开始下一轮。

若已找不到未标记的 $a$，检查剩余内容是否只含 $e^*f^*$：全部完成则 Accept，仍有未标记的 $b,c$ 则 Reject。

例如

$$
aaabbbccc
\longmapsto daaebbfcc
\longmapsto ddaeebffc
\longmapsto dddeeefff
\longmapsto y.
$$

`aabbbcc` 最终剩下一个未标记的 $b$，所以 Reject；`abcabc` 在顺序检查时就被 Reject。

**正确性：** 每轮恰好标记一个 $a$、一个 $b$、一个 $c$。通过顺序检查后，若最终所有字符都标记完，三个块的长度必然相等；若输入为 $a^nb^nc^n$，则恰好经过 $n$ 轮配对后 Accept。

**终止性：** 每轮至少减少一个未标记的 $a$，每次扫描的范围也有限。因此，机器对每个输入都会停机，满足 Decide 的要求。

</details>

### Computing String Functions

TM 也可以把一串转换成另一串。设 $H=\{h\}$，若

$$
(s,\triangleright\underline{\sqcup}w)
\vdash_M^*
(h,\triangleright\underline{\sqcup}y),
$$

则 $y$ 是输入 $w$ 的输出，记为 $M(w)=y$。

输出约定包含三个要求：纸带只留下前导空白和结果 $y$；工作符号已经清除；读写头回到结果左侧的前导空白。

对函数 $f:\Sigma_0^*\to\Sigma_0^*$，若

$$
\forall w\in\Sigma_0^*,\qquad M(w)=f(w),
$$

则称 $M$ **计算（Compute）** $f$。存在这样的 TM 时，$f$ 称为 **递归函数（Recursive Function）**。

这里 $f$ 的定义域是整个 $\Sigma_0^*$，因此 TM 必须对每个输入停机。

### Example

**Duplicating a String**

计算

$$
\kappa(w)=ww.
$$

<details>
<summary>展开模块组合</summary>

先用 $C$ 复制，再用 $S_{\leftarrow}$ 左移第二份 $w$，消除中间的分隔空白：

$$
\underline{\sqcup}w\sqcup
\xrightarrow{C}
\sqcup w\sqcup w\underline{\sqcup}
\xrightarrow{S_{\leftarrow}}
\sqcup ww\underline{\sqcup}.
$$

最后向左返回结果之前的空白，得到

$$
(h,\triangleright\underline{\sqcup}ww).
$$

所以核心组合是 $CS_{\leftarrow}$，加上输出复位即可计算 $\kappa$。$w=e$ 时直接输出空串。

</details>

### Computing Numerical Functions

用二进制串表示自然数。若 $w=a_1\cdots a_m\in\{0,1\}^+$，定义

$$
\operatorname{num}(w)
=a_1 2^{m-1}+a_2 2^{m-2}+\cdots+a_m.
$$

每个自然数都有唯一的无冗余前导零表示，属于

$$
\{0\}\cup1\{0,1\}^*.
$$

多个参数用分隔符 `;` 连接。TM 计算 $f:\mathbb N^k\to\mathbb N$，表示对所有合法二进制输入都有

$$
\operatorname{num}\bigl(M(w_1;\cdots;w_k)\bigr)
=f\bigl(\operatorname{num}(w_1),\ldots,\operatorname{num}(w_k)\bigr).
$$

### Example

**The Successor Function**

构造 TM 计算 **后继函数（Successor Function）**

$$
\operatorname{succ}(n)=n+1.
$$

<details>
<summary>展开二进制加一的过程</summary>

先执行 $R_{\sqcup}L$，把读写头移到最后一位，然后向左处理进位：

1. 读到 $1$：写成 $0$，向左移动，继续进位。
2. 读到 $0$：写成 $1$，进位结束。
3. 若所有位都是 $1$，一直处理到输入左侧的空白，就在这里写入 $1$。

例如

$$
1011\longmapsto1100,\qquad
111\longmapsto1000,\qquad
0\longmapsto1.
$$

输入全为 $1$ 时，原来的前导空白被新写入的 $1$ 占用，需要把整个结果向右搬一格，恢复 $\triangleright$ 后面的空白。搬运时从最右端向左处理，避免覆盖尚未搬走的字符。

最后统一把读写头移回结果左侧的空白，按函数输出约定停机。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190228804.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### Semideciding Languages

TM **半判定（Semidecide）** $L\subseteq\Sigma_0^*$，定义为

$$
\boxed{w\in L\iff M\text{ 在输入 }w\text{ 上停机}.}
$$

因此，成员输入最终停机，非成员输入必须一直运行。存在这种 TM 的语言称为 **递归可枚举语言（Recursively Enumerable Language，r.e.）**。

用 $M(w)\uparrow$ 表示不停机，则

$$
M\text{ Semidecides }L
\iff
\forall w\in\Sigma_0^*,\quad
\bigl(M(w)\uparrow\iff w\notin L\bigr).
$$

| 用途 | 对成员输入 | 对非成员输入 |
| --- | --- | --- |
| Decide $L$ | 停机并 Accept | 停机并 Reject |
| Semidecide $L$ | 停机 | 一直运行 |

运行很久仍未停机时，无法据此判断输入不属于 $L$：它可能在更晚的时候停机。

### Example

**Strings Containing an a**

令

$$
L=\{w\in\{a,b\}^*:w\text{ 至少含有一个 }a\}.
$$

<details>
<summary>展开半判定机器</summary>

从输入左侧的空白开始向右扫描，遇到 $a$ 就停机，读到其他符号就继续向右。

- `bbab`：找到第三个字符 $a$ 后停机。
- `bbb` 或 $e$：越过输入后，继续在右侧无限空白中扫描，永不停机。

因此，机器恰好在 $L$ 中的输入上停机，Semidecides $L$。

这个 $L$ 同时也是 Recursive Language：给扫描增加“遇到输入末尾空白就 Reject”的分支，便得到 Decider。

不停机还可以表现为原地循环，例如在普通符号 $a$ 上反复执行 $\delta(q,a)=(q,a)$；前面的往返左端机器则会反复经过两个 Configuration。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190233820.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### Closure Properties

**每个 Recursive Language 都是 r.e.。**

<details>
<summary>展开构造</summary>

设 $M$ Decide $L$。保留其接受分支，把拒绝状态改成永久循环：原来进入 $y$ 的输入仍停机，原来进入 $n$ 的输入一直运行。

具体可取 $H'=\{y\}$，保持原有转移，并增加

$$
\delta'(n,a)=
\begin{cases}
(n,a),&a\ne\triangleright,\\
(n,\rightarrow),&a=\triangleright.
\end{cases}
$$

这样仍满足左端标记的规则，且 $w\in L$ 当且仅当新机器停机。

</details>

**Recursive Languages 对补、并、交封闭。**

<details>
<summary>展开构造与停机性</summary>

**补集：** 设 $M$ Decide $L$，交换状态 $y,n$ 的名称，并同步替换初态和转移中的状态名，所有动作保持不变。原来接受的输入现在拒绝，原来拒绝的输入现在接受，便得到 $\Sigma_0^*-L$ 的 Decider。

**并集：** 保存原输入，分别运行 $L_1,L_2$ 的 Decider，至少一个 Accept 就 Accept，否则 Reject。

**交集：** 两台 Decider 都 Accept 才 Accept，否则 Reject。

两台机器都对所有输入停机，所以顺序运行它们也一定停机。输入需要保留，因为第一台 TM 可能改写自己的纸带。

</details>

### Counting Recursive Languages

固定一个非空的有限 Input Alphabet，**Recursive Languages 有可数无穷多个。** 每台 TM 都有有限描述，因此 TM 及其能 Decide 的语言至多可数；另一方面，$\{a^n\}$（$n=0,1,2,\ldots$）给出了无穷多个不同的 Recursive Languages。

## Extensions of Turing Machines

### Equivalent Models

TM 可以增加多带、双向无限带、多读写头、多维纸带或非确定性。这些扩展方便构造算法，计算能力仍与标准 TM 等价。

这里的等价指：能够 Compute 相同的函数、Decide 相同的语言、Semidecide 相同的语言。运行时间可能不同。

### Multiple Tapes

**多带图灵机（Multi-tape Turing Machine）** 有固定的 $k$ 条纸带，每条带各有一个读写头，共用一个有限控制器。

其转移函数为

$$
\delta:(K-H)\times\Sigma^k
\longrightarrow
K\times\bigl(\Sigma\cup\{\leftarrow,\rightarrow\}\bigr)^k.
$$

若

$$
\delta(q,(a_1,\ldots,a_k))=(p,(b_1,\ldots,b_k)),
$$

则状态变为 $p$，第 $i$ 条带执行动作 $b_i$。每条带各自执行一次写入或移动，并遵守左端限制。

Configuration 包含一个状态以及 $k$ 份“纸带内容与头位置”：

$$
\bigl(q,(x_1,y_1),\ldots,(x_k,y_k)\bigr).
$$

输入放在第一条带；其余带只有左端标记和空白，头位于最左侧空白。计算结束时，**输出取第一条带，其他带作为工作空间。**

上标表示操作的纸带编号：$a^2$ 在第二条带写 $a$，$L_{\sqcup}^2$ 在第二条带向左找空白，$R^{1,2}$ 同时右移两个头。多带图中的上标用于编号。

### Example

1. **Copying with Two Tapes**

用两条带实现

$$
\underline{\sqcup}w\sqcup
\longmapsto\sqcup w\sqcup w\underline{\sqcup}.
$$

<details>
<summary>展开三阶段构造</summary>

**第一阶段：** 两个头同时向右，把第一条带的 $w$ 逐个复制到第二条带；第一条带读到空白时停下。

**第二阶段：** 第一条带的头不动，第二条带的头向左返回其 $w$ 前面的空白。

**第三阶段：** 两个头同时向右，把第二条带的 $w$ 接到第一条带的分隔空白之后；第二条带读到末尾空白时完成。

各阶段主要位置为

$$
\begin{array}{c|cc}
&\text{Tape 1}&\text{Tape 2}\\\hline
\text{Initial}&\underline{\sqcup}w&\underline{\sqcup}\\
\text{After 1}&\sqcup w\underline{\sqcup}&\sqcup w\underline{\sqcup}\\
\text{After 2}&\sqcup w\underline{\sqcup}&\underline{\sqcup}w\\
\text{After 3}&\sqcup w\sqcup w\underline{\sqcup}&\sqcup w\underline{\sqcup}
\end{array}
$$

每个阶段只扫描有限次 $w$，用 $O(|w|+1)$ 步即可完成。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190237278.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

2. **Adding Two Binary Numbers**

输入两个二进制整数 $x_1;x_2$，用两条带计算它们的和。

<details>
<summary>展开准备过程、进位与示例</summary>

先把 $x_1$ 复制到第二条带，并把第一条带中原来的 $x_1$ 和分隔符 `;` 改写为 $0$。第一条带于是保存带有足够前导零的 $x_2$。

把两个头分别移到两个数的最低位，从右向左逐位相加。用控制状态记录进位 $c\in\{0,1\}$，对当前两位 $a,b$ 计算

$$
t=a+b+c,\qquad
\text{当前结果位}=t\bmod2,\qquad
\text{新进位}=\lfloor t/2\rfloor.
$$

结果位写入第一条带。短数已经没有剩余位时，把它后续的高位视为 $0$；两个数都处理完后，若仍有进位，再写一个最高位 $1$。

例如 $1011_2+110_2$：

$$
\begin{aligned}
1+0+0&=1&&\Rightarrow\text{写 }1,\ c=0,\\
1+1+0&=2&&\Rightarrow\text{写 }0,\ c=1,\\
0+1+1&=2&&\Rightarrow\text{写 }0,\ c=1,\\
1+0+1&=2&&\Rightarrow\text{写 }0,\ c=1.
\end{aligned}
$$

最后写入最高位的进位，得到 $10001_2=17$。

计算完成后，清理不需要的前导零，把结果移到标准输出位置，并将第一条带的头放回前导空白；和为 $0$ 时保留一位 `0`。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190243580.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### Simulating Multiple Tapes with One Tape

**对任意固定的 $k$，每台 $k$ 带 TM 都能由标准单带 TM 模拟。** 若原机器在输入 $x$ 上运行 $t$ 步，模拟所需时间为

$$
O\bigl(t(|x|+t)\bigr)\qquad(t\ge1).
$$

模拟保留停机结果、停机状态以及第一条带上的输出。

<details>
<summary>展开编码、逐步模拟与时间分析</summary>

**1. 用一个纸带格记录多条带的同一位置。**

把单带概念上分成 $2k$ 条轨道：$k$ 条存符号，$k$ 条记录读写头。单个纸带格保存

$$
(a_1,b_1,\ldots,a_k,b_k),\qquad
a_i\in\Sigma,\quad b_i\in\{0,1\}.
$$

$a_i$ 表示第 $i$ 条带在这个位置的符号；$b_i=1$ 表示第 $i$ 个头正在这里。每一条头标记轨道恰好有一个 $1$。

扩大的 Tape Alphabet 为

$$
\Sigma'=\Sigma\cup(\Sigma\times\{0,1\})^k.
$$

$k$ 和 $\Sigma$ 都固定，所以 $\Sigma'$ 仍有限。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190250597.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**2. 编码初始 Configuration。**

保留单带自己的左端标记，在后面的编码区依次写入

$$
(\triangleright,0,\ldots,\triangleright,0),
\qquad
(\sqcup,1,\ldots,\sqcup,1).
$$

前者表示各条模拟带的左端，后者表示它们的初始空白与头位置。输入字符 $a$ 编码成

$$
(a,0,\sqcup,0,\ldots,\sqcup,0).
$$

这里元组中的 $\triangleright$ 是复合符号的一个分量，单带自身的真实左端标记仍只在最左格。

**3. 模拟原机器的一步。**

先扫描编码区，找到 $k$ 个头标记并收集被扫描符号 $(a_1,\ldots,a_k)$；有限控制器据此查出原机器的下一状态与各带动作。

再扫描一次，按动作改写对应符号，或把相应的头标记左移、右移一格。若头移到编码区之外，就增加一个全为空白的新编码格。

原机器一步会修改有限条带上的有限位置，因此只需常数次往返扫描就能完成模拟。

**4. 恢复输出。**

原机器停机时，只提取第一条带的符号，清除其他轨道信息，恢复第一条带的头位置，最后进入相同的 Halting State。

**5. 分析时间。**

编码区初始长度为 $|x|+O(1)$。每模拟一步，最右端最多增加一格，因此模拟前 $t$ 步时，长度至多为

$$
|x|+O(1)+t.
$$

一次扫描花 $O(|x|+t)$ 时间，总共模拟 $t$ 步，加上初始化与输出恢复，得到

$$
O\bigl((t+1)(|x|+t+1)\bigr).
$$

当 $t\ge1$ 时，可写成 $O(t(|x|+t))$。若另有 $t\ge|x|$，才可进一步简化为 $O(t^2)$。

</details>

### Other Extensions

**双向无限带（Two-way Infinite Tape）：** 用两条单向带分别保存原点两侧的内容，左半部分按相反顺序保存；再用单带模拟这两条带。

**多读写头（Multiple Heads）：** 保存一份纸带内容，为每个头增加位置标记。扫描收集各头读到的符号，再统一修改内容和头位置。

**多维纸带（Multidimensional Tape）：** 把格子的坐标和内容编码在普通纸带上。每次移动先更新坐标，再查找或建立相应格子的记录。

**非确定性（Nondeterminism）：** 同一个状态和读入符号可以有多个后继。确定性 TM 按层次枚举计算分支，能够找到任何有限的停机分支；这一方法会用于下面 Grammar 与 TM 的等价性证明。

## Grammars

### Unrestricted Rules

**无限制文法（Unrestricted Grammar）** 允许规则左侧出现多个符号，只要求其中至少包含一个 **非终结符（Nonterminal）**。后面简称 **Grammar**。

例如，规则

$$
AXY\to AYX
$$

其中 $A,X,Y$ 都是 Nonterminal，表示：当 $XY$ 的左边紧接着 $A$ 时，可以交换 $X,Y$，并保留 $A$。一次替换作用于整个左侧串，因此可以利用周围符号限制规则何时适用。

### Formal Definition

**Grammar** 是四元组

$$
G=(V,\Sigma,R,S),
$$

其中：

- $V$ 是有限字母表。
- $\Sigma\subseteq V$ 是 **终结符（Terminal）** 集，$V-\Sigma$ 是 **Nonterminal** 集。
- $S\in V-\Sigma$ 是开始符号。
- $R$ 是有限规则集，满足
  $$
  R\subseteq\bigl(V^*(V-\Sigma)V^*\bigr)\times V^*.
  $$

规则记为 $u\to v$。$u$ 非空且至少含一个 **Nonterminal**；$v$ 可以为空串 $e$。

若存在规则 $u\to v$，使得

$$
x=w_1uw_2,\qquad y=w_1vw_2,
$$

就记 $x\Rightarrow_G y$，表示一次替换。$\Rightarrow_G^*$ 表示零次或多次替换。

**Grammar** 生成的语言为

$$
L(G)=\{w\in\Sigma^*:S\Rightarrow_G^*w\}.
$$

序列 $w_0\Rightarrow_G w_1\Rightarrow_G\cdots\Rightarrow_G w_n$ 称为一个 **推导（Derivation）**，长度为 $n$。只有完全由 **Terminal** 组成的结果才属于 $L(G)$。

**Context-free Grammar** 的每条规则左侧只有一个 **Nonterminal**，因此每个 **Context-free Grammar** 都是 **Grammar**。

### Example

**Generating Equal Blocks**

构造 Grammar 生成 $L=\{a^nb^nc^n:n\ge1\}$。

<details>
<summary>展开规则、推导与正确性说明</summary>

取

$$
\Sigma=\{a,b,c\},\qquad
V=\{S,a,b,c,A,B,C,T_a,T_b,T_c\}.
$$

规则分成三组，共 $11$ 条：

$$
\begin{aligned}
S&\to ABCS\mid T_c;\\[2pt]
BA&\to AB,& CA&\to AC,& CB&\to BC;\\[2pt]
CT_c&\to T_cc\mid T_bc;\\
BT_b&\to T_bb\mid T_ab;\\
AT_a&\to T_aa,&T_a&\to e.
\end{aligned}
$$

第一组产生 $(ABC)^nT_c$；第二组交换顺序不对的相邻符号，将其排成 $A^nB^nC^nT_c$。第三组让标记从右向左移动，依次完成 $C\to c$、$B\to b$、$A\to a$，最后删去 $T_a$。

以 $n=2$ 为例：

$$
\begin{aligned}
S
&\Rightarrow ABCS
\Rightarrow ABCABCS
\Rightarrow ABCABCT_c\\
&\Rightarrow ABACBCT_c
\Rightarrow AABCBCT_c
\Rightarrow AABBCCT_c\\
&\Rightarrow AABBCT_cc
\Rightarrow AABBT_bcc\\
&\Rightarrow AABT_bbcc
\Rightarrow AAT_abbcc\\
&\Rightarrow AT_aabbcc
\Rightarrow T_aaabbcc
\Rightarrow aabbcc.
\end{aligned}
$$

每产生一个 $ABC$，三类符号的数量同时增加一；交换不改变数量，终结化也保持各类数量。任何完成的 **Derivation** 都必须按 $C,B,A$ 的顺序从右向左处理全部符号，因此最终串只能是 $a^nb^nc^n$。

若直接使用 $S\to T_c$，没有 $C$ 能使 $T_c$ 变成 $T_b$，无法得到纯 **Terminal** 串。因此空串不在语言中，恰好要求 $n\ge1$。

</details>

### Grammars and Turing Machines

**一个语言能由 Grammar 生成，当且仅当它是 r.e.。**

两个方向分别把 **Derivation** 交给 TM 搜索，以及把 TM 的计算改写成 **Derivation**。

<details>
<summary>展开证明：Grammar → TM</summary>

给定 $G=(V,\Sigma,R,S)$，构造三带 **非确定性图灵机（Nondeterministic Turing Machine，NDTM）**：

1. 第一带保存输入 $w$，始终不改动。
2. 第二带保存当前句型，初始为 $S$。
3. 第三带用于匹配规则和移动字符串。

每轮有 $|R|+1$ 类选择：选择一条规则 $u\to v$，再选择第二带上的一个位置，将该处的 $u$ 替换成 $v$；或者检查第二带是否已经等于 $w$。

规则无法匹配，或选择检查但两串不同，都让该分支永久循环。只有检查成功才停机。

于是

$$
S\Rightarrow_G^*w
\iff
\text{存在一个在输入 }w\text{ 上停机的分支}.
$$

**NDTM 可以由普通 TM 模拟。** 设每步最多有 $r$ 种选择，将每种有限计算记录为一个有限选择串。普通 TM 按长度递增、同长度内按字典序枚举这些串，每次从原输入重新开始，只模拟该选择串指定的有限步数。

因此，每条有限停机分支最终都会被检查到；某个无限分支不会阻塞其他分支。模拟机恰好在 $w\in L(G)$ 时停机，所以 $L(G)$ 是 **r.e.**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190258936.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

<details>
<summary>展开证明：TM → Grammar</summary>

设 $M=(K,\Sigma,\delta,s,\{h\})$ Semidecide $L\subseteq\Sigma_0^*$，其中 $\Sigma_0$ 是 Input Alphabet，$\Sigma$ 是 Tape Alphabet。

先在停机前接上清理过程，使 $M$ 停机时总处于

$$
(h,\triangleright\underline{\sqcup}).
$$

令状态符号与纸带符号互不相交，增加新的结束标记 $\triangleleft$。把

$$
(q,u\underline a v)
\quad\text{编码为}\quad
uaqv\triangleleft.
$$

状态放在当前扫描符号的后面。编码可以保留多余的末尾空白；解码时省略读写头右侧多余的末尾空白。

构造 $G=(V,\Sigma_0,R,S)$，其中

$$
V=\Sigma\cup K\cup\{S,\triangleleft\}.
$$

**核心做法：从 Halted Configuration 出发，逆向还原计算。** 对每条转移，加入以下规则。

**1. 写符号。** 若 $\delta(q,a)=(p,b)$，其中 $b\in\Sigma$，加入

$$
bp\to aq.
$$

正向把扫描符号 $a$ 改成 $b$，逆向再恢复 $a$ 与原状态 $q$。

**2. 向右移动。** 若 $\delta(q,a)=(p,\rightarrow)$，加入

$$
abp\to aqb\qquad(b\in\Sigma),
$$

以及右移进入新的空白格时使用的

$$
a\sqcup p\triangleleft\to aq\triangleleft.
$$

**3. 向左移动，原扫描符号非空白。** 若 $\delta(q,a)=(p,\leftarrow)$ 且 $a\ne\sqcup$，加入

$$
pa\to aq.
$$

**4. 向左移动，原扫描符号为空白。** 若 $\delta(q,\sqcup)=(p,\leftarrow)$，加入

$$
p\sqcup b\to\sqcup qb\qquad(b\in\Sigma),
$$

以及从最右空白格左移时使用的

$$
p\triangleleft\to\sqcup q\triangleleft.
$$

最后加入首尾规则

$$
S\to\triangleright\sqcup h\triangleleft,
\qquad
\triangleright\sqcup s\to e,
\qquad
\triangleleft\to e.
$$

第一条从固定的 Halted Configuration 开始；后两条在还原出初始 Configuration 后，去掉输入两侧的辅助符号。

若 $M$ 在输入 $w$ 上停机，把这段计算逐步倒放，便得到

$$
\begin{aligned}
S
&\Rightarrow_G\triangleright\sqcup h\triangleleft\\
&\Rightarrow_G^*\triangleright\sqcup sw\triangleleft
\Rightarrow_G w\triangleleft
\Rightarrow_G w.
\end{aligned}
$$

反过来，任何产生纯 **Terminal** 串 $w$ 的 **Derivation**，都必须用 $\triangleright\sqcup s\to e$ 消去唯一的状态符号。在此之前，每条模拟规则都对应 $M$ 的一步逆向操作，因此它还原了从输入 $w$ 到固定 Halted Configuration 的计算。结束标记的删除可以统一放到最后。

故

$$
w\in L(G)
\iff
(s,\triangleright\underline{\sqcup}w)
\vdash_M^*(h,\triangleright\underline{\sqcup})
\iff w\in L.
$$

</details>

### Grammatically Computable Functions

**Grammar** 也可以描述函数计算。给定 $G=(V,\Sigma,R,S)$ 与函数 $f:\Sigma^*\to\Sigma^*$，若对任意 $w,v\in\Sigma^*$ 都有

$$
SwS\Rightarrow_G^*v\iff v=f(w),
$$

就说 $G$ 计算 $f$，并称 $f$ 为 **文法可计算函数（Grammatically Computable Function）**。

输入 $w$ 被两个 $S$ 包围；它必须能够导出正确输出 $f(w)$，且不能导出其他纯 **Terminal** 串。多个不同的 **Derivation** 可以得到同一个输出。

**$f$ 是 Recursive Function，当且仅当它是 Grammatically Computable Function。**

<details>
<summary>展开两个方向的构造思路</summary>

- **Grammar → TM：** 按长度逐层搜索从 $SwS$ 出发的有限 **Derivation**。由于 $f(w)$ 存在，最终必定找到一个纯 **Terminal** 串；根据定义，该串只能是 $f(w)$。
- **TM → Grammar：** 用文法规则正向模拟 TM 的配置变化。由 $SwS$ 建立输入配置，到达停机配置后删除状态和工作符号，留下 $f(w)$。

前者保证每个输入都能结束搜索，后者保证得到的输出与 TM 的计算一致。

</details>

## Numerical Functions

数值函数把自然数作为输入和输出：

$$
f:\mathbb N^k\to\mathbb N,\qquad \mathbb N=\{0,1,2,\ldots\}.
$$

从几个简单函数出发，逐步加入复合、递归和搜索，可以得到与 TM 相同的计算能力。

### Basic Functions

**初始函数（Basic Functions）** 包括三类：

- **零函数（Zero Function）**：对任意 $k\ge0$，
  $$
  \operatorname{zero}_k(n_1,\ldots,n_k)=0.
  $$
- **投影函数（Projection Function）**：对 $1\le j\le k$，
  $$
  \operatorname{id}_{k,j}(n_1,\ldots,n_k)=n_j.
  $$
- **Successor Function**：
  $$
  \operatorname{succ}(n)=n+1.
  $$

当 $k=0$ 时，函数没有输入，表示一个常量。

### Composition and Primitive Recursion

**复合（Composition）**：设 $g$ 是 $k$ 元函数，$h_1,\ldots,h_k$ 都是 $\ell$ 元函数，则

$$
f(n_1,\ldots,n_\ell)
=g\bigl(h_1(n_1,\ldots,n_\ell),\ldots,h_k(n_1,\ldots,n_\ell)\bigr).
$$

先计算各个 $h_i$，再把结果作为 $g$ 的输入。

**原始递归（Primitive Recursion）**：设 $g$ 是 $k$ 元函数，$h$ 是 $(k+2)$ 元函数，用它们定义 $(k+1)$ 元函数 $f$：

$$
\begin{aligned}
f(\mathbf n,0)&=g(\mathbf n),\\
f(\mathbf n,m+1)&=h\bigl(\mathbf n,m,f(\mathbf n,m)\bigr),
\end{aligned}
$$

其中 $\mathbf n=(n_1,\ldots,n_k)$。

$g$ 给出初值；$h$ 根据原参数、当前递推次数和上一步结果计算下一步。计算 $f(\mathbf n,m)$ 只需从初值开始更新 $m$ 次。

**原始递归函数（Primitive Recursive Function）** 是从 Basic Functions 出发，经过有限次 Composition 和 Primitive Recursion 得到的函数。

### Example: Arithmetic Functions

1. **证明 $\operatorname{plus2}(n)=n+2$ 是 Primitive Recursive。**

<details>
<summary>展开解析</summary>

连续使用两次 Successor Function：

$$
\operatorname{plus2}(n)
=\operatorname{succ}\bigl(\operatorname{succ}(\operatorname{id}_{1,1}(n))\bigr).
$$

只用 Composition 即可构造。

</details>

2. **证明加法、乘法和乘方都是 Primitive Recursive。**

<details>
<summary>展开解析</summary>

**加法** 把 $n$ 次加一累积到 $m$ 上：

$$
\begin{aligned}
\operatorname{plus}(m,0)&=m,\\
\operatorname{plus}(m,n+1)&=\operatorname{succ}(\operatorname{plus}(m,n)).
\end{aligned}
$$

对应 $g(m)=\operatorname{id}_{1,1}(m)$、$h(m,n,v)=\operatorname{succ}(v)$。

**乘法** 把 $n$ 次加 $m$ 累积到 0 上：

$$
\begin{aligned}
\operatorname{mult}(m,0)&=0,\\
\operatorname{mult}(m,n+1)&=\operatorname{plus}(m,\operatorname{mult}(m,n)).
\end{aligned}
$$

**乘方** 把 $n$ 次乘 $m$ 累积到 1 上：

$$
\begin{aligned}
\operatorname{exp}(m,0)&=1,\\
\operatorname{exp}(m,n+1)&=\operatorname{mult}(m,\operatorname{exp}(m,n)).
\end{aligned}
$$

因此分别得到 $m+n$、$mn$、$m^n$。乘方的递推约定包含 $0^0=1$。

后面直接使用 $+$、$\cdot$ 和幂记号。把这些函数继续复合，也仍然得到 Primitive Recursive Function。

</details>

3. **证明所有常量函数与符号函数（Sign Function）$\operatorname{sgn}$ 都是 Primitive Recursive。**

$$
\operatorname{sgn}(n)=
\begin{cases}
0,&n=0,\\
1,&n>0.
\end{cases}
$$

<details>
<summary>展开解析</summary>

对常量函数 $f(\mathbf n)=c$，从 Zero Function 出发复合 $c$ 次 Successor Function：

$$
f(\mathbf n)=\operatorname{succ}^{\,c}(\operatorname{zero}_k(\mathbf n)).
$$

$\operatorname{sgn}$ 可用 Primitive Recursion 定义：

$$
\operatorname{sgn}(0)=0,\qquad \operatorname{sgn}(n+1)=1.
$$

</details>

4. **证明前驱与截断减法（Truncated Subtraction）都是 Primitive Recursive。**

$$
m\mathbin{\dot{-}} n=\max\{m-n,0\}.
$$

<details>
<summary>展开解析</summary>

先定义 **前驱函数（Predecessor Function）**：

$$
\operatorname{pred}(0)=0,\qquad \operatorname{pred}(n+1)=n.
$$

然后对 $m$ 连续取 $n$ 次前驱：

$$
\begin{aligned}
m\mathbin{\dot{-}}0&=m,\\
m\mathbin{\dot{-}}(n+1)&=\operatorname{pred}(m\mathbin{\dot{-}} n).
\end{aligned}
$$

到达 0 后继续保持 0，因此结果始终属于 $\mathbb N$。例如 $5\mathbin{\dot{-}}3=2$，$3\mathbin{\dot{-}}5=0$。

</details>

### Primitive Recursive Predicates

**原始递归谓词（Primitive Recursive Predicate）** 是只取 $0,1$ 的 Primitive Recursive Function：$1$ 表示真，$0$ 表示假。

也用 $[P]$ 表示命题 $P$ 的真值。这样，比较、逻辑运算和分段定义都能转化成数值函数。

### Example: Predicates and Cases

1. **构造零、正数、大小比较和相等谓词。**

<details>
<summary>展开解析</summary>

零与正数：

$$
\operatorname{iszero}(0)=1,\qquad
\operatorname{iszero}(n+1)=0,\qquad
\operatorname{positive}(n)=\operatorname{sgn}(n).
$$

因为 $m\ge n\iff n\mathbin{\dot{-}} m=0$，所以

$$
\operatorname{geq}(m,n)=[m\ge n]
=\operatorname{iszero}(n\mathbin{\dot{-}} m).
$$

由此得到

$$
\begin{aligned}
\operatorname{lt}(m,n)&=[m<n]=1\mathbin{\dot{-}}\operatorname{geq}(m,n),\\
\operatorname{equal}(m,n)&=[m=n]
=\operatorname{geq}(m,n)\operatorname{geq}(n,m).
\end{aligned}
$$

</details>

2. **证明 Primitive Recursive Predicates 对否定、析取和合取封闭。**

<details>
<summary>展开解析</summary>

设 $p,q$ 的值域均为 $\{0,1\}$，则

$$
\begin{aligned}
\neg p&=1\mathbin{\dot{-}} p,\\
p\lor q&=\operatorname{sgn}(p+q)
=1\mathbin{\dot{-}}\operatorname{iszero}(p+q),\\
p\land q&=pq
=1\mathbin{\dot{-}}\operatorname{iszero}(pq).
\end{aligned}
$$

这些表达式都由已有函数经过 Composition 得到。

</details>

3. **证明分段定义保留 Primitive Recursive 性质。**

设 $g,h$ 为 Primitive Recursive Functions，$p$ 为 Primitive Recursive Predicate，三者元数相同，定义

$$
f(\mathbf n)=
\begin{cases}
g(\mathbf n),&p(\mathbf n)=1,\\
h(\mathbf n),&p(\mathbf n)=0.
\end{cases}
$$

<details>
<summary>展开解析</summary>

写成

$$
f(\mathbf n)
=p(\mathbf n)g(\mathbf n)
+(1\mathbin{\dot{-}} p(\mathbf n))h(\mathbf n).
$$

两个系数分别为 $1,0$ 或 $0,1$，恰好选出对应分支。

</details>

### Example: Division and Digits

1. **构造整数商 $\operatorname{div}(m,n)$ 与余数 $\operatorname{rem}(m,n)$。**

<details>
<summary>展开解析</summary>

先取 $n>0$，固定除数 $n$，对被除数 $m$ 递推。初值为

$$
\operatorname{rem}(0,n)=0,\qquad
\operatorname{div}(0,n)=0.
$$

每次把被除数加一：若旧余数已经是 $n-1$，余数清零，商加一；否则只把余数加一。

$$
\operatorname{rem}(m+1,n)=
\begin{cases}
0,&\operatorname{rem}(m,n)=\operatorname{pred}(n),\\
\operatorname{rem}(m,n)+1,&\text{otherwise},
\end{cases}
$$

$$
\operatorname{div}(m+1,n)=
\begin{cases}
\operatorname{div}(m,n)+1,&\operatorname{rem}(m,n)=\operatorname{pred}(n),\\
\operatorname{div}(m,n),&\text{otherwise}.
\end{cases}
$$

相等测试与分段定义均已构造，因此两个函数都是 Primitive Recursive。它们满足

$$
m=n\operatorname{div}(m,n)+\operatorname{rem}(m,n),
\qquad 0\le\operatorname{rem}(m,n)<n.
$$

为使函数在所有自然数输入上都有定义，另设

$$
\operatorname{div}(m,0)=\operatorname{rem}(m,0)=0.
$$

</details>

2. **构造取位函数 $\operatorname{digit}(m,n,p)$，并判断奇数。**

$\operatorname{digit}(m,n,p)$ 表示 $n$ 的 $p$ 进制表示中，从右向左数第 $m$ 位，最低位编号为 1。

<details>
<summary>展开解析</summary>

对 $m\ge1$、$p\ge2$，先取余保留最低 $m$ 位，再除以 $p^{m-1}$ 去掉更低的位：

$$
\operatorname{digit}(m,n,p)
=\operatorname{div}\bigl(\operatorname{rem}(n,p^m),p^{m\mathbin{\dot{-}}1}\bigr).
$$

例如 $\operatorname{digit}(2,572,10)=7$。超出最高位的位置取 0；同一公式也给出 $\operatorname{digit}(0,n,p)=0$。

二进制最低位直接给出奇偶性：

$$
\operatorname{odd}(n)=\operatorname{digit}(1,n,2).
$$

</details>

### Bounded Operations

Primitive Recursive Functions 对 **有限求和、有限乘积** 封闭。若 $f(\mathbf n,t)$ 是 Primitive Recursive，定义

$$
\operatorname{sum}_f(\mathbf n,m)=\sum_{t=0}^{m}f(\mathbf n,t),\qquad
\operatorname{prod}_f(\mathbf n,m)=\prod_{t=0}^{m}f(\mathbf n,t).
$$

<details>
<summary>展开证明</summary>

分别对上界 $m$ 使用 Primitive Recursion：

$$
\begin{aligned}
\operatorname{sum}_f(\mathbf n,0)&=f(\mathbf n,0),\\
\operatorname{sum}_f(\mathbf n,m+1)
&=\operatorname{sum}_f(\mathbf n,m)+f(\mathbf n,m+1),
\end{aligned}
$$

$$
\begin{aligned}
\operatorname{prod}_f(\mathbf n,0)&=f(\mathbf n,0),\\
\operatorname{prod}_f(\mathbf n,m+1)
&=\operatorname{prod}_f(\mathbf n,m)f(\mathbf n,m+1).
\end{aligned}
$$

若上界本身是 Primitive Recursive Function，再做一次 Composition 即可。

</details>

因此，**有界量词（Bounded Quantifier）** 也保留 Primitive Recursive 性质。设 $p(\mathbf n,t)$ 是 Primitive Recursive Predicate：

$$
\begin{aligned}
[\exists t\le m\;p(\mathbf n,t)]
&=\operatorname{sgn}\left(\sum_{t=0}^{m}p(\mathbf n,t)\right),\\
[\forall t\le m\;p(\mathbf n,t)]
&=\prod_{t=0}^{m}p(\mathbf n,t).
\end{aligned}
$$

存在量词只需至少一项为 1；全称量词要求每一项都为 1。

### Example: Divisibility and Primality

1. **证明整除谓词 $y\mid x$ 是 Primitive Recursive。**

<details>
<summary>展开解析</summary>

$$
y\mid x\iff\exists t\le x\;(yt=x).
$$

乘法、相等谓词与 Bounded Quantifier 都已构造，因此整除谓词是 Primitive Recursive。

</details>

2. **证明素数谓词 $\operatorname{prime}(x)$ 是 Primitive Recursive。**

<details>
<summary>展开解析</summary>

要求 $x>1$，并且小于 $x$ 的自然数中只有 1 能整除 $x$：

$$
\operatorname{prime}(x)
=[x>1]\land
\bigl[\forall t<x\;(t=1\lor\neg(t\mid x))\bigr].
$$

等价地，逐个排除 $2,3,\ldots,x-1$ 作为因子。所有测试都有界，因此 $\operatorname{prime}$ 是 Primitive Recursive Predicate。

</details>

### Beyond Primitive Recursion

**每个 Primitive Recursive Function 都可计算，但可计算函数中还有超出这一类的函数。**

**Example：用对角化（Diagonalization）构造一个可计算、但非 Primitive Recursive 的函数。**

<details>
<summary>展开解析</summary>

每个 Primitive Recursive Function 都有一个有限定义，只需要记录 Basic Functions、Composition、Primitive Recursion、括号和参数索引。

按长度优先、同长度按字典序枚举这些字符串，保留合法的一元函数定义，得到

$$
f_0,f_1,f_2,\ldots.
$$

同一个函数可以通过不同定义重复出现；每个一元 Primitive Recursive Function 至少出现一次。

定义

$$
g(n)=f_n(n)+1.
$$

输入 $n$ 后，先找到第 $n$ 个定义，再按定义计算 $f_n(n)$，最后加一。每个 Primitive Recursive Function 都在有限步内得到结果，所以 $g$ 可计算。

若 $g$ 也是 Primitive Recursive，则存在 $m$ 使 $g=f_m$。代入 $m$：

$$
f_m(m)=g(m)=f_m(m)+1,
$$

矛盾。因此

$$
\{\text{Primitive Recursive Functions}\}
\subsetneq
\{\text{Recursive Functions}\}.
$$

</details>

### Minimalization

**极小化（Minimalization）** 为函数加入逐个搜索自然数的能力。对 $(k+1)$ 元函数 $g$，定义

$$
\mu m\,[g(\mathbf n,m)=1]
=
\begin{cases}
\min\{m\in\mathbb N:g(\mathbf n,m)=1\},&\text{若存在这样的 }m,\\
0,&\text{若不存在这样的 }m.
\end{cases}
$$

当 $g$ 已可计算时，直接的搜索过程是

```text
m := 0
while g(n₁, ..., nₖ, m) ≠ 1:
    m := m + 1
return m
```

若没有符合条件的 $m$，程序会一直搜索。为了保证每个输入都能停机，要求

$$
\forall\mathbf n\in\mathbb N^k,\quad
\exists m\in\mathbb N,\quad g(\mathbf n,m)=1.
$$

满足这一条件的函数称为 **可极小化的（Minimalizable）**。

**$\mu$ 递归函数（$\mu$-Recursive Function）** 是从 Basic Functions 出发，经过有限次 Composition、Primitive Recursion，以及对 Minimalizable Functions 的 Minimalization 得到的函数。

Primitive Recursion 的更新次数由参数给定；Minimalization 允许一直搜索到满足条件的值，Minimalizable 条件保证搜索终止。

前面的 Diagonalization 不能直接套用于 $\mu$-Recursive Functions：检查一个表达式的语法，无法同时确认其中每次 Minimalization 都满足 $\forall\mathbf n\exists m$ 的要求，因此不能照搬筛选合法定义的枚举过程。

### Example: An Integer Logarithm

**用 Minimalization 定义整数对数。**

$$
\operatorname{log}(m,n)
=\mu p\,[(m+2)^p\ge n+1].
$$

<details>
<summary>展开解析</summary>

从 $p=0$ 开始，寻找第一个使 $(m+2)^p$ 达到 $n+1$ 的指数：

$$
\operatorname{log}(m,n)
=\left\lceil\log_{m+2}(n+1)\right\rceil.
$$

底数 $m+2\ge2$，幂会不断增大，因此对每个 $m,n$ 都存在符合条件的 $p$，所用谓词是 Minimalizable 的。

例如

$$
\operatorname{log}(0,4)=3,
$$

因为 $2^2<5\le2^3$。取 $m+2$ 和 $n+1$ 保证底数至少为 2、真数至少为 1。

这个例子也可以用有界搜索构造；这里用它说明 Minimalization 的写法。

</details>

### Equivalence with Turing Machines

**Theorem：$f:\mathbb N^k\to\mathbb N$ 是 $\mu$-Recursive，当且仅当 $f$ 可以由 TM 计算。**

结合前面的 Diagonalization 结果：

$$
\text{Primitive Recursive}
\subsetneq
\mu\text{-Recursive}
=\text{TM-Computable}.
$$

<details>
<summary>展开证明：μ-Recursive ⇒ TM-Computable</summary>

按函数的构造过程归纳。

1. **Basic Functions。** Zero Function 输出 0；Projection Function 保留指定输入；Successor Function 对输入加一。这些都能由 TM 完成。
2. **Composition。** 先依次计算各个 $h_i(\mathbf n)$ 并保存结果，再计算 $g(h_1(\mathbf n),\ldots,h_\ell(\mathbf n))$。
3. **Primitive Recursion。** 先算初值，再执行有限次更新：

   ```text
   v := g(n₁, ..., nₖ)
   for i := 0, ..., m − 1:
       v := h(n₁, ..., nₖ, i, v)
   return v
   ```

4. **Minimalization。** 从 0 开始逐个计算 $g(\mathbf n,m)$，在第一次得到 1 时输出 $m$。每次子计算都停机，Minimalizable 条件保证最终能找到这样的 $m$。

因此每次构造都保留 TM 可计算性，所有 $\mu$-Recursive Functions 都能由 TM 计算。

</details>

<details>
<summary>展开证明：TM-Computable ⇒ μ-Recursive</summary>

以一元函数 $f:\mathbb N\to\mathbb N$ 为例。设 $M=(K,\Sigma,\delta,s,\{h\})$ 计算 $f$，输入、输出均用二进制表示。把 TM 的有限运行编码为一个自然数，然后用数值函数检查和读取这个编码。

**1. 把 Configuration 编码成自然数。**

令 $K\cap\Sigma=\varnothing$，取

$$
b=|K|+|\Sigma|.
$$

给每个状态和带符号分配一个不同的 $b$ 进制数字：

$$
E:K\cup\Sigma\to\{0,1,\ldots,b-1\},
\qquad E(0)=0,\quad E(1)=1.
$$

对于 Configuration

$$
(q,a_1\cdots\underline{a_k}\cdots a_r),
$$

把状态 $q$ 插到扫描符号 $a_k$ 之后，得到数字串

$$
a_1\cdots a_kqa_{k+1}\cdots a_r.
$$

它对应的自然数为

$$
\sum_{i=1}^{k}E(a_i)b^{r-i+1}
+E(q)b^{r-k}
+\sum_{i=k+1}^{r}E(a_i)b^{r-i}.
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123190319994.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

把各个 Configuration 的编码串依次拼接，就得到一段运行的编码。每个 Configuration 以 $\triangleright$ 开头，可以用它划分相邻 Configuration；$E(\triangleright)\ne0$，因此最左端不会因整数编码而丢失。

记 $c$ 的 $b$ 进制长度为

$$
\ell_b(c)=\min\{k\ge0:b^k>c\},\qquad \ell_b(0)=0.
$$

它可用有界和构造：

$$
\ell_b(c)=\sum_{j=0}^{c}[b^j\le c],
$$

所以 $\ell_b$ 是 Primitive Recursive。

**2. 检查一个数是否编码了合法运行。**

定义谓词 $\operatorname{iscomp}(c,n)$，检查 $c$ 是否满足：

- 每一段都是合法的 Configuration 编码；
- 第一段是输入 $n$ 的初始 Configuration，即 $\triangleright\sqcup s w$，其中 $w$ 为 $n$ 的二进制表示；
- 每对相邻 Configuration 都符合 $\delta$ 中的一条转移。

固定 TM 的转移表有限，整个编码也只有 $\ell_b(c)$ 位。利用 `digit` 读取符号，再用比较、逻辑运算和 Bounded Quantifiers 检查上述条件，便得到 Primitive Recursive Predicate。

最后一段从最右侧的 $\triangleright$ 开始。定义

$$
\operatorname{lastpos}(c)
=\mu i\,[\operatorname{digit}(i,c,b)=E(\triangleright)
\lor i=\ell_b(c)],
$$

$$
\operatorname{last}(c)
=\operatorname{rem}\bigl(c,b^{\operatorname{lastpos}(c)}\bigr).
$$

位置从最低位的 1 开始数，最先找到的 $\triangleright$ 恰好属于最后一个 Configuration。条件 $i=\ell_b(c)$ 使这个辅助搜索对任意输入都有结果。

再定义 $\operatorname{halted}(d)$：当 $d$ 是合法且状态为 $h$ 的 Configuration 编码时取 $1$，否则取 $0$。这同样只需读取和比较编码中的符号。

**3. 搜索完整的停机运行。**

$$
\operatorname{comp}(n)
=\mu c\,[\operatorname{iscomp}(c,n)
\land\operatorname{halted}(\operatorname{last}(c))].
$$

$M$ 计算函数 $f$，所以每个输入 $n$ 都有一段有限停机运行。它的编码就是上述搜索的一个见证，因此这里的 Minimalization 满足 Minimalizable 条件。

**4. 从停机 Configuration 读出输出。**

停机 Configuration 的编码串为 $\triangleright\sqcup h w'$。去掉前 3 个符号：

$$
\operatorname{output}(d)
=\operatorname{rem}\bigl(d,b^{\ell_b(d)\mathbin{\dot{-}}3}\bigr).
$$

此时得到的数以 $b$ 进制存放 0/1 串 $w'$。把这些位按二进制位权求值：

$$
\operatorname{num}(v)
=\sum_{i=1}^{\ell_b(v)}
\operatorname{digit}(i,v,b)\,2^{i-1},
\qquad \operatorname{num}(0)=0.
$$

最低位乘 $2^0$，其后依次乘 $2^1,2^2,\ldots$。由此

$$
\boxed{
f(n)=\operatorname{num}\bigl(
\operatorname{output}(\operatorname{last}(\operatorname{comp}(n)))
\bigr).
}
$$

这些辅助函数均可由 Basic Functions、Composition、Primitive Recursion 和合法的 Minimalization 构造，所以 $f$ 是 $\mu$-Recursive。多元函数只需在初始 Configuration 中编码多个输入，其余步骤相同。

</details>
