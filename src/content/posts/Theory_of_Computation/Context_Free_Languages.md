---
title: Context-Free Languages
published: 2026-10-20
description: 上下文无关文法、分析树与歧义、下推自动机、文法与自动机的等价构造，以及封闭性与泵引理
tags: [计算理论]
category: 笔记
draft: false
---

**上下文无关语言恰好是下推自动机能够接受的语言，且严格包含全部正则语言。**

## The Chomsky Hierarchy

| 语言类别 | 识别装置 |
| --- | --- |
| 正则语言(regular) | 有限自动机(finite) |
| 上下文无关语言(context-free) | 下推自动机(pushdown) |
| 上下文有关语言(context-sensitive) | 线性有界自动机(linear-bounded) |
| 无限制文法生成的语言(unrestricted) | 图灵机(turing) |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261020123908.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

## Context-Free Grammars

### From Regular Expressions to Grammars

**上下文无关文法（Context-Free Grammar，CFG）** ：通过递归替换规则描述字符串的结构。

例如，正则表达式 $a(a^*\cup b^*)b$ 表示：先写一个 $a$，中间写任意多个 $a$ 或任意多个 $b$，最后写一个 $b$。用新符号表示尚未确定的部分，可以写成：

$$
S\to aMb,\qquad M\to A\mid B,\qquad
A\to aA\mid e,\qquad B\to bB\mid e.
$$

其中 $S$ 表示完整字符串，$M$ 表示中间部分，$A,B$ 分别生成全为 $a$、全为 $b$ 的字符串。竖线是多个规则的简写，例如 $M\to A\mid B$ 表示 $M\to A$ 与 $M\to B$ 两条规则。

<details>
<summary>展开例子：如何生成 aaab？</summary>

$$
S\Rightarrow aMb\Rightarrow aAb\Rightarrow aaAb
\Rightarrow aaaAb\Rightarrow aaab.
$$

最后使用 $A\to e$，删去尚未展开的 $A$。得到只含 $a,b$ 的字符串后，生成过程完成。

</details>

**“上下文无关”指规则的适用性与被替换符号左右两侧的内容无关。** 只要有规则 $A\to\alpha$，任何 $xAy$ 都可以变成 $x\alpha y$。例如，$A$ 出现在 `aaAb` 或 `bAa` 中时，均可应用同一条规则。

### Definition and Derivations

上下文无关文法是四元组：

$$
G=(V,\Sigma,R,S).
$$

- $V$：有限的符号集合，包含文法中使用的全部符号。
- $\Sigma\subseteq V$：**终结符（Terminal）** 集合，最终字符串由这些符号组成。
- $V-\Sigma$：**非终结符（Nonterminal）** 集合，用于表示尚待展开的结构。
- $S\in V-\Sigma$：开始符号。
- $R\subseteq(V-\Sigma)\times V^*$：有限的产生式集合；每条规则形如 $A\to\alpha$，左边恰好是一个非终结符，右边可以是任意有限字符串，包括空串 $e$。


**一步推导** $u\Rightarrow_G v$ 表示在 $u$ 中选定一个非终结符的出现位置，并按某条产生式替换一次：

$$
u=xAy,\quad A\to\alpha\in R
\quad\Longrightarrow\quad
v=x\alpha y.
$$

$\Rightarrow_G^*$ 是 $\Rightarrow_G$ 的自反、传递闭包，表示**零步或有限多步推导**。文法明确时省略下标 $G$。

$$
w_0\Rightarrow w_1\Rightarrow\cdots\Rightarrow w_n
$$

称为从 $w_0$ 到 $w_n$ 的一次推导，长度为 $n$，即应用规则的次数。中间串可以同时包含终结符与非终结符；从 $S$ 可达的中间串称为句型。需要区分树结构时，还应记录每一步替换的是哪一个出现位置。

文法生成的语言为：

$$
L(G)=\{w\in\Sigma^*:S\Rightarrow_G^*w\}.
$$

若存在 CFG $G$ 使 $L=L(G)$，则 $L$ 是**上下文无关语言（Context-Free Language，CFL）**。

