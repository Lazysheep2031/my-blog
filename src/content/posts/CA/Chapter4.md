---
title: Instruction-Level Parallelism
published: 2026-05-18
description: Instruction-Level Parallelism
tags: [计算机体系结构]
category: 笔记
draft: false
---

## 概述

本章围绕指令级并行（ILP）展开，先区分 dependence 与 hazard，说明为什么流水线会被依赖关系限制。随后用 Scoreboard 与 Tomasulo 展示动态调度如何实现乱序执行，并通过保留站与重命名消除 WAR/WAW。最后引入 ROB，把“乱序执行 / 顺序提交”串成一条主线，解释精确异常与推测执行的关系。


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
  - [Tomasulo's Approach](#tomasulos-approach)
    - [从 Scoreboard 到 Tomasulo](#从-scoreboard-到-tomasulo)
    - [硬件结构：Reservation Station 与 CDB](#硬件结构reservation-station-与-cdb)
    - [Tomasulo 的三个阶段](#tomasulo-的三个阶段)
      - [Issue](#issue)
      - [Execute](#execute)
      - [Write Result](#write-result)
    - [Example：硬件如何自动重命名](#example硬件如何自动重命名)
    - [Tomasulo 的三张状态表](#tomasulo-的三张状态表)
      - [Instruction Status Table](#instruction-status-table)
      - [Reservation Station Table](#reservation-station-table)
      - [Register Status Table](#register-status-table)
    - [Example：状态表变化](#example状态表变化)
      - [关键时刻 1：只有第一条 load 已经写回](#关键时刻-1只有第一条-load-已经写回)
      - [关键时刻 2：`FMUL.D` 准备写回](#关键时刻-2fmuld-准备写回-1)
    - [Tomasulo 的贡献与局限](#tomasulo-的贡献与局限)
    - [Tomasulo 时序填写](#tomasulo-时序填写)
- [Hardware-Based Speculation](#hardware-based-speculation)
  - [为什么需要 ROB](#为什么需要-rob)
  - [基于硬件推测的基本结构](#基于硬件推测的基本结构)
  - [四个阶段：IS / EX / WB / Commit](#四个阶段is--ex--wb--commit)
      - [Issue](#issue-1)
      - [Execute](#execute-1)
      - [Writeback](#writeback)
      - [Commit](#commit)
  - [ROB 记录什么](#rob-记录什么)
  - [Example](#example-2)
  - [Hardware-Based Speculation 时序填写](#hardware-based-speculation-时序填写)
  - [三种方法对比](#三种方法对比)

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


### Scoreboard Algorithm

#### Example

```
FLD F6, 34（R2）
FLD F2, 45（R3）
FMUL.D F0, F2, F4
FSUB.D F8, F6, F2
FDIV.D F10, F0, F6
FADD.D F6, F8, F2
```

#### 基本思想

**Scoreboard algorithm（记分牌算法）** 是早期用于动态调度和乱序执行的经典方法。

它的直觉很简单：

- 用一个中心化的记分牌记录当前所有功能部件、寄存器、指令的状态；
- 每条指令进入时，先检查是否有结构冲突；
- 操作数没有 ready 时先等待；
- 操作数 ready 后就可以执行；
- 写回前还要检查是否会破坏前面指令尚未完成的读操作。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111937127.png" alt="Scoreboard Structure" style="width: 320px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

Scoreboard 的目标是：**允许部分指令乱序执行，同时由硬件检测 hazard，保证结果正确**。

#### 从 ID 拆成 IS 和 RO

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

#### Scoreboard 的四个阶段

Scoreboard 中每条指令大致经过四个阶段：

| 阶段 | 含义 | 主要检查 |
| ---- | ---- | -------- |
| IS | Issue | 功能部件是否空闲；是否能占用对应记录项 |
| RO | Read Operands | 源操作数是否 ready；RAW 是否已经消除 |
| EX | Execute | 按功能部件延迟执行 |
| WB | Write Back | 是否存在 WAR；能否安全写回结果 |

##### IS：检查结构冲突

IS 阶段主要看目标功能部件是否可用。

若两个 `FLD` 都需要使用 Integer / Load 部件，而该结构里只有一个 Integer 部件。因此第一条 load 占用该部件时，第二条 load 不能在第 2 拍 issue，只能等第一条 load 完成释放后再进入。

##### RO：等待操作数 ready

RO 阶段主要看源操作数是否已经可用。

例如：

```asm
FMUL.D  F0, F2, F4
```

它要读 `F2`。如果 `F2` 由前面的 `FLD F2, 45(R3)` 产生，那么它必须等 `F2` 写回后才能 RO。

##### EX：执行

EX 阶段按照功能部件所需周期执行。

假设：

- Load：1 cycle；
- Add / Sub：2 cycles；
- Multiply：10 cycles；
- Divide：40 cycles。

不同功能部件可以并行工作，因此短指令可能先于长指令执行完。

##### WB：写回并检查 WAR

WB 阶段不能只看自己是否执行完，还要检查是否会破坏前面指令尚未读取的源寄存器。

例如：

```asm
FDIV.D  F10, F0, F6
FADD.D  F6,  F8, F2
```

`FDIV.D` 需要读取 `F6`，`FADD.D` 要写 `F6`。如果 `FADD.D` 在 `FDIV.D` 读取 `F6` 前写回，就会形成 WAR。Scoreboard 没有做寄存器重命名，只能让 `FADD.D` 等到 `FDIV.D` 完成 RO 后再 WB。

#### 三张状态表

Scoreboard 需要维护三类信息。

##### Instruction Status

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

##### Function Component Status

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


##### Register Status

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

##### 关键时刻 2：`FMUL.D` 准备写回

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

##### 关键时刻 3：`FDIV.D` 准备写回

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

#### Scoreboard 的局限

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

#### Scoreboard 时序填写

##### 条件

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

##### 答案

| Instruction          |  IS |  RO |    EX |  WB |
| -------------------- | --: | --: | ----: | --: |
| `FLD F6, 34(R2)`     |   1 |   2 |     3 |   4 |
| `FLD F2, 45(R3)`     |   5 |   6 |     7 |   8 |
| `FMUL.D F0, F2, F4`  |   6 |   9 | 10–19 |  20 |
| `FSUB.D F8, F2, F6`  |   7 |   9 | 10–11 |  12 |
| `FDIV.D F10, F0, F6` |   8 |  21 | 22–61 |  62 |
| `FADD.D F6, F8, F2`  |  13 |  14 | 15–16 |  22 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/202605111943951.png" alt="Scoreboard Timing" style="width: 520px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### `FLD F6, 34(R2)`

第一条指令直接进入：

- IS = 1；
- RO = 2；
- EX = 3；
- WB = 4。

它占用 Integer / Load 功能部件，直到第 4 拍写回后释放。

##### `FLD F2, 45(R3)`

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

##### `FMUL.D F0, F2, F4`

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
##### `FSUB.D F8, F2, F6`

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

##### `FDIV.D F10, F0, F6`

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

##### `FADD.D F6, F8, F2`

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

### Tomasulo's Approach

**Scoreboard** 可以检测 RAW / WAR / WAW，并让一部分指令乱序执行。它的问题是：

- 对真实数据相关 RAW，只能等前面结果产生，这个必须保留；
- 对 name dependence 引起的 WAR / WAW，也只能检测并等待；
- 它没有真正“消除”这些名字相关带来的冲突。

**Tomasulo 算法**的核心改进是：在硬件中做 **register renaming（寄存器重命名）**。

也就是说，当程序中的两个指令只是碰巧用了同一个寄存器名字，但实际上没有真实数据传递时，硬件自动给它们换一个内部名字。这样就可以保留真正的数据依赖，同时消除 WAR / WAW。

#### 从 Scoreboard 到 Tomasulo

回顾一个 name dependence 的例子：

```asm
FDIV.D  F0, F2, F4
FADD.D  F6, F0, F8
FSD     F6, 0(R1)
FSUB.D  F8, F10, F14
FMUL.D  F6, F10, F8
```

这里存在两个名字相关：

- `F6` 被 `FADD.D` 写，又被后面的 `FMUL.D` 写，容易形成 WAW；
- `F8` 被前面的 `FADD.D` 读，又被 `FSUB.D` 写，容易形成 WAR。

如果手工重命名，可以改成：

```asm
FDIV.D  F0, F2, F4
FADD.D  S,  F0, F8
FSD     S,  0(R1)
FSUB.D  T,  F10, F14
FMUL.D  F6, F10, T
```

其中：

- 原来 `FADD.D` 写的 `F6` 改成临时名 `S`；
- 原来 `FSUB.D` 写的 `F8` 改成临时名 `T`；
- 真正的数据流仍然保留，比如 `FMUL.D` 依赖 `FSUB.D` 的结果。

:::TIP
Tomasulo 要解决的问题就是：这件“看代码后手工改名”的事情，能不能让 CPU 在运行时自动完成。
:::


#### 硬件结构：Reservation Station 与 CDB

Tomasulo 在 Scoreboard 的基础上改变了硬件组织方式。它减少对单一集中式控制表的依赖，在功能部件前面加入多个 **reservation stations（保留站）**。

整体结构可以理解为：

- 上方是 **instruction queue**，指令仍然按程序顺序进入；
- load / store 指令进入 **load buffer / store buffer**；
- 加法、乘法等浮点运算进入对应的 **reservation station**；
- 结果通过 **CDB（Common Data Bus，公共数据总线）**广播给所有需要它的位置。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518183405.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

保留站的作用不只是缓存指令。它同时完成三件事：

1. **扩展功能部件前的等待空间**  
   例如只有一个加法器，但前面可以有 3 个加法保留站，所以最多可以有 3 条加法类指令先进入流水线等待。

2. **保存操作数的值或生产者名字**  
   如果操作数已经 ready，保留站中直接保存值；如果还没有 ready，保留站保存“将来由哪个保留站产生”。

3. **完成寄存器重命名**  
   指令进入保留站以后，源操作数和目的操作数不再单纯依赖架构寄存器名，改用保留站名或具体值表示。

和 Scoreboard 相比，Tomasulo 的关键差别是：

| 项目 | Scoreboard | Tomasulo |
|---|---|---|
| 控制方式 | 集中式 scoreboard | 分布式 reservation stations + CDB |
| Issue 时检查 | 功能部件是否空闲 | 对应保留站 / buffer 是否有空位 |
| WAR / WAW | 检测后等待 | 通过 register renaming 消除 |
| RAW | 等待前面结果产生 | 用 tag 记录生产者，结果出现后广播 |
| 写回 | 写寄存器，并释放部件 | 通过 CDB 广播到寄存器和所有等待位置 |

这里要特别注意：

- **Tomasulo 的 IS 阶段仍然是 in-order issue**；
- 进入保留站之后，谁的操作数 ready、谁的功能部件空闲，谁就可以先执行；
- 因此执行和写回可以乱序。

#### Tomasulo 的三个阶段

Tomasulo 把指令执行分成三个主要阶段。

##### Issue

从 instruction queue 的队首取出下一条指令。

如果对应类型的 reservation station 或 load/store buffer 有空位，就把指令发射进去；否则发生结构冲突，指令停在队列中。

Issue 阶段同时做 register renaming：

- 如果源操作数已经在寄存器中，就把值直接读入保留站；
- 如果源操作数还没 ready，就记录将来产生它的保留站名；
- 如果该指令要写某个寄存器，就在 register status table 中记录：这个寄存器将来由哪个保留站产生。

:::TIP
Tomasulo 的 Issue 不再检查“功能部件是否忙”。  
它先检查保留站是否有空位，让指令先进来；进入之后再等操作数和功能部件。
:::

##### Execute

当一条指令的所有源操作数都 ready，并且对应功能部件可用时，就可以执行。

load / store 指令有两个动作：

1. 先计算 effective address；
2. 再把地址放到 load buffer 或 store buffer 中，等待访存。

##### Write Result

当结果产生后，通过 CDB 广播。

广播目标包括：

- 架构寄存器；
- 所有正在等待这个结果的 reservation stations；
- store buffer 等需要该结果的位置。

同一个结果在一个 clock cycle 中可以被多个等待者同时收到。

store 指令需要特殊处理：只有当 store 的地址和要写入的数据都 ready，并且 memory unit 空闲时，才真正写内存。

#### Example：硬件如何自动重命名

老师用两条指令说明 Tomasulo 怎样自动消除 WAR，同时保留 RAW。

```asm
MUL.D  F0, F2, F4
ADD.D  F2, F0, F6
```

假设初始寄存器中：

```text
F2 = a
F4 = b
F6 = c
```

这两条指令之间有两种关系：

- `ADD.D` 要读 `F0`，而 `F0` 由 `MUL.D` 产生，这是 RAW，必须保留；
- `MUL.D` 要读 `F2`，而 `ADD.D` 后面要写 `F2`，这是 WAR，只是名字相关，可以消除。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518184551.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

执行过程如下。

1. `MUL.D F0, F2, F4` issue 到 `MULT1`

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518184600.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

因为 `F2` 和 `F4` 都已经有值，所以保留站中直接存：

```text
MULT1: MUL, Vj = a, Vk = b
```

同时 register status table 记录：

```text
Qi[F0] = MULT1
```

意思是：`F0` 将来由 `MULT1` 产生。

此时 `MUL.D` 已经把旧的 `F2 = a` 读入保留站。后面即使有人写 `F2`，也不会影响这条乘法指令。

2. `ADD.D F2, F0, F6` issue 到 `ADD1`

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518184615.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

`F6 = c` 已经 ready，所以直接读入；`F0` 还没 ready，但 register status table 说明它将来由 `MULT1` 产生，所以记录：

```text
ADD1: ADD, Qj = MULT1, Vk = c
```

同时这条加法要写 `F2`，所以：

```text
Qi[F2] = ADD1
```

这里 `F2` 的 WAR 已经被消除：

- `MUL.D` 需要的旧 `F2` 已经变成保留站里的值 `a`；
- `ADD.D` 将来写的 `F2` 对应内部名字 `ADD1`；
- 两者不再争用同一个“名字”。

3. `MULT1` 计算完成并 broadcast

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518184642.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

假设：

```text
e = a × b
```

`MULT1` 通过 CDB 广播 `e`。

于是：

- `F0` 得到 `e`；
- 所有等待 `MULT1` 的保留站也得到 `e`；
- `ADD1` 从 `Qj = MULT1` 变成 `Vj = e`。

此后 `ADD1` 可以执行：

```text
F2 = e + c
```

这个例子的核心是：

- RAW 通过 `Qj/Qk` 保留下来；
- WAR / WAW 通过保留站名和 `Qi` 表被消除。

#### Tomasulo 的三张状态表

Tomasulo 需要记录三类状态。

##### Instruction Status Table

记录每条指令到了哪个阶段：

- Issue；
- Execute；
- Write Result。

这张表主要用于帮助理解算法，通常不是硬件中的真实结构。

##### Reservation Station Table

保留站表记录每个保留站当前是否被占用，以及源操作数是否 ready。

常见字段如下：

| 字段 | 含义 |
|---|---|
| `Busy` | 当前保留站是否被占用 |
| `Op` | 要执行的操作 |
| `Vj, Vk` | 已经 ready 的源操作数值 |
| `Qj, Qk` | 将来产生源操作数的保留站名 |
| `A` | load/store 的地址计算相关信息 |

判断一个操作数是否 ready：

- 如果 `Qj/Qk` 为空，说明对应操作数已经在 `Vj/Vk` 中；
- 如果 `Qj/Qk` 不为空，说明还在等某个保留站通过 CDB 广播结果。

##### Register Status Table

Register status table 的核心字段是 `Qi`。

它记录：

```text
某个寄存器将来由哪个保留站产生
```

例如：

```text
Qi[F0] = MULT1
```

表示当前 `F0` 的最新值还没有真正写入寄存器，它将来由 `MULT1` 产生。

如果 `Qi[F0]` 为空，则说明 `F0` 当前值已经在寄存器堆中，是 ready 的。

#### Example：状态表变化

沿用六条指令：

```asm
FLD     F6, 34(R2)
FLD     F2, 45(R3)
FMUL.D  F0, F2, F4
FSUB.D  F8, F6, F2
FDIV.D  F10, F0, F6
FADD.D  F6, F8, F2
```


##### 关键时刻 1：只有第一条 load 已经写回

此时第一条指令已经完成：

```asm
FLD F6, 34(R2)
```

第二条 load 已经 issue 和 execute，但还没有 write result。后面四条指令已经 issue 到对应保留站。

Instruction Status 大致为：

| Instruction | Issue | Execute | Write Result |
|---|---:|---:|---:|
| `FLD F6, 34(R2)` | √ | √ | √ |
| `FLD F2, 45(R3)` | √ | √ |  |
| `FMUL.D F0, F2, F4` | √ |  |  |
| `FSUB.D F8, F6, F2` | √ |  |  |
| `FDIV.D F10, F0, F6` | √ |  |  |
| `FADD.D F6, F8, F2` | √ |  |  |

Reservation Station Table 可以概括成：

| Name | Busy | Op | Vj | Vk | Qj | Qk | A |
|---|---|---|---|---|---|---|---|
| Load1 | No |  |  |  |  |  |  |
| Load2 | Yes | Load |  |  |  |  | `45 + Regs[R3]` |
| Add1 | Yes | SUB | `Mem[34 + Regs[R2]]` |  |  | Load2 |  |
| Add2 | Yes | ADD |  |  | Add1 | Load2 |  |
| Add3 | No |  |  |  |  |  |  |
| Mult1 | Yes | MUL |  | `Reg[F4]` | Load2 |  |  |
| Mult2 | Yes | DIV | `Mem[34 + Regs[R2]]` |  |  | Mult1 |  |

Register Status Table 为：

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... |
|---|---|---|---|---|---|---|---|
| `Qi` | Mult1 | Load2 |  | Add2 | Add1 | Mult2 |  |

这里最值得注意的是 `F6`：

第一条 load 已经把旧的 `F6` 写回，后面的 `FDIV.D` 在 issue 时已经读到了旧 `F6` 的值；而最后一条 `FADD.D` 将来要写新的 `F6`，所以 `Qi[F6] = Add2`。

这说明 Tomasulo 已经把“旧 `F6`”和“新 `F6`”区分开了。Scoreboard 中 `FADD.D` 因 WAR 不能过早写 `F6`，但 Tomasulo 不需要这样等待。

##### 关键时刻 2：`FMUL.D` 准备写回

等第二条 load 写回后，`FMUL.D` 和 `FSUB.D` 都拿到了 `F2`。其中：

- `FSUB.D` 执行较短，很快写回；
- `FADD.D` 等到 `F8` 后也可以执行并写回；
- `FMUL.D` 执行较长，此时准备 write result；
- `FDIV.D` 仍然等待 `F0`，也就是等待 `Mult1`。

此时 Instruction Status 大致为：

| Instruction | Issue | Execute | Write Result |
|---|---:|---:|---:|
| `FLD F6, 34(R2)` | √ | √ | √ |
| `FLD F2, 45(R3)` | √ | √ | √ |
| `FMUL.D F0, F2, F4` | √ | √ |  |
| `FSUB.D F8, F6, F2` | √ | √ | √ |
| `FDIV.D F10, F0, F6` | √ |  |  |
| `FADD.D F6, F8, F2` | √ | √ | √ |

Reservation Station Table 只剩下两个乘除相关项：

| Name | Busy | Op | Vj | Vk | Qj | Qk |
|---|---|---|---|---|---|---|
| Mult1 | Yes | MUL | `Mem[45 + Regs[R3]]` | `Reg[F4]` |  |  |
| Mult2 | Yes | DIV | `Mem[34 + Regs[R2]]` |  |  | Mult1 |

Register Status Table 为：

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... |
|---|---|---|---|---|---|---|---|
| `Qi` | Mult1 |  |  |  |  | Mult2 |  |

此时 `FSUB.D` 和 `FADD.D` 虽然在程序顺序上排在 `FMUL.D` 和 `FDIV.D` 后面，但已经写回。这就是 Tomasulo 的乱序执行 / 乱序写回。

#### Tomasulo 的贡献与局限

Tomasulo 的主要贡献：

1. 提供了成熟的动态调度机制；
2. 通过硬件 register renaming 消除 WAR / WAW；
3. 对 RAW 用 tag 保留真实数据依赖；
4. 比 Scoreboard 更适合现代乱序处理器；
5. 引入了 load/store disambiguation 的思想。

其中 load/store 指令是否能乱序，要看地址关系：

- 如果 load 和 store 访问不同地址，可以安全乱序；
- 如果 load 在前、store 在后，交换顺序会让 store 先写、load 后读，可能形成 WAR；
- 如果 store 在前、load 在后，交换顺序会让 load 先读、store 后写，可能形成 RAW；
- 如果两个 store 访问同一地址，交换顺序会形成 WAW。

Tomasulo 的局限也很明显：

1. **硬件结构复杂**  
   需要保留站、load/store buffer、CDB、register status 等结构。

2. **CDB 容易成为瓶颈**  
   所有结果都要通过 CDB 广播。如果多个功能部件同一周期完成，就需要仲裁或多条 CDB。

3. **访存相关仍然难处理**  
   load/store 依赖地址计算，只有知道地址后才能判断是否可以安全乱序。

4. **不能自然保证 precise exception**  
   Tomasulo 允许乱序执行和乱序写回。这样可能出现：后面的指令已经修改了机器状态，前面的指令却发生异常。此时程序员看到的状态可能不像按顺序执行那样干净。


#### Tomasulo 时序填写

假设：

- Add / Sub 执行需要 2 个 clock cycles；
- Multiply 执行需要 10 个 clock cycles；
- Division 执行需要 40 个 clock cycles；
- Load 的访存执行需要 1 个 clock cycle；
- 指令按顺序 issue；
- 结果通过 CDB 写回。

```asm
FLD     F6, 34(R2)
FLD     F2, 45(R3)
FMUL.D  F0, F2, F4
FSUB.D  F8, F2, F6
FDIV.D  F10, F0, F6
FADD.D  F6, F8, F2
```

时序表为：

| Instruction | IS | EX | WB |
|---|---:|---:|---:|
| `FLD F6, 34(R2)` | 1 | 2-3 | 4 |
| `FLD F2, 45(R3)` | 2 | 3-4 | 5 |
| `FMUL.D F0, F2, F4` | 3 | 6–15 | 16 |
| `FSUB.D F8, F2, F6` | 4 | 6–7 | 8 |
| `FDIV.D F10, F0, F6` | 5 | 17–56 | 57 |
| `FADD.D F6, F8, F2` | 6 | 9–10 | 11 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518185007.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

几个关键点：

1. 第二条 load 为什么可以第 2 拍 IS ？

和 Scoreboard 不同，Tomasulo 检查的是 load buffer 是否有空位。只要 load buffer 有空，第二条 `FLD` 就可以进入流水线，不必等第一条 load 完全写回。

2. `FMUL.D` 和 `FSUB.D` 为什么都可以第 6 拍开始 EX ？

第二条 load 在第 5 拍通过 CDB 写回 `F2`。`FMUL.D` 和 `FSUB.D` 都在等待这个结果。

CDB 广播的特点是：一个结果可以在同一拍被多个等待者同时收到。

所以第 6 拍：

- `FMUL.D` 拿到 `F2`，可以开始乘法；
- `FSUB.D` 也拿到 `F2`，可以开始减法。

3. `FADD.D` 为什么第 11 拍就能 WB ？

`FADD.D` 需要 `F8` 和 `F2`。

- `F2` 第 5 拍已经 ready；
- `F8` 由 `FSUB.D` 产生，`FSUB.D` 第 8 拍 WB；
- 因此 `FADD.D` 第 9–10 拍执行，第 11 拍写回。

在 Scoreboard 中，`FADD.D` 写 `F6` 会因为前面的 `FDIV.D` 还没读完 `F6` 而发生 WAR 等待；在 Tomasulo 中，`FDIV.D` issue 时已经把旧 `F6` 的值读到保留站，所以 `FADD.D` 可以直接写回新的 `F6`。

因此 Tomasulo 的写回顺序是：

```text
1 → 2 → 4 → 6 → 3 → 5
```

这体现了乱序执行和乱序写回。

---

## Hardware-Based Speculation

Tomasulo 能提高功能部件利用率，但它带来一个问题：

> Out-of-order execution 是否一定意味着 out-of-order completion？

答案是：可以把二者分开。

我们希望：

- 执行时乱序，提高硬件利用率；
- 对外完成时仍然顺序，保证程序语义和精确异常。

这就需要在 Tomasulo 后面再加一个 buffer：**ROB（Reorder Buffer，重排序缓冲区）**。

### 为什么需要 ROB

- 同学按学号 1、2、3、4、5 的顺序进入教室；
- 教室里有多个功能部件，可以让同学乱序完成不同任务；
- 有的人做得快，有的人做得慢；
- 但最后从教室出去时，仍然要求按学号顺序出去。

解决办法是在出口处放一排“沙发”。

- 1 号完成后可以直接出去；
- 2 号如果先完成，要坐在沙发上等 1 号；
- 5 号如果最早完成，也要等 1、2、3、4 都出去之后才能出去。

这个“沙发”就是 ROB。

:::TIP
ROB 的本质作用是：允许指令乱序执行，但强制指令按程序顺序 commit。
:::

### 基于硬件推测的基本结构

Hardware-Based Speculation 在 Tomasulo 基础上加入 ROB。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260518185200.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

它结合了三个核心思想：

1. **dynamic branch prediction**  
   预测后面应该取哪些指令。

2. **speculation**  
   在控制相关还没有完全确定之前，先让预测路径上的指令执行。

3. **dynamic scheduling**  
   让不同基本块中的指令也能动态调度，尽量提高功能部件利用率。

加入 ROB 后，CDB 不再直接把结果写入最终的架构寄存器。结果先进入 ROB，等到该指令成为 ROB 队首并且前面所有指令都已经完成后，才真正 commit。

### 四个阶段：IS / EX / WB / Commit

Hardware-Based Speculation 的指令流程变成四个阶段。

##### Issue

从 instruction queue 中按顺序取指令。

如果对应 reservation station 有空位，并且 ROB 有空位，就可以 issue。

Issue 时会同时分配：

- 一个 reservation station；
- 一个 ROB entry。

register status table 记录的内容从 reservation station 名改为 ROB entry 编号。

##### Execute

和 Tomasulo 一样：

- 等源操作数 ready；
- 等功能部件可用；
- ready 的指令可以乱序执行。

##### Writeback

执行完成后，通过 CDB 把结果写到 ROB 对应 entry 中，也会广播给等待该结果的保留站。

区别是：此时还没有真正修改架构寄存器。

##### Commit

ROB 按程序顺序检查队首指令。

只有当队首指令已经完成，才允许 commit：

- 普通计算指令：把 ROB 中的结果写入架构寄存器；
- store 指令：在 commit 时真正写内存；
- 分支预测错误：从 ROB 中清除错误路径上的结果，并恢复到正确路径；
- 异常：在 commit 时处理，从而保证 precise exception。

:::TIP
Writeback 是“结果算完并写入 ROB”。  
Commit 是“这个结果正式成为程序可见状态”。  
这两个阶段不能混在一起。
:::

### ROB 记录什么

ROB 需要记录每条已经 issue 但尚未 commit 的指令。

常见字段包括：

| 字段 | 含义 |
|---|---|
| `No.` | ROB entry 编号，按照 issue 顺序分配 |
| `Busy` | 该 entry 是否被占用 |
| `Instruction` | 对应指令 |
| `Status` | 当前状态，如 Issue / EX / WB / Commit |
| `Dest / Object` | 最终要写的寄存器或内存位置 |
| `Value` | 已经算出的结果 |

Reservation Station Table 也要增加一个字段：

| 字段 | 含义 |
|---|---|
| `Dest` | 当前指令结果将写入哪个 ROB entry |

Register Status Table 变成记录：

```text
某个架构寄存器的最新值将由哪个 ROB entry 产生
```

例如：

```text
ROB[F0] = #3
```

表示 `F0` 的最新值将由 ROB 第 3 项产生。


### Example

`FMUL.D` 准备 commit 时的状态

继续使用六条指令：

```asm
FLD     F6, 34(R2)
FLD     F2, 45(R3)
FMUL.D  F0, F2, F4
FSUB.D  F8, F2, F6
FDIV.D  F10, F0, F6
FADD.D  F6, F8, F2
```

ROB ：

| No. | Busy | Instruction | Status | Dest / Object | Value |
|---:|---|---|---|---|---|
| 1 | no | `FLD F6, 34(R2)` | Commit | F6 | `Mem[34 + Regs[R2]]` |
| 2 | no | `FLD F2, 45(R3)` | Commit | F2 | `Mem[45 + Regs[R3]]` |
| 3 | yes | `FMUL.D F0, F2, F4` | WB | F0 | `#2 × Regs[F4]` |
| 4 | yes | `FSUB.D F8, F2, F6` | WB | F8 | `#1 - #2` |
| 5 | yes | `FDIV.D F10, F0, F6` | EX | F10 |  |
| 6 | yes | `FADD.D F6, F8, F2` | WB | F6 | `#4 + #2` |


Reservation Station Table ：

| Name | Busy | Op | Vj | Vk | Qj | Qk | Dest | A |
|---|---|---|---|---|---|---|---|---|
| Add1 | no |  |  |  |  |  |  |  |
| Add2 | no |  |  |  |  |  |  |  |
| Add3 | no |  |  |  |  |  |  |  |
| Mult1 | no | MUL | `Mem[45 + Regs[R3]]` | `Regs[F4]` |  |  | #3 |  |
| Mult2 | yes | DIV | `Mem[34 + Regs[R2]]` |  |  | #3 | #5 |  |



register status table ：

| Register | F0 | F2 | F4 | F6 | F8 | F10 | ... |
|---|---|---|---|---|---|---|---|
| ROB | #3 |  |  | #6 | #4 | #5 |  |
| Busy | yes | no | no | yes | yes | yes |  |

注意这里的关键现象：

- 第 4 条 `FSUB.D` 已经 WB；
- 第 6 条 `FADD.D` 也已经 WB；
- 但它们都不能 commit，因为第 3 条 `FMUL.D` 还没有 commit。

所以 ROB 把“乱序写回”重新整理成“顺序提交”。

### Hardware-Based Speculation 时序填写

同一组执行延迟下，加入 ROB 后，前面的 Issue / Execute / Writeback 和 Tomasulo 基本相同。区别在于多了 Commit 阶段。

最终表格为：

| Instruction | Issue | Exec Comp | Writeback | Commit |
|---|---:|---:|---:|---:|
| `FLD F6, 34(R2)` | 1 | 3 | 4 | 5 |
| `FLD F2, 45(R3)` | 2 | 4 | 5 | 6 |
| `FMUL.D F0, F2, F4` | 3 | 6–15 | 16 | 17 |
| `FSUB.D F8, F2, F6` | 4 | 6–7 | 8 | 18 |
| `FDIV.D F10, F0, F6` | 5 | 17–56 | 57 | 58 |
| `FADD.D F6, F8, F2` | 6 | 9–10 | 11 | 59 |


这个表最重要的结论是：

```text
In-order Issue / Commit,
Out-of-Order Execution / Writeback.
```

具体来看：

1. `FSUB.D` 为什么 WB 很早但 Commit 很晚 ？

`FSUB.D` 第 8 拍已经写回 ROB。

但它是第 4 条指令，前面的第 3 条 `FMUL.D` 要到第 17 拍才 commit，所以 `FSUB.D` 必须等到第 18 拍 commit。

2. `FADD.D` 为什么第 11 拍 WB，却第 59 拍 Commit ？

`FADD.D` 是第 6 条指令。它第 11 拍已经算完并写入 ROB。

但前面的第 5 条 `FDIV.D` 很慢，要到第 58 拍 commit。

因此 `FADD.D` 只能在第 59 拍 commit。

3. 这样做为什么能保证 precise exception ？

假设第 5 条 `FDIV.D` 发生异常。

虽然第 6 条 `FADD.D` 早在第 11 拍就已经算完，但它的结果只在 ROB 中，还没有正式写入架构寄存器。因此处理器可以丢弃第 6 条及之后的推测结果，让机器状态停在“第 5 条发生异常之前”的精确位置。

这就是 precise exception 的关键。

### 三种方法对比

| 方法 | Issue | Execute | Writeback | Commit / 完成 | WAR / WAW | 精确异常 |
|---|---|---|---|---|---|---|
| Scoreboard | 顺序 | 可乱序 | 可能因 WAR 等待 | 写回即完成 | 检测后等待 | 较难保证 |
| Tomasulo | 顺序 | 乱序 | 乱序 | 写回即完成 | 通过重命名消除 | 不能自然保证 |
| Tomasulo + ROB | 顺序 | 乱序 | 乱序 | 顺序 commit | 通过重命名消除 | 可以保证 |
