---
title: Introduction
published: 2026-03-03
description: Introduction to Database Systems
tags: [数据库系统]
category: 笔记
draft: false
---

## Database Systems

数据库系统用于管理具有以下特征的数据集合：

- **高价值（Highly valuable）**
- **规模较大（Relatively large）**
- **多用户并发访问（Accessed by multiple users and applications, often at the same time）**

### Files vs. Databases

|          | 文件系统                     | 数据库系统            |
| -------- | ---------------------------- | --------------------- |
| 架构     | App → Files                  | App → DBMS → Database |
| 数据管理 | 各应用独立维护               | 集中统一管理          |
| 问题     | 冗余、不一致、难并发、难恢复 | 由 DBMS 统一解决      |

👉 DBMS 是应用和数据库之间的中间层

file system会导致:

1. Data redundancy and inconsistency（数据冗余和不一致）
2. Data isolation（数据孤立）
3. Difficulties in accessing data（数据访问困难）
4. Integrity problems（完整性问题）
   - 例如：年龄不能为负数，成绩必须在0-100之间
5. Atomicity problems（原子性问题）
   - 例如：转账操作中，扣款成功但未到账，导致数据不一致
6. Concurrent access anomalies（并发访问异常）
   - 例如：两个用户同时修改同一条记录，可能导致数据丢失或不一致
7. Security problems（安全问题）
   - 例如：未经授权的用户访问敏感数据，导致数据泄露或篡改

Characteristics of Databases:

1. Data persistence(数据持久性)
2. Convenience in accessing data(数据访问便利性)
3. Data integrity （数据完整性）
4. Concurrency control for multiple users(多用户并发控制)
5. Failure recovery（故障恢复）
6. Security control（安全控制）

---

### Database & DBMS

**Database：** 一个企业中相互关联的数据集合（A collection of interrelated data about an enterprise）

**DBMS（Database Management System）：** 管理数据库的软件系统，目标是：

> Provide a way to store and retrieve data **conveniently** and **efficiently**.

DBMS 负责：存储与检索、权限控制、并发处理、崩溃恢复

---

### 数据库的两种使用模式

#### Online Transaction Processing

- 大量用户同时使用
- 每次操作数据量小（查询 + 小更新）
- 典型场景：银行转账、电商下单

#### Data Analytics

- 处理数据以得出结论、推断规则
- 结果用于驱动业务决策
- 典型场景：用户行为分析、销售预测

---

### 数据管理两方面

#### Defining Structures

定义数据的组织方式：表结构、字段类型、主键/外键、约束等。

```sql
create table student (
    id int primary key,
    name varchar(20),
    age int
);
```

#### Manipulation

增删改查（INSERT / DELETE / UPDATE / SELECT）

---

### 数据库系统核心要求

#### Safety

- 防止数据丢失与未授权访问
- 崩溃后可恢复（日志机制 + 备份）

#### Concurrency Control

多用户同时操作时必须保证数据正确性。

> 例：余额 100，T1 和 T2 各存 50，无并发控制结果可能为 150，正确结果应为 200。

---

## View of Data

数据库系统的一个重要目标：

> Provide users with an **abstract view** of the data.
> 隐藏数据如何存储和维护的细节。

为此，数据库采用 **Three-level abstraction（三层抽象结构）**。

---

### Three-Level Abstraction of Databases

![image.png](https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202603031456629.png)

数据库分为三层：

```
View Level
    ↓ (view/logical mapping)
Logical Level
    ↓ (logical/physical mapping)
Physical Level
```

---

### Physical Level（物理层）

- 描述数据如何真正存储
- 文件组织方式
- 索引结构
- 存储块结构

👉 关注 “how data are stored”

例如：

- 表是否顺序存储？
- 是否有 B+ 树索引？
- 数据在磁盘页中如何排列？

---

### Logical Level（逻辑层）

- 描述数据库存储了什么数据
- 描述数据之间的关系
- 定义表、属性、约束

👉 关注 “what data are stored”

例如：

```
Instructor(ID, name, dept_name, salary)
Department(dept_name, building, budget)
```

_程序员和 DBA 主要工作在这一层。_

---

### View Level（视图层）

- 只显示数据库的一部分
- 不同用户看到不同视图
- 用于简化使用与安全控制

例如：

教务人员：

- 只能看到 student 信息

不能看到：

- instructor 的 salary

👉 View = 数据库的子集表示

---

### 三层抽象的作用

1. **Hide the complexities（隐藏复杂性）**
2. **Enhance the adaptation to changes（增强对变化的适应能力）**

---

## Schema and Instance

类似于编程语言中的：

- type（类型）
- variable（变量）

---

### Schema

> 数据库的逻辑结构

类似于程序中的“类型定义”。

例如：

数据库包含：

- customers
- accounts
- 以及它们之间的关系

Schema 是设计，不是数据本身。

---

### 分类

- **Physical Schema（物理模式）**
  - 数据库在物理层的设计

- **Logical Schema（逻辑模式）**
  - 数据库在逻辑层的设计
  - 最重要，应用程序依赖它

- **View Schema（视图模式）**
  - 不同用户看到的子模式

---

### Instance

> 数据库在某一时刻的实际内容

类似于变量当前的 value。

Schema 是“结构”，
Instance 是“数据”。

---

## Data Independence

数据独立性 =
某一层改变，不影响上一层。

---

### Physical Data Independence（物理数据独立性）

> 可以修改 physical schema 而不改变 logical schema

例如：

- 改变索引结构
- 改变文件存储方式

应用程序不需要修改。

