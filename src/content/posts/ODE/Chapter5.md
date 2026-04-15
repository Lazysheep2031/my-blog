---
title: Linear Systems of Differential Equations
published: 2026-04-15
description: Linear Systems of Differential Equations
tags: [常微分方程]
category: 笔记
draft: false
---

## Overview

1. **Method of Elimination**：把小型系统消元成单个高阶线性 ODE；
2. **Eigenvalue Method**：把$\mathbf{x}'=A\mathbf{x}$转成特征值问题 $A\mathbf{v}=\lambda\mathbf{v}$；
3. **Multiple Eigenvalue Solutions**：处理重特征值，尤其是 defective 情形；
4. **Matrix Exponentials**：用 $e^{At}$ 统一表示齐次系统解；
5. **Nonhomogeneous Linear Systems**：处理 $ \mathbf{x}'=A\mathbf{x}+\mathbf{f}(t) $，重点是 **undetermined coefficients** 与 **variation of parameters**。

## Contents

- [Overview](#overview)
- [Contents](#contents)
- [两大系统](#两大系统)
  - [齐次系统](#齐次系统)
  - [非齐次系统](#非齐次系统)
- [The Method of Elimination](#the-method-of-elimination)
  - [标准流程](#标准流程)
  - [Example](#example)
- [The Eigenvalue Method for Homogeneous Systems](#the-eigenvalue-method-for-homogeneous-systems)
  - [Example](#example-1)
    - [Case 1：特征值全为单实根](#case-1特征值全为单实根)
    - [Case 2：出现复特征值](#case-2出现复特征值)
    - [Case 3：重特征值](#case-3重特征值)
- [Multiple Eigenvalue Solutions](#multiple-eigenvalue-solutions)
  - [Complete vs. Defective](#complete-vs-defective)
  - [Example](#example-2)
  - [Jordan chain 公式](#jordan-chain-公式)
    - [Example](#example-3)
- [Matrix Exponentials and Linear Systems](#matrix-exponentials-and-linear-systems)
  - [Fundamental matrix](#fundamental-matrix)
  - [矩阵指数](#矩阵指数)
  - [计算 $e^{At}$ 的三种思路](#计算-eat-的三种思路)
  - [Example](#example-4)
- [Nonhomogeneous Linear Systems](#nonhomogeneous-linear-systems)
  - [Undetermined Coefficients](#undetermined-coefficients)
    - [Example](#example-5)
  - [Variation of Parameters](#variation-of-parameters)
    - [Example](#example-6)
- [本章方法总表](#本章方法总表)

## 两大系统

### 齐次系统 
$\mathbf{x}'=A\mathbf{x}$

1. 小系统时可以先用 **elimination**；
2. 一般情形用 **eigenvalue method**；
3. 遇到重根时要区分 **complete** 与 **defective**；
4. 最后用 **matrix exponential** 统一表达。

### 非齐次系统
$\mathbf{x}'=A\mathbf{x}+\mathbf{f}(t)$

$$
\boxed{\mathbf{x}(t)=\mathbf{x}_c(t)+\mathbf{x}_p(t)}
$$

其中：

- $\mathbf{x}_c$ 来自对应齐次系统；
- $\mathbf{x}_p$ 用 **待定系数法** 或 **参数变易法** 求。

---

## The Method of Elimination

对小型系统，尤其是 2 个或 3 个未知函数的一阶线性系统，可以把其中一个变量消掉，得到一个单独的高阶方程，再用 Chapter2 的方法去解。

> **system of first-order ODEs $\rightarrow$ single higher-order linear ODE**

### 标准流程

对一个二元系统

$$
\begin{cases}
x' = a_{11}x+a_{12}y+g_1(t),\\
y' = a_{21}x+a_{22}y+g_2(t),
\end{cases}
$$

1. 从一个方程解出一个变量；
2. 求导，把另外一个导数也表达出来；
3. 代回另一个方程，消去其中一个变量；
4. 得到单个二阶线性 ODE；
5. 解这个二阶方程；
6. 再回代求另一个变量。

### Example

**Example 1**

考虑

$$
\begin{cases}
x' = 4x-3y,\\
y' = 6x-7y.
\end{cases}
$$

从第二个方程解出 $x$：

$$
x=\frac16 y'+\frac76 y.
$$

再求导：

$$
x'=\frac16 y''+\frac76 y'.
$$

代入第一个方程 $x'=4x-3y$：

$$
\frac16 y''+\frac76 y'=4\left(\frac16 y'+\frac76 y\right)-3y.
$$

整理得到

$$
y''+3y'-10y=0.
$$

特征方程为

$$
r^2+3r-10=(r-2)(r+5)=0,
$$

所以

$$
y(t)=C_1e^{2t}+C_2e^{-5t}.
$$

再回代

$$
x=\frac16y'+\frac76y
$$

得到

$$
x(t)=\frac32 C_1e^{2t}+\frac13 C_2e^{-5t}.
$$


**Example 2**

$$
\begin{cases}
x' = x+2y+e^t,\\
y' = 4x+3y.
\end{cases}
$$

仍然用 elimination。

由第二式：

$$
x=\frac14(y'-3y).
$$

求导：

$$
x'=\frac14(y''-3y').
$$

代入第一式：

$$
\frac14(y''-3y')=\frac14(y'-3y)+2y+e^t.
$$

整理：

$$
y''-4y'-5y=4e^t.
$$

对应齐次方程的特征根为 $5,-1$，所以

$$
y_c=C_1e^{5t}+C_2e^{-t}.
$$

对右端 $4e^t$，试特解 $y_p=Ae^t$，代入得

$$
(1-4-5)A=4 \quad\Longrightarrow\quad A=-\frac12.
$$

所以

$$
y(t)=C_1e^{5t}+C_2e^{-t}-\frac12 e^t.
$$

再回代

$$
x=\frac14(y'-3y),
$$

可得

$$
x(t)=\frac12 C_1e^{5t}-C_2e^{-t}+\frac14 e^t.
$$

---

## The Eigenvalue Method for Homogeneous Systems

对常系数齐次系统

$$
\mathbf{x}'=A\mathbf{x},
$$

模仿第二章常系数线性方程的思路，猜

$$
\mathbf{x}(t)=\mathbf{v}e^{\lambda t},
$$

其中 $\mathbf{v}$ 是常向量。

代回去：

$$
\lambda \mathbf{v}e^{\lambda t}=A\mathbf{v}e^{\lambda t}
\quad\Longrightarrow\quad
A\mathbf{v}=\lambda \mathbf{v}.
$$

于是问题转化为：

> **求矩阵 $A$ 的 eigenvalues 和 eigenvectors**

### Example 

#### Case 1：特征值全为单实根

若 $A$ 有 $n$ 个不同实特征值 $\lambda_1,\dots,\lambda_n$，对应线性无关特征向量 $\mathbf{v}_1,\dots,\mathbf{v}_n$，则 general solution 为

$$
\boxed{
\mathbf{x}(t)=c_1\mathbf{v}_1e^{\lambda_1 t}+\cdots+c_n\mathbf{v}_n e^{\lambda_n t}
}
$$

**Example：三个不同实特征值**

$$
\begin{cases}
x'=-3x+4y-2z,\\
y'=x+z,\\
z'=6x-6y+5z.
\end{cases}
$$

对应矩阵

$$
A=
\begin{pmatrix}
-3&4&-2\\
1&0&1\\
6&-6&5
\end{pmatrix}.
$$

其特征值为

$$
\lambda=-1,\ 1,\ 2.
$$

下面把特征向量也算一下。

对 $\lambda=-1$，解
$$
(A+I)\mathbf{v}=0,
\qquad
A+I=
\begin{pmatrix}
-2&4&-2\\
1&1&1\\
6&-6&6
\end{pmatrix}.
$$

设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b\\c
\end{pmatrix},
$$
则方程组为
$$
-2a+4b-2c=0,\qquad a+b+c=0.
$$
第一式化为
$$
a-2b+c=0.
$$
与
$$
a+b+c=0
$$
相减得
$$
-3b=0\Rightarrow b=0,
$$
再代回得
$$
a+c=0.
$$
取 $a=-1,c=1$，可得
$$
\mathbf{v}_{-1}=
\begin{pmatrix}
-1\\0\\1
\end{pmatrix}.
$$

对 $\lambda=1$，解
$$
(A-I)\mathbf{v}=0,
\qquad
A-I=
\begin{pmatrix}
-4&4&-2\\
1&-1&1\\
6&-6&4
\end{pmatrix}.
$$

方程组为
$$
-4a+4b-2c=0,\qquad a-b+c=0.
$$
把第二式乘 $2$ 得
$$
2a-2b+2c=0.
$$
与第一式化简后的
$$
-2a+2b-c=0
$$
联立，可得
$$
c=0,\qquad a=b.
$$
取 $a=b=1$，得到
$$
\mathbf{v}_{1}=
\begin{pmatrix}
1\\1\\0
\end{pmatrix}.
$$

对 $\lambda=2$，解
$$
(A-2I)\mathbf{v}=0,
\qquad
A-2I=
\begin{pmatrix}
-5&4&-2\\
1&-2&1\\
6&-6&3
\end{pmatrix}.
$$

方程组为
$$
-5a+4b-2c=0,\qquad a-2b+c=0.
$$
由第二式得
$$
a=2b-c.
$$
代入第一式：
$$
-5(2b-c)+4b-2c=0
\Rightarrow -6b+3c=0
\Rightarrow c=2b.
$$
再代回
$$
a=2b-2b=0.
$$
取 $b=1$，得到
$$
\mathbf{v}_{2}=
\begin{pmatrix}
0\\1\\2
\end{pmatrix}.
$$

所以 general solution 为

$$
\mathbf{x}(t)=
c_1
\begin{pmatrix}
-1\\0\\1
\end{pmatrix}e^{-t}
+
c_2
\begin{pmatrix}
1\\1\\0
\end{pmatrix}e^{t}
+
c_3
\begin{pmatrix}
0\\1\\2
\end{pmatrix}e^{2t}.
$$

这个例子是最理想情形：  **不同实特征值 $\Rightarrow$ 直接拼解。**

#### Case 2：出现复特征值

若 $A$ 有复特征值

$$
\lambda=\alpha\pm i\beta,
$$

对应复特征向量

$$
\mathbf{v}=\mathbf{p}+i\mathbf{q},
$$

则复解

$$
\mathbf{x}(t)=\mathbf{v}e^{(\alpha+i\beta)t}
$$

的实部和虚部给出两条实值解：

$$
e^{\alpha t}\big(\mathbf{p}\cos \beta t-\mathbf{q}\sin \beta t\big),
$$

$$
e^{\alpha t}\big(\mathbf{p}\sin \beta t+\mathbf{q}\cos \beta t\big).
$$


**Example：一个实特征值 + 一对复特征值**

$$
\begin{cases}
x' = 2x+y,\\
y' = x+3y-z,\\
z' = -x+2y+3z.
\end{cases}
$$

对应矩阵

$$
A=
\begin{pmatrix}
2&1&0\\
1&3&-1\\
-1&2&3
\end{pmatrix}.
$$

它的特征值为：

$$
\lambda_1=2,\qquad \lambda_{2,3}=3\pm i.
$$

先算 $\lambda=2$ 的特征向量。解
$$
(A-2I)\mathbf{v}=0,
\qquad
A-2I=
\begin{pmatrix}
0&1&0\\
1&1&-1\\
-1&2&1
\end{pmatrix}.
$$

设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b\\c
\end{pmatrix},
$$
则第一式给
$$
b=0.
$$
第二式变成
$$
a-c=0\Rightarrow a=c.
$$
取 $a=c=1$，得到
$$
  \mathbf{v}_1=
  \begin{pmatrix}
  1\\0\\1
  \end{pmatrix}.
$$

再算 $\lambda=3+i$。解
$$
(A-(3+i)I)\mathbf{v}=0,
$$
其中
$$
A-(3+i)I=
\begin{pmatrix}
-1-i&1&0\\
1&-i&-1\\
-1&2&-i
\end{pmatrix}.
$$

设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b\\c
\end{pmatrix}.
$$
由第一式
$$
(-1-i)a+b=0
\Rightarrow b=(1+i)a.
$$
由第二式
$$
a-ib-c=0
\Rightarrow c=a-ib.
$$
代入 $b=(1+i)a$：
$$
c=a-i(1+i)a=a-(i-1)a=(2-i)a.
$$

取 $a=1-i$ 来避免分母，则
$$
b=(1+i)(1-i)=2,
$$
$$
c=(2-i)(1-i)=1-3i.
$$

因此可以取复特征向量
$$
  \mathbf{v}=
  \begin{pmatrix}
  1-i\\
  2\\
  1-3i
  \end{pmatrix}=
  \underbrace{\begin{pmatrix}1\\2\\1\end{pmatrix}}_{\mathbf{p}}
  +i\underbrace{\begin{pmatrix}-1\\0\\-3\end{pmatrix}}_{\mathbf{q}}.
$$

与它等比例的复特征向量都可以；下面就用这一组 $\mathbf{p},\mathbf{q}$。

general solution:

$$
\mathbf{x}(t)=c_1
\begin{pmatrix}
1\\0\\1
\end{pmatrix}e^{2t}
+e^{3t}
\left[c_2\big(\mathbf{p}\cos t-\mathbf{q}\sin t\big)+c_3\big(\mathbf{p}\sin t+\mathbf{q}\cos t\big)
\right].
$$

也就是

$$
\mathbf{x}(t)=c_1
\begin{pmatrix}
1\\0\\1
\end{pmatrix}e^{2t}
+
e^{3t}
\left[
c_2
\begin{pmatrix}
\cos t+\sin t\\
2\cos t\\
\cos t+3\sin t
\end{pmatrix}
+
c_3
\begin{pmatrix}
\sin t-\cos t\\
2\sin t\\
\sin t-3\cos t
\end{pmatrix}
\right].
$$


#### Case 3：重特征值

若特征值 $\lambda_0$ 重数为 $k$，则会出现

$$
\left(
\mathbf{v}_0+\frac{t}{1!}\mathbf{v}_1+\frac{t^2}{2!}\mathbf{v}_2+\cdots+\frac{t^{k-1}}{(k-1)!}\mathbf{v}_{k-1}
\right)e^{\lambda_0 t}
$$

这样的解，其中各向量通过

$$
(A-\lambda_0 I)\mathbf{v}_{j}=\mathbf{v}_{j-1}
$$

形成一条 generalized eigenvector chain。

这一部分内容在后面会讲。

---

## Multiple Eigenvalue Solutions

### Complete vs. Defective

设特征值 $\lambda$ 的代数重数为 $k$。

- 若它能给出 $k$ 个线性无关特征向量，称为 **complete**；
- 若它给不出这么多特征向量，则称为 **defective**。

### Example
**Example 1：重根但 complete**

考虑矩阵

$$
A=
\begin{pmatrix}
9&4&0\\
-6&-1&0\\
6&4&3
\end{pmatrix}.
$$

其特征方程为

$$
(5-\lambda)(3-\lambda)^2=0.
$$

所以特征值是：

- $\lambda=5$；
- $\lambda=3$（二重根）。

对 $\lambda=5$，先解
$$
(A-5I)\mathbf{v}=0,
\qquad
A-5I=
\begin{pmatrix}
4&4&0\\
-6&-6&0\\
6&4&-2
\end{pmatrix}.
$$

设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b\\c
\end{pmatrix}.
$$
前两行都给出
$$
a+b=0\Rightarrow b=-a.
$$
第三行变成
$$
6a+4(-a)-2c=0
\Rightarrow 2a-2c=0
\Rightarrow c=a.
$$
取 $a=1$，可得
$$
\mathbf{v}_1=
\begin{pmatrix}
1\\-1\\1
\end{pmatrix}.
$$

对 $\lambda=3$，解
$$
(A-3I)\mathbf{v}=0,
\qquad
A-3I=
\begin{pmatrix}
6&4&0\\
-6&-4&0\\
6&4&0
\end{pmatrix}.
$$

唯一独立条件是
$$
6a+4b=0
\Rightarrow 3a+2b=0.
$$
所以有两个自由变量。取两组简单解：

- 若取 $a=0$，则 $b=0$，可取 $c=1$，得到
  $$
  \mathbf{v}_2=
  \begin{pmatrix}
  0\\0\\1
  \end{pmatrix};
  $$
- 若取 $c=0$，再令 $a=2$，则 $b=-3$，得到
  $$
  \mathbf{v}_3=
  \begin{pmatrix}
  2\\-3\\0
  \end{pmatrix}.
  $$

因此 $\lambda=3$ 虽然是二重根，但确实给出了两条线性无关特征向量。

因此虽然 $\lambda=3$ 是重根，但它是 **complete**，通解仍然像普通情形一样：

$$
\mathbf{x}(t)=
c_1\mathbf{v}_1e^{5t}
+c_2\mathbf{v}_2e^{3t}
+c_3\mathbf{v}_3e^{3t}.
$$

**Example 2：二重 defective eigenvalue**

看矩阵

$$
A=
\begin{pmatrix}
1&-3\\
3&7
\end{pmatrix}.
$$

特征方程为

$$
(\lambda-4)^2=0,
$$

所以唯一特征值是

$$
\lambda=4
$$

且重数为 2。

先解
$$
(A-4I)\mathbf{v}=0,
\qquad
A-4I=
\begin{pmatrix}
-3&-3\\
3&3
\end{pmatrix}.
$$

设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b
\end{pmatrix},
$$
则只得到一个独立条件
$$
-3a-3b=0
\Rightarrow a+b=0.
$$
所以特征向量只能写成
$$
\mathbf{v}=a
\begin{pmatrix}
1\\-1
\end{pmatrix}.
$$
因此只得到一个方向，可取

$$
\mathbf{v}_1=
\begin{pmatrix}
1\\-1
\end{pmatrix}.
$$

于是 $\lambda=4$ 是 **defective**。

这时只靠普通解

$$
\mathbf{x}_1(t)=\mathbf{v}_1e^{4t}
$$

不够，还要找 generalized eigenvector $\mathbf{v}_2$ 满足

$$
(A-4I)\mathbf{v}_2=\mathbf{v}_1.
$$

设
$$
\mathbf{v}_2=
\begin{pmatrix}
u\\v
\end{pmatrix},
$$
则
$$
\begin{pmatrix}
-3&-3\\
3&3
\end{pmatrix}
\begin{pmatrix}
u\\v
\end{pmatrix}=
\begin{pmatrix}
1\\-1
\end{pmatrix}.
$$
第一行给
$$
-3u-3v=1
\Rightarrow u+v=-\frac13.
$$
取最简单的 $v=0$，就有
$$
u=-\frac13.
$$
所以可取

$$
\mathbf{v}_2=
\begin{pmatrix}
-\frac13\\0
\end{pmatrix}.
$$

于是第二条解是

$$
\mathbf{x}_2(t)=\big(t\mathbf{v}_1+\mathbf{v}_2\big)e^{4t}.
$$

所以 general solution 为

$$
\mathbf{x}(t)=
c_1
\begin{pmatrix}
1\\-1
\end{pmatrix}e^{4t}
+
c_2
\begin{pmatrix}
t-\frac13\\
-t
\end{pmatrix}e^{4t}.
$$

### Jordan chain 公式

如果某个特征值 $\lambda$ 只有 1 个普通特征向量，但代数重数为 3，那么需要一条长度为 3 的链：

$$
(A-\lambda I)\mathbf{v}_1=0,
$$

$$
(A-\lambda I)\mathbf{v}_2=\mathbf{v}_1,(A-\lambda I)^2\mathbf{v}_2=0
$$

$$
(A-\lambda I)\mathbf{v}_3=\mathbf{v}_2,(A-\lambda I)^2\mathbf{v}_3=\mathbf{v}_1,(A-\lambda I)^3\mathbf{v}_3=0.
$$

对应三条解为

$$
\mathbf{x}_1(t)=\mathbf{v}_1e^{\lambda t},
$$

$$
\mathbf{x}_2(t)=\big(t\mathbf{v}_1+\mathbf{v}_2\big)e^{\lambda t},
$$

$$
\mathbf{x}_3(t)=\left(\frac{t^2}{2}\mathbf{v}_1+t\mathbf{v}_2+\mathbf{v}_3\right)e^{\lambda t}.
$$

一般地，长度为 $m$ 的链会自然出现

$$
\frac{t^{m-1}}{(m-1)!}e^{\lambda t}
$$

这样的项。

#### Example
四维系统中的三重根

考虑四维系统
$$
\mathbf{x}'=
A\mathbf{x},
\qquad
A=
\begin{pmatrix}
0&0&1&0\\
0&0&0&1\\
-2&2&-3&1\\
2&-2&1&-3
\end{pmatrix}.
$$

其特征方程为
$$
\lambda(\lambda+2)^3=0.
$$

所以特征值为：

- $\lambda_0=0$；
- $\lambda_1=-2$（三重根）。

先看 $\lambda=0$。解
$$
A\mathbf{v}=0,
\qquad
\mathbf{v}=
\begin{pmatrix}
a\\b\\c\\d
\end{pmatrix}.
$$
前两行给
$$
c=0,\qquad d=0,
$$
后两行变成
$$
-2a+2b=0,\qquad 2a-2b=0,
$$
所以
$$
a=b.
$$
取 $a=b=1$，得到
$$
\mathbf{v}_0=
\begin{pmatrix}
1\\1\\0\\0
\end{pmatrix}.
$$
对应常值解
$$
\mathbf{x}_0(t)=\mathbf{v}_0.
$$

再看 $\lambda=-2$。解
$$
(A+2I)\mathbf{v}=0,
\qquad
A+2I=
\begin{pmatrix}
2&0&1&0\\
0&2&0&1\\
-2&2&-1&1\\
2&-2&1&-1
\end{pmatrix}.
$$
设
$$
\mathbf{v}=
\begin{pmatrix}
a\\b\\c\\d
\end{pmatrix},
$$
则前两行给
$$
2a+c=0,\qquad 2b+d=0.
$$
后两行是前两行的线性组合，所以只剩这两个独立条件。于是有两个自由变量，取两组简单解：

- 取 $a=1,b=0$，则 $c=-2,d=0$，得到
  $$
  \mathbf{v}_1=
  \begin{pmatrix}
  1\\0\\-2\\0
  \end{pmatrix};
  $$
- 取 $a=0,b=1$，则 $c=0,d=-2$，得到
  $$
  \mathbf{v}_2=
  \begin{pmatrix}
  0\\1\\0\\-2
  \end{pmatrix}.
  $$

因此 $\lambda=-2$ 虽然是三重根，但只给出 2 个普通特征向量，还缺 1 个方向，所以需要再找一个 rank 2 generalized eigenvector。此时不必强行让它映到前面选定的 $\mathbf{v}_1$ 或 $\mathbf{v}_2$；只要它在作用一次 $(A+2I)$ 后落到 $\lambda=-2$ 的特征子空间里即可。

取
$$
\mathbf{w}=
\begin{pmatrix}
-\frac12\\0\\0\\1
\end{pmatrix},
$$
则
$$
(A+2I)\mathbf{w}=
\begin{pmatrix}
-1\\1\\2\\-2
\end{pmatrix}
= -\mathbf{v}_1+\mathbf{v}_2.
$$
而
$$
(A+2I)(-\mathbf{v}_1+\mathbf{v}_2)=0,
$$
所以 $\mathbf{w}$ 的确是一个 rank 2 generalized eigenvector。

于是对应于 $\lambda=-2$ 的第三条解可以写成
$$
\mathbf{x}_3(t)=\big(t(-\mathbf{v}_1+\mathbf{v}_2)+\mathbf{w}\big)e^{-2t}=
\begin{pmatrix}
-\frac12-t\\
t\\
2t\\
1-2t
\end{pmatrix}e^{-2t}.
$$

综上，四条线性无关解为
$$
\mathbf{x}_0(t)=
\begin{pmatrix}
1\\1\\0\\0
\end{pmatrix},
\quad
\mathbf{x}_1(t)=
\begin{pmatrix}
1\\0\\-2\\0
\end{pmatrix}e^{-2t},
$$
$$
\mathbf{x}_2(t)=
\begin{pmatrix}
0\\1\\0\\-2
\end{pmatrix}e^{-2t},
\quad
\mathbf{x}_3(t)=
\begin{pmatrix}
-\frac12-t\\
t\\
2t\\
1-2t
\end{pmatrix}e^{-2t}.
$$

因此通解为
$$
\boxed{
\mathbf{x}(t)=
c_0
\begin{pmatrix}
1\\1\\0\\0
\end{pmatrix}
+c_1
\begin{pmatrix}
1\\0\\-2\\0
\end{pmatrix}e^{-2t}
+c_2
\begin{pmatrix}
0\\1\\0\\-2
\end{pmatrix}e^{-2t}
+c_3
\begin{pmatrix}
-\frac12-t\\
t\\
2t\\
1-2t
\end{pmatrix}e^{-2t}.
}
$$


---

## Matrix Exponentials and Linear Systems

### Fundamental matrix

对齐次系统

$$
\mathbf{x}'=A\mathbf{x},
$$

若找到 $n$ 个线性无关解向量 $\mathbf{x}_1(t),\dots,\mathbf{x}_n(t)$，把它们按列排成

$$
\Phi(t)=\big[\mathbf{x}_1(t)\ \mathbf{x}_2(t)\ \cdots\ \mathbf{x}_n(t)\big],
$$

则 $\Phi(t)$ 叫作 **fundamental matrix**。

这时 general solution 可压缩写成

$$
\mathbf{x}(t)=\Phi(t)\mathbf{c},
$$

若给初值 $\mathbf{x}(0)=\mathbf{x}_0$，则

$$
\mathbf{x}(t)=\Phi(t)\Phi(0)^{-1}\mathbf{x}_0.
$$

### 矩阵指数

矩阵指数定义为

$$
e^A=I+A+\frac{A^2}{2!}+\frac{A^3}{3!}+\cdots
$$

以及

$$
e^{At}=I+At+\frac{A^2t^2}{2!}+\frac{A^3t^3}{3!}+\cdots
$$

它满足

$$
\frac{d}{dt}e^{At}=Ae^{At},
\qquad
e^{A\cdot 0}=I.
$$

所以 $e^{At}$ 正是系统

$$
X'=AX,\qquad X(0)=I
$$

的标准基本矩阵解。

因此

$$
\boxed{\mathbf{x}(t)=e^{At}\mathbf{x}_0}
$$

是常系数齐次系统初值问题的统一公式。

**各种分类讨论，最终都被统一进 $e^{At}$ 里。**

- 不同实特征值：$e^{At}$ 里只出现纯指数项；
- 复特征值：$e^{At}$ 里出现 $e^{\alpha t}\cos \beta t,\ e^{\alpha t}\sin \beta t$；
- defective 重根：$e^{At}$ 里自然出现 $t e^{\lambda t},\ \frac{t^2}{2}e^{\lambda t}$ 等项。

### 计算 $e^{At}$ 的三种思路

**方法 1：$A$ 可对角化**

若

$$
A=PDP^{-1},
$$

则

$$
e^{At}=Pe^{Dt}P^{-1},
$$

而对角矩阵指数最简单：

$$
e^{Dt}=\operatorname{diag}(e^{\lambda_1 t},\dots,e^{\lambda_n t}).
$$



**方法 2：$A=\lambda I+N$，其中 $N$ 幂零**

若

$$
N^m=0,
$$

则

$$
e^{Nt}=I+Nt+\frac{N^2t^2}{2!}+\cdots+\frac{N^{m-1}t^{m-1}}{(m-1)!}.
$$

所以

$$
e^{At}=e^{\lambda t}e^{Nt}.
$$

这正是 Jordan block / defective 重根情形中 $te^{\lambda t}$、$t^2e^{\lambda t}$ 的统一来源。

**方法 3：generalized eigenvectors**

如果已经找到 generalized eigenvectors $u_1,\dots,u_n$，则对每个 $u$（特征值为 $\lambda$，rank 为 $r$），有

$$
e^{At}u=
e^{\lambda t}\left[
u+(A-\lambda I)ut+\frac{(A-\lambda I)^2u}{2!}t^2+\cdots+\frac{(A-\lambda I)^{r-1}u}{(r-1)!}t^{r-1}
\right].
$$

把这些列向量组成 $\Phi(t)$，再用

$$
e^{At}=\Phi(t)\Phi(0)^{-1}
$$

即可。

### Example
**Example 1:nilpotent matrix**

若

$$
A=
\begin{pmatrix}
0&3&4\\
0&0&6\\
0&0&0
\end{pmatrix},
$$

则

$$
A^2=
\begin{pmatrix}
0&0&18\\
0&0&0\\
0&0&0
\end{pmatrix},
\qquad
A^3=0.
$$

因此

$$
e^{At}=I+At+\frac12A^2t^2=
\begin{pmatrix}
1&3t&4t+9t^2\\
0&1&6t\\
0&0&1
\end{pmatrix}.
$$

> **幂零矩阵的矩阵指数会截断成有限多项式。**


**Example 2:defective 情形下由 generalized eigenvectors 计算 $e^{At}$**

对于

$$
A=
\begin{pmatrix}
3&4&5\\
0&5&4\\
0&0&3
\end{pmatrix},
$$

特征值为 $5,3,3$。其中 $\lambda=3$ 是二重 defective 根。

先算 $\lambda=5$。解
$$
(A-5I)u=0,
\qquad
A-5I=
\begin{pmatrix}
-2&4&5\\
0&0&4\\
0&0&-2
\end{pmatrix}.
$$
由后两行立刻得
$$
c=0,
$$
第一行变成
$$
-2a+4b=0\Rightarrow a=2b.
$$
取 $b=1$，可得
$$
u_1=\begin{pmatrix}2\\1\\0\end{pmatrix}.
$$

再算 $\lambda=3$。解
$$
(A-3I)u=0,
\qquad
A-3I=
\begin{pmatrix}
0&4&5\\
0&2&4\\
0&0&0
\end{pmatrix}.
$$
由前两行
$$
4b+5c=0,\qquad 2b+4c=0
$$
可推出
$$
b=c=0,
$$
因此只有 $a$ 自由。取 $a=1$，得
$$
u_2=\begin{pmatrix}1\\0\\0\end{pmatrix}.
$$

因为 $\lambda=3$ 的代数重数是 2，但这里只得到一个普通特征向量，所以还要找一个 rank 2 generalized eigenvector。解
$$
(A-3I)^2u=0.
$$
先算
$$
(A-3I)^2=
\begin{pmatrix}
0&8&16\\
0&4&8\\
0&0&0
\end{pmatrix}.
$$
设
$$
u=\begin{pmatrix}a\\b\\c\end{pmatrix},
$$
则只需满足
$$
8b+16c=0,\qquad 4b+8c=0,
$$
也就是
$$
b=-2c.
$$
取 $a=0,c=-1$，则 $b=2$，可取
$$
u_3=\begin{pmatrix}0\\2\\-1\end{pmatrix}.
$$
并且
$$
(A-3I)u_3=
\begin{pmatrix}
3\\0\\0
\end{pmatrix}
eq 0,
$$
所以它确实是 rank 2 generalized eigenvector。

对应三条解向量为

$$
x_1(t)=e^{5t}\begin{pmatrix}2\\1\\0\end{pmatrix},
$$

$$
x_2(t)=e^{3t}\begin{pmatrix}1\\0\\0\end{pmatrix},
$$

$$
x_3(t)=e^{3t}\begin{pmatrix}3t\\2\\-1\end{pmatrix}.
$$

组成 fundamental matrix

$$
\Phi(t)=
\begin{pmatrix}
2e^{5t}&e^{3t}&3te^{3t}\\
e^{5t}&0&2e^{3t}\\
0&0&-e^{3t}
\end{pmatrix}.
$$

此时
$$
\Phi(0)=
\begin{pmatrix}
2&1&0\\
1&0&2\\
0&0&-1
\end{pmatrix},
\qquad
\Phi(0)^{-1}=
\begin{pmatrix}
0&1&2\\
1&-2&-4\\
0&0&-1
\end{pmatrix}.
$$

因此
$$
e^{At}=\Phi(t)\Phi(0)^{-1}=
\begin{pmatrix}
e^{3t} & 2e^{5t}-2e^{3t} & 4e^{5t}-(4+3t)e^{3t}\\
0 & e^{5t} & 2e^{5t}-2e^{3t}\\
0 & 0 & e^{3t}
\end{pmatrix}.
$$

## Nonhomogeneous Linear Systems

$x=x_c+x_p$

对非齐次系统

$$
\mathbf{x}'=A\mathbf{x}+\mathbf{f}(t),
$$

其 general solution 仍然是

$$
\boxed{\mathbf{x}(t)=\mathbf{x}_c(t)+\mathbf{x}_p(t)}
$$

其中：

- $\mathbf{x}_c(t)$：对应齐次系统 $ \mathbf{x}'=A\mathbf{x} $ 的通解；
- $\mathbf{x}_p(t)$：任取一个 particular solution。


### Undetermined Coefficients

当右端 $\mathbf{f}(t)$ 是多项式、指数、三角函数及它们组合时，可以像第二章一样猜一个同型特解，只不过“待定系数”现在是**向量**。


#### Example

求特解：

$$
\mathbf{x}'=
\begin{pmatrix}
3&2\\
7&5
\end{pmatrix}\mathbf{x}
+
\begin{pmatrix}
3\\
2t
\end{pmatrix}.
$$

因为右端是线性向量，所以猜

$$
\mathbf{x}_p(t)=\mathbf{a}t+\mathbf{b}=
\begin{pmatrix}
a_1\\a_2
\end{pmatrix}t
+
\begin{pmatrix}
b_1\\b_2
\end{pmatrix}.
$$

代回原方程并比较 $t$ 项与常数项，得到线性方程组

$$
3a_1+2a_2=0,
$$

$$
7a_1+5a_2+2=0,
$$

$$
3b_1+2b_2+3=a_1,
$$

$$
7b_1+5b_2=a_2.
$$

解得

$$
a_1=4,\quad a_2=-6,\quad b_1=17,\quad b_2=-25.
$$

因此一个特解是

$$
x_1(t)=4t+17,\qquad x_2(t)=-6t-25.
$$

### Variation of Parameters

对非齐次系统

$$
\mathbf{x}'=P(t)\mathbf{x}+\mathbf{f}(t),
$$

若 $\Phi(t)$ 是对应齐次系统的 fundamental matrix，则猜

$$
\mathbf{x}_p(t)=\Phi(t)\mathbf{u}(t).
$$

代回并利用 $\Phi'(t)=P(t)\Phi(t)$ 可得

$$
\Phi(t)\mathbf{u}'(t)=\mathbf{f}(t),
$$

所以

$$
\mathbf{u}'(t)=\Phi(t)^{-1}\mathbf{f}(t).
$$

积分后得到

$$
\boxed{
\mathbf{x}_p(t)=\Phi(t)\int \Phi(t)^{-1}\mathbf{f}(t)\,dt
}
$$

于是 general solution 为

$$
\boxed{
\mathbf{x}(t)=\Phi(t)\mathbf{c}+\Phi(t)\int \Phi(t)^{-1}\mathbf{f}(t)\,dt
}
$$


#### Example

**Example 1**

考虑

$$
\mathbf{x}'=
\begin{pmatrix}
4&2\\
3&-1
\end{pmatrix}\mathbf{x}-
\begin{pmatrix}
15\\4
\end{pmatrix}t e^{-2t},
\qquad
\mathbf{x}(0)=
\begin{pmatrix}
7\\3
\end{pmatrix}.
$$

若已知齐次系统的 fundamental matrix $\Phi(t)$，则先算

$$
e^{At}=\Phi(t)\Phi(0)^{-1}.
$$

然后用定积分形式的参数变易法：

$$
e^{-At}\mathbf{x}(t)=\mathbf{x}_0+\int_0^t e^{-As}\mathbf{f}(s)\,ds.
$$

也就是

$$
\mathbf{x}(t)=
e^{At}\left[
\mathbf{x}_0+\int_0^t e^{-As}\mathbf{f}(s)\,ds
\right].
$$

**Example 2**

$$
\begin{cases}
x' = x,\\
y' = 2x+y-2z,\\
z' = 3x+2y+z+e^t\cos 2t.
\end{cases}
$$

Step 1：先解对应齐次系统

$$
\begin{cases}
x' = x,\\
y' = 2x+y-2z,\\
z' = 3x+2y+z.
\end{cases}
$$

对应矩阵为
$$
A=
\begin{pmatrix}
1&0&0\\
2&1&-2\\
3&2&1
\end{pmatrix}.
$$
它的特征值为
$$
\lambda_1=1,\qquad \lambda_{2,3}=1\pm 2i.
$$

对 $\lambda=1$，解 $(A-I)\mathbf{v}=0$：
$$
A-I=
\begin{pmatrix}
0&0&0\\
2&0&-2\\
3&2&0
\end{pmatrix}.
$$
由
$$
2a-2c=0,\qquad 3a+2b=0
$$
得
$$
c=a,\qquad b=-\frac32 a.
$$
取 $a=2$，可得
$$
\mathbf{v}_1=
\begin{pmatrix}
2\\-3\\2
\end{pmatrix}.
$$

对 $\lambda=1+2i$，解
$$
(A-(1+2i)I)\mathbf{v}=0,
\qquad
A-(1+2i)I=
\begin{pmatrix}
-2i&0&0\\
2&-2i&-2\\
3&2&-2i
\end{pmatrix}.
$$
由第一式得 $a=0$。第二式变成
$$
-2ib-2c=0
\Rightarrow c=-ib.
$$
取 $b=1$，则 $c=-i$，可取复特征向量
$$
\mathbf{v}=
\begin{pmatrix}
0\\1\\-i
\end{pmatrix}=
\underbrace{\begin{pmatrix}0\\1\\0\end{pmatrix}}_{\mathbf{p}}
+i\underbrace{\begin{pmatrix}0\\0\\-1\end{pmatrix}}_{\mathbf{q}}.
$$

因此齐次系统的三条实解可取为
$$
\mathbf{x}_1(t)=
\begin{pmatrix}
2\\-3\\2
\end{pmatrix}e^t,
$$
$$
\mathbf{x}_2(t)=e^t
\begin{pmatrix}
0\\
\cos 2t\\
\sin 2t
\end{pmatrix},
\qquad
\mathbf{x}_3(t)=e^t
\begin{pmatrix}
0\\
\sin 2t\\
-\cos 2t
\end{pmatrix}.
$$

于是可以取 fundamental matrix
$$
X(t)=e^t
\begin{pmatrix}
2&0&0\\
-3&\cos 2t&\sin 2t\\
2&\sin 2t&-\cos 2t
\end{pmatrix}.
$$

Step 2：设
$$
\mathbf{x}(t)=X(t)\mathbf{u}(t).
$$

代回原方程，得到
$$
X(t)\mathbf{u}'(t)=
\begin{pmatrix}
0\\
0\\
e^t\cos 2t
\end{pmatrix}.
$$

把公共因子 $e^t$ 消去，相当于解
$$
\begin{pmatrix}
2&0&0\\
-3&\cos 2t&\sin 2t\\
2&\sin 2t&-\cos 2t
\end{pmatrix}
\begin{pmatrix}
u_1'\\u_2'\\u_3'
\end{pmatrix}=
\begin{pmatrix}
0\\0\\\cos 2t
\end{pmatrix}.
$$

由第一行立刻得到
$$
u_1'=0.
$$
再由后两行
$$
\cos 2t\,u_2'+\sin 2t\,u_3'=0,
$$
$$
\sin 2t\,u_2'-\cos 2t\,u_3'=\cos 2t.
$$

解这组 $2\times 2$ 线性方程组，可得
$$
u_2'=\sin 2t\cos 2t=\frac12\sin 4t,
$$
$$
u_3'=-\cos^2 2t=-\frac12(1+\cos 4t).
$$

Step 3：积分得到
$$
u_1=C_1,
$$
$$
u_2=-\frac18\cos 4t+C_2,
$$
$$
u_3=-\frac12 t-\frac18\sin 4t+C_3.
$$

为了取一个 particular solution，只需令积分常数为 $0$，于是
$$
\mathbf{u}_p(t)=
\begin{pmatrix}
0\\[2mm]
-\frac18\cos 4t\\[2mm]
-\frac12 t-\frac18\sin 4t
\end{pmatrix}.
$$

Step 4：乘回 $X(t)$，得到特解
$$
\mathbf{x}_p(t)=X(t)\mathbf{u}_p(t)
=e^t
\begin{pmatrix}
0\\[2mm]
-\frac18\cos 2t-\frac12 t\sin 2t\\[2mm]
\frac18\sin 2t+\frac12 t\cos 2t
\end{pmatrix}.
$$

因此通解为
$$
\mathbf{x}(t)=
C_1e^t
\begin{pmatrix}
2\\-3\\2
\end{pmatrix}
+C_2e^t
\begin{pmatrix}
0\\\cos 2t\\\sin 2t
\end{pmatrix}
+C_3e^t
\begin{pmatrix}
0\\\sin 2t\\-\cos 2t
\end{pmatrix}
+e^t
\begin{pmatrix}
0\\[2mm]
-\frac18\cos 2t-\frac12 t\sin 2t\\[2mm]
\frac18\sin 2t+\frac12 t\cos 2t
\end{pmatrix}.
$$

---

## 本章方法总表

| 目标 | 场景 | 推荐方法 | 核心公式 |
|---|---|---|---|
| 把小系统化简 | 2×2 或 3×3 小系统 | **Elimination** | 消元后回到高阶 ODE |
| 解齐次常系数系统 | 特征值容易求 | **Eigenvalue Method** | $x=\mathbf{v}e^{\lambda t}$ |
| 处理重根 | 重特征值 | **Generalized Eigenvectors** | $(A-\lambda I)\mathbf{v}_{j}=\mathbf{v}_{j-1}$ |
| 统一表达齐次解 | 常系数系统 | **Matrix Exponential** | $x(t)=e^{At}x_0$ |
| 找非齐次特解 | 右端很规则 | **Undetermined Coefficients** | 猜同型特解 |
| 找非齐次特解 | 一般情形 | **Variation of Parameters** | $x_p=\Phi\int \Phi^{-1}f\,dt$ |

---
