---
title: Templates
published: 2026-03-01
description: C++ Templates相关笔记
tags: [CS106L]
category: 笔记
draft: true
---

本文系统讲解 C++ 模板（Templates）的核心概念与实践技巧，涵盖函数模板的定义与使用、隐式接口（Implicit Interface）的工作原理、结构化绑定（Structured Binding）中值/引用/const 引用的区别、变参模板（Variadic Templates）的语法与应用，以及概念提升（Concept Lifting）如何通过显式约束提升模板代码的可读性和错误诊断质量。重点展示了如何用 iterator 风格编写真正泛型的算法，并引入 C++20 Concepts 作为现代模板约束机制。

## 目录

- [目录](#目录)
- [Template Functions](#template-functions)
  - [Example: `myminmax`](#example-myminmax)
    - [隐式接口（Implicit Interface）](#隐式接口implicit-interface)
    - [Generic I/O helper：打印 min/max 也可以模板化](#generic-io-helper打印-minmax-也可以模板化)
    - [Explicit template arguments](#explicit-template-arguments)
    - [Structured binding](#structured-binding)
  - [拷贝 vs 引用绑定：`auto` / `auto&` / `const auto&`](#拷贝-vs-引用绑定auto--auto--const-auto)
    - [值绑定（拷贝/移动）：`auto [a, b] = expr;`](#值绑定拷贝移动auto-a-b--expr)
    - [引用绑定（可修改原对象）：`auto& [a, b] = obj;`](#引用绑定可修改原对象auto-a-b--obj)
    - [const 引用绑定（只读 + 避免拷贝）：`const auto& [a, b] = expr;`](#const-引用绑定只读--避免拷贝const-auto-a-b--expr)
    - [什么时候用哪一种？](#什么时候用哪一种)
  - [Example: 用 iterators 写泛型算法 `mismatch`](#example-用-iterators-写泛型算法-mismatch)
    - [STL 风格范围：`[first, last)`](#stl-风格范围first-last)
    - [隐式接口（Implicit Interface）](#隐式接口implicit-interface-1)
- [Variadic Templates](#variadic-templates)
  - [1️⃣ 最小例子：接收任意数量参数并打印](#1️⃣-最小例子接收任意数量参数并打印)
  - [2️⃣ Pack expansion](#2️⃣-pack-expansion)
  - [3️⃣ Variadic 最常见用途](#3️⃣-variadic-最常见用途)
- [Concept Lifting](#concept-lifting)
  - [1️⃣ 从 `countOccurences` 的坏例子看“隐式要求”](#1️⃣-从-countoccurences-的坏例子看隐式要求)
  - [2️⃣ 改成 iterator 风格：更通用，也更接近 STL](#2️⃣-改成-iterator-风格更通用也更接近-stl)
  - [3️⃣ “类型错位”会导致奇怪报错](#3️⃣-类型错位会导致奇怪报错)
- [Implicit Interfaces \& Concepts](#implicit-interfaces--concepts)
  - [1️⃣ Implicit Interface 是什么？](#1️⃣-implicit-interface-是什么)
  - [2️⃣ Concepts](#2️⃣-concepts)
  - [3️⃣ 没有 concepts 时怎么做？](#3️⃣-没有-concepts-时怎么做)

## Template Functions

### Example: `myminmax`

当多个函数 **逻辑完全相同**，只是参数/返回值类型不同（如 `int` vs `string`），就适合用函数模板合并：

```cpp
template <typename T>
std::pair<T, T> my_minmax(T a, T b) {
    if (a < b) return {a, b};
    else       return {b, a};
}
```

- `T` 是 **编译期类型参数**
- 编译器会根据调用自动推导 `T` 并生成对应版本（实例化）

#### 隐式接口（Implicit Interface）

模板能否用于某种类型 `T`，取决于模板内部对 `T` 做了哪些操作：

- 上面的 `my_minmax` 用到了 `a < b`
  - ✅ 要求：`T` 必须支持 `<` 比较
  - 否则：当模板实例化到该类型时编译报错

#### Generic I/O helper：打印 min/max 也可以模板化

如果希望 `printMinAndMax` 不局限于 `int`：

```cpp
template <typename T>
void printMinAndMax(const T& min, const T& max) {
    std::cout << "Min: " << min << "\n";
    std::cout << "Max: " << max << "\n\n";
}
```

- 用 `const T&`：避免拷贝，且更通用
- 隐式要求：`T` 必须可输出到流（支持 `operator<<`）

---

#### Explicit template arguments

大多数时候编译器会自动推导 `T`，但你也可以在调用时显式指定：

```cpp
auto [min1, max1] = my_minmax<double>(4.2, -7.9);
auto [min2, max2] = my_minmax<std::string>("Avery", "Anna");
auto [min3, max3] = my_minmax<int>(3, 3);
```

显式指定 `T` 的常见用途：

- **解决类型推导冲突**：例如 `my_minmax(2, 2.3)` 推导失败（一个 `int` 一个 `double`），可以写成：

```cpp
auto [min, max] = my_minmax<double>(2, 2.3); // 让 2 提升为 2.0
```

- **强制选择你想要的版本**（哪怕参数能转换）

> [!NOTE]  
> 显式指定 `T` 并不会取消“隐式接口”要求：  
> `my_minmax<T>` 仍然要求 `T` 支持 `<`，否则一样编译报错。

---

#### Structured binding

`auto [min, max] = ...` 到底发生了什么？

`my_minmax<T>(...)` 的返回类型是 `std::pair<T, T>`。

```cpp
auto [minV, maxV] = my_minmax<double>(4.2, -7.9);
```

等价直觉是：

1. 先得到一个 `std::pair<double, double>` 的对象（临时值）
2. 再把它的 `.first` 和 `.second` 拆出来，分别命名为 `minV` / `maxV`

因此 `minV`、`maxV` 的类型会**跟随返回的 pair 中元素的类型**变化：

- `my_minmax<double>` → `minV/maxV` 都是 `double`
- `my_minmax<std::string>` → `minV/maxV` 都是 `std::string`

---

### 拷贝 vs 引用绑定：`auto` / `auto&` / `const auto&`

Structured binding 的三种常见写法会决定：拆出来的是 **“值（拷贝/移动）”** 还是 **“引用（绑定到原对象成员）”**。

#### 值绑定（拷贝/移动）：`auto [a, b] = expr;`

```cpp
auto [a, b] = somePair;
```

含义：

- `a`、`b` 是新变量（值）
- 通常来自 `somePair.first/second` 的拷贝或移动
- 修改 `a/b` 不会影响 `somePair`

适用：

- 最简单安全；右侧是临时值（函数返回）时非常常用

---

#### 引用绑定（可修改原对象）：`auto& [a, b] = obj;`

```cpp
auto& [a, b] = somePair;
a = 10; // 会影响 somePair.first
```

含义：

- `a`、`b` 是引用，直接绑定到 `somePair.first/second`
- 修改 `a/b` 会修改原对象

限制：

- 右侧必须是“还活着”的对象（有名字的变量）
- 不能绑定到临时值：

```cpp
auto& [a, b] = my_minmax(1, 2); // ❌ 临时对象，引用会悬空
```

---

#### const 引用绑定（只读 + 避免拷贝）：`const auto& [a, b] = expr;`

```cpp
const auto& [a, b] = somePair;       // 绑定到已有对象（只读）
const auto& [c, d] = my_minmax(1, 2); // ✅ 也可绑定临时值（延长生命周期）
```

含义：

- `a`、`b` 是 const 引用：不拷贝，但不能改
- 绑定临时值时，临时对象生命周期会延长到该引用作用域结束（所以安全）

---

#### 什么时候用哪一种？

- 想省心：`auto [a, b] = ...;`
- 想避免拷贝并且要改原对象：`auto& [a, b] = obj;`
- 想避免拷贝但只读：`const auto& [a, b] = ...;`

> [!TIP]  
> 在遍历 `map` 时常用 `for (const auto& [k, v] : m)`：  
> 不拷贝 pair，语义只读更安全（而且 map 的 key 本来就不可改）。

---

### Example: 用 iterators 写泛型算法 `mismatch`

`mismatch` 的目标：同时遍历两个序列，找到第一处“不相等”的位置，并返回那一对 iterator。

```cpp
template <typename InputIt1, typename InputIt2>
std::pair<InputIt1, InputIt2>
mismatch(InputIt1 first1, InputIt1 last1, InputIt2 first2) {
    while (first1 != last1 && *first1 == *first2) {
        ++first1;
        ++first2;
    }
    return {first1, first2}; // 指向第一处 mismatch（或 first1==last1 表示第一段都匹配）
}
```

#### STL 风格范围：`[first, last)`

- `last` 通常是 `end()`（past-the-end），不可解引用
- 遍历条件永远写成 `it != last`

#### 隐式接口（Implicit Interface）

这个模板对 iterator/元素类型的“要求”来自它在代码里用到的操作：

- iterator 必须支持：`!=`, `++it`, `*it`
- 解引用后的元素必须支持：`==`（因为比较了 `*first1 == *first2`）

> 直觉：模板不关心“容器是什么”，只关心“你给的 iterator 能不能做这些事”。

---

## Variadic Templates

Variadic templates 的目标：**让模板/函数接受任意数量的类型参数或函数参数**。  
常见形式：

- `typename... Ts`：一包类型（type pack）
- `Ts... args`：一包参数（value pack）

---

### 1️⃣ 最小例子：接收任意数量参数并打印

```cpp
template <typename... Ts>
void printAll(const Ts&... args) {
    (std::cout << ... << args) << '\n';   // fold expression（C++17）
}
```

- `Ts...` 是一组类型：可能是 `<int, string, double, ...>`
- `args...` 是一组值：对应每个类型的参数
- `(std::cout << ... << args)` 是“折叠表达式”：相当于把 `<<` 对 args 逐个应用

> [!NOTE]  
> 旧写法（C++11/14）常用递归展开 pack；C++17 之后 fold expression 更简洁。

---

### 2️⃣ Pack expansion

“把 `...` 放在表达式后面”意味着：对包里的每个元素都做一次这个表达式。

```cpp
foo(args...);        // 把 args 包作为多个参数传入
bar(make(args)...);  // 对每个 args 做 make(args)，再把结果展开
```

---

### 3️⃣ Variadic 最常见用途

- `std::tuple<Ts...>`
- `std::make_unique<T>(args...)`（构造时完美转发）
- 通用 wrapper / logger（把任意参数转交给内部函数）
- “concept lifting”/“constraints” 里常见的组合约束（对每个参数做限制）

---

## Concept Lifting

前面写过 implicit interface：模板里写了 `<`、`==`、`<<`，就意味着类型必须支持这些操作。  
问题是：**这种要求是隐藏的**，往往直到编译失败才知道。

Concept lifting 的直觉：

> 把“模板内部偷偷依赖的操作/性质”，变成“函数声明处显式写出来的约束”。

这能带来两件事：

1. 错误更早、更清晰（不会在 STL 深处爆一长串）
2. 调用者一眼知道这个模板需要什么能力

---

### 1️⃣ 从 `countOccurences` 的坏例子看“隐式要求”

如果写：

```cpp
template <typename Collection, typename DataType>
int countOccurences(const Collection<DataType>& list, DataType val) {
    int count = 0;
    for (size_t i = 0; i < list.size(); ++i) {
        if (list[i] == val) ++count;
    }
    return count;
}
```

它看起来“泛型”，但隐式要求非常强：

- `Collection<DataType>` 必须有 `size()
- 必须支持 `operator[]`（随机访问）
- `list[i] == val` 必须可用（`DataType` 可比较）
- `DataType val` 按值传参 → `DataType` 要可拷贝/可移动

> [!TIP]  
> 这就是 Lecture 7 在强调的：  
> “写了 template ≠ 真正泛型”，关键看你在模板里调用了哪些成员函数/操作符。

---

### 2️⃣ 改成 iterator 风格：更通用，也更接近 STL

更“STL”的写法是不接收容器，而接收 `[begin, end)`：

```cpp
template <typename It, typename T>
int countOccurences(It begin, It end, const T& val) {
    int count = 0;
    for (auto it = begin; it != end; ++it) {
        if (*it == val) ++count;
    }
    return count;
}
```

它的隐式要求更合理、更泛化：

- `It` 支持 `!=`, `++`, `*`
- `*it == val` 可比较

这基本就是 `std::count(begin, end, val)` 的雏形（你以后直接用 `std::count`）。

---

### 3️⃣ “类型错位”会导致奇怪报错

如果你写出这种调用：

```cpp
countOccurences(v1.begin(), v1.end(), v2.begin());
```

第三个参数传入的是 **iterator**（位置），但函数里写的是 `*it == val`（把元素和 val 比较）。  
于是会变成：`int == iterator` → 编译错误。

> [!NOTE]  
> iterator 和元素值不是同一类东西：
>
> - `it` 表示“位置”
> - `*it` 才是“该位置的元素”
>
> 如果你真的想“比较另一个 iterator 指向的元素”，应该写 `*it == *valIt`。

---

## Implicit Interfaces & Concepts

### 1️⃣ Implicit Interface 是什么？

模板函数对类型的“要求”，不是写在签名里，而是**隐藏在模板实现里**。  
比如：

- `my_minmax(T a, T b)` 用了 `a < b` → 要求 `T` 支持 `<`
- `printMinAndMax` 用了 `<<` → 要求 `T` 可输出到流
- `mismatch` 用了 `!=, ++, *, ==` → 要求 iterator 支持这些操作，元素可比较

> 这套“要求集合”就是该模板对 `T` 的 implicit interface。

---

### 2️⃣ Concepts

Concept 是一种“给约束起名字”的机制，使模板签名可读性更强：

```cpp
#include <concepts>

template <std::totally_ordered T>
std::pair<T, T> my_minmax(T a, T b) {
    return (a < b) ? std::pair{a, b} : std::pair{b, a};
}
```

含义：只有满足 `totally_ordered`（可比较）的类型才允许实例化。

对 iterator 也类似：

- `std::input_iterator It`
- `std::forward_iterator It`
- `std::random_access_iterator It`

---

### 3️⃣ 没有 concepts 时怎么做？

在 C++20 之前常见写法：

- `static_assert(...)`（在模板内部早点报错）
- `std::enable_if` / SFINAE（让不满足要求的版本“不可选”）

---
