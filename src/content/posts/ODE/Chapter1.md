---
title: First-Order Differential Equations
published: 2026-03-07
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

**Case 1**：$h(y)\neq 0$
可以把变量分开：

$$
\frac{dy}{h(y)}=g(x)\,dx
$$

然后两边积分：

$$
\int \frac{1}{h(y)}\,dy=\int g(x)\,dx
$$

最后再代入初值确定常数。

---

**Case 2**：$h(y_0)=0$
这时常数函数

$$
y\equiv y_0
$$

往往本身就是一个解。

这个解有时会包含在通解里，有时**不会**，所以一定要单独检查。

> [!TIP]
> **分离变量时如果除掉了某个可能为 0 的因子，可能会漏掉解。**

### Implicit, General, and Singular Solutions

#### Implicit Solution

例如

$$
x^2+y^2=4
$$

对它求导：

$$
2x+2yy'=0
\Rightarrow x+yy'=0
$$

所以

$$
x^2+y^2=4
$$

是微分方程的一个隐式解。

它对应两个显式分支：

$$
y=\pm\sqrt{4-x^2}
$$

而初值会选定其中一个分支。

#### General Solution
带任意常数 $C$ 的解族通常叫通解。

例如：

$$
y=Ae^{-3x^2}
$$

或

$$
y=1+(x^2+C)^3
$$

都属于通解族。

---

#### Singular Solution
奇异解是：

> 是原方程的解，但**不能**通过通解中取某个常数得到。

:::warning
奇异解会在分离变量中被漏掉

考虑

$$
\frac{dy}{dx}=6x(y-1)^{2/3}
$$


$$
\frac{dy}{(y-1)^{2/3}}=6x\,dx
$$



$$
\int \frac{1}{3(y-1)^{2/3}}\,dy=\int 2x\,dx
$$



$$
(y-1)^{1/3}=x^2+C
$$

所以通解是

$$
\boxed{y=1+(x^2+C)^3}
$$

**但还有一个解**

直接检查常数解

$$
y\equiv 1
$$

有

$$
y'=0,\qquad 6x(y-1)^{2/3}=0
$$

所以 $y\equiv 1$ 也是解。

因为不存在常数 $C$，使得

$$
1+(x^2+C)^3\equiv 1
$$

对所有 $x$ 成立。

所以 $y\equiv 1$ 是一个 **奇异解**。


在分离变量时你实际上做了

$$
\frac{1}{(y-1)^{2/3}}
$$

这一步默认了 $(y-1)^{2/3}\neq 0$。  
而对 $y\equiv 1$，这个因子恒为 0，所以它在分离过程中被排除了。


若取初值 $y(1)=1$，则至少有两条不同的解：

1. $\; y\equiv 1$
2. $\; y=1+(x^2-1)^3$

它们都满足 $y(1)=1$。

这说明：

**同一个初值问题，解可能不唯一。**

而这正和存在唯一性定理呼应：  
这里右端 $f(x,y)=6x(y-1)^{2/3}$ 在 $y=1$ 附近关于 $y$ 的性质不够好，所以唯一性会失效。
:::

### Logistic model

$$
\frac{dP}{dt}=kP\left(1-\frac{P}{M}\right),\qquad P(0)=P_0
$$

这里：

- $P(t)$：种群数量
- $k$：增长率
- $M$：环境容量

---

$$
\frac{dP}{P\left(1-\frac{P}{M}\right)}=k\,dt
$$


$$
\frac{M\,dP}{(M-P)P}=k\,dt
$$


$$
\frac{M}{(M-P)P}=\frac{1}{P}+\frac{1}{M-P}
$$


$$
\int \left(\frac{1}{P}+\frac{1}{M-P}\right)\,dP=\int k\,dt
$$


$$
\int \frac{1}{M-P}\,dP=-\ln|M-P|
$$


$$
\ln\left|\frac{P}{M-P}\right|=kt+C
$$


$$
\frac{P}{M-P}=Ce^{kt}
$$

