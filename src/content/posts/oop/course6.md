---
title: Composition, Inheritance, and Class-Level Features
published: 2026-04-10
description: Composition vs Inheritance, const objects, static members, inline functions
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

- **对象内部最基本的构造与访问机制**
  - 字段应该如何初始化
  - 成员函数如何访问字段
  - `this` 到底是什么
- **类的约束与类级别成员**
  - `const object` 能调用什么函数
  - `const member function` 修饰的其实是谁
  - `static` 成员为什么不属于某个对象
- **工程实践层面的关键词**：`inline`
  - 最初是为了减少函数调用开销
  - 现代 C++ 里更重要的意义是“允许多重定义”，所以适合写在头文件里
- **代码复用（reuse）**的两种核心方式
  - **composition**：`has-a`
  - **inheritance**：`is-a`

---

## 目录

- [概述](#概述)
- [目录](#目录)
- [初始化列表 initializer list](#初始化列表-initializer-list)
  - [初始化 vs 赋值](#初始化-vs-赋值)
  - [初始化顺序由字段声明顺序决定](#初始化顺序由字段声明顺序决定)
- [Local variable vs Field：局部变量与字段](#local-variable-vs-field局部变量与字段)
  - [生命周期差别](#生命周期差别)
  - [`this`：成员函数里的隐藏参数](#this成员函数里的隐藏参数)
- [const objects 与 const member functions](#const-objects-与-const-member-functions)
  - [const 成员函数修饰的本质](#const-成员函数修饰的本质)
  - [const 重载](#const-重载)
  - [const 字段](#const-字段)
- [static 成员](#static-成员)
  - [static 数据成员](#static-数据成员)
  - [static 成员函数](#static-成员函数)
  - [类内编译期常量](#类内编译期常量)
- [inline：从性能提示到头文件语义](#inline从性能提示到头文件语义)
  - [inline 最初想解决什么问题](#inline-最初想解决什么问题)
  - [inline vs 宏](#inline-vs-宏)
  - [现代 C++ 中 inline 更重要的意义](#现代-c-中-inline-更重要的意义)
- [Composition：组合复用](#composition组合复用)
  - [组合的语义：has-a](#组合的语义has-a)
  - [两种组合方式：direct owns vs by reference shares](#两种组合方式direct-owns-vs-by-reference-shares)
    - [1. 直接拥有](#1-直接拥有)
    - [2. 间接引用 / 共享](#2-间接引用--共享)
  - [组合对象如何初始化](#组合对象如何初始化)
  - [组合后的函数实现：把工作转派出去](#组合后的函数实现把工作转派出去)
- [Inheritance：继承复用](#inheritance继承复用)
  - [继承的语义：is-a](#继承的语义is-a)
  - [基类 / 派生类术语](#基类--派生类术语)
  - [继承中的构造与析构顺序](#继承中的构造与析构顺序)
  - [继承后的成员访问与复用](#继承后的成员访问与复用)
  - [name hiding：同名函数隐藏](#name-hiding同名函数隐藏)
  - [访问控制与继承方式](#访问控制与继承方式)
  - [替换原则与 upcasting](#替换原则与-upcasting)
- [组合 vs 继承](#组合-vs-继承)
  - [适合组合时](#适合组合时)
  - [适合继承时](#适合继承时)
  - [再进一步：实现复用时优先警惕误用继承](#再进一步实现复用时优先警惕误用继承)

---

## 初始化列表 initializer list

> **对象的正规初始化位置是在构造函数的初始化列表，而不是构造函数花括号内部。**

### 初始化 vs 赋值

```cpp
#include<iostream>
using namespace std;

struct Y {
    int i;
    Y(int ii) : i(ii) {
        cout << "Y:Y(int)\n" << endl;
    }
    Y() {
        cout << "Y:Y()\n" << endl;
    }
    Y& operator=(int ii) {
        i = ii;
        cout << "Y:operator=(int)\n" << endl;
        return *this;
    }
};

struct X {
    Y y;
    X() /* : y(10) */ {
        y = 10;
        cout << "X:X()\n";
    }
};

int main() {
    X x;
}
```


```cpp
X() { y = 10; }
```

看起来像初始化 `y`，其实做的不是初始化，而是：

1. 先想办法把 `y` **构造出来**。
2. 然后再执行 `y = 10;` 这个**赋值操作**。

如果 `Y` 没有默认构造函数，连第 1 步都做不了，所以会直接报错。

如果 `Y` 有默认构造函数，那么事情会变成：

1. 先调用 `Y()` 默认构造 `y`
2. 再构造一个临时对象 `Y(10)` 或等价赋值来源
3. 再调用 `operator=` 把值赋给 `y`

所以：

- **初始化列表里的 `y(10)` 才是初始化**
- **函数体里的 `y = 10` 已经是赋值**

这个差别对内置类型（如 `int`）看起来不明显，对自定义类型就非常明显。

**自定义类型一定优先放到初始化列表里**

```cpp
struct X {
    Y y;
    X() : y(10) {
        cout << "X:X()\n";
    }
};
```

此时含义很直接：

- `X` 被创建时，字段 `y` 直接按 `Y(10)` 构造

这不仅效率更好，更重要的是语义正确。

:::TIP
看到字段是自定义类型 / `const` 字段 / 引用字段 / 基类部分，默认反应都应该是：

**放初始化列表。**
:::

### 初始化顺序由字段声明顺序决定

这也是这节课一个很容易考、也很容易写错的点。

```cpp
class Point {
private:
    const float x, y;
public:
    Point(float xa, float ya) : y(ya), x(xa) {}
};
```

虽然初始化列表写的是 `y(ya), x(xa)`，但真正的初始化顺序仍然是：

1. 先初始化 `x`
2. 再初始化 `y`

因为顺序由**字段声明顺序**决定：

```cpp
const float x, y;
```

不是由初始化列表里谁写前面决定。

- **真正顺序由上面的成员声明决定**

---

## Local variable vs Field：局部变量与字段

```cpp
int TicketMachine::refundBalance() {
    int amountToRefund;
    amountToRefund = balance;
    balance = 0;
    return amountToRefund;
}
```

### 生命周期差别

这里有两个变量：

- `amountToRefund`：局部变量（local variable）
- `balance`：字段 / 数据成员（field / data member）

它们最关键的区别是**生命周期**。

`amountToRefund`：

- 只跟这次函数调用绑定
- 函数开始时创建
- 函数结束时销毁

`balance`：

- 跟对象绑定
- 只要对象还活着，这个字段就还在
- 它代表对象当前的内部状态

所以 `refundBalance()` 调完之后：

- `amountToRefund` 没了
- `balance` 还在，只是它的值变成了 `0`

这正是**对象保存状态**的意思。

### `this`：成员函数里的隐藏参数

```cpp
#include<iostream>
using namespace std;

struct X {
    int y;
    void print() {}
};

int main() {
    X x;
    x.print();
}
```

从语法表面看，调用是：

```cpp
x.print();
```

但从机制上理解，可以把它近似看成：

```cpp
X::print(&x);
```

也就是说，成员函数其实都有一个隐藏参数：

```cpp
void X::print(X* this)
```

于是：

- `this` 指向“当前调用该成员函数的对象”
- 成员函数访问字段，本质上是通过 `this` 去访问

例如：

```cpp
balance
```

本质上可以理解为：

```cpp
this->balance
```

所以
- 字段是跟对象走的
- 成员函数调用时，当前对象地址会通过隐藏参数 `this` 传进去
- 函数体内部再通过 `this` 找到这个对象的字段

这就是成员函数能天然访问字段的根本原因。

---

## const objects 与 const member functions

> 如果一个对象是 `const`，那它还能调用哪些成员函数？

### const 成员函数修饰的本质

```cpp
#include <iostream>
using namespace std;

class X {
private:
    int data;
public:
    X(int d) : data(d) {}

    void foo() {
        data = data * data;
        cout << "This is non-const foo()" << endl;
    }

    void foo() const {
        cout << data << endl;
        cout << "This is const foo()" << endl;
    }

    void bar() const {
        cout << data << endl;
        cout << "This is bar()" << endl;
    }
};
```

这背后真正的本质仍然跟 `this` 有关。

一个普通成员函数可以近似理解为：

```cpp
void foo(X* this)
```

一个 `const` 成员函数可以近似理解为：

```cpp
void foo(const X* this)
```

所以加在函数后面的这个 `const`，本质上是在说：

- 这个函数里的 `this` 是“指向 const 对象的指针”
- 通过这个 `this`，不能修改对象状态

因此在 `const` 成员函数中：

- 读字段可以
- 改字段不行
- 调用非 `const` 成员函数也不行

例如：

```cpp
int Date::get_day() const {
    // day++;       // 错
    // set_day(12); // 错
    return day;
}
```

### const 重载

```cpp
void foo();
void foo() const;
```

这两个函数可以共存。

原因是从编译器视角看，它们对应的隐藏参数类型不同：

- 一个是 `X* this`
- 一个是 `const X* this`

所以可以构成重载。

调用规则是：

```cpp
X a(10);
a.foo();
```

优先调用非 `const` 版本。

```cpp
const X b(10);
b.foo();
```

只能调用 `const` 版本。

> **所有“只读函数”都应该习惯性地写成 `const member function`。**
- 语义更准确
- 常量对象也能调用
- 编译器还能帮你检查“不小心改了对象状态”的错误

### const 字段

```cpp
class A {
    const int i;
};
```

这类字段的含义是：

- 对象一旦构造完成，这个字段值就不能再改
- 所以它必须在初始化阶段就确定下来

因此 `const` 字段必须放在构造函数初始化列表里初始化：

```cpp
class A {
private:
    const int i;
public:
    A(int x) : i(x) {}
};
```

不能在函数体里写：

```cpp
A(int x) {
    i = x; // 错
}
```

因为这已经是赋值，而不是初始化了。

---

## static 成员

> `static` 成员属于类，不属于某个对象。

### static 数据成员

先看标准形式：

```cpp
struct X {
    static int n;   // 声明
};

int X::n = 7;      // 定义
```

这有两个层次：

1. **类内声明**：告诉编译器“`X` 这个类有一个静态成员 `n`”
2. **类外定义**：真正给它分配存储空间

因为静态成员变量：

- 不是每个对象一份
- 而是整个类共享一份
- 更像“带类作用域的全局变量”

所以它不能跟着构造函数初始化列表走。

例如：

```cpp
struct X {
    static int data;
    void setData(int i) { data = i; }
    void print() const { cout << data << endl; }
};

int X::data = 0;
```

如果创建：

```cpp
X x1;
X x2;
```

那么：

- `x1` 和 `x2` 看到的是同一个 `data`
- 改 `x1.data`，`x2.data` 看到的也会变

这正是“共享”的含义。

### static 成员函数

```cpp
struct X {
    static int n;
    static void f();
};
```

静态成员函数的关键特点是：

- 没有隐含的 `this`
- 因为它不是“对某个对象发消息”
- 而是“对类本身调用”

所以它：

- 可以访问静态成员
- 不能直接访问普通字段

例如：

```cpp
struct X {
    static int n;
    int mdata;

    static void f() {
        n = 1;     // 可以
        // mdata = 2; // 不可以
    }
};
```

原因很直观：

- `n` 属于类，本来就不需要对象
- `mdata` 属于对象，没有 `this` 就不知道该访问哪个对象的 `mdata`

### 类内编译期常量

```cpp
class HasArray {
    static const int size = 100;
    int array[size];
};
```

为什么这里要加 `static`？

因为如果 `size` 是普通成员：

```cpp
const int size;
```

那它是**每个对象一份**的字段，不能作为这里这种类定义阶段的数组长度。

把它写成：

```cpp
static const int size = 100;
```

意思就变成：

- 这是整个类共享的一份常量
- 可以在类定义阶段直接使用

---

## inline：从性能提示到头文件语义

`inline` 的**历史动机**和它在**现代 C++ 工程里的主要作用**，已经不完全一样了。

### inline 最初想解决什么问题

普通函数调用有额外开销：

- 传参数
- 保存返回地址
- 建立栈帧
- 返回后再恢复

所以如果函数特别小，例如：

```cpp
int f(int a, int n) {
    return std::pow(a, n);
}
```

从早期编译器的角度，会希望把调用处直接展开成函数体，避免那一层函数调用开销。

也就是类似：

```cpp
b = f(a, n);
```

被近似替换成：

```cpp
b = std::pow(a, n);
```

这就是 `inline` 最初“内联展开”的含义。

### inline vs 宏

宏本质上是**文本替换**，例如：

```cpp
#define ABS(x) ((x) > 0 ? (x) : -(x))
```

如果调用：

```cpp
ABS(i++)
```

那么 `i++` 可能被替换多次，产生副作用。

而 `inline function` 仍然是函数：

```cpp
inline int abs_safe(int x) {
    return x > 0 ? x : -x;
}
```

这里参数求值规则仍然按正常函数走，不会出现宏那种“把表达式原样塞进去造成多次求值”的问题。

- `inline` 和宏都可能减少调用层
- 但 `inline` 仍然保留了函数的类型检查与正常语义
- 因此比宏安全得多

### 现代 C++ 中 inline 更重要的意义

现在编译器是否真的做**内联展开**，往往由编译器自己决定。

也就是说：

- 你写了 `inline`
- 不等于它一定会在机器码层面展开

现代 C++ 里，`inline` 更重要的一个语义是：

> **允许这个函数在多个编译单元中重复定义，只要定义一致。**

这正是为什么：

- 类里面直接定义的成员函数
- 放在头文件里的小函数

通常不会导致 multiple definition / duplicate symbol 错误。

例如：

```cpp
class Cup {
    rgb color;
public:
    rgb getColor() { return color; }
    void setColor(rgb color) { this->color = color; }
};
```

这些写在类体内的成员函数，默认就具有 `inline` 属性。

1. **历史上**：`inline` 是为了减少函数调用开销
2. **今天更实用的理解**：`inline` 让函数适合安全地写在头文件里

---

## Composition：组合复用

这一部分开始进入设计层面了。

### 组合的语义：has-a

组合（composition）是：

> 用已有对象作为字段，拼出一个新对象。

它表达的是：

> **has-a**

即“有一个”。

例如：

- `car has an engine`
- `car has tyres`
- `SavingsAccount has a Person`
- `SavingsAccount has a Currency`

如果一句话念出来是通顺的 “A has a B”，那通常就该考虑组合。

*Effective C++ Item 38* 的观点

- 在应用领域里，composition 常表示 **has-a**
- 在实现领域里，composition 也可以表示 **is-implemented-in-terms-of**

这也是为什么很多时候**内部复用某个类的实现**更适合组合，而不是公有继承。

### 两种组合方式：direct owns vs by reference shares

1. **Direct, owns**
2. **By reference, shares**

#### 1. 直接拥有

字段直接就是对象本身：

```cpp
class X {
private:
    Y y1, y2;
};
```

含义：

- `X` 直接拥有这些 `Y` 对象
- `X` 的生命周期结束，这些 `Y` 也结束
- 绑定关系紧密

#### 2. 间接引用 / 共享

字段存的是指针或引用：

```cpp
class X {
private:
    Y* p1;
    Y* p2;
    Y& r1;
    Y& r2;
};
```

含义：

- `X` 不一定拥有这些 `Y`
- 更像“引用 / 借用 / 指向 / 共享”
- 生命周期管理可能不归 `X` 全权负责

`Employee` ：

- `Name`、`Address`、`Health Plan`、`Salary History` 这些和员工绑定很紧，适合直接拥有
- `Supervisor` 虽然也和员工相关，但它其实是另一个 `Employee`，更适合用间接引用

### 组合对象如何初始化

```cpp
class Person { /* ... */ };
class Currency { /* ... */ };

class SavingsAccount {
public:
    SavingsAccount(const string& name,
                   const string& address,
                   int cents);
    void print();
private:
    Person m_saver;
    Currency m_balance;
};
```

构造函数应该写成：

```cpp
SavingsAccount::SavingsAccount(const string& name,
                               const string& address,
                               int cents)
    : m_saver(name, address),
      m_balance(0, cents)
{}
```

这和前面**初始化列表**那一节刚好闭环：

- 组合对象本质上也是字段
- 所以它们也应该在初始化列表里完成构造

不建议写成：

```cpp
SavingsAccount::SavingsAccount(const string& name,
                               const string& address,
                               int cents) {
    m_saver.set_name(name);
    m_saver.set_address(address);
    m_balance.set_cents(cents);
}
```

因为这样会先默认构造 `m_saver` / `m_balance`，再慢慢改值，语义和效率都更差。

### 组合后的函数实现：把工作转派出去

> 组合以后，不要自己越过抽象边界去“扒”被组合对象的内部数据；应该把任务转派给它自己公开的方法。

例如 `SavingsAccount::print()`，更自然的写法是：

```cpp
void SavingsAccount::print() {
    m_saver.print();
    m_balance.print();
}
```

而不是：

- 伸手去读 `m_saver` 里面的每个字段
- 自己拼一遍打印逻辑

因为那会破坏封装。

组合的正确使用方式，不只是“把对象塞进去”，还包括：

- 保持抽象边界
- 通过对方暴露出来的接口工作
- 把职责分派给真正负责该信息的对象

---

## Inheritance：继承复用

### 继承的语义：is-a

继承（inheritance）描述的是另一种关系：

> **is-a**

即“是一个”。

例如：

- `Student is a Person`
- `Professor is a Person`
- `Manager is an Employee`

如果这句话说得通，那么继承才有语义基础。

- **composition**：`has-a`
- **inheritance**：`is-a`

### 基类 / 派生类术语

- **Base class / Super / Parent**：基类、父类
- **Derived class / Sub / Child**：派生类、子类

例如：

```cpp
class Employee {
public:
    Employee(const string& name, const string& ssn);
    const string& get_name() const;
    void print(ostream& out) const;
    void print(ostream& out, const string& msg) const;
protected:
    string m_name;
    string m_ssn;
};
```

然后：

```cpp
class Manager : public Employee {
public:
    Manager(const string& name,
            const string& ssn,
            const string& title);
    const string title_name() const;
    const string& get_title() const;
    void print(ostream& out) const;
private:
    string m_title;
};
```

这里：

- `Employee` 是基类
- `Manager` 是派生类

### 继承中的构造与析构顺序

构造函数写法：

```cpp
Manager::Manager(const string& name,
                 const string& ssn,
                 const string& title)
    : Employee(name, ssn), m_title(title)
{}
```

- 基类部分就像“嵌在派生类对象内部的一块子对象”
- 所以构造派生类时，必须先把基类部分构造好

顺序规律：

1. **先构造基类**
2. 再构造派生类自己的成员
3. 最后进入派生类构造函数体

析构顺序完全反过来：

1. 先析构派生类自己的部分
2. 再析构基类部分

所以一个非常稳定的记忆法是：

> **构造从上到下，析构从下到上。**

### 继承后的成员访问与复用

派生类可以直接复用基类已经有的成员函数与字段（前提是访问权限允许）。

例如：

```cpp
void Manager::print(ostream& out) const {
    Employee::print(out);
    out << m_title << endl;
}
```

这段代码特别典型：

- 先调用基类版本 `Employee::print(out)`
- 再补充自己新增的 `m_title`

这正是继承复用的常见写法。

再如：

```cpp
const string Manager::title_name() const {
    return string(m_title + ": " + m_name);
}
```

这里 `m_name` 是基类 `Employee` 中的 `protected` 成员，所以派生类可以直接访问。

### name hiding：同名函数隐藏

如果派生类重新定义了一个同名成员函数，那么基类中其他同名重载版本可能会被隐藏。

例如：

```cpp
class Employee {
public:
    void print(ostream& out) const;
    void print(ostream& out, const string& msg) const;
};

class Manager : public Employee {
public:
    void print(ostream& out) const;
};
```

那么：

```cpp
bill.print(cout, "Employee:");
```

可能会报错。

不是因为基类没有这个版本，而是因为派生类里出现了同名 `print`，导致基类重载集合被隐藏了。

这里你要记住的是：

- **派生类同名函数会触发 name hiding**
- 这不是“只隐藏同签名版本”，而是可能把同名重载整组挡住

### 访问控制与继承方式

访问控制本身：

- `private`：类内可访问，类外不可访问，派生类也不能直接访问
- `protected`：类内可访问，派生类可访问，类外不可访问
- `public`：都可访问

而继承关键字又会进一步影响“继承后这些可见成员在派生类中变成什么权限”。

三种继承方式：

```cpp
class Derived1 : public Base {}
class Derived2 : protected Base {}
class Derived3 : private Base {}
```

最常用的是：

```cpp
class Manager : public Employee {}
```

因为 public inheritance 语义最符合“`Manager is-an Employee`”。

### 替换原则与 upcasting

> Public inheritance should imply substitution.

也就是如果 `B public` 继承自 `A`，那就应该满足：

- `B` 可以在任何需要 `A` 的地方使用
- 关于 `A` 成立的性质，对 `B` 也应该合理成立

这就是常说的 **Liskov Substitution Principle（替换原则）**。

**upcasting**：

> 把派生类对象当成基类对象来看待。

典型发生在：

- 基类引用
- 基类指针

例如：

```cpp
Employee& e = bill;
Employee* p = &bill;
```

这里的 `bill` 本来是 `Manager`，但因为 `Manager is-an Employee`，所以可以上转型为 `Employee` 来使用。

这个操作只对**公有继承**的 “is-a” 关系才真正自然成立。

---

## 组合 vs 继承

### 适合组合时

如果：

> `A has a B`

说得通，优先考虑 **composition**。

例如：

- `SavingsAccount has a Person`
- `Car has an engine`
- `Employee has a supervisor`（通常通过引用/指针）

### 适合继承时

如果：

> `A is a B`

说得通，才考虑 **inheritance**。

例如：

- `Manager is an Employee`
- `Student is a Person`

### 再进一步：实现复用时优先警惕误用继承

*Effective C++ Item 38*:

有时候两个类之间看起来“底层实现像”，但语义上并不是 `is-a`。

经典例子：

- `Set` 可以用 `list` 来实现
- 但 `Set` 不是 `list`

因为：

- `list` 可以有重复元素
- `Set` 不允许重复元素

所以这里正确关系是：

- `Set has-a list` / `Set is-implemented-in-terms-of list`
- 不是 `Set is-a list`

这也是为什么：

> **实现复用默认优先考虑组合，只有语义上真的满足 is-a 再用公有继承。**
