---
title: STL
published: 2026-03-20
description: "STL : containers、algorithms、iterators"
tags: [面向对象程序设计]
category: 笔记
draft: false
---

## 概述

- STL 是什么，为什么值得用
- STL 的三大部分：containers / algorithms / iterators
- 几个最典型的容器：`vector`、`list`、`map`、`stack`
- STL 中“容器存数据，算法处理区间，迭代器把两者连接起来”的统一思路
- 使用 STL 时最常见的几个 pitfall

## 目录

- [概述](#概述)
- [目录](#目录)
- [STL](#stl)
- [STL 的三大部分](#stl-的三大部分)
  - [Containers](#containers)
  - [Algorithms](#algorithms)
  - [Iterators](#iterators)
- [Containers](#containers-1)
  - [Sequential containers](#sequential-containers)
  - [Associative containers](#associative-containers)
  - [Unordered associative containers](#unordered-associative-containers)
  - [Container adaptors](#container-adaptors)
- [vector：最常用的动态顺序容器](#vector最常用的动态顺序容器)
  - [vector 的特点](#vector-的特点)
  - [vector 的常见操作](#vector-的常见操作)
- [list：链表式顺序容器](#list链表式顺序容器)
  - [list 的特点](#list-的特点)
- [map：键值对容器](#map键值对容器)
- [stack：容器适配器](#stack容器适配器)
- [Algorithms](#algorithms-1)
- [Iterators：连接容器与算法](#iterators连接容器与算法)
- [Typedef、using 与 auto](#typedefusing-与-auto)
  - [typedef](#typedef)
  - [using](#using)
  - [auto](#auto)
- [自定义类如何接入 STL](#自定义类如何接入-stl)
- [Pitfalls](#pitfalls)
  - [vector 非法下标访问](#vector-非法下标访问)
  - [map 的 silent insertion](#map-的-silent-insertion)
  - [list.size() vs empty()](#listsize-vs-empty)
  - [erase 后 iterator 失效](#erase-后-iterator-失效)

---

## STL

`STL` 是 `Standard Template Library`，也就是 C++ 标准库中和泛型编程密切相关的一部分。

> STL 提供了一套常用的数据结构和算法，并且这些工具可以通过模板适配不同类型。
- 尽量复用标准库已有能力
- 用统一接口操作不同数据结构
- 少自己造轮子


**为什么使用 STL** ?

核心原因：

- **Reduced development time**：很多常用结构和算法已经写好，不必自己从零实现
- **Code readability**：看到 `vector`、`map`、`sort`，代码意图往往比手写数组和循环更清楚
- **Robustness**：标准库组件被大量使用和测试，可靠性通常高于临时手写版本
- **Portable code**：它是标准库的一部分，跨平台、跨编译器时更稳定
- **Maintainable code**：后续自己或别人回来读代码时，更容易理解和修改

---

## STL 的三大部分

STL 可以先拆成三块来看:

### Containers

容器负责 **存数据**。

例如：

- `vector`
- `list`
- `map`
- `set`

你可以把它们看成“数据放在哪里、怎么组织”。

### Algorithms

算法负责 **处理数据区间**。

例如：

- `find`
- `count`
- `sort`
- `min_element`

它们本身通常不关心底层到底是不是 `vector` 或 `list`，而是通过一对迭代器去工作。

### Iterators

迭代器负责 **把容器和算法接起来**。

它像“广义指针（generalized pointer）”，让算法可以用统一方式访问不同容器中的元素。

所以这三者的关系可以记成：

> container 存元素，algorithm 处理范围，iterator 负责访问与连接。

---

## Containers

### Sequential containers

顺序容器强调“元素按位置排列”。

这讲提到的典型成员：

- `array`：静态数组
- `vector`：动态数组
- `deque`：double-ended queue
- `forward_list`：单向链表
- `list`：双向链表

### Associative containers

关联容器强调“按 key 组织和查找”。

典型成员：

- `set`
- `map`
- `multiset`
- `multimap`

其中：

- `set` 主要存 key
- `map` 存 key-value pair

### Unordered associative containers

这一类也是按 key 管理，但底层思路偏哈希。

典型成员：

- `unordered_set`
- `unordered_map`
- `unordered_multiset`
- `unordered_multimap`

### Container adaptors

这类不是全新的底层结构，而是对已有容器接口做“包装”。

例如：

- `stack`
- `queue`
- `priority_queue`

它们会限制你能使用的操作，让接口更贴近某种抽象模型。

---

## vector：最常用的动态顺序容器

`vector` 可以先把它理解成“会自动扩容的数组”。  

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> x;
    for (int a = 0; a < 1000; a++)
        x.push_back(a);

    vector<int>::iterator p;
    for (p = x.begin(); p < x.end(); p++)
        cout << *p << " ";
}
```

这个例子体现了两个最基础的点：

- 用 `push_back` 逐个加入元素
- 用 iterator 从 `begin()` 走到 `end()`

### vector 的特点

- 本质上是动态数组
- 元素连续存储
- 随机访问很方便
- 在尾部追加元素非常常见

所以在很多“先装一批数据，再遍历/排序/查找”的场景里，`vector` 往往是默认选择。

### vector 的常见操作

**1. Constructor / Destructor**

先创建对象，生命周期结束时自动销毁。

**2. Element access**

代表性接口：

- `at()`
- `operator[]`
- `front()`
- `back()`
- `data()`

理解重点：

- `[]` 用起来最直接
- `front()` / `back()` 分别取首元素和尾元素

**3. Iterators**

代表性接口：

- `begin()`
- `end()`
- `cbegin()`
- `cend()`

其中 `begin()` 指向第一个元素，`end()` 指向“最后一个元素的后面一个位置”。

**4. Capacity**

代表性接口：

- `empty()`
- `size()`
- `reserve()`
- `capacity()`

这一组主要关注“现在有多少元素”和“底层预留了多少空间”。

**5. Modifiers**

代表性接口：

- `clear()`
- `insert()`
- `erase()`
- `push_back()`

这组是最常改动容器内容的操作。

:::TIP
`vector` 虽然像数组，但不要把它当成“会自动允许任意下标写入”的结构。  
如果当前没有对应位置，直接写 `v[100] = 1;` 仍然可能出问题。
:::

---

## list：链表式顺序容器

`list` 是链表风格的顺序容器。  
并不是所有顺序容器都像 `vector` 一样适合随机访问。


```cpp
#include <iostream>
#include <string>
#include <list>
using namespace std;

int main() {
    list<string> s;
    s.push_back("hello");
    s.push_back("world");
    s.push_back("stl");

    list<string>::iterator p;
    for (p = s.begin(); p != s.end(); p++)
        cout << *p << " ";
}
```

这个例子说明：

- `list` 一样可以 `push_back`
- 一样可以用 iterator 遍历
- 但遍历条件通常写成 `p != s.end()`，而不是像 `vector` 那样用 `<`

### list 的特点

- 适合频繁插入、删除的场景
- 不适合像数组那样按下标快速随机访问
- 使用时更依赖 iterator，而不是整数下标

- `vector`：更像动态数组
- `list`：更像链表

---

## map：键值对容器

`map` 是很重要的一类关联容器，用来存 **key-value pair**。

可以先把它类比成电话簿：

- `name` 是 key
- `phone` 是 value

也就是说，你不是按“第几个元素”来找，而是按 key 来查。

示例：

```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, float> price;
    price["snapple"] = 0.75;
    price["coke"] = 0.50;

    string item;
    double total = 0;
    while (cin >> item)
        total += price[item];
}
```

这段代码的意思很直接：

- 先建立商品到价格的映射
- 再根据输入的商品名去查对应价格

map 的重点

- 它存的是 key-value pair
- 通过 key 查找 value
- 默认属于 **有序关联容器**
- 很适合做“查表”类问题

比如：

- 电话簿
- 成绩表
- 商品价格表
- 词频统计结果

:::WARNING
`map` 的 `operator[]` 很方便，但也可能带来“silent insertion”的坑。  
也就是你本来只是想查一下 key 是否存在，结果却悄悄插入了一个新条目。
:::

---

## stack：容器适配器
> 后进先出（LIFO, last in first out）

最常见操作就是：

- `push`
- `pop`
- `top`

你可以把它理解成“只能从一端放入和拿出元素”的容器接口。

`stack` 是一种 **container adaptor**。
- 底层可以基于别的容器
- 对外只暴露符合 stack 抽象的那部分操作

好处是接口更清晰。  
当你说“这里用 stack”时，别人马上知道你的数据访问模式是 LIFO，而不是任意位置都能操作。

---

## Algorithms

STL 算法通常工作在一个区间上：

$$
[first, last)
$$

- 包含 `first`
- 不包含 `last`

这和很多 STL 接口的习惯是一致的。

查找/遍历类：

- `for_each`
- `find`
- `count`

复制/改写类：

- `copy`
- `fill`
- `transform`
- `replace`
- `rotate`

排序/选择类：

- `sort`
- `partial_sort`
- `nth_element`

集合与极值类：

- `set_difference`
- `set_union`
- `min_element`
- `max_element`

数值计算类：

- `accumulate`
- `partial_sum`

> STL 已经给了很多现成算法，很多时候只需要把区间交给它，而不是自己重写循环。

---

## Iterators：连接容器与算法

iterator 可以理解成 **generalized pointer**。
也就是说，它和普通指针很像，但服务对象不只是一块裸数组，而是各种 STL 容器。

它的核心作用是：

- 统一访问元素的方式
- 把容器和算法连接起来

例如：

- `vector` 有 `begin()` / `end()`
- `list` 也有 `begin()` / `end()`
- 算法拿到 iterator 区间后，就能用统一方式工作

所以你会看到 STL 的很多设计都围绕这一点展开：

- 容器负责提供 iterator
- 算法通过 iterator 操作元素

---

## Typedef、using 与 auto

STL 类型一旦嵌套起来，名字会很长。

例如：

```cpp
map<Name, list<PhoneNum>> phonebook;
map<Name, list<PhoneNum>>::iterator finger;
```

这种写法在语法上没问题，但写起来很累，读起来也费劲。

### typedef

传统写法是：

```cpp
typedef map<Name, list<PhoneNum>> PB;
PB phonebook;
PB::iterator finger;
```

- 给复杂类型起一个短名字
- 降低阅读负担

### using

现代 C++ 里，很多场合会更喜欢用 `using`：

```cpp
using PB = map<Name, list<PhoneNum>>;
PB phonebook;
```

它和 `typedef` 在这里的目的相同，但可读性通常更好。

### auto

如果变量类型已经能从右边推导出来，也可以直接让编译器推：

```cpp
auto it = phonebook.begin();
```

> STL 很强，但类型名也可能很长；`typedef`、`using`、`auto` 都是在降低书写和阅读成本。

---

## 自定义类如何接入 STL

STL 不只服务内置类型，也可以服务你自己写的类。  
但前提是：你的类型得满足对应容器或算法需要的操作。

- 可能需要赋值运算符 `operator=`
- 可能需要默认构造函数
- 如果要进入 `set`、`map` 这类有序容器，通常还需要 `<` 比较，也就是 `operator<`

```cpp
#include <cstring>
#include <map>
using namespace std;

struct full_name {
    char* first;
    char* last;

    bool operator<(full_name& a) {
        return strcmp(first, a.first) < 0;
    }
};

map<full_name, int> phonebook;
```

- `map` 需要知道 key 之间如何比较
- 如果 key 是你自定义的类型，那你就要提供比较规则


## Pitfalls

### vector 非法下标访问

现象：

```cpp
vector<int> v;
v[100] = 1; // Whoops!
```

为什么会出问题：

- `vector` 为空时，并没有第 `100` 个元素
- `operator[]` 不会帮你自动扩容到那个位置
- 这样访问属于无效元素访问

推荐写法：

- 动态追加时，用 `push_back()`
- 需要预留空间时，用构造函数或 `resize()`

例如：

```cpp
vector<int> v;
v.push_back(1);

vector<int> w(101);
w[100] = 1;
```

### map 的 silent insertion

现象：

```cpp
if (foo["bob"] == 1) {
    // ...
}
```

为什么会出问题：

- 你看起来只是想检查 `"bob"` 是否存在
- 但 `foo["bob"]` 可能会悄悄创建一个新条目

这就叫 **silent insertion**。

推荐写法：

```cpp
if (foo.count("bob")) {
    // ...
}

// C++20
if (foo.contains("bob")) {
    // ...
}
```

- 想“查有没有这个 key”，优先用 `count()` / `contains()`
- 想“真的取值”，再用 `operator[]`

### list.size() vs empty()

在较早标准里，`list.size()` 不一定保证常数时间。

现象：

```cpp
if (my_list.size() == 0) {
    // ...
}
```

更稳妥的写法：

```cpp
if (my_list.empty()) {
    // ...
}
```

为什么推荐 `empty()`：

- 语义更直接
- 就是在表达“这个容器是不是空的”

即使在现代标准下这件事没那么敏感，`empty()` 依然是更清晰的表达。

### erase 后 iterator 失效

现象：

```cpp
list<int> L;
list<int>::iterator li;
li = L.begin();
L.erase(li);
++li; // WRONG
```

为什么会出问题：

- `erase(li)` 之后，原来的 `li` 已经失效了
- 这时再继续 `++li` 就是不安全的

推荐写法：

```cpp
li = L.erase(li); // RIGHT
```

因为 `erase()` 会返回一个新的合法 iterator，指向被删元素后面的位置。
