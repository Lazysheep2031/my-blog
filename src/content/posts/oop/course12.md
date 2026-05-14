---
title: Templates
published: 2026-05-14
description: function overloading、default arguments、function template、template instantiation、template deduction、class template、non-type template parameter、member template、templates and inheritance、CRTP
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Template（模板）** 是 C++ 泛型编程的基础。它解决的问题是：当多份代码的逻辑相同，只有处理的数据类型不同，就把“类型”也做成参数，由编译器在需要时生成具体版本。

主要内容：

- function overloading 与 default arguments；
- 为什么需要 templates，以及不用 templates 的几种替代方案；
- function template 的定义、实例化、类型推导和重载规则；
- class template 的定义、使用、成员函数写法；
- multiple type parameters、nested templates、non-type parameters；
- member templates；
- templates 与 inheritance 的组合；
- CRTP：用模板模拟一种静态多态；
- 模板代码为什么通常写在 header file 中。

> 模板的核心思想：不变的是算法或类的逻辑，变化的是类型。把变化的类型参数化，就能在保持类型安全的前提下复用代码。

## 目录

- [概述](#概述)
- [目录](#目录)
- [Function overloading](#function-overloading)
  - [基本概念](#基本概念)
  - [Overload and auto-cast](#overload-and-auto-cast)
- [Default arguments](#default-arguments)
  - [默认参数的含义](#默认参数的含义)
  - [默认参数必须从右往左给](#默认参数必须从右往左给)
- [Why templates?](#why-templates)
  - [问题背景](#问题背景)
  - [不用模板的几种做法](#不用模板的几种做法)
    - [1. Clone the code](#1-clone-the-code)
    - [2. Make a common base class](#2-make-a-common-base-class)
    - [3. Untyped lists](#3-untyped-lists)
  - [模板的基本思想](#模板的基本思想)
- [Function templates](#function-templates)
  - [从 swap 开始](#从-swap-开始)
  - [模板语法](#模板语法)
  - [实例化](#实例化)
  - [模板参数推导](#模板参数推导)
  - [函数模板与普通函数共存](#函数模板与普通函数共存)
  - [显式给出模板参数](#显式给出模板参数)
- [Class templates](#class-templates)
  - [基本概念](#基本概念-1)
  - [Vector 示例](#vector-示例)
  - [类模板的成员函数定义](#类模板的成员函数定义)
  - [类模板与函数模板组合：sort](#类模板与函数模板组合sort)
- [更复杂的模板参数](#更复杂的模板参数)
  - [多个类型参数](#多个类型参数)
  - [嵌套模板参数](#嵌套模板参数)
  - [Non-type template parameters](#non-type-template-parameters)
- [Member templates](#member-templates)
  - [跨类型 complex 构造](#跨类型-complex-构造)
- [Templates and inheritance](#templates-and-inheritance)
  - [类模板继承普通类](#类模板继承普通类)
  - [类模板继承类模板](#类模板继承类模板)
  - [普通类继承模板实例化类型](#普通类继承模板实例化类型)
- [CRTP](#crtp)
  - [基本形式](#基本形式)
  - [用普通虚函数做 Newton solver](#用普通虚函数做-newton-solver)
  - [普通函数模板版本](#普通函数模板版本)
  - [CRTP 版本](#crtp-版本)
  - [CRTP 的特点](#crtp-的特点)
- [模板代码放在哪里](#模板代码放在哪里)
- [写模板的建议流程](#写模板的建议流程)

---

## Function overloading

### 基本概念

**Function overloading（函数重载）** 指：多个函数可以拥有同一个函数名，但参数表必须不同。

参数表包括：

- 参数个数；
- 参数类型；
- 参数顺序。

返回值类型不能单独用来区分重载函数。

例子：

```cpp
void print(char* str, int width); // #1
void print(double d, int width);  // #2
void print(long l, int width);    // #3
void print(int i, int width);     // #4
void print(char* str);            // #5

print("Pancakes", 15); // #1
print("Syrup");        // #5
print(1999.0, 10);     // #2
print(1999, 12);       // #4
print(1999L, 15);      // #3
```

调用时，编译器根据实参列表选择最合适的函数版本。

函数重载的意义是：把一组语义相同或相似的操作组织成同一个名字。这样使用者只需要记住一个概念性的函数名，具体版本由编译器选择。

### Overload and auto-cast

普通函数重载允许发生一定程度的 implicit conversion（隐式类型转换）。

```cpp
void foo(int i) {}
void foo(double d) {}

int main() {
    foo(2);       // exact match: foo(int)
    foo(2.3);     // exact match: foo(double)
    foo('a');     // char -> int，通常调用 foo(int)
    foo(3.2f);    // float -> double，通常调用 foo(double)
    // foo(2L);   // long 到 int / double 可能都可行，容易产生 ambiguous call
}
```

注意：

- `foo(2)` 直接匹配 `int`；
- `foo(2.3)` 直接匹配 `double`；
- `foo('a')` 中 `char` 到 `int` 更自然；
- `foo(3.2f)` 中 `float` 到 `double` 更自然；
- `foo(2L)` 可能出现二义性，因为 `long` 转 `int` 和转 `double` 都可能被认为可行。

:::TIP
普通函数重载可以依赖隐式转换，但隐式转换可能带来二义性。写代码时尽量让调用意图清晰，必要时使用显式类型转换。
:::

---

## Default arguments

### 默认参数的含义

**Default argument（默认参数）** 是写在函数声明中的默认值。当函数调用时少传了一部分参数，编译器会自动把缺失的参数补上。

```cpp
int harpo(int n, int m = 4, int j = 5);

int beeps;
beeps = harpo(2);      // 等价于 harpo(2, 4, 5)
beeps = harpo(1, 8);   // 等价于 harpo(1, 8, 5)
beeps = harpo(8, 7, 6); // 三个参数都显式给出
```

默认参数的重点：

- 默认值写在 declaration（声明）处；
- 调用时由编译器补齐；
- 函数本体仍然只有一个版本；
- default arguments 与 function overloading 的机制不同。

可以理解为：

```cpp
harpo(2);
```

在编译器看来会被补成：

```cpp
harpo(2, 4, 5);
```

函数定义本身仍然接收三个参数。

### 默认参数必须从右往左给

默认参数必须从参数列表右端开始连续提供。

```cpp
int chico(int n, int m = 6, int j); // illegal
int groucho(int k = 1, int m = 2, int n = 3); // ok
```

原因是：调用时实参按从左到右匹配。若中间参数有默认值，右边参数没有默认值，编译器无法判断用户省略的是哪一个参数。

---

## Why templates?

### 问题背景

假设现在需要：

```text
list of X
list of Y
```

两者都是线性表，操作逻辑完全一样：

- 插入；
- 删除；
- 遍历；
- 查找；
- 取第 i 个元素。

差异只在于元素类型不同。

如果没有泛型能力，就需要为 `X` 和 `Y` 各写一份 list 代码。代码逻辑重复，维护困难。

### 不用模板的几种做法

#### 1. Clone the code

直接复制代码，为不同类型写不同版本。

优点：

- 类型安全；
- 代码直观。

缺点：

- 重复代码多；
- 后续修改必须同步改多份；
- 某一份漏改就会出现行为不一致。

重复代码通常是设计上的坏味道。

#### 2. Make a common base class

把所有对象都继承自某个公共基类，例如 `Object`，然后写 `list<Object*>`。

问题：

- 需要统一继承体系；
- 对某些类型并不合适；
- 可能引入运行时开销；
- 使用时经常需要向下转型。

#### 3. Untyped lists

类似 C 语言风格，用 `void*` 抹掉类型信息。

问题：

- 类型不安全；
- 需要大量显式类型转换；
- 编译器无法帮你检查元素类型是否正确。

### 模板的基本思想

模板的做法是：

> 把变化的类型抽象成参数。

类比普通函数：

```cpp
int add(int x, int y) {
    return x + y;
}
```

这里不变的是加法逻辑，变化的是输入值，所以把值做成参数。

模板中，不变的是算法或类的逻辑，变化的是类型，所以把类型做成参数。

```cpp
template<typename T>
class List {
    // 用 T 表示元素类型
};
```

标准库中大量使用模板：

- function template：例如 `std::sort`；
- class template：例如 `std::vector<T>`、`std::list<T>`、`std::stack<T>`、`std::queue<T>`。

---

## Function templates

### 从 swap 开始

如果只交换两个 `int`：

```cpp
void swap_int(int& x, int& y) {
    int temp = x;
    x = y;
    y = temp;
}
```

如果还想交换 `float`、`string`、`Currency`、`Person`，逻辑完全一样，只是类型不同。

用函数模板可以写成：

```cpp
template<typename T>
void my_swap(T& x, T& y) {
    T temp = x;
    x = y;
    y = temp;
}
```

完整例子：

```cpp
#include <iostream>
#include <string>
using namespace std;

template<typename T>
void my_swap(T& x, T& y) {
    T temp = x;
    x = y;
    y = temp;
}

int main() {
    int a = 2, b = 5;
    cout << a << "," << b << endl;
    my_swap(a, b);
    cout << a << "," << b << endl;

    float fa = 3.14f, fb = 11.9f;
    cout << fa << "," << fb << endl;
    my_swap(fa, fb);
    cout << fa << "," << fb << endl;

    string sa = "hello", sb = "world";
    cout << sa << "," << sb << endl;
    my_swap(sa, sb);
    cout << sa << "," << sb << endl;
}
```

这个模板对 `T` 有隐含要求：

- `T` 可以被 copy construction；
- `T` 可以被 copy assignment。

因为函数体中有：

```cpp
T temp = x;
x = y;
y = temp;
```

如果某个类型禁止拷贝或赋值，这个模板在该类型上实例化时会编译失败。

### 模板语法

```cpp
template<typename T>
void my_swap(T& x, T& y) {
    T temp = x;
    x = y;
    y = temp;
}
```

各部分含义：

- `template`：声明接下来是模板；
- `typename T`：声明一个类型参数 `T`；
- `class T` 与 `typename T` 在这种场景下等价；
- 函数体中可以把 `T` 当作普通类型名使用。

类型参数可以出现在：

- 函数参数类型；
- 函数返回值类型；
- 函数内部局部变量类型。

例如：

```cpp
template<typename T>
T max_value(T a, T b) {
    T result = (a < b) ? b : a;
    return result;
}
```

这里 `T` 同时出现在参数、返回值和局部变量中。

### 实例化

模板本身是一个“板子”，不是最终运行的函数代码。只有当具体类型被用到时，编译器才会根据模板生成真实函数。

这个过程叫 **template instantiation（模板实例化）**。

例如：

```cpp
int i = 3, j = 4;
my_swap(i, j); // 生成 my_swap<int>

float x = 4.5f, y = 3.7f;
my_swap(x, y); // 生成 my_swap<float>

string s = "Hello", t = "World";
my_swap(s, t); // 生成 my_swap<string>
```

编译器会生成三个具体函数版本：

```text
my_swap<int>
my_swap<float>
my_swap<string>
```

汇编层面的结果：当 `int`、`float`、`string` 都调用了 `my_swap`，编译器会生成三个版本；如果某个类型没有被调用，对应版本就不会生成。

这和普通函数不同：普通函数定义出来以后就是一个实体，模板函数只有在具体类型被使用时才实例化。

:::TIP
模板的类型检查主要发生在实例化阶段。模板定义本身可能看起来没问题，但一旦用某个不满足要求的类型实例化，才会报错。
:::

### 模板参数推导

函数模板调用时，编译器会根据实参类型推导模板参数。

```cpp
template<typename T>
void print(T a, T b) {
    cout << a << "," << b << endl;
}

print(2, 5);       // T = int
print(3.4, 7.6);   // T = double
// print(2, 5.3);  // error: 一个是 int，一个是 double，无法推出同一个 T
```

关键规则：

> 函数模板参数推导要求类型精确匹配，不会先做隐式类型转换。

所以：

```cpp
my_swap(int, int);       // ok
my_swap(double, double); // ok
my_swap(int, double);    // error
```

如果确实希望使用某个类型，可以自己把实参转成同一类型：

```cpp
print(static_cast<double>(2), 5.3); // T = double
```

### 函数模板与普通函数共存

函数模板可以和普通函数重载共存。

```cpp
#include <iostream>
using namespace std;

template<typename T>
void print(T a, T b) {
    cout << "print(T): " << a << "," << b << endl;
}

void print(float a, float b) {
    cout << "print(float): " << a << "," << b << endl;
}

int main() {
    print(2, 5);          // 模板：T = int
    print(3.4, 7.6);      // 模板：T = double
    print(2.3f, 3.5f);    // 普通函数：print(float, float)
    print(2.3, 3.5);      // 模板：T = double，精确匹配优先
    print(2, 3.5);        // 普通函数：两个参数都可转成 float
}
```

匹配顺序可以记成：

1. 查找是否有 exact match 的普通函数；
2. 查找是否有 exact match 的函数模板实例；
3. 查找普通函数是否能通过 implicit conversion 匹配。

对应上面的调用：

```cpp
print(2.3f, 3.5f);
```

普通函数 `print(float, float)` 精确匹配，所以调用普通函数。

```cpp
print(2.3, 3.5);
```

两个实参都是 `double`，模板能生成 `print<double>` 精确匹配；普通 `print(float, float)` 需要转换，所以模板胜出。

```cpp
print(2, 3.5);
```

模板 `print(T, T)` 无法推出同一个 `T`，普通 `print(float, float)` 可以通过转换调用，所以最终调用普通函数。

### 显式给出模板参数

模板参数也可以显式写出来。

```cpp
print<int>(2, 5.3);     // 生成 print<int>，5.3 转成 int，可能有 warning
print<double>(2, 5.3);  // 生成 print<double>，2 转成 double
```

当模板参数无法从函数实参中推导出来时，必须显式给出。

```cpp
template<typename T>
void foo() {
    // ...
}

foo<int>();
foo<float>();
```

这里 `T` 没有出现在函数参数中，编译器无法根据实参推导，所以需要写 `foo<int>()`。

---

## Class templates

### 基本概念

**Class template（类模板）** 是把类型参数用于类定义。

类由两部分组成：

- data members；
- member functions。

如果类中保存的数据类型可变，同时操作逻辑不依赖具体类型，就可以把该类型参数化。

典型例子：

```cpp
stack<int>
list<Person*>
queue<Job>
vector<double>
```

`stack` 的 push/pop/top 逻辑不依赖元素类型。元素类型可以是 `int`，也可以是自定义类。

### Vector 示例

一个简化版 `Vector`：

```cpp
template<typename T>
class Vector {
public:
    explicit Vector(int size);
    ~Vector();

    Vector(const Vector& other);
    Vector& operator=(const Vector& other);

    int size() const;
    T& operator[](int index);
    const T& operator[](int index) const;

private:
    T* m_elements;
    int m_size;
};
```

使用方式：

```cpp
Vector<int> v1(100);
Vector<Complex> v2(256);

v1[20] = 10;
v2[20] = Complex(cos(pi / 4), sin(pi / 4));
```

`Vector<int>` 和 `Vector<Complex>` 是两个不同的具体类型。它们来自同一个类模板，但实例化后的类型不同。

### 类模板的成员函数定义

如果成员函数写在类外，需要重复写模板头，并且用 `Vector<T>::` 指明作用域。

```cpp
template<typename T>
Vector<T>::Vector(int size)
    : m_elements(new T[size]), m_size(size) {}

template<typename T>
Vector<T>::~Vector() {
    delete[] m_elements;
}

template<typename T>
int Vector<T>::size() const {
    return m_size;
}

template<typename T>
T& Vector<T>::operator[](int index) {
    if (index >= 0 && index < m_size) {
        return m_elements[index];
    }
    throw std::out_of_range("Vector index out of range");
}

template<typename T>
const T& Vector<T>::operator[](int index) const {
    if (index >= 0 && index < m_size) {
        return m_elements[index];
    }
    throw std::out_of_range("Vector index out of range");
}
```

写法要点：

```cpp
template<typename T>
T& Vector<T>::operator[](int index)
```

- 前面的 `template<typename T>` 表示这是模板定义；
- `Vector<T>::` 表示这是 `Vector<T>` 这个类模板实例的成员；
- 返回值、参数和函数体中都可以使用 `T`。

### 类模板与函数模板组合：sort

函数模板可以接收类模板实例。

```cpp
// bubble sort，仅用于说明模板机制，不推荐实际使用
template<typename T>
void sort(Vector<T>& arr) {
    const int last = arr.size() - 1;

    for (int i = 0; i < last; ++i) {
        for (int j = last; j > i; --j) {
            if (arr[j] < arr[j - 1]) {
                my_swap(arr[j], arr[j - 1]);
            }
        }
    }
}
```

使用：

```cpp
Vector<int> vi(4);
vi[0] = 4;
vi[1] = 3;
vi[2] = 7;
vi[3] = 1;
sort(vi); // sort(Vector<int>&)

Vector<string> vs(5);
vs[0] = "Fred";
vs[1] = "Wilma";
vs[2] = "Barney";
vs[3] = "Dino";
vs[4] = "Prince";
sort(vs); // sort(Vector<string>&)
```

这个 `sort` 对 `T` 有隐含要求：

- `T` 支持 `operator<`，因为有 `arr[j] < arr[j - 1]`；
- `T` 支持交换所需的拷贝或移动操作，因为调用了 `my_swap`。

这说明模板不仅参数化类型，也隐含了对类型能力的要求。

---

## 更复杂的模板参数

### 多个类型参数

模板可以有多个类型参数。

例如 hash table 需要同时参数化 key 和 value：

```cpp
template<typename Key, typename Value>
class HashTable {
public:
    const Value& lookup(const Key& key) const;
    void insert(const Key& key, const Value& value);

private:
    // ...
};
```

使用：

```cpp
HashTable<string, int> word_count;
HashTable<int, Student> student_table;
```

这里 `Key` 和 `Value` 是两个独立的类型参数。

### 嵌套模板参数

模板实例本身也是类型，因此可以继续作为其他模板的参数。

```cpp
Vector<Vector<double*>> matrix;
```

这里：

- `Vector<double*>` 是一个具体类型；
- 它又作为外层 `Vector` 的元素类型。

类型参数也可以很复杂，例如函数指针：

```cpp
Vector<int (*)(Vector<double>&, int)> funcs;
```

含义：

- `funcs` 是一个 `Vector`；
- 里面存的是函数指针；
- 这些函数接收 `Vector<double>&` 和 `int`；
- 返回 `int`。

模板的类型系统非常强大，也因此容易写出可读性较差的复杂类型。实际代码中可以用 `using` 简化：

```cpp
using Func = int (*)(Vector<double>&, int);
Vector<Func> funcs;
```

### Non-type template parameters

模板参数除了类型，也可以是编译期常量值。这叫 **non-type template parameter**。

常见用途：把数组长度作为模板参数。

```cpp
#include <iostream>
using namespace std;

template<typename T, int N>
class Array {
public:
    int size() const { return N; }

    T& operator[](int i) { return m_arr[i]; }
    const T& operator[](int i) const { return m_arr[i]; }

private:
    T m_arr[N]{};
};

int main() {
    Array<int, 3> a;
    a[0] = 2;
    a[1] = 3;
    a[2] = 1;

    cout << a.size() << endl;

    Array<int, 3> b{};
    cout << b[0] << "," << b[1] << "," << b[2] << endl;

    b = a; // ok，a 和 b 类型完全相同：Array<int, 3>
    cout << b[0] << "," << b[1] << "," << b[2] << endl;
}
```

`Array<int, 3>` 中：

- `int` 是类型参数；
- `3` 是非类型参数；
- `N` 必须能在编译期确定。

如果长度不同，类型也不同：

```cpp
Array<int, 3> a;
Array<int, 4> b;

// b = a; // error：Array<int, 3> 和 Array<int, 4> 是不同类型
```

如果表达式能在编译期算出相同值，则类型相同：

```cpp
Array<int, 3> a;
Array<int, 9 / 3> b;

b = a; // ok，9 / 3 在编译期等于 3
```

非类型参数可以有默认值：

```cpp
template<typename T, int Bounds = 100>
class FixedVector {
public:
    T& operator[](int i) { return elements[i]; }

private:
    T elements[Bounds];
};

FixedVector<int, 50> v1;
FixedVector<int, 10 * 5> v2;
FixedVector<int> v3; // FixedVector<int, 100>
```

使用 non-type parameter 的利弊：

优点：

- 长度进入类型系统；
- 编译器知道固定大小，可能更容易优化；
- 可以避免原生数组传参退化成指针的问题。

缺点：

- 不同长度生成不同类型；
- 代码更复杂；
- 大量不同数值可能导致 code bloat。

:::WARNING
`Array<int, 3>` 和 `Array<int, 4>` 是不同类型。非类型参数会参与类型构造，这一点很重要。
:::

---

## Member templates

### 跨类型 complex 构造

**Member template** 指：在类或类模板内部，某个成员函数本身又是模板。

典型例子是 `complex<T>` 的跨类型构造。

先写一个普通的类模板：

```cpp
#include <iostream>
using namespace std;

template<typename T>
struct MyComplex {
    T real;
    T imag;

    MyComplex(T real, T imag) : real(real), imag(imag) {}
};

template<typename T>
ostream& operator<<(ostream& out, const MyComplex<T>& c) {
    return out << "(" << c.real << "," << c.imag << ")";
}

int main() {
    MyComplex<double> a(3.14, -1.57);
    cout << a << endl;

    MyComplex<double> b = a; // ok，同类型拷贝构造
    cout << b << endl;

    // MyComplex<int> c = a; // error：MyComplex<double> 和 MyComplex<int> 是不同类型
}
```

编译器自动生成的 copy constructor 只处理同类型：

```cpp
MyComplex<double> -> MyComplex<double>
```

它不会自动生成：

```cpp
MyComplex<double> -> MyComplex<int>
```

如果希望支持跨类型初始化，就要给构造函数额外引入一个模板参数 `U`。

```cpp
#include <iostream>
using namespace std;

template<typename T>
struct MyComplex {
    T real;
    T imag;

    MyComplex(T real, T imag) : real(real), imag(imag) {}

    template<typename U>
    MyComplex(const MyComplex<U>& other)
        : real(other.real), imag(other.imag) {}
};

template<typename T>
ostream& operator<<(ostream& out, const MyComplex<T>& c) {
    return out << "(" << c.real << "," << c.imag << ")";
}

int main() {
    MyComplex<double> a(3.14, -1.57);
    cout << a << endl;

    MyComplex<int> b = a; // U = double，double 转 int
    cout << b << endl;    // 通常输出 (3,-1)

    MyComplex<float> f(3.14f, -1.57f);
    MyComplex<double> d = f; // U = float，float 转 double
    cout << d << endl;
}
```

这里有两层模板参数：

```cpp
template<typename T>
struct MyComplex {
    template<typename U>
    MyComplex(const MyComplex<U>& other);
};
```

- `T` 是当前对象的元素类型；
- `U` 是来源对象的元素类型。

例如：

```cpp
MyComplex<int> b = MyComplex<double>(3.14, -1.57);
```

此时：

```text
T = int
U = double
```

构造函数负责把 `double` 成员转换成 `int` 成员。

:::WARNING
从宽类型到窄类型可能损失精度，例如 `double -> int` 会截断小数部分。member template 只提供转换通道，不保证转换语义一定安全。
:::

---

## Templates and inheritance

模板可以和继承组合。关键是看实例化之后产生了哪些具体类型。

### 类模板继承普通类

```cpp
class Base {
public:
    void common() {}
};

template<typename T>
class Derived : public Base {
public:
    T value;
};
```

实例化后：

```cpp
Derived<int> di;
Derived<double> dd;
Derived<string> ds;
```

会得到多个不同的派生类类型：

```text
Derived<int>
Derived<double>
Derived<string>
```

它们都继承自同一个 `Base`。

关系可以理解为：

```text
Base
 ├── Derived<int>
 ├── Derived<double>
 └── Derived<string>
```

### 类模板继承类模板

```cpp
template<typename T>
class List {
    // ...
};

template<typename T>
class MyList : public List<T> {
    // ...
};
```

实例化后：

```cpp
MyList<int> li;
MyList<double> ld;
```

对应继承关系是：

```text
List<int>    <- MyList<int>
List<double> <- MyList<double>
```

这里的 base class 也随着 `T` 变化。`List<int>` 和 `List<double>` 是不同类型。

### 普通类继承模板实例化类型

普通类也可以继承某个已经实例化好的模板类型。

```cpp
class Employee {
    // ...
};

template<typename T>
class List {
    // ...
};

class SupervisorGroup : public List<Employee*> {
    // ...
};
```

这里 `List<Employee*>` 已经是一个具体类型，`SupervisorGroup` 是普通类，直接继承它。

总结：

| 形式 | 例子 | 含义 |
|---|---|---|
| 类模板继承普通类 | `template<class T> class D : public B {}` | 多个 `D<T>` 共享同一个 `B` |
| 类模板继承类模板 | `template<class T> class D : public B<T> {}` | 每个 `D<T>` 对应一个 `B<T>` |
| 普通类继承模板实例 | `class D : public B<int> {}` | `B<int>` 已经是具体 base class |

---

## CRTP

### 基本形式

**CRTP（Curiously Recurring Template Pattern，奇异递归模板模式）** 的形式是：

```cpp
template<typename Derived>
class Base {
    // ...
};

class Derived : public Base<Derived> {
    // ...
};
```

看起来有点奇怪：派生类继承基类模板时，把自己的类型作为模板参数传回基类。

这样基类模板就能“知道”具体派生类类型。

典型写法：

```cpp
template<typename Derived>
struct Base {
    void interface() {
        static_cast<Derived*>(this)->implementation();
    }

    static void static_func() {
        Derived::static_sub_func();
    }
};

struct Derived : public Base<Derived> {
    void implementation() {
        // derived implementation
    }

    static void static_sub_func() {
        // derived static implementation
    }
};
```

CRTP 常用来在泛型编程中模拟类似 virtual function 的接口，但调用在编译期决定。

### 用普通虚函数做 Newton solver

前面设计课里用过 Newton solver。这里先用虚函数版本回顾动态多态。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

class Problem {
public:
    virtual ~Problem() = default;

    virtual double f(double x) const = 0;
    virtual double df(double x) const = 0;
};

class Sqrt : public Problem {
public:
    double f(double x) const override {
        return x * x - 2.0;
    }

    double df(double x) const override {
        return 2.0 * x;
    }
};

class Whatever : public Problem {
public:
    double f(double x) const override {
        return cos(x) - pow(x, 3);
    }

    double df(double x) const override {
        return -sin(x) - 3.0 * pow(x, 2);
    }
};

bool is_close(double fx, double tolerance) {
    return fabs(fx) < tolerance;
}

void print_info(int k, double x, double fx) {
    cout << "k = " << k
         << ", x = " << x
         << ", f(x) = " << fx << endl;
}

double newton_solve(const Problem& p,
                    double x0,
                    double tolerance = 1e-12,
                    int max_iter = 30) {
    int k = 0;
    double x = x0;
    double fx = p.f(x);

    print_info(k, x, fx);

    while (!is_close(fx, tolerance) && k < max_iter) {
        double dfx = p.df(x);
        x = x - fx / dfx;

        fx = p.f(x);
        ++k;
        print_info(k, x, fx);
    }

    return x;
}

int main() {
    double x0 = 1.0;

    Sqrt sqrt_problem;
    Whatever whatever_problem;

    newton_solve(sqrt_problem, x0);
    cout << "\n-----------------------\n";
    newton_solve(whatever_problem, x0);
}
```

这个版本的特点：

- `Problem` 是抽象基类；
- `newton_solve` 接收 `const Problem&`；
- `p.f(x)` 和 `p.df(x)` 是 virtual call；
- 具体调用哪个函数由对象的动态类型决定。

优点：接口明确，用户知道必须继承 `Problem` 并实现 `f` / `df`。

代价：通过虚函数表进行动态绑定，有运行时开销。

### 普通函数模板版本

也可以不用继承，把 `newton_solve` 写成函数模板。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

class Sqrt {
public:
    double f(double x) const {
        return x * x - 2.0;
    }

    double df(double x) const {
        return 2.0 * x;
    }
};

class Whatever {
public:
    double f(double x) const {
        return cos(x) - pow(x, 3);
    }

    double df(double x) const {
        return -sin(x) - 3.0 * pow(x, 2);
    }
};

bool is_close(double fx, double tolerance) {
    return fabs(fx) < tolerance;
}

void print_info(int k, double x, double fx) {
    cout << "k = " << k
         << ", x = " << x
         << ", f(x) = " << fx << endl;
}

template<typename Problem>
double newton_solve(const Problem& p,
                    double x0,
                    double tolerance = 1e-12,
                    int max_iter = 30) {
    int k = 0;
    double x = x0;
    double fx = p.f(x);

    print_info(k, x, fx);

    while (!is_close(fx, tolerance) && k < max_iter) {
        double dfx = p.df(x);
        x = x - fx / dfx;

        fx = p.f(x);
        ++k;
        print_info(k, x, fx);
    }

    return x;
}

int main() {
    double x0 = 1.0;

    Sqrt sqrt_problem;
    Whatever whatever_problem;

    newton_solve(sqrt_problem, x0);
    cout << "\n-----------------------\n";
    newton_solve(whatever_problem, x0);
}
```

这个版本的特点：

- 没有抽象基类；
- 没有虚函数；
- `Problem` 只要有 `f(double)` 和 `df(double)` 就能工作；
- 编译器为不同问题类型生成不同版本的 `newton_solve`。

问题在于：接口要求是隐式的。

```cpp
template<typename Problem>
double newton_solve(const Problem& p, double x0, ...)
```

用户从函数签名上只能看到 `Problem` 这个模板参数，看不到 `Problem` 必须提供 `f` 和 `df`。如果误传一个没有 `f` / `df` 的类型，错误会在模板实例化时出现。

### CRTP 版本

CRTP 可以让接口关系更明确，同时避免虚函数调用。

```cpp
#include <cmath>
#include <iostream>
using namespace std;

template<typename Derived>
class Problem {
public:
    double f(double x) const {
        return static_cast<const Derived*>(this)->f_impl(x);
    }

    double df(double x) const {
        return static_cast<const Derived*>(this)->df_impl(x);
    }
};

class Sqrt : public Problem<Sqrt> {
public:
    double f_impl(double x) const {
        return x * x - 2.0;
    }

    double df_impl(double x) const {
        return 2.0 * x;
    }
};

class Whatever : public Problem<Whatever> {
public:
    double f_impl(double x) const {
        return cos(x) - pow(x, 3);
    }

    double df_impl(double x) const {
        return -sin(x) - 3.0 * pow(x, 2);
    }
};

bool is_close(double fx, double tolerance) {
    return fabs(fx) < tolerance;
}

void print_info(int k, double x, double fx) {
    cout << "k = " << k
         << ", x = " << x
         << ", f(x) = " << fx << endl;
}

template<typename Derived>
double newton_solve(const Problem<Derived>& p,
                    double x0,
                    double tolerance = 1e-12,
                    int max_iter = 30) {
    int k = 0;
    double x = x0;
    double fx = p.f(x);

    print_info(k, x, fx);

    while (!is_close(fx, tolerance) && k < max_iter) {
        double dfx = p.df(x);
        x = x - fx / dfx;

        fx = p.f(x);
        ++k;
        print_info(k, x, fx);
    }

    return x;
}

int main() {
    double x0 = 1.0;

    Sqrt sqrt_problem;
    Whatever whatever_problem;

    newton_solve(sqrt_problem, x0);
    cout << "\n-----------------------\n";
    newton_solve(whatever_problem, x0);
}
```

核心是：

```cpp
template<typename Derived>
class Problem {
public:
    double f(double x) const {
        return static_cast<const Derived*>(this)->f_impl(x);
    }
};

class Sqrt : public Problem<Sqrt> {
public:
    double f_impl(double x) const;
};
```

`Problem<Sqrt>` 内部通过：

```cpp
static_cast<const Derived*>(this)
```

把当前对象当作 `Derived` 使用，然后调用派生类中的实现函数。

`newton_solve` 的接口也更明确：

```cpp
template<typename Derived>
double newton_solve(const Problem<Derived>& p, double x0, ...)
```

这说明传入对象必须处在 `Problem<Derived>` 这套 CRTP 结构中。相比普通函数模板，使用者更容易看出问题类应当如何定义。

### CRTP 的特点

CRTP 可以看成一种 **static polymorphism（静态多态）**。

| 方式 | 调用机制 | 接口形式 | 开销 | 适合场景 |
|---|---|---|---|---|
| virtual function | 运行时动态绑定 | 抽象基类 + virtual | 有虚函数开销 | 需要运行时多态 |
| 普通函数模板 | 编译期实例化 | 隐式要求 `f` / `df` | 无虚函数开销 | 泛型算法，接口要求简单 |
| CRTP | 编译期静态绑定 | `Derived : Base<Derived>` | 无虚函数开销 | 想表达继承式接口，又希望静态分发 |

CRTP 的优点：

- 不需要 vtable；
- 调用可在编译期解析；
- 基类可以调用派生类实现；
- 接口比纯 duck typing 的函数模板更显式。

CRTP 的限制：

- 不能直接替代运行时多态；
- 不适合需要把不同派生类统一放进 `vector<Base*>` 的场景；
- 写法较绕，对初学者不直观；
- 报错仍可能比较长。

---

## 模板代码放在哪里

普通类通常可以拆成：

```text
.h   ：声明
.cpp ：实现
```

模板通常要把定义也放在头文件中。

原因：模板实例化发生在编译期。编译器在调用点看到：

```cpp
my_swap<int>(a, b);
```

它需要拿到模板函数体，才能把 `T` 替换成 `int` 并生成真实函数。如果调用点只看到函数签名，看不到模板定义，就无法实例化。

所以模板常见写法是：

```cpp
// my_swap.hh
#ifndef MY_SWAP_HH
#define MY_SWAP_HH

template<typename T>
void my_swap(T& x, T& y) {
    T temp = x;
    x = y;
    y = temp;
}

#endif
```

也可以把实现写到另一个文件里，再由 header include 进来：

```cpp
// vector.hh
#ifndef VECTOR_HH
#define VECTOR_HH

template<typename T>
class Vector {
    // declaration
};

#include "vector_impl.hh"

#endif
```

重点是：使用模板的编译单元必须能看到模板定义。

:::TIP
模板定义放在头文件中通常不会像普通函数那样直接导致 multiple definition 问题。编译器和链接器有机制处理模板实例的合并。课堂中老师也强调：模板的东西基本都放 header file 里。
:::

---

## 写模板的建议流程

写模板不要一开始就泛化。更稳妥的流程：

1. 先选一个具体类型，写出 non-template version；
2. 建立一组测试用例；
3. 确认非模板版本正确；
4. 测量性能，找到需要优化的地方；
5. 回顾实现，判断哪些类型应该被参数化；
6. 把非参数化版本改成模板；
7. 用原有测试用例重新测试；
8. 再增加不同类型的测试用例。

例如先写：

```cpp
void swap_int(int& x, int& y) {
    int temp = x;
    x = y;
    y = temp;
}
```

测试通过后再抽象为：

```cpp
template<typename T>
void my_swap(T& x, T& y) {
    T temp = x;
    x = y;
    y = temp;
}
```

模板的强大来自泛化，但泛化之前要先确认普通逻辑本身正确。

---
