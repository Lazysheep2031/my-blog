---
title: Exceptions
published: 2026-05-28
description: run-time error、exception propagation、try-catch、RAII、constructor / destructor、exception safety、copy-and-swap
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Exception（异常）** 用于处理程序运行时出现、当前代码无法合理恢复的异常状况，例如文件打不开、内存申请失败、网络中断、用户输入导致下标越界等。

本讲的核心内容：

- run-time error 与 error code 的局限；
- `throw`、`try`、`catch` 与 exception propagation；
- handler 的类型匹配顺序，以及用 inheritance 组织异常类型；
- `std::bad_alloc`、`noexcept` 与 `std::terminate()`；
- RAII 如何保证异常发生时资源仍能释放；
- constructor / destructor 与 exception 的特殊关系；
- exception-safe code 的设计原则；
- 通过 **Copy-and-Swap Idiom** 提供 strong exception safety。

> 发生错误的位置往往只知道“不能继续执行”，却缺少恢复问题所需的上下文。此时应抛出包含诊断信息的异常对象，让更高层、掌握更多上下文的 caller 决定如何恢复。

## 目录

- [概述](#概述)
- [目录](#目录)
- [Runtime error 与错误处理](#runtime-error-与错误处理)
  - [Compile-time error 与 run-time error](#compile-time-error-与-run-time-error)
  - [读取文件中的运行时错误](#读取文件中的运行时错误)
  - [Error code 的局限](#error-code-的局限)
  - [Exception 的作用](#exception-的作用)
- [什么时候使用 Exception](#什么时候使用-exception)
  - [Vector 下标越界问题](#vector-下标越界问题)
  - [几种处理方案的比较](#几种处理方案的比较)
    - [方案一：直接返回对应内存](#方案一直接返回对应内存)
    - [方案二：返回特殊标记值](#方案二返回特殊标记值)
    - [方案三：直接结束程序](#方案三直接结束程序)
    - [方案四：`assert`](#方案四assert)
  - [Exception 与 assert 的边界](#exception-与-assert-的边界)
- [抛出与捕获异常](#抛出与捕获异常)
  - [用异常对象携带错误信息](#用异常对象携带错误信息)
  - [异常传播链](#异常传播链)
  - [`throw expression` 与 `throw;`](#throw-expression-与-throw)
  - [Stack unwinding](#stack-unwinding)
- [Handler 与异常继承体系](#handler-与异常继承体系)
  - [Handler 的匹配规则](#handler-的匹配规则)
  - [MathErr 层次](#matherr-层次)
  - [Standard library exceptions](#standard-library-exceptions)
- [`new`、`noexcept` 与异常设计](#newnoexcept-与异常设计)
  - [`new` 失败时的行为](#new-失败时的行为)
  - [`noexcept` specifier](#noexcept-specifier)
  - [不要将异常用作普通控制流](#不要将异常用作普通控制流)
  - [Uncaught exceptions](#uncaught-exceptions)
- [Exception 与 RAII](#exception-与-raii)
  - [依赖析构函数释放资源](#依赖析构函数释放资源)
  - [File 示例](#file-示例)
- [Exception 与 Constructors](#exception-与-constructors)
  - [构造失败如何报告](#构造失败如何报告)
  - [构造函数抛异常后的规则](#构造函数抛异常后的规则)
  - [裸资源导致 leak](#裸资源导致-leak)
  - [两段式构造的问题](#两段式构造的问题)
  - [已经构造成功的成员仍会析构](#已经构造成功的成员仍会析构)
  - [Wrapper 管理资源](#wrapper-管理资源)
  - [用智能指针实现同一设计](#用智能指针实现同一设计)
- [Exception 与 Destructors](#exception-与-destructors)
- [捕获异常的参数方式](#捕获异常的参数方式)
  - [Catch by value：可能发生 slicing](#catch-by-value可能发生-slicing)
  - [Catch by pointer：引入所有权问题](#catch-by-pointer引入所有权问题)
  - [Prefer catching by reference](#prefer-catching-by-reference)
- [Exception-safe code](#exception-safe-code)
  - [ATM 示例：状态修改顺序错误](#atm-示例状态修改顺序错误)
  - [Exception safety guarantees](#exception-safety-guarantees)
  - [Widget 的拷贝赋值问题](#widget-的拷贝赋值问题)
  - [Basic guarantee：避免 dangling pointer](#basic-guarantee避免-dangling-pointer)
  - [Strong guarantee：Copy-and-Swap Idiom](#strong-guaranteecopy-and-swap-idiom)
    - [Copy 阶段抛异常](#copy-阶段抛异常)
    - [Copy 阶段成功](#copy-阶段成功)
    - [Self-assignment](#self-assignment)

---

## Runtime error 与错误处理

### Compile-time error 与 run-time error

C++ 的 static typing 与 compile-time checks 能发现大量结构性错误，例如：

- 类型不匹配；
- 成员或变量不存在；
- 语法错误；
- 函数调用参数不匹配。

这类错误在程序运行前就会暴露，编译器可以给出定位信息。

运行时仍可能出现程序无法提前消除的错误：

- 文件不存在、无权限或被锁定；
- 读取中断，磁盘或网络失败；
- 内存不足；
- 用户输入非法；
- 调用者传入越界下标；
- 外部设备状态异常。

这些情况可能与程序逻辑本身无关，却必须由程序正确处理。

### 读取文件中的运行时错误

读取一个文件通常包含五步：

```text
1. open the file
2. determine its size
3. allocate enough memory
4. read file contents into memory
5. close the file
```

每一步都可能失败：

| 步骤 | 可能失败的原因 |
|---|---|
| `open` | 文件不存在、权限不足、文件被占用 |
| `determine size` | 文件状态变化、I/O 错误 |
| `allocate memory` | 内存不足 |
| `read` | 读取失败、数据损坏、设备中断 |
| `close` | 写回或关闭失败 |

### Error code 的局限

传统写法可以通过返回错误码报告失败：

```cpp
ErrorCode readFile() {
    ErrorCode errorCode = 0;

    openFile();
    if (fileOpened()) {
        determineSize();
        if (gotFileLength()) {
            allocateMemory();
            if (gotEnoughMemory()) {
                readFileIntoMemory();
                if (readFailed()) {
                    errorCode = -1;
                }
            } else {
                errorCode = -2;
            }
        } else {
            errorCode = -3;
        }

        closeFile();
        if (fileCloseFailed() && errorCode == 0) {
            errorCode = -4;
        }
    } else {
        errorCode = -5;
    }

    return errorCode;
}
```

问题在于：

1. **正常逻辑与错误处理交织。** 真正想阅读的五步主流程被大量判断与错误传播代码打断。
2. **占用返回值通道。** 函数原本可能需要返回计算结果；使用错误码后，结果只能通过额外的 output parameter 等方式传回。
3. **错误必须手动逐层上传。** 底层函数发现错误后，每一层 caller 都要检查并继续返回错误码，直到某层代码有能力处理。
4. **容易遗漏检查。** caller 忘记判断返回值，错误就会被静默忽略。

### Exception 的作用

Exception 将正常路径与异常路径分开：

```cpp
try {
    openFile();
    determineSize();
    allocateMemory();
    readFileIntoMemory();
    closeFile();
} catch (const FileOpenFailed& e) {
    // handle open failure
} catch (const SizeDeterminationFailed& e) {
    // handle size failure
} catch (const MemoryAllocationFailed& e) {
    // handle allocation failure
} catch (const ReadFailed& e) {
    // handle read failure
} catch (const FileCloseFailed& e) {
    // handle close failure
}
```

优点：

- `try` 中保留清晰的 normal logic；
- `catch` 集中处理对应错误；
- 异常沿 call chain 自动传播，无需每层显式返回错误码；
- 正常返回值仍用于表达正常计算结果；
- 抛出的对象可以携带错误现场信息。

---

## 什么时候使用 Exception

Exception 适合以下情形：

- 当前函数检测到错误；
- 当前函数无法确定正确的恢复策略；
- 继续运行可能造成错误结果、状态损坏或资源泄露；
- 更高层 caller 具备处理所需的上下文。

### Vector 下标越界问题

考虑一个自定义 `Vector<T>`：

```cpp
template <typename T>
class Vector {
private:
    T* m_elements;
    int m_size;

public:
    explicit Vector(int size = 0)
        : m_elements(size == 0 ? nullptr : new T[size]),
          m_size(size) {}

    ~Vector() {
        delete[] m_elements;
    }

    int length() const {
        return m_size;
    }

    T& operator[](int idx);  // idx 非法时怎么办？
};
```

库作者无法控制 caller 传入的 `idx`。但库必须明确设计越界时的行为。

:::TIP
这里讨论的是课程中的自定义 `Vector`。标准库 `std::vector` 中，`operator[]` 不进行边界检查；需要检查并在越界时抛出 `std::out_of_range` 时，应使用 `at()`。
:::

### 几种处理方案的比较

#### 方案一：直接返回对应内存

```cpp
template <class T>
T& Vector<T>::operator[](int idx) {
    return m_elements[idx];
}
```

若 `idx` 越界，程序进入 undefined behavior：

- 可能读到随机数据；
- 可能在更晚、更难定位的位置崩溃；
- 测试偶尔通过也无法证明程序正确。

#### 方案二：返回特殊标记值

```cpp
template <class T>
T& Vector<T>::operator[](int idx) {
    if (idx < 0 || idx >= m_size) {
        static T errorMarker{};  // 仅用于说明方案问题
        return errorMarker;
    }
    return m_elements[idx];
}
```

该设计要求某个正常值承担“错误标记”语义：

- 并非所有 `T` 都存在可用的 magic value；
- caller 必须在每次操作前检查；
- 原本自然的表达式不再安全：

```cpp
x = v[2] + v[4];  // 任意一个访问失败都难以自然表达
```

#### 方案三：直接结束程序

```cpp
if (idx < 0 || idx >= m_size) {
    std::exit(22);
}
```

程序立即中止，但 caller 没有恢复机会，库代码也替最终应用程序做出了过强决策。

#### 方案四：`assert`

```cpp
assert(idx >= 0 && idx < m_size);
return m_elements[idx];
```

`assert` 适合检测程序内部不变量被破坏的 bug，例如某算法理论上绝不应产生越界下标。

### Exception 与 assert 的边界

| 情形 | 更适合的手段 | 理由 |
|---|---|---|
| 内部逻辑违背不变量，例如开发者写错算法 | `assert` / debug | 应尽快暴露并修复程序 bug |
| 用户输入、文件系统、网络、内存等外部因素导致失败 | exception | 发布版本仍必须处理，且应用可能可以恢复 |
| 库接口接收 caller 提供的数据，检测到无法继续的非法调用 | exception | 应将错误信息报告给 caller，而非擅自终止整个进程 |

`assert` 通常在 release build 中会被禁用，因此不能承担运行时外部异常的处理职责。

---

## 抛出与捕获异常

### 用异常对象携带错误信息

`throw` 可以抛出任意对象。异常对象应包含诊断或恢复所需的信息。

```cpp
#include <iostream>

class VectorIndexError {
public:
    explicit VectorIndexError(int badValue)
        : m_badValue(badValue) {}

    void diagnostic() const {
        std::cerr << "index " << m_badValue
                  << " out of range!" << std::endl;
    }

    int badValue() const {
        return m_badValue;
    }

private:
    int m_badValue;
};

template <class T>
T& Vector<T>::operator[](int idx) {
    if (idx < 0 || idx >= m_size) {
        throw VectorIndexError(idx);
    }
    return m_elements[idx];
}
```

`Vector` 只负责：

- 检测下标是否合法；
- 发现错误时抛出包含 `idx` 的异常对象。

如何提示用户、是否重试、是否终止当前业务，应由更高层代码决定。

### 异常传播链

课程中的调用链为：

```text
outer3()
  -> outer2()
       -> func()
            -> Vector<T>::operator[]()
```

底层抛出异常：

```cpp
int func() {
    Vector<int> v(12);
    v[3] = 5;

    int i = v[42];  // throw VectorIndexError(42)
    return i * 5;   // 不会执行
}
```

某层 caller 可以直接处理：

```cpp
void outer() {
    try {
        func();
        // func2();
    } catch (const VectorIndexError& e) {
        e.diagnostic();
        // 异常在这里被处理，不再向外传播
    }

    std::cout << "Control is here after exception" << std::endl;
}
```

某层 caller 也可以只记录信息，再继续上抛：

```cpp
#include <string>

void outer2() {
    std::string errMsg("exception caught");

    try {
        func();
    } catch (const VectorIndexError&) {
        std::cout << errMsg << std::endl;
        throw;  // re-throw 当前正在处理的同一个异常
    }
}
```

最高层可以忽略具体类型，提供统一兜底机制：

```cpp
void outer3() {
    try {
        outer2();
    } catch (...) {
        std::cout << "The exception stops here!" << std::endl;
    }
}
```

### `throw expression` 与 `throw;`

两种写法含义不同：

```cpp
throw VectorIndexError(idx);  // 创建并抛出一个异常对象
```

```cpp
catch (const VectorIndexError&) {
    throw;                     // 重新抛出当前捕获的异常
}
```

- `throw expression;`：产生用于 handler 匹配的异常对象；
- `throw;`：re-raise 当前 handler 正在处理的异常，只能写在异常处理路径中；
- 重新抛出时用 `throw;` 可以保留动态类型，避免重新构造或 slicing。

### Stack unwinding

异常从抛出点沿调用链反向传播，直到找到第一个匹配的 handler。这个过程称为 **stack unwinding（栈展开 / 退栈）**。

在传播过程中：

- 当前函数在 `throw` 后的正常语句不再执行；
- 函数调用栈逐层退出；
- 已经完整构造的 stack objects 会自动执行析构函数；
- 因此 RAII 对异常安全至关重要。

---

## Handler 与异常继承体系

### Handler 的匹配规则

一个 `try` block 后可以跟多个 `catch` handlers：

```cpp
try {
    // code that may throw
} catch (const SpecificError& e) {
    // ...
} catch (const GeneralError& e) {
    // ...
} catch (...) {
    // ...
}
```

匹配规则：

1. handlers 按出现顺序检查；
2. 精确类型优先于后续 handler；
3. 派生类异常可以被基类 handler 捕获；
4. `catch (...)` 能捕获任意异常，必须放在最后；
5. 实际代码优先使用 reference，通常写为 `const T&`。

因此，继承体系中的异常必须按 **special to general** 排列：

```text
Derived exception handler
Base exception handler
catch-all handler
```

### MathErr 层次

一个数学错误层次：

```cpp
#include <iostream>
using namespace std;

class MathErr {
private:
    int data;

public:
    virtual void diagnostic() {}
};

class OverflowErr : public MathErr {};
class UnderflowErr : public MathErr {};
class ZeroDivisionErr : public MathErr {};

int main() {
    try {
        throw UnderflowErr();
    } catch (ZeroDivisionErr& e) {
        // handle zero-division error
    } catch (UnderflowErr& e) {
        cout << "underflow error caught" << endl;
    } catch (MathErr& e) {
        cout << "math error caught" << endl;
    } catch (...) {
        // final fallback
    }
}
```

输出：

```text
underflow error caught
```

若将 `MathErr&` 放在 `UnderflowErr&` 前面：

```cpp
try {
    throw UnderflowErr();
} catch (MathErr& e) {
    cout << "math error caught" << endl;
} catch (UnderflowErr& e) {
    cout << "underflow error caught" << endl;
}
```

`UnderflowErr` 可以向上匹配为 `MathErr`，因此前面的 handler 已经将它捕获。编译器会警告后面的 `UnderflowErr&` handler 永远无法被执行，程序输出：

```text
math error caught
```

同理：

```cpp
catch (...) {
    // ...
}
```

只能放在所有具体类型 handlers 的最后。

### Standard library exceptions

标准异常体系以 `std::exception` 为公共基类。常见类型包括：

```text
std::exception
├── std::bad_alloc
├── std::bad_cast
├── std::bad_typeid
├── std::bad_exception
├── std::runtime_error
│   ├── std::overflow_error
│   └── std::range_error
└── std::logic_error
    ├── std::domain_error
    ├── std::length_error
    ├── std::out_of_range
    └── std::invalid_argument
```

使用库接口时，应优先选择语义匹配的标准异常。例如，自定义带检查的下标访问可以抛出：

```cpp
#include <stdexcept>

throw std::out_of_range("Vector index out of range");
```

如果需要额外保存上下文，例如非法下标值、文件路径或操作信息，可以定义自己的异常类型，并继承合适的标准异常类别。

---

## `new`、`noexcept` 与异常设计

### `new` 失败时的行为

普通 throwing form 的 `new` 在申请内存失败时抛出 `std::bad_alloc`：

```cpp
#include <new>

try {
    int* p = new int[1'000'000'000];
    delete[] p;
} catch (const std::bad_alloc& e) {
    // handle allocation failure
}
```

强调：

```text
new does not return 0 on failure;
new raises a bad_alloc exception.
```

更完整地说，显式使用 `std::nothrow` 的形式会返回空指针：

```cpp
int* p = new (std::nothrow) int[100];
if (p == nullptr) {
    // allocation failed
}
```

 本讲讨论的默认语境是会抛出 `std::bad_alloc` 的普通 `new`。

### `noexcept` specifier

函数后加 `noexcept`，表示该函数承诺不会让异常传播到调用者：

```cpp
void abc(int a) noexcept {
    // ...
}
```

作用：

- 向编译器和调用者表达 non-throwing contract；
- 允许编译器或标准库采用更积极的优化策略；
- 对 move constructor、swap、destructor 等操作尤其重要。

若异常逃离 `noexcept` 函数边界：

```cpp
void f() noexcept {
    throw 1;
}
```

运行时将调用：

```cpp
std::terminate();
```

编译器通常不会通过静态分析彻底阻止函数体内可能抛出异常；`noexcept` 是程序员提供的强承诺。

### 不要将异常用作普通控制流

异常应表示 abnormal situation，而非正常循环的结束条件。

不合适的写法：

```cpp
try {
    for (;;) {
        p = list.next();
        // use p
    }
} catch (const List::EndOfList&) {
    // normal loop termination
}
```

到达容器末尾是正常、可预期的控制流，应通过 iterator / sentinel / 条件判断表达。

### Uncaught exceptions

若异常最终没有被任何 handler 捕获，程序会调用：

```cpp
std::terminate();
```

可替换 terminate handler 的接口：

```cpp
#include <exception>

void myTerminate() {
    // log fatal information, then end the program
}

int main() {
    std::set_terminate(myTerminate);
    // ...
}
```

这类机制适用于程序级别的最终故障处理；它不替代正常的异常恢复策略。

---

## Exception 与 RAII

### 依赖析构函数释放资源

Exception propagation 会触发 stack unwinding，栈上已经构造完成的对象会析构。因此资源应交给对象管理：

> Acquire resources in constructor; release resources in destructor.

这就是 **RAII（Resource Acquisition Is Initialization）**。

资源不局限于内存，还包括：

- file handle；
- network connection / socket；
- mutex lock；
- database transaction handle；
- graphics / device resource。

### File 示例

不推荐在每个可能抛异常的区域手动补救：

```cpp
void func() {
    File f;

    if (f.open("somefile")) {
        try {
            // work with f; may throw
        } catch (...) {
            f.close();
            throw;
        }
    }
}
```

更好的设计让 `File` 自己管理打开与关闭：

```cpp
void func() {
    File f("somefile");   // constructor acquires file resource

    if (f.ok()) {
        // work with f; may throw
    }
}                         // destructor closes file, including unwinding path
```

只要 `File::~File()` 正确关闭文件，无论函数正常结束、提前 `return`，还是由于异常退出，文件都能被释放。

---

## Exception 与 Constructors

### 构造失败如何报告

Constructor 没有返回值。若构造过程无法建立合法对象，可选方案包括：

- 设置 `initialized` flag，让对象处于“构造完成但不可用”的状态；
- 将真正初始化推迟到显式 `init()`；
- 直接在 constructor 中抛出异常。

前两种方案会使对象出现额外状态，并依赖用户记得检查或调用 `init()`。

> 构造失败时，抛出异常通常是最自然的设计：对象只有“成功构造并满足不变量”与“构造失败、不产生对象”两种结果。

### 构造函数抛异常后的规则

若 constructor 抛出异常：

1. 该对象的构造没有完成；
2. 该对象自身的 destructor 不会被调用；
3. 已经完整构造的 base-class subobjects 与 member objects 会被析构；
4. 对象表达式本身使用的存储由语言机制处理。

例如：

```cpp
X x;             // X::X() 抛异常时，栈上为 x 预留的存储会被回收
Y* p = new Y;    // Y::Y() 抛异常时，new 为 Y 分配的原始存储会被释放，
                 // 且 p 不会得到一个有效的 Y* 值
```

真正危险的是 constructor 内部手动获得的裸资源：完整对象未形成，类本身的 destructor 没有机会释放这些资源。

### 裸资源导致 leak

一个在构造函数中申请动态数组的类：

```cpp
#include <iostream>
using namespace std;

class A {
private:
    int* vdata;

public:
    A() : vdata(new int[10]) {
        cout << "A::A()" << endl;

        if (true) {          // simulate any failed condition
            throw 2;
        }
    }

    ~A() {
        cout << "A::~A()" << endl;
        delete[] vdata;
        cout << "deleting vdata ..." << endl;
    }
};

int main() {
    try {
        A a;
    } catch (...) {
        cout << "caught" << endl;
    }
}
```

输出：

```text
A::A()
caught
```

观察：

- `A()` 已经执行 `new int[10]`；
- 随后 constructor 抛出异常；
- `A` 未构造完成，因此 `A::~A()` 不会执行；
- `delete[] vdata` 不会发生；
- 动态数组发生 memory leak。

对 file、socket、mutex lock 等资源，同样会产生泄露或长期占用问题。

### 两段式构造的问题

可以将资源申请挪到 `init()` 中：

```cpp
class A {
private:
    int* vdata = nullptr;

public:
    A() = default;

    void init() {
        vdata = new int[10];
        // operations that may throw
    }

    ~A() {
        delete[] vdata;
    }
};
```

此时 `A a;` 已构造完成，后续 `a.init()` 抛异常时析构函数最终有机会释放 `vdata`。

但代价较大：

- 用户可能忘记调用 `init()`；
- 对象存在“已构造但还不可使用”的中间状态；
- 每个成员函数可能都需要检查初始化状态；
- 构造函数“保证初始化”的价值被削弱。

建议优先采用 RAII 管理构造期间取得的资源。

### 已经构造成功的成员仍会析构

关键机制是：外层对象构造失败时，已经成功构造的成员对象仍会析构。

```cpp
#include <iostream>
using namespace std;

class T {
public:
    T() {
        cout << "T::T()" << endl;
    }

    ~T() {
        cout << "T::~T()" << endl;
    }
};

class A {
private:
    T t;          // 在进入 A() 函数体前已构造

public:
    A() {
        cout << "A::A()" << endl;
        throw 2;
    }

    ~A() {
        cout << "A::~A()" << endl;
    }
};

int main() {
    try {
        A a;
    } catch (...) {
        cout << "caught" << endl;
    }
}
```

执行过程：

```text
T::T()
A::A()
T::~T()
caught
```

`A::~A()` 不执行，但成员 `t` 已经构造完成，因此 `T::~T()` 在异常展开时执行。

这提供了构造异常安全的核心思路：

> 不直接用裸指针管理资源；将资源包装为成员对象，让成员对象的析构函数负责释放资源。

### Wrapper 管理资源

将动态数组封装进一个 `Wrapper` member：

```cpp
#include <iostream>
using namespace std;

class Wrapper {
private:
    int* vdata;

public:
    explicit Wrapper(int* p) : vdata(p) {
        cout << "Wrapper::Wrapper()" << endl;
    }

    ~Wrapper() {
        delete[] vdata;
        cout << "vdata released" << endl;
    }
};

class A {
private:
    Wrapper w;

public:
    A() : w(new int[10]) {
        cout << "A::A()" << endl;

        if (true) {          // simulate construction failure
            throw 2;
        }
    }

    ~A() {
        cout << "A::~A()" << endl;
    }
};

int main() {
    try {
        A a;
    } catch (...) {
        cout << "caught" << endl;
    }
}
```

执行过程：

```text
Wrapper::Wrapper()
A::A()
vdata released
caught
```

分析：

1. `A` 的 member `w` 在进入 `A()` 函数体前构造完成；
2. `A()` 抛出异常，`A::~A()` 不会执行；
3. 已构造成功的 `w` 会析构；
4. `Wrapper::~Wrapper()` 执行 `delete[]`，资源得到释放。

这就是“用栈上对象的生命周期管理堆资源”的 RAII 思想。

### 用智能指针实现同一设计

对于动态内存，无需手写 `Wrapper`，标准库已经提供 smart pointer：

```cpp
#include <iostream>
#include <memory>
using namespace std;

class A {
private:
    unique_ptr<int[]> vdata;

public:
    A() : vdata(make_unique<int[]>(10)) {
        cout << "A::A()" << endl;

        if (true) {
            throw 2;
        }
    }
};

int main() {
    try {
        A a;
    } catch (...) {
        cout << "caught" << endl;
    }
}
```

`std::unique_ptr<int[]>` 是一个 member object。若 `A()` 抛异常，它仍会被析构，并自动执行对应的 `delete[]`。

使用原则：

- 独占所有权：优先 `std::unique_ptr`；
- 共享所有权确实存在时：使用 `std::shared_ptr`；
- 文件、锁、网络连接等资源：使用相应 RAII wrapper；
- 尽量避免在拥有资源的类中保存需要手工清理的 raw owning pointer。

---

## Exception 与 Destructors

Destructor 可能在两种路径中执行：

1. 正常生命周期结束：
   - 栈上对象离开 scope；
   - 堆上对象被 `delete`；
2. exception propagation 导致 stack unwinding。

若析构函数在 stack unwinding 中再次让异常逃出，程序面临同时传播多个异常的冲突，运行时将调用 `std::terminate()`。

应遵守：

```text
Never let exceptions escape from destructors.
```

通常析构函数按 non-throwing operation 设计：

```cpp
class File {
public:
    ~File() noexcept {
        // close resource;
        // failure should be logged or handled locally,
        // rather than throwing out of destructor
    }
};
```

:::WARNING
析构函数的职责是清理对象已有资源。若清理失败需要报告，可在析构前提供显式的 `close()` / `commit()` 接口供 caller 检查结果；析构函数仍作为不抛异常的最终兜底释放路径。
:::

---

## 捕获异常的参数方式

### Catch by value：可能发生 slicing

```cpp
struct X {};
struct Y : public X {};

try {
    throw Y();
} catch (X x) {
    // x 只保存 X 部分，Y 的动态类型信息被切掉
}
```

若异常体系依赖 virtual function 或派生类携带的诊断信息，by value 会丢失信息。

### Catch by pointer：引入所有权问题

```cpp
try {
    throw new Y();
} catch (Y* p) {
    // 谁负责 delete p？
}
```

异常处理路径需要管理动态内存，容易造成 leak，并让正常代码与 handler 因所有权规则耦合。

### Prefer catching by reference

```cpp
#include <iostream>
using namespace std;

struct B {
    virtual ~B() = default;

    virtual void print() const {
        cout << "B error" << endl;
    }
};

struct D : public B {
    void print() const override {
        cout << "D error" << endl;
    }
};

int main() {
    try {
        throw D();
    } catch (const B& b) {
        b.print();     // dynamic dispatch: D::print()
    }
}
```

推荐形式：

```cpp
catch (const SomeException& e) {
    // inspect e
}
```

原因：

- 避免拷贝；
- 避免 slicing；
- 保留动态类型与 virtual dispatch；
- 无需管理异常对象内存；
- `const` 表达 handler 通常只读取异常信息。

---

## Exception-safe code

### ATM 示例：状态修改顺序错误

ATM 取款例子：

```cpp
class BankAccount {
    // ...

    void withdrawMoney(int amount) {
        reduceBalance(amount);  // balance has already changed
        prepareCash();          // may throw
        releaseCash();
    }

    // ...
};
```

如果 `prepareCash()` 因机器现金不足抛出异常：

- 用户没有得到现金；
- 账户余额已经减少；
- 系统进入严重不一致状态。

异常安全要求：任何可能抛异常的步骤发生失败后，对象或系统仍要满足明确的一致性约束。

### Exception safety guarantees

重点涉及两种 guarantee：

| 层次 | 发生异常后的保证 | 本讲示例 |
|---|---|---|
| Basic guarantee | 对象仍可析构、仍处于合法状态，但部分状态可能已改变 | 赋值失败后将 owning pointer 设为 `nullptr` |
| Strong guarantee | 操作要么完全成功，要么对象保持操作前状态；具有 transaction-like 语义 | Copy-and-Swap assignment |

此外，`noexcept` 操作体现了更强的 non-throwing contract：

| 层次 | 含义 |
|---|---|
| No-throw guarantee | 操作承诺不会抛出异常，例如用于提交状态变更的 `swap()` |

### Widget 的拷贝赋值问题

构造了一个拥有动态资源的 `Widget`。为了模拟资源复制可能失败，`Resource` 的 copy constructor 主动抛出异常：

```cpp
#include <stdexcept>
#include <string>
using namespace std;

class Resource {
public:
    Resource() = default;

    Resource(const Resource&) {
        throw runtime_error("Resource Copy Ctor");
    }
};

class Widget {
private:
    int i;
    string s;
    Resource* pr;

public:
    Widget() : i(0), pr(new Resource) {}

    ~Widget() {
        delete pr;
    }

    Widget(const Widget& w) : i(w.i), s(w.s) {
        if (w.pr) {
            pr = new Resource(*w.pr);  // may throw
        } else {
            pr = nullptr;
        }
    }

    Widget& operator=(const Widget& w) {
        if (this == &w) {
            return *this;
        }

        i = w.i;
        s = w.s;

        delete pr;                      // old resource gone

        if (w.pr) {
            pr = new Resource(*w.pr);   // may throw
        } else {
            pr = nullptr;
        }

        return *this;
    }
};
```

问题发生在 assignment：

```cpp
delete pr;
pr = new Resource(*w.pr);  // 若这里抛异常
```

一旦 `new Resource(*w.pr)` 抛出异常：

- 旧资源已经被 `delete`；
- `pr` 尚未成功改为新地址，仍保存已释放的旧地址；
- `pr` 成为 dangling pointer；
- 后续析构再次 `delete pr` 可能造成严重错误；
- `i` 与 `s` 已经变成新值，资源字段却失效，对象状态不一致。

### Basic guarantee：避免 dangling pointer

最低限度可以在删除后立即清空指针：

```cpp
delete pr;
pr = nullptr;

if (w.pr) {
    pr = new Resource(*w.pr);  // may throw
}
```

若后续 copy 抛异常：

- `pr == nullptr`，不会悬空；
- 对象仍可以安全析构；
- 但 `i`、`s` 已经更新，`pr` 丢失了原资源；
- 对象的业务状态已经发生部分变化。

这满足 basic guarantee，却无法提供“赋值失败后保持原值”的语义。

### Strong guarantee：Copy-and-Swap Idiom

更好的策略是：

1. 先构造目标对象的完整副本；
2. copy 阶段允许抛异常，但此时 `*this` 不发生改变；
3. copy 成功后，通过 `noexcept swap()` 一次性提交新状态；
4. 临时对象析构时释放旧资源。

下面给出基于课堂程序整理后的可编译版本：

```cpp
#include <iostream>
#include <stdexcept>
#include <string>
#include <utility>
using namespace std;

class Resource {
public:
    Resource() = default;

    Resource(const Resource&) {
        throw runtime_error("Resource Copy Ctor");
    }
};

class Widget {
private:
    int i;
    string s;
    Resource* pr;

public:
    Widget() : i(0), s(), pr(new Resource) {}

    ~Widget() {
        delete pr;
    }

    Widget(const Widget& w) : i(w.i), s(w.s), pr(nullptr) {
        if (w.pr) {
            pr = new Resource(*w.pr);  // may throw
        }
    }

    Widget& operator=(const Widget& w) {
        // Copy-and-Swap Idiom
        Widget temp(w);   // copy ctor: may throw; *this remains unchanged
        swap(temp);       // commit operation: must not throw
        return *this;     // temp destructs and deletes the old resource
    }

    void swap(Widget& w) noexcept {
        std::swap(i, w.i);
        std::swap(s, w.s);
        std::swap(pr, w.pr);
    }
};

int main() {
    Widget w1;
    Widget w2(w1);  // Resource copy constructor throws
    Widget w3;
    w3 = w1;        // 若执行到这里，同样由 copy phase 决定是否成功
}
```


其异常安全逻辑如下：

```cpp
Widget temp(w);   // phase 1: prepare
swap(temp);       // phase 2: commit
```

#### Copy 阶段抛异常

```cpp
Widget temp(w);   // throws
```

- `swap(temp)` 不执行；
- `*this` 的任何字段都没有被修改；
- 原对象保持完整、有效且一致；
- assignment 失败具有 strong guarantee。

#### Copy 阶段成功

```cpp
Widget temp(w);
swap(temp);
```

- `temp` 先拥有新复制出的状态；
- `swap` 后，`*this` 获得新状态；
- `temp` 获得原对象的旧资源；
- `temp` 离开作用域时析构，自动释放旧资源。

#### Self-assignment

在 Copy-and-Swap 写法中，即使执行：

```cpp
w1 = w1;
```

行为也仍然正确：

- 先复制一份；
- 再交换；
- 临时对象析构。

因此 `if (this == &w)` 不是正确性所必需的。它可以避免少数 self-assignment 中的额外复制，但会让绝大多数普通赋值都额外执行一次分支判断。
