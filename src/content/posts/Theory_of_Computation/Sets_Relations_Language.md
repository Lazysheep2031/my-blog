---
title: Sets, Relations and Languages
published: 2026-09-15
description: 集合与函数、二元关系、可数性、三种证明方法、闭包、字符串与语言，以及语言的有限表示与正则表达式
tags: [计算理论]
category: 笔记
draft: false
---

## Sets

### Elements, Sets, and Subsets

**集合（Set）** 是对象的无序汇集。元素的排列顺序与重复次数不影响集合：

$$
\{a,b,a\}=\{a,b\}=\{b,a\}.
$$

| 写法 | 含义 | 注意 |
| --- | --- | --- |
| $x\in A$ | $x$ 是 $A$ 的元素 | 比较一个对象与一个集合 |
| $A\subseteq B$ | $A$ 的每个元素都属于 $B$ | 允许 $A=B$ |
| $A\subsetneq B$ | $A\subseteq B$，且 $A\ne B$ | 真子集；也写作 $A\subset B$ |
| $A=B$ | 两个集合的元素完全相同 | 可分别证明 $A\subseteq B$ 与 $B\subseteq A$ |
| $\varnothing$ | 空集，没有元素 | 对任意 $A$，都有 $\varnothing\subseteq A$ |
| $\{a\}$ | 以 $a$ 为唯一元素的单元素集 | $a$ 与 $\{a\}$ 要区分 |

集合也可以作为元素，例如：

$$
\{3,\text{red},\{d,\text{blue}\}\}
$$

除列举元素外，还可以用条件描述集合：

$$
B=\{x\in A:x\text{ 满足性质 }P\}.
$$

> **空集与“包含空集的集合”不同。** $\varnothing$ 没有元素，$\{\varnothing\}$ 有一个元素。

<details>
<summary>元素关系与子集关系</summary>

$$
\varnothing\subseteq\varnothing\quad\text{成立},\qquad
\varnothing\in\varnothing\quad\text{不成立},\qquad
\varnothing\in\{\varnothing\}\quad\text{成立}.
$$

若 $S=\{a,b,\{a,b\}\}$，则 $\{a,b\}\in S$ 与 $\{a,b\}\subseteq S$ 同时成立：前者因为整个集合 $\{a,b\}$ 被列为一个元素，后者因为 $a,b$ 分别属于 $S$。

同时，$S-\{a,b\}=\{\{a,b\}\}$，结果保留的是一个集合元素。

</details>

### Set Operations and Identities

设 $A=\{1,3,9\}$，$B=\{3,5,7\}$。

| 运算 | 定义 | 例子 |
| --- | --- | --- |
| 并集 | $A\cup B=\{x:x\in A\text{ 或 }x\in B\}$ | $\{1,3,5,7,9\}$ |
| 交集 | $A\cap B=\{x:x\in A\text{ 且 }x\in B\}$ | $\{3\}$ |
| 差集 | $A-B=\{x:x\in A\text{ 且 }x\notin B\}$ | $\{1,9\}$ |
| 对称差 | $A\triangle B=(A-B)\cup(B-A)$ | $\{1,5,7,9\}$，只属于其中一个集合的元素 |
| 补集 | $\overline A=U-A$ | 全集中不属于 $A$ 的元素 |

若 $A\cap B=\varnothing$，称两个集合**不相交**。例如 $\{1,3,9\}\cap\{a,b,c,d\}=\varnothing$。


| 规律 | 恒等式 |
| --- | --- |
| 幂等律 | $A\cup A=A$；$A\cap A=A$ |
| 交换律 | $A\cup B=B\cup A$；$A\cap B=B\cap A$ |
| 结合律 | $(A\cup B)\cup C=A\cup(B\cup C)$；$(A\cap B)\cap C=A\cap(B\cap C)$ |
| 分配律 | $(A\cup B)\cap C=(A\cap C)\cup(B\cap C)$；$(A\cap B)\cup C=(A\cup C)\cap(B\cup C)$ |
| 吸收律 | $(A\cup B)\cap A=A$；$(A\cap B)\cup A=A$ |
| 德摩根律 | $A-(B\cup C)=(A-B)\cap(A-C)$；$A-(B\cap C)=(A-B)\cup(A-C)$ |

#### Example

**证明第一条德摩根律**

证明 $A-(B\cup C)=(A-B)\cap(A-C)$。


<details>
<summary>展开证明</summary>

记 $L=A-(B\cup C)$，$R=(A-B)\cap(A-C)$。

若 $x\in L$，则 $x\in A$，且 $x\notin B$、$x\notin C$。因此 $x\in A-B$ 且 $x\in A-C$，得到 $x\in R$，故 $L\subseteq R$。

反过来，若 $x\in R$，则 $x$ 同时属于 $A-B$、$A-C$。因此 $x\in A$，但 $x\notin B\cup C$，得到 $x\in L$，故 $R\subseteq L$。

两边互相包含，所以 $L=R$。

</details>

### Set Families and Power Sets

集合族 $\mathcal S$ 的元素本身是集合。对集合族做并、交，可以写成：

$$
\bigcup\mathcal S=\{x:\exists P\in\mathcal S,\ x\in P\},
\qquad
\bigcap\mathcal S=\{x:\forall P\in\mathcal S,\ x\in P\}.
$$

这里的交集讨论非空集合族；未指定全集时，不直接套用空集合族的交集。

例如，$\mathcal S=\{\{a,b\},\{b,c\},\{c,d\}\}$，则 $\bigcup\mathcal S=\{a,b,c,d\}$，$\bigcap\mathcal S=\varnothing$。若 $\mathcal S=\{\{n\}:n\in\mathbb N\}$，则 $\bigcup\mathcal S=\mathbb N$。

**幂集（Power Set）** 是一个集合的所有子集组成的集合，记作 $2^A$：

$$
2^A=\{B:B\subseteq A\}.
$$

例如：

$$
2^{\{c,d\}}=\{\varnothing,\{c\},\{d\},\{c,d\}\},
\qquad 2^{\varnothing}=\{\varnothing\}.
$$

若 $A$ 有 $n$ 个元素，则 $2^A$ 有 $2^n$ 个元素。

### Partitions

非空集合 $A$ 的一个**划分（Partition）**，是满足下列条件的集合族 $\Pi\subseteq 2^A$：

$$
\varnothing\notin\Pi,\qquad
S,T\in\Pi\text{ 且 }S\ne T\Rightarrow S\cap T=\varnothing,\qquad
\bigcup\Pi=A.
$$

**每块非空，且 $A$ 中每个元素恰好属于一块。**

例如，$\{\{a,b\},\{c\},\{d\}\}$ 是 $\{a,b,c,d\}$ 的划分；$\{\{b,c\},\{c,d\}\}$ 既重复包含 $c$，又遗漏 $a$，不满足要求。偶自然数集合与奇自然数集合组成 $\mathbb N$ 的一个划分。

## Relations and Functions

### Ordered Pairs, Cartesian Products, and Relations

**有序对（Ordered Pair）** 保留位置：

$$
(a,b)=(c,d)\iff a=c\text{ 且 }b=d.
$$

当 $a\ne b$ 时，$(a,b)\ne(b,a)$；也允许 $(a,a)$。这与集合的无序性、去重性质不同。

**笛卡尔积（Cartesian Product）** 列出两个集合之间所有可能的有序配对：

$$
A\times B=\{(a,b):a\in A,\ b\in B\}.
$$
**Example:**
$$
\begin{aligned}
\{1,3,9\}\times\{b,c,d\}=\{& (1,b),(1,c),(1,d),\\
&(3,b),(3,c),(3,d),\\
&(9,b),(9,c),(9,d)\}.
\end{aligned}
$$

$A$ 与 $B$ 上的**二元关系（Binary Relation）** 就是 $A\times B$ 的一个子集：

