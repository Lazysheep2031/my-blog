---
title: Draft Example
published: 2022-07-01
tags: [Markdown, Blogging, Demo]
category: Examples
draft: true
---

## 3.3 Pushdown Automata


### From Finite Automata to a Stack

有限自动机只能通过有限个状态保存信息。处理回文串时，需要记住前半段并按相反顺序核对后半段；处理括号匹配时，需要保存尚未匹配的左括号。这些任务自然对应一个**后进先出（LIFO）的栈**。

**下推自动机（Pushdown Automaton，PDA）** 在有限控制器之外增加一个栈。它从左向右读输入，可以读一个输入符号并操作栈，也可以暂时不读输入，只改变状态和栈。

栈允许使用任意有限的存储空间，但只能在栈顶操作。读取顺序与栈的存取方式共同决定了它的能力。

> **截图占位：PDA 的整体结构。** 截取课件 PDF 第 32 页上半部“输入带、有限控制器、栈”的结构图；保留输入读头与栈顶的位置。对应教材印刷 p.130（PDF p.144），图 3-8。

### Formal Definition

本章采用六元组：

$$
M=(K,\Sigma,\Gamma,\Delta,s,F),
$$

其中：

- $K$：有限状态集；
- $\Sigma$：输入字母表；
- $\Gamma$：栈字母表，可以与输入字母表不同；
- $s\in K$：初始状态；
- $F\subseteq K$：终态集；
- $\Delta$：**有限的**转换关系，满足

$$
\Delta\subseteq
\bigl(K\times(\Sigma\cup\{e\})\times\Gamma^*\bigr)
\times\bigl(K\times\Gamma^*\bigr).
$$

**本书允许一次替换栈顶的一个有限字符串。** 因此转换中的栈操作对象属于 $\Gamma^*$，长度可以为零、一个或多个符号；后面会把这种一般形式化成更受限制的简单 PDA。

### Transitions and Configurations

转换

$$
((p,a,\beta),(q,\gamma))\in\Delta
$$

表示：在状态 $p$，如果剩余输入以 $a$ 开头、栈顶以 $\beta$ 开头，就读掉 $a$，把栈顶的 $\beta$ 替换成 $\gamma$，进入 $q$。

- 若 $a=e$，不消耗输入，读头保持不动。
- 若 $\beta=e$，不要求匹配任何栈符号，可以直接压入 $\gamma$；**这也适用于非空栈，不能把它理解为“检查栈是否为空”。**
- 若 $\gamma=e$，弹出 $\beta$。
- 若 $\beta=\gamma=e$，栈保持不变。

例如，$((p,a,e),(q,b))$ 读一个 $a$ 并压入 $b$；$((p,a,b),(q,e))$ 读一个 $a$ 并弹出栈顶的 $b$。

PDA 的**配置（Configuration）** 写作

$$
(q,w,\alpha)\in K\times\Sigma^*\times\Gamma^*,
$$

三个分量依次表示当前状态、**尚未读取的输入**、栈内容。本章始终约定**栈顶在左**：栈串 $abc$ 的栈顶是 $a$，栈底是 $c$。

一次合法转换可以完整地写为：

$$
(p,ay,\beta\eta)\vdash_M(q,y,\gamma\eta),
\qquad ((p,a,\beta),(q,\gamma))\in\Delta.
$$

其中 $\eta$ 是保持不变的栈底部分。$\vdash_M^*$ 是 $\vdash_M$ 的自反、传递闭包，表示**零步或多步**计算。

> **截图占位：一次转换的局部效果。** 截取课件 PDF 第 36 页中部左右两幅图，保留 $\beta\eta\to\gamma\eta$ 与输入 $ay\to y$；用来对照配置公式。

### Acceptance Conditions

本章 PDA 的初始栈为空。它接受 $w$ 当且仅当

$$
\exists f\in F,\qquad
(s,w,e)\vdash_M^*(f,e,e).
$$

这要求某条有限计算同时满足：**输入读完、栈清空、进入终态**。因此

$$
L(M)=\{w\in\Sigma^*:\exists f\in F,\ (s,w,e)\vdash_M^*(f,e,e)\}.
$$

一般 PDA 允许同一配置有多个可用转换。接受的含义是**存在一条成功的计算分支**；某些分支卡住或无法接受，不妨碍其他分支接受。

> 有的教材单独采用“空栈接受”或“终态接受”。对一般非确定 PDA，这些约定可以通过修改机器互相转换；对同一台未经修改的机器，直接更换接受条件可能改变语言。本笔记沿用上述三项同时满足的约定。由于 $\vdash_M^*$ 允许零步，初态本身是终态时，空串也可以通过零步计算接受。

### Example: Marked Palindromes

构造 PDA 接受

$$
L=\{wcw^R:w\in\{a,b\}^*\}.
$$

**思路：读到 $c$ 前将符号依次压栈；读到 $c$ 后，逐个读输入并与栈顶配对弹出。** $c$ 明确标出了前后两段的分界。

取

$$
K=\{s,f\},\quad\Sigma=\{a,b,c\},\quad
\Gamma=\{a,b\},\quad F=\{f\},
$$

转换关系包含：

$$
\begin{aligned}
&((s,a,e),(s,a)), &&((s,b,e),(s,b)),\\
&((s,c,e),(f,e)),\\
&((f,a,a),(f,e)), &&((f,b,b),(f,e)).
\end{aligned}
$$

进入 $f$ 后还需要继续读输入、清空栈，不能在刚读到 $c$ 时就宣告接受。$w=e$ 时，输入 `c` 也在语言中。

<details>
<summary>展开例题：输入 abbcbba 的完整计算</summary>

$$
\begin{aligned}
(s,abbcbba,e)
&\vdash(s,bbcbba,a)\\
&\vdash(s,bcbba,ba)\\
&\vdash(s,cbba,bba)\\
&\vdash(f,bba,bba)\\
&\vdash(f,ba,ba)\\
&\vdash(f,a,a)\\
&\vdash(f,e,e).
\end{aligned}
$$