👉 Applications depend on logical schema, not physical schema.

---

### Logical Data Independence（逻辑数据独立性）

> 可以修改 logical schema 而不改变 user view schema

例如：

- 增加字段
- 重构表结构

用户视图不需要改变。

---

## Data Models

数据模型是：

> A collection of tools for describing:

- Data（数据）
- Data relationships（联系）
- Data semantics（语义）
- Data constraints（约束）

---

### 常见数据模型

1. **Relational Model（关系模型）**
2. **Entity-Relationship Model（实体-联系模型）**
3. **Object-based Data Models**
   - Object-oriented
   - Object-relational
4. **Semistructured Data Model（XML）**
5. 旧模型：
   - Network Model（网状模型）
   - Hierarchical Model（层次模型）

---

## Relational Model（关系模型）

由 **Ted Codd** 提出（Turing Award 1981）

特点：

- 数据以表（table）形式表示
- 每张表由：
  - Columns（Attributes，属性）
  - Rows（Tuples，元组）

例如：

| ID  | name | dept_name | salary |
| --- | ---- | --------- | ------ |

- 列 = 属性（Attribute）
- 行 = 元组（Tuple）

关系模型是当前最广泛使用的数据模型。

👉 Chapter 2 将详细讨论。

---

## Database Languages

### Data Definition Language (DDL)

DDL 用于定义数据库的 schema（结构规范），例如：

```sql
create table instructor (
    ID          char(5),
    name        varchar(20),
    dept_name   varchar(20),
    salary      numeric(8,2),
    primary key (ID),
    foreign key (dept_name) references Department,
    check (salary >= 60000)
);
```

DDL 编译器会生成一组表模板，存储在 **数据字典（Data Dictionary）** 中。

#### Data Dictionary（数据字典）

数据字典保存 **元数据（Metadata，即关于数据的数据）**，包括：

- **Database schema（数据库模式）**
- **Integrity constraints（完整性约束）**
  - **Primary key**：唯一标识一条记录
    - 例：`ID` 唯一标识每位 instructor
  - **Referential integrity（参照完整性）**：外键引用必须在目标表中存在
    - 例：instructor 中的 `dept_name` 必须出现在 department 表中
  - **Check 约束**：字段值满足指定条件
    - 例：`salary >= 60000`
- **Authorization（权限）**：哪些用户可以访问哪些数据

---

### Data Manipulation Language (DML)

数据控制语言用于查询和修改数据库中的数据，例如：

主要分为两类：
1. **Procedural DML（过程式 DML）**：用户指定如何获取结果，例如：使用游标（cursor）逐行处理数据。
    - 过程式语言是类似C语言要将怎么查找，用什么查找写出来的。
2. **Nonprocedural DML（非过程式 DML）**：用户只指定想要什么结果，数据库系统负责如何获取，例如：SQL 查询语言。
    - 非过程式语言是类似SQL语言只要写出想要什么结果，数据库系统会自己决定怎么查找。数据库系统会自行优化。

#### SQL Query Language

SQL 是最流行的非过程式 DML，具有以下特点：
- **Declarative（声明式）**：用户只描述想要的结果，不关心实现细节。
- **Set-oriented（面向集合）**：操作整个数据集，而不是逐行处理。
- **High-level（高级）**：比过程式语言更抽象，易于使用。

```sql
select name from instructor where dept_name = 'Comp. Sci.';
```

### Application Program Interface（API）

SQL 不是完整编程语言，

应用程序必须通过嵌入式 SQL 或数据库 API 来访问数据库，

数据处理与业务逻辑分离。

#### Web 应用访问数据库完整流程

```
┌──────────────────────┐
│      用户浏览器       │
│   (Browser / Client) │
└──────────┬───────────┘
           │  HTTP Request
           ▼
┌──────────────────────┐
│       Web Server      │
│   (Nginx / Apache)    │
└──────────┬───────────┘
           │ 转发请求
           ▼
┌──────────────────────┐
│    应用程序服务器     │
│ (Java / Python / Go) │
│  业务逻辑处理层       │
└──────────┬───────────┘
           │
           │ 调用数据库 API
           │ (JDBC / ODBC / ORM)
           ▼
┌──────────────────────┐
│        DBMS          │
│   (MySQL / PostgreSQL)│
│  SQL解析 + 优化 + 执行 │
└──────────┬───────────┘
           │
           │ 访问数据文件
           ▼
┌──────────────────────┐
│       数据库文件       │
│  (磁盘上的数据页/索引) │
└──────────────────────┘
```

---

#### 数据返回流程

```
数据库文件
      ▲
      │
DBMS 执行结果
      ▲
      │
API 返回结果集
      ▲
      │
应用程序处理数据
      ▲
      │
Web Server 返回 HTTP Response
      ▲
      │
用户浏览器显示页面
```

---

**每一层的职责：**
1. 浏览器

* 发送 HTTP 请求
* 接收 HTML / JSON 响应
* 展示页面

2. Web Server

* 处理网络连接
* 转发请求给应用程序

---

3. 应用程序服务器（Host Language）

* 编写业务逻辑
* 构造 SQL
* 调用数据库 API
* 处理返回数据

例如：

```python
cursor.execute("SELECT * FROM instructor")
```


4. API 层

* JDBC / ODBC / ORM
* 负责把 SQL 发送给数据库
* 接收结果

---

5. DBMS

内部做：

1. SQL 解析
2. 查询优化
3. 执行计划生成
4. 数据读取
5. 事务管理
6. 并发控制

---

6. 数据库文件

* 数据页
* 索引页
* 日志文件

---
