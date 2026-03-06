---
title: Chapter1: First-Order Differential Equations
published: 2026-03-06
description: First-order ODEs
tags: [常微分方程]
category: 笔记
draft: false
---

## Introduction

### What is an ODE?
An ODE is an equation involving an unknown function and its derivatives:

$$F(x,y,y',\dots,y^{(n)})=0$$
If there is only one independent variable, it is called an ordinary differential equation (ODE).

### Classification
Differential equations can be classified by:
- type: ODE / PDE
- order: highest derivative
- linearity: linear / nonlinear
- homogeneity: homogeneous / nonhomogeneous

### Mathematical modeling
ODEs are used to model changing quantities in physics, ecology, engineering, etc.
Typical variables:
- independent variable: time, position, ...
- dependent variable: speed, temperature, population, ...

### Meaning of a solution
A function $y=\phi(x)$ is a solution if it satisfies the ODE identically on an interval.

### General vs particular solution
- General solution: a family of parametrized solutions
- Particular solution: one specific solution selected by extra conditions

### Subsidiary conditions
To determine a unique particular solution, we usually need:
- initial condition
- boundary condition

Not every ODE has a solution, and not every solution is unique.

### Two viewpoints
- Analytical: solve for $y=\phi(x)$
- Geometrical: use slope fields and solution curves

### Slope field
For
$$y'=f(x,y)$$
the value of $f(x,y)$ gives the slope at each point $(x,y)$.
A slope field visualizes the local direction of solutions.

Phenomenon → Modeling → ODE + conditions → Analysis → Solve / Approximate → Predict / Control

## Separable Equations and Applications



$$\frac{dy}{dx}=H(x,y)=g(x)h(y), \quad y(x_0)=y_0$$

**Case 1**：\(h(y)\neq 0\)
可以把变量分开：

\[
\frac{dy}{h(y)}=g(x)\,dx
\]

然后两边积分：

\[
\int \frac{1}{h(y)}\,dy=\int g(x)\,dx
\]

最后再代入初值确定常数。

---

**Case 2**：\(h(y_0)=0\)
这时常数函数

\[
y\equiv y_0
\]

往往本身就是一个解。

这个解有时会包含在通解里，有时**不会**，所以一定要单独检查。

> [!TIP]
> **分离变量时如果除掉了某个可能为 0 的因子，可能会漏掉解。**

### 隐式解、通解、奇异解

#### 隐式解（implicit solution）

例如

\[
x^2+y^2=4
\]

对它求导：

\[
2x+2yy'=0
\Rightarrow x+yy'=0
\]

所以

\[
x^2+y^2=4
\]

是微分方程的一个隐式解。

它对应两个显式分支：

\[
y=\pm\sqrt{4-x^2}
\]

而初值会选定其中一个分支。

#### 通解（general solution）
带任意常数 \(C\) 的解族通常叫通解。

例如：

\[
y=Ae^{-3x^2}
\]

或

\[
y=1+(x^2+C)^3
\]

都属于通解族。

---

#### 奇异解（singular solution）
奇异解是：

> 是原方程的解，但**不能**通过通解中取某个常数得到。

:::warning
奇异解会在分离变量中被漏掉

考虑

\[
\frac{dy}{dx}=6x(y-1)^{2/3}
\]


\[
\frac{dy}{(y-1)^{2/3}}=6x\,dx
\]



\[
\int \frac{1}{3(y-1)^{2/3}}\,dy=\int 2x\,dx
\]



\[
(y-1)^{1/3}=x^2+C
\]

所以通解是

\[
\boxed{y=1+(x^2+C)^3}
\]

**但还有一个解**

直接检查常数解

\[
y\equiv 1
\]

有

\[
y'=0,\qquad 6x(y-1)^{2/3}=0
\]

所以 \(y\equiv 1\) 也是解。

因为不存在常数 \(C\)，使得

\[
1+(x^2+C)^3\equiv 1
\]

对所有 \(x\) 成立。

所以 \(y\equiv 1\) 是一个 **奇异解**。


在分离变量时你实际上做了

\[
\frac{1}{(y-1)^{2/3}}
\]

这一步默认了 \((y-1)^{2/3}\neq 0\)。  
而对 \(y\equiv 1\)，这个因子恒为 0，所以它在分离过程中被排除了。


若取初值 \(y(1)=1\)，则至少有两条不同的解：

1. \(\; y\equiv 1\)
2. \(\; y=1+(x^2-1)^3\)

它们都满足 \(y(1)=1\)。

这说明：

**同一个初值问题，解可能不唯一。**

而这正和存在唯一性定理呼应：  
这里右端 \(f(x,y)=6x(y-1)^{2/3}\) 在 \(y=1\) 附近关于 \(y\) 的性质不够好，所以唯一性会失效。
:::

### Logistic model

\[
\frac{dP}{dt}=kP\left(1-\frac{P}{M}\right),\qquad P(0)=P_0
\]

这里：

- \(P(t)\)：种群数量
- \(k\)：增长率
- \(M\)：环境容量

---

\[
\frac{dP}{P\left(1-\frac{P}{M}\right)}=k\,dt
\]


\[
\frac{M\,dP}{(M-P)P}=k\,dt
\]


\[
\frac{M}{(M-P)P}=\frac{1}{P}+\frac{1}{M-P}
\]


\[
\int \left(\frac{1}{P}+\frac{1}{M-P}\right)\,dP=\int k\,dt
\]


\[
\int \frac{1}{M-P}\,dP=-\ln|M-P|
\]


\[
\ln\left|\frac{P}{M-P}\right|=kt+C
\]


\[
\frac{P}{M-P}=Ce^{kt}
\]

于是可得常见形式

\[
P(t)=\frac{M}{Ce^{-kt}+1}
\]

再由 \(P(0)=P_0\) 确定 \(C\)，得到特解。

代入初值后的常见结果:

\[
P(0)=P_0=\frac{M}{C+1}
\]

\[
C=\frac{M-P_0}{P_0}
\]

\[
\boxed{
P(t)=\frac{MP_0}{(M-P_0)e^{-kt}+P_0}
}
\]

\(P=0\) 和 \(P=M\) 也是常数解，需要单独检查；  
它们有时能在通解表达式中体现出来，有时最好单独写明。

---

### Torricelli’s law

考虑底部有小孔的水箱。

记：

- \(y(t)\)：水深
- \(V(t)\)：水体积
- \(a\)：小孔面积

物理上，在理想条件下，出水速度满足

\[
v=\sqrt{2gy}
\]

因此体积变化率为

\[
\frac{dV}{dt}=-av=-a\sqrt{2gy}
\]

令

\[
k=a\sqrt{2g}
\]

则

\[
\frac{dV}{dt}=-k\sqrt{y}
\]

---

若水箱在高度 \(y\) 的横截面积为 \(A(y)\)，则

\[
V(y)=\int_0^y A(\bar y)\,d\bar y
\]

所以

\[
\frac{dV}{dy}=A(y)
\]

由链式法则：

\[
\frac{dV}{dt}=\frac{dV}{dy}\frac{dy}{dt}=A(y)\frac{dy}{dt}
\]

于是得到

\[
\boxed{A(y)\frac{dy}{dt}=-k\sqrt{y}}
\]

---


### Extension 1：Equidimensional equations（齐次/等维方程）

老师课件给出的形式是

\[
\frac{dy}{dx}=g\!\left(\frac{y}{x}\right)
\]

这种方程右边只依赖于比值 \(y/x\)，叫 **equidimensional equation**（也常被称作 homogeneous type）。

---

**标准换元**:

令

\[
u=\frac{y}{x}
\qquad\text{即}\qquad
y=ux
\]

则

\[
\frac{dy}{dx}=u+x\frac{du}{dx}
\]

代回原方程后，通常可以化成关于 \(u\) 的 separable equation。

---

#### Example 

\[
xy'-y=\sqrt{x^2-y^2}
\]


\[
y'=\sqrt{1-\left(\frac{y}{x}\right)^2}+\frac{y}{x}
\]

令

\[
u=\frac{y}{x},\qquad y=ux
\]

则

\[
y'=u+xu'
\]

代入得

\[
u+xu'=\sqrt{1-u^2}+u
\]

所以

\[
xu'=\sqrt{1-u^2}
\]

从而分离变量：

\[
\frac{du}{\sqrt{1-u^2}}=\frac{dx}{x}
\]

积分：

\[
\arcsin u=\ln|x|+C
\]

代回 \(u=y/x\)，得

\[
\boxed{
y=x\sin(\ln|x|+C)
}
\]

若

\[
\sqrt{1-u^2}=0
\]

即 \(u=\pm 1\)，也要单独检查，对应

\[
\boxed{y=\pm x}
\]

这又是“分离变量时可能漏掉特殊解”的同一类问题。

---

### Extension 2：

\[
\frac{dy}{dx}=
f\!\left(
\frac{a_1x+b_1y+c_1}{a_2x+b_2y+c_2}
\right)
\]

目标：把它转化为更容易的方程，通常是 equidimensional，再进一步化成 separable。

---

**Case 1**：\(c_1=c_2=0\)

则

\[
\frac{dy}{dx}=
f\!\left(
\frac{a_1x+b_1y}{a_2x+b_2y}
\right)
\]

这是关于 \(x,y\) 同次的比值，可直接看成 equidimensional 型，再令 \(u=y/x\)。

---

**Case 2**：常数项不全为 0，且两条直线有唯一交点

解方程组

\[
a_1\alpha+b_1\beta+c_1=0
\]
\[
a_2\alpha+b_2\beta+c_2=0
\]

然后做平移换元：

\[
u=x-\alpha,\qquad v=y-\beta
\]

则原式会变成

\[
\frac{dv}{du}=f\!\left(\frac{a_1u+b_1v}{a_2u+b_2v}\right)
\]

从而化成 equidimensional 方程，再继续令 \(w=v/u\)。

---

**Case 3**：分子分母中的线性部分成比例

若

\[
\frac{a_1}{a_2}=\frac{b_1}{b_2}=k
\]

则表达式可进一步简化成“一个线性组合”的函数形式，再寻找合适换元。

---


### Solveing strategy for first-order ODEs

Step 1：Identify
先识别方程类型：

- 是不是 separable？
- 能不能通过换元化成 separable？
- 有没有明显常数解？

---

Step 1.5：Convert（Optional）
如果不是直接 separable，尝试：

- 令 \(u=\frac{y}{x}\)（equidimensional）
- 平移 \(u=x-\alpha,\ v=y-\beta\)
- 观察线性分式是否可化简

---

Step 2：Solve
分离变量并积分。

---

Step 3：Check lost / special solutions
检查：

- 有没有在约分时漏掉的常数解
- 有没有奇异解
- 解是否满足原方程

---

Step 4：Use initial condition
代入初值求常数，并确定正确分支。

---

Step 5：State the answer clearly
答案要写清：

- 显式 or 隐式
- 特解 or 通解
- 是否还有额外常数解/奇异解
- 定义区间