$$
R\subseteq A\times B.
$$

例如，$\{(1,b),(1,c),(3,d),(9,d)\}$ 是上述笛卡尔积中的一个关系。

“小于”也可以写成关系 $\{(i,j)\in\mathbb N^2:i<j\}$。

**关系负责从全部可能的配对中，选出满足指定条件的配对。**

:::TIP
有序 $n$ 元组为 $(a_1,\ldots,a_n)$，$n$ 元关系是 $A_1\times\cdots\times A_n$ 的子集。若各集合相同，乘积记作 $A^n$。元组的长度、位置和嵌套结构都需要保留，因此 $(4,4)$、$(4,4,4)$、$((4,4),4)$、$(4,(4,4))$ 彼此不同。
:::

### Functions

**函数（Function）** $f:A\to B$ 是一个满足特殊条件的二元关系：

$$
f\subseteq A\times B,\qquad
\forall a\in A,\ \exists!b\in B,\ (a,b)\in f.
$$

记 $(a,b)\in f$ 为 $f(a)=b$。

**每个输入恰有一个输出；不同输入可以有相同输出。**

| 概念 | 含义 |
| --- | --- |
| 定义域 | $A$，允许输入的对象 |
| 目标集合 | $B$，输出必须落入的集合 |
| 元素的像 | $f(a)$ |
| 子集的像 | $f[A']=\{f(a):a\in A'\}$，其中 $A'\subseteq A$ |
| 值域 | $f[A]$，实际出现的所有输出；不必等于 $B$ |

若输入是元组，通常省去一层括号。例如 $f:\mathbb N^2\to\mathbb N$，$f(m,n)=m+n$。

### Injections, Surjections, and Bijections

| 类型 | 定义 | 检查方式 |
| --- | --- | --- |
| 单射（Injection） | $a\ne a'\Rightarrow f(a)\ne f(a')$ | 不同输入会不会合并到同一个输出？ |
| 满射（Surjection） | $\forall b\in B,\ \exists a\in A,\ f(a)=b$ | 是否覆盖整个目标集合 $B$？ |
| 双射（Bijection） | 同时是单射和满射 | 两边元素一一对应，无重复也无遗漏 |

