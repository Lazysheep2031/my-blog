---
title: Iterators
published: 2026-05-21
description: iterator、iterator_traits、template specialization、iterator category、tag dispatch、advance、distance
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

**Iterator（迭代器）** 提供了一套类似指针的统一访问接口：算法只通过迭代器顺序访问元素，不需要知道容器底层是连续数组、链表还是平衡树。

本讲的主线是：

- 从原生数组和指针理解 iterator 的来源；
- 用 `std::find` 理解算法和容器如何通过 iterator 解耦；
- 为自定义单链表 `List` 实现 `ListIter`；
- 用 `iterator_traits` 提取迭代器关联类型，并统一处理 raw pointer；
- 用 template specialization 支持指针类型；
- 用 iterator category 和 tag dispatch 为 `advance()`、`distance()` 选择高效实现。

> 容器负责封装“如何移动到下一个元素”；算法只依赖“可以解引用、可以移动、可以比较”的迭代器接口。

## 目录

- [概述](#概述)
- [目录](#目录)
- [为什么需要 Iterator](#为什么需要-iterator)
  - [从指针到迭代器](#从指针到迭代器)
  - [算法与数据结构解耦](#算法与数据结构解耦)
  - [Iterator design pattern](#iterator-design-pattern)
- [统一接口与 `std::find`](#统一接口与-stdfind)
  - [半开区间 `[first, last)`](#半开区间-first-last)
  - [`find` 的实现逻辑](#find-的实现逻辑)
  - [课堂演示：同一算法适用于多种容器](#课堂演示同一算法适用于多种容器)
  - [不同容器的移动能力](#不同容器的移动能力)
- [Iterator 的指针式接口](#iterator-的指针式接口)
  - [基本操作](#基本操作)
  - [运算符重载的本质](#运算符重载的本质)
- [为单链表设计 Iterator](#为单链表设计-iterator)
  - [只暴露节点时的问题](#只暴露节点时的问题)
  - [完整示例：`List` 与 `ListIter`](#完整示例list-与-listiter)
  - [从内部细节到统一接口](#从内部细节到统一接口)
  - [Range-based for loop 的基础](#range-based-for-loop-的基础)
- [Associated type 与 `iterator_traits`](#associated-type-与-iterator_traits)
  - [为什么算法需要关联类型](#为什么算法需要关联类型)
  - [在自定义 iterator 中声明类型信息](#在自定义-iterator-中声明类型信息)
  - [Raw pointer 带来的问题](#raw-pointer-带来的问题)
  - [`iterator_traits` 的解决方式](#iterator_traits-的解决方式)
  - [标准 traits 提供的五类信息](#标准-traits-提供的五类信息)
- [Template specialization](#template-specialization)
  - [Primary、full 与 partial specialization](#primaryfull-与-partial-specialization)
  - [演示代码](#演示代码)
  - [为何 traits 可以支持指针](#为何-traits-可以支持指针)
- [Iterator category](#iterator-category)
  - [五类迭代器能力](#五类迭代器能力)
  - [Category tag 的继承关系](#category-tag-的继承关系)
  - [常见容器对应的能力](#常见容器对应的能力)
- [Tag dispatch：根据能力选择算法实现](#tag-dispatch根据能力选择算法实现)
  - [`advance()` 的不同实现](#advance-的不同实现)
  - [为什么仅靠模板参数名不能重载](#为什么仅靠模板参数名不能重载)
  - [用 category tag 调度 `advance()`](#用-category-tag-调度-advance)
  - [`distance()` 的调度](#distance-的调度)
- [设计总结与使用原则](#设计总结与使用原则)

---

## 为什么需要 Iterator

### 从指针到迭代器

原生数组本身就是一种 aggregate object（聚合对象）。对数组的遍历可以用指针完成：

```cpp
int arr[] = {1, 2, 3, 4, 5};

for (int* p = arr; p != arr + 5; ++p) {
    cout << *p << " ";
}
```

这里的关键操作只有：

```cpp
*p       // 访问当前位置元素
++p      // 移动到下一个元素
p != end // 判断是否到达终止位置
```

Iterator 是对 pointer 概念的推广。即使容器内部并不是连续内存，只要它提供与指针相似的访问接口，算法就可以采用同样的遍历写法。

### 算法与数据结构解耦

假设有：

- `N` 个算法，例如查找、计数、累加、复制；
- `M` 种容器，例如数组、向量、链表、树结构。

如果每个算法都直接依赖每种容器的底层表示，就可能需要维护：

```text
N × M 份实现
```

例如，对数组要通过下标移动，对链表要沿 `next` 移动，对树结构要按遍历顺序寻找后继节点。

引入 iterator 之后，结构变为：

```text
container -- exposes iterator --> algorithm
```

- 每个容器只需要定义自己的 iterator；
- 每个通用算法只需要针对统一 iterator interface 编写一次；
- 容器内部表示不会暴露给算法。

这就是 STL 中 container、iterator、algorithm 三者之间的核心关系。

### Iterator design pattern

- 顺序访问聚合对象中的元素；
- 不暴露容器内部表示细节；
- 算法只看见统一接口。

这一模式不仅存在于 C++，在 Java、Python、Rust 等语言中也非常常见。

---

## 统一接口与 `std::find`

### 半开区间 `[first, last)`

STL 算法通常接收一对 iterator：

```cpp
first, last
```

它们描述一个 half-open range（半开区间）：

```text
[first, last)
```

含义是：

- `first` 指向第一个待处理元素；
- `last` 指向最后一个元素的后一个位置；
- `last` 仅用作终止标记，不能解引用。

例如：

```cpp
int arr[] = {1, 2, 3, 4, 5};

int* first = arr;       // 指向 1
int* last  = arr + 5;   // 指向数组末尾之后
```

:::WARNING
只能在 iterator 指向有效元素时执行 `*iter`。对 `end()` 或 `last` 解引用属于错误行为。
:::

### `find` 的实现逻辑

`find` 可以抽象为：

```cpp
template <class InputIterator, class T>
InputIterator find(InputIterator first,
                   InputIterator last,
                   const T& value) {
    while (first != last && *first != value) {
        ++first;
    }
    return first;
}
```

执行逻辑：

1. 只要还未到达 `last`，且当前位置值不等于目标值，就执行 `++first`；
2. 找到目标时返回指向目标元素的 iterator；
3. 遍历结束仍未找到时返回 `last`。

判断查找失败的标准写法：

```cpp
auto iter = find(container.begin(), container.end(), value);

if (iter == container.end()) {
    cout << "not found" << endl;
}
```

`find` 的代码中没有任何关于 `vector`、`list` 或 `set` 内部结构的信息。算法只要求 iterator 支持：

```cpp
!=
*
++
```

### 课堂演示：同一算法适用于多种容器

使用数组构造 `list`、`set` 和 `vector`，再将同一个 `find` 算法分别应用到四种结构上：

```cpp
#include <algorithm>
#include <iostream>
#include <list>
#include <set>
#include <vector>
using namespace std;

int main() {
    const int Size = 5;
    int arr[Size] = {1, 2, 3, 4, 5};

    list<int> l(arr, arr + Size);
    set<int> s(arr, arr + Size);
    vector<int> v(arr, arr + Size);

    auto itl = find(l.begin(), l.end(), 3);
    cout << "list: " << *itl << endl;

    auto its = find(s.begin(), s.end(), 3);
    cout << "set: " << *its << endl;

    auto itv = find(v.begin(), v.end(), 3);
    cout << "vector: " << *itv << endl;

    auto ita = find(arr, arr + Size, 3);
    cout << "array: " << *ita << endl;
}
```

输出为：

```text
list: 3
set: 3
vector: 3
array: 3
```

这里包含两个重要事实：

1. `list<int>::iterator`、`set<int>::iterator`、`vector<int>::iterator` 的具体类型不同，但都能传入 `find`；
2. 原生指针 `int*` 也可以作为 iterator，因此 `find(arr, arr + Size, 3)` 合法。

### 不同容器的移动能力

把输入顺序改成：

```cpp
int arr[Size] = {5, 4, 3, 2, 1};
```

此时三种容器的 iterator 从元素 `3` 向后移动，结果不同：

```cpp
auto itl = find(l.begin(), l.end(), 3);
++itl;
cout << *itl << endl;       // 2

auto its = find(s.begin(), s.end(), 3);
++its;
cout << *its << endl;       // 4

auto itv = find(v.begin(), v.end(), 3);
itv += 2;
cout << *itv << endl;       // 1
```

原因如下：

| 容器 | 内部遍历顺序 | 从 `3` 继续移动的结果 |
|---|---|---|
| `list<int>` | 保留插入范围的顺序：`5 4 3 2 1` | `++iter` 到 `2` |
| `vector<int>` | 保留连续存储顺序：`5 4 3 2 1` | `iter += 2` 到 `1` |
| `set<int>` | 按比较规则有序遍历：`1 2 3 4 5` | `++iter` 到 `4` |

`set` 的接口语义保证元素按排序规则遍历；常见实现使用平衡搜索树，例如红黑树。对 iterator 使用者来说，树结构以及“如何找到中序后继”都被封装在 `++its` 中。

`vector` iterator 支持：

```cpp
itv += 2;
```

因为它可进行 constant-time random access。`list` 和 `set` 的 iterator 不提供这一操作，因为沿链表或树结构跨越多个元素需要逐步移动，复杂度不是常数时间。

---

## Iterator 的指针式接口

### 基本操作

Iterator 的统一接口看起来像指针：

| 操作 | 含义 | 是否所有常用可读 iterator 都需要 |
|---|---|---|
| `*iter` | 访问当前位置的元素 | 是 |
| `iter->member` | 通过当前位置元素访问成员 | 常见 |
| `++iter` | 移动到下一个元素 | 是 |
| `iter == end` / `iter != end` | 判断位置是否相同 | 是 |
| `--iter` | 移动到前一个元素 | 仅双向及更强 iterator |
| `iter += n`、`iter[n]`、`iter2 - iter1` | 随机位置移动或求距离 | 仅 random-access iterator |

Iterator 并不一定是地址。它通常是一个 class object，内部保存访问容器所需的状态，并通过运算符重载暴露指针式接口。

### 运算符重载的本质

用类似 `auto_ptr` 的类型演示 `*` 和 `->` 的重载：

```cpp
template <class T>
class auto_ptr {
private:
    T* pointee;

public:
    T& operator*() {
        return *pointee;
    }

    T* operator->() {
        return pointee;
    }
};
```

同理，一个 iterator 可以通过：

```cpp
T& operator*();
T* operator->();
Iterator& operator++();
```

让使用者采用与指针相似的写法，而容器真实的移动逻辑被封装在运算符实现内部。

---

## 为单链表设计 Iterator

### 只暴露节点时的问题

实现一个最简单的 singly linked list（单链表），并用 dummy head 简化头插操作。

如果容器只暴露链表节点，遍历代码必须写成：

```cpp
ListItem<int>* p = l.get_head()->next;

while (p != nullptr) {
    cout << p->value << " ";
    p = p->next;
}
```

这段代码依赖：

- 容器内部确实是链表；
- 节点类型名是 `ListItem`；
- 节点包含 `value` 和 `next`；
- “向后移动”必须访问 `p->next`。

因此算法和容器实现细节发生了耦合。如果未来将底层结构改为数组、双向链表或树，这段遍历代码就需要重写。

### 完整示例：`List` 与 `ListIter`

```cpp
#include <algorithm>
#include <cstddef>
#include <iostream>
#include <iterator>
using namespace std;

template <typename T>
struct ListItem {
    T value;
    ListItem* next;
};

template <typename T>
class ListIter {
private:
    ListItem<T>* ptr;

public:
    using iterator_category = forward_iterator_tag;
    using value_type = T;
    using difference_type = ptrdiff_t;
    using pointer = T*;
    using reference = T&;

    ListIter(ListItem<T>* p = nullptr) : ptr(p) {}

    reference operator*() const {
        return ptr->value;
    }

    pointer operator->() const {
        return &(**this);
    }

    ListIter& operator++() {
        ptr = ptr->next;
        return *this;
    }

    ListIter operator++(int) {
        ListIter old = *this;
        ++(*this);
        return old;
    }

    bool operator==(const ListIter& other) const {
        return ptr == other.ptr;
    }

    bool operator!=(const ListIter& other) const {
        return !(*this == other);
    }
};

template <typename T>
class List {
private:
    ListItem<T>* head;  // dummy head

public:
    using iterator = ListIter<T>;

    List() {
        head = new ListItem<T>;
        head->next = nullptr;
    }

    ~List() {
        ListItem<T>* p = head;
        while (p != nullptr) {
            ListItem<T>* next = p->next;
            delete p;
            p = next;
        }
    }

    // 本例拥有裸指针资源，为避免浅拷贝导致重复释放，暂时禁止复制。
    List(const List&) = delete;
    List& operator=(const List&) = delete;

    void push_front(T value) {
        ListItem<T>* item = new ListItem<T>;
        item->value = value;
        item->next = head->next;
        head->next = item;
    }

    bool empty() const {
        return head->next == nullptr;
    }

    // 仅为对比“暴露实现细节”的遍历方式而提供。
    ListItem<T>* get_head() {
        return head;
    }

    iterator begin() {
        return iterator(head->next);
    }

    iterator end() {
        return iterator(nullptr);
    }
};

int main() {
    List<int> l;
    l.push_front(1);
    l.push_front(2);
    l.push_front(3);  // l 中的遍历顺序为 3 2 1

    cout << "native: ";
    ListItem<int>* p = l.get_head()->next;
    while (p != nullptr) {
        cout << p->value << " ";
        p = p->next;
    }
    cout << endl;

    cout << "iterator: ";
    for (ListIter<int> it = l.begin(); it != l.end(); ++it) {
        cout << *it << " ";
    }
    cout << endl;

    cout << "range-for: ";
    for (int value : l) {
        cout << value << " ";
    }
    cout << endl;

    for (int value = 1; value <= 5; ++value) {
        auto it = find(l.begin(), l.end(), value);
        if (it == l.end()) {
            cout << value << " not found" << endl;
        } else {
            cout << value << " found" << endl;
        }
    }

    auto it = l.begin();
    advance(it, 2);
    cout << "advanced: " << *it << endl;
}
```

程序输出：

```text
native: 3 2 1
iterator: 3 2 1
range-for: 3 2 1
1 found
2 found
3 found
4 not found
5 not found
advanced: 1
```

### 从内部细节到统一接口

`ListIter` 的内部状态是：

```cpp
ListItem<T>* ptr;
```

这说明 iterator 自己知道单链表的节点表示。

但是对外接口已经转换为统一形式：

| 原始链表访问方式 | Iterator 接口 | 含义 |
|---|---|---|
| `p->value` | `*it` | 访问当前元素 |
| `p = p->next` | `++it` | 移动到下一个元素 |
| `p != nullptr` | `it != l.end()` | 判断是否结束 |

关键代码是：

```cpp
ListIter& operator++() {
    ptr = ptr->next;
    return *this;
}

T& operator*() const {
    return ptr->value;
}
```

`ptr->next` 是链表细节，只存在于 `ListIter` 的实现中。算法看到的只有 `++it`。

### Range-based for loop 的基础

有了 `begin()`、`end()`、`operator!=`、`operator++` 和 `operator*`，自定义容器就可以使用 range-based for loop：

```cpp
for (int value : l) {
    cout << value << " ";
}
```

它的核心逻辑近似于：

```cpp
for (auto it = l.begin(), last = l.end();
     it != last;
     ++it) {
    int value = *it;
    cout << value << " ";
}
```

因此，range-based for 并不要求容器是标准库容器；只要提供满足遍历需求的 iterator 接口即可。

---

## Associated type 与 `iterator_traits`

### 为什么算法需要关联类型

一个模板算法接收 iterator 时，编译器可以推导 iterator 类型 `I`：

```cpp
template <class I>
void func(I iter) {
    // I 可以由 iter 推导出来
}
```

但算法内部可能还需要知道：

```cpp
*iter
```

所得元素的类型。例如希望创建一个同类型临时变量：

```cpp
T tmp = *iter;
```

只传入 `iter` 时，模板参数 `T` 没有直接的函数参数供编译器推导。首先给出一种较笨拙的方式：

```cpp
template <class I, class T>
void func_impl(I iter, T& v) {
    T tmp;
    tmp = *iter;
    // processing code here
}

template <class I>
void func(I iter) {
    func_impl(iter, *iter);
}
```

这里额外传入 `*iter`，仅仅为了让 `T` 被推导出来。这种方法扩展性不足，因为算法往往还需要 pointer type、reference type、distance type 和 iterator category 等信息。

### 在自定义 iterator 中声明类型信息

更直接的方式是在 iterator 类型内部显式声明 associated types（关联类型）：

```cpp
template <class T>
struct MyIter {
    using value_type = T;

    T* ptr;

    MyIter(T* p = nullptr) : ptr(p) {}

    T& operator*() {
        return *ptr;
    }
};

template <class I>
typename I::value_type func(I iter) {
    return *iter;
}
```

使用：

```cpp
MyIter<int> iter(new int(8));
cout << func(iter);  // 返回类型为 int
```

这里：

```cpp
typename I::value_type
```

表示：`I::value_type` 是依赖于模板参数 `I` 的类型名，需要用 `typename` 告诉编译器将其解析为类型。

### Raw pointer 带来的问题

原生指针同样是 iterator：

```cpp
int* p;
double* q;
```

但 raw pointer 不是 class 或 struct，因此它内部无法声明：

```cpp
int*::value_type   // 不存在
```

如果算法始终依赖 `I::value_type`，就无法处理原生指针，这将破坏 iterator 对 pointer 的泛化目标。

### `iterator_traits` 的解决方式

解决方案是在 iterator 和算法之间再加入一层 type extractor（类型萃取器）：

```cpp
iterator type -> iterator_traits<iterator type> -> associated types
```

下面是原理化实现：

```cpp
template <class I>
struct IteratorTraits {
    using value_type = typename I::value_type;
};

template <class T>
struct IteratorTraits<T*> {
    using value_type = T;
};

template <class T>
struct IteratorTraits<const T*> {
    using value_type = T;
};

template <class I>
typename IteratorTraits<I>::value_type func(I iter) {
    return *iter;
}
```

现在：

```cpp
MyIter<int> iter(new int(8));
int* p = new int(9);

cout << func(iter);  // 主模板：读取 MyIter<int>::value_type
cout << func(p);     // 偏特化：直接得到 T = int
```

实际编程中应使用标准库提供的：

```cpp
std::iterator_traits<I>
```

而不需要自己重新定义它。

### 标准 traits 提供的五类信息

标准的 iterator traits 需要统一提供以下信息：

| 类型信息 | 含义 | 对 `T*` 的结果 |
|---|---|---|
| `value_type` | 解引用后元素本身的类型 | `T` |
| `difference_type` | 两个 iterator 之间距离的类型 | `std::ptrdiff_t` |
| `pointer` | 指向元素的指针类型 | `T*` |
| `reference` | 解引用后的引用类型 | `T&` |
| `iterator_category` | iterator 的能力类别 | `std::random_access_iterator_tag` |

其基本结构如下：

```cpp
template <class I>
struct IteratorTraits {
    using iterator_category = typename I::iterator_category;
    using value_type = typename I::value_type;
    using difference_type = typename I::difference_type;
    using pointer = typename I::pointer;
    using reference = typename I::reference;
};

template <class T>
struct IteratorTraits<T*> {
    using iterator_category = random_access_iterator_tag;
    using value_type = T;
    using difference_type = ptrdiff_t;
    using pointer = T*;
    using reference = T&;
};

template <class T>
struct IteratorTraits<const T*> {
    using iterator_category = random_access_iterator_tag;
    using value_type = T;
    using difference_type = ptrdiff_t;
    using pointer = const T*;
    using reference = const T&;
};
```

注意 `const T*` 的处理：

```cpp
value_type = T;
pointer = const T*;
reference = const T&;
```

元素的值类型仍是 `T`，但通过 iterator 得到的访问权限保留为只读。

> 课件第 26 页的图示表达了这一结构：`int*`、`const int*`、`list<int>::iterator`、`vector<int>::iterator` 和自定义 iterator 都进入 `iterator_traits`，算法统一取得上述关联类型。

---

## Template specialization

### Primary、full 与 partial specialization

`iterator_traits` 能处理 raw pointer，依赖于 template specialization（模板特化）。

设有主模板：

```cpp
template <class T1, class T2, int I>
class A {
    // primary template
};
```

当所有模板参数都指定时，可以提供 full specialization（全特化）：

```cpp
template <>
class A<int, double, 5> {
    // special implementation for A<int, double, 5>
};
```

当只限定一部分参数模式时，可以提供 partial specialization（偏特化）：

```cpp
template <class T2>
class A<int, T2, 3> {
    // special implementation for any A<int, T2, 3>
};
```

匹配原则是：

- 若实例化参数匹配更特殊的 specialization，就采用特殊版本；
- 没有匹配的 specialization 时，回退到 primary template。

### 演示代码

用一个参数的模板展示了全特化与“指针模式”的偏特化：

```cpp
#include <iostream>
using namespace std;

template <class T>
class A {
public:
    A() {
        cout << "primary template" << endl;
    }
};

template <>
class A<int> {
public:
    A() {
        cout << "full specialization: int" << endl;
    }
};

template <class T>
class A<T*> {
public:
    A() {
        cout << "partial specialization: pointer" << endl;
    }
};

struct Node {};

template <>
class A<Node> {
public:
    A() {
        cout << "full specialization: Node" << endl;
    }
};

int main() {
    A<double> a1;  // primary template
    A<int> a2;     // full specialization: int
    A<int*> a3;    // partial specialization: pointer
    A<Node> a4;    // full specialization: Node
    A<Node*> a5;   // partial specialization: pointer
}
```

`A<Node*>` 的匹配结果仍是 pointer partial specialization，因为实例化类型整体是指针；它所指向的是 `Node` 并不改变这一事实。

### 为何 traits 可以支持指针

对于正常 class-style iterator：

```cpp
IteratorTraits<ListIter<int>>::value_type
```

主模板可以读取：

```cpp
ListIter<int>::value_type
```

对于 raw pointer：

```cpp
IteratorTraits<int*>::value_type
```

偏特化匹配 `T*`，此时直接令：

```cpp
T = int
value_type = int
```

因此算法只需要统一写成：

```cpp
typename std::iterator_traits<I>::value_type
```

无需区分传入的是自定义 iterator 还是原生指针。

---

## Iterator category

### 五类迭代器能力

不同容器的遍历能力不同。STL 用 iterator category 描述 iterator 支持的操作层级。

| Category | 核心能力 | 典型操作 |
|---|---|---|
| `InputIterator` | 单向读取；通常只保证单趟读取语义 | `*it`、`++it`、比较 |
| `OutputIterator` | 单向写入 | `*it = value`、`++it` |
| `ForwardIterator` | 单向移动，可重复多趟访问 | `*it`、`++it`、比较 |
| `BidirectionalIterator` | 在 forward 基础上可反向移动 | `++it`、`--it` |
| `RandomAccessIterator` | 任意位置常数时间跳转和求距 | `it += n`、`it[n]`、`last - first` |

能力越强，算法能够采用的高效实现越多。

:::TIP
单向链表 iterator 只能自然地向后沿 `next` 移动，因此课堂实现的 `ListIter` 声明为 `forward_iterator_tag`；若是标准库 `std::list` 的双向链表 iterator，则属于 bidirectional iterator。
:::

### Category tag 的继承关系

用于 tag dispatch 的类别标记可以写成：

```cpp
struct input_iterator_tag {};
struct output_iterator_tag {};

struct forward_iterator_tag : public input_iterator_tag {};
struct bidirectional_iterator_tag : public forward_iterator_tag {};
struct random_access_iterator_tag : public bidirectional_iterator_tag {};
```

其可用于读取的能力链为：

```text
input_iterator_tag
        ↑
forward_iterator_tag
        ↑
bidirectional_iterator_tag
        ↑
random_access_iterator_tag
```

`output_iterator_tag` 单独描述写入型 iterator。`forward iterator` 具有更丰富访问能力

### 常见容器对应的能力

| 类型 | Iterator category | 说明 |
|---|---|---|
| 原生指针 `T*` | Random access | 指针算术支持常数时间跳转 |
| `vector<T>::iterator` | Random access | 连续存储，可 `it += n` |
| `list<T>::iterator` | Bidirectional | 双向链表，可 `++it` / `--it` |
| `set<T>::iterator` | Bidirectional | 按有序遍历顺序前进或后退；不能修改 key |
| 课堂 `ListIter<T>` | Forward | 单链表只能自然地沿 `next` 前进 |

---

## Tag dispatch：根据能力选择算法实现

### `advance()` 的不同实现

`advance(i, n)` 的目标是让 iterator 移动 `n` 个位置。

对于只有向前移动能力的 iterator，只能逐步前进：

```cpp
template <class InputIterator, class Distance>
void advance_II(InputIterator& i, Distance n) {
    while (n--) {
        ++i;
    }
}
```

对于 bidirectional iterator，可以处理负距离：

```cpp
template <class BidirectionalIterator, class Distance>
void advance_BI(BidirectionalIterator& i, Distance n) {
    if (n >= 0) {
        while (n--) {
            ++i;
        }
    } else {
        while (n++) {
            --i;
        }
    }
}
```

对于 random-access iterator，直接做算术跳转：

```cpp
template <class RandomAccessIterator, class Distance>
void advance_RAI(RandomAccessIterator& i, Distance n) {
    i += n;
}
```

复杂度区别：

| Iterator ability | 实现方式 | 时间复杂度 |
|---|---|---|
| Input / Forward | 重复 `++i` | `O(n)` |
| Bidirectional | 根据正负方向重复 `++i` 或 `--i` | `O(|n|)` |
| Random access | `i += n` | `O(1)` |

### 为什么仅靠模板参数名不能重载

下面三个模板参数名看起来不同：

```cpp
InputIterator
BidirectionalIterator
RandomAccessIterator
```

但它们都只是“待推导的类型参数名称”。若函数均只接收：

```cpp
(Iterator& i, Distance n)
```

则三个函数模板的参数形状完全相同，无法仅凭模板参数名称形成重载。

因此需要把真正不同的类型信息加入函数参数表：iterator category tag。

### 用 category tag 调度 `advance()`

使用 `__advance` 表示内部实现。下面采用 `detail::advance_impl` 避免用户代码中使用双下划线保留标识符，原理完全相同：

```cpp
#include <iterator>

namespace detail {

template <class InputIterator, class Distance>
void advance_impl(InputIterator& i,
                  Distance n,
                  std::input_iterator_tag) {
    while (n--) {
        ++i;
    }
}

template <class BidirectionalIterator, class Distance>
void advance_impl(BidirectionalIterator& i,
                  Distance n,
                  std::bidirectional_iterator_tag) {
    if (n >= 0) {
        while (n--) {
            ++i;
        }
    } else {
        while (n++) {
            --i;
        }
    }
}

template <class RandomAccessIterator, class Distance>
void advance_impl(RandomAccessIterator& i,
                  Distance n,
                  std::random_access_iterator_tag) {
    i += n;
}

} // namespace detail

template <class Iterator, class Distance>
void my_advance(Iterator& i, Distance n) {
    using Category =
        typename std::iterator_traits<Iterator>::iterator_category;

    detail::advance_impl(i, n, Category{});
}
```

调用：

```cpp
vector<int> v = {1, 2, 3, 4, 5};
auto iv = v.begin();
my_advance(iv, 3);     // 调用 random-access 版本，等价于 iv += 3

List<int> l;
l.push_front(1);
l.push_front(2);
l.push_front(3);
auto il = l.begin();
my_advance(il, 2);     // ListIter 为 forward，转用 input 实现
```

调度过程如下：

```text
Iterator
  -> std::iterator_traits<Iterator>::iterator_category
  -> 创建 category 临时对象
  -> 根据第三个参数的真实类型选择 advance_impl 重载
```

因为：

```cpp
forward_iterator_tag : public input_iterator_tag
```

而 forward iterator 的 `advance` 实现与 input iterator 相同，若没有单独编写 `forward_iterator_tag` 版本，forward tag 可以隐式向上转换为 input tag，从而自动调用 input 版本。

:::WARNING
对于 input 或 forward iterator，向前移动的距离应为非负值；负距离只有 bidirectional 或 random-access iterator 能正确处理。
:::

### `distance()` 的调度

`distance(first, last)` 返回两个 iterator 之间跨越的元素数量。

对于 input iterator，只能从 `first` 逐步移动到 `last`：

```cpp
namespace detail {

template <class InputIterator>
typename std::iterator_traits<InputIterator>::difference_type
distance_impl(InputIterator first,
              InputIterator last,
              std::input_iterator_tag) {
    typename std::iterator_traits<InputIterator>::difference_type n = 0;

    while (first != last) {
        ++first;
        ++n;
    }

    return n;
}

template <class RandomAccessIterator>
typename std::iterator_traits<RandomAccessIterator>::difference_type
distance_impl(RandomAccessIterator first,
              RandomAccessIterator last,
              std::random_access_iterator_tag) {
    return last - first;
}

} // namespace detail

template <class Iterator>
typename std::iterator_traits<Iterator>::difference_type
my_distance(Iterator first, Iterator last) {
    using Category =
        typename std::iterator_traits<Iterator>::iterator_category;

    return detail::distance_impl(first, last, Category{});
}
```

复杂度：

| Iterator category | `distance()` 实现 | 时间复杂度 |
|---|---|---|
| Input / Forward / Bidirectional | 逐步执行 `++first` | `O(n)` |
| Random access | `last - first` | `O(1)` |

对双向 iterator 而言，尽管它支持 `--`，给定 `[first, last)` 时仍通常通过正向遍历统计距离，因此可复用 input 版本。

---

## 设计总结与使用原则

Iterator 体系的完整关系为：

```text
Container
  知道底层数据结构与遍历方式
        |
        | exposes begin() / end() and iterator
        v
Iterator
  将移动和访问封装为 *, ->, ++, --, += 等统一接口
        |
        | queried by iterator_traits
        v
Traits
  提取 value_type / difference_type / pointer /
  reference / iterator_category
        |
        | used by algorithms and tag dispatch
        v
Algorithm
  不依赖 container 内部表示，并可根据能力选择高效实现
```

核心结论：

1. Iterator 是 pointer 概念的泛化，是 container 和 algorithm 之间的桥梁。
2. 算法通常处理半开区间 `[first, last)`，`last` 只作为终止位置，不能解引用。
3. 自定义容器只要提供符合约定的 iterator，就可以接入 range-based for 与 STL 通用算法。
4. `iterator_traits` 将 class iterator 和 raw pointer 的关联类型统一提取出来。
5. Template specialization 使 `iterator_traits<T*>` 与 `iterator_traits<const T*>` 可以直接支持原生指针。
6. Iterator category 描述能力层级；tag dispatch 允许同一算法针对不同能力采用不同复杂度的实现。
7. 通用 algorithm 只承诺基于 iterator 的通用复杂度。若某个容器具有更高效的成员算法，应优先考虑成员版本。

例如：

```cpp
set<int> s = {1, 2, 3, 4, 5};

find(s.begin(), s.end(), 4); // 通用线性遍历
s.find(4);                    // 利用有序集合结构查找，通常更高效
```

类似地，`std::sort` 需要 random-access iterator，因此不能直接排序 `std::list`；链表应使用自身提供的：

```cpp
list<int> l = {3, 1, 2};
l.sort();
```

> 高层算法依赖稳定抽象，底层容器负责提供符合抽象且匹配自身结构的 iterator。这正是 STL 可以同时保持通用性与效率的重要原因。

---
