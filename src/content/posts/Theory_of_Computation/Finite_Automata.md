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

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260929140918.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这五个状态分别可由 $e,a,ab,aba,b$ 到达，并且不能继续合并：
- 接受与非接受状态用空串区分；
- 接受状态中 $q_0,q_2$ 可用后缀 $a$ 区分，$q_0,q_3$ 及 $q_2,q_3$ 可用 $b$ 区分；
- 非接受状态 $q_1,q_4$ 也可用 $b$ 区分。
- 因此至少需要五个 DFA 状态。

</details>

1. **识别含子串 `bb` 或 `bab` 的串。**

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
    

## Finite Automata and Regular Expressions

### Closure Constructions

有限自动机识别的语言对**并、连接、星闭包、补、交**封闭。下面默认两台机器使用同一字母表，且不同机器的状态已经重命名为互不相交。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928001452.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**并 $L_1\cup L_2$**：加入新初态 $s$，用 $e$ 边分别连接旧初态 $s_1,s_2$，保留两台机器的终态。接受路径可以选择其中任意一台。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928001533.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**连接 $L_1L_2$**：以 $s_1$ 为初态，从 $M_1$ 的每个终态加 $e$ 边到 $s_2$，只保留 $M_2$ 的终态。非确定性猜测输入的分割位置。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928001613.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**星闭包 $L_1^*$**：增加新的初态兼终态 $s$，加 $s\xrightarrow{e}s_1$，并从每个旧终态加 $e$ 边回到 $s_1$；旧终态也保留。新初态负责接受零个块，即空串。

**补 $\Sigma^*-L$**：先使用转移完整的 DFA，再把终态集 $F$ 换成 $K-F$。

**交 $L_1\cap L_2$**：可由德摩根律得到；也可直接对两台 DFA 做乘积构造：

$$
\begin{aligned}
K&=K_1\times K_2,& s&=(s_1,s_2),\\
\delta((p,q),a)&=(\delta_1(p,a),\delta_2(q,a)),& F&=F_1\times F_2.
\end{aligned}
$$

两个分量同步读取同一输入，最后都接受才接受。类似地，更换终态条件可构造并、差、对称差。

<details>
<summary>展开细节</summary>

**为什么 NFA 不能直接交换终态与非终态求补？** 取一个初态 $s$，对 $a$ 同时转移到终态 $f$ 和非终态 $r$。原机器接受 `a`；交换终态后，通向 $r$ 的分支又接受 `a`。这没有得到补语言。“存在接受分支”的否定是“所有分支都不接受”，不是“存在拒绝分支”。

**为什么不完整 DFA 要先补陷阱状态？** 缺失转移的输入原本拒绝；只交换已有状态的终态标记，并不能把这些输入变成接受。

**星闭包为什么增加新初态？** 不能一般地把旧初态直接改成终态，否则到达旧初态但尚未完成一个合法块的串也会被接受。例如识别 $b^*a$ 的机器可在初态读 $b$ 自环；把它直接改成终态便接受 `b`，但 $b\notin(b^*a)^*$。

</details>

### The Equivalence Theorem

**一个语言是正则的，当且仅当它能被有限自动机识别。**

正向：基础语言 $\varnothing$、$\{a\}$ 有对应自动机，自动机又对并、连接、星闭包封闭，所以按照表达式的结构递归构造即可得到 NFA。

反向：把自动机中各状态之间的路径写成正则表达式，再把初态到各终态的路径取并。下面给出递推和实际更常用的消状态方法。

### Example

**From an Expression to an Automaton**

为 $(ab\cup aab)^*$ 构造 NFA。

<details>
<summary>展开按结构构造的步骤</summary>

1. 分别为单个 $a,b$ 构造一条边的自动机。
2. 用连接构造得到 `ab` 和 `aab` 两条分支。
3. 增加初态，用 $e$ 边选择其中一条分支，得到 $ab\cup aab$。
4. 按星闭包构造加入可接受空串的新初态，并让完成一块后可以重新开始。

最后也可以整理成三个状态：$q_0$ 为初态兼唯一终态，转移为

