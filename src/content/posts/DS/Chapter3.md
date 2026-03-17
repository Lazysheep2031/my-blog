---
title: Introduction to SQL
published: 2026-03-17
description: sda
tags: [数据库系统]
category: 笔记
draft: true
---

## DDL：数据定义语言（Data Definition Language）

DDL 用来**定义数据库结构**，主要包括：

- 表的模式（schema）
- 各属性的数据类型（domain）
- 完整性约束（integrity constraints）
- 其他相关信息：
  - 索引
  - 安全与授权
  - 物理存储结构

DDL 不是“操作数据”的，而是“规定数据怎么组织”。

例如：

```sql
create table student(
    id int not null primary key,
    age int,
    name varchar(16)
);
````

含义：

* 创建一张 `student` 表
* `id` 是整数，不能为空，并且是主键
* `age` 是整数
* `name` 是最长 16 个字符的可变长字符串

---

### 3. SQL 中常见的数据类型（Domain Types）

#### 3.1 字符串类型

* `char(n)`：定长字符串
* `varchar(n)`：变长字符串，最大长度为 n

#### 3.2 整数类型

* `int`：普通整数
* `smallint`：较小范围整数

#### 3.3 定点数类型

* `numeric(p,d)` / `decimal(p,d)`
* `p`：总位数
* `d`：小数点右边位数

例：

```sql
numeric(3,1)
```

* 可以精确存 `44.5`
* 不可以存 `444.5`
* 不可以存 `0.32`

> 适合金额、成绩等要求精确表示的小数。

#### 3.4 浮点数类型

* `real`
* `double precision`
* `float(n)`

特点：

* 表示范围大
* 一般是近似值
* 可能存在精度误差

> 金额通常不用浮点型，优先用 `numeric/decimal`。

---
