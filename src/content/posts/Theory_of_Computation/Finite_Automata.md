---
title: Finite Automata
published: 2026-09-22
description: 有限自动机、子集构造、正则语言与自动机的等价性、泵引理、状态最小化及相关算法
tags: [计算理论]
category: 笔记
draft: false
---

## Deterministic Finite Automata

### Finite Memory and State Meaning

一个有限自动机由输入带、只向右移动的读头和有限控制器组成。

它每次读一个符号，根据当前状态改变状态；输入读完后，由当前状态决定接受或拒绝。

### Formal Definition

**确定性有限自动机（Deterministic Finite Automaton, DFA）** 是五元组

$$
M=(K,\Sigma,\delta,s,F),
$$

其中 $K$ 是有限状态集，$\Sigma$ 是有限字母表，$s\in K$ 是初态，$F\subseteq K$ 是终态集，转移函数为

$$
\delta:K\times\Sigma\to K.
$$

对每个状态 $q$ 和输入符号 $a$，**恰好有一个**下一状态 $\delta(q,a)$。状态图中：

- 圆圈表示状态，双圆圈表示终态，外部箭头指向初态。
- 边 $q\xrightarrow{a}p$ 表示 $\delta(q,a)=p$。
- 每个状态对每个符号都必须有转移；必要时补一个拒绝的陷阱状态。

**必须读完整个输入，且停在终态，才算接受。** 初态也可以是终态，终态集也可以为空。

### Configurations and Acceptance

**格局（Configuration）** $(q,w)\in K\times\Sigma^*$ 记录当前状态 $q$ 和尚未读取的串 $w$。若 $a\in\Sigma$，则

$$
(q,aw)\vdash_M(p,w)\iff\delta(q,a)=p.
$$

$\vdash_M$ 表示一步转移，$\vdash_M^*$ 是其自反传递闭包，表示零步或多步转移。

$$
w\in L(M)\iff\exists f\in F,\quad(s,w)\vdash_M^*(f,e).
$$

也可把转移函数扩展到整个字符串：

$$
\widehat\delta(q,e)=q,\qquad
\widehat\delta(q,wa)=\delta(\widehat\delta(q,w),a).
$$

于是 $w\in L(M)\iff\widehat\delta(s,w)\in F$。特别地，

$$
e\in L(M)\iff s\in F.
$$

### Example

1. **识别 $\{a,b\}^*$ 中含偶数个 $b$ 的串。**

<details>
<summary>展开解析</summary>

令 $q_0,q_1$ 分别表示目前 $b$ 的数量为偶数、奇数。初态和唯一终态都是 $q_0$；读 $a$ 保持原状态，读 $b$ 在两状态间切换。

$$
\delta(q_0,a)=q_0,\quad\delta(q_1,a)=q_1,\quad
\delta(q_0,b)=q_1,\quad\delta(q_1,b)=q_0.
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922220325.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

输入 `aabba` 的运行是

$$
\begin{aligned}
(q_0,aabba)&\vdash(q_0,abba)\vdash(q_0,bba)\\
&\vdash(q_1,ba)\vdash(q_0,a)\vdash(q_0,e).
\end{aligned}
$$

