---
title: Memory Model
published: 2026-03-26
description: Memory model、storage duration、linkage、dynamic memory、pointer、reference、const
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

- C++ 程序运行时的几块典型内存区域：代码/数据区、栈、堆
- 不同变量分别放在哪里：global、static、参数、局部变量、动态分配对象
- 编译单元、`extern`、`static` 与 linkage 的关系
- 为什么 C++ 需要 `new/delete`，以及它和 `malloc/free` 的根本区别
- 指针与引用的语义、常见写法与易错点
- `const` 的核心规则，尤其是指针、引用、参数中的 `const`

## 目录

- [概述](#概述)
- [目录](#目录)
- [Memory Model：程序运行时的几块区域](#memory-model程序运行时的几块区域)
  - [不同变量通常放在哪里](#不同变量通常放在哪里)
  - [局部变量：automatic storage duration](#局部变量automatic-storage-duration)
  - [全局变量与静态变量：persistent storage](#全局变量与静态变量persistent-storage)
- [编译单元、声明、定义与 linkage](#编译单元声明定义与-linkage)
  - [什么是编译单元](#什么是编译单元)
  - [全局变量/函数：definition 与 declaration](#全局变量函数definition-与-declaration)
  - [`extern`](#extern)
  - [`static`：两种常见含义](#static两种常见含义)
    - [文件作用域的 `static`](#文件作用域的-static)
    - [局部 `static`](#局部-static)
- [Singleton Pattern：受控的全局唯一对象](#singleton-pattern受控的全局唯一对象)
- [Dynamic Memory Allocation](#dynamic-memory-allocation)
  - [为什么需要动态内存](#为什么需要动态内存)
  - [`new/delete` 与 `malloc/free` 的区别](#newdelete-与-mallocfree-的区别)
    - [`malloc/free`](#mallocfree)
    - [`new/delete`](#newdelete)
  - [数组版本：`new[]` 与 `delete[]`](#数组版本new-与-delete)
  - [动态内存的几个基本原则](#动态内存的几个基本原则)
- [Pointer：地址、值、解引用](#pointer地址值解引用)
  - [指针变量本身也有地址](#指针变量本身也有地址)
  - [`p`、`*p`、`&p`、`&x`](#pppx)
  - [常见用途](#常见用途)
  - [基本操作符：`&`、`*`、`->`](#基本操作符-)
- [Reference：更干净的间接访问](#reference更干净的间接访问)
  - [引用的本质](#引用的本质)
  - [引用与指针的关键区别](#引用与指针的关键区别)
    - [引用必须初始化](#引用必须初始化)
    - [引用不能重新绑定](#引用不能重新绑定)
    - [引用不能是 null](#引用不能是-null)
    - [引用常用于更干净的参数传递](#引用常用于更干净的参数传递)
  - [生命周期问题](#生命周期问题)
  - [引用的限制](#引用的限制)
- [Constant / const](#constant--const)
  - [`const` 的基本含义](#const-的基本含义)
  - [非局部 `const` 的一个特点](#非局部-const-的一个特点)
  - [编译期常量与运行期常量](#编译期常量与运行期常量)
  - [指针里的 `const`：谁不能改](#指针里的-const谁不能改)
    - [`int * const p`](#int--const-p)
    - [`const int *p`](#const-int-p)
  - [交叉绑定规则](#交叉绑定规则)
  - [字符串字面量](#字符串字面量)
  - [大对象参数为什么常写成 `const T&`](#大对象参数为什么常写成-const-t)

---

## Memory Model：程序运行时的几块区域

一个 C++ 程序运行时，通常可以粗略分成下面几块区域：

1. **代码区（text/code segment）**：放函数机器指令，以及一部分只读数据。
2. **全局/静态区（data segment / bss segment）**：放全局变量、静态变量。
3. **栈（stack）**：放函数调用过程中产生的局部变量、参数等。
4. **堆（heap）**：放运行时动态申请出来的对象，也就是 `new` / `malloc` 得到的内存。

最重要的不是死记地址大小规律，而是先分清：

> 一个对象到底属于哪种 **storage duration（存储期）**，它通常就在哪类区域里。

### 不同变量通常放在哪里

先看经典例子：

```cpp
int i;          // global vars.
static int j;   // static global vars.

void f(int x)   // function params.
{
    int k;                              // local vars.
    static int l;                       // static local vars.
    int *p = malloc(sizeof(int));       // allocated vars.
}
```

可以对应成：

- `i`：全局变量，通常在**全局/静态区**
- `j`：静态全局变量，也在**全局/静态区**
- `x`：函数参数，通常在**栈**
- `k`：局部变量，通常在**栈**
- `l`：静态局部变量，在**全局/静态区**
- `p`：指针变量本身通常在**栈**，但 `malloc` 出来的那块匿名内存在**堆**

> **指针变量本身放在哪，和它所指向的对象放在哪，是两回事。**

**Example**

```cpp
#include <iostream>
using namespace std;

int g = 100;          // 全局变量
static int sg = 200;  // 静态全局变量

int main() {
    int x = 10;             // 局部变量
    static int sx = 20;     // 静态局部变量
    int* p = &x;            // 局部指针变量
    int* q = new int(30);   // q 本身在栈，*q 在堆

    cout << "&g  = " << &g << endl;
    cout << "&sg = " << &sg << endl;
    cout << "&x  = " << &x << endl;
    cout << "&sx = " << &sx << endl;
    cout << "&p  = " << &p << endl;
    cout << "p   = " << p << endl;
    cout << "&q  = " << &q << endl;
    cout << "q   = " << q << endl;

    delete q;
}
```

这段代码里：

- `g`：全局/静态区
- `sg`：全局/静态区
- `x`：栈
- `sx`：全局/静态区
- `p`：栈
- `q`：栈
- `new int(30)` 创建出来的那个整数：堆

可以画成：

```text
全局/静态区
+------------------+
| g   = 100        |
| sg  = 200        |
| sx  = 20         |
+------------------+

堆
+------------------+
| *q = 30          |
+------------------+

栈
+------------------+
| q  = 0x5000      |   // q 的值：堆对象地址
| p  = 0x7ffe100   |   // p 的值：x 的地址
| x  = 10          |
+------------------+
```

### 局部变量：automatic storage duration

局部变量最核心的性质是 **automatic storage duration（自动存储期）**。

```cpp
int foo(int x) {
    int a = x * x;
    int b = 3 * x;
    int c = 5;
    return a + b + c;
}
```

它们的生命周期是：

- 函数被调用时创建
- 函数返回时销毁

所以局部变量记录的是：

> **某一次函数调用的现场状态。**

这也是为什么递归函数可以有很多层“自己的局部变量”，因为每一层调用都有自己的栈帧。

### 全局变量与静态变量：persistent storage

定义在函数外部的变量，以及用 `static` 声明出来的静态变量，具有更长的生命周期。它们通常在程序开始时就存在，到程序结束时才销毁。

因此可以把它们先记成：

> **persistent storage：状态可以在整个程序运行期间持续保存。**

---

## 编译单元、声明、定义与 linkage

### 什么是编译单元

一个 `.cpp` 文件连同它 `#include` 展开的头文件内容，构成一个 **translation unit（编译单元）**。

所以如果工程里有：

- `a.cpp`
- `b.cpp`
- `main.cpp`

那通常就有三个编译单元。它们会：

1. 先分别编译
2. 再由链接器把它们拼起来

因此“跨编译单元共享”这个说法，基本就可以先理解成：

> **跨 `.cpp` 文件共享。**

### 全局变量/函数：definition 与 declaration

**Example**

```cpp
// a.cpp
int global_x = 3;      // variable definition
int global_f(int) {    // function definition
    /* ... */
}
```

这里：

- `int global_x = 3;` 是**定义（definition）**
- `int global_f(int) { ... }` 是**定义（definition）**

定义的意思是：

> 真正创建了这个实体。

而下面是另一个文件里的写法：

```cpp
// b.cpp
extern int global_x;   // variable declaration
int global_f(int);     // function declaration
```

它们是**声明（declaration）**。

声明的作用是：

> 告诉当前编译单元：有这么个名字、这么个类型/签名，真正的定义在别处。

### `extern`

`extern` 最典型的用途就是：

> 在当前文件里声明一个全局变量，它的定义在别的源文件中。

最常见的工程写法是：

`globals.h`

```cpp
#ifndef GLOBALS_H
#define GLOBALS_H

extern int global_x;

#endif
```

`globals.cpp`

```cpp
#include "globals.h"

int global_x = 100;
```

`main.cpp`

```cpp
#include <iostream>
#include "globals.h"

int main() {
    std::cout << global_x << std::endl;
    global_x++;
    std::cout << global_x << std::endl;
}
```

这样做的好处是：

- 需要用 `global_x` 的文件都只需要包含头文件
- 真正的定义只在一个地方出现
- 不容易出现重复定义

同理，函数也可以这样：

```cpp
// a.cpp
extern double pi();

// b.cpp
double pi() { return 3.14159; }
```

前者是函数声明，后者是函数定义。

:::WARNING
同一个具有 external linkage 的名字，不能在多个 `.cpp` 里重复定义，否则通常会在链接阶段报错。
:::

### `static`：两种常见含义

#### 文件作用域的 `static`

```cpp
// a.cpp - x and f can only be used in this src file
static int x;
static int f(int);
```

这里的 `static` 的含义是：

- 这个名字只能在当前编译单元里被使用
- 它具有 **internal linkage（内部链接）**

可以先近似理解成：

> **这个全局变量/自由函数只能在这个 `.cpp` 文件里用。**

- 普通全局变量默认更像“公开名字”
- `static` 全局变量更像“本文件私有名字”

#### 局部 `static`

```cpp
void foo(int i) {
    static int x = 0;
    if (i > 0) ++x;
}
```

这里的 `static` 不再强调“只能本文件可见”，而是强调：

- `x` 的作用域仍然在函数内
- 但它的生命周期贯穿整个程序运行期
- 它会在多次函数调用之间保留状态

> declaring a local variable static: keeps its state between multiple visits to its function

- **restricted access scope**
- **persistent storage**

:::TIP
**头文件里写 `static` 会发生什么?**

如果在头文件里写：

```cpp
static int x = 10;
```

然后多个 `.cpp` 都 `#include` 这个头文件，那么结果通常不是“全工程共享一个 x”，而是：

> **每个包含该头文件的编译单元，各自得到一份独立的 `x`。**

原因在于：

- 头文件本质上是文本展开
- `static` 又赋予它 internal linkage
- 所以每个编译单元都有自己私有的一份定义

这通常不适合做“跨文件共享变量”，因为它们看起来名字一样，但根本不是同一个对象。
:::

---

## Singleton Pattern：受控的全局唯一对象

> 全局状态并不是完全不用，但更推荐用“受控的唯一实例”，而不是随意暴露全局变量。

**Example**

```cpp
struct singleton {
    static singleton& instance()
    {
        static singleton s;
        return s;
    }

    singleton(const singleton&) = delete;
    singleton& operator=(const singleton&) = delete;

private:
    singleton() {}
    ~singleton() {}
};
```

这个写法体现了单例模式的几个核心点：

1. **构造函数私有**：外部不能随便构造对象
2. **拷贝/赋值删除**：防止复制出第二个实例
3. **通过 `instance()` 提供访问入口**
4. **函数内 `static` 局部对象保证只初始化一次**

它相比直接写全局变量有两个常见优点：

- **does not pollute the global namespace**：不会把名字直接扔进全局命名空间
- **permits lazy initialization**：第一次真正用到时才创建对象

所以单例模式可以理解成：

> **一种更受控的“全局唯一对象”。**

但也要注意：它本质上仍然是一种全局状态管理手段，不能滥用。

---

## Dynamic Memory Allocation

### 为什么需要动态内存

有些对象在编译时无法确定大小，或者生命周期不适合跟随当前函数作用域，此时就需要在运行时动态申请内存。

例如：

- 数组长度运行时才知道
- 对象需要跨越当前函数继续存在
- 需要构造数量不固定的节点、树、图等结构

这时就会用到 **dynamic storage duration（动态存储期）**。

### `new/delete` 与 `malloc/free` 的区别

**Example**

```cpp
malloc(sizeof(int));
new int;
```

```cpp
int *p1 = (int*)malloc(sizeof(int));
int *p2 = new int;

free(p1);
delete p2;
```

两套机制都能“拿到堆上的一块内存”，但它们关注的层次不同。

#### `malloc/free`

更像是在做：

- 申请一块原始内存
- 归还一块原始内存

它们不知道“对象的构造与析构”。

#### `new/delete`

更像是在做：

- 创建对象
- 销毁对象

> **`malloc/free` 管理的是原始内存；`new/delete` 管理的是对象生命周期。**

特别是当类型有构造函数/析构函数时，`new/delete` 会自动触发正确的构造与析构，而 `malloc/free` 不会。

### 数组版本：`new[]` 与 `delete[]`

```cpp
p = new T;       // allocate a single object
p = new T[10];   // allocate an array

delete p;        // free a single object
delete[] p;      // free an array
```

这里最重要的是：

- `new` 对应 `delete`
- `new[]` 对应 `delete[]`

不能混用。

**Example**

```cpp
Student *q = new Student();
Student *r = new Student[10];

delete q;
delete r;      // only one Student is destructed
// 正确应为 delete[] r;
```

对于类对象数组，`delete[]` 的意义尤其重要，因为它要对数组中每个元素正确调用析构函数。

:::TIP
**关于 `delete[]` 前的隐藏信息**

```cpp
A *pa = new A[size];
size_t *pc = (size_t*) pa;
```

很多实现为了让 `delete[]` 知道要析构多少个对象，会在返回给用户的数组首地址前面偷偷存一点“隐藏信息”。

比如元素个数，也就是常说的 **array cookie**。
如果查看 `pc - 1`，本质上是在“往前看一格，看看前面是不是藏了 size”。

是很多实现中的常见做法，不是你在业务代码里应该依赖的标准接口。
:::

这也就解释了
- 为什么 `delete[]` 和 `delete` 不一样
- 为什么数组释放必须使用 `delete[]`

### 动态内存的几个基本原则

1. **Never mix-use `new/delete` and `malloc/free`**
2. **Never forget to delete**
3. **Never delete the same memory twice**
4. **delete a null pointer is safe**
5. **Never mix-use `new/delete` and `new[]/delete[]`**

- 用 `new` 申请的，必须用 `delete` 还
- 用 `new[]` 申请的，必须用 `delete[]` 还
- 用 `malloc` 申请的，必须用 `free` 还
- 只申请不释放，会导致 **memory leak（内存泄漏）**
- 重复释放同一块内存，会导致未定义行为

---

## Pointer：地址、值、解引用

### 指针变量本身也有地址

> 指针能绑定任意合法地址：全局对象地址、局部对象地址、动态分配对象地址。

```cpp
int g_x = 100;
void f() {
    int l_x = 10;
    int *p = nullptr;
    p = &g_x;           // global
    p = &l_x;           // local
    p = new int[1024];  // dynamic
}
```

- `p` 是一个变量
- 它自己也占内存
- 它自己也有地址

### `p`、`*p`、`&p`、`&x`

这是指针部分最容易混淆的地方。

```cpp
int x = 10;
int* p = &x;
```

这里：

- `x`：对象本身，值是 `10`
- `&x`：`x` 的地址
- `p`：指针变量，里面存的是 `&x`
- `*p`：对 `p` 解引用，得到它指向的对象，也就是 `x`
- `&p`：指针变量 `p` 自己的地址

所以：

```text
x   = 10
&x  = x 的地址
p   = &x
*p  = 10
&p  = p 的地址
```

### 常见用途

```cpp
Node *p1 = new Node;                // 访问匿名动态对象
void print(const Student* p);       // 轻量级间接访问
void swap(int *p1, int *p2);        // 外部参数，允许函数修改外部对象
```

1. **管理动态内存**
2. **间接访问对象，避免拷贝大对象**
3. **让函数有能力修改外部对象**

### 基本操作符：`&`、`*`、`->`


```cpp
ps = &s;          // bind an address
(*ps).length();   // dereference then call member
ps->length();     // 等价写法
```

也就是说：

- `&`：取地址
- `*`：解引用
- `->`：通过指针访问成员，等价于 `(*p).member`

`->` 本质上只是把“先解引用、再取成员”这个常见组合写得更紧凑。

---

## Reference：更干净的间接访问

### 引用的本质

> Reference is a new data type in C++: an alias to an already-existing object.

也就是：

> **引用不是新的对象，而是已有对象的别名（alias）。**

```cpp
char c;
char* p = &c;   // 指针
char& r = c;    // 引用
```

### 引用与指针的关键区别

#### 引用必须初始化

```cpp
int x = 3;
int& y = x;
```

引用一创建就必须绑定到某个对象上，不能先空着。

#### 引用不能重新绑定

```cpp
int x, y;
int *p = &x;
p = &y;     // 指针可以改绑

int &r = x;
r = y;      // 不是改绑，而是把 y 的值赋给 x
```

- 指针更像“装地址的变量”
- 引用更像“对象的另一个名字”

#### 引用不能是 null


**Pointers**

- independent of the bound object
- can be uninitialized
- can be rebound
- can be set to null

**References**

- dependent on the bound object
- just an alias
- must be initialized
- can't be rebound
- can't be null

#### 引用常用于更干净的参数传递

```cpp
int swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}
```

相比指针版：

```cpp
void swap(int *p1, int *p2);
```

引用版通常更简洁、更自然，因为调用时不需要手动写取地址。

### 生命周期问题

```cpp
int* foo() {
    int a;
    return &a;
}

int& bar() {
    int a;
    return a;
}
```

这两种写法都错在同一个根源上：

> 返回了对局部变量的地址/引用。

局部变量在函数返回后就已经销毁，因此：

- `foo()` 返回的是悬空指针
- `bar()` 返回的是悬空引用

这也说明：

> **引用虽然看起来更“安全”，但它同样受绑定对象生命周期的约束。**

### 引用的限制

1. **non-const reference has to bind an lvalue**

```cpp
void func(int &x);
func(i);      // OK
func(i * 3);  // Error
```

也就是说，非常量左值引用必须绑定到一个真正“有名字、可持续存在”的对象上。

2. **No reference to reference**
3. **No pointer to reference**，但可以有 **reference to pointer**

```cpp
int&* p;        // illegal
void f(int*& p); // ok
```

4. **No arrays of references**

这些限制的本质都在强调：

> 引用不是一个可自由操作、可嵌套储存的“普通对象”，它更像一种语言层面的别名机制。

---

## Constant / const

### `const` 的基本含义

> `const` is a type qualifier.

也就是：

> **`const` 不是单独的数据类型，而是一种类型限定。**

它表示：

> 这个对象在初始化之后，不能通过当前名字被修改。

```cpp
const int x = 123;
// x = 27;   // illegal
// x++;      // illegal

int y = x;      // ok
const int z = y; // ok
```

> `const` 的核心不是“宇宙中绝对不可改”，而是“不能通过这个 `const` 视角去改”。

### 非局部 `const` 的一个特点

> Non-local constants: internal linkage by default

也就是：

```cpp
// foo.h
const int MY_CONSTANT = 42;
```

如果它被多个 `.cpp` 包含，通常不会像普通全局变量那样直接导致链接冲突。

这也是为什么 C++ 里的非局部 `const` 和普通全局变量的 linkage 行为不完全一样。

### 编译期常量与运行期常量

**Contrast**

```cpp
const int size1 = 12;
int finalGrade[size1];   // ok

int x;
cin >> x;
const int size2 = x;
double classAverage[size2]; // error, but ok in C99
```

这里说明：

- `size1` 是编译期就能确定的常量
- `size2` 虽然是 `const`，但它的值依赖运行期输入

所以：

> `const` 不自动等于“编译期常量”。

这和以后会学到的 `constexpr` 是不同概念。

### 指针里的 `const`：谁不能改

#### `int * const p`

```cpp
int a[] = {53, 54, 55};
int * const p = a;
```

意思是：

- `p` 自己是 const
- 也就是指针本身不能改指向
- 但 `*p` 指向的内容可以改

```cpp
*p = 20;  // OK
// p++;   // ERROR
```

#### `const int *p`

```cpp
const int *p = a;
```

意思是：

- `*p` 是 const
- 不能通过 `p` 修改它指向的内容
- 但 `p` 自己可以改指向

```cpp
// *p = 20; // ERROR
p++;        // OK
```

> **`const` 修谁，谁就不能通过当前名字被改。**

所以：

- `const int *p`：`*p` 不能改
- `int * const p`：`p` 不能改
- `const int * const p`：两者都不能改

### 交叉绑定规则


```cpp
int i = 10;
const int ci = 3;
int* ip;
const int* cip;

ip = &i;     // ok
cip = &ci;   // ok
ip = &ci;    // No!
cip = &i;    // ok
```

为什么 `ip = &ci` 不行？

因为：

- `ip` 是 `int*`
- 通过它可以修改所指对象
- 但 `ci` 是 const 对象

如果允许这句成立，就相当于能绕过 const 保护。

而 `cip = &i` 可以，因为：

- 原来 `i` 可改
- 现在只是承诺“我通过这个指针不去改它”

所以：

> **从 non-const 绑到 const 视角是安全收紧；反过来是不安全放宽。**

### 字符串字面量

```cpp
char* s = "Hello, world!";
char a[] = "Hello, world!";
```

1. 字符串字面量通常放在**代码/只读数据区**
2. 所以 `s` 更合理的类型应该是：

```cpp
const char* s = "Hello, world!";
```

3. 而 `char a[] = "Hello, world!";` 则是在数组里存了一份副本

这两句看起来都和字符串有关，但语义不同：

- 指针版更像“指向字面量所在位置”
- 数组版更像“把内容复制到自己的数组里”

### 大对象参数为什么常写成 `const T&`

> Passing LARGE objects by pointers or references
> Pass-by-value is expensive
> Add const to read-only parameters

这正是现代 C++ 里最常见的参数设计之一：

```cpp
void print(const std::string& s);
```

它同时满足三件事：

1. **不拷贝大对象**，避免额外开销
2. **只读访问**，防止函数内部误改参数
3. **语义清晰**，调用者一看就知道这是“只读借用”

---
