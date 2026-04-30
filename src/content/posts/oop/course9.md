---
title: Copy Constructor and Assignment
published: 2026-04-30
description: copy behavior、copy constructor、member-wise copy、deep copy、copy assignment、Rule of Zero、Rule of Three、copy elision、vector copy overhead
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

本讲讨论 C++ 中 **copy（拷贝）** 行为的发生时机、默认行为、潜在问题与定制方式。

核心问题有三个：

- copy 什么时候会发生；
- copy 发生时，编译器默认做了什么；
- 当类中管理资源时，为什么必须自己定义 copy constructor 和 copy assignment operator。

> 默认生成的 copy 行为是 member-wise copy。它对普通数值成员通常没问题，但对 raw pointer 成员很危险，因为它只复制指针值，不复制指针指向的资源。

## 目录

- [概述](#概述)
- [目录](#目录)
- [Copy 行为的基本场景](#copy-行为的基本场景)
  - [函数传值会触发 copy](#函数传值会触发-copy)
  - [用 HowMany 观察对象数量](#用-howmany-观察对象数量)
- [Copy constructor](#copy-constructor)
  - [函数签名](#函数签名)
  - [为什么参数必须是引用](#为什么参数必须是引用)
  - [编译器自动生成的 copy constructor](#编译器自动生成的-copy-constructor)
- [Member-wise copy](#member-wise-copy)
  - [class-type member 会递归调用 copy constructor](#class-type-member-会递归调用-copy-constructor)
  - [自己写空 copy constructor 的问题](#自己写空-copy-constructor-的问题)
  - [普通类型和指针类型的区别](#普通类型和指针类型的区别)
- [包含 raw pointer 的类](#包含-raw-pointer-的类)
  - [Person 的基本实现](#person-的基本实现)
  - [默认浅拷贝的问题](#默认浅拷贝的问题)
  - [深拷贝的 copy constructor](#深拷贝的-copy-constructor)
- [Initialization vs. Assignment](#initialization-vs-assignment)
  - [两种语义](#两种语义)
  - [默认生成的 operator=](#默认生成的-operator)
  - [raw pointer 下的赋值问题](#raw-pointer-下的赋值问题)
  - [正确的 copy assignment operator](#正确的-copy-assignment-operator)
  - [self-assignment](#self-assignment)
- [Rule of Zero 与 Rule of Three](#rule-of-zero-与-rule-of-three)
  - [用 string 替代 char\*](#用-string-替代-char)
  - [自动生成的三个特殊成员函数](#自动生成的三个特殊成员函数)
  - [什么时候需要自己写](#什么时候需要自己写)
- [Copy constructor 什么时候会被调用](#copy-constructor-什么时候会被调用)
  - [初始化](#初始化)
  - [传值参数](#传值参数)
  - [按值返回](#按值返回)
  - [copy elision](#copy-elision)
- [Copy 与性能：vector 例子](#copy-与性能vector-例子)
  - [push\_back 为什么会产生额外 copy](#push_back-为什么会产生额外-copy)
  - [reserve 减少扩容 copy](#reserve-减少扩容-copy)
  - [emplace\_back 原地构造](#emplace_back-原地构造)
- [禁止 copy](#禁止-copy)

---

## Copy 行为的基本场景

### 函数传值会触发 copy

copy 的基本含义是：

> 用一个已有对象创建另一个新对象。

最典型的例子是函数按值传参：

```cpp
void func(Currency p) {
    cout << "X = " << p.dollars();
}

Currency bucks(100, 0);
func(bucks);  // bucks 被 copy 到形参 p
```

调用 `func(bucks)` 时，函数栈帧中需要创建形参 `p`。因为 `p` 是一个新的 `Currency` 对象，所以它要用实参 `bucks` 初始化。

也就是说：

```text
实参 bucks  ----copy---->  形参 p
```

这个 copy 行为是隐式发生的，不需要手动写出来。

:::TIP
只要函数参数是值类型对象，传参时就会产生 copy。若对象较大，或者 copy 行为复杂，通常应考虑使用 `const T&` 传参。
:::

### 用 HowMany 观察对象数量

先看一个`HowMany` 类，用全局变量记录当前活着的对象数量。

先看一个容易出问题的版本：

```cpp
#include <iostream>
using namespace std;

int object_count = 0;

class HowMany {
public:
    HowMany() {
        ++object_count;
        cout << "HowMany(): " << object_count << endl;
    }

    ~HowMany() {
        --object_count;
        cout << "~HowMany(): " << object_count << endl;
    }
};

int main() {
    HowMany h;
    HowMany hr = h;  // 用 h 初始化 hr，会发生 copy
}
```

表面上有两个对象：

```text
h
hr
```

所以应该构造两次、析构两次，最后 `object_count` 回到 0。

但实际如果没有自己写 copy constructor，只有 `h` 的默认构造函数会执行一次。`hr = h` 对应的是 **copy construction**，由编译器自动生成的 copy constructor 完成。这个自动生成版本不会执行我们写在默认构造函数里的 `++object_count`。

于是可能看到类似现象：

```text
HowMany(): 1
~HowMany(): 0
~HowMany(): -1
```

这说明：

- `hr` 确实被创建了；
- 只是创建 `hr` 时没有调用默认构造函数；
- 编译器自动生成的 copy constructor 没有更新 `object_count`。

如果我们自己写 copy constructor，就可以追踪这个对象：

```cpp
#include <iostream>
using namespace std;

int object_count = 0;

class HowMany {
public:
    HowMany() {
        ++object_count;
        cout << "HowMany(): " << object_count << endl;
    }

    HowMany(int) {
        ++object_count;
        cout << "HowMany(int): " << object_count << endl;
    }

    HowMany(const HowMany& other) {
        ++object_count;
        cout << "HowMany(const HowMany&): "
             << object_count << endl;
    }

    ~HowMany() {
        --object_count;
        cout << "~HowMany(): " << object_count << endl;
    }
};

HowMany f(HowMany x) {
    return x;
}

int main() {
    HowMany h;
    HowMany hr = f(h);
}
```

在这个例子中，可能出现的对象包括：

1. `h`：由默认构造函数创建；
2. `x`：函数 `f` 的值传递形参，由 `h` copy 出来；
3. `hr`：由 `f(h)` 的返回值初始化出来。

:::WARNING
实际输出次数可能受编译器优化影响。编译器可以在安全时消除部分 copy，这就是 copy elision / return value optimization。
:::

---

## Copy constructor

### 函数签名

copy constructor 的标准形式是：

```cpp
T::T(const T& other);
```

例如：

```cpp
class HowMany {
public:
    HowMany(const HowMany& other);
};
```

它仍然是 constructor，所以：

- 没有返回值；
- 函数名和类名相同；
- 参数是同类型对象的引用；
- 通常使用 `const T&`，表示只读取被复制对象，不修改它。

### 为什么参数必须是引用

copy constructor 不能写成：

```cpp
HowMany(HowMany other);  // 错误设计
```

原因是：如果按值传参，调用这个函数时要先把实参 copy 到形参 `other`。但这个 copy 又需要调用 copy constructor，于是会无限递归。

逻辑是：

```text
要调用 copy constructor
  -> 需要先按值构造形参 other
  -> 构造 other 又要调用 copy constructor
  -> 继续递归
```

所以必须写成引用：

```cpp
HowMany(const HowMany& other);
```

### 编译器自动生成的 copy constructor

如果你没有定义 copy constructor，C++ 会自动生成一个。

自动生成的版本做的是 **member-wise copy**：

```text
逐个成员复制
```

对于普通数值成员，例如 `int`、`double`，它直接复制值。

对于 class-type 成员，例如 `std::string` 或另一个自定义类对象，它会调用该成员自己的 copy constructor。

对于 pointer 成员，它只复制地址值。

这就是 raw pointer 成员危险的根源。

---

## Member-wise copy

### class-type member 会递归调用 copy constructor

看一个更直接的例子：

```cpp
#include <iostream>
using namespace std;

struct A {
    A() {
        cout << "A default ctor" << endl;
    }

    A(const A& other) {
        cout << "A copy ctor" << endl;
    }
};

struct B {
    A a1;
    A a2;
};

int main() {
    B b1;
    B b2 = b1;  // 编译器自动生成 B 的 copy constructor
}
```

`B` 没有自己写 copy constructor，但这行代码仍然合法：

```cpp
B b2 = b1;
```

因为编译器自动生成了：

```cpp
B::B(const B& other)
    : a1(other.a1), a2(other.a2) {}
```

所以 `b2 = b1` 会调用两次 `A` 的 copy constructor：

```text
A copy ctor
A copy ctor
```

这就是 member-wise copy 的递归含义。

### 自己写空 copy constructor 的问题

如果你自己写了一个空的 copy constructor：

```cpp
struct B {
    A a1;
    A a2;

    B() = default;

    B(const B& other) {
        // 什么都不写
    }
};
```
会导致：

B b2 = b1; 时，b2 被创建出来了，但 b2.a1、b2.a2 没有复制 b1.a1、b1.a2 的内容。

也就是说，b2 名义上是从 b1 拷贝来的，实际内部成员却是默认构造出来的。

这和编译器自动生成的 member-wise copy 不一样。

正确写法应该使用 initializer list：

```cpp
struct B {
    A a1;
    A a2;

    B() = default;

    B(const B& other)
        : a1(other.a1), a2(other.a2) {}
};
```

:::TIP
构造函数体执行前，成员已经被初始化完了。copy constructor 中要复制成员，优先写在 initializer list 里。
:::

### 普通类型和指针类型的区别

对于下面这些成员：

```cpp
struct B {
    A a1;
    A a2;
    int i;
    float f;
    char* p;
};
```

编译器自动生成的 copy constructor 大致等价于：

```cpp
B::B(const B& other)
    : a1(other.a1),
      a2(other.a2),
      i(other.i),
      f(other.f),
      p(other.p) {}
```

区别在于：

- `a1`、`a2` 是 class-type member，会调用 `A` 的 copy constructor；
- `i`、`f` 是普通类型，直接复制值；
- `p` 是指针，也直接复制值，也就是复制地址。

指针的地址被复制后，两个对象会指向同一块资源。

---

## 包含 raw pointer 的类

### Person 的基本实现

来看一个 `Person` 类。这里故意使用 `char*`，不用 `std::string`，目的是暴露资源管理问题。

```cpp
#include <cstring>
#include <iostream>
using namespace std;

class Person {
public:
    Person(const char* s) {
        name = new char[strlen(s) + 1];
        strcpy(name, s);
    }

    ~Person() {
        delete[] name;
    }

    void print() const {
        cout << name << endl;
    }

    const char* data() const {
        return name;
    }

private:
    char* name;
};
```

构造时：

```cpp
name = new char[strlen(s) + 1];
strcpy(name, s);
```

含义是：

1. 在 heap 上开一块字符数组；
2. 长度多加 1，用来放字符串结尾的 `'\0'`；
3. 把传入字符串复制进去。

析构时：

```cpp
delete[] name;
```

因为构造时使用的是：

```cpp
new char[...]
```

所以释放时必须使用：

```cpp
delete[]
```

### 默认浅拷贝的问题

如果没有自己写 copy constructor：

```cpp
int main() {
    Person p1("chang");
    Person p2 = p1;

    cout << static_cast<const void*>(p1.data()) << endl;
    cout << static_cast<const void*>(p2.data()) << endl;
}
```

`p2 = p1` 会使用编译器自动生成的 copy constructor。它只做：

```cpp
p2.name = p1.name;
```

于是两个地址相同：

```text
p1.name ----\
             ----> "chang"
p2.name ----/
```

问题有两个：

1. `p1` 和 `p2` 共享同一块 heap 内存；
2. 两个对象析构时都会执行 `delete[] name`。

最终会发生 **double delete**，程序可能崩溃。

这类默认行为称为 **shallow copy（浅拷贝）**。

### 深拷贝的 copy constructor

正确行为应该是：

```text
p1.name ----> "chang"

p2.name ----> "chang"
```

两个对象内容相同，但管理不同内存。

这叫 **deep copy（深拷贝）**。

```cpp
#include <cstring>
#include <iostream>
using namespace std;

class Person {
public:
    Person(const char* s) {
        init(s);
    }

    Person(const Person& other) {
        init(other.name);
    }

    ~Person() {
        delete[] name;
    }

    void print() const {
        cout << name << endl;
    }

    const char* data() const {
        return name;
    }

private:
    void init(const char* s) {
        name = new char[strlen(s) + 1];
        strcpy(name, s);
    }

private:
    char* name;
};

int main() {
    Person p1("chang");
    Person p2 = p1;

    cout << static_cast<const void*>(p1.data()) << endl;
    cout << static_cast<const void*>(p2.data()) << endl;
}
```

此时 `p1.data()` 和 `p2.data()` 的地址不同，析构时各自释放自己的内存，不会互相干扰。

:::TIP
`Person(const Person& other)` 是 `Person` 的成员函数，因此它可以访问 `other.name`。`private` 限制的是类外代码，不限制同一个类的成员函数访问同类对象的私有成员。
:::

---

## Initialization vs. Assignment

### 两种语义

这三行代码语义不同：

```cpp
MyType b;

MyType a = b;  // initialization：创建新对象 a
a = b;         // assignment：a 已经存在，修改 a 的内容
```

第一行：

```cpp
MyType a = b;
```

虽然有等号，但它是 **初始化**，调用 copy constructor。

第二行：

```cpp
a = b;
```

是 **赋值**，调用 copy assignment operator，也就是：

```cpp
a.operator=(b);
```

核心区别：

| 代码 | 语义 | 是否创建新对象 | 调用 |
|---|---|---|---|
| `MyType a = b;` | initialization | 是 | copy constructor |
| `a = b;` | assignment | 否 | `operator=` |

每个对象只会被构造一次、析构一次，但构造完成后可以被赋值很多次。

### 默认生成的 operator=

如果你没有定义 `operator=`，编译器会自动生成一个 copy assignment operator。

形式大致是：

```cpp
T& T::operator=(const T& rhs);
```

默认行为也是 member-wise assignment：

```text
逐个成员赋值
```

对于 class-type member，会调用该成员自己的 `operator=`。

对于普通类型和 pointer，会做普通值赋值。

### raw pointer 下的赋值问题

继续使用 `Person`：

```cpp
Person p1("chang");
Person p2("wang");

p2 = p1;
```

如果使用编译器默认生成的 `operator=`，它大致做：

```cpp
p2.name = p1.name;
```

这会造成两个问题。

第一，`p1.name` 和 `p2.name` 指向同一块内存：

```text
p1.name ----\
             ----> "chang"
p2.name ----/
```

析构时会 double delete。

第二，`p2` 原来管理的 `"wang"` 那块内存丢失：

```text
原来的 p2.name ----> "wang"  // 没有人再保存这个地址
```

这就是 **memory leak（内存泄漏）**。

所以 raw pointer 下，赋值比拷贝构造更复杂：赋值前，左侧对象已经管理着一份资源，必须先处理旧资源。

### 正确的 copy assignment operator

一个基本正确的写法是：

```cpp
#include <cstring>
#include <iostream>
using namespace std;

class Person {
public:
    Person(const char* s) {
        init(s);
    }

    Person(const Person& other) {
        cout << "copy ctor" << endl;
        init(other.name);
    }

    Person& operator=(const Person& rhs) {
        cout << "operator=" << endl;

        if (this != &rhs) {
            delete[] name;     // 先释放自己原来管理的资源
            init(rhs.name);    // 再复制 rhs 管理的内容
        }

        return *this;
    }

    ~Person() {
        delete[] name;
    }

    void print() const {
        cout << name << endl;
    }

    const char* data() const {
        return name;
    }

private:
    void init(const char* s) {
        name = new char[strlen(s) + 1];
        strcpy(name, s);
    }

private:
    char* name;
};

int main() {
    Person p1("chang");
    Person p2("wang");

    p2 = p1;

    p1.print();
    p2.print();

    cout << static_cast<const void*>(p1.data()) << endl;
    cout << static_cast<const void*>(p2.data()) << endl;
}
```

这里的关键步骤：

```cpp
if (this != &rhs) {
    delete[] name;
    init(rhs.name);
}
return *this;
```

含义是：

1. 判断是不是自己给自己赋值；
2. 如果不是，先释放旧资源；
3. 再做深拷贝；
4. 返回 `*this`，让连续赋值可用。

例如：

```cpp
a = b = c;
```

需要 `operator=` 返回左侧对象自身的引用。

### self-assignment

`self-assignment` 指的是：

```cpp
p2 = p2;
```

直接写这种代码很少见，但等价情况可能出现。例如数组或容器中把某个元素赋给另一个元素时，两个引用可能刚好指向同一个对象。

如果没有检查：

```cpp
Person& operator=(const Person& rhs) {
    delete[] name;
    init(rhs.name);
    return *this;
}
```

当执行：

```cpp
p2 = p2;
```

时，`rhs.name` 和 `this->name` 是同一个指针。

执行顺序变成：

1. `delete[] name;` 把自己的字符串释放掉；
2. `rhs.name` 也变成了指向已释放区域的悬空指针；
3. 再用 `rhs.name` 拷贝内容，结果未定义。

所以标准骨架是：

```cpp
T& T::operator=(const T& rhs) {
    if (this != &rhs) {
        // perform assignment
    }
    return *this;
}
```

:::TIP
这里比较的是地址：`this != &rhs`。它判断两个对象是不是同一个对象，而不是判断两个对象的值是否相等。
:::

---

## Rule of Zero 与 Rule of Three

### 用 string 替代 char*

如果把 `Person` 改成：

```cpp
#include <iostream>
#include <string>
using namespace std;

class Person {
public:
    Person(const string& s)
        : name(s) {}

    void print() const {
        cout << name << endl;
    }

private:
    string name;
};
```

此时不需要写：

```cpp
~Person();
Person(const Person&);
Person& operator=(const Person&);
```

原因是：

- `Person` 自己不直接管理 heap 资源；
- `std::string` 已经把资源管理封装好了；
- 编译器自动生成的 member-wise copy / assignment 会调用 `std::string` 自己的正确逻辑。

这就是 **Rule of Zero**：

> 大多数情况下，不要自己写 destructor、copy constructor、copy assignment operator。让成员对象自己管理资源，让编译器生成默认行为。

### 自动生成的三个特殊成员函数

编译器会自动生成三类特殊成员函数：

```cpp
~T();                    // destructor
T(const T&);             // copy constructor
T& operator=(const T&);  // copy assignment operator
```

它们的默认行为都是 member-wise 的：

- 对 class-type member 和 base object，递归调用对应的 destructor / copy constructor / assignment operator；
- 对 `int`、`float`、pointer 等非 class 类型，做普通值操作。

对于 pointer，普通值操作意味着：

```cpp
this->p = other.p;
```

这通常不是资源管理类想要的行为。

### 什么时候需要自己写

判断标准很实用：

> 如果你需要自己写 destructor 来释放资源，通常也需要自己写 copy constructor 和 copy assignment operator。

这就是 **Rule of Three**。

典型资源包括：

- heap memory；
- file handle；
- socket connection；
- lock；
- 其他需要手动 acquire / release 的系统资源。

如果类中只有 `std::string`、`std::vector`、`std::unique_ptr` 这类已经封装好资源管理的成员，通常应优先遵循 Rule of Zero。

:::WARNING
本讲使用 `char*` 是为了展示 copy 的危险。实际 C++ 代码中，表示字符串应优先使用 `std::string`。
:::

---

## Copy constructor 什么时候会被调用

### 初始化

```cpp
Person baby_a("Fred");

Person baby_b = baby_a;  // copy constructor，不是 assignment
Person baby_c(baby_a);   // copy constructor
```

这两行都在创建新对象，所以都是 initialization。

### 传值参数

```cpp
void roster(Person p) {
    p.print();
}

Person child("Ruby");
roster(child);  // child 被 copy 到形参 p
```

`p` 是一个新的局部对象，由 `child` copy 构造出来。

### 按值返回

```cpp
Person captain() {
    Person player("George");
    return player;
}

Person who = captain();
```

返回值是值语义，也可能触发 copy constructor。

但现代编译器常会做 copy elision，所以实际输出可能看不到 copy constructor 被调用。

### copy elision

看一个用于观察 copy 的例子：

```cpp
#include <iostream>
#include <string>
using namespace std;

class Person {
public:
    Person(const string& s)
        : name(s) {
        cout << "Person(const string&): " << name << endl;
    }

    Person(const Person& other)
        : name(other.name) {
        cout << "Person copy ctor: " << name << endl;
    }

    void print() const {
        cout << name << endl;
    }

private:
    string name;
};

Person copy_func(Person p) {
    p.print();
    return p;  // 可能触发 copy，也可能被优化
}

Person nocopy_func(const string& who) {
    return Person(who);  // 常见场景：返回值优化
}

int main() {
    Person p1("Alice");

    cout << "--- copy_func ---" << endl;
    Person p2 = copy_func(p1);

    cout << "--- nocopy_func ---" << endl;
    Person p3 = nocopy_func("Bob");
}
```

编译器可以在安全时消除临时对象和返回值 copy。

如果想观察更多 copy，可以在 g++ 中关闭 copy elision：

```bash
g++ -std=c++17 -fno-elide-constructors main.cpp -o main
./main
```

:::TIP
不要为了“看见 copy”而写低质量代码。实际编程时应写语义清晰的代码，让编译器做它能做的优化；当 profiler 显示 copy 成为瓶颈时，再针对性优化。
:::

---

## Copy 与性能：vector 例子

### push_back 为什么会产生额外 copy

`std::vector` 是动态数组。它有两个概念：

| 概念 | 含义 |
|---|---|
| `size()` | 当前实际元素个数 |
| `capacity()` | 当前已分配空间能容纳多少元素 |

当 `size() == capacity()` 时，再 `push_back` 一个元素就需要扩容。

演示代码如下：

```cpp
#include <iostream>
#include <vector>
using namespace std;

struct Point {
    int x;
    int y;

    Point(int x, int y)
        : x(x), y(y) {
        cout << "Point(" << x << ", " << y << ")" << endl;
    }

    Point(const Point& other)
        : x(other.x), y(other.y) {
        cout << "copy Point("
             << other.x << ", " << other.y << ")" << endl;
    }
};

ostream& operator<<(ostream& out, const Point& p) {
    out << "(" << p.x << ", " << p.y << ")";
    return out;
}

void print_capacity(const vector<Point>& pts) {
    cout << "size = " << pts.size()
         << ", capacity = " << pts.capacity() << endl;
}

int main() {
    vector<Point> pts;
    print_capacity(pts);

    pts.push_back(Point(1, 2));
    print_capacity(pts);

    pts.push_back(Point(3, 4));
    print_capacity(pts);

    pts.push_back(Point(5, 6));
    print_capacity(pts);

    for (const Point& p : pts) {
        cout << p << endl;
    }
}
```

如果一开始 `capacity()` 是 0，常见扩容过程是：

```text
0 -> 1 -> 2 -> 4
```

此时 `push_back` 三个点可能产生 6 次 copy：

| 操作 | 发生的 copy |
|---|---|
| `push_back(Point(1, 2))` | 临时对象 copy 进 vector：1 次 |
| `push_back(Point(3, 4))` | 扩容复制旧元素 1 次 + 新元素 copy 1 次：2 次 |
| `push_back(Point(5, 6))` | 扩容复制旧元素 2 次 + 新元素 copy 1 次：3 次 |

总计：

```text
1 + 2 + 3 = 6
```

这说明 `vector` 的动态扩容很方便，但扩容时搬运已有元素会带来额外开销。

:::WARNING
现代 C++ 中，如果类型有 move constructor，`vector` 扩容时可能移动元素而不是拷贝元素。本讲还没有展开 move semantics，所以这里用 copy constructor 来观察核心机制。
:::

### reserve 减少扩容 copy

如果你提前知道大概需要多少元素，可以使用：

```cpp
pts.reserve(3);
```

完整代码：

```cpp
#include <iostream>
#include <vector>
using namespace std;

struct Point {
    int x;
    int y;

    Point(int x, int y)
        : x(x), y(y) {
        cout << "Point(" << x << ", " << y << ")" << endl;
    }

    Point(const Point& other)
        : x(other.x), y(other.y) {
        cout << "copy Point("
             << other.x << ", " << other.y << ")" << endl;
    }
};

int main() {
    vector<Point> pts;

    pts.reserve(3);  // 预先分配能放 3 个元素的空间

    pts.push_back(Point(1, 2));
    pts.push_back(Point(3, 4));
    pts.push_back(Point(5, 6));
}
```

这样 `push_back` 时不需要经历：

```text
0 -> 1 -> 2 -> 4
```

扩容造成的旧元素搬运被消除。

但仍然会有从临时对象 copy 进 vector 的 3 次 copy。

### emplace_back 原地构造

`emplace_back` 的优势是：可以把构造函数参数直接传给容器，让对象在 vector 内部原地构造。

错误理解是：

```cpp
pts.emplace_back(Point(1, 2));  // 仍然先构造临时对象
```

更好的写法是：

```cpp
pts.emplace_back(1, 2);  // 直接把 Point 构造参数传进去
```

完整代码：

```cpp
#include <iostream>
#include <vector>
using namespace std;

struct Point {
    int x;
    int y;

    Point(int x, int y)
        : x(x), y(y) {
        cout << "Point(" << x << ", " << y << ")" << endl;
    }

    Point(const Point& other)
        : x(other.x), y(other.y) {
        cout << "copy Point("
             << other.x << ", " << other.y << ")" << endl;
    }
};

int main() {
    vector<Point> pts;

    pts.reserve(3);

    pts.emplace_back(1, 2);
    pts.emplace_back(3, 4);
    pts.emplace_back(5, 6);
}
```

在这个版本中：

- `reserve(3)` 避免扩容复制旧元素；
- `emplace_back(1, 2)` 避免先构造临时对象再 copy 进去；
- 三个 `Point` 直接构造在 `vector` 内部。

这正是性能优化点：

```text
已知规模时先 reserve
需要原地构造时用 emplace_back，并传构造参数
```

---

## 禁止 copy

有些类型不应该被 copy。

例如后面会学到的 `std::unique_ptr`，它表达的是独占所有权。如果允许 copy，两个对象就会同时认为自己拥有同一份资源，语义会被破坏。

C++11 以后，可以用 `= delete` 禁止 copy：

```cpp
class Person {
public:
    Person(const char* s);

    Person(const Person& rhs) = delete;
    Person& operator=(const Person& rhs) = delete;
};
```

这样用户写：

```cpp
Person p1("Alice");
Person p2 = p1;  // 编译错误
p1 = p2;         // 编译错误
```

会直接被编译器拒绝。

C++11 以前的做法是：

```cpp
class Person {
private:
    Person(const Person& rhs);
    Person& operator=(const Person& rhs);
};
```

只声明为 `private`，不提供函数体，使类外代码无法调用 copy 行为。

:::TIP
如果某种操作在语义上不应该发生，最好在编译期禁止它，而不是等运行期出 bug。
:::

---