压入的顺序是 $a,b,b$，弹出的顺序是 $b,b,a$，恰好核对 $w^R$。若输入与栈顶不匹配，或输入读完后栈里仍有符号，这条分支不能接受。

</details>

### Example: Even-Length Palindromes

对

$$
L=\{ww^R:w\in\{a,b\}^*\},
$$

沿用上例的两个状态和压栈、匹配转换，把分界转换改成

$$
((s,e,e),(f,e)),
$$

并取输入字母表 $\Sigma=\{a,b\}$。

在状态 $s$，机器可以继续读符号并压栈，也可以通过上述 $e$ 转换切换到匹配阶段。这个选择相当于**非确定地猜测中点**。

猜得过早或过晚的分支会失败；输入确为偶数长度回文时，存在恰好在中点切换的分支。空串通过 $(s,e,e)\vdash(f,e,e)$ 接受。

### Example: Equal Numbers of a and b

构造 PDA 接受

$$
L=\{w\in\{a,b\}^*:w\text{ 中 }a,b\text{ 的数量相等}\}.
$$

这里字符顺序任意。**栈保存已经读取的前缀中尚未抵消的同类符号**：读到同类符号就压栈，读到异类符号就弹出一个；栈底保留标记 $c$。

设前缀为 $u$，用 $\#_a(u)$、$\#_b(u)$ 分别表示其中的字符数量。令 $d=\#_a(u)-\#_b(u)$，则状态 $q$ 下的栈始终满足

$$
\text{stack}=
\begin{cases}
a^dc,&d>0,\\
c,&d=0,\\
b^{-d}c,&d<0.
\end{cases}
$$

这个不变式同时给出了设计方法和正确性依据。

<details>
<summary>展开完整构造与输入 abbbabaa 的计算</summary>

取 $K=\{s,q,f\}$，$\Sigma=\{a,b\}$，$\Gamma=\{a,b,c\}$，$F=\{f\}$。转换为

$$
\begin{aligned}
&(1)&&((s,e,e),(q,c)),\\
&(2)&&((q,a,c),(q,ac)),\\
&(3)&&((q,a,a),(q,aa)),\\
&(4)&&((q,a,b),(q,e)),\\
&(5)&&((q,b,c),(q,bc)),\\
&(6)&&((q,b,b),(q,bb)),\\
&(7)&&((q,b,a),(q,e)),\\
&(8)&&((q,e,c),(f,e)).
\end{aligned}
$$

转换 (1) 放入栈底标记；(2)–(7) 更新数量差；(8) 在数量差为零时弹掉标记并进入终态。

$$
\begin{aligned}
(s,abbbabaa,e)
&\vdash(q,abbbabaa,c)\\
&\vdash(q,bbbabaa,ac)\\
&\vdash(q,bbabaa,c)\\
&\vdash(q,babaa,bc)\\
&\vdash(q,abaa,bbc)\\
&\vdash(q,baa,bc)\\
&\vdash(q,aa,bbc)\\
&\vdash(q,a,bc)\\
&\vdash(q,e,c)\\
&\vdash(f,e,e).
\end{aligned}
$$

不变式对空前缀成立，每一种读入转换也保持它。因此读完整个输入后，栈只剩 $c$ 当且仅当 $a,b$ 数量相等。若尚有输入就提前使用 (8)，由于 $f$ 没有后续转换，这条分支不会接受。

</details>

### Finite Automata as Pushdown Automata

任何有限自动机都可看成始终不使用栈的 PDA。将 NFA 的每条转换

$$
(p,a,q)
$$

替换为

$$
((p,a,e),(q,e)),
$$

其余状态、初态、终态保持一致，便得到相同语言。栈一直为空，所以接受条件与原 NFA 对齐。

这说明 PDA 至少能够接受所有正则语言；回文等例子展示了栈带来的额外能力。

## 3.4 Pushdown Automata and Context-Free Language

> 对应课件 PDF 第 44–66 页；课本 §3.4，印刷第 136–142 页（扫描 PDF 第 150–156 页）。本节标题沿用课件，课本对应标题为 “Pushdown Automata and Context-Free Grammars”。

**PDA 接受的语言恰好是上下文无关语言。** 即

$$
L\text{ 是上下文无关语言}
\iff \exists M\text{ 为 PDA},\ L=L(M).
$$

证明分为两个构造：**CFG $\to$ PDA：用栈模拟最左推导；PDA $\to$ CFG：用非终结符描述消去栈符号的计算片段。**

### Building a PDA from a CFG

给定 $G=(V,\Sigma,R,S)$，构造

$$
M=(\{p,q\},\Sigma,V,\Delta,p,\{q\}).
$$

栈字母表为 $V$，同时包含终结符和非终结符。$\Delta$ 由三类转换组成：

1. **初始化**：$((p,e,e),(q,S))$，把开始符号压栈。
2. **展开非终结符**：对每条规则 $A\to\gamma\in R$，加入 $((q,e,A),(q,\gamma))$。
3. **匹配终结符**：对每个 $a\in\Sigma$，加入 $((q,a,a),(q,e))$。

栈顶是非终结符时，选择一条生成规则展开；栈顶是终结符时，必须与当前输入匹配。已匹配的前缀不断被移除，下一次露出的非终结符就是当前句型的最左非终结符。

> **压栈顺序。** 在本章“栈顶在左”的记法中，用 $aSa$ 替换 $S$ 后，左端 $a$ 先被处理。若具体实现只提供逐字符压栈，应按右端到左端的次序依次压入。

#### Example: A Grammar for Marked Palindromes

文法

$$
S\to aSa\mid bSb\mid c
$$

生成 $\{wcw^R:w\in\{a,b\}^*\}$。对应 PDA 有一条初始化转换、三条展开转换、三条匹配转换，共七条。

<details>
<summary>展开七条转换、最左推导与 abbcbba 的完整计算</summary>

