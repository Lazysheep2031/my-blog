---
title: Smart Pointers
published: 2026-06-04
description: unique_ptr、shared_ptr、weak_ptr、reference counting、UCPointer、copy-on-write、循环引用
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Smart pointer（智能指针）** 是标准库中用于管理动态资源的对象。它内部仍然保存 raw pointer，但通过构造、析构、拷贝、移动、运算符重载等机制，把资源释放逻辑封装进对象生命周期中。

本节主要围绕三类智能指针展开：

- `std::unique_ptr`：独占式所有权，不能拷贝，只能移动；
- `std::shared_ptr`：共享式所有权，通过 reference count 判断何时释放资源；
- `std::weak_ptr`：弱引用，不拥有资源，用来打破 `shared_ptr` 循环引用。

智能指针背后综合：

- templates：让智能指针可以管理任意类型 `T`；
- operator overloading：重载 `*`、`->`、`[]`，让智能指针像普通指针一样使用；
- copy / move semantics：决定所有权能否复制、能否转移；
- reference counting：记录共享资源的所有者数量；
- RAII：把资源生命周期绑定到对象生命周期。

> 写 C++ 程序时，应尽量让资源由对象管理。能用智能指针表达所有权时，就不要手动散落 `new` / `delete`。

## 目录

- [概述](#概述)
- [目录](#目录)
- [为什么需要智能指针](#为什么需要智能指针)
  - [raw pointer 的问题](#raw-pointer-的问题)
  - [RAII 的基本思想](#raii-的基本思想)
- [`unique_ptr`：独占所有权](#unique_ptr独占所有权)
  - [基本使用](#基本使用)
  - [像指针一样使用](#像指针一样使用)
  - [不能拷贝](#不能拷贝)
  - [移动语义](#移动语义)
  - [`std::move` 的含义](#stdmove-的含义)
  - [管理动态数组](#管理动态数组)
- [实现一个简化版 `unique_ptr`](#实现一个简化版-unique_ptr)
  - [管理单个对象的版本](#管理单个对象的版本)
  - [管理数组的偏特化版本](#管理数组的偏特化版本)
- [`shared_ptr`：共享所有权](#shared_ptr共享所有权)
  - [基本使用](#基本使用-1)
  - [reference count 的变化](#reference-count-的变化)
  - [移动 `shared_ptr`](#移动-shared_ptr)
- [实现一个简化版 `shared_ptr`](#实现一个简化版-shared_ptr)
  - [ControlBlock](#controlblock)
  - [完整实现](#完整实现)
- [`shared_ptr` 的循环引用问题](#shared_ptr-的循环引用问题)
  - [循环引用为什么释放不了](#循环引用为什么释放不了)
  - [`weak_ptr` 的作用](#weak_ptr-的作用)
- [UCPointer 设计](#ucpointer-设计)
  - [`UCObject`：把引用计数放进被共享对象](#ucobject把引用计数放进被共享对象)
  - [`UCPointer`：引用计数智能指针](#ucpointer引用计数智能指针)
  - [String / StringRep：Envelope and Letter](#string--stringrepenvelope-and-letter)
  - [copy-on-write](#copy-on-write)
  - [这种设计的优缺点](#这种设计的优缺点)

---

## 为什么需要智能指针

### raw pointer 的问题

动态分配对象时，raw pointer 只保存地址，本身不负责释放资源：

```cpp
#include <iostream>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    Resource* p = new Resource(7);

    // 如果忘记 delete，析构函数不会被调用，资源泄露。
    delete p;
}
```

如果程序中存在复杂分支、提前 `return`、异常抛出、跨函数传递指针等情况，手动维护 `delete` 很容易出错：

- 忘记 `delete`：memory leak；
- 重复 `delete`：undefined behavior；
- `new[]` 和 `delete` 混用：undefined behavior；
- 所有权不清楚：不知道到底该由谁释放资源。

### RAII 的基本思想

RAII（Resource Acquisition Is Initialization）的核心是：

> 在构造函数中获得资源，在析构函数中释放资源。

智能指针就是典型的 RAII wrapper。动态资源交给智能指针对象管理后，当智能指针离开作用域时，它的析构函数会自动释放资源。

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    {
        unique_ptr<Resource> p(new Resource(7));
        cout << p->data << endl;
    } // p 离开作用域，自动 delete Resource

    cout << "before quit..." << endl;
}
```

:::TIP
`unique_ptr` 的析构函数负责 `delete` 它所管理的对象。只要智能指针对象本身能正常析构，资源释放就会自动发生，包括提前返回和异常栈展开的情况。
:::

---

## `unique_ptr`：独占所有权

### 基本使用

`unique_ptr<T>` 表示对一个 `T` 对象的 **unique ownership（独占所有权）**。

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    unique_ptr<Resource> p(new Resource(7));
    cout << p->data << endl;
}
```

注意初始化形式：

```cpp
unique_ptr<Resource> p(new Resource(7));  // OK
```

下面这种写法不能通过：

```cpp
unique_ptr<Resource> p = new Resource(7); // Error
```

原因是 `unique_ptr` 从 raw pointer 构造的构造函数是 `explicit` 的。`=` 初始化形式带有隐式转换 / 拷贝初始化语义，标准库不允许这样把 raw pointer 隐式转成 `unique_ptr`。

### 像指针一样使用

智能指针不仅要管理资源，还应该使用起来像普通指针。因此 `unique_ptr` 重载了指针相关运算符：

```cpp
unique_ptr<Resource> p(new Resource(7));

p->data = 10;        // operator->
cout << (*p).data;   // operator*
cout << p.get();     // 返回内部 raw pointer，只观察，不转移所有权
```

`get()` 返回的是智能指针内部保存的 raw pointer。它通常只用于观察地址或与旧接口交互，不能拿到后手动 `delete`。

### 不能拷贝

`unique_ptr` 的核心语义是独占，所以不能拷贝：

```cpp
unique_ptr<Resource> p1(new Resource(0));
unique_ptr<Resource> p2(new Resource(7));

p1 = p2; // Error: copy assignment is deleted
```

如果允许拷贝，就会出现两个 `unique_ptr` 同时管理同一块资源：

```text
p1 ---> Resource
p2 ---^
```

这会破坏 unique ownership，并可能导致重复释放。因此 `unique_ptr` 删除了 copy constructor 和 copy assignment。

### 移动语义

虽然不能拷贝，但可以移动。移动表示 **转移所有权**。

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    unique_ptr<Resource> p1(new Resource(0));
    unique_ptr<Resource> p2(new Resource(7));

    cout << "----- before move -----" << endl;
    cout << "p1 = " << p1.get() << endl;
    cout << "p2 = " << p2.get() << endl;
    cout << "p1 data: " << p1->data << endl;
    cout << "p2 data: " << p2->data << endl;

    p1 = std::move(p2);

    cout << "----- after move -----" << endl;
    cout << "p1 = " << p1.get() << endl;
    cout << "p2 = " << p2.get() << endl;
    cout << "p1 data: " << p1->data << endl;

    // cout << p2->data << endl; // Error at run time: p2 已经为空，不能解引用
}
```

移动后发生三件事：

1. `p1` 原来管理的 `Resource(0)` 被释放；
2. `p2` 原来管理的 `Resource(7)` 的所有权转移给 `p1`；
3. `p2` 变成空智能指针，`p2.get() == nullptr`。

所以移动后访问 `p2->data` 会产生空指针解引用错误。

### `std::move` 的含义

`std::move(p2)` 本身不搬运资源，也不释放资源。它做的是类型转换：

```text
左值 p2  ->  右值引用
```

真正执行所有权转移的是 `unique_ptr` 的 move assignment operator。也就是说：

```cpp
p1 = std::move(p2);
```

含义是：把 `p2` 转换成可以被移动的对象，然后调用 `p1` 的移动赋值函数。

### 管理动态数组

`unique_ptr` 也可以管理动态数组，但类型要写成 `T[]`：

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    unique_ptr<Resource[]> arr(new Resource[10]);

    cout << "Resource data = [ ";
    for (int i = 0; i < 10; ++i) {
        cout << arr[i].data << " ";
    }
    cout << "]" << endl;
}
```

`unique_ptr<Resource[]>` 的析构函数会使用 `delete[]`，所以 10 个对象的析构函数都会被调用。

:::WARNING
`new T` 要配 `delete`，`new T[n]` 要配 `delete[]`。智能指针的类型也必须区分 `unique_ptr<T>` 和 `unique_ptr<T[]>`。
:::

---

## 实现一个简化版 `unique_ptr`

### 管理单个对象的版本

一个最小版本需要做几件事：

- 保存内部 raw pointer；
- 析构时 `delete`；
- 重载 `*` 和 `->`；
- 提供 `get()` 观察 raw pointer；
- 提供 `release()` 释放所有权但不删除资源；
- 提供 `reset()` 重新管理资源；
- 禁止拷贝；
- 支持移动。

```cpp
#include <iostream>
#include <utility>
using namespace std;

template <typename T>
class u_ptr {
public:
    explicit u_ptr(T* ptr = nullptr) : p_(ptr) {}

    ~u_ptr() {
        delete p_;
    }

    T& operator*() const {
        return *p_;
    }

    T* operator->() const {
        return p_;
    }

    T* get() const {
        return p_;
    }

    T* release() {
        T* ptr = p_;
        p_ = nullptr;
        return ptr;
    }

    void reset(T* ptr = nullptr) {
        delete p_;
        p_ = ptr;
    }

    u_ptr(const u_ptr&) = delete;
    u_ptr& operator=(const u_ptr&) = delete;

    u_ptr(u_ptr&& other) noexcept
        : p_(other.release()) {}

    u_ptr& operator=(u_ptr&& other) noexcept {
        reset(other.release());
        return *this;
    }

private:
    T* p_;
};
```

`release()` 和 `reset()` 的语义不同：

| 函数 | 作用 | 是否释放原资源 |
|---|---|---|
| `release()` | 放弃当前所有权，并返回 raw pointer | 不释放 |
| `reset(ptr)` | 丢弃当前资源，改为管理 `ptr` | 会释放原资源 |

`operator->` 的返回值必须是指针。编译器会继续对返回的指针执行 `->`，直到最终访问到真实对象成员。

### 管理数组的偏特化版本

单对象版本不能直接管理数组，因为析构和 `reset()` 使用的是 `delete`。数组版本需要对 `T[]` 做 partial specialization。

```cpp
#include <cstddef>
#include <utility>

template <typename T>
class u_ptr<T[]> {
public:
    explicit u_ptr(T* ptr = nullptr) : p_(ptr) {}

    ~u_ptr() {
        delete[] p_;
    }

    T& operator[](size_t index) const {
        return p_[index];
    }

    T* get() const {
        return p_;
    }

    T* release() {
        T* ptr = p_;
        p_ = nullptr;
        return ptr;
    }

    void reset(T* ptr = nullptr) {
        delete[] p_;
        p_ = ptr;
    }

    u_ptr(const u_ptr&) = delete;
    u_ptr& operator=(const u_ptr&) = delete;

    u_ptr(u_ptr&& other) noexcept
        : p_(other.release()) {}

    u_ptr& operator=(u_ptr&& other) noexcept {
        reset(other.release());
        return *this;
    }

private:
    T* p_;
};
```

数组版本和单对象版本的主要差别：

- 析构函数使用 `delete[]`；
- `reset()` 使用 `delete[]`；
- 提供 `operator[]`；
- 不提供 `operator*` 和 `operator->`，因为管理的是一组对象。

示例：

```cpp
#include <iostream>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    u_ptr<Resource[]> arr(new Resource[10]);

    cout << "Resource data = [ ";
    for (int i = 0; i < 10; ++i) {
        cout << arr[i].data << " ";
    }
    cout << "]" << endl;
}
```

---

## `shared_ptr`：共享所有权

### 基本使用

`shared_ptr<T>` 允许多个智能指针共同管理同一个对象。

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct Resource {
    int data;

    Resource(int d = 0) : data(d) {}

    ~Resource() {
        cout << "Resource destroyed! data = " << data << endl;
    }
};

int main() {
    shared_ptr<Resource> p2(new Resource(7));

    cout << "p2 = " << p2.get() << endl;
    cout << "p2 data: " << p2->data << endl;
    cout << "count: " << p2.use_count() << endl;

    {
        shared_ptr<Resource> p1(new Resource(0));

        cout << "----- before copy -----" << endl;
        cout << "p1 = " << p1.get() << endl;
        cout << "p1 data: " << p1->data << endl;
        cout << "p1 count: " << p1.use_count() << endl;

        p2 = p1;

        cout << "----- after copy -----" << endl;
        cout << "p1 = " << p1.get() << endl;
        cout << "p2 = " << p2.get() << endl;
        cout << "p1 data: " << p1->data << endl;
        cout << "p2 data: " << p2->data << endl;
        cout << "p1 count: " << p1.use_count() << endl;
        cout << "p2 count: " << p2.use_count() << endl;
    }

    cout << "before quit..." << endl;
    cout << "p2 count: " << p2.use_count() << endl;
}
```

### reference count 的变化

上面代码中，`p2 = p1` 会产生两组变化：

1. `p2` 原来管理的 `Resource(7)` 的引用计数减 1，变成 0，于是释放；
2. `p2` 改为和 `p1` 共享 `Resource(0)`，该对象引用计数加 1，变成 2。

作用域变化过程：

```text
开始：
p1 ---> Resource(0), count = 1
p2 ---> Resource(7), count = 1

执行 p2 = p1：
p1 ---> Resource(0), count = 2
p2 ---^
Resource(7), count = 0，被释放

离开内层作用域：
p1 析构，Resource(0) count = 1
p2 仍然管理 Resource(0)

main 结束：
p2 析构，Resource(0) count = 0，被释放
```

`shared_ptr` 的资源释放规则是：

> 最后一个管理者消失时，资源才会释放。

### 移动 `shared_ptr`

`shared_ptr` 也支持移动。移动时转移 control block 指针，不增加引用计数。

```cpp
shared_ptr<Resource> p1(new Resource(0));
shared_ptr<Resource> p2(new Resource(7));

p2 = std::move(p1);

cout << p1.get() << endl;       // nullptr
cout << p1.use_count() << endl; // 0
cout << p2.use_count() << endl; // 1
```

如果自己实现的 `shared_ptr` 没写 move constructor 和 move assignment，那么 `std::move(p1)` 可能仍然会绑定到 copy constructor / copy assignment 上，最后表现成“拷贝共享”，引用计数会增加。要得到真正的移动语义，就必须显式实现移动版本。

---

## 实现一个简化版 `shared_ptr`

### ControlBlock

`shared_ptr` 不能只保存 raw pointer。它还需要一份和资源绑定的引用计数。

简化实现中，可以把二者放进 `ControlBlock`：

```cpp
struct ControlBlock {
    T* p_;
    size_t ref_count;

    ControlBlock(T* ptr) : p_(ptr), ref_count(1) {}

    ~ControlBlock() {
        delete p_;
    }
};
```

多个 `s_ptr` 对象共享同一个 `ControlBlock`。每多一个共享者，`ref_count` 加 1；每少一个共享者，`ref_count` 减 1；当 `ref_count == 0` 时，删除 `ControlBlock`，进而删除资源。

### 完整实现

```cpp
#include <cstddef>
#include <iostream>
#include <utility>
using namespace std;

template <typename T>
class s_ptr {
private:
    struct ControlBlock {
        T* p_;
        size_t ref_count;

        ControlBlock(T* ptr) : p_(ptr), ref_count(1) {}

        ~ControlBlock() {
            delete p_;
        }
    };

    ControlBlock* cb_;

    void add_shared() {
        if (cb_) {
            ++cb_->ref_count;
        }
    }

    void release_shared() {
        if (cb_) {
            --cb_->ref_count;
            if (cb_->ref_count == 0) {
                delete cb_;
            }
        }
    }

public:
    explicit s_ptr(T* ptr = nullptr)
        : cb_(ptr ? new ControlBlock(ptr) : nullptr) {}

    ~s_ptr() {
        release_shared();
    }

    s_ptr(const s_ptr& other)
        : cb_(other.cb_) {
        add_shared();
    }

    s_ptr& operator=(const s_ptr& other) {
        s_ptr(other).swap(*this);
        return *this;
    }

    s_ptr(s_ptr&& other) noexcept
        : cb_(other.cb_) {
        other.cb_ = nullptr;
    }

    s_ptr& operator=(s_ptr&& other) noexcept {
        s_ptr(std::move(other)).swap(*this);
        return *this;
    }

    void swap(s_ptr& other) noexcept {
        std::swap(cb_, other.cb_);
    }

    void reset(T* ptr = nullptr) {
        s_ptr(ptr).swap(*this);
    }

    T& operator*() const {
        return *(cb_->p_);
    }

    T* operator->() const {
        return cb_->p_;
    }

    T* get() const {
        return cb_ ? cb_->p_ : nullptr;
    }

    size_t use_count() const {
        return cb_ ? cb_->ref_count : 0;
    }

    explicit operator bool() const {
        return get() != nullptr;
    }
};
```

这里使用了 copy-and-swap 的写法：

```cpp
s_ptr& operator=(const s_ptr& other) {
    s_ptr(other).swap(*this);
    return *this;
}
```

执行过程：

1. `s_ptr(other)` 复制一份临时对象，引用计数加 1；
2. 临时对象和当前对象交换 `cb_`；
3. 函数结束，临时对象析构，它现在拿着当前对象原来的 `cb_`，所以原资源引用计数减 1；
4. 若原资源引用计数变成 0，则释放原资源。

这种写法的优点：

- 自赋值安全；
- 逻辑集中在 copy constructor、destructor、swap；
- 异常安全性更好；
- assignment 代码更短。

移动构造中只拿走 `cb_`，不改变引用计数：

```cpp
s_ptr(s_ptr&& other) noexcept
    : cb_(other.cb_) {
    other.cb_ = nullptr;
}
```

因为移动只是换一个管理者，不是新增管理者。

:::WARNING
`operator*` 和 `operator->` 没有检查空指针。空智能指针的解引用和 raw pointer 一样是错误行为。调用前应保证 `get() != nullptr` 或 `operator bool()` 为真。
:::

---

## `shared_ptr` 的循环引用问题

### 循环引用为什么释放不了

`shared_ptr` 的问题是可能形成 circular reference（循环引用）。例如两个对象互相保存对方的 `shared_ptr`：

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct B;

struct A {
    shared_ptr<B> b;
    ~A() { cout << "A destroyed" << endl; }
};

struct B {
    shared_ptr<A> a;
    ~B() { cout << "B destroyed" << endl; }
};

int main() {
    shared_ptr<A> pa(new A);
    shared_ptr<B> pb(new B);

    pa->b = pb;
    pb->a = pa;
}
```

离开 `main()` 时，外部的 `pa` 和 `pb` 会析构，但对象内部仍然互相持有 `shared_ptr`：

```text
A --shared_ptr--> B
^                |
|                v
+---shared_ptr---+
```

结果是：

- `A` 的引用计数无法降到 0，因为 `B::a` 还指向它；
- `B` 的引用计数无法降到 0，因为 `A::b` 还指向它；
- 两个对象都不会析构，资源泄露。

这类似一种“互相等待”的状态。

### `weak_ptr` 的作用

`weak_ptr` 是为了解决这种问题引入的弱引用：

- 可以观察 `shared_ptr` 管理的对象；
- 不拥有对象；
- 不增加 shared reference count；
- 需要访问对象时，用 `lock()` 临时获得一个 `shared_ptr`。

把其中一条边改成 `weak_ptr`：

```cpp
#include <iostream>
#include <memory>
using namespace std;

struct B;

struct A {
    shared_ptr<B> b;
    ~A() { cout << "A destroyed" << endl; }
};

struct B {
    weak_ptr<A> a;
    ~B() { cout << "B destroyed" << endl; }
};

int main() {
    shared_ptr<A> pa(new A);
    shared_ptr<B> pb(new B);

    pa->b = pb;
    pb->a = pa;

    if (shared_ptr<A> locked = pb->a.lock()) {
        cout << "A is still alive" << endl;
    }
}
```

此时 `B::a` 不增加 `A` 的引用计数，循环被打破。外部 `shared_ptr` 释放后，资源可以正常析构。

:::TIP
`weak_ptr` 表达的是“我可以看这个对象，但我不负责延长它的生命周期”。常见用法是 parent-child 结构中的反向指针、缓存、观察者列表等。
:::

---

## UCPointer 设计

从更传统的 reference counting 设计讲起，用四个类展示如何让自定义 `String` 共享内部表示。

### `UCObject`：把引用计数放进被共享对象

`UCObject` 是 use-counted object，负责保存和维护引用计数。

```cpp
#include <cassert>

class UCObject {
public:
    UCObject() : m_refCount(0) {}

    virtual ~UCObject() {
        assert(m_refCount == 0);
    }

    UCObject(const UCObject&) : m_refCount(0) {}

    void incr() {
        m_refCount++;
    }

    void decr();

    int references() {
        return m_refCount;
    }

private:
    int m_refCount;
};

inline void UCObject::decr() {
    m_refCount -= 1;
    if (m_refCount == 0) {
        delete this;
    }
}
```

`delete this` 只有在对象确实由 `new` 创建、且不会再被访问时才合法。不能对栈对象使用这种设计。

```cpp
StringRep* p = new StringRep("abc"); // 可以由引用计数最终 delete this
StringRep r("abc");                  // 栈对象不能让 decr() delete this
```

### `UCPointer`：引用计数智能指针

`UCPointer<T>` 是指向 `UCObject` 派生类的智能指针。它不自己保存引用计数，而是调用被管理对象的 `incr()` / `decr()`。

```cpp
template <class T>
class UCPointer {
private:
    T* m_pObj;

    void increment() {
        if (m_pObj) {
            m_pObj->incr();
        }
    }

    void decrement() {
        if (m_pObj) {
            m_pObj->decr();
        }
    }

public:
    UCPointer(T* r = 0)
        : m_pObj(r) {
        increment();
    }

    ~UCPointer() {
        decrement();
    }

    UCPointer(const UCPointer<T>& p) {
        m_pObj = p.m_pObj;
        increment();
    }

    UCPointer& operator=(const UCPointer<T>& p) {
        if (m_pObj != p.m_pObj) {
            decrement();
            m_pObj = p.m_pObj;
            increment();
        }
        return *this;
    }

    T* operator->() const {
        return m_pObj;
    }

    T& operator*() const {
        return *m_pObj;
    }
};
```

引用计数操作规律：

```cpp
p = q;
```

等价于：

```cpp
p->decrement(); // 原来 p 指向的对象少一个管理者
p = q;
p->increment(); // 新对象多一个管理者
```

也就是：指针赋值不仅是地址赋值，还必须维护引用计数。

### String / StringRep：Envelope and Letter

**Envelope and Letter** 思想：

- `String` 是 envelope：对用户暴露的外壳，提供干净接口；
- `StringRep` 是 letter：真正保存字符串数据的内部表示；
- `UCPointer<StringRep>` 负责共享和释放 `StringRep`；
- `StringRep` 继承 `UCObject`，获得引用计数能力。

四个类的关系：

| 类 | 作用 |
|---|---|
| `UCObject` | 实现引用计数 |
| `UCPointer<T>` | 智能指针模板，维护 `UCObject` 的引用计数 |
| `StringRep` | 字符串内部表示，保存 `char*`，继承 `UCObject` |
| `String` | 对外接口，内部 has-a `UCPointer<StringRep>` |

`String` 的接口：

```cpp
class String {
public:
    String(const char*);
    ~String();
    String(const String&);
    String& operator=(const String&);

    int operator==(const String&) const;
    String operator+(const String&) const;
    int length() const;
    operator const char*() const;

private:
    UCPointer<StringRep> m_rep;
};
```

`StringRep` 的接口：

```cpp
#include <cstring>

class StringRep : public UCObject {
public:
    StringRep(const char*);
    ~StringRep();
    StringRep(const StringRep&);

    int length() const {
        return strlen(m_pChars);
    }

    int equal(const StringRep&) const;

private:
    char* m_pChars;
};
```

`StringRep` 构造和析构：

```cpp
StringRep::StringRep(const char* s) {
    if (s) {
        int len = strlen(s) + 1;
        m_pChars = new char[len];
        strcpy(m_pChars, s);
    } else {
        m_pChars = new char[1];
        *m_pChars = '\0';
    }
}

StringRep::~StringRep() {
    delete[] m_pChars;
}
```

拷贝构造和比较：

```cpp
StringRep::StringRep(const StringRep& sr) {
    int len = sr.length();
    m_pChars = new char[len + 1];
    strcpy(m_pChars, sr.m_pChars);
}

int StringRep::equal(const StringRep& sp) const {
    return strcmp(m_pChars, sp.m_pChars) == 0;
}
```

`String` 的实现非常干净：

```cpp
String::String(const char* s)
    : m_rep(new StringRep(s)) {}

String::~String() {}

String::String(const String& s)
    : m_rep(s.m_rep) {}

String& String::operator=(const String& s) {
    m_rep = s.m_rep; // let smart pointer do work
    return *this;
}
```

真正的字符串操作会转发给 `StringRep`：

```cpp
int String::operator==(const String& s) const {
    return m_rep->equal(*s.m_rep);
}

int String::length() const {
    return m_rep->length();
}
```

这里体现了智能指针的两个作用：

- `m_rep = s.m_rep` 时自动维护引用计数；
- `m_rep->equal(...)` 和 `*s.m_rep` 使用起来像普通指针。

### copy-on-write

用字符串例子展示 reference count 的变化：

```cpp
String x("abcdef");
```

此时：

```text
x ---> [count = 1 | "abcdef"]
```

拷贝构造：

```cpp
String y = x; // shallow copy
```

此时 `x` 和 `y` 共享同一个 `StringRep`：

```text
x ---+
     v
   [count = 2 | "abcdef"]
     ^
y ---+
```

当修改 `x` 时：

```cpp
x = "Hello world"; // copy on write
```

为了不影响 `y`，`x` 会创建新的 `StringRep`，原来的共享表示引用计数减 1：

```text
x ---> [count = 1 | "Hello world"]
y ---> [count = 1 | "abcdef"]
```

这就是 copy-on-write 的基本思想：

> 读和普通拷贝时共享数据；真正要写时，才复制一份独立数据。

### 这种设计的优缺点

优点：

- `String` 类非常干净，拷贝构造和赋值基本交给 `UCPointer`；
- `StringRep` 只关心字符串存储和字符串操作；
- `UCObject` 和 `UCPointer` 可以复用到其他需要引用计数的类；
- 通过 shallow copy 减少不必要的数据复制。

缺点：

- 比 raw pointer 慢，需要维护引用计数；
- 属于 invasive design（侵入式设计）：被管理对象必须继承 `UCObject`；
- `delete this` 对对象创建方式有要求，不能用于栈对象；
- 所有被共享的类型都要配合这一套基类设计。

标准库 `std::shared_ptr` 使用的是 non-intrusive design：引用计数放在 control block 中，被管理类不需要继承特殊基类，所以适用范围更广。

---
