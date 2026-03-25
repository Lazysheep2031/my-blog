---
title: Second-order Linear Equations
published: 2026-03-25
description: Chapter 2 notes on second-order linear equations and related methods
tags: [常微分方程]
category: 笔记
draft: false
---

## 概述

本章开始系统研究高于一阶的 linear ODE。
全章的核心思路是：**先把结构看清楚，再学习具体方法**。

- 先理解 homogeneous linear equation 的解空间结构；
- 区分 homogeneous equation 与 nonhomogeneous equation；
- 用 characteristic equation 求 constant-coefficient homogeneous equation；
- 处理两类特殊但可解的 variable-coefficient equation：Euler equation 与 reduction of order。

和 Chapter 1 相比，这一章的重点从“方程类型识别”转向 **linear structure、basis solutions 与 general solution 的写法**。

## 目录

- [概述](#概述)
- [目录](#目录)
- [二阶线性方程引论](#二阶线性方程引论)
  - [基本形式](#基本形式)
  - [Homogeneous 与 nonhomogeneous](#homogeneous-与-nonhomogeneous)
  - [初始条件](#初始条件)
  - [Mass-spring-damper model](#mass-spring-damper-model)
- [Superposition、唯一性与一般解](#superposition唯一性与一般解)
  - [Principle of superposition](#principle-of-superposition)
  - [Existence and uniqueness](#existence-and-uniqueness)
  - [Linear independence 与 Wronskian](#linear-independence-与-wronskian)
  - [二阶 homogeneous equation 的 general solution](#二阶-homogeneous-equation-的-general-solution)
- [高阶线性方程](#高阶线性方程)
  - [一般形式](#一般形式)
  - [Homogeneous 解空间](#homogeneous-解空间)
  - [Nonhomogeneous 解的结构](#nonhomogeneous-解的结构)
- [Homogeneous Equations with Constant Coefficients](#homogeneous-equations-with-constant-coefficients)
  - [Characteristic equation](#characteristic-equation)
  - [Distinct real roots](#distinct-real-roots)
  - [Repeated real roots](#repeated-real-roots)
  - [Complex roots](#complex-roots)
  - [Repeated complex roots](#repeated-complex-roots)
  - [Polynomial differential operators](#polynomial-differential-operators)
  - [标准流程](#标准流程)
- [Bonus](#bonus)
  - [Euler Equations](#euler-equations)
    - [Euler characteristic equation](#euler-characteristic-equation)
  - [Reduction of Order](#reduction-of-order)
    - [Reduction formula](#reduction-formula)
- [模板总结](#模板总结)
  - [Second-order homogeneous linear equation](#second-order-homogeneous-linear-equation)
  - [Nonhomogeneous linear equation](#nonhomogeneous-linear-equation)
  - [Constant-coefficient homogeneous equation](#constant-coefficient-homogeneous-equation)
  - [Euler equation](#euler-equation)
  - [Reduction of order](#reduction-of-order-1)

## 二阶线性方程引论

### 基本形式

一般的二阶 ODE 可以写成

$$
F(x,y,y',y'')=0.
$$

如果它是 **second-order linear equation**，则可以写成

$$
A(x)y''+B(x)y'+C(x)y=F(x),
$$

当 $A(x)\neq 0$ 时，也常写成标准形式

$$
\boxed{y''+p(x)y'+q(x)y=f(x).}
$$

这里称它为 **linear**，是因为 $y,y',y''$ 都只以一次出现，并且它们之间不相乘。

例如：

- linear：
  $$e^x y''+(\cos x)y'+(1+x^2)y=\arctan x;$$
- nonlinear：
  $$y''=yy',\qquad y''+(y')^2+y^3=0.$$

### Homogeneous 与 nonhomogeneous

若右端为 0，即

$$
\boxed{y''+p(x)y'+q(x)y=0}
$$

则称为 **homogeneous equation**。

若右端不为 0，即

$$
\boxed{y''+p(x)y'+q(x)y=f(x)}
$$

则称为 **nonhomogeneous equation**。

> [!TIP]
> 对 linear equation 而言，“homogeneous” 的含义就是：**右端等于 0**。

### 初始条件

一个二阶 linear IVP 通常写成

$$
y''+p(x)y'+q(x)y=f(x),
\qquad y(x_0)=y_0,
\qquad y'(x_0)=y_1.
$$

二阶方程通常需要 **两个** 初始条件，因为它的 general solution 中一般含有 **两个任意常数**。

### Mass-spring-damper model

标准机械模型为

$$
mx''+cx'+kx=F(t).
$$

其中：

- $m$：mass；
- $c$：damping constant；
- $k$：spring constant；
- $F(t)$：external force。

几个常见特殊情形：

- free vibration：
  $$mx''+cx'+kx=0;$$
- undamped motion：
  $$mx''+kx=F(t);$$
- undamped free vibration：
  $$mx''+kx=0.$$

这正是我们学习 second-order linear ODE 的重要物理背景之一。

---

## Superposition、唯一性与一般解

### Principle of superposition

对于 homogeneous linear equation

$$
y''+p(x)y'+q(x)y=0,
$$

若 $y_1$ 和 $y_2$ 都是区间 $I$ 上的解，那么对任意常数 $c_1,c_2$，

$$
\boxed{y=c_1y_1+c_2y_2}
$$

仍然是区间 $I$ 上的解。

原因在于求导运算具有线性性：

$$
(c_1y_1+c_2y_2)'=c_1y_1'+c_2y_2',
$$

$$
(c_1y_1+c_2y_2)''=c_1y_1''+c_2y_2''.
$$

> [!IMPORTANT]
> Superposition 只对 **linear homogeneous** equation 直接成立；对 nonlinear equation 或一般的 nonhomogeneous equation 不能直接这样使用。

### Existence and uniqueness

对 IVP

$$
y''+p(x)y'+q(x)y=f(x),
\qquad y(x_0)=y_0,
\qquad y'(x_0)=y_1,
$$

若 $p,q,f$ 在包含 $x_0$ 的开区间 $I$ 上连续，则该问题在整个 $I$ 上存在 **唯一** 解。

这一结论的直接含义有：

- 两个初始条件至多确定一个解；
- 若两个解在某点的 $y$ 与 $y'$ 取值相同，则它们在该区间上是同一个解；
- 与某些 nonlinear first-order equation 相比，linear IVP 的行为更加规则。

### Linear independence 与 Wronskian

若两个函数 $y_1,y_2$ 中，任何一个都不是另一个的常数倍，则称它们在某区间上 **linearly independent**。

对两个可导函数，它们的 **Wronskian** 定义为

$$
\boxed{W(y_1,y_2)=
\begin{vmatrix}
y_1 & y_2\\
y_1' & y_2'
\end{vmatrix}
= y_1y_2'-y_2y_1'.}
$$

对于同一个 second-order homogeneous linear equation 的两个解，有：

- 若 $y_1,y_2$ linearly dependent，则 $W(y_1,y_2)=0$；
- 若 $y_1,y_2$ linearly independent，则 $W(y_1,y_2)\neq 0$。

典型例子：

$$
W(\cos x,\sin x)=1,
$$

$$
W(e^x,xe^x)=e^{2x}.
$$

因此这两组函数都线性无关。

### 二阶 homogeneous equation 的 general solution

若 $y_1,y_2$ 是

$$
y''+p(x)y'+q(x)y=0
$$

的两个线性无关解，那么任意解都可写成

$$
\boxed{y=c_1y_1+c_2y_2.}
$$

因此，二阶 homogeneous linear equation 的解集是一个 **二维 linear space**。

例如，对

$$
y''+y=0,
$$

已知 $\cos x$ 与 $\sin x$ 是两组线性无关解，所以 general solution 为

$$
\boxed{y=c_1\cos x+c_2\sin x.}
$$

---

## 高阶线性方程

### 一般形式

一个 $n$ 阶 linear ODE 可以写成

$$
y^{(n)}+p_1(x)y^{(n-1)}+\cdots+p_{n-1}(x)y'+p_n(x)y=f(x).
$$

若 $f(x)\equiv 0$，则是 homogeneous equation；否则是 nonhomogeneous equation。

一个 $n$ 阶 IVP 通常需要给出

$$
y(x_0),y'(x_0),\dots,y^{(n-1)}(x_0).
$$

### Homogeneous 解空间

二阶情形中的结构可以直接推广到 $n$ 阶：

- homogeneous $n$ 阶 linear ODE 的解集构成 linear space；
- 若 $y_1,\dots,y_n$ 是 $n$ 个线性无关解，则

$$
\boxed{y_c=c_1y_1+\cdots+c_ny_n}
$$

就是对应 homogeneous equation 的 general solution。

### Nonhomogeneous 解的结构

对于 nonhomogeneous equation

$$
L[y]=f(x),
$$

若 $y_p$ 是某个 particular solution，而 $y_c$ 是对应 homogeneous equation $L[y]=0$ 的 general solution，则原方程的 general solution 为

$$
\boxed{Y=y_c+y_p.}
$$

这就是高阶版本的“齐次部分 + 特解部分”结构。

---

## Homogeneous Equations with Constant Coefficients

现在研究

$$
\boxed{ay''+by'+cy=0,\qquad a,b,c\in\mathbb R,\ a\neq 0.}
$$

### Characteristic equation

设试探解为

$$
y=e^{rx}.
$$

则有

$$
y'=re^{rx},\qquad y''=r^2e^{rx},
$$

代回原方程得到

$$
(ar^2+br+c)e^{rx}=0.
$$

由于 $e^{rx}\neq 0$，故得到 **characteristic equation**

$$
\boxed{ar^2+br+c=0.}
$$

也就是说，求解微分方程转化成了解一个二次方程。

### Distinct real roots

若 characteristic equation 有两个不同实根 $r_1\neq r_2$，则

$$
\boxed{y=c_1e^{r_1x}+c_2e^{r_2x}.}
$$

例如

$$
y''-5y'+6y=0
$$

对应 characteristic equation

$$
r^2-5r+6=(r-2)(r-3)=0,
$$

故

$$
\boxed{y=c_1e^{2x}+c_2e^{3x}.}
$$

### Repeated real roots

若 characteristic equation 有重实根 $r$，其 multiplicity 为 $m$，则对应部分的解写成

$$
\boxed{(C_1+C_2x+\cdots+C_mx^{m-1})e^{rx}.}
$$

在二阶情形（$m=2$）下，公式就是

$$
\boxed{y=(c_1+c_2x)e^{rx}.}
$$

例如

$$
y''+2y'+y=0
$$

的 characteristic equation 为

$$
(r+1)^2=0,
$$

所以

$$
\boxed{y=(c_1+c_2x)e^{-x}.}
$$

> [!TIP]
> 重根并不会产生重复的 $e^{rx}$；真正的线性无关解应当是
> $$e^{rx},\ xe^{rx},\ x^2e^{rx},\dots$$

### Complex roots

若 characteristic equation 有一对共轭 complex roots

$$
r=\alpha\pm \beta i,
\qquad \beta\neq 0,
$$

则对应的实 general solution 为

$$
\boxed{y=e^{\alpha x}(c_1\cos \beta x+c_2\sin \beta x).}
$$

该结论来自 Euler 公式

$$
e^{i\theta}=\cos\theta+i\sin\theta.
$$

例如

$$
y''-4y'+5y=0
$$

有 characteristic equation

$$
r^2-4r+5=0,
$$

从而

$$
r=2\pm i.
$$

因此

$$
\boxed{y=e^{2x}(c_1\cos x+c_2\sin x).}
$$

### Repeated complex roots

若一对共轭 complex roots $\alpha\pm \beta i$ 的 multiplicity 为 $k$，则对应部分的 general solution 为

$$
\boxed{
\sum_{p=0}^{k-1} x^p e^{\alpha x}(c_p\cos \beta x+d_p\sin \beta x).
}
$$

它就是 repeated real roots 规律在 complex roots 情形下的对应推广。

### Polynomial differential operators

为了更系统地解释 repeated roots，可以把方程写成 operator form。记

$$
D=\frac{d}{dx}.
$$

则二阶方程可写成

$$
Ly=(aD^2+bD+c)y=0.
$$

更一般地，高阶 constant-coefficient equation 可写成

$$
L=a_nD^n+a_{n-1}D^{n-1}+\cdots+a_1D+a_0.
$$

这些 operators 在代数上与 ordinary polynomial 十分相似。例如

$$
(D-a)(D-b)=D^2-(a+b)D+ab.
$$

正是这种 operator viewpoint，解释了为什么重根会产生

$$
e^{rx},\ xe^{rx},\ x^2e^{rx},\dots
$$

而不是重复出现完全相同的解。

### 标准流程

对 constant-coefficient homogeneous linear ODE，通常按以下步骤处理：

**Step 1.** 写 characteristic equation。  
**Step 2.** 求方程的 roots。  
**Step 3.** 判断根型：

- distinct real roots；
- repeated real root(s)；
- complex conjugate roots；
- repeated complex roots。

**Step 4.** 根据对应模板写 general solution。  
**Step 5.** 若给出初始条件，则代入求常数。

---

## Bonus
### Euler Equations

**标准形式**

Euler equation（也称 equidimensional equation）的一般形式为

$$
a_0x^n y^{(n)}+a_1x^{n-1}y^{(n-1)}+\cdots+a_{n-1}xy'+a_n y=f(x).
$$

它最显著的特点是：每一阶导数前面的 $x$ 次幂，与导数阶数恰好对应。

二阶 homogeneous Euler equation 最常见的形式是

$$
\boxed{a_0x^2y''+a_1xy'+a_2y=0.}
$$

**变量代换 $x=e^t$**

令

$$
x=e^t,
\qquad t=\ln x
\quad (x>0),
$$

并记

$$
D=\frac{d}{dt}.
$$

则有关键恒等式

$$
xy'=Dy,
$$

$$
x^2y''=D(D-1)y,
$$

更一般地，

$$
\boxed{x^k\frac{d^k y}{dx^k}=D(D-1)\cdots(D-k+1)y.}
$$

这正是 Euler equation 能化成 constant-coefficient equation 的根本原因。

例如，

$$
a_0x^2y''+a_1xy'+a_2y=0
$$

可化为

$$
a_0D(D-1)y+a_1Dy+a_2y=0,
$$

即

$$
a_0\frac{d^2y}{dt^2}+(a_1-a_0)\frac{dy}{dt}+a_2y=0.
$$

#### Euler characteristic equation

对于二阶 homogeneous Euler equation

$$
a_0x^2y''+a_1xy'+a_2y=0,
$$

其 **Euler characteristic equation** 为

$$
\boxed{a_0\lambda(\lambda-1)+a_1\lambda+a_2=0.}
$$

它对应于常系数情形中的 characteristic equation。

**解的形式**

若 $\lambda$ 是该 characteristic equation 的 root，则对应基础解为

$$
x^{\lambda}.
$$

若 $\lambda$ 是 multiplicity 为 $m$ 的重根，则对应的线性无关解为

$$
x^{\lambda},\quad x^{\lambda}\ln x,\quad x^{\lambda}(\ln x)^2,\quad \dots,\quad x^{\lambda}(\ln x)^{m-1}.
$$

例如

$$
x^2y''-3xy'+4y=0.
$$

其 Euler characteristic equation 为

$$
\lambda(\lambda-1)-3\lambda+4=0,
$$

即

$$
\lambda^2-4\lambda+4=(\lambda-2)^2=0.
$$

因此

$$
\boxed{y=x^2(C_1+C_2\ln x).}
$$

---

### Reduction of Order

**基本思想**

考虑标准形式下的 homogeneous second-order linear equation

$$
y''+p(x)y'+q(x)y=0.
$$

若已经知道一个非零解 $y_1(x)$，则可设第二个解为

$$
\boxed{y_2=v(x)y_1(x).}
$$

这就是 **reduction of order** 的基本代换。

它的思想是：第二个解应当与第一个解“方向不同”，因此尝试在已知解外再乘一个非常数函数 $v(x)$。

#### Reduction formula

经过代入与整理后，可得到公式

$$
\boxed{y_2=y_1\int \frac{e^{-\int p(x)\,dx}}{y_1(x)^2}\,dx.}
$$

只要该积分结果不退化为 $y_1$ 的常数倍，就能得到第二个线性无关解。

Reduction of order 特别适合以下情形：

- 已知一个解可通过 inspection 看出；
- 题目直接给出一个解；
- 某些二阶 equation 明显具有“一个已知解 + 再找第二个解”的结构。

> [!IMPORTANT]
> 使用该公式前，必须先把原方程化成标准形式
> $$y''+p(x)y'+q(x)y=0.$$

---

## 模板总结

### Second-order homogeneous linear equation

$$
y''+p(x)y'+q(x)y=0.
$$

若 $y_1,y_2$ 线性无关，则

$$
\boxed{y=c_1y_1+c_2y_2.}
$$

### Nonhomogeneous linear equation

$$
L[y]=f(x).
$$

其 general solution 为

$$
\boxed{Y=y_c+y_p.}
$$

### Constant-coefficient homogeneous equation

$$
ay''+by'+cy=0,
$$

characteristic equation 为

$$
ar^2+br+c=0.
$$

- distinct real roots $r_1,r_2$：
  $$y=c_1e^{r_1x}+c_2e^{r_2x};$$
- repeated real root $r$：
  $$y=(c_1+c_2x)e^{rx};$$
- complex roots $\alpha\pm \beta i$：
  $$y=e^{\alpha x}(c_1\cos \beta x+c_2\sin \beta x).$$

### Euler equation

$$
a_0x^2y''+a_1xy'+a_2y=0,
$$

其 characteristic equation 为

$$
a_0\lambda(\lambda-1)+a_1\lambda+a_2=0.
$$

### Reduction of order

若对

$$
y''+p(x)y'+q(x)y=0
$$

已知一个解 $y_1$，则第二个解可由

$$
y_2=y_1\int \frac{e^{-\int p(x)\,dx}}{y_1^2}\,dx
$$

给出。

---
