---
title: Nonlinear Systems and Phenomena
published: 2026-04-16
description: Chapter 7 Section 7.1 notes
tags: [常微分方程]
category: 笔记
draft: false
---

## Overview

很多非线性 ODE 并不能完整求解，但我们仍然关心：

1. **Stability**：初值或参数有小扰动时，解的行为会不会发生巨大变化；
2. **Long-time behavior**：当 $t\to+\infty$ 时，解是趋于某个平衡值、发散，还是出现别的行为；
3. **Dependence on parameters**：参数变化时，critical points 的个数与稳定性会不会突然改变。

## Contents

- [Overview](#overview)
- [Contents](#contents)
- [Autonomous First-Order Equations](#autonomous-first-order-equations)
  - [Critical points and equilibrium solutions](#critical-points-and-equilibrium-solutions)
  - [Stability in Lyapunov’s sense](#stability-in-lyapunovs-sense)
- [One-dimensional phase diagram](#one-dimensional-phase-diagram)
- [Logistic Equation](#logistic-equation)
  - [Critical points](#critical-points)
  - [Phase line and stability](#phase-line-and-stability)
  - [Explicit solution and long-time behavior](#explicit-solution-and-long-time-behavior)
- [Explosion/Extinction Equation](#explosionextinction-equation)
- [Logistic Population with Harvesting](#logistic-population-with-harvesting)
  - [Critical points and threshold](#critical-points-and-threshold)
  - [Three parameter regimes](#three-parameter-regimes)
  - [Concrete example](#concrete-example)
- [Bifurcation and Dependence on Parameters](#bifurcation-and-dependence-on-parameters)



## Autonomous First-Order Equations

最简单的非线性方程是：

$$
\frac{dx}{dt}=f(x)
$$

这叫做 **autonomous first-order differential equation**，因为右端不显含 $t$。

### Critical points and equilibrium solutions

若

$$
f(c)=0,
$$

则常值函数

$$
x(t)\equiv c
$$

满足方程，因此 $c$ 称为一个 **critical point**，对应的常值解 $x(t)\equiv c$ 称为 **equilibrium solution**。

所以对一维自治方程，第一步永远是：

$$
\boxed{f(x)=0}
$$

先找所有 critical points。

### Stability in Lyapunov’s sense

设 $x=c$ 是一个 critical point。

- $x=c$ **stable**，如果对任意 $\varepsilon>0$，都存在 $\delta>0$，使得
  $$
  |x_0-c|<\delta
  $$
  蕴含
  $$
  |x(t)-c|<\varepsilon,\qquad \forall t>0.
  $$
- 若不满足这个条件，则称为 **unstable**。

几何上：

> 若一条轨道从 equilibrium 的附近出发，并且始终留在附近，则这个 equilibrium 是 stable 的。

若不仅 remain close，而且还满足

$$
x(t)\to c \quad (t\to+\infty),
$$

则它更强，称为 **asymptotically stable**。

在一维相线上：若两边箭头都朝向 $c$，那它通常就是 asymptotically stable。

---

## One-dimensional phase diagram

对一维自治方程

$$
\frac{dx}{dt}=f(x),
$$

最有效的工具是 **phase diagram / phase line**。

做法很简单：

1. 解 $f(x)=0$ 找 critical points；
2. 在各个区间判断 $f(x)$ 的符号；
3. 用箭头表示 $x(t)$ 的运动方向：
   - $f(x)>0$：箭头向右，解随时间增大；
   - $f(x)<0$：箭头向左，解随时间减小。

于是：

- 两侧箭头都指向 critical point $\Rightarrow$ stable（通常还是 asymptotically stable）；
- 两侧箭头都远离 critical point $\Rightarrow$ unstable；
- 一侧指向、一侧远离 $\Rightarrow$ **semistable**。

---

## Logistic Equation

$$
\frac{dx}{dt}=kx(M-x),\qquad k>0,\ M>0.
$$

它描述带 environmental capacity 的种群增长。

### Critical points

令右端为零：

$$
kx(M-x)=0,
$$

得到两个 critical points：

$$
x=0,\qquad x=M.
$$

因此有两个 equilibrium solutions：

$$
x(t)\equiv 0,\qquad x(t)\equiv M.
$$

### Phase line and stability

设

$$
f(x)=kx(M-x).
$$

分区间判号：

- 若 $x<0$，则 $x<0$ 且 $M-x>0$，所以 $f(x)<0$；
- 若 $0<x<M$，则 $f(x)>0$；
- 若 $x>M$，则 $f(x)<0$。

所以 phase line 为

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161213017.png" alt="phase line" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

因此：

- $x=0$ 是 **unstable**；
- $x=M$ 是 **stable**，而且实际上是 **asymptotically stable**。

### Explicit solution and long-time behavior

若 $x(0)=x_0$，则 logistic equation 的显式解为

$$
x(t)=\frac{Mx_0}{x_0+(M-x_0)e^{-kMt}}.
$$

从公式和 phase line 都能读出：

- 若 $x_0>0$，则
  $$
  x(t)\to M\qquad (t\to+\infty);
  $$
- 若 $x_0=0$ 或 $x_0=M$，则分别停在对应 equilibrium；
- 若 $x_0<0$，则分母会在有限时间变为 0，解会掉到 $-\infty$。

> 对人口模型来说，通常只关心 $x_0\ge 0$。在这个 physically meaningful 区域里，所有正初值最终都趋于 $M$。

---

## Explosion/Extinction Equation

现在把 logistic 中的符号反过来，考虑

$$
\frac{dx}{dt}=kx(x-M),\qquad k>0,\ M>0.
$$

它仍有两个 critical points：

$$
x=0,\qquad x=M.
$$

但 phase line 完全不同。设

$$
f(x)=kx(x-M).
$$

分区间判号：

- $x<0$ 时，$x<0$ 且 $x-M<0$，故 $f(x)>0$；
- $0<x<M$ 时，$f(x)<0$；
- $x>M$ 时，$f(x)>0$。

所以 phase line 为
<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161215783.png" alt="phase line" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

于是：

- $x=0$ 是 **stable**；
- $x=M$ 是 **unstable**。

若用显式解

$$
x(t)=\frac{Mx_0}{x_0+(M-x_0)e^{kMt}},
$$

可进一步得到：

- 若 $x_0<M$，则 $x(t)\to 0$；
- 若 $x_0=M$，则恒等于 $M$；
- 若 $x_0>M$，则在有限时间 blow up 到 $+\infty$。

> **同样是两个 critical points，稳定性可能因为一个符号变化而完全翻转。**

---

## Logistic Population with Harvesting

带 harvesting 的 logistic population 模型写成

$$
\frac{dx}{dt}=ax-bx^2-h,
$$

其中 $a,b,h>0$。等价地，也可写成

$$
\frac{dx}{dt}=kx(M-x)-h.
$$

其中：

- $kx(M-x)$ 表示自然增长；
- $h$ 表示每单位时间固定移除的个体数。

### Critical points and threshold

令右端为零：

$$
-kx^2+kMx-h=0.
$$

当

$$
4h<kM^2
$$

时，有两个实根：

$$
H,N=\frac{kM\pm\sqrt{(kM)^2-4kh}}{2k}
=\frac12\left(M\pm\sqrt{M^2-\frac{4h}{k}}\right),
$$

并且

$$
0<H<N<M.
$$

此时方程可因式分解为

$$
\frac{dx}{dt}=k(N-x)(x-H).
$$

于是 phase line 是

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161216954.png" alt="phase line" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

因此：

- $x=H$ 是 **unstable**；
- $x=N$ 是 **stable**。

这里 $x(t)\equiv H$ 很重要，它叫做 **threshold solution**：

- 若 $x_0>H$，则解最终趋于 $N$；
- 若 $x_0<H$，则种群会被捕捞拖向灭绝。

所以 $H$ 不是长期极限，而是“分界线”。

### Three parameter regimes

harvesting 模型的 qualitative behaviour 由参数 $h$ 决定。

**Case 1: $4h<kM^2$**

有两个不同实根 $H<N$。

- $H$ unstable；
- $N$ stable；
- 若 $x_0>H$，则 $x(t)\to N$；
- 若 $x_0<H$，则种群灭绝。

**Case 2: $4h=kM^2$**

两个根合并成一个：

$$
H=N=\frac M2.
$$

这时

$$
\frac{dx}{dt}=-k\left(x-\frac M2\right)^2.
$$

因此箭头在两侧都向左：

$$
\leftarrow\quad \frac M2\quad \leftarrow
$$

所以 $x=\frac M2$ 是 **semistable**：

- 从右边看，解会靠近它；
- 从左边看，解会远离它并走向灭绝。

**Case 3: $4h>kM^2$**

方程没有实根，因此没有 equilibrium solutions。

这时自然增长项的最大值也不足以抵消 harvesting，系统对所有初值都只能往左走，最终种群灭绝。

### Concrete example

若取

$$
k=1,\qquad M=4,\qquad h=3,
$$

则模型为

$$
\frac{dx}{dt}=x(4-x)-3.
$$

对应二次方程

$$
-x^2+4x-3=(3-x)(x-1)=0
$$

给出两个 critical points：

$$
H=1,\qquad N=3.
$$

若 $x$ 的单位是“hundreds of fish”，则：

- threshold population 是 100 fish；
- new limiting population 是 300 fish。

因此：

- 若初始鱼群多于 100 条，长期会趋于 300 条；
- 若初始鱼群少于 100 条，则会被“fished out”。

---

## Bifurcation and Dependence on Parameters

当我们把 $h$ 当成连续变化的参数时，critical points 的数目会发生突变：

- $h<4$：有两个 critical points；
- $h=4$：只有一个 semistable critical point；
- $h>4$：没有 critical points。

这种参数连续变化，而系统的 qualitative behaviour 突然改变的现象，叫做 **bifurcation**。

在方程

$$
\frac{dx}{dt}=x(4-x)-h
$$

中，critical points 满足

$$
c=2\pm\sqrt{4-h}.
$$

等价地可写成

$$
(c-2)^2=4-h.
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202604161217253.png" alt="bifurcation diagram" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这是一条抛物线，给出了所有“参数 $h$ 与对应 equilibrium $c$”的关系，这张图就叫 **bifurcation diagram**。

> **critical points 的位置、数目与稳定性都可能依赖于参数；当参数穿过某个临界值时，系统结构会突然改变。**

---