于是可得常见形式

$$
P(t)=\frac{M}{Ce^{-kt}+1}
$$

再由 $P(0)=P_0$ 确定 $C$，得到特解。

代入初值后的常见结果:

$$
P(0)=P_0=\frac{M}{C+1}
$$

$$
C=\frac{M-P_0}{P_0}
$$

$$
\boxed{
P(t)=\frac{MP_0}{(M-P_0)e^{-kt}+P_0}
}
$$

$P=0$ 和 $P=M$ 也是常数解，需要单独检查；  
它们有时能在通解表达式中体现出来，有时最好单独写明。

---

### Torricelli’s law

考虑底部有小孔的水箱。

记：

- $y(t)$：水深
- $V(t)$：水体积
- $a$：小孔面积

物理上，在理想条件下，出水速度满足

$$
v=\sqrt{2gy}
$$

因此体积变化率为

$$
\frac{dV}{dt}=-av=-a\sqrt{2gy}
$$

令

$$
k=a\sqrt{2g}
$$

则

$$
\frac{dV}{dt}=-k\sqrt{y}
$$

---

若水箱在高度 $y$ 的横截面积为 $A(y)$，则

$$
V(y)=\int_0^y A(\bar y)\,d\bar y
$$

所以

$$
\frac{dV}{dy}=A(y)
$$

由链式法则：

$$
\frac{dV}{dt}=\frac{dV}{dy}\frac{dy}{dt}=A(y)\frac{dy}{dt}
$$

于是得到

$$
\boxed{A(y)\frac{dy}{dt}=-k\sqrt{y}}
$$

---


### Extension 1: Equidimensional Equations

$$
\frac{dy}{dx}=g\!\left(\frac{y}{x}\right)
$$

这种方程右边只依赖于比值 $y/x$，叫 **equidimensional equation**（也常被称作 homogeneous type）。

---

**标准换元**:

令

$$
u=\frac{y}{x}
\qquad\text{即}\qquad
y=ux
$$

则

$$
\frac{dy}{dx}=u+x\frac{du}{dx}
$$

代回原方程后，通常可以化成关于 $u$ 的 separable equation。

---

#### Example: Equidimensional Substitution

$$
xy'-y=\sqrt{x^2-y^2}
$$


$$
y'=\sqrt{1-\left(\frac{y}{x}\right)^2}+\frac{y}{x}
$$

令

$$
u=\frac{y}{x},\qquad y=ux
$$

则

$$
y'=u+xu'
$$

代入得

$$
u+xu'=\sqrt{1-u^2}+u
$$

所以

$$
xu'=\sqrt{1-u^2}
$$

从而分离变量：

$$
\frac{du}{\sqrt{1-u^2}}=\frac{dx}{x}
$$

积分：

$$
\arcsin u=\ln|x|+C
$$

代回 $u=y/x$，得

$$
\boxed{
y=x\sin(\ln|x|+C)
}
$$

若

$$
\sqrt{1-u^2}=0
$$

即 $u=\pm 1$，也要单独检查，对应

$$
\boxed{y=\pm x}
$$

这又是“分离变量时可能漏掉特殊解”的同一类问题。

---

### Extension 2: Linear Fractional Form

$$
\frac{dy}{dx}=
f\!\left(
\frac{a_1x+b_1y+c_1}{a_2x+b_2y+c_2}
\right)
$$

目标：把它转化为更容易的方程，通常是 equidimensional，再进一步化成 separable。

---

**Case 1**：$c_1=c_2=0$

则

$$
\frac{dy}{dx}=
f\!\left(
\frac{a_1x+b_1y}{a_2x+b_2y}
\right)
$$

这是关于 $x,y$ 同次的比值，可直接看成 equidimensional 型，再令 $u=y/x$。

---

**Case 2**：常数项不全为 0，且两条直线有唯一交点

解方程组

$$
a_1\alpha+b_1\beta+c_1=0
$$
$$
a_2\alpha+b_2\beta+c_2=0
$$