证明单射时，也可以从 $f(a)=f(a')$ 推出 $a=a'$。

### Inverse Relations and Functions

对任意 $R\subseteq A\times B$，交换每个有序对的两个位置，得到**逆关系**：

$$
R^{-1}=\{(b,a):(a,b)\in R\}\subseteq B\times A.
$$

逆关系始终可以定义，但 $f^{-1}$ 要成为从整个 $B$ 到 $A$ 的函数，需要 $f:A\to B$ 是双射：单射保证反向输出唯一，满射保证每个 $b\in B$ 都有反向输出。

此时：

$$
f^{-1}(f(a))=a,\qquad f(f^{-1}(b))=b.
$$

> $\{a\in A:f(a)=b\}$ 写成 $f^{-1}(b)$，此时返回的是一个集合，可能为空或包含多个元素。要区分“集合值的逆像”与“双射的逆函数”。

<details>
<summary>自然同构与“关系变成集合值函数”</summary>

“自然同构”描述一种自然的一一对应；

$A\times B\times C$ 与 $(A\times B)\times C$ 通过

$$
(a,b,c)\longmapsto((a,b),c)
$$

一一对应。两种对象的括号结构不同，但信息可以无损互换。

将关系 $R\subseteq A\times B$ 对应到函数：

$$
f_R:A\to 2^B,\qquad f_R(a)=\{b\in B:(a,b)\in R\}.
$$

把 $a$ 关联的所有 $b$ 收为一个集合，即得到唯一的集合输出；没有关联对象时输出 $\varnothing$。

反过来，由 $f:A\to2^B$ 可以恢复关系：

$$
R_f=\{(a,b):b\in f(a)\}.
$$

因此，“$A$ 与 $B$ 上的所有关系”和“$A$ 到 $2^B$ 的所有函数”存在一一对应。

</details>

### Composition

若 $f:A\to B$、$g:B\to C$，先用 $f$，再用 $g$，得到 $h:A\to C$：

$$
A\xrightarrow{f}B\xrightarrow{g}C,
\qquad h(a)=g(f(a)).
$$

“狗 → 主人 → 主人的年龄”。

关系也可以这样复合：如果 $a$ 经第一个关系关联到某个 $b$，而 $b$ 经第二个关系关联到 $c$，就把 $(a,c)$ 放入复合关系。

> **复合记号**
>$Q\circ R=\{(a,c):\exists b,\ (a,b)\in Q\land(b,c)\in R\}$，即先 $Q$ 后 $R$；上述 $h$ 写作 $f\circ g$。


## Types of Binary Relations

### Graphs and Adjacency Matrices

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915112310.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

考虑 $R\subseteq A\times A$。用**有向图（Directed Graph）** 表示时，每个元素对应一个节点；$(a,b)\in R$ 对应一条从 $a$ 指向 $b$ 的边。$(a,a)$ 对应自环。这里不允许同一方向上的平行边。

**邻接矩阵（Adjacency Matrix）**。固定节点顺序 $a_1,\ldots,a_n$ 后，按关系定义写为：

$$
M_{ij}=\begin{cases}
1,&(a_i,a_j)\in R,\\
0,&(a_i,a_j)\notin R.
\end{cases}
$$

**行对应起点，列对应终点。** 一个对称且不含自环的关系，可以用无向图表示，把相反方向的两条边合为一条无向边。

### Basic Relation Properties

| 性质 | 定义 | 图上的含义 |
| --- | --- | --- |
| 自反（Reflexive） | $\forall a\in A,\ (a,a)\in R$ | 每个节点都有自环 |
| 对称（Symmetric） | $(a,b)\in R\Rightarrow(b,a)\in R$ | 每条边都有反向边 |
| 反对称（Antisymmetric） | $(a,b)\in R\land(b,a)\in R\Rightarrow a=b$ | 不同节点之间不能同时存在两个方向的边；允许自环 |
| 传递（Transitive） | $(a,b)\in R\land(b,c)\in R\Rightarrow(a,c)\in R$ | 能连续走两条边，就必须已有对应的直接边 |

> **反对称不等于“不是对称关系”。** 等号关系既对称又反对称；也有关系既不对称，又不反对称。
> “有相同父亲”具有自反性、对称性；“是父亲”具有反对称性；“是祖先”具有传递性。$\mathbb N$ 上的 $\le$ 同时自反、反对称、传递。

### Equivalence Relations and Classes

**等价关系（Equivalence Relation）** 同时满足自反、对称、传递。

元素 $a$ 所在的**等价类（Equivalence Class）** 为：

$$
[a]=\{b\in A:(a,b)\in R\}.
$$

#### Example

**模 7 同余**

在 $\mathbb N$ 上定义 $i\sim j$ 当且仅当 $7\mid(i-j)$。证明它是等价关系。

<details>
<summary>展开证明</summary>

**自反**：$i-i=0$ 是 7 的倍数。

**对称**：若 $i-j=7k$，则 $j-i=-7k$，仍是 7 的倍数。

**传递**：若 $i-j=7k$、$j-\ell=7m$，则 $i-\ell=7(k+m)$。

所以该关系是等价关系。按定义得到七个等价类：

$$
[r]=\{r,r+7,r+14,\ldots\},\qquad r=0,1,\ldots,6.
$$

例如，$[1]=[8]=[15]$。**等价类的名称可以选不同代表元，但表示同一块集合。**

</details>

#### Theorem: Equivalence Classes Form a Partition

非空集合 $A$ 上的等价关系 $R$，其所有不同等价类构成 $A$ 的划分。
<details>
<summary>展开证明</summary>

令 $\Pi=\{[a]:a\in A\}$。

**非空**：自反性给出 $aRa$，所以 $a\in[a]$。

**不同等价类不相交**：设 $c\in[a]\cap[b]$，则 $aRc$、$bRc$。由对称性和传递性得到 $aRb$、$bRa$。

对任意 $x\in[a]$，有 $aRx$；由 $bRa$ 与 $aRx$ 得 $bRx$，所以 $x\in[b]$，即 $[a]\subseteq[b]$。同理 $[b]\subseteq[a]$，故 $[a]=[b]$。

因此，**两个等价类只要有一个公共元素，就完全相同。**

**覆盖**：每个 $a\in A$ 都属于自己的等价类 $[a]$，所以 $\bigcup\Pi=A$。

</details>

反过来，给定划分 $\Pi$，定义“$a,b$ 在同一块中”即可得到等价关系。因此，**等价关系与划分可以相互确定**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915112928.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Orders and Extremal Elements

**偏序（Partial Order）** 同时满足自反、反对称、传递。用 $a\preceq b$ 表示 $(a,b)\in R$。

偏序不要求任意两个元素都可比较；若进一步满足

$$
\forall a,b\in A,\quad a\preceq b\text{ 或 }b\preceq a,
$$

就得到**全序（Total Order）**。

“祖先关系”在约定每个人也是自己的祖先后，成为偏序；不同支系的人未必可比较。自然数上的 $\le$ 是全序。

| 概念 | 条件 | 含义 |
| --- | --- | --- |
| 极小元素 $a$ | $b\preceq a\Rightarrow b=a$ | 没有严格位于它之前的元素 |
| 极大元素 $a$ | $a\preceq b\Rightarrow b=a$ | 没有严格位于它之后的元素 |
| 最小元素 $a$ | $\forall b\in A,\ a\preceq b$ | 它位于所有元素之前或与之相同 |
| 最大元素 $a$ | $\forall b\in A,\ b\preceq a$ | 它位于所有元素之后或与之相同 |

“极小”只排除更小者，不要求与所有其他元素可比较；“最小”提出了更强的要求。

:::NOTE
例如，将整除偏序限制在 $\{2,3,6\}$：令 $a\preceq b\iff a\mid b$。极小元素有 2、3 两个，最小元素不存在；6 同时是极大元素和最大元素。
:::

> **非空有限偏序至少有一个极小元素；由对偶定义也至少有一个极大元素。** 无限偏序没有这一保证，例如整数上的 $\le$ 没有极小元素。全序最多有一个极小元素；若存在，它也是最小元素。

### Paths and Cycles

满足 $(a_i,a_{i+1})\in R$ 的节点序列 $(a_1,\ldots,a_n)$ 称为从 $a_1$ 到 $a_n$ 的**路径（Path）**，其中 $n\ge1$。

**将路径长度定义为序列中的节点数 $n$。** 这条路径经过 $n-1$ 条边；下文有关长度的定理沿用此约定。

单节点序列 $(a)$ 也是路径，从 $a$ 到自身且不经过边。若 $a_1,\ldots,a_n$ 两两不同，且还有 $(a_n,a_1)\in R$，则构成**环（Cycle）**。

## Finite and Infinite Sets

### Cardinality and Bijections

集合 $A,B$ **等势（Equinumerous）**，表示存在双射 $f:A\to B$，记作 $|A|=|B|$。这里 $|A|$ 表示集合的**基数（Cardinality）**。

有限集的基数是元素个数；无限集也用双射比较大小。

#### Example

**17 的非负整数倍与完全平方数等势**

$$
f(17n)=n^2,\qquad n\in\mathbb N
$$

一一对应，所以两者等势。

| 类型 | 定义 |
| --- | --- |
| 有限集 | 与某个 $\{1,\ldots,n\}$ 等势；$n=0$ 时为空集 |
| 可数无限集 | 与 $\mathbb N$ 等势 |
| 可数集（Countable Set） | 有限集或可数无限集 |
| 不可数集（Uncountable Set） | 不是可数集的集合 |

基数比较的写法：若存在单射 $A\to B$，记 $|A|\le|B|$；若同时不等势，记 $|A|<|B|$。

**证明可数无限，关键是给出无遗漏的一一编号；证明不可数，关键是说明任何声称完整的编号都会遗漏对象。**

### Dovetailing

**交错枚举（Dovetailing）** : 将多个可数集合的枚举过程交错进行，

若 $A=\{a_0,a_1,\ldots\}$、$B=\{b_0,b_1,\ldots\}$、$C=\{c_0,c_1,\ldots\}$ 两两不交，可枚举为：

$$
a_0,b_0,c_0,a_1,b_1,c_1,a_2,b_2,c_2,\ldots
$$

这样不会因为一直枚举 $A$ 而永远轮不到 $B,C$。集合有交叠时，跳过已经列出的重复元素即可。

对于可数无限多个可数无限集，需要每轮只处理有限多个位置，并让各位置最终都被访问。由此得到：**可数无限多个可数无限集的并仍然可数无限。**

#### Example

**证明自然数对集合可数无限**

证明 $\mathbb N\times\mathbb N$ 与 $\mathbb N$ 等势。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915122254.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

按两个坐标的和分组：

$$
\begin{array}{c|l}
i+j&\text{依次列出}\\\hline
0&(0,0)\\
1&(0,1),(1,0)\\
2&(0,2),(1,1),(2,0)\\
3&(0,3),(1,2),(2,1),(3,0)\\
\vdots&\vdots
\end{array}
$$

每组有限，任意 $(i,j)$ 都会在和为 $i+j$ 的一组中出现。


<details>
<summary>展开双射公式与编号推导</summary>

令 $s=i+j$，编号从 0 开始。在和为 $s$ 的一组之前，已经有

$$
1+2+\cdots+s=\frac{s(s+1)}2
$$

个元素。本组从 $(0,s)$ 开始，$(i,j)$ 位于组内偏移 $i$ 的位置。因此：

$$
f(i,j)=\frac{(i+j)(i+j+1)}2+i
      =\frac{(i+j)^2+3i+j}{2}.
$$

不同组对应互不重叠的连续编号区间；同组中不同的 $i$ 对应不同编号，因此是单射。所有区间首尾相接，覆盖全部自然数，因此是满射。

</details>

### Infinite Sets and Proper Subsets

#### Example

**实数集是否比开区间更大？**

$|\mathbb R|>|(0,1)|$ 是否成立？**两者等势。**

<details>
<summary>展开双射构造</summary>

给出函数：

$$
f:\mathbb R\to(0,1),\qquad
f(x)=\frac{\arctan x}{\pi}+\frac12.
$$

$\arctan x$ 严格递增，值域为 $(-\pi/2,\pi/2)$，因此 $f$ 严格递增，值域恰为 $(0,1)$。

也可以直接写出逆函数，验证每个目标点恰好对应一个输入：

$$
f^{-1}(y)=\tan\!\left(\pi\left(y-\frac12\right)\right),\qquad 0<y<1.
$$

所以 $f$ 是双射，$|\mathbb R|=|(0,1)|$。区间是否有界与基数大小需要分别判断。

</details>

#### Example

**希尔伯特旅馆**

旅馆有编号 $1,2,3,\ldots$ 的无限多个房间，且全部住满。新来一位客人时，让原来住在 $n$ 号房的客人移到 $n+1$ 号房，腾出 1 号房给新客人。

### Continuum Hypothesis

讨论自然数与实数之间是否存在中间大小的无限集合。记

$$
|\mathbb N|=\aleph_0,\qquad |\mathbb R|=\mathfrak c.
$$

**连续统假设（Continuum Hypothesis）** 断言不存在集合 $A$ 满足 $\aleph_0<|A|<\mathfrak c$。

$\mathfrak c=2^{\aleph_0}$，在连续统假设成立时有 $\mathfrak c=\aleph_1$。

## Proof Techniques

### Mathematical Induction

**数学归纳法（Mathematical Induction）** 将无限多个命题的证明组织为“起点成立 + 从已有情形推出下一情形”。

形式为：若 $A\subseteq\mathbb N$ 满足

$$
0\in A,\qquad
\{0,1,\ldots,n\}\subseteq A\Rightarrow n+1\in A,
$$

则 $A=\mathbb N$。用于命题 $P(n)$ 时，写成：

**基础情形**：证明 $P(0)$；**归纳假设**：假设某个任意 $n\ge0$ 下，$P(0),\ldots,P(n)$ 都成立；**归纳步骤**：利用假设证明 $P(n+1)$。

归纳假设不能包含尚待证明的 $P(n+1)$。题目从其他整数开始时，基础情形也相应调整。

#### Example

**自然数求和**

证明对所有 $n\ge0$，

$$
1+2+\cdots+n=\frac{n(n+1)}2.
$$

<details>
<summary>展开证明</summary>

$n=0$ 时，左边是空和，取值为 0，右边也为 0。

假设结论对 $n$ 成立，则

$$
\sum_{i=1}^{n+1}i
=\frac{n(n+1)}2+(n+1)
=\frac{(n+1)(n+2)}2.
$$

这正是 $n+1$ 时的公式，因此结论对所有 $n\ge0$ 成立。

</details>

#### Example

**幂集的大小**

证明任意有限集合 $A$ 都满足 $|2^A|=2^{|A|}$。

<details>
<summary>展开证明：按是否包含一个固定元素分类</summary>

对 $|A|$ 归纳。

**基础情形**：$|A|=0$ 时，$A=\varnothing$，$2^A=\{\varnothing\}$，所以 $|2^A|=1=2^0$。

**归纳步骤**：设结论对大小为 $n$ 的集合成立。取 $|A|=n+1$，选一个 $a\in A$，令 $B=A-\{a\}$，则 $|B|=n$。

$A$ 的子集恰好分成两类：不含 $a$ 的子集组成 $2^B$；含 $a$ 的子集组成 $\{C\cup\{a\}:C\in2^B\}$。

两类互不相交，并通过“添入 $a$”一一对应。因此

$$
|2^A|=2|2^B|=2\cdot2^n=2^{n+1}.
$$

</details>

<details>
<summary>辨析：为什么“所有马同色”的归纳证明失效？</summary>

先假定任意 $n$ 匹马同色，再从 $n+1$ 匹马中分别去掉一匹，试图通过两组剩余马的共同成员连接颜色。

漏洞出现在 **$n=1$ 推向 $n=2$**：两组都只剩一匹马，并没有共同成员，无法推出这两匹马同色。

归纳步骤必须覆盖基础情形后的每一步；后面较大规模时论证可用，无法弥补最早断掉的一步。

</details>

### Pigeonhole Principle

**鸽巢原理（Pigeonhole Principle）**：若 $A,B$ 为有限集，且 $|A|>|B|$，则不存在从 $A$ 到 $B$ 的单射。

换句话说，只要函数 $f:A\to B$ 存在，就必有两个不同元素被映到同一个目标。

<details>
<summary>展开证明</summary>

对 $|B|$ 归纳。

**基础情形**：$|B|=0$，而 $|A|>|B|$，所以 $A$ 非空。从非空集合到空集的函数都不存在，更不可能存在单射。

**归纳步骤**：设结论在目标集合大小不超过 $n$ 时成立。现有 $|B|=n+1$，$|A|>|B|$，并假设给定函数 $f:A\to B$。

选取 $a\in A$。若已有 $a'\ne a$ 满足 $f(a')=f(a)$，结论成立。

