---
title: Linear Equations of Higher Order
published: 2026-04-01
description: Chapter 2 notes on higher-order linear ODEs, nonhomogeneous equations, and boundary value problems
tags: [常微分方程]
category: Notes
draft: false
---

## Overview

本章开始系统讨论 **higher-order linear ODEs**。核心主线可以概括为：

- 先理解 **homogeneous linear equations** 的解空间结构；
- 再区分 **homogeneous** 与 **nonhomogeneous** 方程；
- 对 **constant-coefficient homogeneous equations**，用 **characteristic equation** 求解；
- 对两类特殊的 variable-coefficient 方程，掌握 **Euler equations** 与 **reduction of order**；
- 最后进一步处理 **nonhomogeneous equations** 和 **boundary value problems / eigenvalue problems**。


## Contents

- [Overview](#overview)
- [Contents](#contents)
- [Introduction: Second-Order Linear Equations](#introduction-second-order-linear-equations)
  - [Basic Form](#basic-form)
  - [Homogeneous and Nonhomogeneous Equations](#homogeneous-and-nonhomogeneous-equations)
  - [Initial Conditions](#initial-conditions)
- [Superposition, Uniqueness, and General Solutions](#superposition-uniqueness-and-general-solutions)
  - [Principle of Superposition](#principle-of-superposition)
  - [Existence and Uniqueness](#existence-and-uniqueness)
  - [Linear Independence and the Wronskian](#linear-independence-and-the-wronskian)
  - [General Solution of a Homogeneous Second-Order Equation](#general-solution-of-a-homogeneous-second-order-equation)
- [Linear Equations of Higher Order](#linear-equations-of-higher-order)
  - [General Form](#general-form)
  - [Homogeneous Solution Space](#homogeneous-solution-space)
  - [Structure of Nonhomogeneous Solutions](#structure-of-nonhomogeneous-solutions)
- [Homogeneous Equations with Constant Coefficients](#homogeneous-equations-with-constant-coefficients)
  - [Characteristic Equation](#characteristic-equation)
  - [Distinct Real Roots](#distinct-real-roots)
  - [Repeated Real Roots](#repeated-real-roots)
  - [Complex Roots](#complex-roots)
  - [Repeated Complex Roots](#repeated-complex-roots)
  - [Polynomial Differential Operators](#polynomial-differential-operators)
  - [Standard Workflow](#standard-workflow)
- [Bonus: Euler Equations](#bonus-euler-equations)
  - [Standard Form](#standard-form)
  - [Change of Variables](#change-of-variables)
  - [Euler Characteristic Equation](#euler-characteristic-equation)
  - [Solution Forms](#solution-forms)
- [Bonus: Reduction of Order](#bonus-reduction-of-order)
  - [Basic Idea](#basic-idea)
  - [Reduction Formula](#reduction-formula)
- [Nonhomogeneous Equations and Particular Solutions](#nonhomogeneous-equations-and-particular-solutions)
  - [Method of Undetermined Coefficients](#method-of-undetermined-coefficients)
  - [Duplication and Multiplication by $x^s$](#duplication-and-multiplication-by-xs)
  - [Variation of Parameters](#variation-of-parameters)
  - [Example:](#example)
- [Endpoint Problems and Eigenvalues](#endpoint-problems-and-eigenvalues)
  - [IVP and BVP](#ivp-and-bvp)
  - [Example](#example-1)
  - [Eigenvalues and Eigenfunctions](#eigenvalues-and-eigenfunctions)
  - [Classical Model](#classical-model)
  - [General Procedure: Determinant Equation](#general-procedure-determinant-equation)
- [Bonus: Additional Examples and Applications](#bonus-additional-examples-and-applications)
  - [An ODE in the Guise of an Integral Equation](#an-ode-in-the-guise-of-an-integral-equation)
  - [Two Integrals by the Feynman Method](#two-integrals-by-the-feynman-method)
  - [Kepler's First and Second Laws](#keplers-first-and-second-laws)
    - [1. Polar Coordinates 下的基础公式](#1-polar-coordinates-下的基础公式)
    - [2. Newton 引力定律与运动方程](#2-newton-引力定律与运动方程)
    - [3. Kepler Second Law](#3-kepler-second-law)
    - [4. Kepler First Law](#4-kepler-first-law)

## Introduction: Second-Order Linear Equations

### Basic Form

一般的二阶 ODE 可以写成

$$
F(x,y,y',y'')=0.
$$

而 **second-order linear equation** 的标准形式是

$$
A(x)y''+B(x)y'+C(x)y=F(x),
$$

若 $A(x)\neq 0$，还可以化成

$$
\boxed{y''+p(x)y'+q(x)y=f(x).}
$$

这里称它是 **linear**，是因为 $y,y',y''$ 都只以一次幂出现，并且彼此之间不相乘。

例子：

- 线性：
  $$
  e^x y''+(\cos x)y'+(1+x^2)y=\arctan x;
  $$
- 非线性：
  $$
  y''=yy',\qquad y''+(y')^2+y^3=0.
  $$

### Homogeneous and Nonhomogeneous Equations

若右端为零，

$$
\boxed{y''+p(x)y'+q(x)y=0}
$$

则称为 **homogeneous equation**。

若右端不为零，

$$
\boxed{y''+p(x)y'+q(x)y=f(x)}
$$

则称为 **nonhomogeneous equation**。

> [!TIP]
> 对 linear equations 来说，所谓 homogeneous，最直接的判断标准就是：**right-hand side 是否等于 0**。

### Initial Conditions

一个典型的二阶线性初值问题（IVP）写成

$$
y''+p(x)y'+q(x)y=f(x),
\qquad y(x_0)=y_0,
\qquad y'(x_0)=y_1.
$$

因为二阶方程的通解通常含有两个任意常数，所以通常需要 **两个初始条件** 才能确定 particular solution。

## Superposition, Uniqueness, and General Solutions

### Principle of Superposition

对 homogeneous linear equation

$$
y''+p(x)y'+q(x)y=0,
$$

如果 $y_1$ 和 $y_2$ 都是在区间 $I$ 上的解，那么对任意常数 $c_1,c_2$，

$$
\boxed{y=c_1y_1+c_2y_2}
$$

仍然是该方程在 $I$ 上的解。

本质原因来自求导的线性性：

$$
(c_1y_1+c_2y_2)'=c_1y_1'+c_2y_2',
$$

$$
(c_1y_1+c_2y_2)''=c_1y_1''+c_2y_2''.
$$

> [!IMPORTANT]
> **Superposition** 只对 **linear homogeneous equations** 直接成立。对 nonlinear equations 或一般的 nonhomogeneous equations，不能直接这样相加。

### Existence and Uniqueness

对初值问题

$$
y''+p(x)y'+q(x)y=f(x),
\qquad y(x_0)=y_0,
\qquad y'(x_0)=y_1,
$$

如果 $p,q,f$ 在包含 $x_0$ 的开区间 $I$ 上连续，那么这个 IVP 在整个区间 $I$ 上存在且仅存在一个解。

可以记住三个直接推论：

- 两个初始条件至多对应一个解；
- 若两个解在某一点有相同的 $y$ 和 $y'$，那它们在该区间上其实就是同一个解；
- 线性初值问题的行为通常比很多非线性方程更规则。

### Linear Independence and the Wronskian

若两个函数 $y_1,y_2$ 互不是彼此的常数倍，就称它们在区间 $I$ 上 **linearly independent**。

对于两个可微函数，它们的 **Wronskian** 定义为

$$
\boxed{
W(y_1,y_2)=
\begin{vmatrix}
y_1 & y_2\\
y_1' & y_2'
\end{vmatrix}
= y_1y_2'-y_2y_1'.
}
$$

对同一个二阶 homogeneous linear equation 的两个解来说：

- 若 $y_1,y_2$ 线性相关，则 $W(y_1,y_2)=0$；
- 若 $y_1,y_2$ 线性无关，则 $W(y_1,y_2)\neq 0$。

典型例子：

$$
W(\cos x,\sin x)=1,
$$

$$
W(e^x,xe^x)=e^{2x}.
$$

所以这两组函数都是 linearly independent 的。

### General Solution of a Homogeneous Second-Order Equation

若 $y_1,y_2$ 是方程

$$
y''+p(x)y'+q(x)y=0
$$

的两个 linearly independent solutions，那么任意解都能写成

$$
\boxed{y=c_1y_1+c_2y_2.}
$$

这说明：**二阶 homogeneous linear equation 的解集是一个二维线性空间。**

例如，对

$$
y''+y=0,
$$

已知 $\cos x$ 和 $\sin x$ 是线性无关解，所以通解为

$$
\boxed{y=c_1\cos x+c_2\sin x.}
$$

## Linear Equations of Higher Order

### General Form

$n$ 阶 linear ODE 一般写成

$$
y^{(n)}+p_1(x)y^{(n-1)}+\cdots+p_{n-1}(x)y'+p_n(x)y=f(x).
$$

若 $f(x)\equiv 0$，则为 homogeneous；否则为 nonhomogeneous。

对应的 $n$ 阶 IVP 通常要给出

$$
y(x_0),y'(x_0),\dots,y^{(n-1)}(x_0).
$$

### Homogeneous Solution Space

二阶情形的结构会自然推广到更高阶：

- homogeneous $n$ 阶 linear ODE 的解集构成线性空间；
- 若 $y_1,\dots,y_n$ 是 $n$ 个 linearly independent solutions，则

$$
\boxed{y_c=c_1y_1+\cdots+c_ny_n}
$$

就是 homogeneous equation 的通解。

### Structure of Nonhomogeneous Solutions

对 nonhomogeneous equation

$$
L[y]=f(x),
$$

若 $y_p$ 是一个 particular solution，而 $y_c$ 是对应 homogeneous equation $L[y]=0$ 的通解，那么原方程的通解是

$$
\boxed{Y=y_c+y_p.}
$$


> **总解 = complementary solution + particular solution**。

## Homogeneous Equations with Constant Coefficients

现在考虑

$$
\boxed{ay''+by'+cy=0,\qquad a,b,c\in\mathbb R,\ a\neq 0.}
$$

### Characteristic Equation

尝试指数型解

$$
y=e^{rx}.
$$

则

$$
y'=re^{rx},\qquad y''=r^2e^{rx}.
$$

代回原方程得到

$$
(ar^2+br+c)e^{rx}=0.
$$

因为 $e^{rx}\neq 0$，所以得到 **characteristic equation**

$$
\boxed{ar^2+br+c=0.}
$$

也就是说，求这个 ODE 的关键变成了解一个二次代数方程。

### Distinct Real Roots

若 characteristic equation 有两个不同实根 $r_1\neq r_2$，则

$$
\boxed{y=c_1e^{r_1x}+c_2e^{r_2x}.}
$$

例如，

$$
y''-5y'+6y=0
$$

的特征方程为

$$
r^2-5r+6=(r-2)(r-3)=0,
$$

故通解为

$$
\boxed{y=c_1e^{2x}+c_2e^{3x}.}
$$

### Repeated Real Roots

若 characteristic equation 有一个重实根 $r$，重数为 $m$，则对应解的结构为

$$
\boxed{(C_1+C_2x+\cdots+C_mx^{m-1})e^{rx}.}
$$

特别地，在二阶情形（$m=2$）下，

$$
\boxed{y=(c_1+c_2x)e^{rx}.}
$$

例如，

$$
y''+2y'+y=0
$$

的特征方程是

$$
(r+1)^2=0,
$$

所以

$$
\boxed{y=(c_1+c_2x)e^{-x}.}
$$

> [!TIP]
> 重根并不是“重复写同一个 $e^{rx}$”，而是会产生
> $$
> e^{rx},\ xe^{rx},\ x^2e^{rx},\dots
> $$
> 这样一串线性无关解。

### Complex Roots

若特征方程有一对共轭复根

$$
r=\alpha\pm \beta i,
\qquad \beta\neq 0,
$$

则对应的实通解可写为

$$
\boxed{y=e^{\alpha x}(c_1\cos \beta x+c_2\sin \beta x).}
$$

这来自 Euler formula：

$$
e^{i\theta}=\cos\theta+i\sin\theta.
$$

例如，

$$
y''-4y'+5y=0
$$

的特征方程是

$$
r^2-4r+5=0,
$$

解得

$$
r=2\pm i,
$$

所以通解为

$$
\boxed{y=e^{2x}(c_1\cos x+c_2\sin x).}
$$

### Repeated Complex Roots

若复根对 $\alpha\pm \beta i$ 的重数为 $k$，则对应解的部分可写成

$$
\boxed{
\sum_{p=0}^{k-1} x^p e^{\alpha x}(c_p\cos \beta x+d_p\sin \beta x).
}
$$

这就是“重复复根”的版本，本质上仍然是“重数带来额外的 $x^p$”。

### Polynomial Differential Operators

为了更系统地理解重根现象，可以引入微分算子

$$
D=\frac{d}{dx}.
$$

那么方程可以写成

$$
Ly=(aD^2+bD+c)y=0.
$$

更一般地，$n$ 阶常系数方程对应算子

$$
L=a_nD^n+a_{n-1}D^{n-1}+\cdots+a_1D+a_0.
$$

这些算子在形式上和普通多项式很像。例如

$$
(D-a)(D-b)=D^2-(a+b)D+ab.
$$


### Standard Workflow

求解常系数 homogeneous linear ODE 的标准步骤可以记成：

**Step 1.** 写 characteristic equation。  
**Step 2.** 求根。  
**Step 3.** 判断根的类型：

- distinct real roots；
- repeated real root；
- complex conjugate roots；
- repeated complex roots。

**Step 4.** 按对应模板写 general solution。  
**Step 5.** 若有 initial conditions，再解常数。

## Bonus: Euler Equations

### Standard Form

**Euler equation**（也叫 equidimensional equation）的一般形式是

$$
a_0x^n y^{(n)}+a_1x^{n-1}y^{(n-1)}+\cdots+a_{n-1}xy'+a_n y=f(x).
$$

它最核心的特征是：$x$ 的幂次和导数阶数恰好匹配。

二阶 homogeneous Euler equation 写成

$$
\boxed{a_0x^2y''+a_1xy'+a_2y=0.}
$$

### Change of Variables

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

所以 Euler equation 可以通过变量代换变成 constant-coefficient equation。

例如

$$
a_0x^2y''+a_1xy'+a_2y=0
$$

会变成

$$
a_0D(D-1)y+a_1Dy+a_2y=0,
$$

也就是

$$
a_0\frac{d^2y}{dt^2}+(a_1-a_0)\frac{dy}{dt}+a_2y=0.
$$

### Euler Characteristic Equation

对二阶 homogeneous Euler equation

$$
a_0x^2y''+a_1xy'+a_2y=0,
$$

代入试探解 $y=x^\lambda$，可得到 characteristic equation

$$
\boxed{a_0\lambda(\lambda-1)+a_1\lambda+a_2=0.}
$$

### Solution Forms

Euler equation 的解型和常系数方程非常平行，只是把 $e^{rx}$ 换成了 $x^\lambda$ 或带 $\ln x$ 的形式。

- 若有两个不同实根 $\lambda_1,\lambda_2$，则
  $$
  y=c_1x^{\lambda_1}+c_2x^{\lambda_2};
  $$
- 若有重根 $\lambda$，则
  $$
  y=x^\lambda(c_1+c_2\ln x);
  $$
- 若有复根 $\alpha\pm \beta i$，则
  $$
  y=x^\alpha\bigl(c_1\cos(\beta\ln x)+c_2\sin(\beta\ln x)\bigr).
  $$

因此 Euler equation 的本质是：经过 $x=e^t$ 的代换后，它就是一个 disguised constant-coefficient equation。

## Bonus: Reduction of Order

### Basic Idea

考虑标准形式的 homogeneous second-order linear equation

$$
y''+p(x)y'+q(x)y=0.
$$

如果已经知道一个非零解 $y_1(x)$，那么就尝试把第二个解设成

$$
\boxed{y_2=v(x)y_1(x).}
$$

这就叫 **reduction of order**。

直观上，它表示第二个解和第一个解“形状相近”，但相差一个非常数因子。

### Reduction Formula

把 $y_2=v(x)y_1(x)$ 代入原方程并整理后，可得到公式

$$
\boxed{y_2=y_1\int \frac{e^{-\int p(x)\,dx}}{y_1(x)^2}\,dx.
}
$$

只要这个积分结果不是 $y_1$ 的常数倍，就得到一个与 $y_1$ 线性无关的第二个解。

**Reduction of order** 特别适用于以下情形：

- 某个解可以直接看出来；
- 题目已经给了一个解；
- 方程有某种明显的 repeated structure，需要找第二个 independent solution。

> [!IMPORTANT]
> 使用公式前，必须先把方程写成标准形式
> $$
> y''+p(x)y'+q(x)y=0.
> $$

## Nonhomogeneous Equations and Particular Solutions

$$
L[y]=f(x)
$$

对应的 homogeneous equation

$$
L[y]=0
$$

的 general solution 为 $y_c$，再找到原方程的一个 **particular solution** $y_p$，那么总解就是

$$
\boxed{y=y_c+y_p.}
$$

因此求解非齐次方程始终是两步：

1. **先求 complementary solution** $y_c$；
2. **再求一个 particular solution** $y_p$。

本节主要有两种思路：

- **Method of Undetermined Coefficients**；
- **Variation of Parameters**。

前者适用于 **constant-coefficient linear ODE** 且右端 $f(x)$ 属于某些“封闭”的特殊类型；后者更理论。

### Method of Undetermined Coefficients

这一方法只适用于 **constant-coefficient nonhomogeneous linear ODE**，并且右端必须是有限组合的“好函数”：

- polynomial $P_m(x)$；
- exponential $e^{rx}$；
- trigonometric terms $\sin kx,\cos kx$；
- 以及它们的乘积。

**trial solution 选成与右端“同类型”**，然后代回方程解待定系数。

最常见的 trial 形式：

- 若 $f(x)=P_m(x)$，则试
  $$
  y_p=A_0+A_1x+\cdots+A_mx^m.
  $$
- 若 $f(x)=e^{rx}$，则试
  $$
  y_p=Ae^{rx}.
  $$
- 若 $f(x)=P_m(x)e^{rx}$，则试
  $$
  y_p=e^{rx}Q_m(x).
  $$
- 若 $f(x)=a\cos kx+b\sin kx$，则试
  $$
  y_p=A\cos kx+B\sin kx.
  $$
- 若 $f(x)=e^{rx}(a\cos kx+b\sin kx)$，则试
  $$
  y_p=e^{rx}(A\cos kx+B\sin kx).
  $$

### Duplication and Multiplication by $x^s$

判断 **trial solution 是否与 $y_c$ 重合**。

若按常规规则得到的 $y_p^{(0)}$ 与 complementary solution $y_c$ 中已有项重复，则必须整体乘上最小的幂次 $x^s$，直到重合消失：

$$
\boxed{y_p=x^s y_p^{(0)}}
$$

其中 $s$ 取最小非负整数。

**Example：**

$$
y^{(3)}+y''=3e^x+4x^2.
$$

先解对应齐次方程：

$$
r^3+r^2=0\quad\Longrightarrow\quad r=0,0,-1,
$$

所以

$$
y_c(x)=c_1+c_2x+c_3e^{-x}.
$$

对右端的两部分先分别猜：

$$
(Ae^x)+(B+Cx+Dx^2).
$$

其中 $Ae^x$ 与 $y_c$ **不重合**；但 polynomial 部分中的 $1,x$ 已经出现在 $y_c$ 里，因为 $r=0$ 是 **double root**，所以这一整块要乘 $x^2$：

$$
y_p=Ae^x+Bx^2+Cx^3+Dx^4.
$$

再代回方程可以解出系数。这里最重要的不是最后的数字，而是这个判断：

> **只对发生重合的那一块乘 $x^s$，并且 $s$ 由相应特征根的重数决定。**

**Example：**

一个非常典型的“只需写 trial form”的例子是

$$
y^{(3)}+9y'=x\sin x+x^2e^{2x}.
$$

其 characteristic equation 为

$$
r^3+9r=0\quad\Longrightarrow\quad r=0,\pm 3i,
$$

所以

$$
y_c(x)=c_1+c_2\cos 3x+c_3\sin 3x.
$$

对右端两部分分别判断：

- $x\sin x$ 的求导会生成
  $$
  \cos x,\ \sin x,\ x\cos x,\ x\sin x;
  $$
- $x^2e^{2x}$ 的求导会生成
  $$
  e^{2x},\ xe^{2x},\ x^2e^{2x}.
  $$

并且这些项都与 $y_c$ 不重复，因此 particular solution 的一般形式可取

$$
\boxed{
y_p(x)=A\cos x+B\sin x+Cx\cos x+Dx\sin x+Ee^{2x}+Fxe^{2x}+Gx^2e^{2x}.
}
$$

这里最重要的是把 **closure under differentiation** 的整组项一次写完整。

### Variation of Parameters

当右端 $f(x)$ 不再属于待定系数法可处理的“有限封闭类型”时，就需要更一般的方法。比如

$$
y''+y=\tan x
$$

中，$\tan x$ 的导数会不断产生新组合，无法用有限项试解处理，所以 **method of undetermined coefficients** 失效。这时就要用 **variation of parameters**。

设已知 homogeneous equation

$$
y''+p(x)y'+q(x)y=0
$$

的两个 linearly independent solutions 为 $y_1(x),y_2(x)$，则

$$
y_c=c_1y_1+c_2y_2.
$$

参数变易法的想法是：

> 不把 $c_1,c_2$ 当成常数，而是把它们“变成函数”。

于是设 particular solution 为

$$
\boxed{y_p=u_1(x)y_1(x)+u_2(x)y_2(x).}
$$

为了避免求导后出现更高阶的麻烦项，额外要求

$$
\boxed{u_1'y_1+u_2'y_2=0.}
$$

于是

$$
y_p'=u_1y_1'+u_2y_2'.
$$

再代入原方程，可推出第二个方程

$$
\boxed{u_1'y_1'+u_2'y_2'=f(x).}
$$

于是得到关于 $u_1',u_2'$ 的线性方程组：

$$
\begin{cases}
u_1'y_1+u_2'y_2=0,\\
u_1'y_1'+u_2'y_2'=f(x).
\end{cases}
$$

其系数矩阵正是 Wronskian matrix。因为 $y_1,y_2$ 线性无关，所以

$$
W(y_1,y_2)=y_1y_2'-y_1'y_2\neq 0,
$$

故这个方程组有唯一解。用 Cramer’s rule 得

$$
u_1'=-\frac{f(x)y_2(x)}{W(x)},
\qquad
u_2'=\frac{f(x)y_1(x)}{W(x)}.
$$

积分后代回，就得到

$$
\boxed{
y_p(x)=
-y_1(x)\int \frac{y_2(x)f(x)}{W(x)}\,dx
+y_2(x)\int \frac{y_1(x)f(x)}{W(x)}\,dx.
}
$$

这就是二阶情形的 **variation of parameters formula**。

> [!TIP]
> 求 $u_1,u_2$ 时通常不写积分常数，因为这些常数最终只会回到 $C_1y_1+C_2y_2$，本质上属于齐次解部分。

### Example:
**Example 1**
$$
y''+y=\tan x
$$

先解 homogeneous equation：

$$
y''+y=0
\quad\Longrightarrow\quad
y_1=\cos x,\qquad y_2=\sin x.
$$

于是令

$$
y_p=u_1\cos x+u_2\sin x.
$$

附加条件与原方程给出线性系统：

$$
\begin{cases}
u_1'\cos x+u_2'\sin x=0,\\
-u_1'\sin x+u_2'\cos x=\tan x.
\end{cases}
$$

解得

$$
u_1'=\cos x-\sec x,
\qquad
u_2'=\sin x.
$$

因此可取

$$
u_1=\sin x-\ln|\sec x+\tan x|,
\qquad
u_2=-\cos x.
$$

代回后，中间有两项会抵消，得到 particular solution

$$
\boxed{y_p(x)=-(\cos x)\ln|\sec x+\tan x|.}
$$

> **先求 $y_c$，再选合适的方法求 $y_p$。**

**Example 2**

$$
y''-2y'+y=2xe^x.
$$

先解齐次方程：

$$
(r-1)^2=0,
$$

因此

$$
y_c=(c_1+c_2x)e^x.
$$

取两个基本解

$$
y_1=e^x,y_2=xe^x.
$$

它们的 Wronskian 为

$$
W=y_1y_2'-y_1'y_2=e^x(1+x)e^x-e^x(xe^x)=e^{2x}.
$$

原方程右端为

$$
f(x)=2xe^x.
$$

由参数变易公式，

$$
u_1'=-\frac{f(x)y_2(x)}{W(x)}=-\frac{(2xe^x)(xe^x)}{e^{2x}}=-2x^2,
$$

$$
u_2'=\frac{f(x)y_1(x)}{W(x)}=\frac{(2xe^x)(e^x)}{e^{2x}}=2x.
$$

积分得

$$
u_1=-\frac{2}{3}x^3,u_2=x^2.
$$

于是 particular solution 可取为

$$
y_p=u_1y_1+u_2y_2
=\left(-\frac{2}{3}x^3\right)e^x+x^2(xe^x)
=\frac{1}{3}x^3e^x.
$$

因此总解为

$$
\boxed{y=(c_1+c_2x)e^x+\frac{1}{3}x^3e^x.}
$$

这里也能顺便看出：因为右端 $2xe^x$ 与齐次解中的 $e^x,xe^x$ 发生重合，所以若用 undetermined coefficients，trial form 需要从 $x^2e^x$ 再往上乘到三次，最终也会得到 $x^3e^x$ 这一型。

**Example 3**

$$
x^2y''-3xy'+4y=x^2\ln x.
$$

这是一道 **Euler equation 的非齐次版本**。先化成标准形式：

$$
y''-\frac{3}{x}y'+\frac{4}{x^2}y=\ln x.
$$

对应 homogeneous equation 为

$$
x^2y''-3xy'+4y=0.
$$

代入 $y=x^\lambda$，得到特征方程

$$
\lambda(\lambda-1)-3\lambda+4=0
\quad\Longrightarrow\quad
(\lambda-2)^2=0.
$$

所以

$$
y_c=x^2(c_1+c_2\ln x).
$$

取两个基本解

$$
y_1=x^2,
\qquad y_2=x^2\ln x.
$$

计算 Wronskian：

$$
y_1'=2x,
\qquad y_2'=2x\ln x+x,
$$

因此

$$
W=y_1y_2'-y_1'y_2
=x^2(2x\ln x+x)-2x(x^2\ln x)=x^3.
$$

标准形式右端为

$$
f(x)=\ln x.
$$

于是

$$
u_1'=-\frac{f(x)y_2(x)}{W(x)}
=-\frac{(\ln x)(x^2\ln x)}{x^3}
=-\frac{(\ln x)^2}{x},
$$

$$
u_2'=\frac{f(x)y_1(x)}{W(x)}
=\frac{(\ln x)x^2}{x^3}
=\frac{\ln x}{x}.
$$

积分得

$$
u_1=-\frac{1}{3}(\ln x)^3,
\qquad
u_2=\frac{1}{2}(\ln x)^2.
$$

所以

$$
y_p=u_1y_1+u_2y_2
=-\frac{1}{3}x^2(\ln x)^3+\frac{1}{2}x^2(\ln x)^3
=\frac{1}{6}x^2(\ln x)^3.
$$

故总解为

$$
\boxed{y=x^2(c_1+c_2\ln x)+\frac{1}{6}x^2(\ln x)^3.}
$$

**Example 4**

$$
(1-x)y''+xy'-y=-(1-x)^2.
$$

这道题最能体现三种方法之间的配合：

1. 先化标准形式；
2. 用观察法 + reduction of order 求 homogeneous equation 的两个基本解；
3. 再用 variation of parameters 求 particular solution。

先把方程除以 $1-x$（默认在不跨过 $x=1$ 的区间上讨论）：

$$
y''+\frac{x}{1-x}y'-\frac{1}{1-x}y=-(1-x).
$$

所以

$$
p(x)=\frac{x}{1-x},
\qquad
q(x)=-\frac{1}{1-x},
\qquad
f(x)=-(1-x).
$$

先看 homogeneous equation：

$$
(1-x)y''+xy'-y=0.
$$

直接试一个简单函数，发现

$$
y_1=x
$$

就是一个解，因为代回可得

$$
(1-x)\cdot 0+x\cdot 1-x=0.
$$

接下来用 **reduction of order** 求第二个解。由公式

$$
y_2=y_1\int \frac{e^{-\int p(x)dx}}{y_1^2}\,dx,
$$

先算

$$
\int p(x)dx=\int \frac{x}{1-x}dx=-x-\ln|1-x|.
$$

因此

$$
e^{-\int p(x)dx}=e^x|1-x|.
$$

在固定区间内去掉绝对值记号后，得到

$$
y_2=x\int \frac{e^x(1-x)}{x^2}\,dx.
$$

注意到

$$
\frac{d}{dx}\left(\frac{e^x}{x}\right)=\frac{e^x(x-1)}{x^2}=-\frac{e^x(1-x)}{x^2},
$$

所以积分可取为

$$
\int \frac{e^x(1-x)}{x^2}dx=-\frac{e^x}{x}.
$$

从而

$$
y_2=x\left(-\frac{e^x}{x}\right)=-e^x.
$$

去掉无关常数倍后，可取

$$
y_2=e^x.
$$

于是 homogeneous part 的通解为

$$
y_c=c_1x+c_2e^x.
$$

现在开始做 variation of parameters。先算 Wronskian：

$$
W=y_1y_2'-y_1'y_2
=x\cdot e^x-1\cdot e^x=e^x(x-1).
$$

由参数变易公式，

$$
u_1'=-\frac{f(x)y_2(x)}{W(x)}
=-\frac{[-(1-x)]e^x}{e^x(x-1)}=-1,
$$

$$
u_2'=\frac{f(x)y_1(x)}{W(x)}
=\frac{[-(1-x)]x}{e^x(x-1)}=xe^{-x}.
$$

积分得

$$
u_1=-x,
$$

而

$$
u_2=\int xe^{-x}dx=-(x+1)e^{-x}.
$$

所以

$$
y_p=u_1y_1+u_2y_2
=(-x)x+[-(x+1)e^{-x}]e^x
=-x^2-x-1.
$$

检验一下：

$$
y_p'=-2x-1,
\qquad y_p''=-2,
$$

代回原方程可得

$$
(1-x)(-2)+x(-2x-1)-(-x^2-x-1)=-(1-x)^2,
$$

确实成立。

因此总解为

$$
\boxed{y=c_1x+c_2e^x-x^2-x-1.}
$$

这道题的结构非常值得记住：

- **已知一个 homogeneous solution** $\Rightarrow$ 用 **reduction of order**；
- **已有两组基本解，要求 nonhomogeneous particular solution** $\Rightarrow$ 用 **variation of parameters**。

## Endpoint Problems and Eigenvalues

前面大部分内容都建立在 **initial value problem (IVP)** 的唯一性之上。一个典型二阶 IVP 是

$$
y''+p(x)y'+q(x)y=0,
\qquad y(a)=0,
\qquad y'(a)=0,
$$

此时唯一解是平凡解 $y\equiv 0$。但如果把两个附加条件分开放在区间两端：

$$
y''+p(x)y'+q(x)y=0,
\qquad y(a)=0,
\qquad y(b)=0,
$$

那么问题就变成 **endpoint problem** 或 **boundary value problem (BVP)**。这时情形和 IVP 非常不同：它可能没有非平凡解，也可能有无穷多个非平凡解。

### IVP and BVP

可以这样对比记忆：

- **IVP**：附加条件都放在同一个点，例如 $y(0),y'(0)$；
- **BVP**：附加条件放在不同的边界点，例如 $y(0),y(L)$ 或 $y(0),y'(L)$。

### Example
**Example 1: No Nontrivial Solution**

考虑

$$
y''+3y=0,
\qquad y(0)=0,
\qquad y(\pi)=0.
$$

通解为

$$
y(x)=A\cos(\sqrt3\,x)+B\sin(\sqrt3\,x).
$$

由 $y(0)=0$ 得 $A=0$，于是

$$
y(x)=B\sin(\sqrt3\,x).
$$

再代入 $y(\pi)=0$：

$$
B\sin(\pi\sqrt3)=0.
$$

由于 $\sin(\pi\sqrt3)\neq 0$，只能有 $B=0$，所以此 BVP 只有平凡解：

$$
\boxed{y(x)\equiv 0.}
$$

**Example 2: Infinitely Many Nontrivial Solutions**

再看

$$
y''+4y=0,
\qquad y(0)=0,
\qquad y(\pi)=0.
$$

通解为

$$
y(x)=A\cos 2x+B\sin 2x.
$$

由 $y(0)=0$ 得 $A=0$，故

$$
y(x)=B\sin 2x.
$$

此时

$$
y(\pi)=B\sin 2\pi=0
$$

对任意 $B$ 都成立，所以所有

$$
\boxed{y(x)=B\sin 2x}
$$

都是解。只要 $B\neq 0$，就是非平凡解，因此这里有 **无穷多个** 非平凡解。


> **边值问题并不自动唯一，参数稍微变化，就可能在“无解”和“无穷多解”之间切换。**

### Eigenvalues and Eigenfunctions

把上述问题统一写成

$$
y''+p(x)y'+\lambda q(x)y=0,
\qquad y(a)=0,
\qquad y(b)=0,
$$

其中 $\lambda$ 是参数。我们关心的是：**哪些 $\lambda$ 会让这个 BVP 有非平凡解？**

若某个 $\lambda=\lambda_*$ 使问题存在非零解，则称 $\lambda_*$ 为一个 **eigenvalue**；对应的非零解称为 **eigenfunction**。

> [!IMPORTANT]
> 对同一个 eigenvalue，eigenfunction 的任意非零常数倍仍然是 eigenfunction，所以真正重要的是它的“形状”，而不是倍数。

### Classical Model
$$
y''+\lambda y=0, y(0)=0, y(L)=0
$$

分三种情况讨论。

**Case 1: $\lambda=0$**

方程变成

$$
y''=0,
$$

通解为

$$
y(x)=Ax+B.
$$

由边值条件 $y(0)=0$、$y(L)=0$ 立刻推出 $A=B=0$，所以只有平凡解，即

$$
\lambda=0\ \text{不是 eigenvalue。}
$$

**Case 2: $\lambda<0$**

设

$$
\lambda=-\alpha^2,
\qquad \alpha>0.
$$

则方程变成

$$
y''-\alpha^2y=0,
$$

通解可写成

$$
y(x)=A\cosh(\alpha x)+B\sinh(\alpha x).
$$

由 $y(0)=0$ 得 $A=0$，于是

$$
y(x)=B\sinh(\alpha x).
$$

再代入 $y(L)=0$ 得

$$
B\sinh(\alpha L)=0.
$$

由于 $\sinh(\alpha L)\neq 0$，只能 $B=0$。因此 $\lambda<0$ 也不会产生非平凡解。

**Case 3: $\lambda>0$**

设

$$
\lambda=\alpha^2,
\qquad \alpha>0.
$$

则方程为

$$
y''+\alpha^2y=0,
$$

通解为

$$
y(x)=A\cos(\alpha x)+B\sin(\alpha x).
$$

由 $y(0)=0$ 得 $A=0$，故

$$
y(x)=B\sin(\alpha x).
$$

若要有非平凡解，就必须 $B\neq 0$，所以

$$
\sin(\alpha L)=0.
$$

这说明

$$
\alpha L=n\pi,
\qquad n=1,2,3,\dots
$$

因此

$$
\boxed{\lambda_n=\frac{n^2\pi^2}{L^2},\qquad n=1,2,3,\dots}
$$

对应的 eigenfunctions 可取

$$
\boxed{y_n(x)=\sin\frac{n\pi x}{L},\qquad n=1,2,3,\dots}
$$

这说明一个典型现象：**eigenvalues 通常不是连续的一段，而是一串离散的数列。**

**Example 4: Changing Boundary Conditions Changes the Spectrum**

若把边界条件改成

$$
y''+\lambda y=0,
\qquad y(0)=0,
\qquad y'(L)=0,
$$

仍先考虑 $\lambda>0$，设 $\lambda=\alpha^2$。此时

$$
y(x)=A\cos(\alpha x)+B\sin(\alpha x).
$$

由 $y(0)=0$ 得 $A=0$，所以

$$
y(x)=B\sin(\alpha x),
\qquad y'(x)=B\alpha\cos(\alpha x).
$$

条件 $y'(L)=0$ 给出

$$
B\alpha\cos(\alpha L)=0.
$$

若要有非平凡解，必须 $B\neq 0$，因此

$$
\cos(\alpha L)=0
\quad\Longrightarrow\quad
\alpha L=\frac{(2n-1)\pi}{2},
\qquad n=1,2,3,\dots
$$

从而

$$
\boxed{\lambda_n=\frac{(2n-1)^2\pi^2}{4L^2},\qquad n=1,2,3,\dots}
$$

对应 eigenfunctions 为

$$
\boxed{y_n(x)=\sin\frac{(2n-1)\pi x}{2L},\qquad n=1,2,3,\dots}
$$

这说明：**边界条件一变，允许的模态和对应的 spectrum 也会跟着改变。**

### General Procedure: Determinant Equation

一种统一 procedure。

先把 general solution 写成

$$
y=A\,y_1(x,\lambda)+B\,y_2(x,\lambda).
$$

代入两个 boundary conditions 后，总会得到关于 $A,B$ 的齐次线性方程组：

$$
\alpha_1(\lambda)A+\beta_1(\lambda)B=0,
$$

$$
\alpha_2(\lambda)A+\beta_2(\lambda)B=0.
$$

要有 nontrivial solution $(A,B)\neq (0,0)$，充要条件就是系数行列式为 0：

$$
\boxed{
D(\lambda)=
\alpha_1(\lambda)\beta_2(\lambda)
-\alpha_2(\lambda)\beta_1(\lambda)
=0.
}
$$

因此：

> **eigenvalues 正是 determinant equation 的实根。**

这和 linear algebra 中“齐次线性方程组有非零解当且仅当行列式为 0”完全一致。


## Bonus: Additional Examples and Applications

> **把问题转化成 ODE，再利用 ODE 的结构来解决。**

### An ODE in the Guise of an Integral Equation

题目是

$$
f(x)=e^{-x}-
\int_0^x t\,f(x-t)\,dt.
$$

表面上这是一个 integral equation，但它其实可以化成 ODE。

先把卷积型积分改写。令 $s=x-t$，则 $t=x-s$，于是

$$
\int_0^x t f(x-t)dt
=\int_0^x (x-s)f(s)ds.
$$

记

$$
I(x)=\int_0^x (x-s)f(s)ds.
$$

那么原方程就是

$$
f(x)=e^{-x}-I(x).
$$

接下来对 $I(x)$ 求导。由 Leibniz rule，

$$
I'(x)=\int_0^x f(s)ds,
$$

再求一次导数得到

$$
I''(x)=f(x).
$$

而原方程又告诉我们

$$
I(x)=e^{-x}-f(x).
$$

两边求两次导数可得

$$
I''(x)=e^{-x}-f''(x).
$$

由于 $I''(x)=f(x)$，所以

$$
f(x)=e^{-x}-f''(x),
$$

也就是

$$
\boxed{f''+f=e^{-x}.}
$$

现在还需要初始条件。由原 integral equation 在 $x=0$ 处的取值，

$$
f(0)=e^0-0=1.
$$

再对原方程求导。由

$$
I'(x)=\int_0^x f(s)ds,
$$

得到

$$
f'(x)=-e^{-x}-\int_0^x f(s)ds.
$$

令 $x=0$，便有

$$
f'(0)=-1.
$$

因此要解的是 IVP：

$$
\begin{cases}
 f''+f=e^{-x},\\
 f(0)=1,\\
 f'(0)=-1.
\end{cases}
$$

先解齐次方程：

$$
f_h=c_1\cos x+c_2\sin x.
$$

对右端 $e^{-x}$ 取 particular solution 形如 $Ae^{-x}$，代入得

$$
2Ae^{-x}=e^{-x},
$$

所以

$$
A=\frac12.
$$

故通解为

$$
f(x)=c_1\cos x+c_2\sin x+\frac12 e^{-x}.
$$

用初值条件：

$$
f(0)=c_1+\frac12=1 \Rightarrow c_1=\frac12,
$$

$$
f'(x)=-c_1\sin x+c_2\cos x-\frac12 e^{-x},
$$

所以

$$
f'(0)=c_2-\frac12=-1 \Rightarrow c_2=-\frac12.
$$

最终得到

$$
\boxed{f(x)=\frac12\cos x-\frac12\sin x+\frac12 e^{-x}.}
$$

**某些 integral equation 可以通过求导变成更熟悉的 differential equation。**

### Two Integrals by the Feynman Method

> **在积分号下对参数求导（differentiate under the integral sign）**。


1. 先引入一个参数，把原积分嵌入一个更一般的积分族；
2. 对参数求导后，积分会变简单；
3. 解出关于参数的 ODE，再把参数取回原值。

**Example 1**
$$
\text{Compute } \int_0^{\infty}\dfrac{\sin x}{x}\,dx
$$

定义

$$
F(a)=\int_0^{\infty} e^{-ax}\frac{\sin x}{x}\,dx,
\qquad a>0.
$$

当 $a>0$ 时，指数衰减保证这个积分非常好处理。对 $a$ 求导：

$$
F'(a)=\int_0^{\infty}\frac{\partial}{\partial a}
\left(e^{-ax}\frac{\sin x}{x}\right)dx
=-\int_0^{\infty}e^{-ax}\sin x\,dx.
$$

而

$$
\int_0^{\infty}e^{-ax}\sin x\,dx=\frac{1}{1+a^2},
\qquad a>0.
$$

所以

$$
F'(a)=-\frac{1}{1+a^2}.
$$

这是一个一阶 ODE，积分得

$$
F(a)=C-\arctan a.
$$

为了确定常数，考察 $a\to+\infty$。此时 $e^{-ax}\to 0$ 很快，所以

$$
F(a)\to 0.
$$

于是

$$
0=C-\frac{\pi}{2}
\quad\Longrightarrow\quad
C=\frac{\pi}{2}.
$$

因此

$$
F(a)=\frac{\pi}{2}-\arctan a.
$$

最后令 $a\to 0^+$，得到

$$
\int_0^{\infty}\frac{\sin x}{x}\,dx
=F(0^+)
=\frac{\pi}{2}.
$$

即

$$
\boxed{\int_0^{\infty}\frac{\sin x}{x}\,dx=\frac{\pi}{2}.}
$$
**Example 2**
$$
\text{Compute } \int_0^{\infty}\frac{\cos x}{x^2+1}\,dx.
$$

这题可以和前一个例子统一起来处理。仍然定义参数积分族

$$
G(a)=\int_0^{\infty}\frac{\cos(ax)}{x^2+1}\,dx,
\qquad a\ge 0.
$$

目标是求 $G(1)$。

先对 $a$ 求导：

$$
G'(a)=\int_0^\infty \frac{-x\sin(ax)}{x^2+1}\,dx.
$$

这里把 integrand 改写成

$$
\frac{x}{x^2+1}
=\frac{x^2}{x(x^2+1)}.
$$

于是就有

$$
G'(a)
=-\int_0^\infty \frac{x^2}{x^2+1}\cdot \frac{\sin(ax)}{x}\,dx.
$$

再利用

$$
\frac{x^2}{x^2+1}=1-\frac{1}{x^2+1},
$$

可得

$$
G'(a)
=-\int_0^\infty \frac{\sin(ax)}{x}\,dx
+\int_0^\infty \frac{1}{x^2+1}\cdot\frac{\sin(ax)}{x}\,dx.
$$

对第二项记

$$
H(a)=\int_0^\infty \frac{\sin(ax)}{x(x^2+1)}\,dx.
$$

那么

$$
G'(a)=-\int_0^\infty \frac{\sin(ax)}{x}\,dx+H(a).
$$

而前一个例子已经求过

$$
F(a)=\int_0^\infty \frac{\sin(ax)}{x}\,dx,
\qquad a>0,
$$

其值为

$$
F(a)=\frac{\pi}{2}.
$$

因此对 $a>0$，

$$
G'(a)=-\frac{\pi}{2}+H(a).
$$

下面来求 $H(a)$。对 $a$ 求导：

$$
H'(a)=\int_0^\infty \frac{\cos(ax)}{x^2+1}\,dx=G(a).
$$

所以我们已经得到

$$
G'(a)=-\frac{\pi}{2}+H(a),
\qquad
H'(a)=G(a).
$$

再对第一式求导：

$$
G''(a)=H'(a)=G(a).
$$

于是

$$
\boxed{G''-G=0\qquad (a>0).}
$$

通解为

$$
G(a)=C_1e^a+C_2e^{-a}.
$$

当 $a\to+\infty$ 时，由于 $\cos(ax)$ 振荡越来越快，积分趋于 $0$，所以

$$
G(a)\to 0.
$$

因此必须有

$$
C_1=0,
$$

故

$$
G(a)=C_2e^{-a}.
$$

再代入 $a=0$：

$$
G(0)=\int_0^\infty \frac{1}{x^2+1}\,dx
=\left[\arctan x\right]_0^\infty
=\frac{\pi}{2}.
$$

所以

$$
C_2=\frac{\pi}{2}.
$$

最终得到

$$
\boxed{G(a)=\frac{\pi}{2}e^{-a}.}
$$

令 $a=1$，便有

$$
\boxed{\int_0^{\infty}\frac{\cos x}{x^2+1}\,dx=\frac{\pi}{2e}.}
$$

这两题都体现了同一个核心：

> **把一个看起来不容易直接算的积分，升级成一个带参数的函数，再去解它满足的微分方程。**

### Kepler's First and Second Laws
**怎样用 ODE + 极坐标把物理定律推成轨道方程。**

#### 1. Polar Coordinates 下的基础公式

在平面极坐标中，记

$$
\hat r=(\cos\theta,\sin\theta)^T,
\qquad
\hat\theta=(-\sin\theta,\cos\theta)^T.
$$

这是随时间转动的一组单位基。

它们满足

$$
\frac{d\hat r}{dt}=\dot\theta\,\hat\theta,
\qquad
\frac{d\hat\theta}{dt}=-\dot\theta\,\hat r.
$$

如果行星位置向量写成

$$
\vec r=r\hat r,
$$

那么速度为

$$
\dot{\vec r}=\frac{d}{dt}(r\hat r)
=\dot r\,\hat r+r\dot\theta\,\hat\theta.
$$

再求一次导，得到加速度分解：

$$
\ddot{\vec r}
=(\ddot r-r\dot\theta^2)\hat r+(2\dot r\dot\theta+r\ddot\theta)\hat\theta.
$$


#### 2. Newton 引力定律与运动方程

中心天体质量为 $M$，行星质量为 $m$。万有引力大小为

$$
\frac{GMm}{r^2},
$$

方向始终沿径向指向太阳，所以矢量形式为

$$
\vec F=-\frac{GMm}{r^2}\hat r.
$$

由 Newton 第二定律

$$
m\ddot{\vec r}=\vec F,
$$

代入极坐标加速度分解，比较 $\hat r$ 与 $\hat\theta$ 方向系数，得到

$$
\boxed{\ddot r-r\dot\theta^2=-\frac{GM}{r^2}}
$$

和

$$
\boxed{2\dot r\dot\theta+r\ddot\theta=0.}
$$

#### 3. Kepler Second Law

第二个方程可以整理成

$$
\frac{d}{dt}(r^2\dot\theta)=0.
$$

因此

$$
\boxed{r^2\dot\theta=L}
$$

其中 $L$ 是常数。

而极短时间 $dt$ 内扫过的扇形面积近似为

$$
dA=\frac12 r^2 d\theta,
$$

所以面积速度为

$$
\frac{dA}{dt}=\frac12 r^2\dot\theta=\frac{L}{2}.
$$

这说明

$$
\boxed{\frac{dA}{dt}=\text{constant}.}
$$

这正是 **Kepler's Second Law**：

> **行星在相等时间内扫过相等面积。**

从 ODE 的角度看，它来自切向方程的一个 first integral。

#### 4. Kepler First Law

接下来处理径向方程。令

$$
p=\frac{L^2}{GM},
\qquad
u=\frac{p}{r},
$$

也就是

$$
r=\frac{p}{u}.
$$

因为

$$
r^2\dot\theta=L,
$$

所以

$$
\dot\theta=\frac{L}{r^2}=\frac{Lu^2}{p^2}.
$$

对 $r=p/u$ 求导：

$$
\dot r=\frac{dr}{d\theta}\dot\theta
=\frac{d(p/u)}{d\theta}\cdot \frac{L}{r^2}
=-\frac{L}{p}u'.
$$

再求导得

$$
\ddot r=\frac{d}{d\theta}(\dot r)\dot\theta
=-\frac{L}{p}u''\cdot \frac{Lu^2}{p^2}
=-\frac{L^2u^2}{p^3}u''.
$$

另一方面，

$$
r\dot\theta^2
=\frac{p}{u}\cdot \frac{L^2u^4}{p^4}
=\frac{L^2u^3}{p^3}.
$$

把这些代回径向方程

$$
\ddot r-r\dot\theta^2=-\frac{GM}{r^2},
$$

并利用

$$
GM=\frac{L^2}{p},
$$

可化简为

$$
u''+u=1.
$$

于是得到一个非常熟悉的常系数二阶方程，其通解为

$$
u=1+A\cos(\theta+\varphi),
$$

其中 $A,\varphi$ 为常数。

回到 $r$，便有

$$
\boxed{r=\frac{p}{1+A\cos(\theta+\varphi)}.}
$$

这正是一个 **conic section**（圆锥曲线）在焦点为原点时的极坐标方程。

- 当 $A=0$ 时，是圆；
- 当 $0<A<1$ 时，是椭圆；
- 当 $A=1$ 时，是抛物线；
- 当 $A>1$ 时，是双曲线。

对行星这种有界轨道，实际对应的是椭圆，因此得到 **Kepler's First Law**：

> **行星绕太阳运动的轨道是椭圆，太阳位于椭圆的一个焦点。**