然后做平移换元：

$$
u=x-\alpha,\qquad v=y-\beta
$$

则原式会变成

$$
\frac{dv}{du}=f\!\left(\frac{a_1u+b_1v}{a_2u+b_2v}\right)
$$

从而化成 equidimensional 方程，再继续令 $w=v/u$。

---

**Case 3**：分子分母中的线性部分成比例

若

$$
\frac{a_1}{a_2}=\frac{b_1}{b_2}=k
$$

则表达式可进一步简化成“一个线性组合”的函数形式，再寻找合适换元。

---


### Solving Strategy for First-Order ODEs

**Step 1：Identify**
先识别方程类型：

- 是不是 separable？
- 能不能通过换元化成 separable？
- 有没有明显常数解？

---

**Step 1.5：Convert（Optional）**
如果不是直接 separable，尝试：

- 令 $u=\frac{y}{x}$（equidimensional）
- 平移 $u=x-\alpha,\ v=y-\beta$
- 观察线性分式是否可化简

---

**Step 2：Solve**
分离变量并积分。

---

**Step 3：Check lost / special solutions**
检查：

- 有没有在约分时漏掉的常数解
- 有没有奇异解
- 解是否满足原方程

---

**Step 4：Use initial condition**
代入初值求常数，并确定正确分支。

---

**Step 5：State the answer clearly**
答案要写清：

- 显式 or 隐式
- 特解 or 通解
- 是否还有额外常数解/奇异解
- 定义区间

---

## Linear First-Order Equations

**一阶线性微分方程**：

**标准形式**：

