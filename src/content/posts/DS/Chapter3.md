---
title: Introduction to SQL
published: 2026-03-17
description: SQL 入门与基础查询
tags: [数据库系统]
category: 笔记
draft: false
---

## 概述

这一章开始，数据库课程从 **关系模型的理论表达** 走向 **SQL 的实际使用**。

如果说 Chapter 2 解决的是：

- 数据怎样抽象成关系
- 主键、外键、关系代数分别是什么

那么 Chapter 3 解决的就是：

- 这些关系到底怎样用 SQL 建出来
- 怎样把想问的问题写成查询
- 怎样做分组统计、子查询、增删改

这一章是数据库课程里非常关键的一章，因为后面几乎所有更复杂的内容，都是在这里的 SQL 基础上继续展开的。

---

## 目录

- [SQL Overview](#sql-overview)
  - SQL 是什么
  - DDL 与 DML
- [Data Definition](#data-definition)
  - 数据类型
  - `create table` 与常见约束
  - 表结构修改语句
- [Basic Query Structure](#basic-query-structure)
  - 查询骨架
  - 条件、去重与范围判断
  - 多表查询的基本直觉
- [Additional Basic Operations](#additional-basic-operations)
  - 连接操作
  - 重命名、模式匹配与排序
- [Set Operations And Duplicate Semantics](#set-operations-and-duplicate-semantics)
  - 集合运算
  - `all` 版本
- [Null Values](#null-values)
  - `null` 的含义与影响
  - 三值逻辑
- [Aggregate Functions](#aggregate-functions)
  - 常见聚合函数
  - `group by / having`
  - 聚合与 `null`
- [Nested Subqueries](#nested-subqueries)
  - 集合成员测试与集合比较
  - 标量子查询与存在性测试
  - `from` 子查询、`lateral` 与 `with`
- [Modification Of The Database](#modification-of-the-database)
  - `delete`
  - `insert`
  - `update`

---

## SQL Overview

SQL 是 **Structured Query Language**，也就是结构化查询语言。

它的作用不是只查询而已，而是同时负责：

- 定义数据库中的表结构
- 查询数据
- 插入、删除、更新数据
- 表达约束和表之间的联系

你可以把 SQL 看成：

> 关系数据库的通用工作语言。

---

### DDL 与 DML

#### 1. DDL

DDL 是 **Data Definition Language**，数据定义语言。

它解决的问题是：

- 表长什么样
- 每一列是什么类型
- 哪些列不能为空
- 哪些列是主键、外键

DDL 不只是定义列名和类型，理论上还可以描述：

- relation 的 schema
- 每个属性对应的 domain
- integrity constraints
- 以及后续会见到的索引、安全授权、物理存储结构等信息

典型命令：

- `create table`
- `alter table`
- `drop table`

#### 2. DML

DML 是 **Data Manipulation Language**，数据操作语言。

它解决的问题是：

- 怎么查
- 怎么插
- 怎么删
- 怎么改

典型命令：

- `select`
- `insert`
- `delete`
- `update`

一个很重要的理解方式是：

> DDL 决定表的规则，DML 决定表里的数据怎么动。

---

## Data Definition

这一部分回答的是：**关系在 SQL 里到底怎么定义出来。**

### 数据类型

**字符串类型**

- `char(n)`：固定长度字符串
  - `char(5)` 更像固定占 5 个字符的位置
- `varchar(n)`：可变长度字符串，最大长度为 `n`
  - `varchar(20)` 更像最多 20 个字符，实际长度可以更短

```sql
ID char(5),
name varchar(20)
```

---

**整数与数值类型**

- `int`
- `smallint`
- `numeric(p, d)` / `decimal(p, d)`：定点数
- `real`
- `double precision`
- `float(n)`

其中

`numeric(p, d)` 表示：

- 总共最多 `p` 位
- 其中小数点右边有 `d` 位


```sql
salary numeric(8, 2)
```

表示工资总共最多 8 位，其中 2 位是小数位。

---

**日期时间类型**

- `date`
- `time`
- `timestamp`
- `interval`


```sql
date '2005-7-27'
time '09:00:30'
time '09:00:30.75'
timestamp '2005-7-27 09:00:30.75'
interval '1' day
```

还提到了常见日期时间函数：

- `current_date()`
- `current_time()`
- `year(x)`
- `month(x)`
- `day(x)`
- `hour(x)`
- `minute(x)`
- `second(x)`

---

**类型到底解决什么问题**

类型本质上是在规定：

- 这一列允许存什么值
- 数据该如何解释
- 数据库后续能对它做什么运算

这和 Chapter 2 里的 **domain（域）** 是直接对应的。

也就是说：

> 在关系模型里说属性属于某个域，到了 SQL 里就具体落成这一列是什么数据类型。

### `create table` 与常见约束

**`create table`**

SQL 用 `create table` 定义关系。

基本形式：

```sql
create table r (
    A1 D1,
    A2 D2,
    ...,
    An Dn,
    integrity-constraint1,
    ...,
    integrity-constraintk
);
```

含义是：

- `r` 是表名
- `Ai` 是属性名
- `Di` 是属性的数据类型
- 后面可以继续声明完整性约束


```sql
create table instructor (
    ID char(5),
    name varchar(20) not null,
    dept_name varchar(20),
    salary numeric(8,2)
);
```

这张表表达的是：

- 教师编号是固定长度字符串
- 姓名不能为空
- 系名是字符串
- 工资是带两位小数的数值

---

**`not null`**

`not null` 的意思是：

> 这一列必须有值，不能是 `null`。

它解决的问题是：

- 有些属性在业务上必须存在
- 不能允许空着

```sql
name varchar(20) not null
```

表示教师姓名不能为空。

---

**`primary key`**

主键解决的是：

> 如何唯一标识表中的一条记录。

```sql
create table instructor (
    ID char(5),
    name varchar(20) not null,
    dept_name varchar(20),
    salary numeric(8,2),
    primary key (ID)
);
```

理解重点：

- 主键必须唯一
- 主键不能为 `null`
- PDF 特别强调：**primary key declaration automatically ensures not null**

也就是说，只要某列被声明成主键，它自动就不能是空值。

---

**复合主键**

有些表单靠一列不够唯一，就需要多列一起组成主键。

PDF 中 `takes` 的例子：

```sql
create table takes (
    ID varchar(5),
    course_id varchar(8),
    sec_id varchar(8),
    semester varchar(6),
    year numeric(4,0),
    grade varchar(2),
    primary key (ID, course_id, sec_id, semester, year)
);
```

这说明：

- 一条选课记录不是靠单个属性唯一
- 而是学生、课程、班号、学期、年份一起才能唯一确定

---

**`foreign key`**

外键解决的是：

> 怎样把一张表和另一张表联系起来，并保证引用合法。

例如：

```sql
create table instructor (
    ID char(5),
    name varchar(20) not null,
    dept_name varchar(20),
    salary numeric(8,2),
    primary key (ID),
    foreign key (dept_name) references department
);
```

这里表示：

- `instructor.dept_name` 必须引用 `department` 表中的合法系名

再比如：

```sql
create table course (
    course_id varchar(8) primary key,
    title varchar(50),
    dept_name varchar(20),
    credits numeric(2,0),
    foreign key (dept_name) references department(dept_name)
);
```

这体现了外键的本质：

> 让表与表之间的联系不仅能连起来，而且连得合法。

---

**`default`**

`default` 用来给列设置默认值。


```sql
create table student (
    ID varchar(5),
    name varchar(20) not null,
    dept_name varchar(20),
    tot_cred numeric(3,0) default 0,
    primary key (ID),
    foreign key (dept_name) references department
);
```

意思是：

- 如果插入学生时没写 `tot_cred`
- 那就默认记为 `0`

这个机制解决的是缺省值的问题。

---

**参照动作：`on delete / on update`**

外键后面可以跟参照动作，例如：

- `on delete cascade`
- `on delete set null`
- `on delete restrict`
- `on delete no action`
- `on delete set default`
- `on update cascade`
- `on update set null`
- `on update restrict`
- `on update no action`
- `on update set default`

它们解决的是：

> 当被引用表中的记录被删除或修改时，引用它的表该怎么办。

最常见的直觉：

- `cascade`：跟着改、跟着删
- `set null`：把外键列改成 `null`
- `restrict` / `no action`：不允许你这么做

---

**`insert into`**


例如：

```sql
insert into instructor
values ('10211', 'Smith', 'Biology', 66000);
```

这说明：

- 表建好后，数据是按元组一行一行放进去的

一个插入 `null` 的例子：

```sql
insert into instructor
values ('10211', null, 'Biology', 66000);
```

如果某列声明了 `not null`，那这种插入就会出问题。

---

### 表结构修改语句

这三个命令非常容易混。

**1. `drop table`**

```sql
drop table student;
```

作用：

- 删除整张表
- 也删除表里的内容

**2. `delete from`**

```sql
delete from student;
```

作用：

- 删除表中的所有元组
- 但表结构还保留着

**3. `alter table`**

两种基本形式：

```sql
alter table student add resume varchar(256);
```

表示给表增加一列。

新列加进去以后，已有元组在这列上的值默认是 `null`。

还有：

```sql
alter table r drop A;
```

表示删除某个属性。

> dropping of attributes not supported by many databases

也就是说，理论上能写，实际数据库支持程度可能不同。

---

## Basic Query Structure

### 查询骨架

典型形式是：

```sql
select A1, A2, ..., An
from r1, r2, ..., rm
where P;
```

其中：

- `select`：你想要哪些列
- `from`：数据从哪些表来
- `where`：你要满足什么条件

> The result of an SQL query is a relation.

也就是说，查询的输出本身依然可以看成一张关系表，这也是为什么查询结果还能继续参与后续操作，比如再做子查询、再做集合运算、再放进 `from` 里。

可以把它理解成一个三步过程：

1. 先确定数据来源
2. 再筛掉不符合条件的行
3. 最后只保留想看的列

这就是最基础的 SQL 思维。

---

**`select`：我要看什么**

例如找出所有教师的姓名：

```sql
select name
from instructor;
```

这和关系代数里的 **投影** 是对应的。

SQL 名字默认大小写不敏感

- `Name`
- `NAME`
- `name`

本质上都可以看成同一个标识符。

---

**`select *`**

如果你想看一张表的所有列，可以写：

```sql
select *
from instructor;
```

`*` 的含义是所有属性。

适合：

- 快速查看表内容
- 调试查询

但在正式查询中，通常还是更推荐只写需要的列。

---

**`select` 中可以放表达式**

`select` 不只能写列名，也可以写算术表达式。

例如：

```sql
select ID, name, salary / 12
from instructor;
```

它解决的问题是：

- 不是只能把原始数据拿出来
- 还可以在查询时顺手做计算

这里的意思是把年薪换算成月薪。

如果想让结果更清楚，通常会配合 `as` 起别名，这一点在后面讲。

---

**`from`：数据从哪里来**

`from` 指定参与查询的关系。

例如：

```sql
select name
from instructor;
```

表示数据来自 `instructor` 表。

如果 `from` 中列出多张表，例如：

```sql
select *
from instructor, teaches;
```

它的本质是先形成：

> `instructor × teaches`

也就是 **笛卡尔积**。

这一步本身通常没什么实际意义，但它是多表查询的出发点。

---

**`where`：我要什么条件**

例如找出计算机系中工资高于 80000 的教师：

```sql
select name
from instructor
where dept_name = 'Comp. Sci.' and salary > 80000;
```

`where` 对应关系代数中的 **选择**。

它解决的问题是：

- 不是所有元组都要
- 只保留满足条件的那些

---

### 条件、去重与范围判断

**`and / or / not`**

SQL 中条件可以用逻辑连接词组合：

- `and`
- `or`
- `not`

例如：

```sql
select name
from instructor
where dept_name = 'Comp. Sci.' and salary > 80000;
```

其中：

- `and` 表示两个条件都要满足

以后条件复杂起来时，你会发现 SQL 本质上就是在写逻辑表达式。

---

**`distinct` 与 `all`**

SQL **默认允许重复**。

例如：

```sql
select dept_name
from instructor;
```

如果多个教师来自同一个系，结果里这个系名可能会重复出现。

如果想去重，就写：

```sql
select distinct dept_name
from instructor;
```

如果明确表示不去重，可以写：

```sql
select all dept_name
from instructor;
```

虽然 `all` 很少手写，但

> SQL 默认不是集合语义，而是允许重复的多重集语义。

---

**`between`**

例如找工资在 90000 到 100000 之间的教师：

```sql
select name
from instructor
where salary between 90000 and 100000;
```

它等价于：

- `salary >= 90000`
- 并且 `salary <= 100000`

理解上可以把 `between a and b` 看成闭区间。

---

**元组比较**

SQL 不只是单个属性能比较，元组也可以比较。

```sql
select name, course_id
from instructor, teaches
where (instructor.ID, dept_name) = (teaches.ID, 'Biology');
```
等价于：
```sql
where instructor.ID = teaches.ID
  and dept_name = 'Biology'
```
所以整条查询最终是在找：Biology 系教师所教授的课程（姓名 + course_id）。



这说明 SQL 可以把多个值打包成一个元组来比较。


---

### 多表查询的基本直觉

比如查询所有授过课的教师姓名和所授课程号：

```sql
select name, course_id
from instructor, teaches
where instructor.ID = teaches.ID;
```

这条语句非常重要，因为它代表了最常见的多表查询逻辑：

1. `from instructor, teaches` 先把两张表放在一起
2. `where instructor.ID = teaches.ID` 再把真正有关联的行筛出来
3. `select name, course_id` 取出需要的列


> 多表查询是先组合，再按关联条件筛掉无关组合。

---

## Additional Basic Operations

### 连接操作

**为什么会出现 `join`**

前面我们已经看到：

```sql
from instructor, teaches
where instructor.ID = teaches.ID
```

这种写法其实已经能做连接。

后来 SQL 又提供了更明确的连接写法，例如

- `natural join`
- `join ... using(...)`

它们本质上仍然是在解决同一个问题：

> 把本来分散在不同表中的相关信息拼起来。

---

**`natural join`**

例如：

```sql
select *
from instructor natural join teaches;
```

`natural join` 的含义是：

- 自动找出两张表中 **同名属性**
- 要求这些同名属性值相等
- 结果中这些公共列只保留一份

所以它解决的是显式写等值条件太麻烦的问题。

---

**`natural join` 的典型正确用法**


```sql
select name, course_id
from instructor natural join teaches;
```

之所以成立，是因为：

- `instructor` 和 `teaches` 里共同有 `ID`
- 而这个共同属性刚好就是它们真实的连接键

所以自然连接在同名属性就是同一个含义时很好用。

---

**`natural join` 的风险**


> Beware of unrelated attributes with same name which get equated incorrectly

也就是说：

- 只要两张表里有同名列
- `natural join` 就会自动拿它们去相等比较
- 即使这两个列同名，但业务含义根本不该拿来连接



```sql
select name, title
from instructor natural join teaches natural join course;
```

这是错误版本。

因为它会错误地把：

- `course.dept_name`
- `instructor.dept_name`

也拿去相等比较。

结果会把本来不该筛掉的数据筛掉。

---

**正确处理方式：显式指定连接列**

第一种：

```sql
select name, title
from instructor natural join teaches, course
where teaches.course_id = course.course_id;
```

第二种：

```sql
select name, title
from (instructor natural join teaches) join course using (course_id);
```

第三种：

```sql
select name, title
from instructor, teaches, course
where instructor.ID = teaches.ID
  and teaches.course_id = course.course_id;
```

这三种写法的共同点是：

- 只按真正需要的列建立关联
- 不让同名但无关的列偷偷参与连接

---

**`natural join` 和显式连接条件的区别**

**natural join**

- 自动使用所有同名列
- 写法短
- 风险是自动做太多

**显式连接条件**

- 你自己决定按哪一列连接
- 写法稍长
- 但语义更清楚、更安全

---

**`join ... using(...)`**

```sql
join course using (course_id)
```

它的含义是：

- 指定只用 `course_id` 作为连接列
- 并且结果中公共列只保留一份

这可以看成：

> 介于 `natural join` 和完全手写连接条件之间的一种折中写法。

适合我知道就是按这个同名列连，但不想让别的同名列也参与的场景。

---

**一个典型连接例子**

```sql
select distinct student.ID
from (student natural join takes)
     join course using (course_id)
where student.dept_name <> course.dept_name;
```

它找的是：

> 选修了本系之外课程的学生。

这个例子很好，因为它同时体现了：

- 先把学生和选课记录连起来
- 再把课程信息连进来
- 最后比较学生所在系和课程所属系

---

### 重命名、模式匹配与排序

**`as`：重命名**

SQL 允许给关系或属性起别名。

基本形式：

```sql
old_name as new_name
```

例如：

```sql
select ID, name, salary / 12 as monthly_salary
from instructor;
```

这解决的是：

- 计算结果默认没名字，不好读
- 多表查询中表名太长，不好写

---

**给表起别名**

一个自连接的经典例子：

```sql
select distinct T.name
from instructor as T, instructor as S
where T.salary > S.salary
  and S.dept_name = 'Comp. Sci.';
```

这个查询的意思是：

- 把 `instructor` 当成两份不同的表来用
- `T` 代表当前教师
- `S` 代表计算机系中的某位教师

如果不给别名，就根本分不清两个 `instructor` 分别是谁。

- `as` 关键字可以省略
- 例如 `instructor as T` 等价于 `instructor T`

---

**`like`：字符串模式匹配**

`like` 用来解决：

> 不是要精确相等，而是要按某种模式匹配字符串。

PDF 指出两个特殊字符：

- `%`：匹配任意子串
- `_`：匹配任意单个字符

例如找名字里含有 `dar` 的教师：

```sql
select name
from instructor
where name like '%dar%';
```

---

**`escape`**

如果你想匹配的字符串里本身就有 `%`，那 `%` 会和通配符含义冲突。

这时可以用 `escape`。



```sql
like '100 \%' escape '\'
like '100 #%' escape '#'
```

它的意思是：

- 把 `\` 或 `#` 指定成转义字符
- 后面的 `%` 不再表示通配符，而表示字符 `%` 本身


---

**`like` 的典型模式**

- `'Intro%'`：匹配所有以 `Intro` 开头的字符串
- `'%Comp%'`：匹配包含 `Comp` 的字符串
- `'___'`：匹配恰好 3 个字符的字符串
- `'___%'`：匹配长度至少 3 的字符串

> patterns are case sensitive

也就是说，模式匹配默认区分大小写。

---

**字符串操作**
一些常见字符串操作：

- 字符串拼接 `||`
- 大小写转换
- 求长度
- 截取子串

---

**`order by`**

默认情况下，关系是无序的。

所以如果你想明确按某种顺序显示结果，就要用 `order by`。

例如按字母顺序列出教师姓名：

```sql
select distinct name
from instructor
order by name;
```

---

**`asc / desc` 与多列排序**

排序方向：

- `asc`：升序，默认
- `desc`：降序

例如：

```sql
select distinct name
from instructor
order by name desc;
```

还可以按多个属性排序：

```sql
select *
from instructor
order by dept_name, name;
```

它表示：

1. 先按 `dept_name` 排
2. 若系名相同，再按 `name` 排

---

**`limit`**

`limit` 子句，用于限制返回行数。

例如找工资最高的前三位教师：

```sql
select name
from instructor
order by salary desc
limit 3;
```

也可以写成：

```sql
limit 0, 3
```

即：

- 从偏移量 0 开始
- 取 3 行

这类写法在实际系统里很常见，不过不同数据库的细节语法可能略有差异。

---

## Set Operations And Duplicate Semantics

### 集合运算

**SQL 默认为什么允许重复**

这是 SQL 和纯数学集合很不一样的一点。

- SQL 允许关系中有重复
- 查询结果里也允许重复

因此 SQL 更接近 **multiset / bag（多重集）**，而不是严格的集合。

---

本章讲了三个标准集合运算：

- `union`
- `intersect`
- `except`

#### union

例如找 2009 Fall 或 2010 Spring 开过的课程：

```sql
(select course_id
 from section
 where sem = 'Fall' and year = 2009)
union
(select course_id
 from section
 where sem = 'Spring' and year = 2010);
```

表示并集。

#### intersect

例如找两个学期都开过的课程：

```sql
(select course_id
 from section
 where sem = 'Fall' and year = 2009)
intersect
(select course_id
 from section
 where sem = 'Spring' and year = 2010);
```

表示交集。

#### except

例如找 2009 Fall 开过但 2010 Spring 没开过的课程：

```sql
(select course_id
 from section
 where sem = 'Fall' and year = 2009)
except
(select course_id
 from section
 where sem = 'Spring' and year = 2010);
```

表示差集。

---

**这些集合运算默认会去重**

> `union`、`intersect`、`except` 会自动消除重复。

所以它们更接近集合语义。

---

**`all` 版本**

如果你想保留重复，就用：

- `union all`
- `intersect all`
- `except all`

多重集计数规则是：

- `r union all s`：某元组出现 `m + n` 次
- `r intersect all s`：某元组出现 `min(m, n)` 次
- `r except all s`：某元组出现 `max(0, m - n)` 次

> SQL 对重复是有精确定义的，不是随便处理。

---

## Null Values

### `null` 的含义与影响

**`null` 是什么**

`null` 表示：

- 值未知
- 或者值不存在

这不是普通的数据值，而是一种缺失或未知状态。

这点非常重要，因为：

> `null` 不是 0，不是空字符串，也不是 false。

---

**`null` 会带来什么影响**

> 任何涉及 `null` 的算术表达式结果仍然是 `null`

例如：

```sql
5 + null
```

结果是：

```sql
null
```

因为有一个值未知，整个结果也就无法确定。

---

**`is null`**

检查空值时要用：

```sql
is null
```

例如：

```sql
select name
from instructor
where salary is null;
```

---

**为什么不能用 `=` 判断 `null`**

原因不是语法不推荐，而是因为 SQL 里：

- 与 `null` 比较
- 不会得到 `true` 或 `false`
- 而会得到第三种逻辑值：`unknown`

所以像：

```sql
salary = null
```

不会正确判断空值。

正确写法必须是：

```sql
salary is null
```

---

### 三值逻辑

因为有 `null`，SQL 不是普通二值逻辑，而是三值逻辑。


#### OR

- `unknown or true = true`
- `unknown or false = unknown`
- `unknown or unknown = unknown`

#### AND

- `true and unknown = unknown`
- `false and unknown = false`
- `unknown and unknown = unknown`

#### NOT

- `not unknown = unknown`

---

**`unknown` 在 `where` 中的后果**

> 在 `select` 的条件判断中，如果谓词结果是 `unknown`，会被当成 false 对待。

意思是：

- `where` 只留下结果为 `true` 的行
- 如果是 `false`，不要
- 如果是 `unknown`，也不要

所以很多为什么这条记录没查出来的问题，本质上都是 `null` 导致条件变成了 `unknown`。

---

## Aggregate Functions

> 如果我不只是想看单条记录，而是想做统计，该怎么办？

### 常见聚合函数

5 个最基本的聚合函数：

- `avg`
- `min`
- `max`
- `sum`
- `count`

它们操作的对象不是单个元组，而是：

> 某一列值构成的一个集合（更准确说是多重集）。

---

**基本例子**

#### 求平均工资

```sql
select avg(salary)
from instructor
where dept_name = 'Comp. Sci.';
```

它的意思是：

- 先选出计算机系教师
- 再看这些人的 `salary`
- 对这一列求平均

#### 统计开课教师人数

```sql
select count(distinct ID)
from teaches
where semester = 'Spring' and year = 2010;
```

这里的重点是 `count(distinct ID)`：

- 先去重
- 再计数

#### 统计 course 表的元组数

```sql
select count(*)
from course;
```

`count(*)` 表示统计行数。

---

### `group by / having`

**`group by`：先分组，再统计**

如果你要按系分别统计平均工资，那就不能把所有教师混在一起算一个平均值，而要先分组。

例如：

```sql
select dept_name, avg(salary)
from instructor
group by dept_name;
```

这里的过程是：

1. 按 `dept_name` 把教师分组
2. 每组内部各自计算 `avg(salary)`

所以 `group by` 解决的是：

> 统计不是对整张表做，而是对每一类分别做。

---

**`group by` 和 `select` 的关系**

> `select` 子句中，凡是不在聚合函数里的属性，都必须出现在 `group by` 列表中。

例如下面是错误写法：

```sql
select dept_name, ID, avg(salary)
from instructor
group by dept_name;
```

原因是：

- 你按系分组了
- 每组里可能有多个 `ID`
- 那结果里这个 `ID` 到底该显示哪一个？说不清

所以这是不合法的。

---

**`having`：对分组后的结果再筛选**

例如找平均工资大于 42000 的院系：

```sql
select dept_name, avg(salary)
from instructor
group by dept_name
having avg(salary) > 42000;
```

过程是：

1. 先按系分组
2. 对每组算平均工资
3. 再只保留平均工资大于 42000 的组

---

**`where` 和 `having` 的区别**

#### where

- 在分组前过滤行
- 作用对象是单条记录

#### having

- 在分组后过滤组
- 作用对象是一个分组的统计结果


> `having` 在 groups formed 之后判断，`where` 在 forming groups 之前判断。

例如：

```sql
select dept_name, count(*) as cnt
from instructor
where salary >= 100000
group by dept_name
having count(*) > 10
order by cnt;
```

这里：

- `where salary >= 100000`：先只保留工资至少 10 万的教师
- `group by dept_name`：对这些人按系分组
- `having count(*) > 10`：只保留人数超过 10 的组

---

### 聚合函数与 `null`

#### 1. `sum(salary)` 会忽略 `null`

```sql
select sum(salary)
from instructor;
```

如果某些工资是 `null`，它们不会参与求和。

#### 2. 除 `count(*)` 外，其他聚合函数都忽略聚合列中的 `null`

也就是说：

- `avg`
- `min`
- `max`
- `sum`

都不会把 `null` 当普通值参与计算。

#### 3. 如果一整组全是 null

- `count` 返回 `0`
- 其他聚合返回 `null`

这点非常重要。

---

**一个检查重复的例子**

一个很好的 `group by + having` 练习：

找出没有重名学生的院系：

```sql
select dept_name
from student
group by dept_name
having count(distinct name) = count(ID);
```

它背后的逻辑是：

- 如果重名不存在
- 那么不同姓名个数就等于学生总人数

---

## Nested Subqueries

### 子查询的作用

> 子查询是嵌套在另一个查询中的 `select-from-where` 表达式。

它的常见用途包括：

- 集合成员测试
- 集合比较
- 集合大小/存在性测试

理解子查询最好的方式是：

> 先用一个查询算出一个中间结果，再让外层查询拿这个结果继续判断。

---

### 集合成员测试与集合比较

**`in`：属于某个集合**

例如找 2009 Fall 开课且 2010 Spring 也开课的课程：

```sql
select distinct course_id
from section
where semester = 'Fall'
  and year = 2009
  and course_id in (
      select course_id
      from section
      where semester = 'Spring' and year = 2010
  );
```

这条语句的逻辑是：

- 外层先看 Fall 2009 的课程
- 再要求这个 `course_id` 同时出现在 Spring 2010 的课程集合里

所以：

> `in` 本质上是在问：这个值是否属于子查询返回的集合。

---

**`not in`：不属于某个集合**

例如找 2009 Fall 开过但 2010 Spring 没开过的课程：

```sql
select distinct course_id
from section
where semester = 'Fall'
  and year = 2009
  and course_id not in (
      select course_id
      from section
      where semester = 'Spring' and year = 2010
  );
```

这和上面的 `in` 正好相反。

---

**元组 `in`**

`in` 不只是能比较单列，也能比较元组。

```sql
select count(distinct ID)
from takes
where (course_id, sec_id, semester, year) in (
    select course_id, sec_id, semester, year
    from teaches
    where teaches.ID = '10101'
);
```

意思是：

- 先找出教师 `10101` 教过的那些具体开课班次
- 再找修过这些班次的学生人数

---

**`some`：和集合中的至少一个值比较**

PDF 给出的例子：

```sql
select name
from instructor
where salary > some (
    select salary
    from instructor
    where dept_name = 'Biology'
);
```

它表示：

- 只要某位教师的工资
- 大于 Biology 系里 **至少一位** 教师的工资
- 就满足条件


> `F <comp> some r` 等价于：存在 `r` 中某个值，使得比较成立。

---

**`all`：和集合中的所有值比较**

例如：

```sql
select name
from instructor
where salary > all (
    select salary
    from instructor
    where dept_name = 'Biology'
);
```

表示：

- 该教师工资大于 Biology 系中 **每一位** 教师的工资

> `F <comp> all r` 等价于：对 `r` 中每个值，比较都成立。

---

**`some` 和 `in` 的关系**

- `(= some) ≡ in`
- `(<> all) ≡ not in`

这说明：

- `in` 可以看成 `= some`
- `not in` 可以看成某种对所有都不相等的表达

不过最好还是按常规写法来记：

- 集合成员测试用 `in / not in`
- 集合比较用 `some / all`

---

### 标量子查询与存在性测试

**标量子查询**

标量子查询指的是：

> 这个子查询应该只返回一个值。

```sql
select name
from instructor
where salary * 10 >
    (select budget
     from department
     where department.dept_name = instructor.dept_name);
```

这里子查询返回的是某个院系的 `budget`，即一个单值。

PDF 还特别提醒：

> 如果标量子查询返回多行，会产生运行时错误。

所以你必须确保它真的只会返回一个值。

---

**`exists`：只关心有没有**

`exists` 不关心子查询具体返回什么值，只关心：

> 子查询结果是否非空。

- `exists r`：`r ≠ Ø`
- `not exists r`：`r = Ø`

例如找在 2009 Fall 和 2010 Spring 都开过的课程：

```sql
select course_id
from section as S
where semester = 'Fall'
  and year = 2009
  and exists (
      select *
      from section as T
      where semester = 'Spring'
        and year = 2010
        and S.course_id = T.course_id
  );
```

---

**相关子查询 correlated subquery**

上面这个 `exists` 例子就是相关子查询。

因为内层子查询里用到了外层的：

```sql
S.course_id
```

这表示：

- 内层查询不是独立执行一次就完
- 而是会随着外层当前元组不同而变化

所以相关子查询的本质是：

> 内层查询依赖外层当前这一行。

---

**`not exists + except`：表达全都修过**

这是经典的一题。

找出修过 Biology 系所有课程的学生：

```sql
select distinct S.ID, S.name
from student as S
where not exists (
    (select course_id
     from course
     where dept_name = 'Biology')
    except
    (select T.course_id
     from takes as T
     where S.ID = T.ID)
);
```

这个写法的关键思想是：

- 先取 Biology 系所有课程这个集合 `X`
- 再取该学生修过的课程这个集合 `Y`
- 如果 `X - Y` 为空
- 就说明 `X ⊆ Y`
- 也就是该学生把 Biology 的课程全修了

---

**`unique`**

它测试的是：

> 子查询结果中是否没有重复元组。
> 对空集它也会返回 true。

例如找 2009 年至多开过一次的课程：

```sql
select T.course_id
from course as T
where unique (
    select R.course_id
    from section as R
    where T.course_id = R.course_id
      and R.year = 2009
);
```

如果再加上 `exists`，就能把至多一次改成恰好一次。

---

### `from` 子查询、`lateral` 与 `with`

**`from` 子查询**

SQL 允许把子查询结果直接当作一张临时表放进 `from` 中。

例如先算每个系的平均工资，再从中筛出大于 42000 的系：

```sql
select dept_name, avg_salary
from (
    select dept_name, avg(salary) as avg_salary
    from instructor
    group by dept_name
)
where avg_salary > 42000;
```

这种写法的意义是：

- 把复杂查询分成两步
- 先构造中间结果
- 再对中间结果继续查询

---

**给 `from` 子查询起名字**

```sql
select dept_name, avg_salary
from (
    select dept_name, avg(salary)
    from instructor
    group by dept_name
) as dept_avg(dept_name, avg_salary)
where avg_salary > 42000;
```

这里：

- `dept_avg` 是子查询得到的临时关系名
- 后面的 `(dept_name, avg_salary)` 是它的列名

---

**`lateral`**

例子：

```sql
select name, salary, avg_salary
from instructor I1,
     lateral (
         select avg(salary) as avg_salary
         from instructor I2
         where I2.dept_name = I1.dept_name
     );
```

它的含义是：

- `from` 后面较晚出现的那部分
- 可以引用前面已经出现的关系变量

所以可以把 `lateral` 理解成：

> `from` 子句里的可引用前文的子查询。


---

**`with`：临时视图 temporary view**

> `with` 子句定义一个临时视图，它只在当前查询中可用。

例如找预算最大的院系：

```sql
with max_budget(value) as (
    select max(budget)
    from department
)
select dept_name
from department, max_budget
where department.budget = max_budget.value;
```

这条语句的思路是：

1. 先把最大预算命名成一个临时结果 `max_budget`
2. 外层查询再拿它去和 `department` 比较

---

**为什么 `with` 重要**

因为复杂查询如果全写在一层里，会很难读。

```sql
with dept_total(dept_name, value) as (
    select dept_name, sum(salary)
    from instructor
    group by dept_name
),
dept_total_avg(value) as (
    select avg(value)
    from dept_total
)
select dept_name
from dept_total, dept_total_avg
where dept_total.value >= dept_total_avg.value;
```

这个例子说明：

- `with` 很适合把复杂逻辑分层命名
- 让每一步都更清楚

你可以把 `with` 理解成：

> 给中间结果起名字，像搭积木一样组织复杂查询。

---

## Modification Of The Database

前面主要是查，这一部分开始讲改。

### delete

**删除整张表中的所有元组**

```sql
delete from instructor;
```

表示：

- 删掉 `instructor` 表中的所有记录
- 但表结构还在

**删除满足条件的元组**

例如删除 Finance 系所有教师：

```sql
delete from instructor
where dept_name = 'Finance';
```

**`delete` 中也可以用子查询**

例如删除所在院系位于 Watson 楼的教师：

```sql
delete from instructor
where dept_name in (
    select dept_name
    from department
    where building = 'Watson'
);
```

---

**`delete` 中的一个细节**


```sql
delete from instructor
where salary < (select avg(salary) from instructor);
```

如果边删边重新计算平均值，逻辑会混乱。

SQL 采用的语义是：

1. 先计算需要删除哪些元组
2. 再统一删除

而不是删一条就重新算一次平均值。

这说明 SQL 在修改语句中也很强调语义稳定。

---

### `insert`

**`insert ... values`**

最简单的插入方式是：

```sql
insert into course
values ('CS-437', 'Database Systems', 'Comp. Sci.', 4);
```

也可以显式写列名：

```sql
insert into course(course_id, title, dept_name, credits)
values ('CS-437', 'Database Systems', 'Comp. Sci.', 4);
```

写列名的好处是更清晰，也更不容易因为列顺序变化而出错。

---

**插入 `null`**

例如：

```sql
insert into student
values ('3003', 'Green', 'Finance', null);
```

这表示把 `tot_cred` 设成空值。

---

**`insert ... select`**

SQL 还支持把一个查询结果整体插入另一张表。

例如把所有教师加入学生表，并把 `tot_creds` 设为 0：

```sql
insert into student
select ID, name, dept_name, 0
from instructor;
```

这说明：

- `insert` 的数据来源不一定是手写一条
- 也可以来自另一条查询

---

**为什么 `insert ... select` 会先完整计算再插入**

> `select-from-where` 语句会先完整求值，再把结果插入目标关系。

这是为了避免像下面这种语句出问题：

```sql
insert into table1
select *
from table1;
```

如果不是先算完再插，那就可能一边读一边写，逻辑会失控。

所以它的语义是：

> 先把源结果确定好，再统一插入。

---

### `update`

`update` 用来修改已有元组的值。

例如：

```sql
update instructor
set salary = salary * 1.03
where salary > 100000;
```

这表示：

- 对满足条件的元组
- 把 `salary` 更新成原来的 `1.03` 倍

---

**两条 `update` 的顺序问题**

- 工资超过 100000 的教师涨 3%
- 其他教师涨 5%

如果写成两条语句：

```sql
update instructor
set salary = salary * 1.03
where salary > 100000;

update instructor
set salary = salary * 1.05
where salary <= 100000;
```

> 顺序是重要的。

因为第一条执行后，某些元组的值已经变了，可能影响第二条的判断。

---

**`case`：在一次 `update` 里表达分情况更新**

更好的写法是：

```sql
update instructor
set salary = case
    when salary <= 100000 then salary * 1.05
    else salary * 1.03
end;
```

这条语句的优势是：

- 逻辑集中
- 不容易受多条语句先后顺序影响

所以 `case` 是实际 SQL 里非常常见的工具。

---

**`update` + 子查询**

一个很典型的重算字段例子：

```sql
update student S
set tot_cred = (
    select sum(credits)
    from takes natural join course
    where S.ID = takes.ID
      and takes.grade <> 'F'
      and takes.grade is not null
);
```

这个查询表示：

- 对每个学生
- 重新计算其已获得学分
- 只统计成绩不是 `F` 且不为 `null` 的课程

如果某学生没修过课，`sum(credits)` 会变成 `null`。


```sql
case
    when sum(credits) is not null then sum(credits)
    else 0
end
```

也就是说：

- 如果求和不是 `null`，就取这个和
- 否则设成 `0`

---
