---
title: The Relational Model
published: 2026-03-03
description: About the relationol model
tags: [数据库系统]
category: 笔记
draft: false
---

## Content

1. Structure of Relational Databases
2. Database Schema
3. Keys
4. Schema Diagrams
5. Relational Query Languages
6. The Relational Algebra

---

## Structure of Relational Databases

### 关系模型的基本表示
关系模型用 **表（table）** 来组织数据：
- **relation（关系）**：一张表
- **attribute（属性）**：表中的列
- **tuple（元组）**：表中的行

例如 `instructor` 表中：
- `ID, name, dept_name, salary` 是属性
- 每一位教师对应的一行记录是一个元组。

---

### 关系的形式化定义
从数学上说，若有若干集合：

$$
D_1, D_2, \dots, D_n
$$

则一个关系 $r$ 是它们笛卡尔积的一个子集：

$$
r \subseteq D_1 \times D_2 \times \cdots \times D_n
$$

也就是说，一个关系本质上是若干个 **n 元组** 组成的集合，每个元组的第 $i$ 个分量取自集合 $D_i$。slides 中用 `name × dept_name × salary` 的例子说明了这一点。

### relation schema 与 relation instance
- **Relation schema（关系模式）**：描述表的结构  
  记作：

$$
R = (A_1, A_2, \dots, A_n)
$$

例如：

$$
instructor = (ID, name, dept\_name, salary)
$$

- **Relation instance（关系实例）**：某一时刻表中的实际数据内容
- 表中的每一行是一个 **tuple（元组）**

- **schema** = 表长什么样
- **instance** = 表里当前有什么数据。

---

### 属性与域（domain）
每个属性都有自己的 **domain（域）**，也就是该属性允许取值的集合。

例如：
- `dept_name` 的域：所有合法院系名
- `salary` 的域：所有合法工资值

可以把“域”简单理解成：**这一列允许放什么值**。

---

### 原子性（atomic）
关系模型通常要求属性值是 **atomic（原子的）**，即 **不可再分**。

例如：
- `"Physics"` 是原子的
- 如果一个属性里同时塞多个电话号码、多个课程号，就不满足原子性

这体现了关系模型希望一个单元格中只放一个基本值。

---

### null（空值）
`null` 表示：
- 值未知
- 值不存在
- 值暂时缺失

**null 会使很多运算的定义变复杂**。因此在数据库理论和 SQL 中，null 是一个非常特殊的值。

---

### 关系是无序的
关系中的元组顺序 **没有意义**：
- 哪一行排前面，哪一行排后面，不影响关系本身
- 数据库内部可以按任意顺序存储元组

这点很重要，因为关系从理论上看是一个**集合**，集合本身就是无序的。

---

## Database Schema

### Database schema 的含义
**Database schema（数据库模式）** 是数据库的 **逻辑结构**。  
也就是：数据库里有哪些表、每张表有哪些属性、属性之间有哪些约束。

```text
instructor(ID, name, dept_name, salary)
```

这就是一个关系模式；多个关系模式共同组成数据库模式。


### Database instance 的含义

**Database instance** 是数据库在某一时刻的数据快照，也就是那一刻数据库中实际存放的内容。

因此：

* **schema**：相对稳定，描述结构
* **instance**：经常变化，描述当前数据

可以类比为：

* schema 像“类/类型定义”
* instance 像“变量当前的值”

---

### relation schema 与 database schema 的层次区别

要区分两个层次：

#### Relation schema

单张表的结构，例如：

```text
instructor(ID, name, dept_name, salary)
```

#### Database schema

整个数据库的结构，例如数据库里有：

* `instructor`
* `student`
* `course`
* `department`

以及这些表之间的联系。

---

### schema 中通常还包含什么

教材总结里指出，关系模式除了属性外，通常还会包含属性类型，以及一些约束，例如：

* primary key constraints
* foreign-key constraints。

所以 schema 不只是“列名列表”，它还会隐含：

* 属性类型
* 主键
* 外键
* 其他完整性约束

---

## Keys

### Why key ?

在一张表中，我们需要某种机制来 **唯一标识一条记录**。
否则：

* 无法准确区分两行
* 无法建立表与表之间的联系
* 更新、删除、查询都会变得不可靠

因此引入了 **key（键）** 的概念。 

---

### Superkey（超键）

设 $K \subseteq R$，如果属性集 $K$ 的取值足以唯一标识关系 $R$ 中的一个元组，那么 $K$ 就是一个 **superkey**。slides 中直接给出了这个定义。

例如在 `instructor(ID, name, dept_name, salary)` 中：

* `{ID}` 是超键
* `{ID, name}` 也是超键

因为只要包含 `ID`，就已经能唯一标识教师。

超键的要求只有一个：

* **能唯一**

但它可以包含多余属性。

---

### Candidate key（候选键）

如果一个超键还是 **minimal（最小的）**，也就是去掉其中任何一个属性后都不再能唯一标识元组，那么它就是 **candidate key**。 

例如：

* `{ID}` 是候选键
* `{ID, name}` 不是候选键，因为 `name` 是多余的


候选键 = **最小超键**

也就是：

* 既要唯一
* 又不能冗余

---

### Primary key（主键）

从若干候选键中，选定一个作为主要标识，就得到 **primary key（主键）**。 

例如：

* `instructor` 表中通常选 `ID` 作为主键

**主键的作用**

* 唯一标识一行
* 是表中最核心的识别属性
* 其他表常通过它来引用该表

---

### Foreign key（外键）
定义是：

若关系 $r_1$ 中属性组 $A$ 引用关系 $r_2$ 的主键 $B$，则在任意数据库实例中，$r_1$ 中每个元组的 $A$ 值都必须在 $r_2$ 中某个元组的 $B$ 值中出现。

简单说：

> 外键就是“一个表中的属性去引用另一个表的主键”。

### 例子

如果：

* `department(dept_name, building, budget)`
* `instructor(ID, name, dept_name, salary)`

那么 `instructor.dept_name` 可以作为外键，引用 `department.dept_name`。

它的意义是：

* 教师所在院系必须是真实存在的院系
* 不能在 `instructor` 里写一个根本不存在的 `dept_name`

---

### Referencing relation 与 Referenced relation

和外键关联的两个表称为：

* **Referencing relation**：引用别人的那个表
* **Referenced relation**：被引用的那个表

例如：

* `instructor` 引用 `department`
* 那么 `instructor` 是 referencing relation
* `department` 是 referenced relation

---

### Referential integrity（参照完整性）

参照完整性要求：

> 在引用关系中出现的外键值，必须在被引用关系中实际存在。 

这是外键约束背后的核心思想。

