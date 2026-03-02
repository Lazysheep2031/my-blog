---
title: Containers
published: 2026-02-22
description: C++ Containers相关笔记
tags: [CS106L]
category: 笔记
draft: false
---

本文系统介绍了 C++ STL 中的容器（Containers），包括三大类：顺序容器（Sequence Containers）如 `vector` 和 `deque`、容器适配器（Container Adapters）如 `stack`、`queue` 和 `priority_queue`，以及关联容器（Associative Containers）如 `map`、`set`、`multimap` 及其无序版本。重点讲解了各容器的底层实现、时间复杂度、适用场景和常见陷阱，详细说明了 `multimap` 的一对多映射特性和 `equal_range` 的用法，并通过词频统计实例展示了 `std::map` 的实际应用。

## 目录

- [Sequence Containers](#sequence-containers)
  - [std::vector](#stdvector)
  - [std::deque](#stddeque)
- [Container Adapters](#container-adapters)
  - [std::stack](#stdstack)
  - [std::queue](#stdqueue)
  - [std::priority_queue](#stdpriority_queue)
  - [Using Environment](#using-environment)
- [Associative Containers](#associative-containers)
  - [有序版本](#有序版本)
  - [无序版本](#无序版本)
  - [map vs unordered_map](#map-vs-unordered_map)
  - [set vs unordered_set](#set-vs-unordered_set)
  - [Brief Recap](#brief-recap)
  - [Multimaps](#multimaps)
  - [选择原则](#选择原则)
  - [Examples——词频统计](#examples词频统计)

## Sequence Containers

| 容器           | 底层结构     | 特点             |
| -------------- | ------------ | ---------------- |
| `vector`       | 动态数组     | 最常用、连续内存 |
| `deque`        | 分段数组     | 两端高效         |
| `list`         | 双向链表     | 插入删除快       |
| `forward_list` | 单向链表     | 更轻量           |
| `array`        | 固定大小数组 | 编译期大小       |
| `string`       | 类似 vector  | 特化版           |

---

### std:: vector

可以自动扩容的动态数组容器

```cpp
std::vector<int> vecInt;
std::vector<string> vecStr;
std::vector<myStruct> vecStruct;
std::vector<std::vector<string>> vecOfVec;
```

vector 是模板类，`T` 表示容器中存储的元素类型。

---

#### vector 的基本操作

1. 创建空 vector

```cpp
vector<int> v;
```

2. 创建 n 个 0

```cpp
vector<int> v(n);
```

3. 创建 n 个值为 k 的元素

```cpp
vector<int> v(n, k);
```

4. 添加元素到末尾

```cpp
v.push_back(k);
```

5. 清空 vector

```cpp
v.clear();
```

6. 访问元素

安全访问（检查越界）：

```cpp
v.at(i);
```

不检查越界（更快）：

```cpp
v[i];
```

7. 判断是否为空

```cpp
v.empty();
```

---

#### Stanford Vector vs std::vector

| 操作         | Stanford Vector | std::vector    |
| ------------ | --------------- | -------------- |
| 添加元素     | v.add(k)        | v.push_back(k) |
| 越界检查访问 | v.get(i)        | v.at(i)        |
| 是否为空     | v.isEmpty()     | v.empty()      |

---

#### 推荐函数参数写法

```cpp
void printVec(const vector<string>& v)
```

原因：

- `&` → 避免复制整个 vector
- `const` → 保证不修改

---

#### Range-based for 循环

```cpp
for (auto elem : v) {
    cout << elem << " ";
}
```

等价于：

```cpp
for (auto it = v.begin(); it != v.end(); ++it) {
    cout << *it;
}
```

---

#### 完整示例

```cpp
#include <vector>
#include <string>
#include <iostream>

using std::vector;
using std::string;
using std::cout;
using std::endl;

void printVec(const vector<string>& v) {
    cout << "{ ";
    for (auto elem : v) {
        cout << elem << " ";
    }
    cout << "}" << endl;
}

int main() {
    vector<string> names;
    names.push_back("Anna");
    names.push_back("Avery");

    printVec(names);

    cout << names.at(0) << endl;

    return 0;
}
```

> [!TIP]
> “You don't pay for what you don't use.”

### std::deque

`std::deque<T>` = Double Ended Queue

> 支持在前端和后端都高效插入删除的序列容器。

---

#### 底层结构

连续内存：

```
[ 1 ][ 2 ][ 3 ][ 4 ]
```

分段连续内存（chunked array）：

```
[ block1 ] -> [ block2 ] -> [ block3 ]
```

每个 block 连续，但整体不连续。

---

#### 优点

1. 两端插入快

```cpp
d.push_back(x);
d.push_front(x);
```

时间复杂度：O(1)

---

#### 缺点

1. 内存不连续
   - Cache 不友好
   - 随机访问比 vector 慢

2. 随机访问虽然是 O(1)，但更慢

vector：

- 单次内存跳转

deque：

- 需要先定位 block
- 再计算 block 内偏移

---

#### 复杂度对比

| 操作       | vector    | deque   |
| ---------- | --------- | ------- |
| push_back  | 均摊 O(1) | O(1)    |
| push_front | O(n)      | O(1)    |
| 随机访问   | O(1) 快   | O(1) 慢 |
| 中间插入   | O(n)      | O(n)    |

---

> [!TIP]
> 默认使用 vector  
> 除非你真的需要频繁 `push_front`。

#### 典型使用场景

- BFS
- 滑动窗口算法
- 实现队列（std::queue 默认使用 deque）

## Container Adapters

> [!NOTE]
> Container Adapter（容器适配器）是对已有容器进行“功能限制包装”的类。
> Adapter 是“限制功能”而不是“增加功能”。

**Express ideas and intent directly in code.**

它们：

- 不实现新的底层数据结构
- 使用已有容器（如 vector / deque）
- 限制接口，表达特定抽象语义

> [!IMPORTANT]
> Why Container Adapter？

1. 表达意图（intent）
2. 限制接口（防止误用）
3. 编译期安全
4. 零额外开销

| Adapter             | 抽象结构         | 默认底层容器 |
| ------------------- | ---------------- | ------------ |
| std::stack          | LIFO（后进先出） | deque        |
| std::queue          | FIFO（先进先出） | deque        |
| std::priority_queue | 优先级队列（堆） | vector       |

---

### std::stack

**定义**

```cpp
std::stack<int> s;
```

**支持操作**

```cpp
s.push(x);
s.pop();
s.top();
s.empty();
s.size();
```

**不支持**

```cpp
s[0];        // ❌
s.begin();   // ❌
遍历        // ❌
```

**底层实现**

默认使用：

```cpp
std::deque<T>
```

但可以改：

```cpp
std::stack<int, std::vector<int>> s;
```

---

### std::queue

**定义**

```cpp
std::queue<int> q;
```

**支持操作**

```cpp
q.push(x);
q.pop();
q.front();
q.back();
q.empty();
q.size();
```

**特性**

- FIFO 结构
- 只能访问两端

**底层实现**

默认使用：

```cpp
std::deque<T>
```

---

### std::priority_queue

**定义**

```cpp
std::priority_queue<int> pq;
```

**特点**

- 默认是“大顶堆”
- 最大值总在顶部

**操作**

```cpp
pq.push(x);
pq.pop();
pq.top();
pq.empty();
```

**底层实现**

默认使用：

```cpp
std::vector<T>
```

- heap 算法

---

:::NOTE[priority_queue 自定义排序]

默认是最大优先级在顶端。

如果想最小优先级在顶端：
```cpp
std::priority_queue<
    int,
    std::vector<int>,
    std::greater<int>
pq;
```
:::

:::IMPORTANT[为什么默认用 deque？]
因为：
- stack 需要 push_back / pop_back
- queue 需要 push_back / pop_front
- deque 两端操作都是 O(1)
:::

| 特性           | vector/deque | adapter |
| -------------- | ------------ | ------- |
| 可随机访问     | ✅           | ❌      |
| 可遍历         | ✅           | ❌      |
| 可插入任意位置 | ✅           | ❌      |
| 表达抽象语义   | ❌           | ✅      |
| 限制误用       | ❌           | ✅      |

---

### Using Environment

C++ 设计原则：

- Allow full control and choice
- Express intent directly in code
- Enforce safety at compile time
- Do not waste time or space
- Compartmentalize messy constructs

Adapter 的作用：

> 在不损失性能的情况下表达清晰语义。

---

使用 stack：

- 深度优先搜索（DFS）
- 函数调用栈模拟

使用 queue：

- 广度优先搜索（BFS）
- 任务调度

使用 priority_queue：

- Dijkstra 算法
- 任务优先级调度
- Top-K 问题

---

## Associative Containers

Associative containers：不按顺序存储元素，而是通过 key 访问元素。

特点：

- 没有 index 概念
- 不是 sequence
- 通过 key 查找元素

---

### 有序版本

（基于红黑树）

- std::map<T1, T2>
- std:: set < T >

### 无序版本

（基于哈希表）

- std::unordered_map<T1, T2>
- std::unordered_set< T >

---

### map vs unordered_map

#### std::map

特点：

- 自动按 key 排序
- 底层：红黑树
- 查找：O (log n)
- 支持范围查找
- 遍历是有序的

适合：

- 需要排序
- 需要区间查询
- 需要 lower_bound / upper_bound

---

#### std::unordered_map

特点：

- 无排序
- 底层：哈希表
- 平均 O (1) 查找
- 遍历无序

适合：

- 高频查找
- 不需要排序

---

### set vs unordered_set

#### std::set

- 有序
- O (log n)
- 唯一元素

#### std::unordered_set

- 无序
- 平均 O (1)
- 唯一元素

---

### Brief Recap

- **关联容器的分类**
  - 有序：`map / set / multimap / multiset`（按 key 排序）
  - 无序：`unordered_map / unordered_set / unordered_multimap / unordered_multiset`（哈希）
- **核心差异**
  - 有序：迭代是有序的；常见操作通常是 `O(log n)`
  - 无序：迭代无序；平均 `O(1)`，但有哈希/rehash 等注意点
- **map vs set**
  - `map` 存 `key -> value`
  - `set` 只存 `key`
- **“唯一 / 可重复”**
  - `map/set`：key 唯一
  - `multi*`：key 可重复

---

### Multimaps

- **定义与用途**
  - `std::multimap<K, V>`：允许**多个元素拥有相同 key**
  - 适用场景：一对多映射（例如 `course -> many students`，`word -> all positions`
- **和 `map` 的关键区别**
  - `map`：一个 key 最多一条记录（插入重复 key 会失败或覆盖取决于接口）
  - `multimap`：重复 key 会变成多条记录（每次 insert 都会插入）
- **常用操作** - `insert({k, v})`：插入一条（永远插得进去）
  - `count(k)`：这个 key 有几条
  - `equal_range(k)`：返回 `[first, second)` 这一段迭代器范围，刚好覆盖所有 key==k 的元素
    - 你可以把它当成：`lower_bound(k)` 和 `upper_bound(k)` 的组合
  - `lower_bound(k)`：第一个 `>= k` 的位置
  - `upper_bound(k)`：第一个 `> k` 的位置
- **遍历某个 key 的所有 value 的标准写法**
  - “先 `auto [it, end] = mm.equal_range(key);` 然后从 it 循环到 end”

---

| 特性       | map/set   | unordered_map/set |
| ---------- | --------- | ----------------- |
| 是否排序   | 是        | 否                |
| 查找复杂度 | O (log n) | 平均 O (1)        |
| 范围查询   | 支持      | 不支持            |
| 遍历顺序   | 有序      | 无序              |
| 底层结构   | 红黑树    | 哈希表            |

---

### 选择原则

如果你需要：

- 排序
- 区间查询
- Lower_bound

使用：map / set

如果你需要：

- 快速查找
- 不关心顺序

使用：unordered_map / unordered_set

---

### Examples——词频统计

#### 整体功能

该程序实现：

1. 读取多行文本
2. 将每一行拆分为单词
3. 使用 `std::map<string,int>` 统计单词出现次数
4. 支持查询某个单词的出现次数

---

#### 读取整行输入：getline

```cpp
string GetLine() {
    string response;
    std::getline(cin, response);
    return response;
}
```

- `getline(cin, str)` 读取整行（包括空格）
- 直到遇到 `\n`
- 适合读取“整句输入”

对比：

| 写法                | 行为                         |
| ------------------- | ---------------------------- |
| `cin >> str`        | 读取一个 token（遇空格停止） |
| `getline(cin, str)` | 读取整行                     |

---

#### 将字符串拆分为单词：istringstream

```cpp
std::istringstream stream(response);
string word;

while (stream >> word) {
    ++frequencyMap[word];
}
```

- `istringstream` 把字符串当作输入流
- `stream >> word` 会按空白分隔单词
- 自动跳过空格

例如输入：

```
I love CS106L
```

循环会依次得到：

```
"I"
"love"
"CS106L"
```

---

#### map 的核心

```cpp
std::map<string, int> frequencyMap;
```

- key：string（单词）
- value：int（出现次数）
- key 自动排序（基于红黑树）

---

#### operator[] 的行为

```cpp
++frequencyMap[word];
```

如果：

- `word` 不存在

则：

1. 自动插入 `word`
2. 默认初始化 value（int → 0）
3. 返回 value 的引用

然后执行 `++`

示例：

```cpp
std::map<string,int> m;

m["hello"];   // 自动插入 {"hello", 0}
m["hello"]++; // 变成 {"hello", 1}
```

> [!WARNING] 重要结论：
> `operator[]` 会在 key 不存在时自动插入！

---

#### 查找方式对比

##### 1️⃣ operator[]

```cpp
m[key]
```

- 不存在会插入默认值
- 适合做统计、累加

---

##### 2️⃣ count()

```cpp
m.count(key)
```

- 返回 0 或 1（map 不允许重复 key）
- 不会插入元素
- 用于判断是否存在

---

##### 3️⃣ find()

```cpp
auto it = m.find(key);
if (it != m.end()) {
    cout << it->second;
}
```

- 不会插入
- 推荐用于查询

---

##### 4️⃣ at()

```cpp
m.at(key)
```

- 不存在会抛异常
- 不会插入

---

#### 为什么查询时不用 operator[]？

原代码：

```cpp
if (frequencyMap.count(response)) {
    cout << frequencyMap[response] << " entries found.";
}
```

原因：

如果直接写：

```cpp
cout << frequencyMap[response];
```

当 key 不存在时：

- 会自动插入
- value 变成 0
- map 被污染

因此先用 `count()` 判断存在性。

---

#### 更优写法

避免二次查找：

```cpp
auto it = frequencyMap.find(response);
if (it != frequencyMap.end()) {
    cout << it->second << " entries found.";
} else {
    cout << "None.";
}
```

---
