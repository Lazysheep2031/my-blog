---
title: Class
published: 2026-04-02
description: class、object、封装、抽象、头文件与源文件、构造析构、RAII、this、const 成员函数、static 成员、inline
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

核心主线可以概括成：

- 从 `struct + 函数` 过渡到 `class + member function`
- 理解 **对象 = 属性 + 服务**
- 区分类和对象，理解封装、抽象、模块化
- 学会用 `.h` 和 `.cpp` 组织一个类，理解编译单元、头文件、`#include`、include guard
- 理解构造函数和析构函数为什么能保证“初始化”和“清理”
- 掌握 RAII 的基本思想
- 分清字段（field）和局部变量（local variable）
- 理解 `this` 这个隐含参数
- 掌握 `const` 对象、`const` 成员函数、`const` 字段
- 掌握 `static` 成员变量、`static` 成员函数
- 理解 `inline` 的意义、优缺点，以及和宏的区别


## 目录

- [概述](#概述)
- [目录](#目录)
- [Point 引入：为什么需要 class](#point-引入为什么需要-class)
  - [最原始的写法：全塞进 `main`](#最原始的写法全塞进-main)
  - [C 风格改进：`struct + 函数`](#c-风格改进struct--函数)
  - [C++ 风格：把数据和操作封装进类](#c-风格把数据和操作封装进类)
- [对象与类：Objects = Attributes + Services](#对象与类objects--attributes--services)
  - [对象和类分别是什么](#对象和类分别是什么)
  - [消息、方法与状态变化](#消息方法与状态变化)
  - [封装、抽象、模块化](#封装抽象模块化)
    - [1. Encapsulation：封装](#1-encapsulation封装)
    - [2. Abstraction：抽象](#2-abstraction抽象)
    - [3. Modularization：模块化](#3-modularization模块化)
- [Example](#example)
- [类的定义与程序组织](#类的定义与程序组织)
  - [头文件和源文件分离](#头文件和源文件分离)
  - [`::` 作用域解析运算符](#-作用域解析运算符)
  - [编译单元、头文件、链接](#编译单元头文件链接)
  - [`#include` 的本质](#include-的本质)
  - [头文件防重包含](#头文件防重包含)
  - [PImpl / Opaque Pointer](#pimpl--opaque-pointer)
  - [CMake 初步](#cmake-初步)
- [ClockDisplay：类可以由别的对象组成](#clockdisplay类可以由别的对象组成)
- [构造函数与析构函数](#构造函数与析构函数)
  - [为什么 `init()` 不够好](#为什么-init-不够好)
  - [构造函数：guaranteed initialization](#构造函数guaranteed-initialization)
  - [析构函数：guaranteed cleanup](#析构函数guaranteed-cleanup)
  - [什么时候会调用 ctor / dtor](#什么时候会调用-ctor--dtor)
  - [RAII](#raii)
    - [Example 1：锁](#example-1锁)
    - [Example 2：文件](#example-2文件)
    - [Example 3：动态数组](#example-3动态数组)
- [初始化相关问题](#初始化相关问题)
  - [聚合初始化](#聚合初始化)
  - [默认构造函数](#默认构造函数)
  - [初始化列表](#初始化列表)
    - [1. 函数体里的赋值不是初始化](#1-函数体里的赋值不是初始化)
    - [2. 真正的初始化顺序由**字段声明顺序**决定](#2-真正的初始化顺序由字段声明顺序决定)
  - [初始化 vs 赋值](#初始化-vs-赋值)
- [字段、局部变量与 `this`](#字段局部变量与-this)
  - [字段和局部变量的区别](#字段和局部变量的区别)
    - [局部变量](#局部变量)
    - [字段](#字段)
  - [`this`：隐藏参数](#this隐藏参数)
- [`const` 对象与 `const` 成员函数](#const-对象与-const-成员函数)
  - [为什么有 `const` 成员函数](#为什么有-const-成员函数)
  - [常对象能调用什么](#常对象能调用什么)
  - [`const` 成员函数内部不能做什么](#const-成员函数内部不能做什么)
  - [`const` 字段](#const-字段)
- [`static` 成员](#static-成员)
  - [静态成员变量](#静态成员变量)
  - [静态成员函数](#静态成员函数)
  - [类内编译期常量](#类内编译期常量)
  - [如何使用静态成员](#如何使用静态成员)
- [`inline` 函数](#inline-函数)
  - [函数调用开销](#函数调用开销)
  - [`inline` 的作用与代价](#inline-的作用与代价)
  - [`inline` vs 宏](#inline-vs-宏)
  - [编译器不一定真的内联](#编译器不一定真的内联)
  - [类内定义函数为什么默认 inline](#类内定义函数为什么默认-inline)

---

## Point 引入：为什么需要 class

### 最原始的写法：全塞进 `main`

```cpp
#include <iostream>
using namespace std;

int px, py;

int main()
{
    px = 2, py = 3;
    cout << "Point at [" << px << ", " << py << "]\n";
    
    px += 5, py += 5;
    cout << "Point at [" << px << ", " << py << "]\n";
}
```

此时这个代码的可重用能力非常弱，全部放在了 `main` 函数中。如果我们想要创建一个新的点，就需要复制粘贴一大段代码，这样会导致代码冗余、维护困难。

更关键的是，这里根本没有“点”这个抽象，只有两个裸露的全局变量 `px` 和 `py`。这说明：

- **数据没有被组织起来**
- **操作没有绑定到数据上**
- **程序规模一大就会混乱**

### C 风格改进：`struct + 函数`

先用结构体把数据绑在一起，再用函数去操作它。

```cpp
#include <iostream>
using namespace std;

struct Point
{
    int x, y;
};
void point_init(Point *p, int ix, int iy);
void point_print(Point *p);
void point_move(Point *p, int dx, int dy);
/*
这一块内容是开放给用户的接口，用户可以通过调用这些函数来操作Point结构体，而不需要关心具体的实现细节。
 */

void point_init(Point *p, int ix, int iy)
{
    p->x = ix;
    p->y = iy;
}

void point_print(Point *p)
{
    cout << "Point at [" << p->x << ", " << p->y << "]\n";
}

void point_move(Point *p, int dx, int dy)
{
    p->x += dx;
    p->y += dy;
}

int main()
{
    Point p;
    point_init(&p, 2, 3);
    point_print(&p);
    point_move(&p, 5, 5);
    point_print(&p);
}
```

在上面的代码中，我们定义了一个结构体 `Point` 来表示一个点，并且定义了三个函数来操作这个点。这样我们就可以创建多个点，并且对它们进行操作，而不需要复制粘贴代码。

这已经比前一种写法好很多了，因为它做到了两件事：

1. 用 `struct Point` 把 `x` 和 `y` 作为一个整体看待。
2. 用 `point_init` / `point_move` / `point_print` 形成了一组围绕 `Point` 的接口。

但是它仍然有明显问题：

- 函数名都要手动加上 `point_` 前缀
- 调用时总要显式传 `&p`
- 数据和函数虽然“相关”，但语法层面仍然是分离的
- 使用者仍然可以随便改 `p.x`、`p.y`，封装性不够

### C++ 风格：把数据和操作封装进类

C++ 版本对应 slides 里的 `class Point`：

```cpp
#include <iostream>
using namespace std;
class Point
{
public:
    int x, y;
    void init(int ix, int iy)
    {
        x = ix; // this->x = ix;也可以这么写，因为隐含参数没有呈现出来，所以我们可以直接使用成员变量的名字来访问它们，编译器会自动将它们转换为this->x和this->y。
        y = iy; // this->y = iy;
    }
    void print()
    {
        cout << "Point at [" << x << ", " << y << "]\n";
    }
    void move(int dx, int dy)
    {
        x += dx;
        y += dy;
    }
};
int main()
{
    Point p;
    p.init(2, 3); // init(&p, 2, 3);
    p.print();
    p.move(5, 5);
    p.print();
}
```

在上面的代码中，我们定义了一个类 `Point`，类中包含了数据成员 `x` 和 `y`，以及成员函数 `init`、`print` 和 `move`。通过这种方式，我们将数据和操作数据的函数封装在一起，使得代码更加清晰和易于维护。

这里和 C 风格最本质的区别是：

- `move` 不再是“一个普通函数 + 一个 `Point*` 参数”
- 它变成了“**属于 Point 的操作**”
- 调用方式从 `move(&p, 2, 2)` 变成了 `p.move(2, 2)`

这正是面向对象里“对象接收消息并作出响应”的最基础直觉。

更规范一点，我们会把成员变量放进 `private`，把接口放进 `public`：

```cpp
class Point {
public:
    void init(int x, int y);
    void move(int dx, int dy);
    void print() const;

private:
    int x;
    int y;
};
```

这样类的使用者只能通过公开的方法操作对象，而不能随便改内部状态。

---

## 对象与类：Objects = Attributes + Services

> **Objects = Attributes + Services**

也就是：

- **Attributes / Data**：对象当前的属性、状态
- **Services / Operations**：对象对外提供的功能

### 对象和类分别是什么

**Object（对象）**：

- 表示现实中的某个具体事物、事件或概念
- 在运行时存在
- 能接收“消息”并作出响应

**Class（类）**：

- 是对象的抽象描述、蓝图、模板
- 规定某类对象应该有哪些数据、哪些方法
- 在 C++ 里像一种用户自定义类型

可以把它理解成：

- `Point` 是类
- `p`、`a`、`b` 是对象

就像：

- `猫` 是类
- `我家这只猫` 是对象

### 消息、方法与状态变化

面向对象里经常说：

> 程序是很多对象彼此发送消息。

在 C++ 里，这种“消息”通常就体现为 **成员函数调用**：

```cpp
p.move(2, 3);
p.print();
```

消息的特点：

- 由发送者发出
- 由接收者解释
- 可能有返回值
- 可能引起对象状态改变（side effects）

例如：

```cpp
p.move(2, 3);
```

就会修改 `p` 的内部状态，也就是它的 `x` 和 `y`。

### 封装、抽象、模块化

这一块是一组非常核心的 OOP 概念。

#### 1. Encapsulation：封装

封装就是：

- 把数据和方法绑在一起
- 隐藏数据处理的细节
- 限制外部只能通过公开接口访问

也就是：

> 你可以使用对象，但不必知道对象内部到底怎么实现。

#### 2. Abstraction：抽象

抽象就是：

> 忽略不重要的实现细节，只关注高层问题。

比如当我们使用 `Point` 时，我们更关心：

- 点能不能移动
- 能不能打印
- 坐标是什么

而不是关心编译器最终怎么把它放在内存里。

#### 3. Modularization：模块化

模块化是：

> 把一个大系统拆成多个可以分别构建、通过明确接口协作的小部分。

比如：

- `Point` 是一个模块
- `LineSegment` 是一个模块
- `ClockDisplay` 是一个模块

每个模块对外给接口，对内藏实现。

---

## Example

**TicketMachine 如何从现实对象抽象成类**

一个自动售票机的例子来说明“如何从现实事物抽象成类”。

如果观察一个 TicketMachine，可以发现它有：

**数据 / 状态**

- `PRICE`：票价
- `balance`：当前投入的钱
- `total`：累计收入

**操作 / 服务**

- `showPrompt()`：显示提示信息
- `getMoney()`：收钱
- `printTicket()`：出票
- `showBalance()`：显示余额
- `printError()`：显示错误

于是就可以抽象成：

```cpp
class TicketMachine {
public:
  void showPrompt();
  void getMoney();
  void printTicket();
  void showBalance();
  void printError();
private:
  const int PRICE;
  int balance;
  int total;
};
```

这说明类设计的一般套路是：

1. 先找出对象的**状态**
2. 再找出对象能做的**行为**
3. 决定哪些内容对外公开，哪些内容应该隐藏

这个过程本质上就是：

> **从现实问题中抽出对象模型。**

---

## 类的定义与程序组织

### 头文件和源文件分离

在 C++ 里，一个类通常拆成两部分：

- `.h`：放类声明、函数原型，表示接口
- `.cpp`：放函数实现，表示细节

这也是你笔记里已经开始写的风格。

如果分开封装功能实现细节和接口的话：

`point.h`

```cpp
struct Point
{
private:
    int x, y;
public:
    void init(int ix, int iy);
    void print();
    void move(int dx, int dy);
};
```

`point.cpp`

```cpp
#include "point.h"
#include <iostream>
using namespace std;

void Point::init(int ix, int iy)
{
    x = ix;
    y = iy;
}

void Point::print()
{
    cout << "Point at [" << x << ", " << y << "]\n";
}

void Point::move(int dx, int dy)
{
    x += dx;
    y += dy;
}
```

`main.cpp`

```cpp
#include "point.h"

int main()
{
    Point p;
    p.init(2, 3);
    p.print();
    p.move(5, 5);
    p.print();
}
```

编译方式：

```bash
g++ main.cpp point.cpp
./a.out
```

更规范地说：

- `point.h` 是别人如何使用 `Point` 的说明书
- `point.cpp` 是 `Point` 内部到底怎么做的实现细节

### `::` 作用域解析运算符

当成员函数写在类外实现时，要用：

```cpp
ClassName::functionName
```

比如：

```cpp
void Point::move(int dx, int dy)
{
    x += dx;
    y += dy;
}
```

这里的 `Point::move` 表示：

- 这是 `Point` 类的成员函数 `move`
- 而不是一个普通全局函数

一种特殊情况：

```cpp
void S::f() {
  ::f(); // 否则会递归调用 S::f()
  ::a++; // 选择全局作用域的 a
  a--;   // 选择类作用域中的 a
}
```

其中：

- `::f()` 表示调用**全局作用域**里的 `f`
- `S::f()` 表示调用 **S 类作用域**里的 `f`

所以 `::` 的本质就是：

> **告诉编译器：这个名字属于哪个作用域。**

### 编译单元、头文件、链接

这一部分和上一讲 memory model 的**编译单元**能很好接上。

- 一个 `.cpp` 文件是一个 **compile unit / translation unit**
- 编译器一次只看一个 `.cpp`
- 每个 `.cpp` 会先单独编译成目标文件（如 `.o` / `.obj`）
- 最后链接器把它们链接成一个可执行文件

所以：

- `.cpp` 之间默认彼此看不见
- 想让别的 `.cpp` 知道某个类/函数/变量的声明，就要把声明放进 `.h`

> **Header = interface**

头文件本质上是作者和使用者之间的合同。

### `#include` 的本质

> `#include <point.h>` 本质上是在编译单元前面加入这个头文件的代码。

更准确地说，`#include` 是**预处理阶段的文本替换**。

比如：

```cpp
#include "point.h"
```

等价于把 `point.h` 的内容原封不动地插进来。

两种常见形式：

```cpp
#include "xx.h"
#include <xx.h>
```

一般理解为：

- `"xx.h"`：通常优先在当前目录找
- `<xx.h>`：通常在系统指定目录找

### 头文件防重包含

假设：

`line_segment.h`

```cpp
#include "point.h"
struct LineSegment
{
private:
    Point start, end;
public:
    void init(Point s, Point e);
    void print();
};
```

而 `main.cpp` 里又写：

```cpp
#include "point.h"
#include "line_segment.h"
```

因为 `line_segment.h` 已经包含了 `point.h`，这样就可能导致 `point.h` 被展开两次，从而报重复定义错误。

解决方法就是 **include guard**。

`point.h`

```cpp
#ifndef POINT_H
#define POINT_H

struct Point
{
private:
    int x, y;
public:
    void init(int ix, int iy);
    void print();
    void move(int dx, int dy);
};
#endif // POINT_H
```

含义是：

- 如果 `POINT_H` 还没定义，就定义它并展开头文件内容
- 如果已经定义过了，说明这个头文件之前已经被包含过，就直接跳过

还有一种常见写法是：

```cpp
#pragma once
struct Point
{
private:        
    int x, y;   
public:
    void init(int ix, int iy);
    void print();
    void move(int dx, int dy);
};
```

`#pragma once` 更简洁。

### PImpl / Opaque Pointer

> PImpl technique: debatable, hides private members and removes compilation dependency.

这是一种更进阶的类实现方式，Further Reading 给的是 **Opaque Pointer / PImpl idiom**。

它的核心思想是：

- 在头文件里，不暴露完整私有实现
- 只暴露一个“指向实现的指针”
- 真正的实现细节放在 `.cpp` 里

典型形式大概像这样：

```cpp
// PublicClass.h
#include <memory>

class PublicClass {
public:
    PublicClass();
    ~PublicClass();
private:
    struct CheshireCat;
    std::unique_ptr<CheshireCat> d_ptr_;
};
```

```cpp
// PublicClass.cpp
#include "PublicClass.h"

struct PublicClass::CheshireCat {
    int a;
    int b;
};
```

它的好处是：

- 可以隐藏更多实现细节
- 私有字段变化时，头文件不一定变化
- 减少编译依赖
- 有利于二进制兼容性

代价是：

- 多了一层间接访问
- 写法更复杂

### CMake 初步

`CMakeLists.txt`

```cmake
cmake_minimum_required(VERSION 2.8.9)
project(hello)
add_executable(hello main.cpp point.cpp)
```

一般操作流程：

```bash
mkdir build
cd build
cmake ..
make
./hello
```

需要先知道：

- **CMake 不是编译器**
- 它也不是最终的 build system 本体
- 它的作用是：**生成别的构建系统需要的文件**，比如 Makefile

---

## ClockDisplay：类可以由别的对象组成

> 一个对象自己的内存，可以由其他对象组成。

比如一个时钟显示器，可以由两个两位数字显示器组成：

- 一个负责小时 `hours`
- 一个负责分钟 `minutes`

类图大致是：

```cpp
class NumberDisplay {
private:
    int limit;
    int value;
public:
    bool increase();
};

class ClockDisplay {
private:
    NumberDisplay hours;
    NumberDisplay minutes;
public:
    void start();
};
```

这里要体会的是：

- 类和对象不只是在“模仿现实中的东西”
- 也可以是“由更小对象拼起来的抽象模块”

这正对应了前面说的：

- abstraction
- modularization
- composition（组合）

---

## 构造函数与析构函数

### 为什么 `init()` 不够好

在讲到 `Point::init()` 时，实际上是在引出一个问题：

```cpp
Point a;
a.init(1, 2);
```

这里的危险在于：

```cpp
Point a;
// 如果忘记写 a.init(1, 2)
a.move(2, 2);
a.print();
```

那这个对象就可能在“未正确初始化”的状态下被使用。

所以仅靠一个普通成员函数 `init()`，并不能保证对象一创建就合法。

### 构造函数：guaranteed initialization

构造函数（constructor, ctor）的作用就是：

> 当对象创建时，由编译器保证它会被调用。

基本规则：

- 名字和类名相同
- 没有返回类型

例如：

```cpp
class Point {
public:
    Point(int x, int y);
    void move(int dx, int dy);
    void print() const;
private:
    int x;
    int y;
};
```

```cpp
Point::Point(int ix, int iy)
{
    x = ix;
    y = iy;
}
```

调用时：

```cpp
Point a(1, 2);
```

和普通函数的差异在于：

- 普通函数需要你手动调用
- 构造函数在对象创建时自动调用

可以理解成：

```cpp
void f() {
    X a;
    // 编译器保证这里会先执行 a.X(); 的构造逻辑
}
```

### 析构函数：guaranteed cleanup

析构函数（destructor, dtor）的作用是：

> 当对象生命周期结束时，由编译器保证自动调用，用来做清理工作。

基本规则：

- 名字是 `~类名`
- 没有参数
- 没有返回类型

例如：

```cpp
class Y {
public:
    ~Y();
};
```

析构函数适合释放：

- 文件句柄
- 锁
- 动态内存
- 其他需要“善后”的资源

### 什么时候会调用 ctor / dtor

```cpp
X global_x;

void foo() {
    static X static_x;
    X local_x1;
    X* p = new X;
    {
        X local_x2;
    }
    delete p;
}
```

需要分情况理解：

1. `global_x`
   - 程序开始前构造
   - 程序结束时析构

2. `static_x`
   - 第一次执行到这一句时构造
   - 程序结束时析构

3. `local_x1`
   - 进入 `foo()` 时构造
   - 离开 `foo()` 时析构

4. `local_x2`
   - 进入内部花括号时构造
   - 离开那对花括号时析构

5. `new X`
   - `new` 时构造
   - `delete p` 时析构

另一个例子：

```cpp
int foo(int a) {
    X local_x;
    if (a > 10) {
        cout << "oops!" << endl;
        return 1;
    }
    cout << "good!" << endl;
    return 0;
}
```

即使 `return` 提前发生，`local_x` 的析构函数也一定会被调用。

这点非常重要，因为它正是 RAII 成立的基础。

### RAII

RAII = **Resource Acquisition Is Initialization**。

它的意思不是“资源 = 初始化”，而是：

> **把资源的获取和对象的生命周期绑定起来。**

原则是：

- 在构造函数里获取资源
- 在析构函数里释放资源

这样只要对象能正常析构，资源就一定能释放。

#### Example 1：锁

```cpp
std::mutex m;

void bad() {
  m.lock();
  if (!everything_ok())
    return; // early return without mutex release
  m.unlock();
}

void good() {
  std::lock_guard<std::mutex> lk(m);
  if (!everything_ok())
    return; // unlock
} // unlock
```

`bad()` 的问题是：

- 一旦中途 `return`
- `unlock()` 根本来不及执行
- 锁就泄漏了

`good()` 里用了 `lock_guard`：

- 构造时加锁
- 析构时解锁
- 即使提前 `return`，也没问题

#### Example 2：文件

```cpp
void foo(const std::string& message) {
  std::ofstream file("example.txt");
  if (!everything_ok())
    return; // file close
  file << message << std::endl;
} // file close
```

这里 `file` 是局部对象：

- 创建时打开文件
- 离开作用域时析构
- 析构时关闭文件

所以不需要你手动 `close()` 才安全。

#### Example 3：动态数组

```cpp
void bar() {
  std::unique_ptr<int[]> up(new int[100]);
  if (!everything_ok())
    return; // delete[]
} // delete[]
```

这里 `unique_ptr` 负责托管 `new int[100]`：

- 当 `up` 析构时会自动释放这块动态内存
- 避免了忘记 `delete[]`

这也对应你上一讲 memory model 里关于 `new/delete` 的知识。

---

## 初始化相关问题

### 聚合初始化

几组常见形式：

```cpp
int a[5] = {1,2,3,4,5};
int b[6] = {5};
int c[] = {1,2,3,4};

struct X {
  int i; float f; char c;
};
X x1 = {1, 2.2, 'c'};
X x2[3] = { {1, 1.1, 'a'}, {2, 2.2, 'b'} };
```

这类初始化的特点是：

- 按成员顺序直接给初值
- 常用于数组、简单 `struct`
- 少写的部分会做默认补齐

### 默认构造函数

默认构造函数（default constructor）就是：

> **不带参数、可以无参调用的构造函数。**

```cpp
struct Y {
    int i;
    float f;
    Y(int a) { i = a; }
    Y() {}
};
int main()
{
    Y y1[3] = {};
}
```

这里之所以可以，因为你显式写了一个 `Y()`。

如果我们写：

```cpp
struct Y {
    int i;
    float f;
    Y(int a) { i = a; }
};
```

那么：

```cpp
Y y3[7];
Y y4;
```

都会出问题，因为这需要默认构造函数，但类里已经定义了别的构造函数，编译器就**不会再自动帮你生成默认构造函数**。

> If (and only if) there are no constructors defined for a class, the compiler will automatically create a default constructor.

也就是：

- **只有在你一个构造函数都没写时**
- 编译器才会自动生成默认构造函数

```cpp
struct Y {
    int i;
    float f;
    // Y(int a) { i = a; }
    // Y() {}
};
int main()
{
    Y y1[3] = {};
}
```

这里如果完全不写构造函数，那么编译器会生成默认构造函数，因此这段代码可以通过。

### 初始化列表

> **初始化列表才是真正的初始化。**

**Example** ：

```cpp
class Point {
private:
  const float x, y;
public:
  Point(float xa, float ya)
    : y(ya), x(xa) {}
};
```

这里的重点有两个：

#### 1. 函数体里的赋值不是初始化

```cpp
Point(float xa, float ya) {
    x = xa;
    y = ya;
}
```

这不是“初始化”，而是：

- 先默认初始化
- 再执行赋值

对于 `const` 字段，这甚至根本不合法。

#### 2. 真正的初始化顺序由**字段声明顺序**决定

不是看初始化列表里谁写在前面，而是看类里字段谁先声明。

例如：

```cpp
class Point {
private:
    const float x;
    const float y;
public:
    Point(float xa, float ya)
      : y(ya), x(xa) {}
};
```

虽然列表里写的是 `y` 再 `x`，但真正初始化时仍然是：

1. 先 `x`
2. 再 `y`

因为字段声明顺序就是 `x` 在前、`y` 在后。

### 初始化 vs 赋值

```cpp
Student::Student(string s) : name(s) { }
```

这叫：

- **explicit initialization**
- 真正直接构造 `name`


```cpp
Student::Student(string s) { name = s; }
```

这表示：

- 先默认构造 `name`
- 再把 `s` 赋值给 `name`

后者的问题：

- 多走了一步
- 需要 `name` 先能默认构造
- 对某些成员效率更差甚至不可行

所以：

> **成员对象、`const` 字段、引用字段，优先用初始化列表。**

---

## 字段、局部变量与 `this`

### 字段和局部变量的区别

`TicketMachine::refundBalance()` ：

```cpp
int TicketMachine::refundBalance() {
  int amountToRefund;
  amountToRefund = balance;
  balance = 0;
  return amountToRefund;
}
```

这里：

- `amountToRefund` 是局部变量
- `balance` 是字段（field）

核心区别：

#### 局部变量

- 生命周期只跟随这次函数调用
- 函数结束就销毁

#### 字段

- 生命周期跟随对象本身
- 只要对象还活着，字段就一直存在
- 它保存的是对象状态

所以：

- `amountToRefund` 是“这一趟退款操作里的临时变量”
- `balance` 是“售票机当前还剩多少钱”的长期状态

> Fields preserve the current state of the object.

### `this`：隐藏参数

Point member function 是有一个隐含参数的，这个参数就是 `this` 指针，`this` 指针指向当前对象的地址。通过 `this` 指针，我们可以访问当前对象的成员变量和成员函数。

例如：

```cpp
void Point::print()
```

可以把它“理解成”：

```cpp
void Point::print(Point *this)
```

当然这不是真正手写出来的语法，而是帮助你理解它的本质。

当你写：

```cpp
Point a;
a.print();
```

可以把它理解成：

```cpp
Point::print(&a);
```

所以在成员函数里写：

```cpp
x = ix;
```

本质上就是：

```cpp
this->x = ix;
```

如果局部变量和字段重名，就必须显式写 `this->`，例如：

```cpp
class Point {
private:
    int x, y;
public:
    void init(int x, int y) {
        this->x = x;
        this->y = y;
    }
};
```

否则右边和左边的 `x` / `y` 都只会被解释成参数自己。

---

## `const` 对象与 `const` 成员函数

### 为什么有 `const` 成员函数

```cpp
const Currency the_raise(42, 38);
```

问题是：

- 这个对象怎么保证不被修改？
- 它还能调用哪些成员函数？

这就引出了 **`const` 成员函数**。

例如：

```cpp
void Date::set_day(int d) {
  day = d;
}

int Date::get_day() const {
  return day;
}
```

含义是：

- `set_day()` 会修改对象状态，所以不能是 `const`
- `get_day()` 只是读取，所以应该声明成 `const`

### 常对象能调用什么

如果一个对象是 `const`：

```cpp
const Date birthday(12,25,1994);
```

那么它只能调用 **`const` 成员函数**。

例如：

```cpp
int day = birthday.get_day(); // OK
birthday.set_day(14);         // ERROR
```

原因很简单：

- `get_day() const` 承诺不改对象
- `set_day()` 会改对象

所以对于常对象来说，只有“安全函数”才能被调用。

### `const` 成员函数内部不能做什么


```cpp
int Date::get_day() const {
  day++;       // ERROR
  set_day(12); // ERROR
  return day;
}
```

在 `const` 成员函数里：

- 不能修改字段
- 不能调用非 `const` 成员函数

所以一个很重要的习惯是：

> **凡是不修改对象状态的方法，都尽量声明成 `const`。**

这不仅语义更清晰，也能让常对象正常使用这些方法。

### `const` 字段

```cpp
class A {
  const int i;
};
```

这种字段：

- 不能在构造函数体里赋值
- 必须在初始化列表里初始化

例如：

```cpp
class A {
private:
    const int i;
public:
    A(int x) : i(x) {}
};
```

这是因为 `const` 字段一旦对象建立完成，就不能再改。

---

## `static` 成员

### 静态成员变量

slides 给出：

```cpp
struct X
{
  static void f(); // declaration
  static int n;    // declaration
};

int X::n = 7; // definition
```

静态成员变量的特点：

- 属于整个类，而不是某个具体对象
- 所有对象共享这一份数据
- 在类内只是声明
- 必须在类外再定义一次

例如：

```cpp
class Counter {
public:
    static int total;
};

int Counter::total = 0;
```

无论你创建多少个 `Counter` 对象，它们看到的 `total` 都是同一份。

### 静态成员函数

```cpp
void X::f()
{
  n = 1; // X::n is accessible
}
```

静态成员函数的特点：

- 不属于某个具体对象
- 没有隐含参数 `this`
- 因此不能直接访问普通非静态字段
- 只能访问静态成员

所以：

```cpp
class X {
public:
    static void f();
    static int n;
    int m;
};
```

在 `f()` 里你可以访问 `n`，但不能直接访问 `m`。

### 类内编译期常量

```cpp
class HasArray {
  const int size;
  int array[size]; // ERROR!
};
```

为什么错？

因为这里需要一个**编译期常量**，而普通 `const int size;` 是对象级别的字段，不是编译期已知常量。

正确思路是：

```cpp
class HasArray {
    static const int size = 100;
    int array[size];
};
```

这样 `size` 成为类级别常量，就可以用于数组大小之类需要编译期确定的场景。

### 如何使用静态成员

两种写法：

```cpp
<class name>::<static member>
<object variable>.<static member>
```

也就是说，你既可以写：

```cpp
X::n = 10;
```

也可以写：

```cpp
x.n = 10;
```

但从语义上更推荐第一种，因为静态成员本来就不依赖具体对象。

---

## `inline` 函数

### 函数调用开销

先要知道为什么会有 `inline`：因为**普通函数调用有额外开销**。

大致包括：

- 压参数
- 保存返回地址
- 保存帧指针
- 准备返回值
- 调用结束后恢复现场

例如：

```cpp
int f(int i) {
  return i * 2;
}

int main() {
  int a = 4;
  int b = f(a);
}
```

虽然逻辑很简单，但仍然要走一次完整的函数调用流程。

### `inline` 的作用与代价

如果把函数写成：

```cpp
inline int f(int i) {
  return i * 2;
}
```

编译器可能会选择把它直接展开成：

```cpp
int main() {
  int a = 4;
  int b = a * 2;
}
```

这样就省去了函数调用开销。

但是代价是：

- 代码体积可能变大
- 本质上是 **用空间换时间**

所以不是所有函数都适合 `inline`。

### `inline` vs 宏

```cpp
#define unsafe(i) \
 ((i)>=0?(i):-(i))
```

看起来也像“展开”，但宏的问题是：

- 不做类型检查
- 可能有副作用

例如：

```cpp
ans = unsafe(x++);
```

参数可能被多次求值，非常危险。

而 `inline`：

```cpp
inline int safe(int i)
{ return i>=0 ? i:-i; }
```

优点是：

- 有类型检查
- 参数只按函数规则求值
- 比宏安全得多

所以现代 C++ 一般应优先使用 `inline` 函数，而不是函数式宏。

### 编译器不一定真的内联


> `inline` is only a request.

也就是说：

- 你只是建议编译器展开
- 编译器可以拒绝

比如：

- 函数太大
- 递归函数
- 编译器觉得展开不划算

那它就未必真的内联。

### 类内定义函数为什么默认 inline

> 任何在类定义里直接写出函数体的方法，都会被视为 `inline`。

例如：

```cpp
class Cup {
  rgb color;
public:
  rgb getColor() { return color; }
  void setColor(rgb color) { this->color = color; }
};
```

这两个函数都隐含 `inline`。

这也解释了为什么：

- 某些很短的小函数喜欢直接写在头文件中
- 不会因为多个 `.cpp` 都包含头文件就直接产生多重定义问题

现代 C++ 里，`inline` 对函数的更重要含义往往已经不是强制内联，而是：

> **允许多个翻译单元看到同一个函数定义。**

> Nowadays, the keyword `inline` comes to mean “multiple definitions are permitted” rather than “inlining is preferred”.

---
