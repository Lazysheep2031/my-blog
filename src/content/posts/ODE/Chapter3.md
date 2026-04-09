---
title: Power Series Methods
published: 2026-04-09
description: power series methods, ordinary points, regular singular points, and the method of Frobenius
tags: [常微分方程]
category: 笔记
draft: false
---

## Overview

本章开始讨论 **power series methods**。前两章我们已经掌握了几类“能用封闭形式直接解”的方程：

- **constant-coefficient linear ODEs**；
- **Euler equations**；
- 已知一个解时的 **reduction of order** 等技巧。

但很多二阶线性方程既不是常系数，也没有明显可猜的基本解。这时，一个自然思路是：

> **不再直接猜函数，而是假设解本身可以展开成 power series，再反过来求系数。**
> **级数方法的核心是把方程转化为系数之间的 recurrence relation。**


## Contents

- [Overview](#overview)
- [Contents](#contents)
- [Introduction](#introduction)
  - [Basic Idea](#basic-idea)
  - [Review of Power Series](#review-of-power-series)
- [Standard Form and Point Classification](#standard-form-and-point-classification)
- [Series Solutions near Ordinary Points](#series-solutions-near-ordinary-points)
  - [Example](#example)
    - [Example 1](#example-1)
    - [Example 2](#example-2)
  - [Radius of Convergence and Nearest Singular Point](#radius-of-convergence-and-nearest-singular-point)
  - [Legendre Equation and Legendre Polynomials](#legendre-equation-and-legendre-polynomials)
- [Regular Singular Points](#regular-singular-points)
  - [Frobenius Method](#frobenius-method)
  - [Example](#example-1)
    - [Example 1](#example-1-1)
    - [Example 2](#example-2-1)
- [Method of Frobenius: The Exceptional Cases](#method-of-frobenius-the-exceptional-cases)
  - [Methodology: the three scenarios](#methodology-the-three-scenarios)
    - [The reason for the logarithmic term](#the-reason-for-the-logarithmic-term)
  - [Example](#example-2)
    - [Example 1: the case $r\_1=r\_2$](#example-1-the-case-r_1r_2)
    - [Example 2: the case $r\_1-r\_2=N\>0$](#example-2-the-case-r_1-r_2n0)
- [Bessel Equation and Special Functions](#bessel-equation-and-special-functions)
  - [General Form](#general-form)

## Introduction

### Basic Idea

考虑二阶线性齐次方程

$$
A(x)y''+B(x)y'+C(x)y=0.
$$

若它既不是常系数，也没有明显代换，那么直接写出 closed-form solution 往往很困难。

这时就改成：

$$
\boxed{y(x)=\sum_{n=0}^{\infty}c_nx^n}
$$

或者在更一般情形下写成

$$
\boxed{y(x)=x^r\sum_{n=0}^{\infty}c_nx^n.}
$$

然后把它代回原方程，逐项比较同次幂的系数，得到 **recurrence relation**，再由此一步步推出整个级数。

### Review of Power Series
$$
\sum_{n=0}^{\infty}c_n(x-a)^n.
$$

大多取展开中心为 $a=0$，即 **Maclaurin series**：

$$
\sum_{n=0}^{\infty}c_nx^n.
$$

常见级数公式（Maclaurin）：

$$
e^x=\sum_{n=0}^{\infty}\frac{x^n}{n!}
=1+x+\frac{x^2}{2!}+\frac{x^3}{3!}+\cdots
$$

$$
\cos x=\sum_{n=0}^{\infty}\frac{(-1)^n x^{2n}}{(2n)!}
=1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots
$$

$$
\sin x=\sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{(2n+1)!}
=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots
$$

$$
\cosh x=\sum_{n=0}^{\infty}\frac{x^{2n}}{(2n)!}
=1+\frac{x^2}{2!}+\frac{x^4}{4!}+\cdots
$$

$$
\sinh x=\sum_{n=0}^{\infty}\frac{x^{2n+1}}{(2n+1)!}
=x+\frac{x^3}{3!}+\frac{x^5}{5!}+\cdots
$$

$$
\ln(1+x)=\sum_{n=1}^{\infty}\frac{(-1)^{n+1}x^n}{n}
=x-\frac{x^2}{2}+\frac{x^3}{3}-\cdots,
\qquad |x|<1
$$

$$
\frac{1}{1-x}=\sum_{n=0}^{\infty}x^n
=1+x+x^2+x^3+\cdots,
\qquad |x|<1
$$

$$
(1+x)^\alpha=1+\alpha x+\frac{\alpha(\alpha-1)}{2!}x^2
+\frac{\alpha(\alpha-1)(\alpha-2)}{3!}x^3+\cdots,
\qquad |x|<1
$$

常见操作有三件：

1. **逐项求导**
   $$
   y=\sum_{n=0}^{\infty}c_nx^n,
   \qquad
   y'=\sum_{n=1}^{\infty}nc_nx^{n-1},
   \qquad
   y''=\sum_{n=2}^{\infty}n(n-1)c_nx^{n-2};
   $$
2. **平移指标（index shift）**，把不同求和式统一成同一个 $x^n$；
3. **比较同次幂系数**，利用 identity principle 得到递推式。

## Standard Form and Point Classification

先看一般二阶线性方程

$$
A(x)y''+B(x)y'+C(x)y=0.
$$

把它除以 $A(x)$，写成标准形式：

$$
\boxed{y''+P(x)y'+Q(x)y=0},
\qquad
P(x)=\frac{B(x)}{A(x)},
\quad
Q(x)=\frac{C(x)}{A(x)}.
$$

然后在某一点 $x=a$ 对这个点分类：

- **ordinary point**：$P,Q$ 在 $x=a$ 解析；
- **regular singular point**：$(x-a)P(x)$ 与 $(x-a)^2Q(x)$ 在 $x=a$ 解析；
- **irregular singular point**：既不是 ordinary，也不是 regular singular。

:::NOTE
**What does “analytic at $x=a$” mean?**

一个函数在 $x=a$ 解析，意思是：

**它在 $a$ 附近可以写成一个关于 $(x-a)$ 的收敛幂级数。**

也就是存在某个邻域，使得

$$
f(x)=\sum_{n=0}^{\infty} c_n (x-a)^n
$$

并且这个级数在该邻域内真的等于 $f(x)$。

$$
e^x,\ \sin x,\ \cos x
$$

这类函数是解析的；而

$$
\frac1{x-a},\ \frac1{(x-a)^2},\ \ln(x-a),\ |x-a|
$$
这类函数在 $x=a$ 一般都不解析。
:::

:::NOTE
**Why do we multiply by $(x-a)$ and $(x-a)^2$?**

对标准方程

$$
y''+P(x)y'+Q(x)y=0
$$

在 $x=a$ 附近分类时：

* 若 $P,Q$ 都在 $x=a$ 解析，则 $x=a$ 是 **ordinary point**；
* 若
  $$
  (x-a)P(x),\qquad (x-a)^2Q(x)
  $$
  在 $x=a$ 解析，则 $x=a$ 是 **regular singular point**。

这个条件正好来自导数的“降阶”：

* 若 $y\sim (x-a)^r$，则
  $$
  y'\sim (x-a)^{r-1},\qquad y''\sim (x-a)^{r-2}.
  $$

也就是说：

* $y'$ 比 $y$ 多降一阶；
* $y''$ 比 $y$ 多降两阶。

为了让方程里的三项

$$
y'',\quad P(x)y',\quad Q(x)y
$$

在同一主阶上平衡，$P(x)$ 最多只能像

$$
\frac1{x-a}
$$

这样坏，$Q(x)$ 最多只能像

$$
\frac1{(x-a)^2}
$$

这样坏。
这就是为什么 regular singular point 的判别条件恰好是

$$
(x-a)P(x),\qquad (x-a)^2Q(x)
$$

要在 $x=a$ 解析。

> **(P) 最多允许一阶奇性，(Q) 最多允许二阶奇性；再坏就不是 regular singular 了。**

:::


## Series Solutions near Ordinary Points

若 $x=a$ 是 **ordinary point**，那么在 $a$ 附近解可以展开成普通幂级数。

不妨把中心平移到 $a=0$，则有

$$
\boxed{y(x)=\sum_{n=0}^{\infty}c_nx^n.}
$$

关键是：

- **ordinary point 附近，普通幂级数就够了**；
- 收敛半径和 $P,Q$ 在复平面中的最近奇点有关。

直观上就是：

> 只要系数函数在这个点附近**够好**，解也会**长得够好**，可以用 ordinary power series 表示。

**General Workflow**

在 ordinary point 附近做级数解，标准流程可以固定记忆为：

1. 先把方程写成标准形式，检查展开点是不是 **ordinary point**；
2. 设
   $$
   y=\sum_{n=0}^{\infty}c_nx^n;
   $$
3. 求出 $y',y''$；
4. 代回原方程；
5. 把所有项整理成关于 $x^n$ 的单一求和式；
6. 比较系数，得到 **recurrence relation**；
7. 由 $c_0,c_1$ 两个自由参数生成两组 linearly independent solutions；
8. 写出通解
   $$
   y=c_0y_0+c_1y_1.
   $$

> [!IMPORTANT]
> 二阶线性齐次方程最后通常会留下 **两个自由参数**。在级数语言里，它们往往就是 $c_0,c_1$。

### Example
#### Example 1
$$
(x^2-4)y''+3xy'+y=0
$$

先化标准形式：

$$
y''+\frac{3x}{x^2-4}y'+\frac{1}{x^2-4}y=0.
$$

因为

$$
P(x)=\frac{3x}{x^2-4},
\qquad
Q(x)=\frac{1}{x^2-4}
$$

在 $x=0$ 都解析，所以 $x=0$ 是 **ordinary point**。

于是设

$$
y=\sum_{n=0}^{\infty}c_nx^n,
\qquad
y'=\sum_{n=1}^{\infty}nc_nx^{n-1},
\qquad
y''=\sum_{n=2}^{\infty}n(n-1)c_nx^{n-2}.
$$

代回并整理成同次幂后，可得递推关系

$$
\boxed{c_{n+2}=\frac{n+1}{4(n+2)}c_n \qquad (n\ge 0).}
$$

于是偶数项由 $c_0$ 决定，奇数项由 $c_1$ 决定：

$$
c_2=\frac18c_0,
\qquad
c_4=\frac{3}{128}c_0,
\qquad \cdots
$$

$$
c_3=\frac16c_1,
\qquad
c_5=\frac1{30}c_1,
\qquad \cdots
$$

对应两组基本解可写成

$$
y_0(x)=1+\frac18x^2+\frac{3}{128}x^4+\cdots,
$$

$$
y_1(x)=x+\frac16x^3+\frac1{30}x^5+\cdots.
$$

所以通解为

$$
\boxed{y=c_0y_0(x)+c_1y_1(x).}
$$

- 递推式隔两个下标连一次，所以自然分成 **偶数链** 和 **奇数链**；
- 因此两个基本解常常就是**只含偶次幂**和**只含奇次幂**的两组级数。

#### Example 2

$$
y''-xy'-x^2y=0
$$

先观察：

$$
P(x)=-x,
\qquad
Q(x)=-x^2,
$$

都在 $x=0$ 解析，所以 $x=0$ 仍然是 **ordinary point**。

设

$$
y=\sum_{n=0}^{\infty}c_nx^n.
$$

代回后整理，可得到：

- $x^0$ 项给出
  $$
  2c_2=0 \Rightarrow c_2=0;
  $$
- $x^1$ 项给出
  $$
  6c_3-c_1=0 \Rightarrow c_3=\frac16c_1;
  $$
- 对 $n\ge 2$，有递推关系
  $$
  \boxed{c_{n+2}=\frac{nc_n+c_{n-2}}{(n+2)(n+1)}.}
  $$

由此得到前几项：

$$
y_0(x)=1+\frac1{12}x^4+\frac1{90}x^6+\cdots,
$$

$$
y_1(x)=x+\frac16x^3+\frac3{40}x^5+\cdots.
$$

所以通解为

$$
\boxed{y=c_0y_0(x)+c_1y_1(x).}
$$

- 递推关系变成了 **three-term recurrence**；

### Radius of Convergence and Nearest Singular Point

对 ordinary point 附近的幂级数解，除了会得到 recurrence relation，还要记住一个很重要的结论：

> 若 $x=a$ 是 ordinary point，则方程在 $a$ 附近有两组 linearly independent 的 power-series solutions，且它们的收敛半径至少达到从 $a$ 到最近 singular point 的距离；这里的 singular point 要在 **complex plane** 里看，而不只是在实轴上。

**收敛半径不是只看“实数范围内哪里出问题”，而是要看复平面中最近的奇点离展开中心有多远。**

例如，若标准形式中的系数函数只有复奇点

$$
x=\pm 3i,
$$

那么：

- 若在 $x=0$ 展开，最近奇点距离是 $3$，因此级数解的收敛半径至少为 $3$；
- 若在 $x=4$ 展开，最近奇点到 $4$ 的距离是
  $$
  \sqrt{4^2+3^2}=5,
  $$
  因此收敛半径至少为 $5$。

所以：

> **展开中心不同，保证的收敛半径也会不同。**


### Legendre Equation and Legendre Polynomials

一个非常经典的 ordinary-point 例子是 **Legendre equation**：

$$
\boxed{(1-x^2)y''-2xy'+\alpha(\alpha+1)y=0.}
$$

它和球面上的 **Laplace / Poisson equation** 密切相关，因此在数学物理里非常常见。

需要先注意两点：

1. 在 $x=0$ 附近，$1-x^2\neq 0$，所以这里可以按 ordinary point 来做；
2. 但在 $x=\pm 1$，系数会出问题，所以这两个点是它的奇点。

当参数 $\alpha=n\in\mathbb N$ 时，会出现特殊的多项式解，称为 **Legendre polynomials**。这就是为什么幂级数方法最后会通向特殊函数。
对 Legendre equation

$$
(1-x^2)y''-2xy'+\alpha(\alpha+1)y=0,
$$

当参数取为非负整数

$$
\alpha=n\in\mathbb N,
$$

会出现 **Legendre polynomial**。

更具体地说：

- 若 $n$ 是 **even**，则两组级数中 **偶数幂那一组** 会在某一步终止，从而得到一个 $n$ 次多项式；
- 若 $n$ 是 **odd**，则两组级数中 **奇数幂那一组** 会终止，从而得到一个 $n$ 次多项式。

所以：

> **当 $\alpha=n$ 为非负整数时，两组级数里恰有一组会终止成多项式；哪一组终止，取决于 $n$ 的奇偶性。**

这就是 Legendre polynomial 出现的原因：  
递推关系在某一步把更高次系数“截断”了。

前几个 Legendre polynomials 是

$$
P_0(x)=1,
$$

$$
P_1(x)=x,
$$

$$
P_2(x)=\frac12(3x^2-1),
$$

$$
P_3(x)=\frac12(5x^3-3x),
$$

$$
P_4(x)=\frac18(35x^4-30x^2+3),
$$

$$
P_5(x)=\frac18(63x^5-70x^3+15x).
$$

它们的一个很重要的性质是：

$$
\boxed{
P_n(x)\ \text{的全部 }n\text{ 个零点都落在 }(-1,1)\text{ 内}.
}
$$


## Regular Singular Points
### Frobenius Method

若展开点不是 ordinary point，而是 singular point，那么直接设

$$
y=\sum_{n=0}^{\infty}c_nx^n
$$

往往会失败，因为方程里的 $P(x),Q(x)$ 本身已经带有类似 $1/x,1/x^2$ 的奇性。

这时普通幂级数不够灵活，需要更一般的设法。

**Standard Form near a Regular Singular Point**

在 $x=0$ 附近，regular singular point 的典型标准形式写成

$$
\boxed{y''+\frac{p(x)}{x}y'+\frac{q(x)}{x^2}y=0},
$$

其中 $p(x),q(x)$ 在 $x=0$ 附近解析，因此可展开为

$$
p(x)=\sum_{n=0}^{\infty}p_nx^n,
\qquad
q(x)=\sum_{n=0}^{\infty}q_nx^n.
$$

这时虽然 $P(x)=p(x)/x$ 和 $Q(x)=q(x)/x^2$ 在 $0$ 不解析，但它们的奇性仍然是可控的：

- $P$ 最多像 $1/x$；
- $Q$ 最多像 $1/x^2$。

这正是 **regular singular** 的意思。

**Frobenius Series Ansatz**

此时把普通幂级数推广成

$$
\boxed{y(x)=x^r\sum_{n=0}^{\infty}c_nx^n,
\qquad c_0\neq 0.}
$$

这叫 **Frobenius series**。

和普通幂级数相比，它多了一个前导因子 $x^r$。这个 $r$ 不是先给定的，而是要由方程自己决定。

- ordinary point 情况下，解的主导行为就是 $x^0=1$ 这一层；
- regular singular point 情况下，解的主导行为可能是 $x^r$，而且 $r$ 未必是整数，甚至可能是负数。

**Indicial Equation**

把

$$
y=x^r\sum_{n=0}^{\infty}c_nx^n
$$

代回 regular singular 方程，最低次幂项必须先自洽，这会给出一个关于 $r$ 的代数方程：

$$
\boxed{r(r-1)+p_0r+q_0=0.}
$$

这就是 **indicial equation**。

它的根 $r_1,r_2$ 称为 **exponents**。

1. 先由 indicial equation 决定主导幂 $x^r$；
2. 再由 recurrence relation 决定后续系数 $c_n$。

**Three Scenarios for the Exponents**

设 indicial equation 的两个实根满足 $r_1\ge r_2$。那么按 $r_1-r_2$ 是否为整数，通常分成三类：

1. **$r_1-r_2\notin\mathbb Z$**：最理想，通常能得到两组 Frobenius fundamental solutions；
2. **$r_1-r_2\in\mathbb N$**：有时仍能得到两组 Frobenius 级数解；
3. **$r_1-r_2\in\mathbb N$** 且发生特殊退化：只得到一组 Frobenius 级数，另一组解可能带 **logarithm**。

> **regular singular point 处通常还能做级数，只是要先解一个 indicial equation；真正麻烦的，是两个 exponent 差整数时的 exceptional cases。**

**General Workflow**

1. 检查 $x=0$ 是否为 **regular singular point**；
2. 改写为
   $$
   y''+\frac{p(x)}{x}y'+\frac{q(x)}{x^2}y=0;
   $$
3. 设
   $$
   y=x^r\sum_{n=0}^{\infty}c_nx^n;
   $$
4. 计算 $y',y''$ 并代回；
5. 先取最低次幂，求出 **indicial equation**；
6. 对每个 exponent $r$ 分别求递推关系；
7. 判断能否得到两组 linearly independent solutions。

> [!TIP]
> Frobenius 题里最关键的两行通常是：
> 
> - **indicial equation**；
> - **recurrence relation**。


### Example
#### Example 1
$$
xy''+2y'+xy=0.
$$

先写成 regular singular 的标准形式：
$$
y''+\frac{2}{x}y'+y=0.
$$

因此
$$
p(x)=2,\qquad q(x)=x^2,
$$
所以
$$
p_0=2,\qquad q_0=0.
$$

设 Frobenius 形式
$$
y=\sum_{n=0}^\infty c_n x^{n+r},\qquad c_0\neq 0.
$$
则
$$
y'=\sum_{n=0}^\infty (n+r)c_n x^{n+r-1},
\qquad
y''=\sum_{n=0}^\infty (n+r)(n+r-1)c_n x^{n+r-2}.
$$

代回原方程
$$
xy''+2y'+xy=0
$$
得
$$
\sum_{n=0}^\infty (n+r)(n+r-1)c_n x^{n+r-1}
+2\sum_{n=0}^\infty (n+r)c_n x^{n+r-1}
+\sum_{n=0}^\infty c_n x^{n+r+1}=0.
$$

前两项合并：
$$
\sum_{n=0}^\infty (n+r)(n+r+1)c_n x^{n+r-1}
+\sum_{n=0}^\infty c_n x^{n+r+1}=0.
$$

把最后一项改成同次幂，令 $n\mapsto n-2$：
$$
\sum_{n=0}^\infty (n+r)(n+r+1)c_n x^{n+r-1}
+\sum_{n=2}^\infty c_{n-2}x^{n+r-1}=0.
$$

于是最低次幂 $x^{r-1}$ 的系数给出 **indicial equation**
$$
r(r+1)=0.
$$

所以两个指数是
$$
\boxed{r_1=0,\qquad r_2=-1.}
$$

再看一般项：

- 当 $n=1$ 时，
  $$
  (r+1)(r+2)c_1=0.
  $$
- 当 $n\ge 2$ 时，
  $$
  (n+r)(n+r+1)c_n+c_{n-2}=0,
  $$
  即
  $$
  \boxed{
  c_n=-\frac{c_{n-2}}{(n+r)(n+r+1)},\qquad n\ge 2.
  }
  $$

**Case 1: $r=0$**

此时 $n=1$ 的方程变成
$$
2c_1=0 \quad\Longrightarrow\quad c_1=0.
$$

所以只剩偶数项，递推为
$$
c_n=-\frac{c_{n-2}}{n(n+1)},\qquad n\ge 2.
$$

逐项算：
$$
c_2=-\frac{c_0}{2\cdot 3}=-\frac{1}{6}c_0,
$$
$$
c_4=-\frac{c_2}{4\cdot 5}=\frac{1}{120}c_0,
$$
$$
c_6=-\frac{c_4}{6\cdot 7}=-\frac{1}{5040}c_0.
$$

因此
$$
y=c_0\left(1-\frac{x^2}{3!}+\frac{x^4}{5!}-\frac{x^6}{7!}+\cdots\right).
$$

注意到

$$
\sin x=x-\frac{x^3}{3!}+\frac{x^5}{5!}-\frac{x^7}{7!}+\cdots,
$$

所以

$$
\frac{\sin x}{x}=1-\frac{x^2}{3!}+\frac{x^4}{5!}-\frac{x^6}{7!}+\cdots.
$$

故由 $r=0$ 得到的一组 Frobenius 解是
$$
\boxed{
y_1(x)=\frac{\sin x}{x}.
}
$$


**Case 2: $r=-1$**

此时递推式变成
$$
c_n=-\frac{c_{n-2}}{n(n-1)},\qquad n\ge 2.
$$

并且 $n=1$ 的条件变成
$$
(r+1)(r+2)c_1=0
\quad\Rightarrow\quad
0\cdot c_1=0,
$$
所以 **$c_1$ 不再被限制**，它也可以自由取值。

于是会分成两条链：

**(a) 偶数链：由 $c_0$ 决定**
$$
c_2=-\frac{c_0}{2},\qquad c_4=\frac{c_0}{24},\qquad c_6=-\frac{c_0}{720},\quad\cdots
$$

对应
$$
x^{-1}\left(1-\frac{x^2}{2!}+\frac{x^4}{4!}-\frac{x^6}{6!}+\cdots\right)=\frac{\cos x}{x}.
$$

**(b) 奇数链：由 $c_1$ 决定**
$$
c_3=-\frac{c_1}{3\cdot 2}=-\frac{c_1}{6},
$$
$$
c_5=-\frac{c_3}{5\cdot 4}=\frac{c_1}{120},
$$
$$
c_7=-\frac{c_5}{7\cdot 6}=-\frac{c_1}{5040},
\quad\cdots
$$

对应
$$
x^{-1}\left(x-\frac{x^3}{3!}+\frac{x^5}{5!}-\frac{x^7}{7!}+\cdots\right)=\frac{\sin x}{x}.
$$

因此由 $r=-1$ 得到
$$
y=x^{-1}\left[
c_0\left(1-\frac{x^2}{2!}+\frac{x^4}{4!}-\cdots\right)
+c_1\left(x-\frac{x^3}{3!}+\frac{x^5}{5!}-\cdots\right)
\right],
$$
也就是
$$
\boxed{
y(x)=c_0\frac{\cos x}{x}+c_1\frac{\sin x}{x}.
}
$$

:::TIP
What is the exceptional point here?

注意：

- 由 $r=0$ 得到的解是$\frac{\sin x}{x};$
- 由 $r=-1$ 的奇数链又得到一次$\frac{\sin x}{x}$

也就是说，**较小根 $r=-1$ 产生的一部分级数与较大根 $r=0$ 的解“撞项”了**。  
这正是 difference-by-integer 时的典型现象：两个根并不自动对应两组新的独立 Frobenius 级数。

最终可取的一组基本解是
$$
\boxed{
y_1(x)=\frac{\sin x}{x},
\qquad
y_2(x)=\frac{\cos x}{x}.
}
$$

所以通解为
$$
\boxed{
y(x)=C_1\frac{\sin x}{x}+C_2\frac{\cos x}{x}.
}
$$
:::

#### Example 2

$$
x^2y''+(6x+x^2)y'+xy=0.
$$

先写成标准形式：
$$
y''+\left(\frac{6}{x}+1\right)y'+\frac{1}{x}y=0.
$$

于是
$$
p(x)=6+x,\qquad q(x)=x,
$$
所以
$$
p_0=6,\qquad q_0=0.
$$

设
$$
y=\sum_{n=0}^\infty c_n x^{n+r},\qquad c_0\neq 0.
$$
则
$$
y'=\sum_{n=0}^\infty (n+r)c_n x^{n+r-1},
\qquad
y''=\sum_{n=0}^\infty (n+r)(n+r-1)c_n x^{n+r-2}.
$$

代回原方程
$$
x^2y''+(6x+x^2)y'+xy=0
$$
得
$$
\sum_{n=0}^\infty (n+r)(n+r-1)c_n x^{n+r}
+6\sum_{n=0}^\infty (n+r)c_n x^{n+r}
+\sum_{n=0}^\infty (n+r)c_n x^{n+r+1}
+\sum_{n=0}^\infty c_n x^{n+r+1}
=0.
$$

前两项合并：
$$
\sum_{n=0}^\infty (n+r)(n+r+5)c_n x^{n+r}
+\sum_{n=0}^\infty (n+r+1)c_n x^{n+r+1}=0.
$$

把第二项改成同次幂，令 $n\mapsto n-1$：
$$
\sum_{n=0}^\infty (n+r)(n+r+5)c_n x^{n+r}
+\sum_{n=1}^\infty (n+r)c_{n-1}x^{n+r}=0.
$$

因此最低次幂 $x^r$ 给出 **indicial equation**
$$
r(r+5)=0.
$$

所以两个指数是
$$
\boxed{r_1=0,\qquad r_2=-5.}
$$

对一般项：

- $n=0$ 给出指数方程；
- 对 $n\ge 1$，
  $$
  (n+r)(n+r+5)c_n+(n+r)c_{n-1}=0.
  $$

可写成
$$
(n+r)\big((n+r+5)c_n+c_{n-1}\big)=0.
$$

只要 $n+r\neq 0$，就有
$$
\boxed{
c_n=-\frac{c_{n-1}}{n+r+5}.
}
$$


**Case 1: $r=0$**

此时递推式为
$$
c_n=-\frac{c_{n-1}}{n+5},\qquad n\ge 1.
$$

逐项算：
$$
c_1=-\frac{c_0}{6},
$$
$$
c_2=-\frac{c_1}{7}=\frac{c_0}{42},
$$
$$
c_3=-\frac{c_2}{8}=-\frac{c_0}{336},
$$
$$
c_4=-\frac{c_3}{9}=\frac{c_0}{3024},
$$
$$
c_5=-\frac{c_4}{10}=-\frac{c_0}{30240},
\quad\cdots
$$

所以得到一组 Frobenius 级数解
$$
\boxed{
y_1(x)=1-\frac{x}{6}+\frac{x^2}{42}-\frac{x^3}{336}+\frac{x^4}{3024}-\frac{x^5}{30240}+\cdots
}
$$

**Case 2: $r=-5$**

此时一般关系变成
$$
(n-5)n\,c_n+(n-5)c_{n-1}=0,
$$
即
$$
(n-5)\big(nc_n+c_{n-1}\big)=0.
$$

所以：

- 当 $n\neq 5$ 时，
  $$
  c_n=-\frac{c_{n-1}}{n};
  $$
- 当 $n=5$ 时，方程变成
  $$
  0=0,
  $$
  **没有给出新的限制**，因此 $c_5$ 是自由的。

先从 $c_0$ 链开始：

$$
c_1=-c_0,
\qquad
c_2=\frac{c_0}{2},
\qquad
c_3=-\frac{c_0}{6},
\qquad
c_4=\frac{c_0}{24}.
$$

到了 $n=5$，没有条件，所以若先取 $c_5=0$，则后面
$$
c_6=c_7=\cdots=0.
$$

于是得到
$$
y=x^{-5}\left(1-x+\frac{x^2}{2}-\frac{x^3}{6}+\frac{x^4}{24}\right).
$$

即
$$
\boxed{
y_2(x)=x^{-5}\left(1-x+\frac{x^2}{2}-\frac{x^3}{6}+\frac{x^4}{24}\right).
}
$$

这个解实际上是一个 **finite Frobenius series**。


:::TIP
What happens to the free parameter $c_5$?

因为 $n=5$ 时没有条件，所以 $c_5$ 还可以自由取值。  
若取 $c_0=0,\ c_5\neq 0$，则从 $n=6$ 开始递推：

$$
c_6=-\frac{c_5}{6},\qquad
c_7=\frac{c_5}{42},\qquad
c_8=-\frac{c_5}{336},\quad\cdots
$$

于是
$$
y=x^{-5}\left(c_5x^5-\frac{c_5}{6}x^6+\frac{c_5}{42}x^7-\cdots\right)=c_5\left(1-\frac{x}{6}+\frac{x^2}{42}-\cdots\right).
$$

这恰好就是前面 $r=0$ 得到的那组解 $y_1(x)$。

所以这里 又一次 出现了 **撞项**：

- $r=0$ 给出一组级数解；
- $r=-5$ 本来可能给出更多内容，但其中一部分其实与 $r=0$ 的解重合；
- 真正新的独立解，是上面那个以 $x^{-5}$ 开头并且在第 4 次后终止的有限级数。
:::

**Final answer**

因此可取两组线性无关解为
$$
\boxed{
y_1(x)=1-\frac{x}{6}+\frac{x^2}{42}-\frac{x^3}{336}
+\frac{x^4}{3024}-\frac{x^5}{30240}+\cdots
}
$$
和
$$
\boxed{
y_2(x)=x^{-5}\left(1-x+\frac{x^2}{2}-\frac{x^3}{6}+\frac{x^4}{24}\right).
}
$$

所以通解为
$$
\boxed{
y(x)=C_1\,y_1(x)+C_2\,y_2(x).
}
$$


## Method of Frobenius: The Exceptional Cases

对于 regular singular point $x=0$ 附近的方程

$$
y''+\frac{p(x)}{x}y'+\frac{q(x)}{x^2}y=0,
$$

若 indicial equation

$$
r(r-1)+p_0r+q_0=0
$$

的两根为 $r_1\ge r_2$，则当

$$
r_1-r_2\notin\mathbb Z
$$

时，情况最理想：方程有两组 linearly independent 的 Frobenius series solutions。

真正麻烦的是 **exceptional cases**，也就是两根满足

$$
r_1-r_2\in\mathbb N\cup\{0\}.
$$

此时两组候选级数的幂次会发生重叠，第二组解不再自动是独立的 Frobenius series，因此要单独讨论。

### Methodology: the three scenarios

设 $r_1\ge r_2$ 为 indicial equation 的两个根。

**Case 1. $r_1-r_2\notin\mathbb Z$**

最简单的情况。  
方程有两组 linearly independent 的 Frobenius series solutions：

$$
y_1=x^{r_1}\sum_{n=0}^{\infty}a_nx^n,
\qquad
y_2=x^{r_2}\sum_{n=0}^{\infty}b_nx^n.
$$

这就是上一节最标准的 Frobenius 方法。



**Case 2. $r_1=r_2$**

若两个 exponent 相等，则仍然先得到一组 Frobenius series solution

$$
y_1=x^{r_1}\sum_{n=0}^{\infty}a_nx^n.
$$

这时第二组线性无关解不再是普通 Frobenius series，而具有标准形式

$$
\boxed{
y_2(x)=y_1(x)\ln x+x^{r_1+1}\sum_{n=0}^{\infty}b_nx^n.
}
$$

也就是说：

- 第一部分是 $y_1\ln x$；
- 第二部分是一个更高一阶起始的 power series correction。

这里的 logarithmic term **一定出现**。



**Case 3. $r_1-r_2=N\in\mathbb N$**

若两根相差正整数，则仍然先得到对应较大根 $r_1$ 的一组 Frobenius solution：

$$
y_1=x^{r_1}\sum_{n=0}^{\infty}a_nx^n.
$$

第二组解的一般形式是

$$
\boxed{
y_2(x)=C\,y_1(x)\ln x+x^{r_2}\sum_{n=0}^{\infty}b_nx^n.
}
$$

这里要特别注意：

- 若 $C=0$，则没有 log 项，第二组解仍然是 Frobenius 型；
- 若 $C\ne 0$，则 log 项真正出现。

所以 **difference-by-integer** 时，logarithmic term **可能出现，也可能不出现**。

可以采用代回或者Reduction of order 来解第二组解

#### The reason for the logarithmic term
**Why does the logarithmic term appear?**

背后的逻辑是这样的：

- 先用 Frobenius method 找到一组已知解 $y_1$；
- 若第二组 Frobenius series 不能直接得到，就转而用 **reduction of order** 去找第二组线性无关解。

对于标准二阶齐次方程

$$
y''+P(x)y'+Q(x)y=0,
$$

若已知一个解 $y_1(x)$，则第二个线性无关解可写成

$$
\boxed{
y_2=y_1\int \frac{e^{-\int P(x)\,dx}}{y_1(x)^2}\,dx.
}
$$

在 regular singular point 附近，把 $P(x)$ 和 $y_1(x)$ 的局部行为代进去以后，被积函数会出现类似

$$
\frac{1}{x}
$$

这样的项，于是积分中自然会长出

$$
\int \frac{1}{x}\,dx=\ln x.
$$

> $\ln x$ 是 reduction-of-order 公式中的积分自然产生的。

---

### Example
#### Example 1: the case $r_1=r_2$

**Bessel equation of order zero**

$$
x^2y''+xy'+x^2y=0
$$

$$
y=\sum_{n=0}^{\infty}a_nx^{n+r},\qquad a_0\neq 0.
$$

则

$$
y'=\sum_{n=0}^{\infty}(n+r)a_nx^{n+r-1},
\qquad
y''=\sum_{n=0}^{\infty}(n+r)(n+r-1)a_nx^{n+r-2}.
$$

代回原方程：

$$
x^2y''+xy'+x^2y=0
$$

得

$$
\sum_{n=0}^{\infty}(n+r)(n+r-1)a_nx^{n+r}
+\sum_{n=0}^{\infty}(n+r)a_nx^{n+r}
+\sum_{n=0}^{\infty}a_nx^{n+r+2}=0.
$$

前两项合并：

$$
\sum_{n=0}^{\infty}(n+r)^2a_nx^{n+r}
+\sum_{n=0}^{\infty}a_nx^{n+r+2}=0.
$$

把最后一项改成同次幂，令 $n\mapsto n-2$：

$$
\sum_{n=0}^{\infty}(n+r)^2a_nx^{n+r}
+\sum_{n=2}^{\infty}a_{n-2}x^{n+r}=0.
$$

于是最低次幂 $x^r$ 的系数给出 indicial equation

$$
r^2=0,
$$

所以

$$
\boxed{r=0.}
$$

再看一般项：

- $n=1$ 时，
  $$
  a_1=0;
  $$
- 对 $n\ge 2$，
  $$
  n^2a_n+a_{n-2}=0,
  $$
  即
  $$
  \boxed{
  a_n=-\frac{a_{n-2}}{n^2}.
  }
  $$

因此奇数项全为零，只剩偶数项。逐项算：

$$
a_2=-\frac{a_0}{2^2}=-\frac{a_0}{4},
$$

$$
a_4=-\frac{a_2}{4^2}=\frac{a_0}{4\cdot 16}=\frac{a_0}{64},
$$

$$
a_6=-\frac{a_4}{6^2}=-\frac{a_0}{64\cdot 36}=-\frac{a_0}{2304}.
$$

于是

$$
y=a_0\left(1-\frac{x^2}{4}+\frac{x^4}{64}-\frac{x^6}{2304}+\cdots\right).
$$

若取标准归一化 $a_0=1$，就得到

$$
\boxed{
J_0(x)=1-\frac{x^2}{4}+\frac{x^4}{64}-\frac{x^6}{2304}+\cdots
}
$$

进一步观察偶数项的一般规律：

$$
a_{2n}=\frac{(-1)^n a_0}{2^{2n}(n!)^2},
$$

所以

$$
\boxed{
J_0(x)=\sum_{n=0}^{\infty}\frac{(-1)^n x^{2n}}{2^{2n}(n!)^2}.
}
$$


这里是 $r_1=r_2$，按照 exceptional case 的模板，第二组解应设为

$$
\boxed{
y_2(x)=y_1(x)\ln x+\sum_{n=1}^{\infty}b_nx^n.
}
$$

对

$$
y_2=y_1\ln x+\sum_{n=1}^{\infty}b_nx^n
$$

求导：

$$
y_2'=y_1'\ln x+\frac{y_1}{x}+\sum_{n=1}^{\infty}n b_nx^{n-1},
$$

$$
y_2''=y_1''\ln x+\frac{2y_1'}{x}-\frac{y_1}{x^2}
+\sum_{n=2}^{\infty}n(n-1)b_nx^{n-2}.
$$

代回

$$
x^2y''+xy'+x^2y=0,
$$

并利用 $y_1=J_0(x)$ 本身已经满足这个方程，所有含 $\ln x$ 的那一整块会消掉，最后剩下一个关于 $b_n$ 的关系式。

整理后得到

$$
0=2\sum_{n=1}^{\infty}\frac{(-1)^n 2n\,x^{2n}}{2^{2n}(n!)^2}
+b_1x+2^2b_2x^2+\sum_{n=3}^{\infty}(n^2b_n+b_{n-2})x^n.
$$

于是：

- $x^1$ 项只剩 $b_1x$，所以
  $$
  b_1=0;
  $$
- 所有奇数项都因此消失；
- 偶数项满足非齐次递推。

先看 $b_2$：

$$
b_2=\frac14.
$$

再对 $n\ge 2$，把偶数项递推化简成

$$
(2n)^2b_{2n}+b_{2n-2}=-\frac{2(-1)^n(2n)}{2^{2n}(n!)^2}.
$$

这是一个 **nonhomogeneous recurrence relation**。

引入代换

$$
b_{2n}=\frac{(-1)^{n+1}c_{2n}}{2^{2n}(n!)^2},
$$

这样递推就大大简化为

$$
c_{2n}=c_{2n-2}+\frac{1}{n}.
$$

又因为由 $b_2=\frac14$ 可知 $c_2=1$，于是

$$
c_4=1+\frac12,\qquad
c_6=1+\frac12+\frac13,\qquad
c_8=1+\frac12+\frac13+\frac14,
$$

所以一般地，

$$
c_{2n}=H_n,
$$

其中

$$
H_n=1+\frac12+\cdots+\frac1n
$$

是 harmonic numbers。

因此

$$
b_{2n}=\frac{(-1)^{n+1}H_n}{2^{2n}(n!)^2}.
$$
**Final answer**

所以第二组解是

$$
\boxed{
y_2(x)=J_0(x)\ln x+\sum_{n=1}^{\infty}
\frac{(-1)^{n+1}H_n x^{2n}}{2^{2n}(n!)^2}
}
$$

correction series 的系数往往要通过代回原方程逐项比较来求。

#### Example 2: the case $r_1-r_2=N>0$

**Bessel equation of order 1**

$$
x^2y''+xy'+(x^2-1)y=0.
$$

对应的 indicial equation 有两根

$$
r_1=1,\qquad r_2=-1,
$$

所以

$$
r_1-r_2=2.
$$

这是 **difference-by-integer** 的情形。

一组解是

$$
y_1(x)=J_1(x)=\frac{x}{2}\sum_{n=0}^{\infty}\frac{(-1)^n x^{2n}}{2^{2n}n!(n+1)!}=\frac{x}{2}-\frac{x^3}{16}+\frac{x^5}{384}-\frac{x^7}{18432}+\cdots.
$$


原方程写成标准形式为

$$
y''+\frac{1}{x}y'+\left(1-\frac{1}{x^2}\right)y=0,
$$

因此

$$
P(x)=\frac1x.
$$

根据公式

$$
y_2=y_1\int \frac{e^{-\int P(x)\,dx}}{y_1^2}\,dx,
$$

而

$$
e^{-\int P(x)\,dx}=e^{-\int \frac1x\,dx}=\frac1x,
$$

所以

$$
\boxed{
y_2=y_1\int \frac{1}{x\,y_1^2}\,dx.
}
$$

把 $y_1=J_1(x)$ 的级数代进去：

$$
y_2=y_1\int\frac{1}{x\left(\frac{x}{2}-\frac{x^3}{16}+\frac{x^5}{384}-\cdots\right)^2}\,dx.
$$


被积函数是

$$
\frac{1}{x\,y_1^2}=\frac{1}{x\left(\frac{x}{2}-\frac{x^3}{16}+\frac{x^5}{384}-\cdots\right)^2}.
$$

这时要做 **long division（级数长除法）** 展开成可以逐项积分的单个级数。

先把 $y_1$ 提取出最主要的因子：

$$
y_1=\frac{x}{2}\left(1-\frac{x^2}{8}+\frac{x^4}{192}-\frac{x^6}{9216}+\cdots\right).
$$

于是

$$
y_1^2=\frac{x^2}{4}\left(1-\frac{x^2}{8}+\frac{x^4}{192}-\cdots\right)^2.
$$

因此

$$
\frac{1}{x\,y_1^2}=\frac{4}{x^3}\cdot\frac{1}{\left(1-\frac{x^2}{8}+\frac{x^4}{192}-\cdots\right)^2}.
$$

把平方后的括号再展开，写成

$$
\frac{1}{x\,y_1^2}=\frac{4}{x^3}\cdot\frac{1}{1-\frac{x^2}{4}+\frac{x^4}{192}-\frac{7x^6}{4608}+\cdots}.
$$

现在问题就变成：求

$$
\frac{1}{1-\frac{x^2}{4}+\frac{x^4}{192}-\frac{7x^6}{4608}+\cdots}
$$

的幂级数展开。

设

$$
\frac{1}{1-\frac{x^2}{4}+\frac{x^4}{192}-\frac{7x^6}{4608}+\cdots}=1+A_2x^2+A_4x^4+A_6x^6+\cdots.
$$

把两边相乘，并令结果恒等于 $1$：

$$
\left(1-\frac{x^2}{4}+\frac{x^4}{192}-\frac{7x^6}{4608}+\cdots\right)
\left(1+A_2x^2+A_4x^4+A_6x^6+\cdots\right)=1.
$$

逐次比较系数：

- $x^2$ 项：
  $$
  A_2-\frac14=0
  \quad\Longrightarrow\quad
  A_2=\frac14;
  $$

- $x^4$ 项：
  $$
  A_4-\frac14A_2+\frac{1}{192}=0
  \quad\Longrightarrow\quad
  A_4=\frac{1}{16}-\frac{1}{192}=\frac{11}{192};
  $$

- $x^6$ 项：
  同理可继续往下算。

所以

$$
\frac{1}{1-\frac{x^2}{4}+\frac{x^4}{192}-\cdots}=1+\frac{x^2}{4}+\frac{11x^4}{192}+\cdots.
$$

再乘回前面的 $\frac{4}{x^3}$，就得到

$$
\frac{1}{x\,y_1^2}=\frac{4}{x^3}\left(1+\frac{x^2}{4}+\frac{11x^4}{192}+\cdots\right).
$$

于是

$$
\frac{1}{x\,y_1^2}=\frac{4}{x^3}+\frac{1}{x}+\frac{11x}{48}+\cdots.
$$

把这个写成等价形式

$$
4\left(\frac{1}{4x}+\frac{1}{x^3}+\frac{7x}{192}+\frac{19x^3}{4608}+\cdots\right),
$$

> **把 reduction-of-order 公式中的复杂被积函数，变成可逐项积分的 Laurent 级数。**

$$
4y_1\int\left(\frac{1}{4x}+\frac{1}{x^3}+\frac{7x}{192}+\frac{19x^3}{4608}+\cdots
\right)dx.
$$


逐项积分：

$$
\int \frac{1}{4x}\,dx=\frac14\ln x,
\qquad
\int \frac{1}{x^3}\,dx=-\frac{1}{2x^2},
\qquad
\int \frac{7x}{192}\,dx=\frac{7x^2}{384},
\quad\cdots
$$

因此

$$
y_2=y_1\ln x+4y_1\left(
-\frac{1}{2x^2}+\frac{7x^2}{384}+\frac{19x^4}{18432}+\cdots
\right).
$$

再把 $y_1$ 的级数乘进去，课本得到前几项

$$
\boxed{
y_2(x)=y_1(x)\ln x-\frac1x+\frac{x}{8}+\frac{x^3}{32}-\frac{11x^5}{4608}+\cdots
}
$$


## Bessel Equation and Special Functions

### General Form

经典方程：**Bessel equation**

$$
\boxed{x^2y''+xy'+(x^2-p^2)y=0.}
$$

$x=0$和$x=1$我们都在上面的例子中体现了，分别是N=0和N=2的情况。




