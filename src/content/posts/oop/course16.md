---
title: Miscellaneous Topics
published: 2026-06-11
description: Named casts、multiple inheritance、virtual base class、namespace、final exam scope
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

本节课是 **Miscellaneous Topics**，主要补充 C++ 中几个容易在实际编程中出错的主题：

- **Named casts**：用 `static_cast`、`dynamic_cast`、`reinterpret_cast`、`const_cast` 替代 C-style cast，使类型转换的语义更明确；
- **Multiple inheritance**：多重继承会带来数据布局、重复基类、二义性和构造顺序等问题；
- **Virtual base classes**：用虚基类解决 diamond inheritance 中重复基类的问题，但会引入运行时和空间开销；
- **Protocol / Interface classes**：多重继承较安全的使用场景；
- **Namespaces**：用命名空间组织名字，避免全局命名冲突；
## 目录

- [概述](#概述)
- [目录](#目录)
- [Named casts](#named-casts)
  - [C-style cast 的问题](#c-style-cast-的问题)
  - [`static_cast`](#static_cast)
  - [`reinterpret_cast`](#reinterpret_cast)
  - [`const_cast`](#const_cast)
  - [`static_cast` 和 `dynamic_cast` 的区别](#static_cast-和-dynamic_cast-的区别)
    - [`static_cast`：编译期检查继承关系，不检查真实对象类型](#static_cast编译期检查继承关系不检查真实对象类型)
    - [`dynamic_cast`：运行时检查真实对象类型](#dynamic_cast运行时检查真实对象类型)
  - [演示 1：`static_cast` 与对象二进制表示](#演示-1static_cast-与对象二进制表示)
  - [演示 2：`dynamic_cast` 的运行时检查](#演示-2dynamic_cast-的运行时检查)
  - [演示 3：`reinterpret_cast` 的危险性](#演示-3reinterpret_cast-的危险性)
- [Multiple inheritance](#multiple-inheritance)
  - [基本形式：mix and match](#基本形式mix-and-match)
  - [多重继承的数据布局](#多重继承的数据布局)
  - [Vanilla MI：重复基类](#vanilla-mi重复基类)
  - [重复基类带来的二义性](#重复基类带来的二义性)
  - [Protocol / Interface classes](#protocol--interface-classes)
  - [Virtual base classes](#virtual-base-classes)
  - [多重继承的复杂性](#多重继承的复杂性)
- [Namespaces](#namespaces)
  - [为什么需要 namespace](#为什么需要-namespace)
  - [定义 namespace](#定义-namespace)
  - [在头文件中放 namespace 声明](#在头文件中放-namespace-声明)
  - [实现 namespace 中的函数](#实现-namespace-中的函数)
  - [使用 namespace 中的名字](#使用-namespace-中的名字)
  - [`using` declaration](#using-declaration)
  - [`using` directive](#using-directive)
  - [命名空间二义性](#命名空间二义性)
  - [Namespace aliases](#namespace-aliases)
  - [Namespace composition](#namespace-composition)
  - [Namespace selection](#namespace-selection)
  - [Namespaces are open](#namespaces-are-open)

---

## Named casts

### C-style cast 的问题

C-style cast 写法如下：

```cpp
(type) expression
```

例如：

```cpp
a = (int)d;
```

它的问题主要有两个：

1. **语义不明确**：同一个 `(T)x` 可能表示普通数值转换、去除 `const`、父子类转换、甚至强行按另一种类型解释内存；
2. **不利于搜索和审查**：项目中很难快速区分哪些地方做了危险转换。

C++ 更推荐使用 **named cast**：

```cpp
static_cast<T>(expr)
dynamic_cast<T>(expr)
reinterpret_cast<T>(expr)
const_cast<T>(expr)
```

这四种转换把不同语义拆开，读代码时能直接看出程序员的意图。

:::TIP
如果必须做类型转换，优先使用 named cast。它不一定让转换安全，但能让转换的风险更明确。
:::

### `static_cast`

`static_cast` 用于相对正常、编译器可检查的类型转换。

典型用途：

- 数值类型转换；
- 指针或引用在继承体系中的上行转换、下行转换；
- `void*` 和具体类型指针之间的转换；
- 明确调用某些用户自定义转换。

例如：

```cpp
double d = 7.1;
int a;

a = d;                    // implicit conversion
a = (int)d;               // C-style explicit conversion
a = static_cast<int>(d);  // exact meaning
```

`static_cast<int>(d)` 表示把 `double` 的值转换成 `int` 值。小数部分会被截断，所以 `7.1` 转成 `7`。

`static_cast` 的特点：

- 转换语义比较常规；
- 编译器会检查目标类型和源类型之间是否存在合理关系；
- 不做运行时类型检查。

### `reinterpret_cast`

`reinterpret_cast` 用于低层次的重新解释。

例如：

```cpp
int a = 7;
double* p;

p = (double*)&a;                       // ok, but a is not a double
p = static_cast<double*>(&a);          // error
p = reinterpret_cast<double*>(&a);     // ok: I really mean it
```

这里 `a` 本质上仍然是一个 `int` 对象。`reinterpret_cast<double*>(&a)` 只是把 `int*` 的地址强行解释成 `double*`。

:::WARNING
`reinterpret_cast` 通常只改变“如何看待这段地址”，不会改变对象本身。把一段 `int` 内存当作 `double` 读写通常会造成 undefined behavior。它适用于非常底层的场景，例如查看对象的字节表示、和硬件/系统接口交互、序列化等。
:::

### `const_cast`

`const_cast` 用于添加或移除 `const` / `volatile` 属性。

例如：

```cpp
int i = 7;
const int c = i;
int* q;

q = &c;                         // error
q = (int*)&c;                   // ok, but is *q = 2 really allowed?
q = static_cast<int*>(&c);      // error
q = const_cast<int*>(&c);       // I really mean it
```

`const_cast<int*>(&c)` 表示程序员明确要去掉 `const` 限定。

但需要区分两种情况：

```cpp
int x = 7;
const int* p = &x;
int* q = const_cast<int*>(p);
*q = 8;     // OK，原对象 x 本来不是 const
```

```cpp
const int x = 7;
const int* p = &x;
int* q = const_cast<int*>(p);
*q = 8;     // Undefined behavior，原对象本来就是 const
```

`const_cast` 只能改变表达式的类型限定，不能改变对象本身是否真的可修改。

### `static_cast` 和 `dynamic_cast` 的区别

考虑继承体系：

```cpp
struct A {
    virtual void f() {}
};

struct B : public A {};
struct C : public A {};
```

如果有：

```cpp
A* pa = new B;
```

则 `pa` 的静态类型是 `A*`，但它实际指向的动态对象是 `B`。

#### `static_cast`：编译期检查继承关系，不检查真实对象类型

```cpp
C* pc = static_cast<C*>(pa);  // compiles, but *pa is B
```

这段代码能通过编译，因为 `C` 确实是 `A` 的派生类，`A* -> C*` 在类型层面存在下行转换关系。

但运行时 `pa` 实际指向的是 `B`，不是 `C`。因此得到的 `pc` 不是一个真正指向 `C` 对象的指针，继续解引用会产生严重问题。

#### `dynamic_cast`：运行时检查真实对象类型

```cpp
C* pc = dynamic_cast<C*>(pa);  // returns nullptr
```

`dynamic_cast` 会检查 `pa` 实际指向的对象是否真的是 `C` 或 `C` 的派生类。

- 如果转换成功，返回有效指针；
- 如果指针转换失败，返回 `nullptr`；
- 如果引用转换失败，抛出 `std::bad_cast`；
- 源类型必须是 **polymorphic type（多态类型）**，也就是类中至少有一个虚函数。

如果 `A` 没有虚函数：

```cpp
struct A {
    // virtual void f() {}
};
```

则：

```cpp
C* pc = dynamic_cast<C*>(pa);  // Error: A is not polymorphic
```

原因是 `dynamic_cast` 需要运行时类型信息 RTTI，而 RTTI 通常依赖多态类型的虚函数机制。

### 演示 1：`static_cast` 与对象二进制表示

`double` 转 `int`，再用 `reinterpret_cast` 查看对象在内存中的字节表示。

```cpp
#include <cstddef>
#include <iomanip>
#include <iostream>
using namespace std;

int main()
{
    double d = 7.0;
    int i = static_cast<int>(d);

    cout << "double value: " << d << "\n";
    cout << "int value: " << i << "\n";

    cout << "Binary data of double (hex): ";
    byte* double_bytes = reinterpret_cast<byte*>(&d);
    for (int j = 0; j < sizeof(d); ++j) {
        cout << hex << setw(2) << setfill('0')
             << static_cast<int>(double_bytes[j]) << " ";
    }
    cout << "\n";

    cout << "Binary data of int (hex): ";
    byte* int_bytes = reinterpret_cast<byte*>(&i);
    for (int j = 0; j < sizeof(i); ++j) {
        cout << hex << setw(2) << setfill('0')
             << static_cast<int>(int_bytes[j]) << " ";
    }
    cout << "\n";
}
```

编译时使用：

```bash
g++ main.cpp -std=c++20
```

因为 `std::byte` 在较新的 C++ 标准中提供。如果不指定标准，可能出现类似错误：

```text
error: unknown type name 'byte'
```

一次运行结果类似：

```text
double value: 7
int value: 7
Binary data of double (hex): 00 00 00 00 00 00 1c 40
Binary data of int (hex): 07 00 00 00
```

这段代码说明：

- `static_cast<int>(d)` 会产生一个新的 `int` 值，数值是 `7`；
- `d` 的对象表示仍然是 IEEE 754 `double` 的字节表示；
- `i` 的对象表示是整数 `7` 的字节表示；
- 输出顺序是低地址到高地址，所以在小端机器上 `int 7` 显示为 `07 00 00 00`。

:::TIP
`static_cast<int>(d)` 是值转换；`reinterpret_cast<byte*>(&d)` 是把对象地址当作字节序列查看。二者语义完全不同。
:::

### 演示 2：`dynamic_cast` 的运行时检查

一个不带虚函数的版本：

```cpp
#include <iostream>
using namespace std;

class A {};
class B : public A {};
class C : public A {};

int main()
{
    A* pa = new B;
    C* pc = pa;  // error
}
```

这会报错，因为不能把 `A*` 直接赋值给 `C*`：

```text
error: cannot initialize a variable of type 'C *' with an lvalue of type 'A *'
```

改成 `static_cast` 后可以通过编译：

```cpp
#include <iostream>
using namespace std;

class A {};
class B : public A {};
class C : public A {};

int main()
{
    A* pa = new B;
    C* pc = static_cast<C*>(pa);

    cout << pc << endl;
}
```

这段程序会打印一个地址，但这个地址并不代表它真的指向一个 `C` 对象。`pa` 实际指向的是 `B`。

接着改成 `dynamic_cast`：

```cpp
#include <iostream>
using namespace std;

class A {};
class B : public A {};
class C : public A {};

int main()
{
    A* pa = new B;
    C* pc = dynamic_cast<C*>(pa);

    cout << pc << endl;
}
```

此时会报错：

```text
error: 'A' is not polymorphic
```

原因是 `A` 没有虚函数，不是多态类型。加上虚函数后，`dynamic_cast` 才能使用运行时类型信息：

```cpp
#include <iostream>
using namespace std;

class A {
public:
    virtual void foo() {}
};

class B : public A {};
class C : public A {};

int main()
{
    A* pa = new B;

    // C* pc = static_cast<C*>(pa);  // compiles, but unsafe
    C* pc = dynamic_cast<C*>(pa);
    cout << pc << endl;              // prints 0 / nullptr

    B* pb = dynamic_cast<B*>(pa);
    cout << pb << endl;              // prints a valid address
}
```

运行结果类似：

```text
0
0x1053099e0
```

含义：

- `pa` 实际指向 `B`；
- 转成 `C*` 失败，`dynamic_cast<C*>(pa)` 返回 `nullptr`；
- 转成 `B*` 成功，`dynamic_cast<B*>(pa)` 返回有效地址。

:::WARNING
`dynamic_cast` 只能检查多态类型。只要类中有至少一个虚函数，它就是 polymorphic type。实际工程中，如果要通过基类指针删除派生类对象，基类通常还应该提供 `virtual ~A() = default;`。
:::

### 演示 3：`reinterpret_cast` 的危险性

老师最后演示了完全无继承关系的类型转换。

```cpp
#include <iostream>
using namespace std;

class A {};
class B : public A {};
class C : public A {};
class D {};

int main()
{
    A* pa = new B;

    D* pd = static_cast<D*>(pa);  // error
    cout << pd << endl;
}
```

`D` 和 `A` 没有任何继承关系，所以 `static_cast` 会被编译器拒绝：

```text
error: static_cast from 'A *' to 'D *', which are not related by inheritance, is not allowed
```

如果强行使用 `reinterpret_cast`：

```cpp
#include <iostream>
using namespace std;

class A {};
class B : public A {};
class C : public A {};
class D {};

int main()
{
    A* pa = new B;

    // D* pd = static_cast<D*>(pa);  // error: A and D are unrelated
    D* pd = reinterpret_cast<D*>(pa);

    cout << pd << endl;
}
```

这段代码可能通过编译并打印一个地址，但只是把同一个地址“看成” `D*`。

它不能说明该地址处真的有一个 `D` 对象。继续访问 `pd` 指向的对象通常是错误的。

---

## Multiple inheritance

### 基本形式：mix and match

**Multiple inheritance（多重继承）** 指一个类同时继承多个基类。

例子：

```cpp
class Employee {
protected:
    String name;
    EmpID id;
};

class MTS : public Employee {
protected:
    Degrees degree_info;
};

class Temporary {
protected:
    Company employer;
};

class Consultant :
    public MTS,
    public Temporary {
    /* ... */
};
```

`Consultant` 同时继承 `MTS` 和 `Temporary`，因此它会获得两边的属性：

- 从 `MTS` 路径获得 `Employee` 的 `name` 和 `id`；
- 从 `MTS` 获得 `degree_info`；
- 从 `Temporary` 获得 `employer`。

这种写法的直观意义是“组合多个身份”：一个 consultant 既可以是技术人员，又可以是临时雇员。

### 多重继承的数据布局

多重继承会让对象内部同时包含多个 base class subobject。

以上面的 `Consultant` 为例，它大致包含：

```text
Consultant object
├── MTS subobject
│   └── Employee subobject
│       ├── name
│       └── id
└── Temporary subobject
    └── employer
```

所以多重继承不是简单地“复制几个函数接口”，它会真实影响对象内存布局。

用 `iostream` package 作为例子。标准输入输出库中有类似结构：

```text
basic_istream      basic_ostream
       \              /
        \            /
         basic_iostream
```

`basic_iostream` 同时具备输入和输出能力，这是一种多重继承的实际应用。

### Vanilla MI：重复基类

默认情况下，多重继承中的基类会被复制。

这称为 **Vanilla MI**。特点是：

- members are duplicated；
- derived class has access to full copies of each base class；
- 有时这是有用的。

例如：

- 一个链表节点可能需要有多套 link，用于同时挂在多个链表中；
- 输入流和输出流可能需要各自持有 stream buffer 相关结构。

### 重复基类带来的二义性

考虑 diamond-shaped inheritance：

```cpp
struct B1 {
    int m_i;
};

struct D1 : public B1 {};
struct D2 : public B1 {};
struct M : public D1, public D2 {};
```

此时 `M` 中有两份 `B1` subobject：

```text
M
├── D1
│   └── B1
│       └── m_i
└── D2
    └── B1
        └── m_i
```

代码如下：

```cpp
int main()
{
    M m;        // OK
    B1* p = &m; // ERROR: which B1???

    B1* p1 = static_cast<D1*>(&m); // OK
    B1* p2 = static_cast<D2*>(&m); // OK
}
```

`B1* p = &m;` 会报错，因为编译器不知道你想要 `D1` 路径里的 `B1`，还是 `D2` 路径里的 `B1`。

同样：

```cpp
M m;
m.m_i++;  // ERROR: D1::B1::m_i or D2::B1::m_i?
```

这里 `m_i` 也有两份，因此访问二义。

:::TIP
重复基类本身不一定是问题。如果 `D1` 和 `D2` 各自使用自己的 `B1` 只是实现细节，外部不直接访问，就未必会出错。问题出现在重复的数据带来了逻辑二义性。
:::

### Protocol / Interface classes

多重继承相对安全的使用场景是继承多个 **protocol / interface classes**。

Protocol / Interface class 通常是一个抽象基类，满足：

- 所有 non-static member functions 都是 pure virtual，除了 destructor；
- destructor 是 virtual destructor，通常有空实现；
- 没有 non-static member variables，无论是自己声明还是继承来的；
- 可以包含 static members。

例子：Unix character device 接口。

```cpp
class CDevice {
public:
    virtual ~CDevice() = default;

    virtual int read(...) = 0;
    virtual int write(...) = 0;
    virtual int open(...) = 0;
    virtual int close(...) = 0;
    virtual int ioctl(...) = 0;
};
```

这种接口类主要提供行为约束，不携带对象状态。即使多重继承多个接口，也不容易造成重复数据的二义性。

### Virtual base classes

如果希望 diamond inheritance 中只保留一份共同基类，可以使用 **virtual base class**。

```cpp
struct B1 {
    int m_i;
};

struct D1 : virtual public B1 {};
struct D2 : virtual public B1 {};
struct M : public D1, public D2 {};

int main()
{
    M m;       // OK
    m.m_i++;  // OK, there is only one B1 in m

    B1* p = new M; // OK
}
```

此时对象结构变成：

```text
M
├── D1
├── D2
└── shared virtual B1
    └── m_i
```

`D1` 和 `D2` 共享同一份 `B1`，所以 `m.m_i` 不再二义。

对 C++ 来说，`virtual` 往往意味着 **indirect**：

- virtual member functions 使用 dynamic binding，本质上有指针间接寻址；
- virtual base classes 也通过间接方式表示共享基类。

因此 virtual base class 会带来：

- 运行时开销；
- 空间开销；
- 更复杂的对象布局和构造顺序。

:::TIP
如果基类重复不是问题，就没有必要把基类声明为 `virtual`。对于不含数据的 abstract base class，重复一份通常没有实际问题，反而可以避免 virtual base 的复杂性。
:::

### 多重继承的复杂性

多重继承会引入很多额外问题：

- name conflicts；
- dominance rule；
- order of construction；
- virtual base 由谁构造；
- 需要 virtual base 时，前面的基类没有声明成 virtual，派生类无法事后修补；
- virtual base 相关代码可能被多条继承路径影响；
- 编译器实现和对象模型更复杂。

结论：

> Use sparingly. Avoid diamond patterns. In general, SAY NO.

也就是：多重继承不是不能用，但要非常谨慎。优先考虑 composition、单继承加接口、或者更简单的设计。

---

## Namespaces

### 为什么需要 namespace

如果两个头文件都在全局作用域声明同名函数，就会产生冲突。

```cpp
// old1.h
void f();
void g();

// old2.h
void f();
void g();
```

当一个源文件同时包含这两个头文件时，`f` 和 `g` 的名字会冲突。

解决方式是把名字包进 namespace：

```cpp
// old1.h
namespace old1 {
    void f();
    void g();
}

// old2.h
namespace old2 {
    void f();
    void g();
}
```

此时完整名字分别是：

```cpp
old1::f();
old2::f();
```

### 定义 namespace

namespace 表示一组逻辑上相关的类、函数、变量等。

```cpp
namespace Math {
    double abs(double);
    double sqrt(double);
    int trunc(double);
    // ...
}
```

注意：namespace 的右花括号后面不需要像 class 一样加分号。

```cpp
namespace Math {
    // ...
}  // no semicolon required
```

namespace 本质上也是一个 scope，就像 class scope 一样。

推荐在需要 name encapsulation 时使用 namespace。

### 在头文件中放 namespace 声明

通常把 namespace 中的声明写在头文件中。

```cpp
// MyLib.h
namespace MyLib {
    void foo();

    class Cat {
    public:
        void Meow();
    };
}
```

用户包含 `MyLib.h` 后，就能看到 `MyLib::foo` 和 `MyLib::Cat` 的声明。

### 实现 namespace 中的函数

实现 namespace 中的函数时，可以用作用域解析运算符 `::`。

```cpp
// MyLib.cpp
#include <iostream>
#include "MyLib.h"
using namespace std;

void MyLib::foo()
{
    cout << "foo\n";
}

void MyLib::Cat::Meow()
{
    cout << "meow\n";
}
```

其中：

- `MyLib::foo` 表示 `foo` 是 `MyLib` 命名空间里的函数；
- `MyLib::Cat::Meow` 表示 `Meow` 是 `MyLib` 命名空间中的 `Cat` 类的成员函数。

也可以把实现写进 namespace 块中：

```cpp
namespace MyLib {
    void foo()
    {
        cout << "foo\n";
    }

    void Cat::Meow()
    {
        cout << "meow\n";
    }
}
```

### 使用 namespace 中的名字

最直接的写法是使用 scope resolution operator：

```cpp
#include "MyLib.h"

int main()
{
    MyLib::foo();

    MyLib::Cat c;
    c.Meow();
}
```

优点是来源明确；缺点是如果名字很长，会比较啰嗦。

### `using` declaration

`using` declaration 引入某一个具体名字，相当于给局部作用域提供一个简写。

```cpp
int main()
{
    using MyLib::foo;
    using MyLib::Cat;

    foo();

    Cat c;
    c.Meow();
}
```

特点：

- 只引入指定名字；
- 能在一个地方清楚说明名字来自哪里；
- 比 `using namespace` 更可控。

### `using` directive

`using namespace` 会把一个 namespace 中的所有名字都变得可见。

```cpp
int main()
{
    using namespace std;
    using namespace MyLib;

    foo();

    Cat c;
    c.Meow();

    cout << "hello" << endl;
}
```

它可以作为记号上的便利，但会增加命名冲突风险。

:::WARNING
不要在头文件中写 `using namespace std;`。头文件会被很多源文件包含，这会把大量名字污染到包含者的作用域中，容易造成冲突。
:::

### 命名空间二义性

考虑：

```cpp
namespace XLib {
    void x();
    void y();
}

namespace YLib {
    void y();
    void z();
}
```

如果同时使用两个 using-directives：

```cpp
int main()
{
    using namespace XLib;
    using namespace YLib;

    x();        // OK
    y();        // Error: ambiguous
    XLib::y();  // OK, resolves to XLib
    z();        // OK
}
```

`using namespace` 只是让名字可见。二义性通常在真正使用这个名字时才出现。

解决方式是使用限定名：

```cpp
XLib::y();
YLib::y();
```

### Namespace aliases

namespace 名字太短容易冲突，太长又不方便使用。可以用 alias。

```cpp
namespace supercalifragilistic {
    void f();
}

namespace short_ns = supercalifragilistic;

short_ns::f();
```

alias 也可以用于库版本管理。例如：

```cpp
namespace mylib_v1 {
    void f();
}

namespace mylib = mylib_v1;
```

以后如果升级为 `mylib_v2`，可以调整 alias 指向。

### Namespace composition

可以把多个 namespace 组合成新的 namespace。

```cpp
namespace first {
    void x();
    void y();
}

namespace second {
    void y();
    void z();
}
```

如果直接组合，`y` 会冲突。可以用 using-declaration 指定采用哪一个：

```cpp
namespace mine {
    using namespace first;
    using namespace second;

    using first::y;  // resolve clashes

    void mystuff();
    /* ... */
}

int main()
{
    mine::x();
    mine::y();       // call first::y()
    mine::mystuff();
}
```

这里 `mine` 组合了 `first` 和 `second` 的功能，并显式解决 `y` 的冲突。

### Namespace selection

也可以只选择某些名字组成新 namespace。

```cpp
namespace mine {
    using orig::Cat;  // use Cat class from orig

    void x();
    void y();
}
```

这种方式比 `using namespace orig` 更精确，只暴露需要的部分。

如果 `orig::Cat` 的声明发生改变，`mine::Cat` 对应的名字也会反映这种变化。

### Namespaces are open

namespace 是 open 的。多个 namespace 声明会合并到同一个 namespace。

```cpp
// header1.h
namespace X {
    void f();
}

// header2.h
namespace X {
    void g();  // X now has f() and g()
}
```

这意味着 namespace 可以分散在多个文件中维护。

标准库中的一些扩展点也依赖这一点。例如为用户自定义类型特化 `std::hash`：

```cpp
#include <cstddef>
#include <functional>

namespace mylib {
    class Widget {
        /* ... */
    };
}

// Specialize std::hash so that Widget can be used as
// a key in std::unordered_set and std::unordered_map.
namespace std {
    template<>
    struct hash<mylib::Widget> {
        size_t operator()(const mylib::Widget& obj) const {
            return /* ... */ 0;
        }
    };
}
```

注意：一般不要随意往 `std` 里面添加新函数或新类。为用户自定义类型特化标准库模板是少数允许的扩展方式之一。
