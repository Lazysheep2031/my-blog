---
title: Design
published: 2026-04-23
description: Newton's method、class design、coupling、cohesion、Template Method、functional interface、SOLID
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Newton's method（牛顿法）** 作为例子，展示如何从一个只解决特定问题的程序，逐步重构成可复用、可扩展、可维护的设计。

- 如何把算法中 **不变的流程** 和 **会变化的问题定义** 分开；
- 如何用面向对象的 `virtual` 接口实现扩展；
- 如何用函数式风格的 `std::function` 和 lambda 实现扩展；
- 如何通过 high cohesion / loose coupling 改善代码质量；
- 如何理解 SOLID 原则背后的设计思想。


> 设计时要先识别什么是不变的，什么是会变的。把不变的封装起来，把会变的留成清晰的接口。

## 目录

- [概述](#概述)
- [目录](#目录)
- [Root-finding algorithm](#root-finding-algorithm)
  - [问题背景](#问题背景)
  - [Newton's method](#newtons-method)
  - [收敛特点](#收敛特点)
- [从硬编码版本开始](#从硬编码版本开始)
  - [解 $\\sqrt 2$](#解-sqrt-2)
  - [终止条件](#终止条件)
  - [把 magic numbers 命名](#把-magic-numbers-命名)
  - [推广到 $\\sqrt a$](#推广到-sqrt-a)
- [第一次封装：把流程放进类](#第一次封装把流程放进类)
  - [封装后的 NewtonSolver](#封装后的-newtonsolver)
  - [当前设计的问题](#当前设计的问题)
- [第二次封装：Template Method](#第二次封装template-method)
  - [分离不变流程与变化点](#分离不变流程与变化点)
  - [Library code：NewtonSolver](#library-codenewtonsolver)
  - [User code：SquareRootSolver](#user-codesquarerootsolver)
  - [扩展到 n-th root](#扩展到-n-th-root)
  - [扩展到任意函数](#扩展到任意函数)
- [另一种设计：函数式接口](#另一种设计函数式接口)
  - [核心思想](#核心思想)
  - [单文件版本](#单文件版本)
  - [用 lambda 定义问题](#用-lambda-定义问题)
  - [拆分成头文件和实现文件](#拆分成头文件和实现文件)
  - [用户代码](#用户代码)
- [两种设计方式对比](#两种设计方式对比)
- [Class design](#class-design)
  - [设计类时要问的问题](#设计类时要问的问题)
  - [Cohesion](#cohesion)
  - [Coupling](#coupling)
  - [Code duplication](#code-duplication)
  - [Software changes](#software-changes)
- [SOLID principles](#solid-principles)
  - [Single Responsibility Principle](#single-responsibility-principle)
  - [Open / Closed Principle](#open--closed-principle)
  - [Liskov Substitution Principle](#liskov-substitution-principle)
  - [Interface Segregation Principle](#interface-segregation-principle)
  - [Dependency Inversion Principle](#dependency-inversion-principle)

---

## Root-finding algorithm

### 问题背景

Root-finding algorithm 要解决的问题是：

$$
f(x)=0
$$

也就是寻找函数和 x 轴的交点。

如果方程很简单，例如：

$$
x^2 - 2 = 0
$$

我们可以用解析方法直接得到：

$$
x=\pm\sqrt 2
$$

但很多方程没有简单解析解，例如：

$$
x^5 - 5x + 3 = 0
$$

这类方程可能存在实数解，但很难写出闭式表达式。此时就需要 **numerical method（数值方法）**，用迭代方式求一个足够接近真实零点的近似值。

### Newton's method

Newton's method 的思路：

1. 给定一个初始猜测点 $x_n$；
2. 计算函数值 $f(x_n)$；
3. 在点 $(x_n, f(x_n))$ 处作切线；
4. 用这条切线与 x 轴的交点作为新的猜测 $x_{n+1}$；
5. 重复这个过程。

切线斜率为：

$$
f'(x_n)
$$

根据图中的几何关系：

$$
f'(x_n)=\frac{f(x_n)-0}{x_n-x_{n+1}}
$$

整理得到牛顿迭代公式：

$$
x_{n+1}=x_n-\frac{f(x_n)}{f'(x_n)}
$$

在程序里通常写成：

```cpp
x = x - f(x) / df(x);
```

其中：

- `f(x)` 是函数值；
- `df(x)` 是导数值；
- `x` 每轮被更新成更接近零点的值。

### 收敛特点

Newton's method 的优点是收敛很快。

quadratic convergence（二次收敛）大致表示：当当前点已经足够接近真实解时，每迭代一次，误差大约会平方级下降。

例如误差可能从：

```text
1e-2 -> 1e-4 -> 1e-8 -> 1e-16
```

它在科学计算、工程仿真、流体分析、碰撞模拟等问题中非常常见。

:::WARNING
Newton's method 不是任何初始点都一定收敛。若初始猜测离目标根太远，或者函数形状较差，迭代可能发散。实际数值计算中常会加入更 robust 的变体来提高收敛可靠性。
:::

---

## 从硬编码版本开始

### 解 $\sqrt 2$

先解决最简单的问题：

$$
x^2 = 2
$$

也就是：

$$
f(x)=x^2-2
$$

导数为：

$$
f'(x)=2x
$$

最初版本可以直接写成：

```cpp
#include <cmath>
#include <iostream>
using namespace std;

int main() {
    double x = 1.0;  // initial guess
    int k = 0;       // iteration count

    while (true) {
        cout << k << " " << x << endl;

        x = x - (x * x - 2.0) / (2.0 * x);
        ++k;
    }
}
```

这个版本的问题很明显：

- 是死循环；
- 只能解 $x^2=2$；
- 常数 `2.0` 写死在公式里；
- 用户无法方便替换问题。

### 终止条件

迭代法需要 termination condition（终止条件）。

1. 最多迭代 `max_iters` 次；
2. 当 $|f(x)| < tolerance$ 时提前停止。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

int main() {
    double x = 1.0;
    int k = 0;

    while (k < 30 && fabs(x * x - 2.0) > 1e-12) {
        cout << k << " " << x << endl;

        x = x - (x * x - 2.0) / (2.0 * x);
        ++k;
    }

    cout << k << " " << x << endl;
}
```

这里的 `fabs(x * x - 2.0)` 衡量的是当前函数值离 0 有多近。

:::TIP
判断 root-finding 的结果是否足够好，常用的不是直接看 `x` 和真实根的差，因为真实根通常不知道；而是看 `f(x)` 是否足够接近 0。
:::

### 把 magic numbers 命名

代码中的 `30` 和 `1e-12` 是 magic numbers。更好的写法是给它们命名：

```cpp
#include <cmath>
#include <iostream>
using namespace std;

int main() {
    const double tolerance = 1e-12;
    const int max_iters = 30;

    double x = 1.0;
    int k = 0;

    while (k < max_iters && fabs(x * x - 2.0) > tolerance) {
        cout << k << " " << x << endl;

        x = x - (x * x - 2.0) / (2.0 * x);
        ++k;
    }

    cout << k << " " << x << endl;
}
```

这样代码可读性更强：

- `tolerance` 表示收敛容忍度；
- `max_iters` 表示最大迭代次数。

### 推广到 $\sqrt a$

如果想求 $\sqrt a$，方程变成：

$$
x^2-a=0
$$

```cpp
#include <cmath>
#include <iostream>
using namespace std;

int main() {
    const double a = 2.0;
    const double tolerance = 1e-12;
    const int max_iters = 30;

    double x = 1.0;
    int k = 0;

    while (k < max_iters && fabs(x * x - a) > tolerance) {
        cout << k << " " << x << endl;

        x = x - (x * x - a) / (2.0 * x);
        ++k;
    }

    cout << k << " " << x << endl;
}
```

此时只要修改 `a`，就可以求不同数的平方根。

但这仍然不是一个好的设计，因为它仍然只能解决平方根问题。

---

## 第一次封装：把流程放进类

### 封装后的 NewtonSolver

接下来把求解流程封装进一个类中。这个版本仍然只处理 $x^2=a$，但已经开始把逻辑分成几个小函数。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

class NewtonSolver {
public:
    NewtonSolver(double a = 2.0,
                 double tolerance = 1e-12,
                 int max_iters = 30)
        : a(a), tolerance(tolerance), max_iters(max_iters) {}

    double improve(double x0) {
        x = x0;
        k = 0;

        while (k < max_iters && !is_close(x)) {
            print_info();
            x = x - f(x) / df(x);
            ++k;
        }

        print_info();
        return x;
    }

private:
    double f(double x) const {
        return x * x - a;
    }

    double df(double x) const {
        return 2.0 * x;
    }

    bool is_close(double x) const {
        return fabs(f(x)) < tolerance;
    }

    void print_info() const {
        cout << k << " " << x << " " << f(x) << endl;
    }

private:
    double a;
    double tolerance;
    int max_iters;

    int k = 0;
    double x = 0.0;
};

int main() {
    NewtonSolver solver(2.0);
    solver.improve(1.0);
}
```

这个版本做了几件重构：

- `improve()` 保存主循环；
- `f()` 计算函数值；
- `df()` 计算导数值；
- `is_close()` 判断是否足够接近零点；
- `print_info()` 负责打印迭代过程。

代码已经更有结构，但仍然存在设计问题。

### 当前设计的问题

这个类名叫 `NewtonSolver`，但它实际承担了两件事情：

1. Newton's method 的通用求解流程；
2. $x^2=a$ 这个具体问题的定义。

也就是说，这个类同时包含：

```text
算法流程：如何做 Newton iteration
问题定义：f(x) 是什么，df(x) 是什么
```

这违反了 high cohesion 的要求。

如果现在要解别的问题，例如：

$$
x^5 - 5x + 3 = 0
$$

目前只能复制整个类，然后修改 `f()` 和 `df()`。这说明算法流程和问题定义耦合在一起，扩展性不好。

:::TIP
当一个类承担两个语义上独立的责任时，通常说明它应该被拆分，或者至少应该把变化点抽象成接口。
:::

---

## 第二次封装：Template Method

### 分离不变流程与变化点

在 Newton's method 中：

| 部分 | 是否变化 | 说明 |
|---|---|---|
| 迭代公式 `x = x - f(x) / df(x)` | 不变 | 所有 Newton solver 都一样 |
| 最大迭代次数和 tolerance | 基本不变 | 可以作为超参数 |
| `f(x)` | 会变 | 用户的问题决定 |
| `df(x)` | 会变 | 用户的问题决定 |

所以设计目标是：

- 把不变的主流程封装到 base class；
- 把会变化的 `f()` 和 `df()` 留成 virtual interface；
- 用户通过继承定义自己的问题。

这种模式叫 **Template Method**。

> Template Method：在基类中固定算法骨架，在其中调用若干可被派生类重写的步骤。

### Library code：NewtonSolver

`NewtonSolver` 是 library code，负责 Newton's method 的通用流程。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

class NewtonSolver {
public:
    NewtonSolver(double tolerance = 1e-12,
                 int max_iters = 30)
        : tolerance(tolerance), max_iters(max_iters) {}

    virtual ~NewtonSolver() = default;

    double improve(double x0) {
        int k = 0;
        double x = x0;

        while (k < max_iters && !is_close(x)) {
            print_info(k, x);
            x = x - f(x) / df(x);
            ++k;
        }

        print_info(k, x);
        return x;
    }

private:
    bool is_close(double x) const {
        return fabs(f(x)) < tolerance;
    }

    void print_info(int k, double x) const {
        cout << k << " " << x << " " << f(x) << endl;
    }

    // Extension points for user-defined problems.
    virtual double f(double x) const = 0;
    virtual double df(double x) const = 0;

private:
    double tolerance;
    int max_iters;
};
```

这里有一个重要设计：

```cpp
virtual double f(double x) const = 0;
virtual double df(double x) const = 0;
```

这两个函数没有实现，因为 library 不知道用户要解什么问题。它们是 pure virtual functions，强制派生类提供具体实现。

`improve()` 是不变流程：

```cpp
x = x - f(x) / df(x);
```

它不需要知道具体问题，只需要通过接口调用 `f()` 和 `df()`。

:::TIP
上面代码把 `f()` 和 `df()` 放在 `private` 下，表示外界不应该直接调用它们。即使是 private virtual function，派生类仍然可以 override。实际工程中也常见把这类扩展点放在 `protected`，便于派生类理解和使用。
:::

### User code：SquareRootSolver

用户要解 $\sqrt a$，只需要定义具体问题：

$$
f(x)=x^2-a
$$

$$
f'(x)=2x
$$

```cpp
class SquareRootSolver : public NewtonSolver {
public:
    explicit SquareRootSolver(double a)
        : a(a) {}

private:
    double f(double x) const override {
        return x * x - a;
    }

    double df(double x) const override {
        return 2.0 * x;
    }

private:
    double a;
};

int main() {
    SquareRootSolver solver(2.0);
    solver.improve(1.0);
}
```

对用户来说，需要关心的只有：

- 要解什么方程；
- 函数值怎么算；
- 导数值怎么算；
- 初始猜测是什么。

用户不需要读懂 NewtonSolver 的内部迭代逻辑。

### 扩展到 n-th root

如果要解：

$$
x^n=a
$$

也就是求 $\sqrt[n]{a}$，则：

$$
f(x)=x^n-a
$$

$$
f'(x)=n x^{n-1}
$$

```cpp
#include <cmath>

class NthRootSolver : public NewtonSolver {
public:
    NthRootSolver(double a, int n)
        : a(a), n(n) {}

private:
    double f(double x) const override {
        return pow(x, n) - a;
    }

    double df(double x) const override {
        return n * pow(x, n - 1);
    }

private:
    double a;
    int n;
};

int main() {
    NthRootSolver solver1(64.0, 2); // sqrt(64) = 8
    solver1.improve(1.0);

    NthRootSolver solver2(64.0, 3); // cbrt(64) = 4
    solver2.improve(1.0);

    NthRootSolver solver3(64.0, 6); // 6th root of 64 = 2
    solver3.improve(1.0);
}
```

可以看到，新增问题时不需要修改 `NewtonSolver`，只需要增加一个新的派生类。

这就是 open for extension, closed for modification 的思想。

### 扩展到任意函数

一个随意定义的函数：

$$
f(x)=\sin x - x^3
$$

导数为：

$$
f'(x)=\cos x - 3x^2
$$

```cpp
#include <cmath>

class WhateverSolver : public NewtonSolver {
private:
    double f(double x) const override {
        return sin(x) - x * x * x;
    }

    double df(double x) const override {
        return cos(x) - 3.0 * x * x;
    }
};

int main() {
    WhateverSolver solver;
    solver.improve(1.0);
}
```

如果函数有多个零点，Newton's method 最后收敛到哪个解，与初始猜测 `x0` 密切相关。

例如：

```cpp
solver.improve(1.0);
solver.improve(-1.0);
solver.improve(10.0);
```

不同初值可能进入不同根的吸引域。

---

## 另一种设计：函数式接口

### 核心思想

C++ 不只能用 OO 的继承和虚函数来做扩展。也可以用更函数式的方式：

> 把会变化的函数 `f` 和 `df` 作为参数传入通用算法。

此时：

- 不再定义基类；
- 不再让用户继承；
- 用户只需要提供两个函数对象；
- 通用 solver 调用这两个函数对象。

这体现了另一种接口设计方式。

### 单文件版本

先定义函数类型：

```cpp
#include <cmath>
#include <functional>
#include <iostream>
using namespace std;

using Fn = function<double(double)>;
```

这里：

```cpp
function<double(double)>
```

表示一个函数对象：

- 参数类型是 `double`；
- 返回值类型是 `double`。

通用 Newton solver 写成一个普通函数：

```cpp
double newton_solve(Fn f,
                    Fn df,
                    double x0,
                    double tolerance = 1e-12,
                    int max_iters = 30) {
    int k = 0;
    double x = x0;

    auto is_close = [&](double x) {
        return fabs(f(x)) < tolerance;
    };

    auto print_info = [&](int k, double x, double fx) {
        cout << k << " " << x << " " << fx << endl;
    };

    while (k < max_iters && !is_close(x)) {
        double fx = f(x);
        print_info(k, x, fx);

        x = x - fx / df(x);
        ++k;
    }

    print_info(k, x, f(x));
    return x;
}
```

这里的核心变化是：

```cpp
Fn f, Fn df
```

它们从外部传进来。

### 用 lambda 定义问题

求平方根：

```cpp
double square_root_newton(double a, double x0 = 1.0) {
    Fn f = [a](double x) {
        return x * x - a;
    };

    Fn df = [](double x) {
        return 2.0 * x;
    };

    return newton_solve(f, df, x0);
}
```

这里：

```cpp
[a]
```

表示 lambda 捕获外部变量 `a`。所以 `f` 这个函数对象不仅有参数 `x`，还记住了上下文里的 `a`。

求 n 次根：

```cpp
double nth_root_newton(double a, int n, double x0 = 1.0) {
    Fn f = [a, n](double x) {
        return pow(x, n) - a;
    };

    Fn df = [n](double x) {
        return n * pow(x, n - 1);
    };

    return newton_solve(f, df, x0);
}
```

任意函数：

```cpp
double whatever_newton(double x0 = 1.0) {
    Fn f = [](double x) {
        return sin(x) - x * x * x;
    };

    Fn df = [](double x) {
        return cos(x) - 3.0 * x * x;
    };

    return newton_solve(f, df, x0);
}
```

使用：

```cpp
int main() {
    cout << square_root_newton(2.0) << endl;
    cout << nth_root_newton(64.0, 2) << endl;
    cout << nth_root_newton(64.0, 3) << endl;
    cout << nth_root_newton(64.0, 6) << endl;
    cout << whatever_newton(1.0) << endl;
}
```

这种写法没有继承，但同样达到了扩展效果：用户只需要定义 `f` 和 `df`。

### 拆分成头文件和实现文件

将函数式版本拆成库代码和用户代码。

`newton_solver.hh`

```cpp
#ifndef NEWTON_SOLVER_HH
#define NEWTON_SOLVER_HH

#include <functional>

namespace ns {

using Fn = std::function<double(double)>;

double newton_solve(Fn f,
                    Fn df,
                    double x0,
                    double tolerance = 1e-12,
                    int max_iters = 30);

} // namespace ns

#endif // NEWTON_SOLVER_HH
```

这个头文件是接口。用户只需要知道：

- `Fn` 是什么类型；
- `newton_solve` 怎么调用。

`newton_solver.cpp`

```cpp
#include "newton_solver.hh"

#include <cmath>
#include <iostream>

namespace ns {
namespace {

bool is_close(Fn f, double x, double tolerance) {
    return std::fabs(f(x)) < tolerance;
}

void print_info(int k, double x, double fx) {
    std::cout << k << " " << x << " " << fx << std::endl;
}

} // anonymous namespace

double newton_solve(Fn f,
                    Fn df,
                    double x0,
                    double tolerance,
                    int max_iters) {
    int k = 0;
    double x = x0;

    while (k < max_iters && !is_close(f, x, tolerance)) {
        double fx = f(x);
        print_info(k, x, fx);

        x = x - fx / df(x);
        ++k;
    }

    print_info(k, x, f(x));
    return x;
}

} // namespace ns
```

注意：默认参数只写在函数声明里即可。实现文件里的定义不再重复写默认参数。

### 用户代码

`main.cpp`

```cpp
#include "newton_solver.hh"

#include <cmath>
#include <iostream>

using ns::Fn;

// Solve x^2 = a
double square_root_newton(double a, double x0 = 1.0) {
    Fn f = [a](double x) {
        return x * x - a;
    };

    Fn df = [](double x) {
        return 2.0 * x;
    };

    return ns::newton_solve(f, df, x0);
}

// Solve x^n = a
double nth_root_newton(double a, int n, double x0 = 1.0) {
    Fn f = [a, n](double x) {
        return std::pow(x, n) - a;
    };

    Fn df = [n](double x) {
        return n * std::pow(x, n - 1);
    };

    return ns::newton_solve(f, df, x0);
}

// Solve sin(x) - x^3 = 0
double whatever_newton(double x0 = 1.0) {
    Fn f = [](double x) {
        return std::sin(x) - x * x * x;
    };

    Fn df = [](double x) {
        return std::cos(x) - 3.0 * x * x;
    };

    return ns::newton_solve(f, df, x0);
}

int main() {
    std::cout << square_root_newton(2.0) << std::endl;
    std::cout << nth_root_newton(64.0, 2) << std::endl;
    std::cout << nth_root_newton(64.0, 3) << std::endl;
    std::cout << nth_root_newton(64.0, 6) << std::endl;
    std::cout << whatever_newton(1.0) << std::endl;
}
```

编译方式示例：

```bash
g++ -std=c++17 main.cpp newton_solver.cpp -o main
./main
```

这个版本中：

- `newton_solver.hh` 是库接口；
- `newton_solver.cpp` 是库实现；
- `main.cpp` 是用户代码；
- 用户不需要知道 `newton_solve` 内部怎么迭代，只需要提供 `f` 和 `df`。

---

## 两种设计方式对比

| 设计方式 | 扩展点 | 用户需要做什么 | 优点 | 代价 |
|---|---|---|---|---|
| OO / Template Method | `virtual f()` 和 `virtual df()` | 继承基类，override 两个函数 | 结构清晰，适合对象体系 | 需要定义类，存在继承关系 |
| Functional interface | `std::function` 参数 | 定义函数/lambda，作为参数传入 | 轻量，调用灵活 | 函数对象抽象可能有额外开销 |

二者精神一致：

> 固定不变的主流程，开放会变化的部分。

设计没有绝对唯一答案。实际项目中要根据团队规范、代码风格、性能要求、模块边界来选择。

---

## Class design

### 设计类时要问的问题

class design 问题包括：

- How many types of class do we need?
- When to define a class?
- What kind of interface/data in a class?
- Shall we utilize inheritance to promote interface and code reuse?
- Which function should be virtual to support dynamic binding at run-time?

也就是设计类时要考虑：

1. 需要几个类；
2. 什么时候应该定义新类；
3. 哪些数据应该放进类；
4. 哪些函数应该作为 public interface；
5. 是否应该用 inheritance；
6. 哪些函数应该设计成 virtual；
7. 类的扩展点在哪里。

### Cohesion

Cohesion（内聚）描述的是：

> 一个模块、类、函数承担的任务是否集中。

如果一个函数只做一个明确任务，一个类只表示一个清晰实体，就称为 high cohesion。

原则：

- A method should be responsible for one and only one well-defined task.
- A class should represent one single, well-defined entity.

高内聚的好处：

- 更容易理解类或函数在做什么；
- 更容易命名；
- 更容易复用；
- 更容易修改和测试。

最初的 `NewtonSolver` 同时负责：

1. Newton iteration；
2. 定义 $x^2=a$ 问题。

这就是内聚不够高。重构后：

- `NewtonSolver` 只负责求解流程；
- `SquareRootSolver` / `NthRootSolver` 只负责问题定义。

### Coupling

Coupling（耦合）描述的是：

> 不同模块之间依赖得有多紧。

> If X changes, how much code in Y has to change?

如果一个类的修改会导致另一个类大量修改，说明它们 tightly coupled。

目标是 loose coupling。

低耦合的好处：

- 可以单独理解一个类；
- 修改一个类时不容易影响其他类；
- 系统更容易维护；
- 更容易扩展。

实现 loose coupling 的常见技术包括：

- callback；
- message mechanism；
- interface abstraction；
- virtual interface；
- function object / lambda。

本讲中：

- OO 版本通过 virtual interface 降低耦合；
- functional 版本通过 `std::function` 降低耦合。

### Code duplication

Code duplication（代码重复）通常是 bad design 的信号。

它会导致：

- 维护困难；
- bug 修复遗漏；
- 修改一个逻辑时要同步修改多个地方；
- 不同副本逐渐不一致。

如果每定义一个新方程都要复制一份 Newton iteration 主循环，就说明设计不合理。

更好的方式是：

```text
Newton iteration 写一次
不同问题只提供 f 和 df
```

### Software changes

软件长期会经历：

- extension：增加新功能；
- correction：修 bug；
- maintenance：维护；
- porting：迁移平台；
- adaptation：适应新需求。

所以设计时要 thinking ahead：

> When designing a class, we try to think what changes are likely to be made in the future.

设计不是预测所有未来，而是识别最可能变化的部分，让这些变化变得容易。

最明显会变化的是：

```text
用户要解的具体方程
```

所以 `f` 和 `df` 应该成为扩展点。

---

## SOLID principles

SOLID 是面向对象设计中的五个原则，用来提高代码的可理解性、灵活性和可维护性。

### Single Responsibility Principle

> There should never be more than one reason for a class to change.

一个类应该只有一个主要职责。

在本讲例子中，如果 `NewtonSolver` 既负责算法又负责具体问题，那么它有两个变化原因：

1. Newton 算法逻辑变化；
2. 具体方程变化。

重构后职责被拆开。

### Open / Closed Principle

> Software entities should be open for extension, but closed for modification.

代码应该能通过扩展支持新需求，而不是每次都修改已有核心代码。

本讲中：

- 新增 `SquareRootSolver`；
- 新增 `NthRootSolver`；
- 新增 `WhateverSolver`；

都不需要修改 `NewtonSolver` 的主流程。

### Liskov Substitution Principle

> Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it.

使用基类指针或引用的代码，应该能够在不知道派生类具体类型的情况下正确使用派生类对象。

如果 `NewtonSolver` 是基类，派生类必须真正满足它要求的接口契约：

```cpp
virtual double f(double x) const = 0;
virtual double df(double x) const = 0;
```

### Interface Segregation Principle

> Clients should not be forced to depend upon interfaces that they do not use.

接口应该小而清晰，不应该强迫用户实现或依赖自己不需要的功能。

本讲例子中，用户只需要提供：

```cpp
f(x)
df(x)
```

这就是一个很小的接口。

### Dependency Inversion Principle

> Depend upon abstractions, not concretions.

高层逻辑应该依赖抽象接口，而不是依赖具体实现。

在 OO 版本中，Newton 主流程依赖的是：

```cpp
virtual double f(double x) const;
virtual double df(double x) const;
```

不是依赖某个具体方程。

在函数式版本中，Newton 主流程依赖的是：

```cpp
std::function<double(double)>
```

不是依赖某个具体函数名。

---
