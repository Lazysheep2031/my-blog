---
title: Operator Overloading
published: 2026-05-07
description: operator overloading、member/global operator、friend、++/--、relational operators、operator[]、functor、lambda、type conversion、explicit
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Operator overloading（运算符重载）** 允许用户自定义类型使用类似内置类型的语法。

本质上，重载运算符仍然是一次 **function call**：

```cpp
x + y;
```

可以被理解成：

```cpp
x.operator+(y);     // member function 形式
operator+(x, y);    // global/free function 形式
```

核心内容：

- 哪些运算符可以重载，哪些不能重载；
- 运算符重载的基本限制；
- member function 和 global function 两种实现方式；
- `++` / `--` 前缀、后缀形式的区别；
- 关系运算符、下标运算符 `[]`、函数调用运算符 `()` 的常见写法；
- functor、lambda、`std::function` 的关系；
- 用户自定义类型转换、`explicit` 和 conversion operator；
- 什么时候应该使用运算符重载。


## 目录

- [概述](#概述)
- [目录](#目录)
- [Operator overloading 的基本思想](#operator-overloading-的基本思想)
  - [为什么需要运算符重载](#为什么需要运算符重载)
  - [运算符重载的本质](#运算符重载的本质)
- [哪些运算符可以重载](#哪些运算符可以重载)
  - [可以重载的运算符](#可以重载的运算符)
  - [不能重载的运算符](#不能重载的运算符)
  - [限制条件](#限制条件)
- [基本语法](#基本语法)
- [Member function 形式](#member-function-形式)
  - [Integer 的加法](#integer-的加法)
  - [隐式 this 参数](#隐式-this-参数)
  - [member operator 的隐式转换限制](#member-operator-的隐式转换限制)
  - [一元运算符](#一元运算符)
- [Global function 形式](#global-function-形式)
  - [普通 free function](#普通-free-function)
  - [friend operator](#friend-operator)
  - [global operator 的隐式转换](#global-operator-的隐式转换)
- [参数传递与返回值](#参数传递与返回值)
  - [参数传递](#参数传递)
  - [返回值模式](#返回值模式)
- [`++` 和 `--`](#-和---)
  - [如何区分前缀和后缀](#如何区分前缀和后缀)
  - [标准实现模式](#标准实现模式)
- [关系运算符](#关系运算符)
  - [`==` 和 `!=`](#-和-)
  - [`<` 与其他比较运算符](#-与其他比较运算符)
- [`operator[]`](#operator)
- [`operator()` 与 functor](#operator-与-functor)
  - [最小例子](#最小例子)
  - [Example : 抽取 transform 模式](#example--抽取-transform-模式)
  - [lambda 捕获与 std::function](#lambda-捕获与-stdfunction)
  - [用 functor 改写 lambda](#用-functor-改写-lambda)
- [用户自定义类型转换](#用户自定义类型转换)
  - [单参数构造函数](#单参数构造函数)
  - [`explicit` 禁止隐式转换](#explicit-禁止隐式转换)
  - [Conversion operator](#conversion-operator)
  - [两种转换方式并存的问题](#两种转换方式并存的问题)
- [使用建议](#使用建议)

---

## Operator overloading 的基本思想

### 为什么需要运算符重载

内置类型已经支持各种运算：

```cpp
int a = 1;
int b = 2;
int c = a + b;
```

如果我们定义自己的类型，例如 `Integer`、`Complex`、`String`、`Vector`，也希望它们能使用类似的语法：

```cpp
Integer x(1), y(2);
Integer z = x + y;
```

这时就需要 operator overloading。

它的目的：

- 让用户自定义类型更像内置类型；
- 让代码更接近问题本身的表达；
- 让类和标准库算法、容器、流接口更自然地配合。

### 运算符重载的本质

运算符重载不是一种特殊魔法。它本质上仍然是函数调用，只是函数名比较特殊。

例如：

```cpp
x + y;
```

如果 `operator+` 是 member function，则等价于：

```cpp
x.operator+(y);
```

如果 `operator+` 是 global function，则等价于：

```cpp
operator+(x, y);
```

> operator overloading = function call with operator syntax

---

## 哪些运算符可以重载

### 可以重载的运算符

常见可重载运算符包括：

```text
+  -  *  /  %  ^  &  |  ~
=  <  >  += -= *= /= %= ^= &= |=
<< >> >>= <<= == != <= >=
!  && || ++ --
,  ->* -> () []
new new[] delete delete[]
```

重点关注：

- 算术运算符：`+`、`-`；
- 关系运算符：`==`、`!=`、`<`、`>`、`<=`、`>=`；
- 自增自减：`++`、`--`；
- 下标运算符：`[]`；
- 函数调用运算符：`()；`
- 类型转换运算符：`operator T()`；
- 后面 Stream 部分会重点用到 `<<` 和 `>>`。

### 不能重载的运算符

以下运算符不能重载：

```text
.   .*   ::   ?:
sizeof   typeid
static_cast   dynamic_cast
const_cast    reinterpret_cast
```

这些运算符涉及对象访问、作用域、类型信息、强制类型转换等基础语义。C++ 不允许用户改变它们的含义。

### 限制条件

运算符重载有三个重要限制。

第一，只能重载已有运算符，不能创造新运算符。

```cpp
// 不允许把 ** 创造成乘方运算符
x ** y;   // Error
```

第二，不能改变操作数个数。

```cpp
// 原来的 + 是二元运算符，不能把它重载成三元运算符
```

第三，不能改变运算符优先级。

```cpp
x + y * z;
```

无论是否重载，`*` 仍然比 `+` 优先级高。

:::WARNING
重载只能扩展已有语法的含义，不能重写 C++ 语法规则本身。
:::

---

## 基本语法

运算符函数名由 `operator` 关键字和运算符组成：

```cpp
operator+(...)
operator-(...)
operator[](int index)
operator()(int x)
operator double()
```

一个普通函数：

```cpp
int add(int a, int b) {
    return a + b;
}
```

对应到运算符重载，可以写成：

```cpp
Integer operator+(const Integer& lhs, const Integer& rhs) {
    return Integer(lhs.value() + rhs.value());
}
```

---

## Member function 形式

### Integer 的加法

```cpp
class Integer {
public:
    Integer(int n = 0) : i(n) {}

    Integer operator+(const Integer& that) const {
        return Integer(i + that.i);
    }

private:
    int i;
};
```

使用：

```cpp
Integer x(1), y(5), z;

z = x + y;
```

等价于：

```cpp
z = x.operator+(y);
```

### 隐式 this 参数

member function 有一个隐藏参数：`this`。

```cpp
x.operator+(y);
```

可以理解成：

```cpp
Integer::operator+(&x, y);
```

其中：

- `x` 是 receiver，也就是隐藏的 `this` 对象；
- `y` 是显式传入的参数；
- `i + that.i` 实际上是 `this->i + that.i`。

member operator 的优点是：

- 可以直接访问当前对象的 private fields；
- 也可以访问同类型参数对象的 private fields；
- 代码通常比较紧凑。

### member operator 的隐式转换限制

继续看这个类：

```cpp
class Integer {
public:
    Integer(int n = 0) : i(n) {}

    Integer operator+(const Integer& that) const {
        return Integer(i + that.i);
    }

private:
    int i;
};
```

下面两句可以通过：

```cpp
Integer x(1), y(5), z;

z = x + y;  // x.operator+(y)
z = x + 3;  // x.operator+(Integer(3))
```

`x + 3` 可以通过，因为 `3` 可以通过 `Integer(int)` 隐式转换成 `Integer(3)`。

但是：

```cpp
z = 3 + y;  // Error
```

原因是 member operator 要求左操作数必须已经是 receiver：

```cpp
3.operator+(y);  // int 没有 Integer::operator+
```

隐式转换不会先把左边的 `3` 转成 `Integer(3)`，再去调用 member function。

:::TIP
member operator 的 receiver 不参与这种用户自定义隐式转换。因此如果希望 `3 + y` 也能工作，通常要把 `operator+` 写成 global/free function。
:::

### 一元运算符

对于二元运算符，member function 需要一个显式参数：

```cpp
Integer operator+(const Integer& that) const;
```

对于一元运算符，member function 不需要显式参数，因为唯一的操作数就是 `this`。

```cpp
class Integer {
public:
    Integer(int n = 0) : i(n) {}

    Integer operator-() const {
        return Integer(-i);
    }

private:
    int i;
};
```

使用：

```cpp
Integer x(5), z;
z = -x;
```

等价于：

```cpp
z.operator=(x.operator-());
```

---

## Global function 形式

### 普通 free function

`operator+` 也可以写成类外的 free function：

```cpp
Integer operator+(const Integer& lhs, const Integer& rhs);
```

使用：

```cpp
Integer x, y;
Integer z = x + y;
```

等价于：

```cpp
Integer z = operator+(x, y);
```

这时两个参数都是显式参数，没有隐藏的 `this`。

### friend operator

global function 不能直接访问类的 private fields。

如果需要访问 private fields，可以把它声明成 `friend`：

```cpp
class Integer {
public:
    Integer(int n = 0) : i(n) {}

    friend Integer operator+(const Integer& lhs,
                             const Integer& rhs);

private:
    int i;
};

Integer operator+(const Integer& lhs, const Integer& rhs) {
    return Integer(lhs.i + rhs.i);
}
```

`friend` 的含义是：这个函数不是类的 member function，但类主动授权它访问 private / protected 成员。

如果不想使用 `friend`，就需要提供 public accessor：

```cpp
class Integer {
public:
    Integer(int n = 0) : i(n) {}

    int value() const {
        return i;
    }

private:
    int i;
};

Integer operator+(const Integer& lhs, const Integer& rhs) {
    return Integer(lhs.value() + rhs.value());
}
```

### global operator 的隐式转换

global operator 的两个参数都是显式参数，所以两边都可以做隐式转换。

```cpp
Integer x(1), y(5), z;

z = x + y;  // operator+(x, y)
z = x + 3;  // operator+(x, Integer(3))
z = 3 + y;  // operator+(Integer(3), y)
```

这就是 global/free operator 相比 member operator 更灵活的地方。

但它的代价是：

- 不能天然访问 private fields；
- 可能需要 `friend`；
- 或者需要通过 public interface 间接访问对象状态。

---

## 参数传递与返回值

### 参数传递

大多数运算符不会修改传入对象，而是根据操作数产生一个新结果。

所以参数通常写成 const reference：

```cpp
Integer operator+(const Integer& lhs, const Integer& rhs);
```

原因：

- `const` 表示只读，不修改参数；
- reference 避免不必要的拷贝；
- built-in types 例如 `int`、`double` 很小，直接按值传递即可。

如果 operator 是 member function，而且不修改当前对象，也应该加 `const`：

```cpp
Integer operator+(const Integer& that) const;
bool operator==(const Integer& rhs) const;
```

### 返回值模式

返回类型取决于运算符语义。

算术运算一般返回新对象：

```cpp
T operator+(const T& lhs, const T& rhs);
T operator-(const T& lhs, const T& rhs);
```

关系运算一般返回 `bool`：

```cpp
bool operator==(const T& lhs, const T& rhs);
bool operator<(const T& lhs, const T& rhs);
```

下标运算一般返回元素引用：

```cpp
E& T::operator[](int index);
const E& T::operator[](int index) const;
```

返回 reference 的原因是允许写成：

```cpp
v[10] = 45;
```

---

## `++` 和 `--`

### 如何区分前缀和后缀

`++i` 和 `i++` 的操作数数量相同。为了让函数签名不同，C++ 规定：

- 前缀形式不带参数；
- 后缀形式带一个无实际用途的 `int` 参数；
- 编译器会给这个 `int` 参数传入 `0`。

```cpp
class Integer {
public:
    Integer& operator++();     // prefix ++
    Integer operator++(int);   // postfix ++

    Integer& operator--();     // prefix --
    Integer operator--(int);   // postfix --
};
```

调用关系：

```cpp
Integer x(5);

++x;  // x.operator++()
x++;  // x.operator++(0)
--x;  // x.operator--()
x--;  // x.operator--(0)
```

### 标准实现模式

前缀 `++x`：先修改对象，再返回修改后的对象引用。

```cpp
Integer& Integer::operator++() {
    this->i += 1;
    return *this;
}
```

后缀 `x++`：需要返回旧值，所以先保存副本，再自增，最后返回旧副本。

```cpp
Integer Integer::operator++(int) {
    Integer old(*this);
    ++(*this);
    return old;
}
```

这里的 `int` 参数没有使用，可以不写参数名。

:::TIP
常见写法是先实现前缀版本，再用前缀版本实现后缀版本。这样真正修改对象的逻辑只保留一份。
:::

---

## 关系运算符

### `==` 和 `!=`

可以先实现 `==`，再用 `==` 实现 `!=`。

```cpp
class Integer {
public:
    bool operator==(const Integer& rhs) const {
        return i == rhs.i;
    }

    bool operator!=(const Integer& rhs) const {
        return !(*this == rhs);
    }

private:
    int i;
};
```

好处是：对象相等的判断细节只写在 `operator==` 中。以后如果 `Integer` 的内部表示变了，只需要修改 `operator==`。

### `<` 与其他比较运算符

类似地，可以先实现 `<`，再用 `<` 推出 `>`、`<=`、`>=`。

```cpp
class Integer {
public:
    bool operator<(const Integer& rhs) const {
        return i < rhs.i;
    }

    bool operator>(const Integer& rhs) const {
        return rhs < *this;
    }

    bool operator<=(const Integer& rhs) const {
        return !(rhs < *this);
    }

    bool operator>=(const Integer& rhs) const {
        return !(*this < rhs);
    }

private:
    int i;
};
```

这种写法的思想：

```text
把类型相关的细节集中在最少的函数里。
其他函数只表达逻辑关系。
```

---

## `operator[]`

下标运算符常用于让一个对象表现得像数组或容器。

```cpp
Vector v(100);
v[10] = 45;
```

`operator[]` 的特点：

- 必须是 member function；
- 接收一个下标参数；
- 通常返回元素引用；
- 通常需要提供 const 和 non-const 两个版本。

一个简单例子：

```cpp
class IntVector {
public:
    explicit IntVector(int n)
        : n(n), data(new int[n]{}) {}

    ~IntVector() {
        delete[] data;
    }

    int& operator[](int index) {
        return data[index];
    }

    const int& operator[](int index) const {
        return data[index];
    }

private:
    int n;
    int* data;
};
```

使用：

```cpp
IntVector v(100);
v[10] = 45;

const IntVector cv(100);
int x = cv[10];
```

为什么要返回引用：

```cpp
v[10] = 45;
```

左边的 `v[10]` 必须代表容器内部那个真实元素。如果返回值不是引用，就只能改一个临时副本。

:::WARNING
这个例子为了说明 `operator[]`，省略了 copy constructor / copy assignment 等资源管理问题。真实工程中更应该使用 `std::vector<int>` 管理动态数组。
:::

---

## `operator()` 与 functor

### 最小例子

`operator()` 叫 function call operator。

重载了 `operator()` 的对象叫 **functor（函数对象 / 仿函数）**。

```cpp
#include <iostream>

struct F {
    void operator()(int x) const {
        std::cout << x << "\n";
    }
};

int main() {
    F f;
    f(2);  // f.operator()(2)
}
```

`f` 是一个对象，但它可以像函数一样被调用。

### Example : 抽取 transform 模式

先看一段直接写循环的代码：

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v {1, 3, 5, 7, 9};

    for (int& x : v) {
        x *= 5;
    }

    for (int& x : v) {
        x += 3;
    }

    for (int& x : v) {
        x = x * x;
    }

    for (int x : v) {
        cout << x << " ";
    }
    cout << endl;
}
```

这几段循环有共同模式：

```text
遍历 vector 中每个元素 -> 对元素做某个操作 -> 把结果写回去
```

于是可以把公共流程抽成 `transform`：

```cpp
#include <functional>
#include <vector>
using namespace std;

void transform(vector<int>& v, const function<int(int)>& f) {
    for (int& x : v) {
        x = f(x);
    }
}
```

使用 lambda 传入变化的操作：

```cpp
int main() {
    vector<int> v {1, 3, 5, 7, 9};

    transform(v, [](int x) { return x * 5; });
    transform(v, [](int x) { return x + 3; });
    transform(v, [](int x) { return x * x; });
}
```

这里不变的是遍历与写回流程，变化的是 `f(x)` 的具体定义。

### lambda 捕获与 std::function

如果操作中需要使用外部变量：

```cpp
int a = 5;
transform(v, [a](int x) { return x * a; });
```

`[a]` 表示把外部变量 `a` 捕获进 lambda。

如果 `transform` 的参数写成函数指针：

```cpp
void transform(vector<int>& v, int (*f)(int));
```

那么无捕获 lambda 可以转换成函数指针：

```cpp
transform(v, [](int x) { return x * 5; });  // OK
```

但有捕获 lambda 不能转换成普通函数指针：

```cpp
int a = 5;
transform(v, [a](int x) { return x * a; });  // Error if f is int (*)(int)
```

原因是有捕获 lambda 不只是函数，它还携带上下文数据。可以把它理解成一个临时生成的类对象：

```cpp
class MultiplyBy {
public:
    explicit MultiplyBy(int a) : a(a) {}

    int operator()(int x) const {
        return x * a;
    }

private:
    int a;
};
```

`[a](int x) { return x * a; }` 大致等价于创建一个带有字段 `a` 的函数对象。

`std::function<int(int)>` 可以接住普通函数、无捕获 lambda、有捕获 lambda、functor 等多种 callable object。

```cpp
void transform(vector<int>& v, const function<int(int)>& f) {
    for (int& x : v) {
        x = f(x);
    }
}
```

### 用 functor 改写 lambda

下面是完整版本。

```cpp
#include <cmath>
#include <functional>
#include <iostream>
#include <vector>
using namespace std;

void transform(vector<int>& v, const function<int(int)>& f) {
    for (int& x : v) {
        x = f(x);
    }
}

class MulBy {
public:
    explicit MulBy(int a) : a(a) {}

    int operator()(int x) const {
        return x * a;
    }

private:
    int a;
};

class NthPow {
public:
    explicit NthPow(int n) : n(n) {}

    int operator()(int x) const {
        return static_cast<int>(pow(x, n));
    }

private:
    int n;
};

class Line {
public:
    Line(int a, int b) : a(a), b(b) {}

    int operator()(int x) const {
        return a * x + b;
    }

private:
    int a;
    int b;
};

class Print {
public:
    explicit Print(char sep = ' ') : sep(sep) {}

    int operator()(int x) const {
        cout << x << sep;
        return x;  // 保持 transform 的 int -> int 接口
    }

private:
    char sep;
};

int main() {
    vector<int> v {1, 3, 5, 7, 9};

    int a = 5;
    transform(v, [a](int x) { return x * a; });

    transform(v, MulBy(3));       // 每个元素乘以 3
    transform(v, NthPow(2));      // 每个元素平方
    transform(v, Line(2, 1));     // y = 2x + 1
    transform(v, Line(-1, 0));    // y = -x

    transform(v, Print(' '));
    cout << endl;

    transform(v, Print(','));
    cout << endl;
}
```

- `MulBy(3)`、`NthPow(2)`、`Line(2, 1)` 都是对象；
- 它们能被 `transform` 调用，是因为它们定义了 `operator()`；
- 对象中可以保存状态，例如 `MulBy` 保存倍数 `a`，`Line` 保存直线参数 `a, b`；
- `operator()` 不修改对象自身状态时，应写成 `const`。

这也是标准库很多算法接口的基础思想：

```cpp
algorithm + callable object
```

---

## 用户自定义类型转换

编译器能通过两类机制做 user-defined implicit conversion：

1. 单参数构造函数；
2. conversion operator。

### 单参数构造函数

```cpp
class One {
public:
    One() = default;
};

class Two {
public:
    Two(const One&) {}
};

void f(Two) {}

int main() {
    One one;
    f(one);  // One 隐式转换成 Two
}
```

`Two(const One&)` 是一个单参数构造函数，所以 `One` 可以被隐式转换成 `Two`。

这类转换有时方便，但也可能让代码产生不明显的行为。

### `explicit` 禁止隐式转换

如果不希望单参数构造函数参与隐式转换，可以加 `explicit`。

```cpp
class One {
public:
    One() = default;
};

class Two {
public:
    explicit Two(const One&) {}
};

void f(Two) {}

int main() {
    One one;

    // f(one);       // Error: 不允许隐式转换
    f(Two(one));     // OK: 显式构造
}
```

:::TIP
多数情况下，单参数构造函数建议加 `explicit`，除非你明确希望它支持隐式转换。
:::

### Conversion operator

另一种方式是在源类型里定义 `operator T()`。

例如有理数转成 `double`：

```cpp
class Rational {
public:
    Rational(int numerator, int denominator)
        : numerator(numerator), denominator(denominator) {}

    operator double() const {
        return numerator / static_cast<double>(denominator);
    }

private:
    int numerator;
    int denominator;
};

int main() {
    Rational r(1, 3);
    double d = 1.3 * r;  // r 隐式转换成 double
}
```

conversion operator 的形式：

```cpp
X::operator T()
```

特点：

- 没有显式返回类型；
- 函数名里的 `T` 就是目标类型；
- 没有参数；
- 可以转成内置类型，也可以转成其他自定义类型。

### 两种转换方式并存的问题

如果从 `Apple` 到 `Orange` 同时存在两条转换路径，就会产生二义性。

```cpp
class Orange;

class Apple {
public:
    operator Orange();       // Apple -> Orange
};

class Orange {
public:
    Orange(const Apple&) {}   // Apple -> Orange
};

void f(Orange) {}

int main() {
    Apple a;
    f(a);  // Error: ambiguous conversion
}
```

编译器不知道应该选：

```text
Apple::operator Orange()
```

还是：

```text
Orange::Orange(const Apple&)
```

解决方式：只保留一种隐式转换路径，或者把构造函数声明为 `explicit`，让转换必须写清楚。

更保守的设计是提供具名函数：

```cpp
class Rational {
public:
    double to_double() const;
};
```

这样调用者必须明确写出：

```cpp
double d = r.to_double();
```

可读性更强，也更不容易产生意外转换。

---

## 使用建议

运算符重载很强，但不应该滥用。

适合重载的情况：

- 语义和内置类型非常接近；
- 代码会明显更自然；
- 用户看到运算符后能猜到它大概做什么；
- 标准库约定需要该运算符，例如 `operator<` 用于排序，`operator<<` 用于输出。

不适合重载的情况：

- 运算符含义和常识差异很大；
- 只是为了少写几个字符；
- 读者需要反复查文档才知道它做什么；
- 隐式类型转换会导致不明显的函数调用。

最终原则：

> Just because you can overload an operator doesn't mean you should.

> 只有当重载能让代码更容易阅读和维护时，才应该使用它。