$$
\begin{aligned}
\Delta=\{&((p,e,e),(q,S)),\\
&((q,e,S),(q,aSa)),\ ((q,e,S),(q,bSb)),\ ((q,e,S),(q,c)),\\
&((q,a,a),(q,e)),\ ((q,b,b),(q,e)),\ ((q,c,c),(q,e))\}.
\end{aligned}
$$

文法的推导为

$$
S\Rightarrow aSa\Rightarrow abSba\Rightarrow abbSbba\Rightarrow abbcbba.
$$

相应计算为

$$
\begin{aligned}
(p,abbcbba,e)
&\vdash(q,abbcbba,S)\\
&\vdash(q,abbcbba,aSa)\\
&\vdash(q,bbcbba,Sa)\\
&\vdash(q,bbcbba,bSba)\\
&\vdash(q,bcbba,Sba)\\
&\vdash(q,bcbba,bSbba)\\
&\vdash(q,cbba,Sbba)\\
&\vdash(q,cbba,cbba)\\
&\vdash(q,bba,bba)\\
&\vdash(q,ba,ba)\\
&\vdash(q,a,a)\\
&\vdash(q,e,e).
\end{aligned}
$$

“展开一次文法规则”与“匹配一个终结符”是两种不同操作，因此 PDA 的步数通常多于文法推导步数。

</details>

#### Correctness of the Construction

关键对应关系为：对 $w\in\Sigma^*$、$\alpha\in(V-\Sigma)V^*\cup\{e\}$，

$$
S\Rightarrow_L^*w\alpha
\iff
(q,w,S)\vdash_M^*(q,e,\alpha).
$$

这里 $\alpha$ 为空或以非终结符开头，表示已经把当前句型最前面的终结符全部匹配完。取 $\alpha=e$，并加上初始化一步，就得到 $L(G)=L(M)$。

<details>
<summary>展开两个方向的证明</summary>

**从推导到计算。** 对最左推导长度归纳。零步时 $w=e$、$\alpha=S$，零步计算即可。

设最后一步为

$$
S\Rightarrow_L^*xA\beta
\Rightarrow_L x\gamma\beta=w\alpha,
$$

其中 $x\in\Sigma^*$，$A\to\gamma\in R$。由归纳假设，机器可以匹配 $x$ 并到达栈 $A\beta$；随后用对应转换把它改为 $\gamma\beta$。

因为 $w=xy$、$\gamma\beta=y\alpha$，其中 $y\in\Sigma^*$，继续逐个匹配 $y$，便到达 $(q,e,\alpha)$。每一步都与最左展开及其新增终结符前缀对应。

**从计算到推导。** 设已经读掉输入前缀 $x$、当前栈为 $\eta$。维护不变式

$$
S\Rightarrow_L^*x\eta.
$$

初始化之后 $x=e$、$\eta=S$，成立。若转换展开栈顶 $A$，由于 $x$ 全由终结符组成，该转换恰好对应最左推导的一步；若转换匹配栈顶终结符 $a$，则“已读前缀”变成 $xa$，“剩余栈”去掉 $a$，两部分连接起来的句型保持不变。

因此整个计算保持不变式。到达 $(q,e,\alpha)$ 时已经读完 $w$，得到 $S\Rightarrow_L^*w\alpha$。特别地，接受时栈也为空，故 $S\Rightarrow_L^*w$。

</details>

### Building a CFG from a PDA

反向构造先将一般 PDA 化为简单 PDA，再把计算过程翻译成生成规则。

#### Simple Pushdown Automata

**简单 PDA（Simple PDA）** 要求：除初态发出的转换外，每条

$$
((q,a,\beta),(p,\gamma))
$$

均满足

$$
\beta\in\Gamma,\qquad |\gamma|\le2.
$$

也就是每步检查并替换**恰好一个栈顶符号**，替换结果可以含零、一个或两个符号。初态需要例外，才能从空栈开始运行。

#### Converting to a Simple PDA

设原机为 $M=(K,\Sigma,\Gamma,\Delta,s,F)$。引入新的初态 $s'$、唯一终态 $f'$、栈底标记 $Z\notin\Gamma$：