$$
q_0\xrightarrow{a}q_1,\quad
q_1\xrightarrow{b}q_0,\quad
q_1\xrightarrow{a}q_2,\quad
q_2\xrightarrow{b}q_0.
$$

其余转移不设置。这是允许缺失转移的 NFA；若要求 DFA，需要补拒绝陷阱状态。

`e`、`ab`、`aab`、`abaabab` 对应零个或多个合法块；`a`、`abb` 不被接受。这里 `e` 指空串，不是输入字母。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928001920.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### Path Expressions

将状态编号为 $q_1,\ldots,q_n$，初态为 $q_1$。令 $R(i,j,k)$ 表示：从 $q_i$ 到 $q_j$，**中间状态只允许来自 $\{q_1,\ldots,q_k\}$** 的路径所读出的串组成的语言。端点不受此限制。

当 $k=0$ 时，只考虑直接边，并在 $i=j$ 时加入零步路径 $e$。没有路径则对应 $\varnothing$。

递推式为

$$
\begin{aligned}
R(i,j,k)={}&R(i,j,k-1)\\
&\cup R(i,k,k-1)R(k,k,k-1)^*R(k,j,k-1).
\end{aligned}
$$

<details>
<summary>展开递推式与正则性证明</summary>

一条允许经过前 $k$ 个中间状态的路径，分为两类：

- 不把 $q_k$ 当作中间状态：属于第一项。
- 经过 $q_k$：先到 $q_k$，在 $q_k$ 之间往返零次或多次，再离开到达 $q_j$；各小段内部只经过编号小于 $k$ 的状态，对应第二项。

基础语言都是有限语言，因而正则。递推只使用并、连接、星闭包，所以对 $k$ 归纳可知所有 $R(i,j,k)$ 都正则。最后

$$
L(M)=\bigcup_{q_j\in F}R(1,j,n),
$$

是有限个正则语言的并，因此正则。这也证明了自动机到正则表达式方向的等价性。

</details>

### State Elimination

实际求表达式时，用**消状态法（State Elimination）** 更方便：

1. 加入新的初态 $s$ 和唯一终态 $f$，用 $e$ 边连接旧初态、旧终态；保证没有边进入 $s$、没有边离开 $f$。
2. 边标签允许是正则表达式；平行边的标签取并，无边按 $\varnothing$ 处理。
3. 每次消去一个非 $s,f$ 的状态 $q$，更新所有剩余状态对之间的边。

若 $i\to q$、$q\to q$、$q\to j$、$i\to j$ 的标签分别为 $\alpha,\gamma,\beta,\delta$，更新为

$$
\boxed{\delta\cup\alpha\gamma^*\beta}.
$$

其中无自环时 $\gamma=\varnothing$，但 $\gamma^*=e$，因此仍要加入 $\alpha\beta$。更新须保留原来不经过 $q$ 的路径，不能丢掉 $\delta$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928002041.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Example

**Counting b's Modulo Three**

从自动机得到语言