否则 $a$ 是唯一映到 $f(a)$ 的元素。删去 $a$ 及 $f(a)$，得到限制函数

$$
g:A-\{a\}\to B-\{f(a)\}.
$$

仍有 $|A-\{a\}|>|B-\{f(a)\}|=n$。由归纳假设，$g$ 不是单射，所以 $f$ 也不是单射。

</details>

#### Example

**最短路径不需要重复节点**

设 $R$ 是有限集合 $A$ 上的关系。如果从 $a$ 到 $b$ 存在路径，则存在长度至多 $|A|$ 的路径。**此处长度按教材约定计节点数。**

<details>
<summary>展开证明：重复节点意味着可以删掉绕行</summary>

取一条节点数最少的路径 $(a_1,\ldots,a_n)$，其中 $a_1=a$、$a_n=b$。

若 $n>|A|$，把路径中的 $n$ 个位置映到 $A$ 中相应节点，由鸽巢原理存在 $i<j$，使得 $a_i=a_j$。

删掉两次出现之间的绕行，得到

$$
(a_1,\ldots,a_i,a_{j+1},\ldots,a_n).
$$

它仍是一条从 $a$ 到 $b$ 的路径；若 $j=n$，则直接在 $a_i=b$ 结束。新路径更短，与最短性矛盾。

因此最短路径至多包含 $|A|$ 个节点，即至多经过 $|A|-1$ 条边。

</details>

### Diagonalization

**对角化（Diagonalization）** 的核心构造是：**针对第 $i$ 个候选对象，在第 $i$ 个位置故意与它不同。** 这样得到的新对象不可能等于候选列表中的任何一个。

设 $R\subseteq A\times A$，定义各行对应的集合

$$
R_a=\{b\in A:(a,b)\in R\},
$$

以及对角集合

$$
D=\{a\in A:(a,a)\notin R\}.
$$

因为 $a\in D\iff a\notin R_a$，所以 **$D\ne R_a$ 对每个 $a\in A$ 都成立**。这一理由不依赖 $A$ 是否有限。

#### Example

**有限关系中的对角集合**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915123543.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

| 行 $x$ | 对应集合 $R_x$ | $x\in R_x$？ | $x\in D$？ |
| --- | --- | --- | --- |
| $a$ | $\{b,d\}$ | 否 | 是 |
| $b$ | $\{b,c\}$ | 是 | 否 |
| $c$ | $\{c\}$ | 是 | 否 |
| $d$ | $\{b,c,e,f\}$ | 否 | 是 |
| $e$ | $\{e,f\}$ | 是 | 否 |
| $f$ | $\{a,c,d,e\}$ | 否 | 是 |

因此 $D=\{a,d,f\}$。它与第 $a$ 行在元素 $a$ 上不同，与第 $b$ 行在元素 $b$ 上不同，以此类推。


#### Theorem: Uncountability of the Power Set of N

$2^{\mathbb N}$ 不可数。

<details>
<summary>展开对角化证明</summary>

假设所有自然数子集都能枚举为 $R_0,R_1,R_2,\ldots$，构造

$$
D=\{n\in\mathbb N:n\notin R_n\}.
$$

若把 $R_i$ 写成一行 0–1 序列，第 $n$ 位表示是否包含 $n$，则 $D$ 就是将对角线各位翻转后得到的集合。

对每个 $i$，$i\in D\iff i\notin R_i$，所以 $D\ne R_i$。但 $D\subseteq\mathbb N$，本应出现在列表中，矛盾。因此 $2^{\mathbb N}$ 不可数。

</details>

#### Example

**实数不可数**

使用十进制展开，证明 $(0,1)$ 无法枚举，从而实数集不可数。

<details>
<summary>展开证明</summary>

假设 $(0,1)$ 中所有实数都可列为 $r_1,r_2,\ldots$，并写成

$$
r_i=0.d_{i1}d_{i2}d_{i3}\cdots.
$$

构造 $r=0.d_1d_2d_3\cdots$，其中

$$
d_i=\begin{cases}
4,&d_{ii}\ne4,\\
5,&d_{ii}=4.
\end{cases}
$$

$r$ 的第 $i$ 位与 $r_i$ 的第 $i$ 位不同，因此 $r$ 不等于列表中的任何 $r_i$；同时 $0<r<1$，矛盾。

</details>

## Closures

### Closure Properties

设 $D$ 是讨论对象的全集，$R\subseteq D^{n+1}$ 是一条具有 $n$ 个输入、一个输出位置的关系。若 $B\subseteq D$ 满足

$$
b_1,\ldots,b_n\in B\ \land\ (b_1,\ldots,b_n,b_{n+1})\in R
\quad\Rightarrow\quad b_{n+1}\in B,
$$

就称 $B$ **对 $R$ 封闭（Closed under $R$）**。对一组这样的关系封闭，称为一个闭包性质。

**允许的规则以集合内元素为输入时，所有要求得到的结果也已经在集合内。**

| 例子 | 封闭性／闭包 |
| --- | --- |
| 自然数 | 对加法、乘法封闭；对减法不封闭，例如 $0-1\notin\mathbb N$ |
| 从 $\{0,1\}$ 出发，不断相加 | 得到的闭包是 $\mathbb N$ |
| 从 $\mathbb N$ 出发，不断相减 | 得到的闭包是整数集 $\mathbb Z$ |
| 从某人出发，不断加入已有成员的父母 | 得到包含本人在内的祖先集合 |

若给定初始集合 $A\subseteq D$，它在这些规则下的**闭包（Closure）** 是：**包含 $A$、满足指定封闭性，并且没有多余元素的最小集合。** 

*封闭性描述一个集合是否已经满足规则；闭包描述从指定初始集合出发需要补全成什么。*

### Existence and Uniqueness of Closures

**存在且唯一**

对任意由上述关系定义的闭包性质 $P$，以及 $A\subseteq D$，存在唯一最小的 $B$，使得 $A\subseteq B$ 且 $B$ 满足 $P$。

<details>
<summary>展开证明</summary>

令

$$
\mathcal S=\{C\subseteq D:A\subseteq C,\ C\text{ 满足 }P\},
\qquad B=\bigcap\mathcal S.
$$

$D$ 本身就是候选集合，所以 $\mathcal S$ 非空。

所有候选集合都包含 $A$，因此 $A\subseteq B$。若规则所需的输入都在 $B$ 中，就都在每个 $C\in\mathcal S$ 中；每个候选集合对该规则封闭，于是规则要求的输出也在每个 $C$ 中，故在 $B$ 中。因此 $B$ 满足 $P$。

最后，$B$ 包含于每个候选集合，因而它是最小者，也不可能有另一个不同的最小者。

</details>

### Transitive and Reflexive Transitive Closures

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915125602.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

对 $R\subseteq A\times A$，令 $I_A=\{(a,a):a\in A\}$。

| 闭包 | 要满足的性质 | 图上的含义 |
| --- | --- | --- |
| 自反闭包 | 自反 | $R\cup I_A$ |
| 对称闭包 | 对称 | $R\cup R^{-1}$ |
| 传递闭包 $R^+$ | 传递 | 加入原图中通过至少一条边可达的有序对 |
| 自反传递闭包 $R^*$ | 自反、传递 | 允许不经过边的到自身路径，故 $R^*=R^+\cup I_A$ |

$$
R\subseteq R^+,\qquad R^+\text{ 传递},\qquad
R\subseteq Q\text{ 且 }Q\text{ 传递}\Rightarrow R^+\subseteq Q.
$$
#### Example

若 $A=\{a,b,c\}$，$R=\{(a,b),(b,c)\}$，则

$$
R^+=\{(a,b),(b,c),(a,c)\},\qquad
R^*=R^+\cup\{(a,a),(b,b),(c,c)\}.
$$

<details>
<summary>展开证明：为什么“所有可达对”恰好是自反传递闭包？</summary>

令 $S=\{(a,b):\text{在 }R\text{ 中存在从 }a\text{ 到 }b\text{ 的路径}\}$，允许单节点路径。

原有边给出路径，所以 $R\subseteq S$；单节点路径保证自反；两段路径可以接起来，保证传递。

再取任意包含 $R$ 的自反、传递关系 $Q$。对一条 $R$ 中的路径逐步使用传递性，其起点到终点的有序对必在 $Q$ 中；单节点路径对应的有序对由自反性保证。因此 $S\subseteq Q$。

$S$ 满足所有条件且包含于每个候选关系，故 $S=R^*$。

</details>

### Closure Algorithms and Complexity

三个求有限关系 $R^*$ 的算法。令 $n=|A|$，把检查、插入一个有序对视为基本操作。

| 方法 | 核心思路 | 时间上界 |
| --- | --- | --- |
| 枚举路径 | 检查节点数不超过 $n$ 的所有序列 | $O(n^{n+1})$ |
| 反复补边 | 找到一处传递性缺口，就补边并重新搜索 | $O(n^5)$ |
| 按中间节点处理 | 依次允许 $a_1,\ldots,a_n$ 作为路径中间节点 | $O(n^3)$ |

<details>
<summary>展开增长阶定义与例子</summary>

定义：对于 $f,g:\mathbb N\to\mathbb N$，若存在正整数常数 $c,d$，使对所有 $n\in\mathbb N$ 有

$$
g(n)\le c f(n)+d,
$$

则 $g\in O(f)$。

当 $f\in O(g)$ 且 $g\in O(f)$ 时，将它们视为同一增长阶。这个关系具有自反性、对称性、传递性，因而也是一个等价关系。例如，若

$$
f(n)\le c g(n)+d,\qquad g(n)\le c'h(n)+d',
$$

就有 $f(n)\le cc'h(n)+(cd'+d)$，给出所需的传递性。

$$
31n^2+17n+3\le48n^2+3,
$$

而 $n^2\le31n^2+17n+3$，因此两者同阶。多项式例子假定系数非负、最高次系数为正；同次多项式同阶，次数更高的增长更快。

每个固定次数的多项式都属于 $O(2^n)$，反方向不成立。比较

$$
1{,}000{,}000n,\qquad 10n^3,\qquad 2^n
$$

时，小规模输入的大小顺序可能与最终的增长顺序不同。**增长阶关心规模扩大后的表现，常数很大不代表增长一定更快。**

</details>

<details>
<summary>展开三个算法、正确性要点与共同例子</summary>

**枚举路径。** 从空关系 $C$ 出发，枚举 $A^1,A^2,\ldots,A^n$ 中的全部序列；若 $(b_1,\ldots,b_i)$ 是路径，就把 $(b_1,b_i)$ 加入 $C$。单节点路径会补入所有自环。

最短路径定理保证节点数不超过 $n$ 已足够覆盖所有可达对。候选序列数不超过 $1+n+\cdots+n^n$，每个至多检查 $n$ 次，故得到 $O(n^{n+1})$ 上界。

**反复补边。**

```text
C ← R ∪ I_A
只要存在 a_i, a_j, a_k，使
    (a_i,a_j) ∈ C 且 (a_j,a_k) ∈ C，但 (a_i,a_k) ∉ C：
    将 (a_i,a_k) 加入 C
    从头搜索下一处缺口
返回 C
```

至多补入 $n^2$ 个有序对，每次搜索检查至多 $n^3$ 个三元组，总上界为 $O(n^5)$。

正确性需要两面：终止时已经自反、传递且包含 $R$；每条新增边又来自原图中真实路径的拼接，因此不会超出 $R^*$。

**按中间节点处理。**

```text
C ← R ∪ I_A
for j = 1, ..., n:
    for i = 1, ..., n:
        for k = 1, ..., n:
            if (a_i,a_j) ∈ C and (a_j,a_k) ∈ C:
                将 (a_i,a_k) 加入 C
返回 C
```

最外层枚举的是**中间节点 $a_j$**。将路径中间节点的最大编号称为路径的秩；无中间节点的路径秩为 0。

归纳不变式：第 $j$ 轮结束时，$C$ 恰好包含那些存在一条路径、且路径中间节点都来自 $\{a_1,\ldots,a_j\}$ 的有序对。