$$
((s',e,e),(s,Z)),
\qquad
((f,e,Z),(f',e))\quad(f\in F).
$$

主计算中一直保留 $Z$，使原来的“空栈”对应“仅剩 $Z$”。只有原机已经到达终态且栈清空时，才可移去 $Z$ 并到达 $f'$。$s'$ 没有入边，$f'$ 没有出边。

然后依次拆分一般栈操作：**先把一次弹出多个符号拆开，再把一次压入多个符号拆开，最后消除不检查栈顶的主计算转换。**

<details>
<summary>展开三阶段构造与正确性要点</summary>

每次拆分都为该条原转换引入独立的新状态；这些状态只用于走完当前模拟，不能与其他转换的中间状态混用，也不设为终态。

**第一阶段：将 $|\beta|\ge2$ 拆成逐个弹栈。** 对

$$
((q,a,B_1\cdots B_n),(p,\gamma)),\qquad n\ge2,
$$

引入 $t_1,\ldots,t_{n-1}$，改为

$$
\begin{aligned}
&((q,e,B_1),(t_1,e)),\\
&((t_i,e,B_{i+1}),(t_{i+1},e))\quad(1\le i\le n-2),\\
&((t_{n-1},a,B_n),(p,\gamma)).
\end{aligned}
$$

先从左到右弹出前 $n-1$ 个符号，最后一步读输入并完成替换。匹配失败会停在无法接受的中间状态；成功走完整段时，与原转换的效果相同。

**第二阶段：将 $|\gamma|\ge2$ 拆成逐个压栈。** 对

$$
((q,a,\beta),(p,C_1\cdots C_m)),\qquad m\ge2,
$$

引入 $r_1,\ldots,r_{m-1}$，改为

$$
\begin{aligned}
&((q,a,\beta),(r_1,C_m)),\\
&((r_i,e,e),(r_{i+1},C_{m-i}))\quad(1\le i\le m-2),\\
&((r_{m-1},e,e),(p,C_1)).
\end{aligned}
$$

先放 $C_m$，最后放 $C_1$，使最终栈顶次序为 $C_1\cdots C_m$。这一阶段结束后有 $|\beta|\le1$、$|\gamma|\le1$。

**第三阶段：消除主计算中的 $\beta=e$。** 对 $q\ne s'$ 的每条

$$
((q,a,e),(p,\gamma)),
$$

对所有 $A\in\Gamma\cup\{Z\}$ 加入

$$
((q,a,A),(p,\gamma A)).
$$

它读取并原样保留旧栈顶 $A$，再将 $\gamma$ 放在前面。主计算中有栈底标记，所以总能取到某个 $A$；又因为前一阶段已使 $|\gamma|\le1$，现在有 $|\gamma A|\le2$。

最终得到

$$
M'=(K',\Sigma,\Gamma\cup\{Z\},\Delta',s',\{f'\}),
\qquad L(M')=L(M).
$$

> 课件第 57 页的小标题写“去掉 $|\gamma|>2$”，但下面的具体构造处理的是 $m\ge2$。应按具体构造执行：第二阶段先降到 $|\gamma|\le1$，第三阶段加回一个旧栈顶符号后才保证长度不超过 2。

</details>

#### Meaning of the Nonterminals

记 $\Gamma'=\Gamma\cup\{Z\}$。为每个 $q,p\in K'$、$A\in\Gamma'\cup\{e\}$ 建立一个非终结符

$$
\langle q,A,p\rangle.
$$

它表示这样一段输入：机器从状态 $q$、栈顶为 $A$ 开始，经过一段计算，**把 $A$ 以及由它替换、压入的符号全部消去**，到达状态 $p$，期间不读取或改变原先位于 $A$ 下面的栈内容。

三个位置分别编码**起始状态、要消去的栈内容、结束状态**。它是文法的一个符号，内部的逗号和状态名只是命名方式。

> **截图占位：非终结符 $\langle q,A,p\rangle$ 的含义。** 截取课件 PDF 第 61 页中部的栈高度变化图与下方输入片段，保留左右状态 $q,p$ 和栈中的 $A$。若需要同时观察两个栈符号依次消去的分段，可补截第 59 页右侧的栈高度曲线。教材对应解释在印刷 p.141（PDF p.155）。

当 $A=e$，该符号表示无需消去原有栈符号的计算片段；特别地，$\langle q,e,q\rangle$ 可以直接生成空串。

新文法 $G=(V,\Sigma,R,S)$ 的符号集为

$$
V=\Sigma\cup\{S\}\cup
\{\langle q,A,p\rangle:q,p\in K',\ A\in\Gamma'\cup\{e\}\}.
$$

#### Production Rules

生成规则分为四类。

**1. 开始规则**

$$
S\to\langle s,Z,f'\rangle.
$$

$s$ 是原 PDA 的初态；$s'$ 的初始化已经把机器带到状态 $s$、栈为 $Z$。因此这条规则要求接下来的计算读完输入、清除 $Z$ 并到达 $f'$。

**2. 替换为零或一个栈符号**

若

$$
((q,a,B),(r,C))\in\Delta',
\qquad C\in\Gamma'\cup\{e\},
$$

则对每个 $p\in K'$ 加入

$$
\langle q,B,p\rangle\to a\langle r,C,p\rangle.
$$

先读 $a$ 并用 $C$ 替换 $B$，再完成“从 $r$ 消去 $C$ 到 $p$”的剩余任务。$a=e$ 时右侧不写任何输入符号。

若 $C=e$，配合第 4 类规则，立即弹栈的转换 $((q,a,B),(r,e))$ 可简写成 $\langle q,B,r\rangle\to a$。

**3. 替换为两个栈符号**

若

$$
((q,a,B),(r,C_1C_2))\in\Delta',
$$

则对所有 $p,t\in K'$ 加入

$$
\langle q,B,p\rangle
\to a\langle r,C_1,t\rangle\langle t,C_2,p\rangle.
$$

先消去上面的 $C_1$ 及其产生的符号，到达某个中间状态 $t$；随后才能处理下面的 $C_2$。两个变量的连接顺序体现了栈的后进先出性质。必须枚举中间状态 $t$，因为它由具体计算决定。

**4. 零步计算**

$$
\langle q,e,q\rangle\to e\qquad(q\in K').
$$

> 课件第 62 页第 2 类规则的转换右端印成 $(r,e)$，后续规则却使用 $C$；结合教材印刷 p.141，应统一写作 $(r,C)$，其中 $C$ 可为空串或一个栈符号。

#### Correctness of the Construction

核心命题为

$$
\langle q,A,p\rangle\Rightarrow_G^*x
\iff
(q,x,A)\vdash_{M'}^*(p,e,e).
$$

这里讨论的是已经规范化的 $M'$；$A$ 是一个栈符号或空串。

<details>
<summary>展开两个方向的证明与等价定理的收尾</summary>

**生成规则对应计算。** 对推导树归纳。规则 $\langle q,e,q\rangle\to e$ 对应零步计算。第 2 类规则先执行一条 PDA 转换，再按归纳假设完成剩余计算。第 3 类规则先执行替换为 $C_1C_2$ 的转换，再依次完成两棵子树对应的计算：处理 $C_1$ 时保留下面的 $C_2$，处理结束后再消去 $C_2$。得到所需的整体计算。

**计算对应生成规则。** 对计算步数归纳。零步时必须有 $A=e$、$x=e$、$q=p$，可用第 4 类规则。

若第一步把 $A$ 替换为零或一个符号，余下计算直接对应第 2 类规则的一个子问题。若第一步将其替换为 $C_1C_2$，考察此后**第一次将上方 $C_1$ 对应的整段栈内容消去、露出 $C_2$** 的时刻，记当时状态为 $t$。栈只能从顶部操作，所以此前不会检查或改变 $C_2$；余下输入因此分成依次消去 $C_1$、$C_2$ 的两段。对两段计算使用归纳假设，再用第 3 类规则连接，便得到整个输入的推导。

最后，由开始规则和上述命题，

$$
\begin{aligned}
x\in L(G)
&\iff\langle s,Z,f'\rangle\Rightarrow_G^*x\\
&\iff(s,x,Z)\vdash_{M'}^*(f',e,e)\\
&\iff(s',x,e)\vdash_{M'}^*(f',e,e)\\
&\iff x\in L(M')=L(M).
\end{aligned}
$$

两个方向均完成，得到 PDA 与 CFG 在语言表达能力上的等价性。

</details>

#### Example: Converting Individual Transitions

课件第 63–65 页给出状态 $p,q$、栈符号 $X,Z_0$ 上的六条转换：

$$
\begin{aligned}
&(1)&&((q,1,Z_0),(q,XZ_0)),\\
&(2)&&((q,1,X),(q,XX)),\\
&(3)&&((q,0,X),(p,X)),\\
&(4)&&((q,e,X),(q,e)),\\
&(5)&&((p,1,X),(p,e)),\\
&(6)&&((p,0,Z_0),(q,Z_0)).
\end{aligned}
$$

这组转换适合练习“压两个符号、保留一个符号、直接弹栈”三种局部翻译。

> **原例的接受条件缺项。** 课件写初态 $q$、终态集 $\{p\}$，却没有初始化 $Z_0$ 的转换；按本章空初栈约定，六条转换均无法启动，故严格得到 $L(M)=\varnothing$。即使另行预置 $Z_0$，原六条转换也无法将它移除。第 64 页列出的两个开始规则还与前述终态集不一致。因此下面先记录局部转换结果，再给一个明确补充假设的完整练习版本。

<details>
<summary>展开六条转换对应的全部局部生成式</summary>

为简洁，写 $\langle qXp\rangle$ 代表 $\langle q,X,p\rangle$，其余类同；此处先枚举原状态集中的中间状态 $p,q$。直接弹栈的规则已合并生成空串的辅助变量。

由 **(1)** 得

$$
\begin{aligned}
\langle qZ_0q\rangle
&\to1\langle qXq\rangle\langle qZ_0q\rangle
\mid1\langle qXp\rangle\langle pZ_0q\rangle,\\
\langle qZ_0p\rangle
&\to1\langle qXq\rangle\langle qZ_0p\rangle
\mid1\langle qXp\rangle\langle pZ_0p\rangle.
\end{aligned}
$$

由 **(2)** 得

$$
\begin{aligned}
\langle qXq\rangle
&\to1\langle qXq\rangle\langle qXq\rangle
\mid1\langle qXp\rangle\langle pXq\rangle,\\
\langle qXp\rangle
&\to1\langle qXq\rangle\langle qXp\rangle
\mid1\langle qXp\rangle\langle pXp\rangle.
\end{aligned}
$$

由 **(3)** 得

$$
\langle qXq\rangle\to0\langle pXq\rangle,
\qquad
\langle qXp\rangle\to0\langle pXp\rangle.
$$

转换后的状态是 $p$，所以右侧变量必须从 $p$ 开始。课件第 65 页第一条右侧误写为 $0\langle qXq\rangle$，这里按转换定义修正。

由 **(4)、(5)** 得

$$
\langle qXq\rangle\to e,
\qquad
\langle pXp\rangle\to1.
$$

由 **(6)** 得

$$
\langle pZ_0q\rangle\to0\langle qZ_0q\rangle,
\qquad
\langle pZ_0p\rangle\to0\langle qZ_0p\rangle.
$$

这些规则可以通过产生输入的局部计算理解；完整文法的开始规则仍须由完整、确定的初始化与接受约定给出。

</details>

<details>
<summary>补充练习：加入明确初始化与清栈阶段，完成 101 的计算和推导</summary>

以下是为了演示完整转换而补建的版本：**初始化栈为 $Z_0$；原六条转换运行到状态 $p$ 并读完输入后，可以清空剩余栈接受。** 这项补充并不推定课件遗漏部分的原意。

增加初态 $i$、清栈状态 $d$、唯一终态 $f$，并加入

$$
\begin{aligned}
&((i,e,e),(q,Z_0)),\\
&((p,e,X),(d,e)),\qquad ((p,e,Z_0),(f,e)),\\
&((d,e,X),(d,e)),\qquad ((d,e,Z_0),(f,e)).
\end{aligned}
$$

清栈阶段不读取输入，$f$ 也没有出边，所以提前清栈不会接受尚未读完的输入。新机仍按“输入读完、栈清空、进入终态”接受。

输入 `101` 的计算是

$$
\begin{aligned}
(i,101,e)
&\vdash(q,101,Z_0)\\
&\vdash(q,01,XZ_0)\\
&\vdash(p,1,XZ_0)\\
&\vdash(p,e,Z_0)\\
&\vdash(f,e,e).
\end{aligned}
$$

对应文法以

$$
S\to\langle q,Z_0,f\rangle
$$

开始，按扩大后的状态集生成各类规则。该计算所用的文法推导为

$$
\begin{aligned}
S
&\Rightarrow\langle q,Z_0,f\rangle\\
&\Rightarrow1\langle q,X,p\rangle\langle p,Z_0,f\rangle\\
&\Rightarrow10\langle p,X,p\rangle\langle p,Z_0,f\rangle\\
&\Rightarrow101\langle p,Z_0,f\rangle\\
&\Rightarrow101.
\end{aligned}
$$

其中 $\langle p,X,p\rangle\to1$ 来自原转换 (5)，$\langle p,Z_0,f\rangle\to e$ 来自新增的最后清栈转换。这个例子把“中间状态枚举”和“最终接受条件”连接起来。

</details>

## 3.5 Languages that are and are not Context-Free

> 对应课件 PDF 第 67–83 页；课本 §3.5，印刷第 143–147 页（扫描 PDF 第 157–161 页）。

本节解决两类问题：怎样用已知语言构造新的上下文无关语言，以及怎样证明一个语言超出了上下文无关语言的表达范围。

### Closure Properties

**上下文无关语言对并、连接、星闭包封闭。** 给定两个文法 $G_1=(V_1,\Sigma_1,R_1,S_1)$、$G_2=(V_2,\Sigma_2,R_2,S_2)$，先重命名非终结符，使它们彼此不冲突，也不与另一个文法的终结符冲突；再引入新的开始符号 $S$。

| 目标语言 | 保留的原规则 | 增加的规则 |
| --- | --- | --- |
| $L(G_1)\cup L(G_2)$ | $R_1\cup R_2$ | $S\to S_1\mid S_2$ |
| $L(G_1)L(G_2)$ | $R_1\cup R_2$ | $S\to S_1S_2$ |
| $L(G_1)^*$ | $R_1$ | $S\to e\mid SS_1$ |

**重命名很重要**：如果两个文法恰好都使用非终结符 $A$，直接合并规则可能使原本独立的推导相互混用，生成额外的字符串。

<details>
<summary>展开三种构造的正确性说明</summary>

**并集。** 从 $S$ 出发，第一步必须选择 $S_1$ 或 $S_2$，之后只能沿对应文法推导。因此，生成的字符串恰好属于两个语言之一。

**连接。** 第一步得到 $S_1S_2$；两个非终结符分别生成 $w_1\in L(G_1)$、$w_2\in L(G_2)$，最终得到 $w_1w_2$。反过来，任意这样的连接都能按此方式生成。

**星闭包。** 使用 $S\to SS_1$ 共 $k$ 次，再用 $S\to e$，可得到 $k$ 个 $S_1$，每一个独立生成 $L(G_1)$ 中的字符串。$k=0$ 时直接生成空串。因此恰好覆盖零次或任意有限次连接。

</details>

结合基础语言 $\varnothing$、$\{a\}$ 都是上下文无关语言，也可再次说明：**所有正则语言都是上下文无关语言。**

### Intersection with a Regular Language

**上下文无关语言与正则语言的交集仍是上下文无关语言。** 设 $L=L(M_1)$，其中 $M_1$ 为 PDA；$R=L(M_2)$，其中 $M_2$ 为 DFA。让一个新 PDA 同时记录两台机器的状态，并保留 $M_1$ 的栈。

> **截图占位｜课件 PDF 第 70 页中下部。** 截取同一输入带下 PDA、DFA 同步运行的结构图，保留左侧栈。用于理解“一个栈加一对有限状态”如何实现交集。

<details>
<summary>展开乘积构造与正确性说明</summary>

设

$$
M_1=(K_1,\Sigma,\Gamma_1,\Delta_1,s_1,F_1),
\qquad
M_2=(K_2,\Sigma,\delta,s_2,F_2).
$$

构造

$$
M=(K_1\times K_2,\Sigma,\Gamma_1,\Delta,(s_1,s_2),F_1\times F_2).
$$

对于 $M_1$ 的转移 $((q_1,a,\beta),(p_1,\gamma))$，分两种情况：

- 若 $a\in\Sigma$，两台机器读取同一个字符，加入

  $$
  (((q_1,q_2),a,\beta),((p_1,\delta(q_2,a)),\gamma)).
  $$

- 若 $a=e$，仅 PDA 执行空转移，DFA 保持原状态，加入

  $$
  (((q_1,q_2),e,\beta),((p_1,q_2),\gamma)).
  $$

以上规则对每个 $q_2\in K_2$ 都加入。课件第 71 页仅列了读取字符的公式，空转移情况按课本第 144 页补全。

新机器的第一状态分量和栈始终模拟 $M_1$；第二状态分量记录 $M_2$ 读完同一输入前缀后所在的状态。输入读完时，只有栈空且两个状态分量分别属于 $F_1,F_2$ 才接受，因此

$$
L(M)=L(M_1)\cap L(M_2)=L\cap R.
$$

</details>

**这个构造只需要一个栈。** 若同时模拟两个一般 PDA，两者的栈信息无法直接塞进上述“有限状态乘积”中；不能据此推出两个上下文无关语言的交集封闭性。

#### Example: Equal Counts without Forbidden Substrings

证明以下语言是上下文无关语言：

$$
L=\{w\in\{a,b\}^*:w\text{ 中 }a,b\text{ 数量相等，且不含子串 }abaa\text{ 或 }babb\}.
$$

<details>
<summary>展开证明</summary>

拆成两个条件：

$$
\begin{aligned}
L_1&=\{w\in\{a,b\}^*: \#_a(w)=\#_b(w)\},\\
L_2&=\{a,b\}^* - \{a,b\}^*\{abaa,babb\}\{a,b\}^*.
\end{aligned}
$$

其中 $L_1$ 已由前面的 CFG 或 PDA 构造证明为上下文无关语言。包含禁止子串的语言可由正则表达式描述，取补集得到的 $L_2$ 仍然正则。

由于 $L=L_1\cap L_2$，由交集定理可得 $L$ 为上下文无关语言。

**“全局数量条件 + 正则局部限制”常适合用这一分解方法。**

</details>

来源：课件 PDF 第 72 页；课本例 3.5.1，印刷第 145 页。

### Parse-Tree Height and Yield Length

定义文法的**最大分支数（Fanout）** $\phi(G)$ 为所有产生式右部的最大长度：

$$
\phi(G)=\max\bigl(\{0\}\cup\{|\alpha|:A\to\alpha\in R\}\bigr).
$$

无产生式时约定 $\phi(G)=0$；空产生式右部长度为 $0$。

本节的树高 $h$ 按**根到叶子路径上的边数**计算。它与第一章笔记中“路径长度按节点数计算”的约定不同，使用公式时要分别对应。

**引理：当 $\phi(G)\ge1$ 时，高度为 $h$ 的分析树，其产出长度至多为 $\phi(G)^h$。** 一个节点最多分出 $\phi(G)$ 条生成分支；层数有限时，能够产生的终结符个数也有上界。空串叶子的产出长度为 $0$。

<details>
<summary>展开归纳证明</summary>

对树高归纳。先考虑 $\phi(G)\ge1$ 的情形。

当 $h=1$ 时，根使用一个产生式，产出长度至多等于该规则右部长度，故不超过 $\phi(G)$。高度为 $0$ 的终结符单节点树产出长度为 $1$。

若高度不超过 $h-1$ 的每棵子树产出长度都不超过 $\phi(G)^{h-1}$，则高度为 $h$ 的树至多包含 $\phi(G)$ 棵这样的子树，产出总长度至多

$$
\phi(G)\cdot\phi(G)^{h-1}=\phi(G)^h.
$$

空产生式的产出为空串，也满足上界。若所有规则右部都为空串，则该文法至多生成空串，不存在后续泵定理需要讨论的长字符串；无规则的文法同样单独处理。

</details>

因此，若 $|w|>\phi(G)^h$，任何产出 $w$ 的分析树都必须高于 $h$。**字符串足够长，就会迫使分析树的某条路径足够长。**

来源：课件 PDF 第 73–74 页；课本引理 3.5.1，印刷第 145 页。

### A Pumping Theorem

设 $G=(V,\Sigma,R,S)$ 为上下文无关文法，非终结符个数为

$$
m=|V-\Sigma|.
$$

**泵定理（Pumping Theorem）**：任何满足

$$
w\in L(G),\qquad |w|>\phi(G)^m
$$

的字符串都存在分解

$$
w=uvxyz
$$

使得

$$
|vy|\ge1,
\qquad
uv^ixy^iz\in L(G)\quad\text{对所有 }i\ge0.
$$

其中 $v,y$ **至少有一个非空**，允许另一个为空；两部分必须使用**相同的重复次数** $i$。$i=0$ 删除两部分，$i=1$ 得到原串，$i=2$ 同时各增加一份。

> **本课采用的定理版本没有给出 $|vxy|$ 的上界。** 不能直接据此声称“$vxy$ 只能覆盖某个长度的窗口”或“只能跨越相邻两段”。课本习题 3.5.7 另行提出了带局部长度上界的加强版。

> **截图占位｜课件 PDF 第 77 页整张分析树对比图，或课本印刷第 146 页、扫描 PDF 第 160 页的图 3-9。** 保留两个重复非终结符 $A$，以及叶子下方的 $u,v,x,y,z$ 标记。课件图还展示了中间树段重复后的形状，适合理解为何 $v,y$ 同步重复。

<details>
<summary>展开泵定理证明</summary>

**第一步：选择一棵最小分析树。** 在所有根为 $S$、产出为 $w$ 的分析树中，选择**节点总数最少**的一棵 $T$。

由 $|w|>\phi(G)^m$ 和前面的引理可知，$T$ 的高度大于 $m$，所以某条根到叶子的路径至少有 $m+1$ 条边、$m+2$ 个节点。除最后的叶子外，路径上的节点均为非终结符；由于文法只有 $m$ 种非终结符，其中至少两个节点带有相同标记 $A$。

**第二步：沿两个 $A$ 划分产出。** 上方 $A$ 的子树包住下方 $A$ 的子树，于是可以写成

$$
S\Rightarrow^*uAz,
\qquad A\Rightarrow^*vAy,
\qquad A\Rightarrow^*x,
$$

其中 $u,v,x,y,z\in\Sigma^*$，且 $w=uvxyz$。具体地，$x$ 是下方 $A$ 子树的产出；$v,y$ 分别来自上方子树中位于下方子树左、右两侧的部分。

**第三步：重复中间树段。** 规则 $A\Rightarrow^*vAy$ 可重复使用任意次，然后通过 $A\Rightarrow^*x$ 结束：

$$
S\Rightarrow^*uAz
\Rightarrow^*uv^iAy^iz
\Rightarrow^*uv^ixy^iz,
\qquad i\ge0.
$$

因此所有泵出的字符串都属于 $L(G)$。

**第四步：证明至少一侧非空。** 若 $v=y=e$，可直接用下方 $A$ 子树替换上方 $A$ 子树。根标记相同、最终产出仍为 $w$，但节点总数严格减少，与 $T$ 的最小性矛盾。故 $|vy|\ge1$。

**证明细节。** 课件第 75–76 页与课本原文使用“叶子数最少”。若文法含有单位产生式链，删除这段链时叶子数可能不变；这里改用“节点总数最少”，使最后一步严格成立。

</details>

来源：课件 PDF 第 75–77 页；课本定理 3.5.3，印刷第 145–146 页。

### Using the Pumping Theorem

泵定理给出上下文无关语言必须满足的性质。**用它证明一个语言不属于 CFL 时，要排除所有可能的合法分解。**

量词顺序为：给定一个足够长的 $w$，**存在**某种分解，使得**所有**泵次数都有效。反证时不能自己选一个方便破坏的分解就结束。

通常按以下步骤组织证明：

1. 假设 $L$ 是上下文无关语言，存在生成它的文法 $G$，记 $N=\phi(G)^{|V-\Sigma|}$。
2. 选择一个结构清楚的 $w\in L$，使 $|w|>N$。
3. 考虑任意分解 $w=uvxyz$，只使用定理已经保证的 $|vy|\ge1$ 等条件。
4. 对所有分解分类；每一种都找到某个 $i\ge0$，使 $uv^ixy^iz\notin L$。
5. 与泵定理矛盾，推出 $L$ 不是上下文无关语言。

> 找到一种可以泵的分解，或者没有成功构造反例，都不足以证明语言属于 CFL。要证明属于 CFL，通常应给出文法、PDA，或使用已证明的封闭性。

### Example: Three Equal Blocks

证明

$$
L=\{a^nb^nc^n:n\ge0\}
$$

不是上下文无关语言。

<details>
<summary>展开完整反证：覆盖所有分解</summary>

假设 $L=L(G)$，取整数 $n>N=\phi(G)^{|V-\Sigma|}$，令

$$
w=a^nb^nc^n.
$$

由泵定理，存在分解 $w=uvxyz$，满足 $|vy|\ge1$，且对每个 $i\ge0$ 都有 $uv^ixy^iz\in L$。下面无论分解如何，都取 $i=2$。

**情况一：$v,y$ 合起来出现了 $a,b,c$ 三种符号。** 两个子串要覆盖三种符号，至少有一个子串包含两种或更多符号。由于它是 $a^nb^nc^n$ 的连续子串，内部符号顺序只能从 $a$ 到 $b$ 再到 $c$；但将这个混合子串重复两次时，第一份末尾的较后符号会出现在第二份开头的较前符号之前。例如，重复 $a^rb^s$，其中 $r,s>0$，会在中间形成 $ba$。

因此 $uv^2xy^2z\notin a^*b^*c^*$，更不属于 $L$。

**情况二：$v,y$ 合起来只出现一种或两种符号。** 至少一种符号完全不在 $v,y$ 中，其数量在泵之后仍为 $n$；由于 $|vy|\ge1$，至少另一种符号的数量严格增加。因此泵出的字符串不再满足三种符号数量相等，仍不属于 $L$。

两种情况覆盖所有分解，均与泵定理矛盾，所以 $L$ 不是上下文无关语言。

**这里完全没有使用 $|vxy|$ 上界。** 课件第 79 页把第二种情况简写为“包含两种符号”，完整论证还必须涵盖只含一种符号的情形。

</details>

来源：课件 PDF 第 78–80 页；课本例 3.5.2，印刷第 146–147 页。

### Example: Prime-Length Strings

证明

$$
L=\{a^p:p\text{ 为素数}\}
$$

不是上下文无关语言。

<details>
<summary>展开证明：明确选择泵次数</summary>

假设 $L=L(G)$。取大于泵阈值 $N$ 的素数 $p$，令 $w=a^p$。任意满足泵定理条件的分解 $w=uvxyz$ 都有

$$
d=|v|+|y|>0,
\qquad r=|u|+|x|+|z|,
\qquad p=r+d.
$$

泵 $i$ 次后字符串的长度为 $r+id$。取

$$
i=p+1,
$$

则

$$
r+(p+1)d=(r+d)+pd=p(1+d).
$$

由于 $p\ge2$、$1+d\ge2$，这个长度是合数。因此泵出的字符串不属于 $L$，与泵定理矛盾。

这个取法也覆盖 $r=0$ 的情况，无需额外分类。

</details>

课件还给出一个进一步结论：**单字母字母表上的上下文无关语言一定是正则语言。** 因此，对单字母语言，已证明“非正则”就能推出“非上下文无关”。该结论的证明未在这份课件中展开；一般字母表上，非正则语言仍可能是 CFL，例如 $\{a^nb^n:n\ge0\}$。

来源：课件 PDF 第 81 页；课本例 3.5.3 及其后说明，印刷第 147 页。

### Example: Equal Counts in Arbitrary Order

证明

$$
L=\{w\in\{a,b,c\}^*: \#_a(w)=\#_b(w)=\#_c(w)\}
$$

不是上下文无关语言。

<details>
<summary>展开证明：用正则语言筛出已知反例</summary>

假设 $L$ 是上下文无关语言。由于 $a^*b^*c^*$ 是正则语言，由“CFL 与正则语言的交集封闭”可知

$$
L\cap a^*b^*c^*
$$

也应为上下文无关语言。然而

$$
L\cap a^*b^*c^* = \{a^nb^nc^n:n\ge0\},
$$

右边已证明不属于 CFL，矛盾。

交上正则语言 $a^*b^*c^*$ 的作用，是把任意排列限制成三段有序块，使原语言中的数量条件变成已知的三段等长问题。

</details>

来源：课件 PDF 第 82 页；课本例 3.5.4，印刷第 147 页。

### Nonclosure under Intersection and Complementation

**上下文无关语言对一般交集与补集都不封闭。**

<details>
<summary>展开交集不封闭的反例</summary>

令

$$
\begin{aligned}
L_1&=\{a^nb^nc^m:m,n\ge0\}
     =\{a^nb^n:n\ge0\}\,c^*,\\
L_2&=\{a^mb^nc^n:m,n\ge0\}
     =a^*\{b^nc^n:n\ge0\}.
\end{aligned}
$$

两者分别只要求一对相邻符号数量相等，可由上下文无关语言的连接封闭性证明均为 CFL。

但同时满足两者的字符串必须有三段等长：

$$
L_1\cap L_2=\{a^nb^nc^n:n\ge0\},
$$

该语言不属于 CFL，所以 CFL 对交集不封闭。

</details>

<details>
<summary>展开补集不封闭的证明</summary>

固定共同字母表 $\Sigma$，所有补集都相对于 $\Sigma^*$。

若 CFL 对补集封闭，那么对于任意两个 CFL $L_1,L_2$，结合并集封闭性与德摩根律，

$$
L_1\cap L_2
=\overline{\overline{L_1}\cup\overline{L_2}}
$$

也应属于 CFL。但前面的反例已经证明交集不封闭，矛盾。因此补集同样不封闭。

</details>

这里的“不封闭”表示**存在反例**；某两个 CFL 的交集或某一个 CFL 的补集仍可能恰好是 CFL。

来源：课件 PDF 第 83 页；课本定理 3.5.4，印刷第 147 页。

### Choosing a Proof Method

- **证明语言属于 CFL**：优先寻找递归生成结构写 CFG，或寻找能由一个栈保存的信息写 PDA；条件可拆分时，再使用并、连接、星闭包及“与正则语言取交”。
- **证明语言不属于 CFL**：可直接使用泵定理，或先与一个正则语言取交，转化为已知非 CFL。
- **使用泵定理时**：保证选择的原串属于目标语言，排除所有合法分解，并明确指出泵之后破坏的是字符顺序、数量关系还是长度性质。
- **使用封闭性时**：先确认每个操作数的语言类别；两个 CFL 的交集没有一般保证。