$$
L=\{w\in\{a,b\}^*:\#_b(w)=3k+1,\ k\ge0\}
$$

的正则表达式。

<details>
<summary>展开消状态过程与结果解释</summary>

原图有三个计数状态，读 $a$ 自环，读 $b$ 沿三状态环前进；余数为 $1$ 的状态接受。

加入新初态、终态后，消去余数为 $0$ 和 $2$ 的两个旧状态，留下余数为 $1$ 的状态。到达它的标签是 $a^*b$；在它上面的自环标签是

$$
a\cup ba^*ba^*b.
$$

最后消去该状态，得到

$$
\boxed{a^*b(a\cup ba^*ba^*b)^*}.
$$

先读一个 $b$，此后每个循环要么添加一个 $a$，要么添加三个 $b$ 并允许它们之间有任意多个 $a$。因此 $b$ 的数量始终为 $1\pmod 3$。

按计数块直接写，也可以得到等价表达式

$$
a^*ba^*(ba^*ba^*ba^*)^*.
$$

消状态顺序不同，得到的表达式形式可以不同；需要相同的是所表示的语言。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928001954.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

## Regular and Nonregular Languages

### How to Prove Regularity

证明语言正则，通常选以下一种方法：给出正则表达式；构造 DFA 或 NFA；把它分解为已知正则语言，再使用封闭性。

**构造必须恰好识别目标语言**

### Example

**Decimal Divisibility**

证明所有“没有冗余前导零，且同时被 $2$ 和 $3$ 整除”的非负整数十进制表示组成正则语言。数字 $0$ 本身是合法表示，但 `00`、`06` 和空串不是。

<details>
<summary>展开分解与自动机构造</summary>

令 $\Sigma=\{0,1,\ldots,9\}$。先用正则语言限制合法格式：

$$
L_1=\{0\}\cup\{1,2,\ldots,9\}\Sigma^*.
$$

能被 $2$ 整除恰好要求末位为偶数：

$$
L_2=L_1\cap\Sigma^*\{0,2,4,6,8\}.
$$

能被 $3$ 整除恰好要求数位和是 $3$ 的倍数。用状态 $q_0,q_1,q_2$ 保存已读数值模 $3$ 的余数，读数字 $d$ 时

$$
\delta(q_r,d)=q_{(10r+d)\bmod3}=q_{(r+d)\bmod3}.
$$

初态和唯一终态均为 $q_0$。记这台机器为 $M_3$，则

$$
L_3=L_1\cap L(M_3),\qquad L=L_2\cap L_3.
$$

由交封闭性，$L$ 正则。比如 `0`、`6`、`24` 被接受，`3`、`4`、`06` 被拒绝。也可以直接使用模 $6$ 的 DFA，再与 $L_1$ 取交。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928100751.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### The Pumping Lemma

有限状态自动机处理足够长的输入时，一定会重复访问某个状态；两次访问之间形成的环，可以删去，也可以重复走。

所以正则语言必须满足的**泵引理（Pumping Lemma）**，也称抽泵定理。

若 $L$ 正则，则存在整数 $p\ge1$，使得对任意 $w\in L$，只要 $|w|\ge p$，就存在分解

$$
w=xyz
$$

满足

$$
\boxed{|y|\ge1,\qquad |xy|\le p,\qquad
\forall i\ge0,\ xy^iz\in L.}
$$

这里 $p$ 是泵长度，$y$ 是被重复的非空段；$i=0$ 表示删掉 $y$。

<details>
<summary>展开证明：长路径必有重复状态</summary>

取识别 $L$ 的 DFA，设它有 $p$ 个状态。令 $w=a_1\cdots a_m\in L$，$m\ge p$。读取前 $p$ 个符号时，包含初态在内共经过 $p+1$ 次状态：

$$
q_0,q_1,\ldots,q_p.
$$

由抽屉原理，存在 $0\le r<t\le p$，使 $q_r=q_t$。令

$$
x=a_1\cdots a_r,\qquad
y=a_{r+1}\cdots a_t,\qquad
z=a_{t+1}\cdots a_m.
$$

于是 $|y|=t-r>0$，$|xy|=t\le p$。读取 $y$ 恰好从 $q_r$ 绕回 $q_r$，所以无论绕零次还是任意多次，再读取 $z$，都会到达原来的接受状态。因此所有 $xy^iz$ 都在 $L$ 中。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928100919.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

### Quantifiers and the Proof Strategy

泵引理的顺序是

$$
\exists p\ \forall w\ \exists(x,y,z)\ \forall i.
$$

其中 $w$ 必须属于 $L$ 且足够长，分解必须满足长度条件。证明非正则时，要推翻这一顺序：

1. 假设 $L$ 正则，令 $p$ 为其泵长度。
2. 根据 $p$ 选择一个 $w\in L$，满足 $|w|\ge p$。
3. 对这个 $w$ 的**任意合法分解** $w=xyz$，利用约束确定 $y$ 的可能形式。
4. 选择某个 $i\ge0$，使 $xy^iz\notin L$，得到矛盾。

**串 $w$ 和次数 $i$ 由证明者选择，合法分解不能由证明者任意指定。** 可以让 $i$ 依赖对方给出的分解，但必须覆盖所有合法分解。

> 泵引理是正则性的必要条件。若要证明正则，回到表达式、自动机或封闭性构造。

### Example

1. **Equal Blocks**

证明

$$
L=\{a^nb^n:n\ge0\}
$$

不是正则语言。

<details>
<summary>展开泵引理证明</summary>

假设 $L$ 正则，泵长度为 $p$，取 $w=a^pb^p$。

对任意满足 $w=xyz$、$|xy|\le p$、$|y|\ge1$ 的分解，前 $p$ 个符号全是 $a$，所以必有 $y=a^t$，其中 $1\le t\le p$。

取 $i=0$，得到

$$
xz=a^{p-t}b^p\notin L.
$$

这与泵引理矛盾，因此 $L$ 非正则。

重点是 $|xy|\le p$ 将**所有**可能的泵段都限制在第一段 $a$ 中，而不是我们自行把 $y$ 选成一个 $a$。

</details>

2. **Prime Lengths**

证明

$$
L=\{a^n:n\text{ 为素数}\}
$$

不是正则语言。

<details>
<summary>展开证明：把长度泵成合数</summary>

假设 $L$ 正则，泵长度为 $p$。取一个素数 $m\ge p$，并令 $w=a^m$。

任意合法分解的泵段都形如 $y=a^d$，$d\ge1$。取 $i=m+1$，则

$$
|xy^{m+1}z|=m+md=m(d+1).
$$

两个因子都至少为 $2$，新长度是合数，故 $xy^{m+1}z\notin L$，矛盾。

这里不需要猜测“附近是否还有素数”，只需选择一定会产生合数的泵次数。

</details>

3. **Equal Numbers of a's and b's**

证明

$$
L=\{w\in\{a,b\}^*:\#_a(w)=\#_b(w)\}
$$

不是正则语言；这里字母可以交错出现。

<details>
<summary>展开利用封闭性的证明</summary>

若 $L$ 正则，由于 $a^*b^*$ 正则，其交集也应正则。然而

$$
L\cap a^*b^*=\{a^nb^n:n\ge0\},
$$

右侧已经证明非正则，矛盾。

方法是：**假设目标语言正则，再用正则语言过滤，得到一个已知非正则语言。** 不能反过来声称“非正则语言与任何语言相交都非正则”，例如与空集相交总是正则。

</details>

4. **Balanced Parentheses**

所有正确匹配的括号串也不是正则语言，因为有限状态不能记录任意深度的嵌套。

<details>
<summary>展开严格证明</summary>

把左、右括号暂记为 $a,b$，令 $B$ 为所有正确配对的括号串。若 $B$ 正则，则

$$
B\cap a^*b^*=\{a^nb^n:n\ge0\}
$$

也应正则，矛盾。这把“需要无限记忆”的直觉落实成了封闭性反证。

</details>

5. **Review: Closure and Counterexamples**

判断以下结论是否成立：有限语言正则；有限并封闭；可数并封闭；可数交封闭；差封闭；任意子集仍正则。

<details>
<summary>展开六项判断及理由</summary>

1. **有限语言一定正则。** 每个单串都能写成表达式，有限语言就是有限个单串的并；空语言也正则。
2. **有限个正则语言的并一定正则。** 反复使用二元并封闭性即可。
3. **可数个正则语言的并不一定正则。** 每个 $\{a^nb^n\}$ 都是有限语言，但
   $$
   \bigcup_{n\ge0}\{a^nb^n\}=\{a^nb^n:n\ge0\}
   $$
   非正则。
4. **可数个正则语言的交不一定正则。** 在固定字母表 $\Sigma=\{a,b\}$ 上，令 $L_n=\Sigma^*-\{a^nb^n\}$，每个 $L_n$ 正则，但
   $$
   \bigcap_{n\ge0}L_n=\Sigma^*-\{a^nb^n:n\ge0\}
   $$
   非正则，否则再取补便会使 $\{a^nb^n:n\ge0\}$ 正则。
5. **两个正则语言的差一定正则。** $L_1-L_2=L_1\cap\overline{L_2}$。
6. **正则语言的任意子集不一定正则。** $\{a^nb^n:n\ge0\}\subseteq a^*b^*$ 是反例。

“对并、交封闭”默认指二元运算及其有限次重复，不能直接推广到无限次运算。

</details>

## State Minimization

### Reachable and Equivalent States

先删除**不可达状态**：从初态出发，不论读取什么输入都到不了的状态，不影响识别语言。沿转移图搜索即可找到所有可达状态。

两个状态 $p,q$ 可以合并，当且仅当它们对**所有后续输入**都有相同的接受行为：

$$
p\equiv q\iff
\forall z\in\Sigma^*,\quad
\widehat\delta(p,z)\in F\iff\widehat\delta(q,z)\in F.
$$

若存在某个后缀 $z$，使得从一个状态出发接受、从另一个状态出发拒绝，则 $z$ 是它们的**区分后缀（Distinguishing Suffix）**。

**“同为终态”或“同为非终态”只是可合并的必要条件，不是充分条件。**

### The Myhill-Nerode Theorem

在字符串上定义关系

$$
x\approx_L y\iff
\forall z\in\Sigma^*,\quad xz\in L\iff yz\in L.
$$

两个前缀等价，表示任何后缀都无法区分它们。此关系是等价关系，并且具有右不变性：

$$
x\approx_L y\Longrightarrow xa\approx_L ya\qquad(a\in\Sigma).
$$

另一方面，给定 DFA $M$，也可按“到达同一状态”定义

$$
x\sim_M y\iff\widehat\delta(s,x)=\widehat\delta(s,y).
$$

同一状态面对同一后缀必有同一结果，所以

$$
x\sim_M y\Longrightarrow x\approx_{L(M)}y.
$$

自动机可以把行为相同的前缀暂时分在不同状态，但不能把行为不同的前缀放进同一状态。因此，任何识别 $L$ 的 DFA 都至少需要与 $\approx_L$ 等价类数量相同的状态。

**Myhill–Nerode 定理**：$L$ 正则，当且仅当 $\approx_L$ 只有有限多个等价类。其等价类数恰好等于最小 DFA 的状态数；最小完整 DFA 在状态重命名的意义下唯一。

<details>
<summary>展开等价类自动机的构造与最小性证明</summary>

如果 $\approx_L$ 有限，就把其等价类作为状态：

$$
K=\{[x]:x\in\Sigma^*\},\quad s=[e],\quad
F=\{[x]:x\in L\},\quad\delta([x],a)=[xa].
$$

右不变性保证转移与代表元的选择无关；取后缀 $z=e$，可知同一类内的串同时属于或不属于 $L$，故终态也定义良好。

对输入长度归纳可得 $\widehat\delta([e],w)=[w]$，因此这台 DFA 恰好识别 $L$，且每个状态均可达。

反过来，若 $L$ 有一个有限状态 DFA，“到达同一状态”的分类比 $\approx_L$ 更细，所以 $\approx_L$ 的类数有限，且不超过 DFA 的状态数。

上述构造恰好达到这个下界，因而最小。任何同样大小的可达 DFA 都必须让每个类恰好对应一个状态；转移、初态和终态均由这些类确定，所以只可能在命名上不同。

</details>

### Partition Refinement

已知 DFA 时，不必直接枚举所有后缀。使用**划分细化（Partition Refinement）**：

1. 删除不可达状态。
2. 按是否接受得到初始划分 $P_0=\{F,K-F\}$，去掉空块。
3. 对同一块内的状态，比较它们读每个符号后的目标块；目标块不同则拆分。
4. 重复，直到划分不再变化；把每一块合并成一个新状态。

<details>
<summary>展开正确性与终止性</summary>

令 $p\equiv_k q$ 表示长度不超过 $k$ 的任何后缀都不能区分 $p,q$。$\equiv_0$ 只比较空串，对应初始终态／非终态划分。

递推关系为

$$
p\equiv_{k+1}q\iff
p\equiv_k q\ \land\
\forall a\in\Sigma,\ \delta(p,a)\equiv_k\delta(q,a).
$$

每次真拆分都会增加块数，而块数不超过 $|K|$，所以必定终止。若相邻两轮相同，由递推式可知之后也不会再变，此时所有长度的后缀都不能区分同块状态，恰好得到真正的状态等价关系。

合并后定义 $\delta'([q],a)=[\delta(q,a)]$，初态为 $[s]$，含终态的块为新终态。因为稳定划分中同块后继仍在同块，转移定义良好。

</details>

### Example

1. **Minimizing Alternating Pairs**

对语言

$$
L=(ab\cup ba)^*
$$

求最小 DFA。

<details>
<summary>展开四个等价类与最小化过程</summary>

将输入从左到右每两个符号配成一组，会出现四种必要情况：

- $A=[e]=L$：已读部分恰好由合法块组成；可以结束，因此接受。
- $B=[a]=La$：完整块后多出一个 $a$，下一符号必须是 $b$。
- $C=[b]=Lb$：完整块后多出一个 $b$，下一符号必须是 $a$。
- $D=[aa]=L(aa\cup bb)\Sigma^*$：出现错误的两字符块，后续无法补救。

由此得到：

| 状态 | 读 $a$ | 读 $b$ |
| --- | --- | --- |
| $A$，初态、唯一终态 | $B$ | $C$ |
| $B$ | $D$ | $A$ |
| $C$ | $A$ | $D$ |
| $D$ | $D$ | $D$ |

四类两两可区分：$A$ 与其余三类用空串；$B$ 与 $C,D$ 用 $b$；$C$ 与 $D$ 用 $a$。所以四状态既足够，也必需。

也可以从一台八状态 DFA 出发，先删除不可达的 $q_7,q_8$，剩六个可达状态。划分过程是

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928101728.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

$$
\begin{aligned}
P_0&=\{\{q_1,q_3\},\{q_2,q_4,q_5,q_6\}\},\\
P_1&=\{\{q_1,q_3\},\{q_2\},\{q_4,q_6\},\{q_5\}\},\\
P_2&=P_1.
\end{aligned}
$$

第二块中，$q_2$ 读 $b$ 到接受块；$q_4,q_6$ 读 $a$ 到接受块；$q_5$ 无论读 $a,b$ 都到非接受块。因此它分裂为三个块，最终分别对应 $B,C,D$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928101739.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>

2. **State Lower Bounds**

**再次证明 $\{a^nb^n:n\ge0\}$ 非正则。** 对任意 $i\ne j$，前缀 $a^i,a^j$ 可以被后缀 $b^i$ 区分：

$$
a^ib^i\in L,\qquad a^jb^i\notin L.
$$

因此有无限多个等价类，不可能用有限个 DFA 状态识别。取 $n\ge1$，相应只需选 $i,j\ge1$。

**缺少至少一个符号的语言需要 $2^n$ 个 DFA 状态。** 前面的 $n+1$ 状态 NFA 为什么不能总是变成同样小的 DFA？

<details>
<summary>展开指数状态下界证明</summary>

令状态记录已经出现的符号集合 $A\subseteq\Sigma$，初态是空集；读 $a$ 后变为 $A\cup\{a\}$，当且仅当 $A\ne\Sigma$ 时接受。这给出一个 $2^n$ 状态 DFA，每个集合都可达。

再证明不同集合不能合并。设 $A\ne B$，不妨存在 $c\in B-A$。选一个后缀 $z$，让它恰好包含 $\Sigma-B$ 中的所有符号。

对于已见集合为 $B$ 的前缀，接上 $z$ 后已见全部符号，拒绝；对于已见集合为 $A$ 的前缀，接上 $z$ 后仍缺少 $c$，接受。因此 $A,B$ 可区分。

所有 $2^n$ 个集合对应不同等价类，故最小 DFA 恰有 $2^n$ 个状态。确定化的指数增长在最坏情况下确实无法避免。

</details>

## Algorithms and Applications

### Running a DFA

当转移查询为常数时间时，DFA 对长度为 $m$ 的串只需 $m$ 次转移，运行时间为 $O(m)$。

```text
q ← s
for a in w:
    q ← δ(q, a)
return q ∈ F
```

这段程序把“当前运行到哪里”保存在变量 $q$ 中

### Simulating an NFA

无需枚举所有分支路径，也不必先生成整个 DFA。只需动态维护当前可能状态集：

```text
S ← E({s})
for a in w:
    T ← {p : 存在 q ∈ S，使 (q, a, p) ∈ Δ}
    S ← E(T)
return S ∩ F ≠ ∅
```

这里与子集构造使用同一条更新规则，但只沿当前输入计算实际遇到的集合。

若预先算好各状态的 $e$ 闭包，使用合适的集合表示，每个字符可在 $O(|K|^2)$ 时间内处理，所以输入处理时间为 $O(|K|^2|w|)$，预处理另计。**当自动机固定时，运行时间仍随输入长度线性增长。**

### Example

**Simulating aaaba**

 在图 2-24 的 NFA 上处理 `aaaba`，唯一终态为 $q_4$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928101925.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开状态集合的更新</summary>

这台 NFA 的转移为：$q_0\xrightarrow{a}q_0$，$q_0\xrightarrow{b,e}q_1$，$q_0\xrightarrow{b}q_3$；$q_1\xrightarrow{a}q_2$，$q_1\xrightarrow{b}q_4$；$q_2\xrightarrow{a,b}q_2$；$q_3\xrightarrow{a}q_4$；$q_4\xrightarrow{e}q_3$，$q_4\xrightarrow{a,b}q_2$。

依次取“读一个符号后的终点集合”的 $e$ 闭包，得到

$$
\begin{aligned}
S_0&=\{q_0,q_1\},\\
S_1=S_2=S_3&=\{q_0,q_1,q_2\},\\
S_4&=\{q_1,q_2,q_3,q_4\},\\
S_5&=\{q_2,q_3,q_4\}.
\end{aligned}
$$

最后 $q_4\in S_5$，所以接受。与逐条路径追踪相比，重复到达同一状态的分支已经合并，不会重复展开相同的后续计算。

</details>

### Decision Problems and Representation Size


| 问题 | 方法与成本 |
| --- | --- |
| NFA 转 DFA | 子集构造，最多$2^{\|K\|}$ 个状态，最坏情况下状态数必须指数增长 |
| 正则表达式转 NFA | 按表达式结构递归构造；状态数可与表达式长度成线性关系 |
| 自动机转正则表达式 | 路径递推或消状态；展开后的表达式可能指数增长 |
| DFA 最小化 | 删不可达状态、划分细化，可在多项式时间内完成 |
| 两台 DFA 是否等价 | 构造对称差的乘积自动机，检查是否存在可达终态，多项式时间 |
| NFA 或正则表达式是否等价 | 先确定化，再用 DFA 等价判断，得到指数时间的算法 |

对 DFA 最小化，朴素实现给出 $O(|\Sigma||K|^3)$ 的界；这是该实现的界，不是最小化算法所能达到的最好界。

<details>
<summary>展开 DFA 等价性判断</summary>

两台 DFA 不等价，当且仅当存在一个串被其中一台接受、另一台拒绝。在乘积状态空间中，令终态为

$$
(F_1\times(K_2-F_2))\cup((K_1-F_1)\times F_2).
$$

从 $(s_1,s_2)$ 出发进行可达性搜索：若能到达上述终态，就找到了不同的接受行为；若不能到达，则两台机器语言相同。

保留搜索路径还可以给出一个区分两台机器的输入串。对完整转移表，搜索成本为 $O(|\Sigma||K_1||K_2|)$。

</details>

### Pattern Matching

给定固定模式串 $x$，判断文本是否包含 $x$，就是识别

$$
\Sigma^*x\Sigma^*.
$$

NFA 可以在初态跳过任意前缀，非确定地猜测匹配起点，沿模式链逐字符匹配，最后进入可读取任意后缀的接受状态。

使用 $x=\texttt{ababaab}$。

相应的 DFA 在尚未匹配成功时，只需记录：**已读文本的后缀中，与模式前缀匹配的最大长度**。成功后进入接受的吸收状态。因此可以使用 $|x|+1$ 个状态；预先构建转移表后，扫描文本为 $O(|w|)$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928102431.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />
