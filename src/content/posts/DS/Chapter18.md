---
title: Concurrency Control
published: 2026-06-02
description: Lock-Based Protocols, Deadlock Handling, Multiple Granularity, Phantom Phenomenon, Timestamp-Based Protocols, Validation-Based Protocols, Multiversion Schemes, Snapshot Isolation
tags: [数据库系统]
category: 笔记
draft: false
---

## 概述

这一章的核心是：

> 数据库允许多个事务并发执行，但最终结果必须像某个串行顺序执行出来的一样正确。**Concurrency Control** 要做的事情，就是设计一套事务访问数据的规则，使并发调度满足隔离性，通常目标是 **conflict serializability**。

第 17 章已经给出理论工具：

- 事务、调度、冲突操作
- serial schedule / serializable schedule
- precedence graph
- conflict serializability
- isolation levels

第 18 章回答更实现层的问题：

> DBMS 具体用什么协议，让实际产生的调度具有可串行化性质？

本章主要协议：

- **Lock-Based Protocols**：基于锁的并发控制，重点是 Two-Phase Locking
- **Deadlock Handling**：死锁预防、检测、恢复
- **Multiple Granularity**：多粒度封锁
- **Insert / Delete / Phantom**：插入删除与幽灵现象
- **Timestamp-Based Protocols**：时间戳排序协议
- **Validation-Based Protocols**：乐观并发控制
- **Multiversion Schemes**：多版本并发控制
- **Snapshot Isolation**：快照隔离
- **Weak Levels of Consistency**：实践中的弱一致性级别

---

## 目录

- [概述](#概述)
- [Lock-Based Protocols](#lock-based-protocols)
- [Two-Phase Locking](#two-phase-locking)
- [Two-Phase Locking 的证明](#two-phase-locking-的证明)
- [2PL 的变种](#2pl-的变种)
- [Lock Manager](#lock-manager)
- [Deadlock Handling](#deadlock-handling)
- [Graph-Based Protocols](#graph-based-protocols)
- [Multiple Granularity](#multiple-granularity)
- [Insert、Delete 与 Phantom](#insertdelete-与-phantom)
- [Index Concurrency](#index-concurrency)
- [Timestamp-Based Protocols](#timestamp-based-protocols)
- [Validation-Based Protocols](#validation-based-protocols)
- [Multiversion Schemes](#multiversion-schemes)
- [Snapshot Isolation](#snapshot-isolation)
- [Weak Levels of Consistency](#weak-levels-of-consistency)
- [Transactions across User Interaction](#transactions-across-user-interaction)
- [总结](#总结)

---

## Lock-Based Protocols

### Lock 的基本思想

**Lock** 是控制并发访问数据项的机制。

事务访问数据前，需要先向 concurrency-control manager 请求锁。只有锁被授予之后，事务才能继续执行。

常见锁模式：

| 锁模式 | 英文 | 允许操作 | 请求指令 |
|---|---|---|---|
| Shared Lock | S-lock | 只读 | `lock-S(Q)` |
| Exclusive Lock | X-lock | 读 + 写 | `lock-X(Q)` |

直观理解：

- 读数据：申请 `S` 锁
- 写数据：申请 `X` 锁
- 多个事务同时读同一数据可以共存
- 只要某事务持有 `X` 锁，其他事务不能再获得该数据项上的任何锁

### 锁相容矩阵

| 已持有 \ 请求 | S | X |
|---|---:|---:|
| S | true | false |
| X | false | false |

含义：

- `S` 和 `S` 相容：多个事务可以同时读
- `S` 和 `X` 不相容：有人读时，别人不能写
- `X` 和任何锁都不相容：有人写时，别人不能读写

### 普通加锁还不够

考虑事务：

```text
T2:
lock-S(A);
read(A);
unlock(A);
lock-S(B);
read(B);
unlock(B);
display(A+B);
```

如果 `T2` 在读完 `A` 后释放锁，另一个事务在 `T2` 读 `B` 前修改了 `A` 或 `B`，那么 `display(A+B)` 可能显示一个从未真实存在过的总和。

所以只有“访问前加锁”还不够。关键问题是：

> 锁什么时候申请？什么时候释放？所有事务必须遵循什么规则？

**Locking protocol** 就是一组事务申请和释放锁的规则。

---

## Two-Phase Locking

**Two-Phase Locking Protocol，2PL，两阶段封锁协议** 是本章最重要的协议。

它保证产生的调度是 **conflict-serializable**。

### 两个阶段

2PL 将一个事务的加锁 / 解锁过程分成两个阶段：

| 阶段 | 英文 | 允许行为 | 禁止行为 |
|---|---|---|---|
| 增长阶段 | Growing Phase | 获得锁 | 释放锁 |
| 收缩阶段 | Shrinking Phase | 释放锁 | 获得锁 |

核心规则：

> 一旦事务释放了任何一个锁，就不能再获得新的锁。

例子：

```text
lock-S(A);
read(A);
lock-S(B);
read(B);
unlock(A);
unlock(B);
display(A+B);
```

这个事务符合 2PL：

- `lock-S(A)`、`lock-S(B)` 属于 Growing Phase
- `unlock(A)`、`unlock(B)` 属于 Shrinking Phase

### Lock Point

**Lock Point** 是事务获得最后一个锁的时间点。

它是 2PL 证明中的关键概念：

- lock point 之前：事务还处于 growing phase
- lock point 之后：事务已经进入 shrinking phase
- 事务的所有锁请求都发生在 lock point 之前或此点
- 事务的所有解锁操作都发生在 lock point 之后或此点之后

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609131834.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

---

## Two-Phase Locking 的证明

要证明：

> 如果所有事务都遵循 2PL，则产生的任意调度都是 conflict-serializable，并且可以按照事务 lock point 的先后次序串行化。

证明思路使用 **precedence graph**。

### 关键引理

设调度的 precedence graph 中存在边：

```text
Ti -> Tj
```

这说明：

- `Ti` 的某个操作和 `Tj` 的某个操作冲突
- 二者访问同一个数据项 `Q`
- `Ti` 的冲突操作先于 `Tj` 的冲突操作

由于冲突操作必须访问同一个数据项，且至少有一个是写操作，所以它们对应的锁不相容。

因此实际顺序必然类似：

```text
Ti: lock(Q)
Ti: OPi(Q)
Ti: unlock(Q)
Tj: lock(Q)
Tj: OPj(Q)
```

`Tj` 能获得 `Q` 上的锁，前提是 `Ti` 已经释放 `Q` 上的不相容锁。

根据 2PL：

- `Ti` 已经执行 `unlock(Q)`，说明 `Ti` 已经进入 shrinking phase
- 所以 `LP(Ti)` 一定早于 `unlock(Q)`
- `Tj` 还在执行 `lock(Q)`，说明 `Tj` 还处于 growing phase
- 所以 `LP(Tj)` 不早于 `lock(Q)`

于是有：

```text
LP(Ti) < LP(Tj)
```

结论：

> 在 precedence graph 中，只要有边 `Ti -> Tj`，就必然有 `LP(Ti) < LP(Tj)`。

### 推出无环

如果 precedence graph 中存在环：

```text
T1 -> T2 -> ... -> Tk -> T1
```

由关键引理得到：

```text
LP(T1) < LP(T2) < ... < LP(Tk) < LP(T1)
```

这要求一个时间点小于自己，矛盾。

所以 precedence graph 无环。

因此调度是 conflict-serializable。

### 串行化顺序

因为所有边都从较早 lock point 指向较晚 lock point，所以按照 lock point 从早到晚排列事务，得到的串行顺序与原调度冲突等价。

也就是说：

```text
LP(Ti) < LP(Tj)  =>  Ti 可以排在 Tj 前面
```

> 2PL 不仅保证冲突可串行化，还给出了一个可行的串行化顺序：按 lock point 排序。

---

## 2PL 的变种

### Strict Two-Phase Locking

**Strict 2PL，严格两阶段封锁**：

> 事务必须一直持有所有 `X` 锁，直到 commit 或 abort。

作用：

- 保证 recoverability
- 避免 cascading rollback

原因：

- 其他事务无法读到未提交事务写过的数据
- 如果写事务最后 abort，不会导致已经读到脏数据的事务跟着回滚

### Rigorous Two-Phase Locking

**Rigorous 2PL，强两阶段封锁**：

> 事务必须一直持有所有锁，包括 `S` 锁和 `X` 锁，直到 commit 或 abort。

特点：

- 更强，更简单
- 事务可以按照 commit 顺序串行化
- 很多数据库实现的“2PL”实际更接近 rigorous 2PL

### 2PL 是充分条件，不是必要条件

2PL 保证冲突可串行化，但并非所有冲突可串行化调度都能由 2PL 产生。

例子：

```text
T1: write(C)
T2: write(C)
T3: write(A)
T1: write(A)
```

冲突边：

```text
T1 -> T2      // 因为二者都写 C，T1 在前
T3 -> T1      // 因为二者都写 A，T3 在前
```

precedence graph 无环，等价串行顺序可以是：

```text
T3 -> T1 -> T2
```

所以该调度是 conflict-serializable。

但是它不能由 2PL 生成。原因是：

- `T1` 要让 `T2` 写 `C`，必须先释放 `C` 上的锁
- `T1` 后面还要写 `A`，需要再获得 `A` 上的锁
- 这违反“一旦解锁就不能再加锁”的 2PL 规则

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132035.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Lock Conversion

2PL 还可以允许锁转换。

在 growing phase：

- 可以申请 `S` 锁或 `X` 锁
- 可以将 `S` 锁升级为 `X` 锁，称为 **lock-upgrade**

在 shrinking phase：

- 可以释放 `S` 锁或 `X` 锁
- 可以将 `X` 锁降级为 `S` 锁，称为 **lock-downgrade**

规则保持“前半段增强锁权限，后半段削弱锁权限”，所以仍然保证 serializability。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609131934.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

---

## Lock Manager

实际系统中，事务一般不会显式写 `lock-S`、`lock-X`。

DBMS 会在执行 `read(Q)`、`write(Q)` 时自动处理锁请求。

### 读操作

```text
read(Q):
    if Ti already has a lock on Q:
        read(Q)
    else:
        wait until no other transaction has X-lock on Q
        grant S-lock(Q) to Ti
        read(Q)
```

### 写操作

```text
write(Q):
    if Ti already has X-lock on Q:
        write(Q)
    else:
        wait until no other transaction has any lock on Q
        if Ti has S-lock on Q:
            upgrade S-lock to X-lock
        else:
            grant X-lock(Q) to Ti
        write(Q)
```

在严格 / 强 2PL 中，锁通常在 commit 或 abort 后统一释放。

### Lock Table

lock manager 维护 **lock table**，通常是内存中的 hash table：

- key：被锁定的数据项名
- value：该数据项上的锁队列
  - 已授予的锁
  - 等待中的请求
  - 锁模式
  - 对应事务

新请求到来时：

- 如果与已授予锁相容，则授予
- 如果不相容，则进入等待队列
- unlock 后，lock manager 检查等待队列中是否有请求可以被授予
- 事务 abort 时，删除该事务所有已授予和等待中的锁请求

为了高效释放锁，系统通常还会维护：

```text
transaction -> list of locks held by transaction
```

这样事务 commit / abort 时，可以快速找到并释放它持有的所有锁。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132056.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

---

## Deadlock Handling

### 死锁

如果存在一组事务，每个事务都在等待集合中另一个事务释放锁，则系统进入 **deadlock**。

例子：

```text
T1: write(X); write(Y)
T2: write(Y); write(X)
```

可能出现：

```text
T1 持有 X，等待 Y
T2 持有 Y，等待 X
```

此时两个事务都无法继续。

2PL 保证可串行化，但不保证无死锁。

### Starvation

**Starvation** 指某个事务长期得不到执行机会。

可能原因：

- 一个事务等待 `X` 锁，但不断有新事务获得同一数据项的 `S` 锁
- 某事务在死锁恢复中反复被选为 victim 并回滚

解决 starvation 需要 lock manager 在调度策略中考虑公平性。

### Deadlock Prevention

死锁预防的目标：让系统永远不会进入死锁状态。

常见方法：

**预声明所有锁**

事务开始前一次性锁住所有需要的数据项。

优点：简单，避免死锁。

缺点：

- 事务必须提前知道所有访问对象
- 并发度低

**数据项偏序**

对所有数据项规定一个偏序，事务只能按该顺序加锁。

如果所有事务都按同一顺序请求锁，就不会形成循环等待。

**Timeout**

事务等待锁超过一定时间后自动回滚。

优点：实现简单。

缺点：

- 可能误杀没有死锁的长等待事务
- timeout 阈值难设
- 可能导致 starvation

### Wait-Die 与 Wound-Wait

这两种方法只用时间戳来预防死锁。

设 older transaction 表示时间戳更小的事务。

| 方法 | 类型 | 规则 |
|---|---|---|
| wait-die | non-preemptive | 老事务可以等新事务；新事务不能等老事务，新事务回滚 |
| wound-wait | preemptive | 老事务请求新事务持有的锁时，强制新事务回滚；新事务可以等老事务 |

重启事务使用原时间戳。

这样事务越老优先级越高，可避免 starvation。

### Deadlock Detection

死锁可以用 **wait-for graph** 检测。

图定义：

```text
G = (V, E)
```

- `V`：系统中的事务
- `Ti -> Tj`：`Ti` 正在等待 `Tj` 释放某个数据项

结论：

> wait-for graph 中存在有向环，当且仅当系统存在死锁。

系统需要周期性运行 cycle detection。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132139.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Deadlock Recovery

检测到死锁后，需要选择某个事务作为 **victim** 回滚。

选择 victim 时通常考虑：

- 已经执行了多久
- 已经持有多少锁
- 已经修改多少数据
- 回滚代价
- 过去被回滚次数

回滚方式：

- **Total rollback**：整个事务 abort，然后重启
- **Partial rollback**：只回滚到足以打破死锁的位置

为避免 starvation，应把事务已回滚次数纳入 victim 选择成本。

### 例题

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132152.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

给定 lock table：

- `I1`：`T2` granted，`T1` waiting
- `I11`：`T1` granted，`T6` waiting
- `I15`：`T6` granted，`T2` waiting

得到 wait-for edges：

```text
T1 -> T2
T2 -> T6
T6 -> T1
```

所以死锁事务是：

```text
T1, T2, T6
```

回滚其中任意一个都可以打破环。若题目没有给出回滚代价，通常选择代价最低者；从图中看，`T6` 只持有一个 granted lock，回滚 `T6` 是合理选择。

辅助数据结构：

```text
transaction -> list of locks held
```

这样事务 commit / abort 时可以快速释放所有持有锁。


---

## Graph-Based Protocols

Graph-based protocols 是 2PL 的另一类替代方案。

基本思想：

- 对所有数据项集合 `D = {d1, d2, ..., dh}` 定义一个偏序 `->`
- 如果 `di -> dj`，任何同时访问 `di` 和 `dj` 的事务都必须先访问 `di`，再访问 `dj`
- 数据项可看作一个有向无环图，称为 database graph

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132242.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Tree Protocol

tree protocol 是一种简单的 graph protocol。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132303.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

规则：

1. 只允许 `X` 锁
2. 事务的第一个锁可以加在任意数据项上
3. 之后事务只有在持有父节点锁时，才能锁子节点
4. 数据项可以在任意时间解锁
5. 一个事务释放过某个数据项后，不能再次锁该数据项

它保证：

- conflict serializability
- deadlock freedom

优点：

- 允许比 2PL 更早释放锁
- 等待时间可能更短
- 不会死锁，所以不需要 deadlock rollback

缺点：

- 不保证 recoverability 和 cascade freedom，需要额外 commit dependency
- 事务可能为了访问某个节点而锁住并不真正需要的数据项
- 锁开销可能增加，并发度可能下降

---

## Multiple Granularity

### 为什么需要多粒度

如果所有锁都加在 record 级别：

- 并发度高
- 锁数量多，开销大

如果所有锁都加在 table / database 级别：

- 锁数量少
- 并发度低

**Multiple Granularity** 允许数据项有不同粒度，形成层次结构：

```text
database
  area
    file / table
      record
```

当事务显式锁住某个节点时，会隐式锁住它的所有后代节点。

- 细粒度：高并发，高锁开销
- 粗粒度：低锁开销，低并发

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132358.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Intention Locks

除了 `S` 和 `X`，多粒度封锁还需要意向锁。

| 锁模式 | 含义 |
|---|---|
| IS | intention-shared，表示将在更低层加 `S` 锁 |
| IX | intention-exclusive，表示将在更低层加 `X` 或 `S` 锁 |
| SIX | shared and intention-exclusive，当前子树整体被 `S` 锁住，同时还会在更低层加 `X` 锁 |

意向锁的作用：

> 让系统在检查高层节点是否能加锁时，不必扫描所有后代节点。

例如：

- 一个事务想在整张表上加 `S` 锁
- 只需要检查表节点上是否已有 `IX` / `SIX` / `X` 等冲突锁
- 不需要逐个检查每条记录是否被写锁锁住

### 多粒度锁相容矩阵

| 已持有 \ 请求 | IS | IX | S | SIX | X |
|---|---:|---:|---:|---:|---:|
| IS | true | true | true | true | false |
| IX | true | true | false | false | false |
| S | true | false | true | false | false |
| SIX | true | false | false | false | false |
| X | false | false | false | false | false |


### 多粒度封锁协议

事务 `Ti` 给节点 `Q` 加锁时必须遵守：

1. 遵守锁相容矩阵
2. 必须先锁 root，root 可用任意模式
3. 若要对 `Q` 加 `S` 或 `IS`，父节点必须已由 `Ti` 持有 `IS` 或 `IX`
4. 若要对 `Q` 加 `X`、`IX` 或 `SIX`，父节点必须已由 `Ti` 持有 `IX` 或 `SIX`
5. 事务必须遵循 2PL：释放过锁后不能再获得新锁
6. 只有当 `Ti` 不再持有 `Q` 的任何子节点锁时，才能释放 `Q`

因此：

- 加锁顺序：root -> leaf
- 解锁顺序：leaf -> root

### Lock Escalation

如果某事务在低层持有过多锁，系统可以进行 **lock escalation**：

```text
许多 record-level S locks  ->  一个 table-level S lock
许多 record-level X locks  ->  一个 table-level X lock
```

作用：减少锁数量和 lock manager 开销。

代价：降低并发度。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260609132803.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

---

## Insert、Delete 与 Phantom

### Insert / Delete 的基本规则

在 2PL 下：

- 删除 tuple：事务必须持有该 tuple 的 `X` 锁
- 插入 tuple：事务会获得新 tuple 的 `X` 锁

但只锁 tuple 会带来一个特殊问题：**phantom phenomenon**。

### Phantom Phenomenon

例子：

```text
T1: find sum of balances of all accounts in Perryridge
T2: insert a new account at Perryridge
```

`T1` 扫描已有 tuple，`T2` 插入一个新 tuple。

二者可能没有访问任何共同 tuple，但它们在语义上冲突：

- `T1` 读取的是“满足条件的 tuple 集合”
- `T2` 修改了这个集合本身

如果只对已有 tuple 加锁，`T1` 无法阻止 `T2` 插入新的满足条件的 tuple。

这就是幽灵现象。

典型表现：

```text
同一事务中第一次查询 age = 18 的学生得到 100 人
中间另一个事务插入一个 age = 18 的学生并提交
第二次查询得到 101 人
```

第 101 个人像“幽灵”一样出现。

### 直接锁关系集合信息

一种简单方案：

- 给 relation 额外关联一个数据项，表示“这个 relation 当前包含哪些 tuple”
- 扫描 relation 的事务对该数据项加 `S` 锁
- 插入 / 删除 tuple 的事务对该数据项加 `X` 锁

问题：并发度很低。

因为所有插入 / 删除都会和所有 relation scan 冲突。

### Index Locking

更高并发的方案是 **index locking**。

规则：

- 每个 relation 至少有一个 index
- 事务只能通过 index 找 tuple
- 查询时，事务对访问过的 index leaf nodes 加 `S` 锁
- 即使某个 leaf node 中没有满足条件的 tuple，只要范围查询访问到它，也要加锁
- 插入 / 更新 / 删除 tuple 时，事务必须更新 relation 上所有 index
- 并对受影响的 index leaf nodes 加 `X` 锁
- 仍然遵守 2PL

这样范围查询和插入 / 删除会在 index leaf 上发生冲突，从而避免 phantom。

### Next-Key Locking

锁整个 index leaf 可能并发度较差。

更细的替代方案：

- 锁住满足查询条件的 key values
- 再锁住范围后的 next key value
- 查询使用 `S` 锁
- insert / delete / update 使用 `X` 锁

这样可以保证：

> 范围查询与会改变该范围结果的插入 / 删除 / 更新发生冲突。

这类思想常称为 **key-range locking** 或 **next-key locking**。

---

## Index Concurrency

Index 与普通数据项不同。

Index 的作用是帮助定位数据，而索引节点本身不是用户真正关心的数据内容。

如果对 B+-tree 的每个节点都严格使用 2PL，会导致很低并发度，因为：

- index 被访问频率极高
- 内部节点几乎每次查询都会访问
- 长时间锁住内部节点会阻塞大量事务

因此索引结构通常使用专门的并发协议。

### Crabbing Protocol

B+-tree 中常见思想是 **crabbing / latch coupling**。

搜索 / 插入 / 删除时：

1. 先以 shared mode 锁住 root
2. 锁住需要访问的 child 后，释放 parent
3. 到 leaf 后执行实际访问
4. 插入 / 删除时，将 leaf lock 升级为 exclusive mode
5. 如果 split 或 coalesce 需要修改 parent，再对 parent 加 exclusive lock

这不严格满足 2PL，因为 parent lock 会被提前释放。

但这是可以接受的：

- 只要索引结构保持正确
- 并且最终定位到正确 leaf
- 数据本身的事务隔离性仍由数据项上的并发控制保证


---

## Timestamp-Based Protocols

### 基本思想

每个事务进入系统时获得一个时间戳 `TS(Ti)`。

如果 `Ti` 比 `Tj` 更早进入系统，则：

```text
TS(Ti) < TS(Tj)
```

时间戳协议要求事务执行效果等价于按时间戳顺序串行执行。

对每个数据项 `Q`，系统维护：

| 字段 | 含义 |
|---|---|
| `W-timestamp(Q)` | 成功执行 `write(Q)` 的事务中最大的时间戳 |
| `R-timestamp(Q)` | 成功执行 `read(Q)` 的事务中最大的时间戳 |

### Read Rule

事务 `Ti` 执行 `read(Q)`：

1. 如果 `TS(Ti) < W-timestamp(Q)`：
   - `Q` 已经被“更年轻”的事务写过
   - `Ti` 需要读的旧值已经被覆盖
   - 拒绝该读操作，`Ti` 回滚
2. 否则：
   - 执行 `read(Q)`
   - 更新：

```text
R-timestamp(Q) = max(R-timestamp(Q), TS(Ti))
```

### Write Rule

事务 `Ti` 执行 `write(Q)`：

1. 如果 `TS(Ti) < R-timestamp(Q)`：
   - 已经有更年轻事务读过旧值
   - 如果现在让 `Ti` 写入，会破坏时间戳顺序
   - `Ti` 回滚
2. 如果 `TS(Ti) < W-timestamp(Q)`：
   - 已经有更年轻事务写过 `Q`
   - `Ti` 的写是 obsolete write
   - `Ti` 回滚
3. 否则：
   - 执行 `write(Q)`
   - 更新：

```text
W-timestamp(Q) = TS(Ti)
```

### 性质

Timestamp-ordering protocol 保证 serializability。

原因：

> 所有冲突边都从较小时间戳事务指向较大时间戳事务，所以 precedence graph 不可能有环。

它也没有死锁，因为事务不会等待锁。

缺点：

- 可能产生不可恢复调度
- 可能产生 cascading rollback
- 冲突时直接回滚，代价可能较高

### Recoverability 问题

如果 `Tj` 读了 `Ti` 写过的数据，而 `Ti` 后来 abort，则 `Tj` 必须 abort。

如果 `Tj` 已经 commit，调度就不可恢复。

解决思路：

- 事务把所有写操作推迟到末尾，并以原子方式执行
- 读未提交数据前等待该数据提交
- 使用 commit dependencies 保证依赖事务按正确顺序提交

### Thomas' Write Rule

Thomas' Write Rule 修改 timestamp-ordering 的写规则。

当 `Ti` 执行 `write(Q)` 且：

```text
TS(Ti) < W-timestamp(Q)
```

普通 timestamp protocol 会回滚 `Ti`。

Thomas' Write Rule 认为：

> 这是一个 obsolete write，可以直接忽略这次写，而不必回滚事务。

好处：提高并发度。

特点：

- 可以产生一些 view-serializable 但不是 conflict-serializable 的调度
- 比普通 timestamp-ordering 更宽松

---

## Validation-Based Protocols

Validation-based protocol 也称 **optimistic concurrency control**。

它适合冲突概率较低的场景。

核心思想：

> 先让事务自由执行，提交前再检查是否与其他事务冲突。

### 三个阶段

事务 `Ti` 执行分三阶段：

| 阶段 | 含义 |
|---|---|
| Read and Execution Phase | 读取数据库，计算结果，但写入临时局部变量 |
| Validation Phase | 检查本事务能否安全提交 |
| Write Phase | 如果验证通过，将临时结果写回数据库；否则回滚 |

并发事务的三个阶段可以交错。

为简化讨论，通常假设 validation phase 和 write phase 合在一起原子执行，也就是同一时刻只有一个事务在验证 / 写回。

### 三个时间戳

每个事务 `Ti` 有三个时间：

| 时间 | 含义 |
|---|---|
| `Start(Ti)` | 事务开始执行时间 |
| `Validation(Ti)` | 事务进入 validation phase 的时间 |
| `Finish(Ti)` | 事务完成 write phase 的时间 |

串行化顺序按 `Validation(Ti)` 决定。

这样比一开始就固定串行顺序更灵活。

### Validation Test

对正在验证的事务 `Tj`，对所有满足：

```text
TS(Ti) < TS(Tj)
```

的事务 `Ti`，如果满足以下任一条件，则 `Tj` 验证通过：

条件一：

```text
Finish(Ti) < Start(Tj)
```

含义：`Ti` 在 `Tj` 开始前已经结束，没有并发重叠。

条件二：

```text
Start(Tj) < Finish(Ti) < Validation(Tj)
write_set(Ti) ∩ read_set(Tj) = ∅
```

含义：二者有重叠，但 `Ti` 写过的数据没有被 `Tj` 读过，所以 `Tj` 的读结果没有受到 `Ti` 的影响。

如果检查失败，`Tj` abort。

### 适用场景

适合：

- 读多写少
- 冲突概率低
- 不希望长时间持锁

不适合：

- 热点数据频繁更新
- 冲突概率高，提交前大量事务被回滚

---

## Multiversion Schemes

### 基本思想

多版本协议保留数据项的旧版本。

每次成功写入都会创建新版本：

```text
Q: <Q1, 1>, <Q2, 2>, <Q3, 3>
```

其中第二个字段通常表示版本时间戳。

事务读 `Q` 时，根据自己的时间戳选择合适版本。

好处：

> 读事务通常不用等待写事务，因为系统可以返回某个已经提交的旧版本。

代价：

- 需要保存多个版本，增加存储开销
- tuple 中还需要保存版本元数据
- 旧版本需要 garbage collection

### Multiversion Timestamp Ordering

每个数据项 `Q` 有多个版本：

```text
<Q1, Q2, ..., Qm>
```

每个版本 `Qk` 包含：

| 字段 | 含义 |
|---|---|
| content | 该版本的值 |
| `W-timestamp(Qk)` | 创建该版本的事务时间戳 |
| `R-timestamp(Qk)` | 成功读过该版本的最大事务时间戳 |

事务 `Ti` 读或写 `Q` 时，先找到版本 `Qk`：

```text
Qk = W-timestamp <= TS(Ti) 的最新版本
```

读规则：

```text
read(Q) 返回 Qk 的 content
```

写规则：

1. 如果 `TS(Ti) < R-timestamp(Qk)`：
   - 有更年轻事务已经读过 `Qk`
   - `Ti` 回滚
2. 如果 `TS(Ti) = W-timestamp(Qk)`：
   - 覆盖 `Qk`
3. 否则：
   - 创建 `Q` 的新版本

性质：

- reads always succeed
- write 可能失败
- 保证 serializability

### Multiversion Two-Phase Locking

该协议区分两类事务：

```sql
SET TRANSACTION READ ONLY;
SET TRANSACTION READ WRITE;
```

**Update transactions**：

- 获取读锁和写锁
- 持有所有锁到事务结束，遵循 rigorous 2PL
- 每次成功写入创建新版本
- 新版本时间戳来自全局计数器 `ts-counter`

**Read-only transactions**：

- 开始前读取当前 `ts-counter` 作为 `TS(Ti)`
- 执行 `read(Q)` 时，返回时间戳不超过 `TS(Ti)` 的最新版本
- 不需要等待 update transactions

更新事务提交时：

```text
1. 将自己创建的新版本时间戳设为 ts-counter + 1
2. ts-counter = ts-counter + 1
3. 释放所有锁
```

因此：

- 在更新事务提交后启动的只读事务，会看到更新后的版本
- 在更新事务提交前启动的只读事务，会看到更新前的版本
- 只读事务不会阻塞写事务，写事务也不会阻塞只读事务
- 产生的调度仍然 serializable

### Garbage Collection

多版本会产生过期版本。

删除规则：

> 设系统中最老的 active read-only transaction 时间戳为 `Told`。对某数据项 `Q`，保留所有版本中时间戳 `<= Told` 的最新版本，以及所有更新版本；更老的版本可以删除。

例子：

```text
Q: <Q1,1>, <Q2,2>, <Q3,3>, <Q4,4>
```

如果最老活跃只读事务时间戳为 `3`，则 `Q1`、`Q2` 已不再需要，可以回收。

---

## Snapshot Isolation

### 动机

决策支持查询经常读取大量数据。

OLTP 事务通常只更新少量行。

如果大查询和小更新都使用普通锁，会互相阻塞，性能很差。

多版本思想可以给事务一个逻辑快照，让读操作几乎不阻塞写操作。

### Snapshot Isolation 的规则

事务 `T1` 在 Snapshot Isolation 下：

- 启动时获得一个 committed data 的 snapshot
- 后续读操作都从该 snapshot 中读
- 自己写入的数据对自己可见
- 并发事务的更新对自己不可见
- 写入在 commit 时生效
- commit 时使用 **first-committer-wins** 规则

first-committer-wins：

> 如果另一个与当前事务并发的事务已经提交，并写过当前事务也想写的数据项，则当前事务 abort。

### 课件例子

初始：

```text
X = 0, Y = 0, Z = 0
```

执行过程：

```text
T1: W(Y := 1); Commit
T2: Start
T2: R(X) -> 0
T2: R(Y) -> 1
T3: W(X := 2); W(Z := 3); Commit
T2: R(Z) -> 0
T2: R(Y) -> 1
T2: W(X := 3)
T2: Commit-Req
```

`T2` 的 snapshot 在 `T3` commit 前已经固定，所以 `T2` 看不到 `T3` 对 `Z` 的修改。

但 `T2` 也要写 `X`，而 `T3` 已经并发写过并提交了 `X`。

根据 first-committer-wins，`T2` abort。

> [插图占位] 插入 slides p.67 的 Snapshot Isolation 时间线，展示 T2 看不到 T3 的并发更新，但因 X 冲突提交失败。

### First-Updater-Wins

first-updater-wins 是一个变体：

- 在执行写操作时检查并发更新
- 如果发现冲突，提前 abort
- 与 first-committer-wins 的主要区别是 abort 发生时间更早

课件提到 Oracle 使用类似 first-updater-wins 的方案。

### Snapshot Isolation 的优点

- 读不会被写阻塞
- 读也不会阻塞其他事务
- 性能接近 Read Committed
- 避免常见异常：
  - dirty read
  - lost update
  - non-repeatable read
  - predicate-based phantom

### Snapshot Isolation 的问题

SI 不总是 serializable。

原因：

- 串行执行时，并发事务中总有一个能看到另一个的结果
- SI 中，两个并发事务可能都只看到旧 snapshot，彼此看不到对方结果

### Write Skew

例子：

```text
T1: x := y
T2: y := x
Initial: x = 3, y = 17
```

串行执行结果：

```text
T1 -> T2: x = 17, y = 17
T2 -> T1: x = 3,  y = 3
```

如果 `T1` 和 `T2` 同时开始，使用 snapshot isolation：

```text
T1 看到 x = 3, y = 17，于是写 x = 17
T2 看到 x = 3, y = 17，于是写 y = 3
```

最终：

```text
x = 17, y = 3
```

这个结果不等价于任何串行顺序。

这就是 **write skew**。

类似问题也会发生在插入场景：

```text
find max(order_no)
insert new order with order_no = max + 1
```

两个并发事务可能基于同一个旧最大值生成重复 order number。

> [插图占位] 插入 slides p.71 的 write skew 例子，标注 serial execution 与 snapshot isolation 的不同结果。

### Select For Update

某些查询可以通过：

```sql
select max(orderno)
from orders
for update;
```

来规避部分 SI 问题。

`select ... for update` 会把读到的数据当作要更新的数据来锁住，从而阻止并发更新。

局限：

- 不能总是保证 serializability
- phantom phenomenon 仍可能出现
- 对范围 / 谓词查询还需要 key-range locking 或 predicate locking

课件中的历史说明：

- Oracle 的 serializable isolation 实际采用 SI 变体
- PostgreSQL 9.1 之前的 serializable 也接近 SI
- PostgreSQL 9.1 引入 Serializable Snapshot Isolation，提供真正 serializability

---

## Weak Levels of Consistency

实践中并不总是要求 serializability。

有些场景更重视吞吐量和响应时间，只需要较弱一致性。

### Degree-Two Consistency

与 2PL 的区别：

- `S` 锁可以随时释放
- 后续也可以继续获得新锁
- `X` 锁必须持有到事务结束

结果：

- 不保证 serializability
- 需要程序员确保不会产生错误状态

### Cursor Stability

Cursor stability 是 degree-two consistency 的特例。

读 tuple 时：

```text
lock tuple
read tuple
unlock tuple immediately
```

写锁仍持有到事务结束。

它可以避免部分丢失更新，但隔离性弱于 serializable。

### SQL Isolation Levels

SQL 允许非串行化执行。

| 隔离级别 | 含义 |
|---|---|
| Serializable | 最强，目标是串行化执行 |
| Repeatable Read | 只能读已提交记录；重复读同一记录应返回同值；phantom 可不防止 |
| Read Committed | 只读已提交数据，很多系统用 cursor stability 实现 |
| Read Uncommitted | 允许读未提交数据，可能 dirty read |

很多数据库默认使用 `Read Committed`。

需要更强隔离时，要显式设置：

```sql
set isolation level serializable;
```

---

## Transactions across User Interaction

很多应用需要跨用户交互保持事务语义。

例如：

1. 用户打开页面查看账户余额
2. 用户思考一段时间
3. 用户点击提交转账

此时不能简单地一直持有数据库锁：

- 用户交互时间不可控
- 长时间持锁会严重阻塞其他事务
- 也不希望每个用户长期占用一个数据库连接

### 应用层并发控制

常见做法：给 tuple 增加 version number。

读取时记录版本：

```sql
select r.balance, r.version
into :A, :version
from r
where acctId = 23;
```

写入时检查版本是否仍然相同：

```sql
update r
set r.balance = r.balance + :deposit,
    r.version = r.version + 1
where acctId = 23
  and r.version = :version;
```

如果影响行数为 0，说明该 tuple 在用户交互期间被别人修改过，当前操作应失败或重试。

这相当于：

- optimistic concurrency control
- 但不验证完整 read set
- 常见于 Hibernate ORM 等系统

---