$$\boxed{y'+P(x)y=Q(x)}$$

### Homogeneous vs Nonhomogeneous

对线性方程

$y'+P(x)y=Q(x)$


若$Q(x)\equiv 0$,则方程为

$$\boxed{y'+P(x)y=0}$$

称为 **齐次（homogeneous）** 线性方程。


若$Q(x)\not\equiv 0$,则方程为

$$\boxed{y'+P(x)y=Q(x)}$$

称为 **非齐次（nonhomogeneous）** 线性方程。

---

### Integrating Factor Method

对方程

$$y'+P(x)y=Q(x)$$


我们想乘上一个函数  $\rho(x)$，使左边变成一个乘积的导数：$(\rho(x)y)'$.

因为  $$(\rho y)'=\rho y'+\rho' y$$

所以只要让$\rho'=\rho P(x)$,就能把$\rho y'+\rho P(x)y$认成$(\rho y)'$.


---

由

$$
\frac{\rho'}{\rho}=P(x)
$$

积分得到

$$
\ln \rho=\int P(x)\,dx
$$

所以积分因子可取为

$$
\boxed{\rho(x)=e^{\int P(x)\,dx}}
$$

---

乘上积分因子后：

$$
\rho y'+\rho P y=\rho Q
$$

左边就是

$$
(\rho y)'=\rho Q
$$

然后两边积分：

$$
\rho y=\int \rho Q\,dx+C
$$

所以通解是

$$
\boxed{
y=\frac{1}{\rho(x)}\left(\int \rho(x)Q(x)\,dx+C\right)
}
$$

---

**核心**：

$$
\boxed{(\rho(x)y)'=\rho(x)Q(x)}
$$

这才是积分因子法的本质。

---

#### Standard Workflow

**Step 1: Rewrite to standard form**
先写成

$$
y'+P(x)y=Q(x)
$$

特别注意：  
**$y'$ 前面的系数必须先化成 1。**

**Step 2: Find the integrating factor**
$$
\boxed{\rho(x)=e^{\int P(x)\,dx}}
$$

**Step 3: Multiply both sides by $\rho(x)$**
得到

$$
(\rho y)'=\rho Q
$$

**Step 4: Integrate**
$$
\rho y=\int \rho Q\,dx+C
$$

**Step 5: Solve for $y$**
$$
\boxed{
y=\frac{1}{\rho}\left(\int \rho Q\,dx+C\right)
}
$$

---


#### Example 1

求解

$$
y'+y=e^x
$$


**Step 1: Standard form**
这里

$$
P(x)=1,\qquad Q(x)=e^x
$$


**Step 2: Integrating factor**
$$
\rho(x)=e^{\int 1\,dx}=e^x
$$


**Step 3: Multiply by the integrating factor**
$$
e^x y'+e^x y=e^{2x}
$$

左边是$(e^x y)'$。

所以

$$
(e^x y)'=e^{2x}
$$


**Step 4: Integrate**
$$
e^x y=\int e^{2x}\,dx+C=\frac12 e^{2x}+C
$$

所以

$$
\boxed{
y=\frac12 e^x+Ce^{-x}
}
$$

---

**What this example shows**

**Integrating factor works fully when $Q(x)\neq 0$.**
它本来就是为一般的一阶线性方程设计的。

**The solution naturally splits into two parts.**
$$
y=\underbrace{Ce^{-x}}_{\text{齐次解}}+\underbrace{\frac12 e^x}_{\text{特解}}
$$

这正好对应后面的结构定理。

---

#### Example 2

求解

$$
x^2y'+xy=\sin x,\qquad y(1)=y_0
$$


**Step 1: Rewrite to standard form**
当 $x\neq 0$ 时，除以 $x^2$：

$$
y'+\frac1x y=\frac{\sin x}{x^2}
$$

所以

$$
P(x)=\frac1x,\qquad Q(x)=\frac{\sin x}{x^2}
$$


**Step 2: Integrating factor**
因为初值点在 $x_0=1$，自然考虑区间 $x>0$。

$$
\rho(x)=\exp\left(\int_1^x \frac1t\,dt\right)=e^{\ln x}=x
$$


**Step 3: Multiply by the integrating factor**
$$
x y'+y=\frac{\sin x}{x}
$$

左边是$(xy)'$。

所以

$$
(xy)'=\frac{\sin x}{x}
$$


**Step 4: Integrate**
从 1 积到 $x$：

$$
xy-y_0=\int_1^x \frac{\sin t}{t}\,dt
$$

于是

$$
\boxed{
y(x)=\frac1x\left[y_0+\int_1^x \frac{\sin t}{t}\,dt\right]
}
$$

---

**Key takeaways from this example**

**Why is the solution defined on the positive half-axis?**
因为：
- 初值点 $x_0=1$ 在正半轴
- $P(x)=1/x$、$Q(x)=\sin x/x^2$ 在 $(0,\infty)$ 上连续
- 但在 $x=0$ 不连续

因此根据存在唯一性定理，解在整个$(0,\infty)$ 上唯一存在。

**$x=0$ is not a singular solution.**
$x=0$ 不是一条解曲线，而是方程的 **奇点（singular point）**。  
它和前面 1.4 的 **奇异解 singular solution** 不是一回事。

---

## Existence and Uniqueness for Linear ODEs

考虑初值问题

$$
y'+P(x)y=Q(x),\qquad y(x_0)=y_0
$$

如果 $P(x)$ 和 $Q(x)$ 在某个包含 $x_0$ 的开区间 $I$ 上连续，那么：

$$
\boxed{
\text{该初值问题在 }I\text{ 上有且仅有一个解}
}
$$

而且这个解在整个区间 $I$ 上存在。

---

### Key Consequences

**Linear IVPs are highly well-behaved.**
不像前面某些非线性例子会出现：
- 多个解
- 奇异解
- 只能局部定义

线性方程在系数连续时非常“安全”。

---

**The solution extends over the full continuity interval.**
不是只在初值点附近，而是在 $P,Q$ 连续的整个区间上。

---

**First-order linear equations have no singular solutions.**
积分因子法得到的通解已经包含所有解，  
不会再额外冒出“通解之外的特殊解”。

---

## Initial-Value Integrating Factor Formula

对初值问题

$$
y'+P(x)y=Q(x),\qquad y(x_0)=y_0
$$

可以直接取

$$
\boxed{
\rho(x)=\exp\left(\int_{x_0}^{x}P(t)\,dt\right)
}
$$

则唯一解可直接写成

$$
\boxed{
y(x)=\frac{1}{\rho(x)}
\left[
y_0+\int_{x_0}^{x}\rho(t)Q(t)\,dt
\right]
}
$$

---

### Benefits
- 自动满足初值
- 不用最后再额外求常数 $C$

---

## Structure: Homogeneous + Particular

对非齐次方程

$$
y'+P(x)y=Q(x)
$$

若：
- $Y(x)$ 是对应齐次方程
  $$
  y'+P(x)y=0
  $$
  的通解
- $y^*(x)$ 是原方程的一个特解

那么原方程的通解是

$$
\boxed{y(x)=Y(x)+y^*(x)}
$$

---


### Linear Superposition Principle

对非齐次线性方程

$$
y'+P(x)y=Q(x)
$$

通解可写为

$$
\boxed{y=Y+y^*}
$$

这是 **Principle of Linear Superposition（线性叠加原理）**。

---

### Bernoulli Equation

**Standard form**
$$
\boxed{
y'+P(x)y=Q(x)y^n,\qquad n\neq 0,1
}
$$

这是一个非线性方程，但可以通过换元化为线性方程。

---

**Substitution**
令

$$
\boxed{z=y^{1-n}}
$$

则可化成一阶线性方程：

$$
\boxed{
z'+(1-n)P(x)z=(1-n)Q(x)
}
$$

解出 $z$ 后，再反代回 $y$。

---

#### Example: Bernoulli Equation in Detail

考虑几何推导得到的方程

$$
y'=\frac{y}{2x}-\frac{x}{2y}
$$

改写成

$$
y'-\frac{1}{2x}y=-\frac{x}{2}y^{-1}
$$

这是 Bernoulli 方程，参数 $n=-1$。


**Step 1: Substitute**
因为 $1-n=2$，令

$$
z=y^2
$$

则

$$
z'=2yy'
$$


**Step 2: Rewrite the original equation**
原方程两边乘 $2y$：

$$
2yy'=\frac{y^2}{x}-x
$$

即

$$
z'=\frac{1}{x}z-x
$$

整理得

$$
z'-\frac{1}{x}z=-x
$$

这已经是一阶线性方程。


**Step 3: Integrating factor**
$$
\rho(x)=e^{\int -1/x\,dx}=e^{-\ln x}=\frac1x
$$

于是

$$
\left(\frac{z}{x}\right)'=-1
$$


**Step 4: Integrate**
$$
\frac{z}{x}=-x+C
$$

所以

$$
z=Cx-x^2
$$

代回 $z=y^2$：

$$
\boxed{y^2=Cx-x^2}
$$

---

## Substitution Methods and Exact Equations

### 1. Equations of the form $y'=F(ax+by+c)$

若一阶方程可写成

$$
\frac{dy}{dx}=F(ax+by+c),
$$

则可令

$$
v=ax+by+c.
$$

因为

$$
y=\frac{v-ax-c}{b}
$$

（若 $b\neq 0$），对 $x$ 求导后可把原方程化成关于 $v$ 的 **separable equation**。

---

#### Standard substitution

对最常见的形式

$$
\frac{dy}{dx}=F(x+y+c),
$$

令

$$
v=x+y+c.
$$

则

$$
y=v-x-c,\qquad \frac{dy}{dx}=\frac{dv}{dx}-1.
$$

代回后得到关于 $v$ 的一阶方程，再分离变量。

---

#### Classic example

$$
\frac{dy}{dx}=(x+y+3)^2
$$

令

$$
v=x+y+3,\qquad y=v-x-3
$$

则

$$
\frac{dy}{dx}=\frac{dv}{dx}-1
$$

代入得

$$
\frac{dv}{dx}=1+v^2.
$$

分离变量：

$$
\frac{dv}{1+v^2}=dx
$$

积分得

$$
\arctan v=x+C.
$$

所以

$$
v=\tan(x+C),
$$

从而

$$
\boxed{
y(x)=\tan(x+C)-x-3
}
$$

---

> [!TIP]
> 看到右边只依赖于某个线性组合 $ax+by+c$，就优先考虑把这个整体设为新变量。

---

### 2. Homogeneous Equations

若方程可写成

$$
\frac{dy}{dx}=F\!\left(\frac{y}{x}\right),
$$

则称其为 **homogeneous first-order equation**。

这类方程右边只依赖于比值 \(y/x\)。

---

#### Standard substitution

令

$$
v=\frac{y}{x},
\qquad y=vx
$$

则

$$
\frac{dy}{dx}=v+x\frac{dv}{dx}.
$$

代回原方程：

$$
v+x\frac{dv}{dx}=F(v)
$$

所以

$$
x\frac{dv}{dx}=F(v)-v.
$$

这就是一个 **separable equation**。

---

#### How to recognize it

若微分方程能整理成

$$
\frac{dy}{dx}=F\!\left(\frac{y}{x}\right),
$$

或形如

$$
P(x,y)\,y'=Q(x,y)
$$

其中 $P,Q$ 的每一项都有相同总次数，则通常可化成 homogeneous equation。

---

#### Classic example

$$
2xy\frac{dy}{dx}=4x^2+3y^2
$$

改写为

$$
\frac{dy}{dx}=2\frac{x}{y}+\frac{3}{2}\frac{y}{x}.
$$

令

$$
v=\frac{y}{x},\qquad y=vx,\qquad y'=v+xv'
$$

代入得

$$
v+x\frac{dv}{dx}=\frac{2}{v}+\frac{3}{2}v
$$

所以

$$
x\frac{dv}{dx}=\frac{v^2+4}{2v}.
$$

分离变量：

$$
\frac{2v}{v^2+4}\,dv=\frac{dx}{x}
$$

积分：

$$
\ln(v^2+4)=\ln|x|+\ln C
$$

于是

$$
v^2+4=C|x|.
$$

代回 \(v=y/x\)：

$$
\frac{y^2}{x^2}+4=C|x|.
$$

可写成

$$
\boxed{
y^2+4x^2=kx^3
}
$$

---

#### Domain check

由

$$
y^2=x^2(kx-4)\ge 0
$$

得到

$$
x^2(kx-4)\ge 0.
$$

因此：

- 若 $k>0$，则 $x\ge \dfrac{4}{k}$
- 若 $k<0$，则 $x\le \dfrac{4}{k}$

---

> [!TIP]
> 对 homogeneous equation，解完后常要额外检查：
> - $\ln|x|$ 带来的区间限制
> - 根号带来的定义域限制
> - 写成 $y=\pm\sqrt{g(x)}$ 后要求 $g(x)\ge 0$

---

### 3. A special homogeneous IVP with radical

考虑

$$
x\frac{dy}{dx}=y+\sqrt{x^2-y^2},\qquad y(x_0)=0,\quad x_0>0.
$$

先除以 \(x\)：

$$
\frac{dy}{dx}=\frac{y}{x}+\sqrt{1-\left(\frac{y}{x}\right)^2}.
$$

令

$$
v=\frac{y}{x},\qquad y=vx,\qquad y'=v+xv'
$$

得

$$
v+x\frac{dv}{dx}=v+\sqrt{1-v^2}
$$

所以

$$
x\frac{dv}{dx}=\sqrt{1-v^2}.
$$

分离变量：

$$
\frac{dv}{\sqrt{1-v^2}}=\frac{dx}{x}
$$

积分得

$$
\arcsin v=\ln x + C
$$

（因为初值点 x_0>0，可在 $x>0$ 的区间上讨论，所以写 $\ln x$ 即可。）

由 $v(x_0)=0$ 得

$$
C=-\ln x_0.
$$

所以

$$
v=\sin\!\left(\ln\frac{x}{x_0}\right).
$$

代回 \(v=y/x\)：

$$
\boxed{
y(x)=x\sin\!\left(\ln\frac{x}{x_0}\right)
}
$$

---

#### Region restriction

因为原方程中有根号

$$
\sqrt{x^2-y^2},
$$

必须满足

$$
x^2-y^2\ge 0
\quad\Longleftrightarrow\quad
|y|\le |x|.
$$

又因为这里取的是 \(x_0>0\) 的解支，所以在 \(x>0\) 上讨论，区域变成

$$
\boxed{x\ge |y|}.
$$

边界线

$$
\boxed{y=x,\qquad y=-x}
$$

本身也是解，称为 **singular solution curves**。

---

### 4. Exact Equations

若方程写成

$$
M(x,y)\,dx+N(x,y)\,dy=0,
$$

并且左边恰好是某个函数 \(F(x,y)\) 的全微分

$$
dF=F_x\,dx+F_y\,dy,
$$

即

$$
F_x=M,\qquad F_y=N,
$$

则该方程称为 **exact equation**。

这时通解直接写成

$$
\boxed{F(x,y)=C}.
$$

---

#### Exactness criterion

在通常的连续性条件下，若

$$
\boxed{
\frac{\partial M}{\partial y}=\frac{\partial N}{\partial x}
}
$$

则方程是 exact。

---

#### How to find the potential function \(F(x,y)\)

若已知 exact，可按下面步骤求 \(F\)：

1. 先由
   $$
   F_x=M
   $$
   对 \(x\) 积分：

   $$
   F(x,y)=\int M(x,y)\,dx+g(y)
   $$

2. 再对 \(y\) 求偏导，与 \(N\) 比较，确定 \(g(y)\)。

也可反过来先由 \(F_y=N\) 对 \(y\) 积分。

---

#### Classic example

$$
y^3\,dx+3xy^2\,dy=0
$$

这里

$$
M=y^3,\qquad N=3xy^2.
$$

直接看出

$$
F(x,y)=xy^3
$$

因为

$$
F_x=y^3,\qquad F_y=3xy^2.
$$

所以原方程是 exact，其通解为

$$
\boxed{xy^3=C}
$$

也可写成

$$
\boxed{y=kx^{-1/3}}.
$$

---

#### Important remark: exactness depends on the form

若把上式在 \(y\neq 0\) 的区域中除以 \(y^2\)，得到

$$
y\,dx+3x\,dy=0.
$$

此时

$$
M=y,\qquad N=3x,
$$

有

$$
M_y=1,\qquad N_x=3,
$$

所以它 **不是** exact。

这说明：

> [!WARNING]
> exactness 不是“解集本身”的性质，而与方程写成的具体形式 \(Mdx+Ndy=0\) 有关。

---

### 5. Integrating Factor for Nonexact Equations

若

$$
M(x,y)\,dx+N(x,y)\,dy=0
$$

不是 exact，我们希望找到一个函数 \(\mu\)，使得

$$
\mu M\,dx+\mu N\,dy=0
$$

变成 exact。

这个 \(\mu\) 叫做 **integrating factor**。

---

#### Exactness condition after multiplying by $\mu$

需要满足

$$
\frac{\partial(\mu M)}{\partial y}=\frac{\partial(\mu N)}{\partial x}.
$$

一般直接求 \(\mu(x,y)\) 很难，所以常先试两种简单情形：

---

#### Case 1: \(\mu=\mu(x)\)

若

$$
\frac{M_y-N_x}{N}
$$

恰好只依赖于 \(x\)，则存在积分因子

$$
\boxed{
\mu(x)=\exp\left(\int \frac{M_y-N_x}{N}\,dx\right)
}
$$

---

#### Case 2: \(\mu=\mu(y)\)

若

$$
\frac{N_x-M_y}{M}
$$

恰好只依赖于 \(y\)，则存在积分因子

$$
\boxed{
\mu(y)=\exp\left(\int \frac{N_x-M_y}{M}\,dy\right)
}
$$

---

> [!TIP]
> 线性方程中的积分因子
> $$
> \rho(x)=e^{\int P(x)\,dx}
> $$
> 本质上就是 exact equation 理论中的一个特殊情形。

---

## Reducible Second-Order Equations

二阶微分方程一般写成

$$
F(x,y,y',y'')=0.
$$

若其中 **缺少 \(y\)** 或 **缺少 \(x\)**，则常可通过代换降为一阶方程。

---

### 1. Dependent variable \(y\) missing

若方程形如

$$
F(x,y',y'')=0,
$$

则令

$$
p=y'=\frac{dy}{dx}.
$$

于是

$$
y''=\frac{dp}{dx}=p'.
$$

原方程变为

$$
F(x,p,p')=0,
$$

这是关于 \(p\) 的一阶方程。

若解得

$$
p=p(x,C_1),
$$

则再由

$$
y'=p(x,C_1)
$$

积分得到

$$
\boxed{
y(x)=\int p(x,C_1)\,dx+C_2
}
$$

---

#### Example

$$
y''+(y')^2=0
$$

令

$$
p=y'
$$

则

$$
p'+p^2=0.
$$

分离变量：

$$
\frac{dp}{p^2}=-dx
$$

积分得

$$
p=\frac{1}{x+C_1}.
$$

所以

$$
y'=\frac{1}{x+C_1}
$$

再积分：

$$
\boxed{
y=\ln|x+C_1|+C_2
}
$$

---

### 2. Independent variable $x$ missing

若方程形如

$$
F(y,y',y'')=0,
$$

则令

$$
p=y'=\frac{dy}{dx}
$$

并把 \(p\) 看成 \(y\) 的函数。

这时由链式法则

$$
y''=\frac{dp}{dx}=\frac{dp}{dy}\frac{dy}{dx}=p\frac{dp}{dy}.
$$

所以原方程变为

$$
\boxed{
F\left(y,p,p\frac{dp}{dy}\right)=0
}
$$

这就是关于 $p(y)$ 的一阶方程。

若解出

$$
p=p(y,C_1),
$$

再由

$$
\frac{dy}{dx}=p(y)
\quad\Longrightarrow\quad
\frac{dx}{dy}=\frac{1}{p(y)}
$$

积分得

$$
\boxed{
x(y)=\int \frac{1}{p(y,C_1)}\,dy + C_2
}
$$

通常最后得到的是 **隐式解**。

---

#### Classic example

$$
yy''=(y')^2
$$

这里缺少 \(x\)。令

$$
p=y',\qquad y''=p\frac{dp}{dy}.
$$

代入得

$$
y\,p\frac{dp}{dy}=p^2.
$$

在 \(p\neq 0\) 的情形下可分离为

$$
\frac{dp}{p}=\frac{dy}{y}.
$$

积分：

$$
\ln|p|=\ln|y|+C
$$

所以

$$
p=C_1y.
$$

即

$$
\frac{dy}{dx}=C_1y.
$$

于是

$$
\frac{dx}{dy}=\frac{1}{C_1y}.
$$

积分可得

$$
C_1x=\ln|y|+C_2.
$$

整理后：

$$
\boxed{
y(x)=Ae^{Bx}
}
$$

其中 \(A,B\) 为任意常数。

---

#### Important remark

虽然推导过程中常暂时假设 \(y>0,\ p>0\) 以便写成 \(\ln y,\ \ln p\)，  
但最后结果

$$
y=Ae^{Bx}
$$

对任意实数 \(A,B\) 都成立。

例如：

- \(B=0\) 时，得到所有水平直线 \(y=A\)
- \(A<0\) 时，对应关于 \(x\) 轴的对称
- \(B<0\) 时，对应关于 \(y\) 轴的反射型指数曲线

---
