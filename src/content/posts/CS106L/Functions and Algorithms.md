---
title: Functions and Algorithms
published: 2026-03-02
description: C++ Functions and Algorithms相关笔记
tags: [CS106L]
category: 笔记
draft: false
---

本文全面介绍 C++ 中函数式编程风格的核心工具——Lambda 表达式与 STL 算法。从传统函数指针的局限性出发，深入讲解 Lambda 的语法、捕获机制（值捕获 vs 引用捕获）、泛型 lambda 的使用，以及 lambda 本质上是 functor 的实现原理。随后系统梳理 STL 常用算法（`count`、`sort`、`partition`、`copy_if`、`transform` 等）的使用模式、iterator 要求、以及 iterator adaptors（`back_inserter`、`ostream_iterator` 等）的实践技巧，并重点解析 erase-remove idiom、输出迭代器的正确用法等常见陷阱。

## 目录

- [Motivation](#motivation)
  - [用 iterator range 写"真正泛型"的计数](#用-iterator-range-写真正泛型的计数)
  - [range slicing](#range-slicing)
  - [Problem 1：如果阈值不是 5？](#problem-1如果阈值不是-5)
  - [Problem 2：想用变量 limit，但 scope 不允许](#problem-2想用变量-limit但-scope-不允许)
  - [Problem 3：给 predicate 加参数也不行](#problem-3给-predicate-加参数也不行)
  - [Solution：lambda + capture](#solutionlambda--capture)
- [Lambda Functions](#lambda-functions)
  - [为什么 function pointers 不够用？](#为什么-function-pointers-不够用)
  - [Lambda：带 capture 的 predicate](#lambda带-capture-的-predicate)
  - [Lambda 语法拆解](#lambda-语法拆解)
  - [Capture：按值 vs 按引用](#capture按值-vs-按引用)
  - [泛型 lambda：不需要 `template <typename T>`](#泛型-lambda不需要-template-typename-t)
  - [Lambda 的本质：Functors](#lambda-的本质functors)
  - [`std::bind`：固定部分参数](#stdbind固定部分参数)
- [Algorithms](#algorithms)
  - [`std::count` / `std::count_if`：计数](#stdcount--stdcount_if计数)
  - [`std::sort`：排序 + comparator](#stdsort排序--comparator)
  - [输出：`std::copy` + `ostream_iterator`](#输出stdcopy--ostream_iterator)
  - [`partition` / `stable_partition`：按 predicate 分组](#partition--stable_partition按-predicate-分组)
  - [`copy_if` 的坑：第三个参数需要 Output Iterator](#copy_if-的坑第三个参数需要-output-iterator而不是容器)
  - [`erase-remove idiom`：真正删除元素](#erase-remove-idiom真正删除元素)
- [Callable](#callable)
- [Lambda capture 的两个关键坑](#lambda-capture-的两个关键坑)
- [Algorithms 的 iterator 要求](#algorithms-的-iterator-要求)
- [输出迭代器（Output Iterator）与 iterator adaptors](#输出迭代器output-iterator与-iterator-adaptors)
- [两个算法套路](#两个算法套路)

## Motivation

目标：对一段范围 `[begin, end)` 做“计数/筛选”等逻辑时，不希望算法绑死在某个容器/某个常量上。

---

### 用 iterator range 写“真正泛型”的计数

问题：在 `[begin, end)` 范围内，值 `val` 出现多少次？

```cpp
template <typename InputIt, typename DataType>
int countOccurences(InputIt begin, InputIt end, const DataType& val) {
    int count = 0;
    for (auto it = begin; it != end; ++it) {
        if (*it == val) ++count;
    }
    return count;
}
```

隐式接口（implicit interface）要求：

- `InputIt` 支持：`!=`, `++it`, `*it`
- `*it == val` 必须合法（元素类型可与 `val` 比较）

---

### range slicing

对 `vector`（random access iterator）可以直接做 iterator 算术：

```cpp
auto begin2 = phoneNumber.begin() + phoneNumber.size() / 2;
auto end2   = phoneNumber.end();
int times = countOccurences(begin2, end2, 5);
```

> [!NOTE]  
> `begin() + k` 依赖 random-access iterator，因此 `list/map/set` 不支持这种写法。

---

### Problem 1：如果阈值不是 5？

如果用普通函数当 predicate：

```cpp
bool isLessThan5(int x) { return x < 5; }
bool isLessThan6(int x) { return x < 6; }
bool isLessThan7(int x) { return x < 7; }
```

每换阈值就写一个新函数 → 重复代码。

---

### Problem 2：想用变量 limit，但 scope 不允许

```cpp
bool isLessThanLimit(int x) { return x < limit; } // limit 在 main 里 → out of scope
```

普通函数不能捕获 `main` 的局部变量（作用域规则）。

---

### Problem 3：给 predicate 加参数也不行

```cpp
bool isLessThanLimit(int x, int limit) { return x < limit; }
```

算法通常需要的是 `pred(x)`（只接收一个元素）。  
传入需要两个参数的函数会导致 template/callable 不匹配。

---

### Solution：lambda + capture

```cpp
int limit = 8;
auto pred = [limit](int x) { return x < limit; }; // 捕获 limit（按值）

// 用 pred(x) 替代硬编码的 isLessThan5/6/7
```

lambda 的关键价值：

- 不需要重复写多个函数
- 不需要全局变量
- 保持 `pred(x)` 这种算法期望的接口形式

---

## Lambda Functions

### 为什么 function pointers 不够用？

普通函数（函数指针指向的函数）不能捕获 `main` 的局部变量：

```cpp
bool isLessThanLimit(int val) {
    return val < limit;  // ❌ limit 在 main 中 → out of scope
}
```

因此当 predicate 需要“带状态”（如阈值 limit）时，单纯函数指针方案很笨/做不到。

---

### Lambda：带 capture 的 predicate

```cpp
int limit = 5;
auto isLessThanLimit = [limit](auto val) -> bool {
    return val < limit;
};

countOccurences(vec.begin(), vec.end(), isLessThanLimit);
```

lambda 的价值：

- 不需要写 isLessThan5/6/7…（避免函数爆炸）
- 不需要全局变量（scope 问题消失）
- 仍然满足算法期望的接口：`pred(x)`（一个参数）

---

### Lambda 语法拆解

```cpp
auto name = [capture](params) -> return_type { body };
```

- `auto name = ...`：lambda 类型是匿名类型，交给编译器推导
- `[capture]`：捕获外部变量（不写就不能用外部局部变量）
- `(params)`：参数列表；可写 `(auto x)` 做“泛型 lambda”
- `-> return_type`：返回类型可省略；复杂分支时可写清楚
- `{ body }`：函数体

> [!NOTE]  
> lambda 能访问的外部变量只来自 capture 列表（不是想用哪个就能用哪个）。

---

### Capture：按值 vs 按引用

- `[x]`：按值捕获 x（拷贝一份进 lambda）
- `[&x]`：按引用捕获 x（引用外部同一份对象）
- `[=]`：默认按值捕获所有用到的外部变量
- `[&]`：默认按引用捕获所有用到的外部变量

例外指定：

- `[=, &teas]`：默认值捕获，但 `teas` 用引用
- `[&, banned]`：默认引用捕获，但 `banned` 用值

> [!WARNING]  
> 引用捕获要注意生命周期：不要让 lambda 在外部变量已经销毁后仍被调用（会悬空引用）。

---

### 泛型 lambda：不需要 `template <typename T>`

想让 predicate 接受任意类型时，直接写：

```cpp
auto pred = [limit](auto val) { return val < limit; };
```

不要写：

```cpp
template <typename T>
auto pred = ... // ❌ 不能这样给局部变量“加模板”
```

如果需要统计调用次数，可用引用捕获：

```cpp
int num_times_called = 0;
auto pred = [limit, &num_times_called](auto val) {
    ++num_times_called;
    return val < limit;
};
```

---

### Lambda 的本质：Functors

lambda 不是“语法糖函数指针”，而是一个对象（匿名类实例），内部实现了 `operator()`：

```cpp
auto mult = [](int a, int b) { return a * b; };
int v = mult(3, 2); // 像函数一样调用
```

---

### `std::bind`：固定部分参数

```cpp
auto multBound = std::bind(mult, std::placeholders::_1, 2);
// multBound(x) == mult(x, 2)
```

现代 C++ 更推荐直接用 lambda，可读性更强：

```cpp
auto multBound = [=](int x) { return mult(x, 2); };
```

---

## Algorithms

STL algorithms 的核心接口：**操作的是 iterator range** `[first, last)`，而不是具体容器。  
因此同一个算法可以复用到 `vector/list/string/...`（取决于 iterator 类型要求）。

---

### `std::count` / `std::count_if`：计数

```cpp
#include <algorithm>

int k = std::count(v.begin(), v.end(), 5);
int k2 = std::count_if(v.begin(), v.end(),
                       [](int x){ return x < 5; });
```

隐式接口：

- iterator 支持遍历（InputIt）
- `count` 要求元素支持 `== value`
- `count_if` 要求 predicate 可调用：`pred(*it) -> bool`

---

### `std::sort`：排序 + comparator

```cpp
std::sort(numbers.begin(), numbers.end()); // 默认用 <
```

自定义比较器（对自定义类型排序）：

```cpp
auto compareRating = [](const Course& c1, const Course& c2) {
    return c1.rating < c2.rating;
};
std::sort(courses.begin(), courses.end(), compareRating);
```

> [!NOTE]  
> `comp(a,b)` 的语义是：a 是否应排在 b 前面（返回 bool）。  
> `std::sort` 需要 **Random Access Iterator**（vector/deque/array 可以，list 不行）。

---

### 输出：`std::copy` + `ostream_iterator`

```cpp
std::copy(courses.begin(), courses.end(),
          std::ostream_iterator<Course>(std::cout, "\n"));
```

`ostream_iterator<T>` 是一种 **iterator adaptor**：把 `std::cout` 伪装成 Output Iterator。  
隐式要求：`T` 支持 `operator<<`。

---

### `partition` / `stable_partition`：按 predicate 分组

```cpp
auto isCS = [dep = std::string("CS")](const Course& course) {
    return course.name.size() >= dep.size()
        && course.name.substr(0, dep.size()) == dep;
};

std::stable_partition(courses.begin(), courses.end(), isCS);
```

- `partition`：把满足 pred 的放前面，不满足的放后面（不保证相对顺序）
- `stable_partition`：额外保证组内相对顺序保持不变（stable）

---

### `copy_if` 的坑：第三个参数需要 Output Iterator，而不是容器

错误写法（第三参写成容器对象）：

```cpp
std::copy_if(courses.begin(), courses.end(), csCourses, isCS); // ❌
```

正确写法（写入 vector：用 `back_inserter`）：

```cpp
std::vector<Course> csCourses;
std::copy_if(courses.begin(), courses.end(),
             std::back_inserter(csCourses), isCS);
```

正确写法（直接输出到 cout：用 `ostream_iterator`）：

```cpp
std::copy_if(courses.begin(), courses.end(),
             std::ostream_iterator<Course>(std::cout, "\n"), isCS);
```

> [!TIP]  
> `back_inserter(vec)` 也是 iterator adaptor：把 `push_back` 伪装成 Output Iterator。

---

### `erase-remove idiom`：真正删除元素

`std::remove_if` 不会改变容器大小，只会把“要删除的”挪到末尾，并返回新逻辑结尾 `newEnd`：

```cpp
v.erase(std::remove_if(v.begin(), v.end(), pred), v.end());
```

解释：

- `remove_if`：返回 “trash 开始位置”的 iterator
- `erase(newEnd, end)`：真正删除那段 trash，缩小容器 size

> [!WARNING]  
> 只调用 `remove_if` 而不 `erase`：容器 size 不变，尾部仍然留着“垃圾值”。

---

## Callable

在 STL algorithms 里，predicate/comparator 通常是一个 **callable**：

- function pointer：`bool (*)(T)`
- lambda（本质是 functor）：`[](T x){...}`
- functor：重载 `operator()` 的对象
- `std::function<R(Args...)>`：**类型擦除**的可调用封装（更灵活但有开销）

> [!TIP]
> 优先用 **模板参数接 callable（lambda/functor）**：零额外开销、可内联。
> 只有当你“必须把不同类型的 callable 放进同一个变量/容器/接口”时，再用 `std::function`。

---

## Lambda capture 的两个关键坑

### 1) 值捕获是“当时拷贝”

```cpp
int limit = 5;
auto pred = [limit](int x){ return x < limit; };
limit = 100;
pred(50); // 仍然用的是旧的 limit=5
```

### 2) 引用捕获要注意生命周期

```cpp
std::function<bool(int)> f;
{
    int limit = 5;
    f = [&](int x){ return x < limit; }; // ⚠️ 引用捕获
} // limit 已销毁
f(3); // ❌ 悬空引用（UB）
```

> [!WARNING]  
> 只要 lambda 可能在“捕获变量作用域结束后”仍被调用，就不要引用捕获；改用值捕获或把状态放到更长寿命对象里。

---

## Algorithms 的 iterator 要求

- `std::count / find / copy / copy_if`：Input Iterator 即可
- `std::partition / stable_partition`：至少 Forward Iterator（需要多趟/可写）
- `std::sort`：Random Access Iterator（vector/deque/array 可以，list 不行）

---

## 输出迭代器（Output Iterator）与 iterator adaptors

很多算法的签名是 `(..., OutputIt out, ...)`：

- **out 不是容器**，而是“写入位置”的抽象
- 这就是为什么 `copy_if(..., csCourses, pred)` 会错：容器不是 iterator

常用 adaptor：

- `std::back_inserter(vec)`：把 `push_back` 包装成 OutputIt（容器需支持 `push_back`）
- `std::inserter(container, pos)`：把 `insert` 包装成 OutputIt（适用于 set/map/任意可 insert 容器）
- `std::ostream_iterator<T>(cout, "\n")`：把输出流变成 OutputIt
- `std::istream_iterator<T>(cin)`：把输入流变成 InputIt（常用于把输入直接喂给算法）

例：copy 到 set（没有 push_back）：

```cpp
std::set<int> s;
std::copy(v.begin(), v.end(), std::inserter(s, s.end()));
```

---

## 两个算法套路

### 1) transform：映射（map）/逐元素变换

```cpp
std::vector<int> out;
out.resize(v.size());
std::transform(v.begin(), v.end(), out.begin(),
               [](int x){ return x * x; });
```

或直接生成到末尾：

```cpp
std::vector<int> out;
std::transform(v.begin(), v.end(), std::back_inserter(out),
               [](int x){ return x * x; });
```

### 2) sort + unique + erase：去重

```cpp
std::sort(v.begin(), v.end());
v.erase(std::unique(v.begin(), v.end()), v.end());
```

> [!NOTE]  
> `unique` 和 `remove_if` 一样：只“搬家”，不缩容；真正删除靠 `erase`。

---