读完后在终态 $q_0$，所以接受。空串也被接受，因为其中有零个 $b$。
**读完任意前缀 $u$ 后，所在状态为 $q_{\#_b(u)\bmod 2}$。** 

对前缀长度归纳即可证明：读 $a$ 不改变奇偶性，读 $b$ 恰好翻转奇偶性。

</details>

2. **识别所有不含子串 `bbb` 的串。**

<details>
<summary>展开解析</summary>

设 $q_0,q_1,q_2$ 分别表示：尚未出现 `bbb`，且当前末尾连续 $b$ 的数量为 $0,1,2$。$q_3$ 表示已经出现 `bbb`，此后无法补救。

| 状态 | 读 $a$ | 读 $b$ | 是否终态 |
| --- | --- | --- | --- |
| $q_0$，初态 | $q_0$ | $q_1$ | 是 |
| $q_1$ | $q_0$ | $q_2$ | 是 |
| $q_2$ | $q_0$ | $q_3$ | 是 |
| $q_3$ | $q_3$ | $q_3$ | 否 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922215305.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

尚未出错时，读 $a$ 会结束末尾连续的 $b$，因此返回 $q_0$；读 $b$ 则把末尾计数加一。第三个连续的 $b$ 使机器进入拒绝的陷阱状态 $q_3$，此后对 $a,b$ 都自环。

例如 `bbabb` 被接受，`abbba` 被拒绝。不能让 $q_3$ 读到 $a$ 后回到 $q_0$：后面出现 $a$ 不会消除前面已经出现过的 `bbb`。

与第一章的表达式对应：

$$
(e\cup b\cup bb)(a\cup ab\cup abb)^*.
$$

自动机识别与正则表达式生成从两个方向描述了同一个语言。

若要识别“含有 `bbb`”，保持所有转移不变，把终态集改为 $\{q_3\}$ 即可。这正是完整 DFA 的补集构造。

</details>

## Nondeterministic Finite Automata

### Nondeterminism and Empty Moves

**非确定性有限自动机（Nondeterministic Finite Automaton, NFA）** 允许对同一个状态和输入符号有多个下一状态，也允许没有下一状态，还可以沿 $e$ 边移动而不消耗输入。

NFA **包含允许 $e$ 转移的情形**。定义为

$$
M=(K,\Sigma,\Delta,s,F),\qquad
\Delta\subseteq K\times(\Sigma\cup\{e\})\times K.
$$

$\Delta$ 是转移关系。若 $(q,u,p)\in\Delta$，其中 $u\in\Sigma\cup\{e\}$，则

$$
(q,uw)\vdash_M(p,w).
$$

接受条件仍为

$$
w\in L(M)\iff\exists f\in F,\quad(s,w)\vdash_M^*(f,e).
$$

但这里的关键是**存在一条接受路径**。其他路径走不通、停在非终态，甚至沿 $e$ 环无限运行，都不影响这一条有限接受路径的有效性。

### Example

1. **Blocks ab and aba** 语言 $(ab\cup aba)^*$ 
   
<details>
<summary>展开解析</summary>   

可以由三个状态描述：初态 $q_0$ 也是唯一终态，转移为

$$
q_0\xrightarrow{a}q_1,\qquad
q_1\xrightarrow{b}q_0,\qquad
q_1\xrightarrow{b}q_2,\qquad
q_2\xrightarrow{a}q_0.
$$

读到块中的 $b$ 时，机器可以选择结束 `ab`，也可以继续读取一个 $a$ 来结束 `aba`。
<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922220537.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

对于 `aba`，路径 $q_0\to q_1\to q_2\to q_0$ 接受，而 $q_0\to q_1\to q_0\to q_1$ 不接受。存在第一条路径已经足够。

对于 `abb`，读完 `ab` 后的各分支都无法再读一个 $b$ 并接受，所以拒绝。

**另一种 NFA 构造**：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922220716.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

也可使用 $q_0\xrightarrow{a}q_1\xrightarrow{b}q_2$，再令 $q_2\xrightarrow{a}q_0$ 和 $q_2\xrightarrow{e}q_0$。

**DFA 构造**：

| DFA 状态 | 读 $a$ | 读 $b$ |
| --- | --- | --- |
| $q_0$，初态、终态 | $q_1$ | $q_4$ |
| $q_1$ | $q_4$ | $q_2$ |
| $q_2$，终态 | $q_3$ | $q_4$ |
| $q_3$，终态 | $q_1$ | $q_2$ |
| $q_4$，陷阱 | $q_4$ | $q_4$ |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922220926.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这五个状态分别可由 $e,a,ab,aba,b$ 到达，并且不能继续合并：
- 接受与非接受状态用空串区分；
- 接受状态中 $q_0,q_2$ 可用后缀 $a$ 区分，$q_0,q_3$ 及 $q_2,q_3$ 可用 $b$ 区分；
- 非接受状态 $q_1,q_4$ 也可用 $b$ 区分。
- 因此至少需要五个 DFA 状态。

</details>

2. **识别含子串 `bb` 或 `bab` 的串。**

<details>
<summary>展开解析</summary>
构造思路：初态 $q_0$ 对 $a,b$ 自环以跳过任意前缀，同时读到 $b$ 时可以猜测“匹配从这里开始”，进入 $q_1$。随后

$$
q_1\xrightarrow{b}q_2\xrightarrow{e}q_4,
\qquad
q_1\xrightarrow{a}q_3\xrightarrow{b}q_4.
$$

唯一终态 $q_4$ 对 $a,b$ 自环，吸收匹配后的任意后缀。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922221224.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**举例说明**：

`bababab` 的一个接受分支为

$$
q_0\xrightarrow{b}q_1\xrightarrow{a}q_3\xrightarrow{b}q_4
\xrightarrow{a}q_4\xrightarrow{b}q_4\xrightarrow{a}q_4\xrightarrow{b}q_4.
$$

一直留在 $q_0$ 的分支则不接受。这不构成矛盾：NFA 的接受是“至少存在一个分支”。

对应表达式是 $(a\cup b)^*(bb\cup bab)(a\cup b)^*$。

</details>

3. **A Missing Symbol**

令 $\Sigma=\{a_1,\ldots,a_n\}$，$n\ge2$，考虑

$$
L=\{w\in\Sigma^*:w\text{ 至少缺少字母表中的一个符号}\}.
$$

<details>
<summary>展开解析</summary>

NFA 只需 $n+1$ 个状态：初态 $s$ 通过 $e$ 边进入任意 $q_i$；$q_i$ 对所有 $a_j\ne a_i$ 自环，但没有读取 $a_i$ 的转移。所有状态均为终态。

n = 3 的 diagram：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922221509.png"  style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

机器先猜“缺少的是 $a_i$”，再检查整个串确实没有 $a_i$。至少有一个猜测成立便接受。

等价 DFA 可以用“已经出现过哪些符号”的集合为状态，需要 $2^n$ 个状态；

$$ \boxed{ \begin{array}{c|c} \text{DFA} & \text{每个状态对每个输入都必须有下一状态}\\ \text{NFA} & \text{可以没有下一状态，此时该路径直接失败} \end{array}} $$

</details>

4. **The Sixth Symbol from the End**

识别 $\{a,b\}^*$ 中倒数第六位为 $a$ 的串，即

$$
(a\cup b)^*a(a\cup b)^5.
$$

<details>
<summary>展开七状态 NFA 的构造</summary>

初态 $q_0$ 对 $a,b$ 自环；读到 $a$ 时，还可以转移到 $q_1$，猜测它就是倒数第六位。随后必须再读取恰好五个符号：

$$
q_0\xrightarrow{a}q_1\xrightarrow{a,b}q_2
\xrightarrow{a,b}q_3\xrightarrow{a,b}q_4
\xrightarrow{a,b}q_5\xrightarrow{a,b}q_6.
$$

唯一终态 $q_6$ 没有出边。进入 $q_6$ 时若恰好读完输入，该分支接受；剩余输入太多或太少都会失败。

例如 `abbbbb` 接受，`babbbb` 拒绝，长度小于 $6$ 的串全部拒绝。推广到倒数第 $k$ 位为 $a$，同样只需 $k+1$ 个 NFA 状态。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922222420.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

## From NFA to DFA

### Empty Closure

状态 $q$ 的 **$e$ 闭包（$\varepsilon$-Closure）** 是不读取任何输入就能到达的状态集合：

$$
E(q)=\{p\in K:(q,e)\vdash_M^*(p,e)\}.
$$

因为允许零步，始终有 $q\in E(q)$。对状态集合 $S$，定义

$$
E(S)=\bigcup_{q\in S}E(q),\qquad E(\varnothing)=\varnothing.
$$

计算时，从 $q$ 出发，只沿 $e$ 边做可达性搜索；每个状态访问一次，遇到环也不会无限搜索。

### Subset Construction

**子集构造（Subset Construction）的核心：DFA 的一个状态，记录 NFA 当前所有可能状态。**

给定 NFA $M=(K,\Sigma,\Delta,s,F)$，构造 DFA $M'=(K',\Sigma,\delta',s',F')$：

$$
\begin{aligned}
K'&=2^K,\\
s'&=E(s),\\
F'&=\{S\subseteq K:S\cap F\ne\varnothing\},\\
\delta'(S,a)&=E\bigl(\{p:\exists q\in S,\ (q,a,p)\in\Delta\}\bigr).
\end{aligned}
$$

每读一个符号，**先从当前集合沿该符号走一步，再取 $e$ 闭包**。初态已经取闭包，每次转移后也取闭包，所以所有可达集合都已包含读取下一符号前能走到的 $e$ 状态。

- 集合中只要含有一个 NFA 终态，就属于 DFA 的终态集。
- $\varnothing$ 也是合法的 DFA 状态，且 $\delta'(\varnothing,a)=\varnothing$。
- 若原 NFA 有 $n$ 个状态，构造至多产生 $2^n$ 个状态；实际计算只展开可达子集。

<details>
<summary>展开等价性证明</summary>

设 DFA 读完 $w$ 后处于集合 $S_w$。证明不变式

$$
S_w=\{q:(s,w)\vdash_M^*(q,e)\}.
$$

对 $|w|$ 归纳。$w=e$ 时，右边恰好是 $E(s)$，即 DFA 初态。

假设结论对 $w$ 成立。读完 $wa$ 的 NFA 路径可以分成：读取 $w$，读取最后一个符号 $a$，再走零条或多条 $e$ 边。因此所有可能终点恰好组成 $\delta'(S_w,a)$，结论成立。

最终，NFA 存在接受路径，当且仅当 $S_w\cap F\ne\varnothing$，也就当且仅当 DFA 接受。所以 $L(M)=L(M')$。

</details>

### Example:

**A Complete Subset Construction**

原 NFA 的初态为 $q_0$，唯一终态为 $q_4$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922223724.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开闭包、转移与最终结果</summary>

图中的 $e$ 边是 $q_0\to q_1$、$q_1\to q_2$、$q_1\to q_3$、$q_4\to q_3$。因此

$$
\begin{aligned}
E(q_0)&=\{q_0,q_1,q_2,q_3\},& E(q_1)&=\{q_1,q_2,q_3\},\\
E(q_2)&=\{q_2\},& E(q_3)&=\{q_3\},\\
E(q_4)&=\{q_3,q_4\}.&&
\end{aligned}
$$

其余边为 $q_1\xrightarrow{a}q_0$、$q_1\xrightarrow{a}q_4$、$q_3\xrightarrow{a}q_4$、$q_0\xrightarrow{b}q_2$、$q_2\xrightarrow{b}q_4$。

将出现的集合命名为

$$
\begin{aligned}
A&=\{q_0,q_1,q_2,q_3\},& B&=\{q_0,q_1,q_2,q_3,q_4\},\\
C&=\{q_2,q_3,q_4\},& D&=\{q_3,q_4\},\qquad T=\varnothing.
\end{aligned}
$$

初态是 $A$；$B,C,D$ 含有 $q_4$，因此是终态。

| DFA 状态 | 读 $a$ | 读 $b$ |
| --- | --- | --- |
| $A$ | $B$ | $C$ |
| $B$ | $B$ | $C$ |
| $C$ | $D$ | $D$ |
| $D$ | $D$ | $T$ |
| $T$ | $T$ | $T$ |

例如，从 $A$ 读 $a$ 的一步终点只有 $q_0,q_4$，但还要补上它们的闭包：

$$
\delta'(A,a)=E(q_0)\cup E(q_4)=B.
$$

原来的 $5$ 个状态理论上对应 $32$ 个子集，实际只有上面 $5$ 个可达。**构造可达 DFA 后仍可能需要最小化；“可达”与“不可合并”是两个条件。**

`abb` 对应 $A\xrightarrow{a}B\xrightarrow{b}C\xrightarrow{b}D$。由于 $D$ 是终态，输入被接受。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922223755.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>
    