---
title: Iterators
published: 2026-02-28
description: C++ Iterators相关笔记
tags: [CS106L]
category: 笔记
draft: false
---

本文深入讲解 C++ STL 中的迭代器（Iterator）概念，阐述了为什么需要 Iterator 以及它如何统一不同容器的访问方式。内容涵盖 Iterator 的基本操作、Map Iterator 的特殊性（返回键值对）、`lower_bound`/`upper_bound` 区间遍历技巧、五大 Iterator 分类体系及其对算法的影响、const 迭代器的使用、Iterator 失效问题，以及 Iterator 在 STL 泛型编程中作为"容器与算法之间桥梁"的核心地位，并深入分析了 `[begin, end)` 半开区间设计和 `std::find` 等算法的使用模式。

## 目录

- [为什么需要 Iterator？](#为什么需要-iterator)
- [基本概念](#基本概念)
- [遍历方式对比](#遍历方式对比)
- [Map Iterators](#map-iterators)
- [Further Iterator Usages：`lower_bound` / `upper_bound` 与区间遍历](#further-iterator-usageslower_bound--upper_bound-与区间遍历)
- [Iterator Types](#iterator-types)
- [The Result：Iterator 带来的抽象收益](#the-resultiterator-带来的抽象收益)
- [Iterator 的本质](#iterator-的本质)
- [Const Iterator](#const-iterator)
- [Iterator Categories](#iterator-categories)
- [为什么 sort 不能用于 list？](#为什么-sort-不能用于-list)
- [Iterator Invalidation](#iterator-invalidation)
- [begin() / end() 设计思想](#begin--end-设计思想)
- [Iterator + Algorithms：用 `[begin, end)` 描述范围](#iterator--algorithms用-begin-end-描述范围)
- [STL 架构理解](#stl-架构理解)
- [核心总结](#核心总结)

---

> [!TIP]
> Iterators allow iteration over any container , whether it is ordered or not.

> [!NOTE]
> Iterator 是 STL 的核心抽象。
> 它是“容器”与“算法”之间的桥梁。

---

## 为什么需要 Iterator？

Sequence Containers：

- 通过 index 访问（如 `v[i]`）

Associative Containers：

- 没有 index
- 不能用下标遍历

为统一访问方式，STL 引入：

> Iterator（迭代器）—— 泛化的指针。

---

## 基本概念

```cpp
auto it = container.begin();
```

- `begin()`：指向第一个元素
- `end()`：指向“最后一个元素之后”
- `*it`：访问当前元素
- `++it`：移动到下一个元素

> [!WARNING]
> `end()` 不指向有效元素！

---

## 遍历方式对比

### 1️⃣ 下标遍历（仅适用于 vector/deque）

```cpp
for (int i = 0; i < v.size(); ++i) {
    cout << v[i];
}
```

---

### 2️⃣ Iterator 遍历（所有容器适用）

```cpp
for (auto it = v.begin(); it != v.end(); ++it) {
    cout << *it;
}
```

---

### 3️⃣ Range-based for

```cpp
for (auto elem : v) {
    cout << elem;
}
```

等价于：

```cpp
for (auto it = v.begin(); it != v.end(); ++it)
```

---

## Map Iterators

`std::map<K, V>` 的 iterator **解引用不是 value**，而是一个键值对：

> `std::pair<const K, V>`

也就是说：

- `key` 是 **const**（不能改）
- `value` 可以改

> [!NOTE]
> key 之所以是 const：
> map 的内部结构依赖 key 的排序（红黑树等），改 key 会破坏数据结构不变量。

---

### 1️⃣ 基本遍历（iterator 写法）

```cpp
std::map<int, int> m{{1, 2}, {3, 4}};

for (auto it = m.begin(); it != m.end(); ++it) {
    // it 指向一个 pair<const K, V>
    std::cout << it->first << ":" << it->second << std::endl;
}
```

等价写法：

```cpp
auto key1 = (*it).first;
auto key2 = it->first;   // 更常用（-> 是 iterator 的语法糖）
```

---

### 2️⃣ Range-based for + structured binding（最推荐）

```cpp
for (const auto& [key, value] : m) {
    std::cout << key << ":" << value << std::endl;
}
```

- `[key, value]` 来自对 `pair<const K, V>` 的 structured binding
- `const auto&`：避免拷贝 + 明确只读 key/value（更安全）

> [!TIP]  
> 遍历 map 时优先用：  
> `for (const auto& [k, v] : m)`  
> 读起来最清晰，也不会发生不必要的拷贝。

---

### 3️⃣ find 的经典用法

```cpp
auto it = m.find(3);
if (it == m.end()) {
    // 没找到
} else {
    // 找到了：it->first 是 key（const），it->second 是 value（可改）
    it->second += 1;
}
```

> [!WARNING]  
> 不要对 `it->first` 赋值（key 是 const）：
>
> ```cpp
> it->first = 10; // ❌ 编译错误
> ```

---

## Further Iterator Usages：`lower_bound` / `upper_bound` 与区间遍历

在 **有序关联容器**（`set/map/multiset/multimap`）里，我们可以用 `lower_bound` 和 `upper_bound` 拿到一个 **iterator 区间**，再像遍历 `[begin, end)` 一样遍历这个区间。

---

### `lower_bound` / `upper_bound` 定义（有序容器）

- `lower_bound(k)`：返回第一个 **不小于** `k` 的元素位置（第一个 `>= k`）
- `upper_bound(k)`：返回第一个 **大于** `k` 的元素位置（第一个 `> k`）

如果不存在对应元素，返回 `end()`（past-the-end）。

> [!NOTE]
> 它们返回的都是 **iterator**，因此可以直接用来构造一个半开区间：
> `[lower_bound(k1), upper_bound(k2))`

```cpp
std::set<int> mySet{1, 3, 57, 137};

auto iter = mySet.lower_bound(2);   // 第一个 >= 2  -> 指向 3
auto end  = mySet.upper_bound(57);  // 第一个 > 57  -> 指向 137

while (iter != end) {
    std::cout << *iter << std::endl;  // 输出 3, 57
    ++iter;
}
```

这个例子体现了：**iterator 不仅能遍历整个容器，也能遍历容器中的“一个子区间”。**

> [!TIP]  
> 记住一句话：  
> `lower_bound` 是“左边界”，`upper_bound` 是“右边界（开区间）”，  
> 两者天然形成 `[L, R)` 的 STL 风格范围。

---

## Iterator Types

STL 的核心思想之一：**算法不依赖容器本身，而依赖 iterator 的“能力”**。  
因此不同容器的 iterator 类型不同，会直接决定你能用哪些算法（例如：`std::sort`）。

> [!NOTE]
> Iterator type 不是“容器名字”，而是“这个迭代器支持哪些操作”的能力集合。

---

### 1️⃣ 五大 Iterator Category（从弱到强）

| Category                   | 核心能力                                     | 常见例子 / 容器                      |
| -------------------------- | -------------------------------------------- | ------------------------------------ |
| **Input Iterator**         | 只读、单趟（single-pass）、`++it`、`*it` 读  | `istream_iterator`                   |
| **Output Iterator**        | 只写、单趟、`++it`、`*it = value` 写         | `ostream_iterator`、`back_inserter`  |
| **Forward Iterator**       | 可读写、多趟（multi-pass）、单向 `++it`      | `forward_list`                       |
| **Bidirectional Iterator** | 在 Forward 基础上支持 `--it`（双向）         | `list`, `map`, `set`                 |
| **Random Access Iterator** | 支持跳跃：`it+n`、`it-n`、`it[i]`、`it1<it2` | `vector`, `deque`, `array`、原生指针 |

> [!TIP]
>
> - `vector`：Random Access（能跳着走）
> - `list/map/set`：Bidirectional（能前后走，但不能跳）
> - `forward_list`：Forward（只能往前）

---

### 2️⃣ Algorithms 对 Iterator 有最低能力要求

很多算法签名看起来是：

```cpp
algo(begin, end, ...);
```

但它们隐含了 iterator 能力要求：

- `std::sort(begin, end)` **需要 Random Access Iterator**  
   ✅ `vector` 可以  
   ❌ `list` / `map` / `set` 不行（它们不是 random access）

> [!WARNING]  
> `std::sort(list.begin(), list.end())` 会报错：不是因为 list 不能排序，而是因为它的 iterator 不能 `it + n`。

---

### 3️⃣ `std::distance` / `std::advance` 的复杂度会因 iterator 类型变化

- Random Access：`distance` / `advance` 可以 O(1)（直接算/跳）
- Bidirectional / Forward：可能需要一步步走 → O(n)

> [!NOTE]  
> 所以写泛型代码时，**iterator 类型会影响性能**，不仅影响“能不能编译”。

---

### 4️⃣ 容器往往提供更适合自己的成员算法

当标准算法因为 iterator 限制不可用时，容器可能提供自己的版本：

- `std::list` 有 `list.sort()`（链表适合用合并排序等实现）
- `std::map / std::set` 查找应使用成员函数：
  - `m.find(k)` / `s.find(k)`（对数级）
  - 而不是 `std::find(begin, end, k)`（线性）

> [!TIP]  
> 一个实用原则：
>
> - **关联容器（map/set）优先用成员函数（find/lower_bound/upper_bound）**
> - **序列容器（vector/list）更多用 STL algorithm（sort/find/accumulate）**

---

## The Result：Iterator 带来的抽象收益

> Iterator 让我们可以用**同一套遍历代码**完成某个“逻辑动作”，而**不需要关心底层容器是什么数据结构**。

只要容器支持：

- `begin()` / `end()`：给出遍历的起点和终点（半开区间 `[begin, end)`）
- `++it`：移动到下一个元素
- `*it`：访问当前元素

就能写出统一的遍历逻辑，例如“统计某个元素出现次数”：

```cpp
int numOccurrences(set<int>& cont, int elemToCount) {
    int counter = 0;
    for (auto it = cont.begin(); it != cont.end(); ++it) {
        if (*it == elemToCount) ++counter;
    }
    return counter;
}
```

> [!NOTE]  
> 这里选择 `set` 只是为了展示“iterator 遍历接口统一”的效果：同样的写法也适用于 `vector/list/map/...`（只要它们提供迭代器）。

> [!TIP]  
> 这体现了 STL 的核心思想：  
> **容器提供 iterator，算法/逻辑只依赖 iterator 工作**，从而做到“代码与底层数据结构解耦”。

---

## Iterator 的本质

- 类似指针（pointer-like object）
- 但并不一定是真正的指针

例如：

- `vector` 的 iterator 可能是指针
- `list` 的 iterator 是复杂对象

---

## Const Iterator

```cpp
vector<int>::const_iterator it;
```

或：

```cpp
auto it = v.cbegin();
```

- 不能修改元素
- 保证只读访问

```cpp
*it = 5; // ❌
```

---

## Iterator Categories

不同容器支持不同能力。

| 类型                   | 支持能力       | 典型容器       |
| ---------------------- | -------------- | -------------- |
| Input Iterator         | 只读、向前     | istream        |
| Output Iterator        | 只写、向前     | ostream        |
| Forward Iterator       | 多次遍历、向前 | forward_list   |
| Bidirectional Iterator | 可前进、后退   | list, set, map |
| Random Access Iterator | 可跳跃访问     | vector, deque  |

---

### Random Access Iterator 支持：

```cpp
it + 3
it - 2
it[5]
it2 - it1
```

list 不支持这些操作。

---

## 为什么 sort 不能用于 list？

```cpp
std::sort(list.begin(), list.end()); // ❌
```

原因：

- `std::sort` 需要 Random Access Iterator
- list 只提供 Bidirectional Iterator

> 算法根据 iterator 能力决定是否可用。

---

## Iterator Invalidation

修改容器后，iterator 可能失效。

### vector

- 扩容后，所有 iterator 失效
- 插入中间元素可能失效

### list

- 插入/删除一般不会使其他 iterator 失效

> [!WARNING]
> 修改容器后继续使用旧 iterator 是常见错误。

---

## begin() / end() 设计思想

为什么 end() 指向“最后一个之后”？

这样可以写：

```cpp
for (auto it = begin; it != end; ++it)
```

避免越界访问。

这是半开区间设计：

```
[begin, end)
```

---

## Iterator + Algorithms：用 `[begin, end)` 描述范围

STL 算法通常不直接接收 “容器”，而是接收一个 **iterator 范围**：

> `[begin, end)`（左闭右开区间）

这意味着我们可以对不同容器复用同一套算法接口，只要它们能提供 iterator。

---

### 1️⃣ `std::sort(begin, end)`：对区间排序

```cpp
std::sort(vec.begin(), vec.end());
```

- `vec.begin()`：指向第一个元素
- `vec.end()`：**指向最后一个元素的后一个位置（past-the-end）**  
   不是元素本身，因此 **不能解引用** `*vec.end()`。

> [!NOTE]  
> `end()` 的含义很关键：它是一个“哨兵位置”，用于表示遍历结束。  
> 所有遍历都以 `it != end()` 为循环条件，永远不会访问到 `end()` 指向的“位置”。

---

### 2️⃣ `std::find(begin, end, x)`：查找元素

```cpp
auto it = std::find(vec.begin(), vec.end(), elemToFind);
if (it == vec.end()) {
    // Not found
} else {
    // Found: *it == elemToFind
}
```

- 找到：返回指向目标元素的 iterator
- **没找到：返回 `end()`**（也就是“末尾后一个位置”）

> [!WARNING]  
> “没找到”并不是返回最后一个元素，也不是返回某个空值，  
> 而是返回 `end()` —— 这是一个合法 iterator，但**不可解引用**。

> [!TIP]  
> 判断 find 是否成功的标准写法就是：  
> `if (it == cont.end())` → 没找到  
> `else` → 找到了，可以安全使用 `*it` 或 `it->...`

- **`std::find` 是线性查找 O(n)**，而 `map/set` 应该用成员函数 `find`（对有序关联容器是 `O(log n)`）。

---

## STL 架构理解

```
Containers
    ↓
Iterators
    ↓
Algorithms
```

Iterator 是三者之间的抽象接口。

---

## 核心总结

- Iterator 是泛化指针
- 它统一所有容器的访问方式
- 它使算法与容器解耦
- 不同容器支持不同级别的 iterator
- 修改容器可能导致 iterator 失效

---

> [!TIP]  
> Iterator 是 STL 泛型编程的核心。  
> 它不是“遍历工具”，而是“抽象接口”。

> [!WARNING]  
> 修改容器后继续使用旧 iterator 是高频错误。