**判断 $w\in L(G)$，只需找到一条从 $S$ 到终结符串 $w$ 的有限推导。** 某些其他选择可能无法结束。含有非终结符的中间串不属于 $L(G)$。

### Examples

1. **Equal Counts in Two Blocks**

$$
S\to aSb\mid e
$$

生成：

$$
L(G)=\{a^nb^n:n\ge0\}.
$$

每次应用 $S\to aSb$，就在两端分别添加一个 $a$ 与一个 $b$；最后用 $S\to e$ 结束。因此产生的字符串数量匹配，且所有 $a$ 位于所有 $b$ 之前。

$$
S\Rightarrow aSb\Rightarrow aaSbb\Rightarrow aabb.
$$

反过来，任意 $a^nb^n$ 都可通过 $n$ 次 $S\to aSb$，再接一次 $S\to e$ 得到。这个语言是 CFL，同时它已被证明为非正则语言。

2. **Balanced Parentheses**

$$
S\to e\mid SS\mid(S)
$$

生成所有正确配对的括号串。三条规则分别表示空串、两个合法括号串的连接，以及在合法括号串外添加一对括号。

判断一个括号串是否合法，需要同时满足：

1. 左括号与右括号总数相同。
2. 任意前缀中的左括号数不少于右括号数。

例如，`(())()` 合法，`)(` 虽然两类括号总数相同，仍不合法。

<details>
<summary>展开说明：为什么文法恰好生成全部合法括号串？</summary>

空串合法；连接两个合法串、在合法串外加一对括号，都保持上述两个条件，所以文法不会生成非法串。

对任意非空合法串，从第一个左括号开始，找到与它匹配的右括号，可以唯一分解成 $(x)y$，其中 $x,y$ 均为更短的合法括号串。按长度归纳，它们都能由 $S$ 生成，于是：

$$
S\Rightarrow SS\Rightarrow(S)S\Rightarrow^*(x)y.
$$

空串由 $S\to e$ 生成，因此没有遗漏。

</details>

3. **Equal Numbers of a and b**

$$
S\to e\mid SS\mid aSb\mid bSa.
$$

这个文法生成：

