---
title: Instruction-Level Parallelism
published: 2026-05-11
description: Instruction-Level Parallelism
tags: [计算机体系结构]
category: 笔记
draft: false
---

## 概述

这一章开始讨论 **Instruction-Level Parallelism（ILP，指令级并行）**。

前面流水线章节已经说明：把一条指令拆成多个阶段，可以让多条指令重叠执行。但在简单的五级流水线中，指令通常仍然按照程序顺序进入、执行、完成。这样会带来一个明显限制：**一条慢指令卡住时，后面与它无关的短指令也可能被迫等待**。

---

## 目录
- [概述](#概述)
- [目录](#目录)
- [Review: Dependences and Hazards](#review-dependences-and-hazards)
  - [dependence 和 hazard 的区别](#dependence-和-hazard-的区别)
  - [三类主要 dependence](#三类主要-dependence)
    - [Data Dependence](#data-dependence)
    - [Name Dependence](#name-dependence)
    - [Control Dependence](#control-dependence)
  - [三类主要 hazard](#三类主要-hazard)
  - [Example](#example)
- [Dynamic Scheduling](#dynamic-scheduling)
  - [顺序流水线的限制](#顺序流水线的限制)
  - [动态调度的基本思想](#动态调度的基本思想)
  - [乱序执行带来的新问题](#乱序执行带来的新问题)
- [Scoreboard Algorithm](#scoreboard-algorithm)
  - [Example](#example-1)
  - [基本思想](#基本思想)
  - [从 ID 拆成 IS 和 RO](#从-id-拆成-is-和-ro)
  - [Scoreboard 的四个阶段](#scoreboard-的四个阶段)
    - [IS：检查结构冲突](#is检查结构冲突)
    - [RO：等待操作数 ready](#ro等待操作数-ready)
    - [EX：执行](#ex执行)
    - [WB：写回并检查 WAR](#wb写回并检查-war)
  - [三张状态表](#三张状态表)
    - [Instruction Status](#instruction-status)
    - [Function Component Status](#function-component-status)
    - [Register Status](#register-status)
    - [关键时刻 2：`FMUL.D` 准备写回](#关键时刻-2fmuld-准备写回)
    - [关键时刻 3：`FDIV.D` 准备写回](#关键时刻-3fdivd-准备写回)
  - [Scoreboard 的局限](#scoreboard-的局限)
  - [Scoreboard 时序填写](#scoreboard-时序填写)
    - [条件](#条件)
    - [答案](#答案)
    - [`FLD F6, 34(R2)`](#fld-f6-34r2)
    - [`FLD F2, 45(R3)`](#fld-f2-45r3)
    - [`FMUL.D F0, F2, F4`](#fmuld-f0-f2-f4)
    - [`FSUB.D F8, F2, F6`](#fsubd-f8-f2-f6)
    - [`FDIV.D F10, F0, F6`](#fdivd-f10-f0-f6)
    - [`FADD.D F6, F8, F2`](#faddd-f6-f8-f2)
---

## Review: Dependences and Hazards

### dependence 和 hazard 的区别

**Dependence（相关性 / 依赖关系）** 是程序自身的属性。只要程序写出来，指令之间是否有数据传递、是否复用同一个寄存器名称、是否受分支控制，这些关系就已经存在。

**Hazard（流水线冒险）** 是流水线组织方式的属性。程序中有 dependence，不一定会导致 hazard；是否形成 hazard，取决于流水线是否能通过 forwarding、stall、renaming、prediction 等机制处理它。

> Dependences are a property of programs.  
> Hazards are properties of the pipeline organization.

- dependence 描述“程序中有什么关系”；
- hazard 描述“某种硬件实现会不会被这种关系卡住”。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111935213.png" alt="dependence vs hazard" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### 三类主要 dependence

#### Data Dependence

**data dependence（数据相关）** 指后面的指令真正需要前面指令产生的数据。

典型形式：

```asm
FLD     F0, 0(R1)
FADD.D  F4, F0, F2
```

第二条指令要读取 `F0`，而 `F0` 由第一条指令产生。这里存在真实的数据流动。

对应的 hazard 是：

- **RAW（Read After Write）**
- 后读前写
- 后面的读必须等前面的写产生结果

RAW 是真实数据相关，不能靠简单改寄存器名字消除。常见解决方式是：

- forwarding / bypassing；
- stall / bubble；
- 动态调度中等待操作数 ready。

#### Name Dependence

**name dependence（名相关）** 指两条指令复用了同一个寄存器名字，但它们之间没有真实数据传递。

它分成两类。

第一类是 **anti-dependence（反相关）**，对应 **WAR（Write After Read）**：

```asm
FDIV.D  F2, F6, F4
FADD.D  F6, F0, F12
```

第一条指令要读 `F6`，第二条指令要写 `F6`。如果第二条在第一条读走 `F6` 前先写了 `F6`，第一条会读到错误值。

第二类是 **output-dependence（输出相关）**，对应 **WAW（Write After Write）**：

```asm
FDIV.D  F2, F0, F4
FSUB.D  F2, F6, F14
```

两条指令都写 `F2`。如果后写和前写的顺序被打乱，最终 `F2` 的值可能错误。

name dependence 的本质是“名字冲突”。它可以通过 **register renaming（寄存器重命名）** 消除。

:::TIP
RAW 代表真实的数据流动，不能随便改名消掉。  
WAR / WAW 多数来自寄存器名字复用，可以通过重命名解决。
:::

#### Control Dependence

**control dependence（控制相关）** 来自分支指令。

例如：

```c
if (p1) {
    Statement 1;
}
Statement;
if (p2) {
    Statement 2;
}
```

某些语句是否执行，取决于前面的分支条件。流水线中对应的问题是 **branch hazard / control hazard**。

### 三类主要 hazard

流水线中常见 hazard 包括：

1. **Structural hazard**
   - 所需硬件资源正忙；
   - 例如两个 load 同时争用同一个访存 / 整数功能部件。

2. **Data hazard**
   - 需要等待前面指令的数据读写；
   - 包括 RAW / WAR / WAW。

3. **Control hazard**
   - 下一条取什么指令取决于分支结果；
   - 需要分支预测、延迟槽或 stall 等机制处理。

### Example

slides 给出的复习例子是：

```asm
FADD.D  R1, R2, R4
FADD.D  R2, R1, 1
FSUB.D  R1, R4, R5
```

记三条指令为 `I1 / I2 / I3`。

| 指令关系 | hazard 类型 | 涉及寄存器 | 说明 |
| -------- | ----------- | ---------- | ---- |
| `I1 -> I2` | RAW | `R1` | `I1` 写 `R1`，`I2` 读 `R1` |
| `I1 -> I2` | WAR | `R2` | `I1` 读 `R2`，`I2` 写 `R2` |
| `I2 -> I3` | WAR | `R1` | `I2` 读 `R1`，`I3` 写 `R1` |
| `I1 -> I3` | WAW | `R1` | `I1` 和 `I3` 都写 `R1` |

处理思路：

- `I1 -> I2` 的 RAW 是真实数据相关，必须保留；
- `R2` 上的 WAR 可以通过重命名消除；
- `R1` 上的 WAW / WAR 也可以通过重命名消除。

一种示意性重命名写法是：

```asm
FADD.D  R1, R2, R4
FADD.D  R3, R1, 1
FSUB.D  R6, R4, R5
```

这里保留 `I1 -> I2` 对 `R1` 的真实数据传递，同时把无真实数据传递的寄存器名字冲突避开。

:::TIP
这里的重命名只是在说明思想。真实处理器里会维护 architectural register 和 physical register 的映射，保证最终对外表现仍然符合程序原始语义。
:::

---

## Dynamic Scheduling

### 顺序流水线的限制

简单流水线通常采用：

- in-order issue；
- in-order execution。

也就是说，指令按照程序顺序进入流水线；如果某条指令因为数据相关或结构冲突停住，后面的指令也可能被卡住。

slides 中给出的例子是：

```asm
FDIV.D  F4,  F0, F2
FSUB.D  F10, F4, F6
FADD.D  F12, F6, F14
```

分析：

- `FSUB.D` 依赖 `FDIV.D` 产生的 `F4`；
- `FDIV.D` 是长延迟指令，`FSUB.D` 必须等待；
- `FADD.D` 与前两条指令没有真实数据相关；
- 但在顺序流水线中，`FADD.D` 仍然会被前面的 `FSUB.D` 挡住。

这就造成了功能部件浪费。后面的短指令本来可以先执行，却因为程序顺序被迫等待。

### 动态调度的基本思想

**dynamic scheduling（动态调度）** 的核心思想是：

> 程序运行过程中，由 CPU 硬件动态判断每条指令是否可以执行；只要操作数 ready 且功能部件可用，就允许它先执行。

对应实现方式是：

- **in-order issue**：按程序顺序进入调度结构；
- **out-of-order execution**：进入后，谁先满足执行条件谁先执行；
- **out-of-order completion**：短指令可能先完成。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111936387.png" alt="Dynamic Scheduling" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这样可以提升功能部件利用率，减少无谓等待。

### 乱序执行带来的新问题

在五级整数流水线中，WAR / WAW 通常不会真正形成问题，因为读寄存器和写寄存器的位置固定，且指令顺序推进。

但乱序执行后，后面的指令可能先执行、先写回，因此会出现：

- **WAR hazard**：后面的写覆盖了前面尚未读取的值；
- **WAW hazard**：后面的写先于前面的写完成，破坏最终结果顺序。

例如：

```asm
FDIV.D  F10, F0, F2
FSUB.D  F10, F4, F6
FADD.D  F6,  F8, F14
```

这里存在：

- `FDIV.D` 和 `FSUB.D` 对 `F10` 的 WAW；
- `FSUB.D` 与 `FADD.D` 对 `F6` 的 WAR。

所以乱序执行必须解决两个问题：

1. **尽可能让独立指令提前执行**；
2. **保证执行结果仍然和原程序语义一致**。

Scoreboard 和 Tomasulo 都是在解决这个问题。

---

## Scoreboard Algorithm

### Example

```
FLD F6, 34（R2）
FLD F2, 45（R3）
FMUL.D F0, F2, F4
FSUB.D F8, F6, F2
FDIV.D F10, F0, F6
FADD.D F6, F8, F2
```

### 基本思想

**Scoreboard algorithm（记分牌算法）** 是早期用于动态调度和乱序执行的经典方法。

它的直觉很简单：

- 用一个中心化的记分牌记录当前所有功能部件、寄存器、指令的状态；
- 每条指令进入时，先检查是否有结构冲突；
- 操作数没有 ready 时先等待；
- 操作数 ready 后就可以执行；
- 写回前还要检查是否会破坏前面指令尚未完成的读操作。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111937127.png" alt="Scoreboard Structure" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

Scoreboard 的目标是：**允许部分指令乱序执行，同时由硬件检测 hazard，保证结果正确**。

### 从 ID 拆成 IS 和 RO

在简单五级流水线中，ID 阶段通常同时完成：

- decode；
- structural hazard 检查；
- data hazard 检查；
- register read。

如果所有检查都放在 ID 中，那么前面一条指令卡住时，后面的指令没有机会进入不同功能部件等待。

为了支持乱序执行，需要把 ID 拆成两个阶段：

1. **Issue（IS）**
   - decode instruction；
   - 检查 structural hazard；
   - 按程序顺序 issue；
   - 如果目标功能部件忙，则当前指令不能进入，后续指令也不能跳过它。

2. **Read Operands（RO）**
   - 等待数据 hazard 消失；
   - 操作数 ready 后读取操作数；
   - 可以乱序发生。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111937370.png" alt="Split ID into IS and RO" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

:::TIP
**IS 阶段仍然是顺序的**。  
真正允许乱序的是 RO / EX 之后的推进过程。
:::

### Scoreboard 的四个阶段

Scoreboard 中每条指令大致经过四个阶段：

| 阶段 | 含义 | 主要检查 |
| ---- | ---- | -------- |
| IS | Issue | 功能部件是否空闲；是否能占用对应记录项 |
| RO | Read Operands | 源操作数是否 ready；RAW 是否已经消除 |
| EX | Execute | 按功能部件延迟执行 |
| WB | Write Back | 是否存在 WAR；能否安全写回结果 |

#### IS：检查结构冲突

IS 阶段主要看目标功能部件是否可用。

若两个 `FLD` 都需要使用 Integer / Load 部件，而该结构里只有一个 Integer 部件。因此第一条 load 占用该部件时，第二条 load 不能在第 2 拍 issue，只能等第一条 load 完成释放后再进入。

#### RO：等待操作数 ready

RO 阶段主要看源操作数是否已经可用。

例如：

```asm
FMUL.D  F0, F2, F4
```

它要读 `F2`。如果 `F2` 由前面的 `FLD F2, 45(R3)` 产生，那么它必须等 `F2` 写回后才能 RO。

#### EX：执行

EX 阶段按照功能部件所需周期执行。

假设：

- Load：1 cycle；
- Add / Sub：2 cycles；
- Multiply：10 cycles；
- Divide：40 cycles。

不同功能部件可以并行工作，因此短指令可能先于长指令执行完。

#### WB：写回并检查 WAR

WB 阶段不能只看自己是否执行完，还要检查是否会破坏前面指令尚未读取的源寄存器。

例如：

```asm
FDIV.D  F10, F0, F6
FADD.D  F6,  F8, F2
```

`FDIV.D` 需要读取 `F6`，`FADD.D` 要写 `F6`。如果 `FADD.D` 在 `FDIV.D` 读取 `F6` 前写回，就会形成 WAR。Scoreboard 没有做寄存器重命名，只能让 `FADD.D` 等到 `FDIV.D` 完成 RO 后再 WB。

### 三张状态表

Scoreboard 需要维护三类信息。

#### Instruction Status

记录每条指令到了哪个阶段。

| Instruction | IS | RO | EX | WB |
| ----------- | -- | -- | -- | -- |
| `FLD F6, 34(R2)` | √ | √ | √ | √ |
| `FLD F2, 45(R3)` | √ | √ | √ |  |
| `FMUL.D F0, F2, F4` | √ |  |  |  |
| `FSUB.D F8, F6, F2` | √ |  |  |  |
| `FDIV.D F10, F0, F6` | √ |  |  |  |
| `FADD.D F6, F8, F2` |  |  |  |  |

这张表主要帮助我们理解当前每条指令的进度。

#### Function Component Status

记录每个功能部件当前是否忙、正在执行什么操作、目标寄存器和源寄存器是谁、操作数是否可读。

字段含义如下：

| 字段 | 含义 |
| ---- | ---- |
| Busy | 当前功能部件是否被占用 |
| Op | 当前操作类型，如 Load / MUL / SUB / DIV |
| Fi | 目标寄存器 |
| Fj / Fk | 源寄存器 |
| Qj / Qk | 如果源操作数还没 ready，记录将产生它的功能部件 |
| Rj / Rk | 源操作数是否 ready 且尚未被读取 |

| Name | Busy | Op | Fi | Fj | Fk | Qj | Qk | Rj | Rk |
| ---- | ---- | -- | -- | -- | -- | -- | -- | -- | -- |
| Integer | yes | Load | F2 | R3 |  |  |  | no |  |
| Mult1 | yes | MUL | F0 | F2 | F4 | Integer |  | no | yes |
| Mult2 | no |  |  |  |  |  |  |  |  |
| Add | yes | SUB | F8 | F6 | F2 |  | Integer | yes | no |
| Divide | yes | DIV | F10 | F0 | F6 | Mult1 |  | no | yes |

`Rj / Rk` ：

- `yes`：operand ready，但还没有读；
- `no` 且 `Qj/Qk = null`：operand 已经读走；
- `no` 且 `Qj/Qk != null`：operand 还没有 ready，正在等待某个功能部件产生。


#### Register Status

记录每个寄存器当前是否有尚未写回的生产者。

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... | F30 |
| -------- | -- | -- | -- | -- | -- | --- | --- | --- |
| Qi | Mult1 | Integer |  |  | Add | Divide |  |  |

含义：

- `Qi = Mult1`：说明 `F0` 将由 `Mult1` 产生；
- `Qi = Integer`：说明 `F2` 将由 Integer / Load 部件产生；
- 空白：说明当前没有未完成指令要写这个寄存器。

这张表用来判断 RAW 和 WAW，也帮助后续指令知道自己要等谁。

上面的三张表对应第 1 个时刻（第二条 `FLD` 还没写回）。下面补上另外两个关键时刻，便于对照指令推进。

#### 关键时刻 2：`FMUL.D` 准备写回

此时 `FMUL.D` 已完成 EX 但尚未 WB，`FDIV.D` 仍在等待 `F0`，`FADD.D` 因 WAR 暂停写回。

| Instruction | IS | RO | EX | WB |
| ----------- | -- | -- | -- | -- |
| `FLD F6, 34(R2)` | √ | √ | √ | √ |
| `FLD F2, 45(R3)` | √ | √ | √ | √ |
| `FMUL.D F0, F2, F4` | √ | √ | √ |  |
| `FSUB.D F8, F6, F2` | √ | √ | √ | √ |
| `FDIV.D F10, F0, F6` | √ |  |  |  |
| `FADD.D F6, F8, F2` | √ | √ | √ |  |

| Name | Busy | Op | Fi | Fj | Fk | Qj | Qk | Rj | Rk |
| ---- | ---- | -- | -- | -- | -- | -- | -- | -- | -- |
| Integer | no |  |  |  |  |  |  |  |  |
| Mult1 | yes | MUL | F0 | F2 | F4 |  |  | no | no |
| Mult2 | no |  |  |  |  |  |  |  |  |
| Add | yes | ADD | F6 | F8 | F2 |  |  | no | no |
| Divide | yes | DIV | F10 | F0 | F6 | Mult1 |  | no | yes |

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... | F30 |
| -------- | -- | -- | -- | -- | -- | --- | --- | --- |
| Qi | Mult1 |  |  | Add |  | Divide |  |  |

#### 关键时刻 3：`FDIV.D` 准备写回

此时除法部件仍忙，其他功能部件已空闲，寄存器状态只剩 `F10` 由 Divide 产生。

| Instruction | IS | RO | EX | WB |
| ----------- | -- | -- | -- | -- |
| `FLD F6, 34(R2)` | √ | √ | √ | √ |
| `FLD F2, 45(R3)` | √ | √ | √ | √ |
| `FMUL.D F0, F2, F4` | √ | √ | √ | √ |
| `FSUB.D F8, F6, F2` | √ | √ | √ | √ |
| `FDIV.D F10, F0, F6` | √ | √ | √ |  |
| `FADD.D F6, F8, F2` | √ | √ | √ | √ |

| Name | Busy | Op | Fi | Fj | Fk | Qj | Qk | Rj | Rk |
| ---- | ---- | -- | -- | -- | -- | -- | -- | -- | -- |
| Integer | no |  |  |  |  |  |  |  |  |
| Mult1 | no |  |  |  |  |  |  |  |  |
| Mult2 | no |  |  |  |  |  |  |  |  |
| Add | no |  |  |  |  |  |  |  |  |
| Divide | yes | DIV | F10 | F0 | F6 |  |  | no | no |

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... | F30 |
| -------- | -- | -- | -- | -- | -- | --- | --- | --- |
| Qi |  |  |  |  |  | Divide |  |  |

### Scoreboard 的局限

Scoreboard 可以实现乱序执行，但它的处理方式偏保守。

它能做到：

- 检测 structural hazard；
- 检测 RAW；
- 检测 WAR / WAW；
- 允许无关指令提前执行。

但它还做不到：

- 通过硬件寄存器重命名消除 WAR / WAW；
- 从根本上解决 name dependence 带来的等待；
- 自然保证精确异常。

因此当它发现 WAR / WAW 时，通常只能等待。

后续 Tomasulo 算法会引入 reservation station、CDB、硬件寄存器重命名，用更主动的方式减少这些等待。

### Scoreboard 时序填写

#### 条件

指令序列为：

```asm
FLD     F6, 34(R2)
FLD     F2, 45(R3)
FMUL.D  F0, F2, F4
FSUB.D  F8, F2, F6
FDIV.D  F10, F0, F6
FADD.D  F6, F8, F2
```

执行延迟假设为：

| 指令类型 | EX 延迟 |
| -------- | ------- |
| LD | 1 cycle |
| ADD / SUB | 2 cycles |
| MUL | 10 cycles |
| DIV | 40 cycles |

要求填写每条指令的：

- IS；
- RO；
- EX；
- WB。

#### 答案

| Instruction          |  IS |  RO |    EX |  WB |
| -------------------- | --: | --: | ----: | --: |
| `FLD F6, 34(R2)`     |   1 |   2 |     3 |   4 |
| `FLD F2, 45(R3)`     |   5 |   6 |     7 |   8 |
| `FMUL.D F0, F2, F4`  |   6 |   9 | 10–19 |  20 |
| `FSUB.D F8, F2, F6`  |   7 |   9 | 10–11 |  12 |
| `FDIV.D F10, F0, F6` |   8 |  21 | 22–61 |  62 |
| `FADD.D F6, F8, F2`  |  13 |  14 | 15–16 |  22 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111943951.png" alt="Scoreboard Timing" style="width: 520px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### `FLD F6, 34(R2)`

第一条指令直接进入：

- IS = 1；
- RO = 2；
- EX = 3；
- WB = 4。

它占用 Integer / Load 功能部件，直到第 4 拍写回后释放。

#### `FLD F2, 45(R3)`

第二条也是 load，也要使用同一个 Integer / Load 功能部件。

第一条 load 在第 1 到第 4 拍占用该部件，所以第二条不能在第 2 拍 issue。

因此：

- IS = 5；
- RO = 6；
- EX = 7；
- WB = 8。

:::TIP
第二条 `FLD` 不能在第 2 拍 IS。  
原因在于 Integer / Load 功能部件仍被第一条 `FLD` 占用，和数据 ready 无关。
:::

#### `FMUL.D F0, F2, F4`

这条指令使用乘法部件。

- 第 6 拍可以 IS，因为它前面的第二条 load 已经在第 5 拍 issue，且乘法部件空闲；
- 但它要读 `F2`，而 `F2` 由第二条 `FLD` 产生；
- 第二条 `FLD` 在第 8 拍 WB，因此 `FMUL.D` 第 9 拍才能 RO；
- 乘法执行 10 拍，即 EX = 10–19；
- 第 20 拍 WB。

因此：

```text
IS = 6, RO = 9, EX = 10–19, WB = 20
```
#### `FSUB.D F8, F2, F6`

这条指令使用加法 / 减法部件。

- 第 7 拍可以 IS，因为 Add 部件空闲；
- 它需要 `F2` 和 `F6`；
- `F6` 已经由第一条 load 在第 4 拍写回；
- `F2` 由第二条 load 在第 8 拍写回；
- 所以第 9 拍可以 RO；
- 减法执行 2 拍，即 EX = 10–11；
- 第 12 拍 WB。

因此：

```text
IS = 7, RO = 9, EX = 10–11, WB = 12
```

注意：它和 `FMUL.D` 可以同在第 9 拍 RO，因为它们进入了不同功能部件，且操作数都已经 ready。

#### `FDIV.D F10, F0, F6`

这条指令使用除法部件。

- 第 8 拍可以 IS，因为 Divide 部件空闲；
- 它需要 `F0` 和 `F6`；
- `F6` 已经 ready；
- `F0` 由 `FMUL.D` 产生，`FMUL.D` 第 20 拍 WB；
- 因此 `FDIV.D` 第 21 拍才能 RO；
- 除法执行 40 拍，即 EX = 22–61；
- 第 62 拍 WB。

因此：

```text
IS = 8, RO = 21, EX = 22–61, WB = 62
```

#### `FADD.D F6, F8, F2`

这条指令使用 Add 部件。

- Add 部件被 `FSUB.D` 占用到第 12 拍；
- 所以它第 13 拍才能 IS；
- `F8` 由 `FSUB.D` 第 12 拍产生，`F2` 已经 ready；
- 因此第 14 拍 RO；
- 加法执行 2 拍，即 EX = 15–16；
- 按执行结果看，第 17 拍之后它已经可以写回。

但它的目标寄存器是 `F6`，而前面的：

```asm
FDIV.D  F10, F0, F6
```

还没有读取 `F6`。`FDIV.D` 在第 21 拍 RO，读走 `F6` 后，`FADD.D` 才能安全写 `F6`。

因此 `FADD.D` 的 WB 被推迟到第 22 拍。

```text
IS = 13, RO = 14, EX = 15–16, WB = 22
```

**Scoreboard 遇到 WAR 时只能等待**。