第 $j$ 轮中新允许的路径可以在 $a_j$ 处分成两段，两段内部只用编号更小的中间节点，因而前一轮已经知道两端分别可达 $a_j$。反过来，通过 $a_j$ 拼接也只会形成允许的路径。出现重复节点时，先删去绕行即可。

最后 $j=n$ 覆盖全部路径，三层循环给出 $O(n^3)$ 上界。这一算法归于 Warshall。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260915130404.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

$$
a_1\to a_4\to a_3\to a_2.
$$

反复补边法依次加入 $(a_1,a_3)$、$(a_1,a_2)$、$(a_4,a_2)$；Warshall 算法在 $j=3$ 时加入 $(a_4,a_2)$，在 $j=4$ 时加入其余两对。加上初始化的自环，两者得到同一闭包。

</details>

<details>
<summary>展开一般有限闭包的计算</summary>

将反复补边推广为：从 $B=A$ 开始，只要某条规则的全部输入已在 $B$ 中、输出尚未加入，就把该输出加入 $B$；直到没有任何规则需要新增元素。

若 $D$ 有 $n$ 个元素，每次成功迭代至少增加一个元素，成功迭代次数至多为 $n$。每次全量检查 $k$ 个关系、每个关系的元数至多为 $r$，朴素扫描给出 $O(k n^r)$ 的单轮上界，因此总上界为 $O(k n^{r+1})$。固定 $k,r$ 时就是多项式时间；对固定关系组给出 $O(n^{r+1})$。

终止时满足所有规则，且只加入规则要求的结果，因此得到最小闭包。**多项式上界以规则数和元数固定为前提。**

</details>

## Alphabets, Strings, and Languages

### Alphabets and Strings

**字母表（Alphabet）** $\Sigma$ 是有限的符号集合，例如 $\{0,1\}$、$\{a,b,\ldots,z\}$。

**字符串（String）** 是字母表中符号组成的有限序列。顺序与重复次数都要保留，因此 `ab` 与 `ba` 不同，`a` 与 `aa` 也不同。

| 记号 | 含义 | 例子 |
| --- | --- | --- |
| $e$ | 空串，没有任何符号 | $e$ |
| $\lvert w\rvert$ | 字符串长度 | $\lvert101\rvert=3$，$\lvert e\rvert=0$ |
| $\Sigma^n$ | 所有长度为 $n$ 的字符串 | $\{0,1\}^2=\{00,01,10,11\}$ |
| $\Sigma^*$ | 所有有限长度字符串，包括空串 | $\bigcup_{n\ge0}\Sigma^n$ |

符号 $a$ 与长度为 1 的字符串 `a`，通常不作区分。一个字符串也可以看作位置到符号的函数 $w:\{1,\ldots,|w|\}\to\Sigma$。

例如，`accordion` 的第 2、3 个位置都是 `c`：它们是同一个符号的两次**出现**，位置不同。若 $|\Sigma|=k$，长度恰为 $n$ 的字符串共有 $k^n$ 个。

**每个字符串都有限长，但允许的长度没有统一上限，因而字符串的全体可以无限。**

### Concatenation, Substrings, Prefixes, and Suffixes

字符串的**连接（Concatenation）** $xy$ 或 $x\circ y$，表示先写 $x$，再写 $y$。例如：

$$
01\circ001=01001,\qquad
\text{beach}\circ\text{boy}=\text{beachboy}.
$$

它满足：

$$
|xy|=|x|+|y|,\qquad xe=ex=x,\qquad (xy)z=x(yz).
$$

连接满足结合律，一般不满足交换律，例如 `ab` 与 `ba` 不同。

| 概念 | 条件 | 例子 |
| --- | --- | --- |
| 子串（Substring） | $w=xvy$ | `road` 是 `broader` 的子串 |
| 前缀（Prefix） | $w=vy$ | `road` 是 `roadrunner` 的前缀 |
| 后缀（Suffix） | $w=xv$ | `road` 是 `abroad` 的后缀 |

这里 $x,y$ 可以为空串，所以 $e$ 与 $w$ 自身都是 $w$ 的子串，也都是其前缀、后缀。

**子串对应连续的一段位置；同一子串的多次出现允许重叠。** `ababab` 中，`ab` 出现 3 次，`abab` 出现 2 次。

### String Powers and Reversal

字符串的幂通过归纳定义：

$$
w^0=e,\qquad w^{i+1}=w^i w\quad(i\ge0).
$$

例如 $(\text{do})^2=\text{dodo}$。这里表示重复连接，不涉及数值乘方。

**反转（Reversal）** $w^R$ 将符号顺序倒过来。归纳定义为：

$$
e^R=e,\qquad (ua)^R=au^R\quad(a\in\Sigma).
$$

例如 $\text{reverse}^R=\text{esrever}$。

#### Example

**连接后的反转**

证明对任意字符串 $w,x$，

$$
(wx)^R=x^Rw^R.
$$

**反转同时改变每个串内部的顺序与两个串的先后顺序。** 例如 $(\text{dogcat})^R=\text{tacgod}$。

<details>
<summary>展开归纳证明</summary>

对 $|x|$ 归纳，并让命题对任意 $w$ 成立。

**基础情形**：$x=e$，$(we)^R=w^R=e^Rw^R$。

**归纳步骤**：设结论对长度不超过 $n$ 的 $x$ 成立。对 $|x|=n+1$，写 $x=ua$，其中 $|u|=n$、$a\in\Sigma$，则

$$
\begin{aligned}
(wx)^R
&=(wua)^R\\
&=a(wu)^R &&\text{反转定义}\\
&=au^Rw^R &&\text{归纳假设}\\
&=(ua)^Rw^R\\
&=x^Rw^R.
\end{aligned}
$$

</details>

### Languages

字母表 $\Sigma$ 上的**语言（Language）** 是 $\Sigma^*$ 的任意子集：

$$
L\subseteq\Sigma^*.
$$

$\varnothing$、$\Sigma$、$\Sigma^*$ 都是语言。有限语言可以逐项列出；无限语言通常描述为 $L=\{w\in\Sigma^*:w\text{ 满足性质 }P\}$。

| 语言 | 含义 |
| --- | --- |
| $\{ab,aabb,aaabbb,\ldots\}=\{a^nb^n:n\ge1\}$ | 先有若干个 $a$，再有同样多个 $b$；取 $n\ge1$ |
| $\{0,01,011,0111,\ldots\}$ | 一个 0 后接任意多个 1 |
| $\{w\in\{0,1\}^*:w\text{ 的 0、1 数量相等}\}$ | 只限制数量，不限制排列方式 |
| $\{w\in\Sigma^*:w=w^R\}$ | 回文串组成的语言 |

**语言是否有限，看它有多少个字符串；字符串长度是否有限，看一个字符串有多少个符号。**

### Enumerating Strings

对**非空有限字母表** $\Sigma\ne\varnothing$，$\Sigma^*$ 可数无限。

枚举规则是：**先按长度从小到大，同长度再按字典序排列。** 对 $\Sigma=\{0,1\}$，得到：

$$
e,0,1,00,01,10,11,000,001,010,011,100,101,110,111,\ldots
$$

每个长度只有有限多个串，每个有限串都能在有限位置出现，且没有重复。由于 $\Sigma$ 非空，串长可以任意增大，所以集合确实无限。

> 空字母表，则 $\varnothing^*=\{e\}$，是有限集合。

### Set Operations and Language Concatenation

语言可以使用并、交、差等集合运算。给定字母表后，补语言相对于 $\Sigma^*$：

$$
\overline L=\Sigma^*-L.
$$

语言的连接定义为：

$$
L_1L_2=\{xy:x\in L_1,\ y\in L_2\}.
$$

注意：$xy$ 是字符串，$L_1L_2$ 是语言。

