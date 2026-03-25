---
title: Intermediate SQL
published: 2026-03-24
description: Views, Indexes, Transactions, Authorization
tags: [数据库系统]
category: 笔记
draft: false
---

## 概述

Chapter 3 解决的是：

- 关系怎样用 SQL 建出来
- 基本查询怎样写
- 聚合、子查询、增删改怎样表达

Chapter 4 进一步解决：

- 多表连接怎样写得更清楚、更安全
- 数据类型和 domain 怎样更规范地表达业务含义
- 数据库怎样自己保证数据合法
- view 为什么是“虚拟表”，什么时候可以更新
- 索引为什么能加速查询
- 事务为什么要求 all-or-nothing
- 数据库权限应该如何管理



---

## 目录

- [概述](#概述)
- [目录](#目录)
- [Joined Relations](#joined-relations)
  - [自然连接 `natural join`](#自然连接-natural-join)
    - [`natural join` 的优点与风险](#natural-join-的优点与风险)
  - [`join ... using(...)`](#join--using)
  - [`join ... on`](#join--on)
  - [外连接 `outer join`](#外连接-outer-join)
    - [1. `left outer join`](#1-left-outer-join)
    - [2. `right outer join`](#2-right-outer-join)
    - [3. `full outer join`](#3-full-outer-join)
- [SQL Data Types and Schemas](#sql-data-types-and-schemas)
  - [用户自定义类型 `create type`](#用户自定义类型-create-type)
  - [域 `domain`](#域-domain)
  - [大对象 `blob / clob`](#大对象-blob--clob)
    - [`blob`](#blob)
    - [`clob`](#clob)
- [Integrity Constraints](#integrity-constraints)
  - [`not null` 与 `unique`](#not-null-与-unique)
    - [`not null`](#not-null)
    - [`unique`](#unique)
  - [`check (P)`](#check-p)
  - [`foreign key` 与参照完整性](#foreign-key-与参照完整性)
  - [`on delete` / `on update`](#on-delete--on-update)
  - [自引用外键](#自引用外键)
  - [复杂约束、`assertion` 与 `trigger`](#复杂约束assertion-与-trigger)
    - [带子查询的 `check`](#带子查询的-check)
    - [`assertion`](#assertion)
    - [`trigger`](#trigger)
- [Views](#views)
  - [什么是 view](#什么是-view)
  - [`create view`](#create-view)
  - [复杂条件 view](#复杂条件-view)
  - [带聚合的 view](#带聚合的-view)
  - [View Expansion](#view-expansion)
  - [View 可以基于 View 再定义](#view-可以基于-view-再定义)
  - [View 的更新问题](#view-的更新问题)
    - [例 1：简单 view 的插入问题](#例-1简单-view-的插入问题)
    - [例 2：多表 view 的更新更难](#例-2多表-view-的更新更难)
  - [什么是 updatable view](#什么是-updatable-view)
  - [`with check option`](#with-check-option)
  - [Materialized View](#materialized-view)
  - [普通 view vs materialized view](#普通-view-vs-materialized-view)
    - [普通 view](#普通-view)
    - [materialized view](#materialized-view-1)
  - [Materialized view 的维护问题](#materialized-view-的维护问题)
  - [View 与 Logical Data Independence](#view-与-logical-data-independence)
- [Indexes](#indexes)
  - [索引的代价](#索引的代价)
- [Transactions](#transactions)
  - [`commit` 与 `rollback`](#commit-与-rollback)
    - [`commit`](#commit)
    - [`rollback`](#rollback)
  - [MySQL 中的一个典型例子](#mysql-中的一个典型例子)
  - [ACID](#acid)
    - [1. Atomicity（原子性）](#1-atomicity原子性)
    - [2. Consistency（一致性）](#2-consistency一致性)
    - [3. Isolation（隔离性）](#3-isolation隔离性)
    - [4. Durability（持久性）](#4-durability持久性)
  - [Transaction Boundaries](#transaction-boundaries)
- [Authorization](#authorization)
  - [基本权限类型](#基本权限类型)
    - [数据级权限](#数据级权限)
    - [结构级权限](#结构级权限)
  - [`grant`](#grant)
  - [`public`](#public)
  - [`revoke`](#revoke)
  - [一个用户可能通过多条路径获得同一权限](#一个用户可能通过多条路径获得同一权限)
  - [Roles](#roles)
  - [role 可以继承](#role-可以继承)
  - [View 与权限控制](#view-与权限控制)
  - [`references` 权限](#references-权限)
  - [`with grant option`](#with-grant-option)
  - [权限传播图](#权限传播图)
  - [`cascade` 与 `restrict`](#cascade-与-restrict)
    - [`cascade`](#cascade)
    - [`restrict`](#restrict)
  - [只撤销转授权，不撤销实际权限](#只撤销转授权不撤销实际权限)

---

## Joined Relations

```sql
select name, course_id
from instructor, teaches
where instructor.ID = teaches.ID;
```
连接要区分两个维度。
**1. 连接条件怎么写**

- `natural join`
- `join ... using(...)`
- `join ... on <predicate>`

**2. 对匹配不上的元组怎么处理**

- `inner join`
- `left outer join`
- `right outer join`
- `full outer join`

所以连接的核心其实是两个问题：

> 哪些行应该匹配在一起？
> 匹配不上的行要不要保留？

---

### 自然连接 `natural join`

`natural join` 会：

- 自动寻找两张表中所有同名属性
- 要求这些同名属性值相等
- 并且在结果中只保留一份公共列

例如：

```sql
select name, course_id
from instructor natural join teaches;
```

这里之所以合理，是因为：

- `instructor` 和 `teaches` 共同拥有 `ID`
- 而 `ID` 恰好就是应该拿来连接的属性

所以这条查询会得到：

- 教师姓名 `name`
- 他教授的课程号 `course_id`

---

#### `natural join` 的优点与风险

**优点**

- 写法短
- 对“共享列就是连接键”的情况很方便

**风险**

- 只要两张表里有同名列，`natural join` 就会自动把它们拿来相等比较
- 如果这些同名列在业务上并不该作为连接条件，就会出错

例如：

```sql
select name, title
from instructor natural join teaches natural join course;
```

这条语句的风险在于：

- `instructor` 和 `course` 都有 `dept_name`
- `natural join` 会自动要求它们相等
- 但这里真正想用来连接 `teaches` 和 `course` 的关键属性其实是 `course_id`

所以自然连接虽然方便，但不能无脑使用。

---

### `join ... using(...)`

如果你知道要按哪个同名属性连接，但又不想让其他同名属性偷偷参与连接，可以写：

```sql
select name, title
from (instructor natural join teaches)
     join course using (course_id);
```

这里的含义是：

- 前半段 `instructor natural join teaches` 仍然通过 `ID` 连接
- 后半段显式指定：只通过 `course_id` 把课程表连进来

`using (course_id)` 的好处是：

- 比 `natural join` 更安全
- 比 `on instructor.course_id = course.course_id` 更简洁
- 结果中公共列 `course_id` 只保留一份

---

### `join ... on`

如果连接条件不是简单的“同名列相等”，或者你想完全显式地控制条件，就用 `on`：

```sql
select name, title
from instructor join teaches
  on instructor.ID = teaches.ID
  join course
  on teaches.course_id = course.course_id;
```

这可以看作最通用、最清楚的写法。

你自己明确指定：

- 哪两张表连接
- 按什么条件连接

因此在真实开发里，`join ... on` 往往比 `natural join` 更稳妥。

---

### 外连接 `outer join`

普通的连接（inner join）只保留匹配成功的元组。

但有时我们不希望丢掉那些“没有匹配上”的数据，这时就需要外连接。

#### 1. `left outer join`

保留左表中的所有元组：

- 匹配上的正常拼接
- 匹配不上的右表属性补成 `null`

#### 2. `right outer join`

与 `left outer join` 相反，保留右表中的所有元组。

#### 3. `full outer join`

左右两边的元组都尽量保留，匹配不上的部分补 `null`。

---

**为什么需要外连接**

假设：

- 有些课程没有 prerequisite
- 有些 prerequisite 信息记录得不完整

如果只用 inner join，这些“不匹配”的行会被直接丢掉。

而 outer join 的作用就是：

> 尽量保留信息，而不是因为没有匹配就让数据消失。

---

## SQL Data Types and Schemas

### 用户自定义类型 `create type`

例如：

```sql
create type Dollars as numeric(12,2) final;
```

然后建表时可以写：

```sql
create table department (
    dept_name varchar(20),
    building varchar(15),
    budget Dollars
);
```

它的含义是：

- `Dollars` 本质上还是 `numeric(12,2)`
- 但我们给这个类型起了一个更有业务含义的名字

这样做的核心价值是：

- 提高可读性
- 强化语义表达

---

### 域 `domain`

相比 type，domain 更进一步。

它不只是“给类型起别名”，还可以附带约束。

例如：

```sql
create domain person_name char(20) not null;
```

表示：

- 只要某列使用 `person_name`
- 它就统一是 `char(20)`
- 并且不能为空

再例如：

```sql
create domain degree_level varchar(10)
constraint degree_level_test
check (value in ('Bachelors', 'Masters', 'Doctorate'));
```

这表示：

- 这个 domain 的值只能是三种学位等级之一

所以可以把 domain 理解成：

> 带规则的类型。

---

学号、工号、邮箱这类字段通常：

- 会在很多表里反复出现
- 格式规则相对固定
- 不希望每次建表都重复写一遍 `varchar(...) + check(...)`

例如学号就可以统一定义成：

```sql
create domain student_id varchar(10) not null;
```

之后凡是表示“学号”的列，都直接写 `student_id`。

要注意的是：

- 共用同一个 domain 表示“取值规则一致”
- 但**不代表自动形成外键关系**

外键仍然要单独写。

---

### 大对象 `blob / clob`

数据库里有些数据不是小字符串或小数字，而是很大的对象，例如：

- 图片
- 音频
- 视频
- PDF
- 很长的文本文档

这类数据可以用 **large object** 存储。

#### `blob`

`blob` = binary large object

适合存：

- 图片
- 音视频
- 任意二进制文件

数据库把它当作一串字节，不关心内部内容。

#### `clob`

`clob` = character large object

适合存：

- 很长的纯文本
- 文档正文
- 日志文本

所以：

- `blob` 偏二进制
- `clob` 偏大文本

---

**大对象查询时常常返回“引用”而不是直接返回全部内容**

因为大对象可能非常大。

如果每查一行就把整张图片、整段视频都完整搬出来，代价会很高。

因此很多系统会：

- 先返回一个定位信息或引用
- 真正需要时再取具体内容

---

## Integrity Constraints

完整性约束的目标是：

- 防止不合法数据进入数据库
- 防止合法操作把数据库改得不一致

---

### `not null` 与 `unique`

#### `not null`

```sql
name varchar(20) not null,
budget numeric(12,2) not null
```

含义很直接：

- 这些列不能取 `null`

它适用于那些业务上“必须有值”的属性，例如：

- 姓名
- 预算
- 学号

---

#### `unique`

```sql
unique(email)
```

表示：

- 该属性值不能重复

也可以是复合唯一性：

```sql
unique(course_id, sec_id, semester, year)
```

表示这几个属性组合起来不能重复。


:::TIP
`unique` 和 `primary key` 的区别

二者都会保证唯一，但：

**`primary key`**

- 唯一
- 不能为 `null`
- 用来作为这张表的主要标识

**`unique`**

- 唯一
- 通常允许 `null`（具体数据库实现细节可能不同）
- 更像“备用的唯一性规则”

例如学生表里：

- `ID` 是 primary key
- `email` 可以设置为 unique
:::

### `check (P)`

`check` 用来表达：

> 这个属性或这条记录必须满足某个逻辑条件。

例如：

```sql
check (semester in ('Fall', 'Winter', 'Spring', 'Summer'))
```

这表示：

- 学期字段只能取四个合法值之一

再比如：

```sql
check (salary > 29000)
check (year > 1759 and year < 2100)
```

这说明 `check` 特别适合表达：

- 范围限制
- 枚举值限制
- 同一行内部字段之间的逻辑关系

---

### `foreign key` 与参照完整性

外键表达的是：

> 一张表中的某些值，必须引用另一张表中真实存在的值。

例如：

```sql
create table course (
    course_id char(5) primary key,
    title varchar(20),
    dept_name varchar(20),
    foreign key (dept_name) references department(dept_name)
);
```

意思是：

- `course.dept_name` 的取值必须能在 `department.dept_name` 中找到

这就是参照完整性。

它能防止出现这种脏数据：

- 课程表里写了一个根本不存在的院系名

---

### `on delete` / `on update`

当被引用表中的记录被删除或修改时，引用它的表怎么处理？

常见策略有：

- `cascade`
- `set null`
- `set default`
- `restrict`

例如：

```sql
foreign key (dept_name) references department(dept_name)
    on delete set null
    on update cascade
```

可以理解为：

- `cascade`：跟着删 / 跟着改
- `set null`：把外键列改成 `null`
- `set default`：改成默认值
- `restrict`：不允许这样删除或修改

---

### 自引用外键

外键不一定引用别的表，也可以引用自己这张表。

例如：

```sql
create table person (
    ID char(10),
    name char(40),
    mother char(10),
    father char(10),
    primary key (ID),
    foreign key (father) references person,
    foreign key (mother) references person
);
```

这里：

- `person.ID` 是主键
- `father` 和 `mother` 也都是某个人的 `ID`
- 它们引用的仍然是 `person` 表本身

这种结构很常见，例如：

- 员工表中的 `manager_id`
- 评论表中的 `reply_to`
- 树结构中的 `parent_id`

:::WARNING
自引用外键带来的插入顺序问题

因为如果你先插入孩子：

- `father = 'F001'`
- `mother = 'M001'`

而 `F001`、`M001` 还没插入表中，那么外键约束就会失败。

常见解决办法有：

1. 先插父母，再插孩子
2. 先把 `father`、`mother` 设为 `null`，之后再更新
3. 把约束检查延迟到事务结束时统一检查

这说明完整性约束不仅影响“能不能这么写”，还影响“应该按什么顺序操作数据”。
:::

### 复杂约束、`assertion` 与 `trigger`

前面几种约束都比较“局部”：

- 限制某一列
- 限制某一行
- 限制某张表对另一张表的引用

但现实中还有更复杂的约束，例如：

- 每个 section 至少要有一位老师教
- 学生的 `tot_cred` 必须等于所有已通过课程学分之和

这种约束往往需要跨表检查。

---

#### 带子查询的 `check`

理论上 SQL 标准里可以写：

```sql
check (time_slot_id in (
    select time_slot_id from time_slot
))
```

或者：

```sql
check ((course_id, sec_id, semester, year) in (
    select course_id, sec_id, semester, year
    from teaches
))
```

但实际主流数据库几乎都不支持在 `check` 中写子查询。

所以这部分更重要的是理解思想：

> 有些完整性约束是跨表的，普通 `check` 不够表达。

---

#### `assertion`

SQL 标准提供了更强的机制：

```sql
create assertion <assertion-name>
check <predicate>;
```

它可以表达整个数据库范围内都必须成立的规则。

例如可以表达：

- 对每个学生，`tot_cred` 必须等于他所有通过课程的学分总和

这种约束比普通 `check` 更强，因为它不是“某列的规则”，而是“整个数据库的全局规则”。

但现实问题是：

- 大多数数据库系统并不真正支持 `assertion`

所以它更多是一个“理论上非常强的工具”。

---

#### `trigger`

既然：

- 带子查询的 `check` 通常不支持
- `assertion` 也通常不支持

现实中常见替代方案就是 **trigger（触发器）**。

trigger 可以理解成：

> 当某个事件发生时，数据库自动执行一段预先定义好的动作。

典型形式是：

- `before insert`
- `after update`
- `before delete`

trigger 常用来做：

- 复杂完整性检查
- 自动联动更新
- 自动修正输入值

所以：

- 约束偏声明式
- trigger 偏过程化


---

## Views

### 什么是 view

view 可以理解成：

> 用一个查询结果“伪装”出来的一张表。

它看起来像表，但通常不是把数据重新存了一份，而是保存了查询定义。

因此 view 常被称为：

- virtual relation
- 虚拟表

---

**view 有三个核心用途：**

1. 隐藏不想给某些用户看的数据

    例如：

    - 不让普通用户看   ,到教师工资
    - 不让某些用户看到完整的个人信息

2. 封装复杂查询
   - 把一条经常要写的复杂 SQL 封装成一个名字，以后像查表一样去查它。

3. 在逻辑结构改变时，给旧程序保留兼容接口

---

### `create view`

基本形式：

```sql
create view v as <query expression>;
```

例如：

```sql
create view faculty as
select ID, name, dept_name
from instructor;
```

这个 view 的含义是：

- 从 `instructor` 表中取出三列
- 构成一个名为 `faculty` 的虚拟表

以后就可以写：

```sql
select name
from faculty
where dept_name = 'Biology';
```

这里的 `faculty` 用起来就像一张普通表。

---

### 复杂条件 view

例如：

```sql
create view physics_fall_2009 as
select course.course_id, sec_id, building, room_number
from course, section
where course.course_id = section.course_id
  and course.dept_name = 'Physics'
  and section.semester = 'Fall'
  and section.year = '2009';
```

这个 view 不是来自单表，而是来自两张表：

- `course`
- `section`

它本质上做的是：

1. 把 `course` 和 `section` 按 `course_id` 连接
2. 只保留 Physics 系课程
3. 只保留 2009 年 Fall 学期开设的 section
4. 输出 `course_id / sec_id / building / room_number`

这个例子非常典型，因为它体现了 view 的另一大用途：

> 把一个经常要写的多表筛选查询封装成“一个名字”。

---

### 带聚合的 view

例如：

```sql
create view departments_total_salary(dept_name, total_salary) as
select dept_name, sum(salary)
from instructor
group by dept_name;
```

这个 view 表示：

- 对每个系统计工资总和

这里显式写 `(dept_name, total_salary)` 是因为：

- 聚合表达式 `sum(salary)` 默认没有一个很自然的列名
- 所以要手动给 view 的列命名

---

### View Expansion

view expansion 的核心思想是：

> 查询中一旦出现 view 名，数据库会把它替换回原来的定义，再继续执行。

例如先定义：

```sql
create view physics_fall_2009_watson as
select course_id, room_number
from physics_fall_2009
where building = 'Watson';
```

这里的 `physics_fall_2009` 其实不是一张真实表，而是另一个 view。

数据库处理时会把它展开成原始定义，相当于：

```sql
select course_id, room_number
from (
    select course.course_id, building, room_number
    from course, section
    where course.course_id = section.course_id
      and course.dept_name = 'Physics'
      and section.semester = 'Fall'
      and section.year = '2009'
)
where building = 'Watson';
```

进一步理解，它最后还是在查底层真实表：

- `course`
- `section`

所以：

> 普通 view 存的通常不是“数据副本”，而是“查询定义”。

---

### View 可以基于 View 再定义

上面的 `physics_fall_2009_watson` 就是一个典型例子：

- `physics_fall_2009` 基于真实表定义
- `physics_fall_2009_watson` 再基于前一个 view 定义

这说明 view 的本质确实更像“命名查询”。

---

### View 的更新问题

既然 view 用起来像表，那么能不能对 view 做：

- `insert`
- `update`
- `delete`

答案是：

> 有时可以，但很多时候不行。

---

#### 例 1：简单 view 的插入问题

```sql
create view faculty as
select ID, name, dept_name
from instructor;
```

然后：

```sql
insert into faculty
values ('30765', 'Green', 'Music');
```

问题在于：

- `faculty` 只有三列
- 但底层真实表 `instructor` 还有 `salary`

那么数据库到底该如何翻译这次插入？

一种可能是：

```sql
insert into instructor
values ('30765', 'Green', 'Music', null);
```

但这取决于：

- `salary` 是否允许为 `null`
- 数据库是否愿意自动这样补值

这说明：

> 更新 view，本质上必须能翻译成对底层真实表的更新。

---

#### 例 2：多表 view 的更新更难

```sql
create view instructor_info as
select ID, name, building
from instructor, department
where instructor.dept_name = department.dept_name;
```

如果你执行：

```sql
insert into instructor_info
values ('69987', 'White', 'Taylor');
```

数据库就会犯难：

- 这条记录到底该怎么拆到 `instructor` 和 `department` 两张表里？
- 如果 `Taylor` 楼中有多个院系，那它到底属于哪个系？

所以多表连接得到的 view 往往没有唯一清晰的更新语义。

---

### 什么是 updatable view

大多数数据库系统只允许对 **simple view** 进行更新。

一般来说，一个 view 可更新，通常需要满足：

1. `from` 子句中只有一张真实表
2. `select` 子句中只出现该表的属性名，不出现表达式
3. 没有 `group by`
4. 没有 `having`
5. 没有聚合函数
6. 没有 `distinct`
7. 没出现在 view 中的底层列必须允许填 `null`

也就是说，只有当：

- view 和底层表行之间还有比较直接的对应关系

更新它才有可能被正确翻译回底层表。

---

### `with check option`

再看一个典型 view：

```sql
create view history_instructors as
select *
from instructor
where dept_name = 'History';
```

如果你通过这个 view 插入：

```sql
('25566', 'Brown', 'Biology', 100000)
```

从底层表角度看，这条记录完全可以插入 `instructor`。

但问题是：

- 它不属于 `History`
- 所以插进去后，它不会出现在 `history_instructors` 这个 view 里

这就很奇怪：

- 你明明是通过这个 view 插入的
- 插完之后却在这个 view 中看不到它

为了解决这个问题，可以写：

```sql
create view history_instructors as
select *
from instructor
where dept_name = 'History'
with check option;
```

其含义是：

> 通过这个 view 进行插入或更新后，结果仍然必须满足这个 view 自己的筛选条件。

所以 `with check option` 可以理解为：

- 不允许你通过 view 引入“改完后不再属于该 view”的数据

---

### Materialized View

普通 view 通常只保存定义，不保存结果。

而 **materialized view** 则不同，它会：

> 把定义该 view 的查询结果真的计算出来并存成一个物理表。

例如：

```sql
create materialized view departments_total_salary(dept_name, total_salary) as
select dept_name, sum(salary)
from instructor
group by dept_name;
```

这表示：

- 先把“每个系工资总额”的结果实际存下来

之后如果再查询：

```sql
select dept_name
from departments_total_salary
where total_salary > (
    select avg(total_salary)
    from departments_total_salary
);
```

就不需要每次都重新对 `instructor` 做 `group by + sum`。

---

### 普通 view vs materialized view

#### 普通 view

- 存的是定义
- 查询时现算
- 总能反映底层表最新状态
- 但复杂查询可能慢

#### materialized view

- 存的是结果
- 查询时直接读结果
- 可能更快
- 但结果可能过期，需要维护

---

### Materialized view 的维护问题

如果底层关系被更新：

- 新老师加入了
- 工资变了
- 旧老师被删除了

那么物化视图中的结果就可能变旧。

因此需要做 **materialized view maintenance**。

维护方式可能包括：

- 立即更新
- 查询时再刷新
- 周期性刷新

所以 materialized view 是一个典型的“性能换维护成本”的机制。

---

### View 与 Logical Data Independence

这是 view 的一个更高层作用。

假设原来有一个关系：

```sql
S(a, b, c)
```

后来为了更合理的设计，你把它拆成：

- `S1(a, b)`
- `S2(a, c)`

这时如果旧程序原来都写：

```sql
select * from S where ...
```

那它们岂不是全要改？

为了避免这种情况，可以重新定义一个 view：

```sql
create view S(a, b, c) as
select a, b, c
from S1 natural join S2;
```

这样：

- 底层逻辑结构已经变了
- 但外层程序仍然可以像以前一样使用 `S`

这就体现了 **logical data independence（逻辑数据独立性）**：

> 修改逻辑模式时，尽量不影响用户看到的外部接口。

所以 view 不只是“方便查询”，还是数据库模式演化时的重要兼容层。

---

## Indexes

索引的核心作用可以用一句话概括：

> 给数据库提供一个更快查找记录的目录结构。

例如：

```sql
create table student (
    ID varchar(5),
    name varchar(20) not null,
    dept_name varchar(20),
    tot_cred numeric(3,0) default 0,
    primary key (ID)
);
```

然后：

```sql
create index studentID_index on student(ID);
```

:::TIP
**索引到底解决什么问题？**

如果没有索引，执行：

```sql
select *
from student
where ID = '12345';
```

数据库可能需要：

- 把整张 `student` 表一行一行看过去

这叫全表扫描。

而有索引后，系统可以利用索引快速定位到：

- `ID = '12345'` 对应的记录位置

就像书后面的目录：

- 不必逐页翻书
- 可以直接定位关键词对应页码
:::

可以把索引理解成：

- 表数据是正文
- 索引是附加的查找目录

所以：

- 索引不是数据本身
- 它是加速访问的数据结构

---

### 索引的代价

索引能提升查询速度，但代价是：

- 额外占用存储空间
- 插入、删除、更新数据时，索引本身也要维护

因此不是每一列都适合建索引。

---

## Transactions

Transaction 是数据库系统里最重要的机制之一。

Transaction就是：

> 一个必须整体成功或整体失败的工作单元。

典型例子是转账：

1. A 账户减 100
2. B 账户加 100

这两步不能只做一半。

如果：

- 第一步做了
- 第二步还没来得及做，系统崩了

数据库就会处于错误状态。

所以事务强调：

> none or all

也就是：

- 要么全部完成
- 要么像从未发生过一样

---

### `commit` 与 `rollback`

事务通常隐式开始，以两种方式之一结束：

#### `commit`

提交事务。

表示：

- 这次事务中的所有修改正式生效

#### `rollback`

回滚事务。

表示：

- 撤销这次事务中的所有修改
- 像它从来没有发生过一样

---

### MySQL 中的一个典型例子

```sql
SET AUTOCOMMIT=0;
UPDATE account SET balance = balance - 100 WHERE ano = '1001';
UPDATE account SET balance = balance + 100 WHERE ano = '1002';
COMMIT;
```

这里：

- 先关闭自动提交
- 两条 `UPDATE` 共同组成一次转账事务
- 最后统一 `COMMIT`

如果中途出错，就应该 `ROLLBACK`。


`AUTOCOMMIT`

- 每条 SQL 语句都会自动提交

这意味着：

- 你写一条 `update`
- 它往往立刻就生效了

而Transaction的关键，恰恰是把多条语句捆成一个整体来提交或回滚。

---

### ACID

事务的四个经典性质是 **ACID**。

#### 1. Atomicity（原子性）

事务中的操作：

- 要么全部反映到数据库中
- 要么一个都不反映

这就是“all or nothing”。

---

#### 2. Consistency（一致性）

如果事务本身逻辑正确，那么它执行前后，数据库都应保持一致。

例如：

- 主键仍然唯一
- 外键仍然合法
- 业务规则仍然成立

---

#### 3. Isolation（隔离性）

多个事务可以并发执行，但每个事务都不该看到别的事务的中间状态。

也就是说：

- 虽然数据库里很多人同时在操作
- 但每个事务都应该像“自己单独运行”一样

---

#### 4. Durability（持久性）

一旦事务成功 `commit`：

- 它对数据库的修改应永久保留下来
- 即使随后系统故障、断电，也不能丢

---

### Transaction Boundaries

事务边界指的是：

> 哪些操作应该被视为同一个不可分割的工作单元。

这个问题很重要，因为事务并不是越大越好，也不是越小越好。

- 如果划得太小，原本必须一起成功的操作被拆开，就会出错
- 如果划得太大，会增加并发冲突，降低效率

所以事务边界的核心原则是：

> 把必须一起成功或失败的操作放进同一个事务。

---

## Authorization

数据库不是所有用户都能随便访问所有数据的。

权限控制就是为了解决这个问题。

---

### 基本权限类型

对数据最常见的权限有：

- `select`
- `insert`
- `update`
- `delete`

对模式（schema）和对象管理的权限还有：

- `create`
- `alter`
- `drop`
- `index`
- `create view`

所以数据库权限大致分成两层：

#### 数据级权限

- 能不能读、插、改、删数据

#### 结构级权限

- 能不能创建或修改数据库对象

---

### `grant`

SQL 用 `grant` 授予权限：

```sql
grant <privilege list>
on <relation name or view name>
to <user list>;
```

例如：

```sql
grant select on instructor to U1, U2, U3;
grant select on department to public;
grant update (budget) on department to U1, U2;
grant all privileges on department to U1;
```

含义分别是：

- U1/U2/U3 可以查询 `instructor`
- 所有用户都可以查询 `department`
- U1/U2 只能更新 `department` 表中的 `budget` 列
- U1 拥有 `department` 上的全部权限

---

### `public`

`public` 表示：

- 所有当前用户
- 以及未来新加入的用户

因此把权限授给 `public`，相当于全面开放。

---

### `revoke`

SQL 用 `revoke` 收回权限：

```sql
revoke <privilege list>
on <relation name or view name>
from <user list>;
```

例如：

```sql
revoke select on branch from U1, U2, U3;
```

表示收回这些用户对 `branch` 的查询权限。

---

### 一个用户可能通过多条路径获得同一权限

这点非常重要。

如果：

- U1 把某权限授给了 U5
- U2 也把同一权限授给了 U5

那么即使后来撤销 U1 → U5 这条授权：

- U5 仍然可能保留该权限
- 因为他还可以通过 U2 那条路径继续获得它

所以权限系统并不是简单的一对一关系，而是一张传播网络。

---

### Roles

role 可以理解成：

> 一组权限的打包名字。

例如：

```sql
create role instructor;
grant instructor to Amit;
grant select on takes to instructor;
```

意思是：

- 创建一个角色 `instructor`
- 这个角色拥有 `select on takes` 的权限
- 再把这个角色授给 Amit

于是 Amit 就拥有了这个角色对应的权限。

---

:::TIP
**为什么要用 role，而不是直接把权限一条条授给每个人？**

因为现实中很多用户其实扮演的是相同角色，例如：

- 学生
- 教师
- 助教
- 系主任
- 院长

如果每来一个新老师都手写几十条 `grant`，会非常麻烦。

而角色的好处是：

- 先把权限绑定到角色上
- 再把角色分配给人

于是权限管理就更像现实世界中的“职位管理”。
:::

---

### role 可以继承

例如：

```sql
create role teaching_assistant;
grant teaching_assistant to instructor;
```

这表示：

- `instructor` 角色继承 `teaching_assistant` 的权限

再例如：

```sql
create role dean;
grant instructor to dean;
grant dean to Satoshi;
```

说明：

- `dean` 包含 `instructor` 的权限
- Satoshi 被授予 `dean`
- 所以也拥有 `instructor` 那部分权限

---

### View 与权限控制

view 不只是查询工具，也是权限控制工具。

例如：

```sql
create view geo_instructor as
select *
from instructor
where dept_name = 'Geology';

grant select on geo_instructor to geo_staff;
```

这表示：

- 先创建一个只包含地质系教师的 view
- 再只把这个 view 的查询权限授给 `geo_staff`

这样：

- `geo_staff` 并没有完整 `instructor` 表的访问权
- 但他们可以看到自己被允许看到的那一部分数据

所以 view 在安全控制中的一个重要作用是：

> 把“整张表”裁剪成“可安全开放的窗口”。

---

### `references` 权限

除了读写数据外，还有一种容易忽略的权限：

```sql
grant references (dept_name) on department to Mariano;
```

这个权限的含义是：

- 允许 Mariano 引用 `department.dept_name`
- 例如拿它作为别的表中的外键参照目标

也就是说：

- `select` 是“我能看你的数据”
- `references` 是“我能把我的表结构建立在你的列之上”

它属于一种“结构依赖级”的权限。

---

### `with grant option`

默认情况下，一个用户即使得到了某项权限，也不能继续把它转授给别人。

如果你写：

```sql
grant select on department to Amit with grant option;
```

表示：

- Amit 自己可以 `select department`
- 并且 Amit 还可以把这个权限继续授给别人

这就让权限可以继续传播。

---

### 权限传播图

一旦允许转授，就会形成：

- DBA → U1
- U1 → U4
- U2 → U5
- ...

这样的一张授权图。

一个用户是否拥有某个权限，不只是看“有没有人给过他”，而要看：

> 从根授权者到他之间是否还存在一条有效路径。

---

### `cascade` 与 `restrict`

当你收回权限时，就会遇到一个问题：

> 如果被收回者又把这个权限授给了别人，该怎么办？

#### `cascade`

```sql
revoke select on department from Amit cascade;
```

表示：

- 不只收回 Amit 的权限
- 还要把那些“依赖 Amit 这条路径”获得该权限的人也一起收回

这叫级联撤销。

---

#### `restrict`

```sql
revoke select on department from Amit restrict;
```

表示：

- 如果这次撤销会连带影响别人
- 那数据库就拒绝执行这次撤销

所以：

- `cascade`：允许连锁回收
- `restrict`：一旦会波及别人，就直接禁止这次回收

---

### 只撤销转授权，不撤销实际权限

还可以写：

```sql
revoke grant option for select on department from Amit;
```

它表示：

- Amit 仍然保留 `select department` 的权限
- 但 Amit 以后不能再继续把这个权限授给别人

这个语义非常细，但很重要。

---
****