$$
L(G)=\{w\in\{a,b\}^*:\#_a(w)=\#_b(w)\},
$$

其中 $\#_a(w)$ 表示 $w$ 中 $a$ 的数量。**这里只约束数量，允许任意排列**，例如 `abba`、`baab`、`abab` 均属于该语言。

<details>
<summary>展开完整证明：两个包含方向与首尾相同的情况</summary>

**方向一：文法生成的字符串都有相同数量的 $a,b$。**

对推导步数作强归纳。一步得到的终结符串只能是 $e$，结论成立。更长推导的第一条规则有三种可能：

- $S\to SS$：两个子推导分别得到 $x,y$。它们各自使用更少的步数，故均有相同数量的 $a,b$，连接后也相同。
- $S\to aSb$：内部串 $x$ 的两类字符数量相同，再添加一个 $a$ 和一个 $b$，仍相同。
- $S\to bSa$：同理。

**方向二：两类字符数量相同的字符串都能生成。**

对 $|w|$ 作强归纳。$w=e$ 时直接使用 $S\to e$。非空串的首尾有四种组合。

若 $w=axb$，则 $x$ 中的 $a,b$ 数量相同，由归纳假设 $S\Rightarrow^*x$，所以：

$$
S\Rightarrow aSb\Rightarrow^*axb=w.
$$

$w=bxa$ 同理，使用 $S\to bSa$。

若 $w=axa$，则 $x$ 中的 $b$ 比 $a$ 多两个。需要将 $x$ 切成 $uv$，使 $u,v$ 中都恰好多一个 $b$。这一切分一定存在：从左到右扫描 $x$，记录前缀的

$$
d=\#_b-\#_a.
$$

$d$ 从 $0$ 走到 $2$，每步变化 $\pm1$，因此必然经过 $1$。在第一次到达 $1$ 的位置切开，得到 $x=uv$，且两段的差值均为 $1$。于是 $au$ 与 $va$ 各自都有相同数量的 $a,b$，长度也都小于 $|w|$。由归纳假设：

$$
S\Rightarrow SS\Rightarrow^*(au)(va)=w.
$$

若 $w=bxb$，交换 $a,b$，采用相同论证。

两个方向合起来即得结论。

</details>

4. **Arithmetic Expressions**

算术表达式可由以下文法生成，其中 $E$ 是开始符号，$id$ 作为一个终结符表示标识符：

$$
\begin{aligned}
E&\to E+T\mid T,\\
T&\to T*F\mid F,\\
F&\to(E)\mid id.
\end{aligned}
$$

$E,T,F$ 分别表示表达式、项和因子。这个分层安排使得：加法组合各个项；乘法位于项的内部；括号允许把整个表达式作为一个因子。

因此，`id+id*id` 的结构是 $id+(id*id)$；`(id+id)*id` 则由括号显式改变分组。递归规则 $E\to E+T$ 与 $T\to T*F$ 还规定了同级运算的左结合方式。

<details>
<summary>展开推导：生成 id+id*id</summary>

$$
\begin{aligned}
E&\Rightarrow E+T\Rightarrow T+T\Rightarrow F+T
\Rightarrow id+T\\
&\Rightarrow id+T*F\Rightarrow id+F*F
\Rightarrow id+id*F\Rightarrow id+id*id.
\end{aligned}
$$

</details>

### From Finite Automata to Grammars

**所有正则语言都是上下文无关语言。** 可以直接把 DFA 的一次识别过程改写成文法的生成过程。

设 DFA 为 $M=(K,\Sigma,\delta,s,F)$。先重命名状态，使 $K\cap\Sigma=\varnothing$，再构造：

$$
G=(K\cup\Sigma,\Sigma,R,s),
$$

$$
R=\{q\to ap:\delta(q,a)=p\}
\cup\{q\to e:q\in F\}.
$$

**状态成为非终结符；读入一个字符的转移，变为生成该字符并保留下一状态的规则；终态允许结束生成。**

<details>
<summary>展开证明：为什么 L(G)=L(M)？</summary>

若自动机在输入 $w=a_1\cdots a_n$ 上的运行是：

$$
s=q_0\xrightarrow{a_1}q_1\xrightarrow{a_2}\cdots
\xrightarrow{a_n}q_n,
$$

则对应文法推导：

$$
s\Rightarrow a_1q_1\Rightarrow a_1a_2q_2
\Rightarrow\cdots\Rightarrow wq_n.
$$

当且仅当 $q_n\in F$ 时，可以再用 $q_n\to e$ 得到纯终结符串 $w$。

反过来，文法每次使用 $q\to ap$ 都对应 DFA 的合法转移；唯一能消去最后一个状态符号的规则来自终态。因此文法生成 $w$ 当且仅当自动机接受 $w$。空串也被正确处理：$s\to e$ 存在当且仅当 $s\in F$。

</details>

#### Example

自动机对应文法：

$$
\begin{aligned}
S&\to aS\mid bA,\\
A&\to aB\mid bA,\\
B&\to aS\mid bA\mid e.
\end{aligned}
$$

输入 `aabbaba` 对应状态序列 $S,S,S,A,A,B,A,B$，最后停在终态 $B$。

<details>
<summary>展开与自动机运行逐步对应的推导</summary>

$$
\begin{aligned}
S&\Rightarrow aS\Rightarrow aaS\Rightarrow aabA
\Rightarrow aabbA\\
&\Rightarrow aabbaB\Rightarrow aabbabA
\Rightarrow aabbabaB\Rightarrow aabbaba.
\end{aligned}
$$

每一步中，左侧已生成的终结符就是已读前缀，最右侧非终结符就是当前状态。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261020132519.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

结合 $\{a^nb^n:n\ge0\}$ 为 CFL 且非正则，得到严格包含关系：

$$
\mathrm{Regular}\subsetneq\mathrm{CFL}.
$$

## Parse Tree

### Structure and Yield

**分析树（Parse Tree）** 把一次生成过程中的递归结构画成有序树。展开不同分支的先后次序可以变化，树仍可能相同。

对于文法 $G=(V,\Sigma,R,S)$：

- 完整字符串的分析树以 $S$ 为根；讨论子树时，根也可以是其他符号。
- 内部节点标记非终结符。若某节点标记 $A$，其孩子从左到右为 $X_1,\ldots,X_k$，则对应规则 $A\to X_1\cdots X_k$。
- 叶子标记终结符，或在 $A\to e$ 的情况下标记 $e$。
- 从左到右连接全部叶子标记，得到树的**产出（Yield）**；$e$ 不贡献字符。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261020132900.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开归纳定义：怎样严格构造一棵分析树？</summary>

1. 对每个 $a\in\Sigma$，标记为 $a$ 的单节点树是一棵分析树，产出为 $a$。
2. 若 $A\to e\in R$，以 $A$ 为根、以一个 $e$ 节点为孩子的树是一棵分析树，产出为 $e$。
3. 若已有 $k\ge1$ 棵分析树 $T_1,\ldots,T_k$，根标记分别为 $X_1,\ldots,X_k$，产出分别为 $y_1,\ldots,y_k$，且 $A\to X_1\cdots X_k\in R$，则增加根 $A$ 并按顺序连接这些子树，得到产出为 $y_1\cdots y_k$ 的分析树。
4. 只有通过以上规则有限次构造出的树，才属于分析树。

其中 $X_i$ 可以是终结符或非终结符。$e$ 是专门表示空产出的叶子标记，无需将它加入终结符集合。

</details>

### Similar Derivations

若两次推导使用相同的树结构，只改变不同分支的展开顺序，就称它们**相似**。

以括号文法 $S\to e\mid SS\mid(S)$ 为例，以下两个推导都生成 `(())()`，也对应同一棵树：

$$
\begin{aligned}
S&\Rightarrow SS\Rightarrow(S)S\Rightarrow((S))S
\Rightarrow(())S\Rightarrow(())(S)\Rightarrow(())(),\\
S&\Rightarrow SS\Rightarrow S(S)\Rightarrow(S)(S)
\Rightarrow(S)()\Rightarrow((S))()\Rightarrow(())().
\end{aligned}
$$

两者都将根分成两个 $S$：左子树生成 `(())`，右子树生成 `()`。

<details>
<summary>展开形式化定义：一次交换与相似关系</summary>

假设某个句型中有两个不同位置的非终结符：

$$
uAvBw,
$$

并分别选择规则 $A\to\alpha$、$B\to\beta$。先展开左边或先展开右边，可以得到：

$$
\begin{aligned}
uAvBw&\Rightarrow u\alpha vBw\Rightarrow u\alpha v\beta w,\\
uAvBw&\Rightarrow uAv\beta w\Rightarrow u\alpha v\beta w.
\end{aligned}
$$

若完整推导 $D,D'$ 除这两步的中间句型外完全相同，且 $D$ 先展开左边的 $A$，就记 $D\prec D'$。这里交换的是两个独立位置；不能把展开父节点与展开其新生成孩子的步骤互换。

**相似关系是 $\prec$ 的自反、对称、传递闭包。** 即允许做零次或有限次这样的交换，每次可以正向或反向交换。

因此，相似是等价关系；同一相似等价类对应同一棵分析树。$\prec$ 本身只描述一次交换，通常不具有传递性。

三个推导：

$$
\begin{aligned}
D_1:\;&S\Rightarrow SS\Rightarrow(S)S\Rightarrow((S))S
\Rightarrow(())S\Rightarrow(())(S)\Rightarrow(())(),\\
D_2:\;&S\Rightarrow SS\Rightarrow(S)S\Rightarrow((S))S
\Rightarrow((S))(S)\Rightarrow(())(S)\Rightarrow(())(),\\
D_3:\;&S\Rightarrow SS\Rightarrow(S)S\Rightarrow((S))S
\Rightarrow((S))(S)\Rightarrow((S))()\Rightarrow(())().
\end{aligned}
$$

有 $D_1\prec D_2$、$D_2\prec D_3$，但 $D_1\not\prec D_3$，因为最后这对推导需要两次交换。三者仍然相似。

另一条推导：

$$
\begin{aligned}
D:\;&S\Rightarrow SS\Rightarrow SSS\Rightarrow S(S)S
\Rightarrow S((S))S\\
&\Rightarrow S(())S\Rightarrow S(())(S)
\Rightarrow S(())()\Rightarrow(())().
\end{aligned}
$$

它额外使用了一次 $S\to SS$ 和一次 $S\to e$，树结构改变，因而与前三条不相似，尽管最终字符串相同。

</details>

### Leftmost and Rightmost Derivations

**最左推导（Leftmost Derivation）** 每一步都展开当前句型中最左侧的非终结符。一步最左推导的形式为：

$$
wA\beta\Rightarrow_L w\alpha\beta,
\qquad w\in\Sigma^*,\quad A\to\alpha\in R.
$$

条件 $w\in\Sigma^*$ 保证 $A$ 左侧已经没有非终结符。

**最右推导（Rightmost Derivation）** 相应地每次展开最右侧的非终结符。

**固定一棵分析树后，最左推导与最右推导各自唯一。** 每一步展开的位置由方向确定，使用的规则由树确定。对同一个终结符串，如果存在不同的分析树，就可能存在多条最左推导。

> 最左推导中的“最左”指最左侧的**非终结符**。例如在 `id+T*F` 中应展开 $T$，前面的终结符 `id` 无需再展开。

#### Theorem

给定 $A\in V-\Sigma$ 与 $w\in\Sigma^*$，以下四个命题等价：

$$
\begin{aligned}
&A\Rightarrow^*w;\\
&\text{存在以 }A\text{ 为根、产出为 }w\text{ 的分析树};\\
&A\Rightarrow_L^*w;\\
&A\Rightarrow_R^*w.
\end{aligned}
$$

证明思路：任意成功推导都可以记录成树；给定树后，按最左或最右顺序展开即可恢复推导。因此，为了证明一个串能生成，可以专注于最左推导，表达能力不会减少。

### Ambiguity

如果存在某个 $w\in L(G)$，使它在同一个文法 $G$ 中拥有两棵不同的分析树，就称 $G$ 是**歧义文法（Ambiguous Grammar）**。

等价地，该字符串存在两条不同的最左推导，或两条不同的最右推导。

#### Ambiguous Arithmetic Expressions

考虑开始符号为 $E$ 的文法：

$$
E\to E+E\mid E*E\mid(E)\mid id.
$$

同一个字符串 `id+id*id` 可以对应两种结构：

- 根使用 $E\to E+E$，得到 $id+(id*id)$。
- 根使用 $E\to E*E$，得到 $(id+id)*id$。

上面的括号用于说明树的分组含义；两棵树实际产出的字符串都没有这些额外括号。因此，这个文法存在歧义。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261020143017.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>展开两条最左推导</summary>

以加法为根：

$$
E\Rightarrow E+E\Rightarrow id+E\Rightarrow id+E*E
\Rightarrow id+id*E\Rightarrow id+id*id.
$$

以乘法为根：

$$
E\Rightarrow E*E\Rightarrow E+E*E\Rightarrow id+E*E
\Rightarrow id+id*E\Rightarrow id+id*id.
$$

两次都始终展开最左侧非终结符，第一步使用的规则已经不同，所以确实对应两棵树。

</details>

#### Ambiguous Parentheses Grammar

文法 $S\to e\mid SS\mid(S)$ 本身也有歧义。最简单的例子是空串：

$$
S\Rightarrow e,
\qquad
S\Rightarrow SS\Rightarrow S\Rightarrow e.
$$

第二个推导可以选择每次消去最左侧的 $S$；两棵树分别使用一个、两个产生空串的子分支。

作为补充，可给出以下等价无歧义文法：

$$
S\to e\mid(S)S.
$$

对非空合法括号串，第一个左括号的匹配位置唯一确定分解 $(x)y$，再递归处理 $x,y$，就得到唯一的树结构。

**文法歧义是某个表示的性质；固有歧义是语言的性质。** 若一个 CFL 的所有 CFG 表示都存在歧义，称它具有固有歧义。一个具体文法有歧义，尚不能断言它的语言具有固有歧义。