#### Example

**连接后恰好得到含奇数个 0 的串**

设

$$
\begin{aligned}
L_1&=\{w\in\{0,1\}^*:w\text{ 含偶数个 }0\},\\
L_2&=\{01^k:k\ge0\}.
\end{aligned}
$$

则 $L_1L_2=\{w:w\text{ 含奇数个 }0\}$。

<details>
<summary>展开证明</summary>

**从连接结果出发**：$x\in L_1$ 含偶数个 0，$y\in L_2$ 恰含一个 0，所以 $xy$ 含奇数个 0。

**从任意目标串出发**：设 $w$ 含奇数个 0。在它的最后一个 0 之前切开，写成

$$
w=x\,01^k.
$$

前段 $x$ 的 0 数量比整个 $w$ 少一个，因而为偶数；后段从最后一个 0 开始，余下符号全为 1，因而属于 $L_2$。所以 $w\in L_1L_2$。

</details>

### Language Powers, Kleene Star, and Positive Closure

语言的幂也按连接定义：

$$
L^0=\{e\},\qquad L^{i+1}=LL^i.
$$

**$L^0$ 中仍有一个元素，即空串。** 这与字符串的 $w^0=e$ 所处的对象层次不同。

**克林星闭包（Kleene Star）** 允许从 $L$ 中选取零个或多个字符串连接：

$$
L^*=\bigcup_{i\ge0}L^i
=\{w_1\cdots w_k:k\ge0,\ w_1,\ldots,w_k\in L\}.
$$

**正闭包**要求至少选取一个：

$$
L^+=\bigcup_{i\ge1}L^i=LL^*.
$$

例如，取 $L=\{01,1,100\}$，则

$$
110001110011
=1\circ100\circ01\circ1\circ100\circ1\circ1\in L^*.
$$

每一块都来自 $L$，选取次数不限，也允许重复选取同一个串。

| 情形 | 结果 | 原因 |
| --- | --- | --- |
| 任意 $L$ | $e\in L^*$ | 可以选择零个串 |
| $L=\varnothing$ | $L^*=\{e\}$，$L^+=\varnothing$ | 没有串可选，但零次连接仍可形成空串 |
| $L=\{e\}$ | $L^*=L^+=\{e\}$ | 任意次连接空串仍为空串 |
| $e\notin L$ | $L^+=L^*-\{e\}$ | 至少连接一个非空串，长度为正 |
| $e\in L$ | $L^+=L^*$ | 一次选取空串就可以生成 $e$ |

因此，**“正闭包”中的“正”指选取次数至少为 1，不保证生成的串非空。**

两个层次之间的联系：$L^+$ 是包含 $L$ 且对字符串连接封闭的最小语言；$L^*$ 还要求包含空串。将字母表 $\Sigma$ 看成由单符号串组成的语言，做星闭包恰好得到此前定义的所有字符串 $\Sigma^*$。

#### Example

**0、1 数量不等的语言，其星闭包是什么？**

设 $L=\{w\in\{0,1\}^*:w\text{ 中的 0、1 数量不相等}\}$。则

$$
L^*=\{0,1\}^*.
$$

<details>
<summary>展开证明</summary>

单字符 `0` 和 `1` 各自都满足“数量不等”，所以 $\{0,1\}\subseteq L$。

任何二进制串都可以拆成单字符后连接，因此属于 $L^*$；空串通过零次连接得到。故 $\{0,1\}^*\subseteq L^*$。

反方向，$L$ 中各串只含 0、1，连接后也只含 0、1，所以 $L^*\subseteq\{0,1\}^*$。

也可以使用单调性：$L_1\subseteq L_2\Rightarrow L_1^*\subseteq L_2^*$。

</details>

### Empty Language, Empty String, and Singleton Language

| 对象 | 类型 | 大小／长度 |
| --- | --- | --- |
| $\varnothing$ | 一个没有任何字符串的语言 | $\lvert\varnothing\rvert=0$ |
| $e$ | 一个字符串 | $\lvert e\rvert=0$ |
| $\{e\}$ | 只包含空串的语言 | $\lvert\{e\}\rvert=1$ |

由连接与星闭包的定义得到关键性质：

$$
L\varnothing=\varnothing L=\varnothing,\qquad
L\{e\}=\{e\}L=L,\qquad
\varnothing^*=\{e\},\qquad
(L^*)^*=L^*.
$$

连接 $\varnothing$ 时无法从该集合选出任何一个串；连接 $\{e\}$ 时可以选出空串，且不改变另一部分。对已经允许任意有限次连接的 $L^*$ 再做星闭包，也不会产生新串。

## Finite Representations of Languages

### Limits of Finite Representations

有限语言可以逐项列出；无限语言虽然不能全部列出，却可能由一个有限规则描述，例如 $\{a^nb^n:n\ge1\}$。

一套固定的有限表示方式需要满足：表示本身是有限符号串；每个有效表示确定一个语言。一个语言可以有多个表示，但同一个表示不能同时含混地代表不同语言。

对于非空有限字母表 $\Sigma$，论证链为：

$$
\underbrace{\text{有限描述的全体至多可数}}_{\text{描述是有限字符串}}
\qquad\text{而}\qquad
\underbrace{\text{语言的全体 }2^{\Sigma^*}\text{ 不可数}}_{\Sigma^*\text{ 可数无限}}.
$$

因此，**任何这样固定的有限表示体系，都只能描述至多可数多个语言，无法覆盖全部语言。** 换用更强的表示方法，可以扩大可表示的范围，但不会消除这一数量限制。

**每个语言 $L\subseteq\Sigma^*$ 至多可数，但所有语言组成的集合 $2^{\Sigma^*}$ 不可数。**

<details>
<summary>所有语言不可数：对角化</summary>

设 $\Sigma^*=\{w_0,w_1,\ldots\}$。若所有语言可枚举为 $L_0,L_1,\ldots$，令

$$
D=\{w_i:w_i\notin L_i\}.
$$

$D$ 是语言，却对每个 $i$ 都与 $L_i$ 在是否包含 $w_i$ 上不同，故不在列表中，矛盾。这是前面对 $2^{\mathbb N}$ 的证明在字符串集合上的应用。

</details>

### Regular Expression Syntax and Semantics

**正则表达式（Regular Expression）** 使用基本符号以及并、连接、星运算，有限地描述语言。

将“表达式这个符号串”与“表达式表示的语言”分开，用 $\mathcal L(\alpha)$ 表示表达式 $\alpha$ 对应的语言。

| 构造规则 | 表达式的语言含义 |
| --- | --- |
| 空语言符号 $\varnothing$ 是表达式 | $\mathcal L(\varnothing)=\varnothing$ |
| 每个 $a\in\Sigma$ 是表达式 | $\mathcal L(a)=\{a\}$ |
| 若 $\alpha,\beta$ 是表达式，则 $(\alpha\beta)$ 是表达式 | $\mathcal L(\alpha\beta)=\mathcal L(\alpha)\mathcal L(\beta)$ |
| 若 $\alpha,\beta$ 是表达式，则 $(\alpha\cup\beta)$ 是表达式 | $\mathcal L(\alpha\cup\beta)=\mathcal L(\alpha)\cup\mathcal L(\beta)$ |
| 若 $\alpha$ 是表达式，则 $\alpha^*$ 是表达式 | $\mathcal L(\alpha^*)=\mathcal L(\alpha)^*$ |

**只有能通过这些规则有限次构造出来的符号串，才属于本节定义的正则表达式。** 这是一种归纳定义。

空串不必额外列为基础表达式，因为 $\varnothing^*$ 已经表示 $\{e\}$；下面在表达式中写 $e$ 时，作为 $\varnothing^*$ 的简写。

为了减少括号，以下按**星号先作用，其次连接，最后取并**来理解省略括号的表达式。连接和并的结合律也允许省去部分括号。

