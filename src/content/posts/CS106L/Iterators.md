---
title: Iterators
published: 2026-02-28
description: C++ Iterators相关笔记
tags: [CS106L]
category: 笔记
draft: false
---

本文深入讲解 C++ STL 中的迭代器（Iterator）概念，阐述了为什么需要 Iterator 以及它如何统一不同容器的访问方式。内容涵盖 Iterator 的基本操作、分类体系（从 Input Iterator 到 Random Access Iterator）、const 迭代器的使用、Iterator 失效问题，以及 Iterator 在 STL 泛型编程中作为"容器与算法之间桥梁"的核心地位。

## 目录

- [为什么需要 Iterator？](#为什么需要-iterator)
- [基本概念](#基本概念)
- [遍历方式对比](#遍历方式对比)
- [Iterator 的本质](#iterator-的本质)
- [Const Iterator](#const-iterator)
- [Iterator Categories](#iterator-categories)
- [为什么 sort 不能用于 list？](#为什么-sort-不能用于-list)
- [Iterator Invalidation](#iterator-invalidation)
- [begin() / end() 设计思想](#begin--end-设计思想)
- [Iterator 与 Algorithms](#iterator-与-algorithms)
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

### 3️⃣ Range-based for（语法糖）

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

## Iterator 与 Algorithms

STL 算法不依赖容器。

例如：

```cpp
std::sort(v.begin(), v.end());
std::find(v.begin(), v.end(), 10);
```

算法只依赖 iterator，而不关心容器类型。

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