#### Examples

| 表达式 | 表示的字符串集合 |
| --- | --- |
| $a^*b^*$ | 任意多个 $a$ 后接任意多个 $b$，两部分都可为空 |
| $a^*\cup b^*$ | 全为 $a$ 的串，或全为 $b$ 的串；包含空串 |
| $a(a^*\cup b^*)$ | 一个 $a$ 后面接全 $a$ 串或全 $b$ 串 |
| $(a^*\cup b^*)a(a^*\cup b^*)$ | 中间选一个 $a$；它左、右两侧各自独立选择全 $a$ 串或全 $b$ 串 |
| $aaaaa^*$ | 四个固定的 $a$ 后接 $a^*$，即 $\{a^n:n\ge4\}$ |

例如，`ab` 属于 $a^*b^*$，却不属于 $a^*\cup b^*$。最后一行中的星号只作用于紧邻的最后一个 $a$；若要把整个块重复，需要括号。

### Example

**恰有两三个 1，且前两个 1 不相邻**

表示：

$$
L=\{w\in\{0,1\}^*:w\text{ 恰有两个或三个 }1,\text{ 且前两个 }1\text{ 不相邻}\}.
$$

<details>
<summary>展开</summary>

表达式为

$$
0^*10^*010^*(10^*\cup\varnothing^*).
$$

按结构分解为：

$$
\underbrace{0^*}_{\text{开头任意多个 0}}
\underbrace{1}_{\text{第一个 1}}
\underbrace{0^*0}_{\text{至少一个 0}}
\underbrace{1}_{\text{第二个 1}}
\underbrace{0^*}_{\text{随后任意多个 0}}
\underbrace{(10^*\cup\varnothing^*)}_{\text{第三个 1 可选}}.
$$

末尾选 $\varnothing^*$ 或 $10^*$，分别得到两个或三个 1；$0^*0$ 保证前两个 1 不相邻。

因此 `101`、`1011`、`010010` 属于该语言；`11` 的前两个 1 相邻，`10111` 含四个 1，均不属于。

能否改为

$$
0^*10^*010^*((10^*)^*\cup\varnothing^*)\ ?
$$

</details>

### Example

**从表达式读出语言**

#### Strings Ending in a

求 $\mathcal L((a\cup b)^*a)$。

<details>
<summary>展开按语义函数计算</summary>

$$
\begin{aligned}
\mathcal L((a\cup b)^*a)
&=\mathcal L((a\cup b)^*)\mathcal L(a)\\
&=(\mathcal L(a)\cup\mathcal L(b))^*\{a\}\\
&=(\{a\}\cup\{b\})^*\{a\}\\
&=\{a,b\}^*\{a\}\\
&=\{w\in\{a,b\}^*:w\text{ 以 }a\text{ 结尾}\}.
\end{aligned}
$$

任意前缀后接一个 $a$，因此包含 `a`，不包含空串。

</details>

#### Strings Without ac

表达式

$$
c^*(a\cup bc^*)^*
$$

表示 $\{a,b,c\}$ 上所有**不含子串 `ac`** 的字符串。

<details>
<summary>展开双向说明</summary>

**正向**：开头为 $c^*$，其后各块为 $a$ 或 $bc^*$；$a$ 后只能结束或接下一块的 $a,b$，不会出现 `ac`。

**反向**：去掉开头的 $c$ 后，每段连续的 $c$ 都必须紧跟 $b$，所以余串可拆成 $a$ 或 $bc^*$。

例如 `ccabcc` 可拆为 `cc`、`a`、`bcc`；`aac` 含有 `ac`，不能生成。空串也在该语言中。

</details>

#### Strings Without 111


$$
0^*\ \cup\ 0^*(1\cup11)\bigl(00^*(1\cup11)\bigr)^*0^*.
$$

第一项处理完全没有 1 的串。第二项把 1 划成长度为 1 或 2 的连续块，相邻块之间至少一个 0，首尾允许任意多个 0，因此恰好排除三个连续的 1。

### Regular Expression Identities

下表中的等号均指**所表示的语言相等**，不要求表达式的符号串相同。

| 规律 | 等式／含义 |
| --- | --- |
| 并的交换律 | $R\cup S=S\cup R$ |
| 连接的结合律 | $R(ST)=(RS)T$ |
| 连接对并的分配律 | $R(S\cup T)=RS\cup RT$；$(R\cup S)T=RT\cup ST$ |
| 空语言的星闭包 | $\varnothing^*=\{e\}$ |
| 星闭包的幂等性 | $(R^*)^*=R^*$ |
| 两组串反复连接 | $(R^*S^*)^*=(R\cup S)^*$ |
| 增加空串不改变星闭包 | $(\{e\}\cup R)^*=R^*$ |

**连接一般没有交换律。** 从定义看，特定的 $R,S$ 完全可能满足 $SR=RS$，例如 $R=S$。

<details>
<summary>展开证明：为什么两组星闭包再连接，与并后取星闭包相同？</summary>

证明 $(R^*S^*)^*=(R\cup S)^*$。

左边任意字符串，都由若干块 $R^*S^*$ 连接得到。把每块进一步拆开，其组成部分均来自 $R$ 或 $S$，所以属于 $(R\cup S)^*$。

反过来，$R\subseteq R^*S^*$，因为可以从 $S^*$ 取空串；同样 $S\subseteq R^*S^*$。所以 $R\cup S\subseteq R^*S^*$，再利用星闭包的单调性即可得到另一包含方向。

这里外层星号很重要。直接写成 $R^*\cup S^*=(R\cup S)^*$ 一般不成立：取 $R=\{a\}$、$S=\{b\}$，右边包含 `ab`，左边不包含。

</details>

### Regular Languages and Expressive Limits

能够被某个正则表达式表示的语言称为**正则语言（Regular Language）**：

$$
L\text{ 正则}\iff\exists\alpha,\quad L=\mathcal L(\alpha).
$$

也可以从闭包角度理解：正则语言的全体由基础语言族

$$
\{\{a\}:a\in\Sigma\}\cup\{\varnothing\}
$$

在**并、连接、星闭包**这三种操作下生成。这里操作的对象已经是语言，最后得到的是一个语言族。

**同一个正则语言可以有无限多个正则表达式。** 例如 $\alpha$、$(\alpha\cup\varnothing)$、$((\alpha\cup\varnothing)\cup\varnothing)$ 等都表示相同语言。这不违背有限表示的要求：要求的是一个表示不能同时歧义地指向不同语言。

正则表达式的表达能力有限，例如 $\{0^n1^n:n\ge0\}$ 不能由正则表达式描述。

### Language Recognition and Generation

语言的有限表示分为两种重要思路：

| 方式 | 输入／出发点 | 要回答的问题 |
| --- | --- | --- |
| 语言识别装置 | 给定一个字符串 $w$ | $w$ 是否属于 $L$？ |
| 语言生成器 | 给定生成规则，并按规则选择 | 如何生成且只生成 $L$ 中的字符串？ |

#### Example

**检查是否出现 111**

逐字符扫描说明如何识别“不含 `111`”的二进制串：

```text
count ← 0
从左向右读取输入的每个字符：
    如果读到 0：count ← 0
    如果读到 1：count ← count + 1
    如果 count = 3：回答“不属于”，结束
读完整个字符串后，回答“属于”
```

`count` 记录的是**当前末尾连续的 1 的数量**。例如读 `11011` 时，读到中间的 0 会清零，因此不会误判为出现 `111`。

#### Example

**避免三个连续的 b**

表达式

$$
(e\cup b\cup bb)(a\cup ab\cup abb)^*
$$

可以解释为：先写空串、`b` 或 `bb`；随后重复任意多次，每次写 `a`、`ab` 或 `abb`。按这些块的结构可见，生成串不会出现三个连续的 `b`。

