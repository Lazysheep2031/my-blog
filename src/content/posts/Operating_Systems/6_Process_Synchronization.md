---
title: Process Synchronization
published: 2026-10-13
description: 竞争条件、临界区问题、Peterson 算法、硬件同步、信号量及其阻塞实现，以及有界缓冲区和读者—写者问题
tags: [操作系统]
category: 笔记
draft: false
---

## Background

### Why Synchronization Is Needed

**进程同步（Process Synchronization）** 要解决两类问题：**协调共享资源的访问**，以及**保证必要的执行先后关系**。

多个进程或线程并发运行时，调度可能在一段操作完成前切走当前执行者；多核上还可能真正同时访问共享数据。如果缺少约束，执行结果可能取决于偶然的交错顺序。

第五章关心接下来谁获得 CPU，本章进一步关心这些执行者怎样安全地合作。**改变调度算法并不能自动保证共享数据访问正确。**

不能为了避免竞争就把所有进程全部排成串行序列。应当只对必要的访问和依赖关系加约束，保留其他部分的并发能力。

### Producer–Consumer Revisited

回顾生产者—消费者问题：生产者向共享缓冲区放入数据，消费者从中取出数据。缓冲区大小为 $N$，每个位置存一个元素。

使用 `in`、`out` 区分空和满时，预留了一个位置。下面考虑增加 `count`，记录已占用位置数，使 $N$ 个位置都可以使用。

```c
int in = 0;
int out = 0;
int count = 0;
item buffer[N];
```

在下面的单生产者、单消费者示例中，生产者推进 `in`，消费者推进 `out`，二者都会更新 `count`。

**Producer**

```c
while (true) {
    nextProduced = produce_item();

    while (count == N)
        ;                       // 满时等待

    buffer[in] = nextProduced;
    in = (in + 1) % N;
    count++;
}
```

**Consumer**

```c
while (true) {
    while (count == 0)
        ;                       // 空时等待

    nextConsumed = buffer[out];
    out = (out + 1) % N;
    count--;

    consume_item(nextConsumed);
}
```

**这是一份用于暴露问题的代码，不能作为正确的并发解法。** 生产者与消费者分别看起来合理，但并发修改 `count` 时可能丢失更新。

### Race Condition

**竞争条件（Race Condition）**：多个执行者并发访问和修改共享数据，最终结果依赖具体的访问次序。

将 `count++`、`count--` 分解为三步，以说明高级语言的一条语句可能包含多个机器操作：

```text
生产者 count++                  消费者 count--

register1 = count                register2 = count
register1 = register1 + 1        register2 = register2 - 1
count = register1                count = register2
```

这是一个“读取—修改—写回”的示意。**重点在于整体缺少原子性，具体机器未必恰好使用三条指令。**

#### Example

初始 `count = 5`，生产者加一、消费者减一，正确最终结果应为 **5**。为什么会得到 4 或 6？

<details>
<summary>解答：逐步跟踪交错执行</summary>

| 步骤 | 执行的操作 | 内存中的 `count` |
| --- | --- | ---: |
| S0 | 生产者读取：`register1 = 5` | 5 |
| S1 | 生产者计算：`register1 = 6` | 5 |
| S2 | 消费者读取：`register2 = 5` | 5 |
| S3 | 消费者计算：`register2 = 4` | 5 |
| S4 | 生产者写回：`count = 6` | 6 |
| S5 | 消费者写回：`count = 4` | 4 |

消费者读取了尚未包含生产者更新的旧值，随后又覆盖了生产者的写回，最终得到 **4**。

如果只交换 S4、S5 的先后，生产者最后把 6 写回，最终结果就是 **6**。

若两个完整的加减操作依次执行，最终结果为 **5**。因此，“测试时偶尔得到 5”无法证明代码正确。

</details>

<details>
<summary>进程切换保存了寄存器，为什么仍然出错？</summary>

上下文切换能保存各执行者的寄存器状态。例如，生产者稍后恢复时，仍可找回自己算出的 6。

但**共享内存中的 `count` 没有因此变成各自独立的副本**。两边都能向同一位置写回旧计算结果，冲突依然存在。

所以，保存和恢复上下文保证任务能接着运行；共享数据的正确访问仍需要同步协议。

</details>

## The Critical-Section Problem

### Process Structure

**临界区（Critical Section）**是一段访问、更新共享数据，因而需要协调执行的**代码区域**。在本节的互斥模型中，访问同一受保护资源的这些临界区不能同时执行。

```text
while (true) {
    entry section       // 进入区：申请进入的权限
    critical section    // 临界区：执行受保护的访问
    exit section        // 退出区：释放权限
    remainder section   // 剩余区：执行其他操作
}
```

这里要区分：**共享变量或缓冲区是受保护对象，临界区是访问它们的代码。**

临界区的范围要“刚刚好”：必须覆盖需要共同保护的操作，但不宜把无关计算、生产和消费过程全部包进去。保护范围过大会降低并发度；漏掉关键更新则不能保证正确性。

### Three Requirements

临界区问题的正确解法需要满足三个条件：

1. **互斥（Mutual Exclusion）**：一个进程在相关临界区内执行时，其他进程不能同时进入相关临界区。
2. **进展（Progress）**：临界区空闲且有人申请时，不能无限期推迟选择下一位进入者；不打算进入的进程不能阻碍选择。
3. **有界等待（Bounded Waiting）**：一个进程提出进入请求后，在它获准进入前，其他进程进入相关临界区的次数必须有一个上界。

**互斥关心“不能一起进去”；进展关心“不能大家都进不去”；有界等待关心“不能让某一个申请者一直被插队”。**

<details>
<summary>为什么“有界等待”不能直接背成“最多等待固定几毫秒”？</summary>

假设各进程以非零速度执行，但不对它们的相对速度作假设。因此，不能仅凭协议中的次数上界就推出固定的实际时间上界。

前一章的 CPU 调度还可能影响进程多久才能获得运行机会。分析同步协议与分析调度饥饿时，要区分这两个层次。

</details>

## Peterson’s Solution

### Shared Variables and Assumptions

**Peterson 算法** 是一种两进程软件解法。用 $P_i$ 表示当前进程，$P_j$ 表示另一个进程，其中 $j=1-i$。

```c
bool flag[2] = {false, false};
int turn;                       // 初始可取 0 或 1
```

**`flag[i] = true`** 表示 $P_i$ 有进入意愿，且尚未完成本次退出；等待中的进程也会保持这个值。

**`turn`** 用于二者竞争时决定让谁先进入。它不能单独证明某进程此刻已经在临界区中。

假设共享变量的单次 LOAD、STORE 是原子的。下面的算法证明还采用按程序次序执行、共享读写按一致次序被观察的教学模型。

### Algorithm for Process Pi

```c
while (true) {
    flag[i] = true;              // 声明：我想进入
    turn = j;                   // 两者竞争时，先让对方

    while (flag[j] && turn == j)
        ;                       // 忙等待

    /* critical section */

    flag[i] = false;             // 本次退出，不再占用进入意愿

    /* remainder section */
}
```

$P_j$ 使用对称代码，将 `i`、`j` 交换。

等待条件由两部分共同组成：**对方也想进入，并且当前让对方先进入**。两者都成立，自己才等待。

```text
对方不申请：flag[j] == false → 可以进入
双方都申请：由 turn 决定谁等待、谁进入
自己退出：flag[i] = false → 解除对方可能的等待条件
```

用“谦让”解释 `turn = j`：先表达自己的进入意愿，再把同时竞争时的先行权让给对方。

### Correctness

<details>
<summary>互斥、进展和有界等待分别怎样满足？</summary>

**互斥。** 假设两个进程会同时处于临界区，则它们本轮的 `flag` 都为 `true`。考虑二者本轮中较晚的 `turn` 赋值，假设由 $P_i$ 执行 `turn = j`。

此时 $P_j$ 已声明进入意愿。只要 $P_j$ 尚未完成退出，它的 `flag[j]` 就保持为真，而 $P_i$ 的等待条件 `flag[j] && turn == j` 成立，无法越过等待进入临界区。因此，两者不能同时处于临界区。

**进展。** 只有 $P_i$ 申请时，`flag[j]` 为假，$P_i$ 可以进入。两者都在申请时，`turn` 只能取 `i` 或 `j`，至少有一方的等待条件为假，不会因为协议而让两者永远同时等待。

**有界等待。** $P_i$ 已申请且在等待时，$P_j$ 最多再进入一次。$P_j$ 退出会清除 `flag[j]`；即使它很快再次申请，也必须执行 `turn = i`，让持续申请的 $P_i$ 获得先行权。

因此，在该模型和正常执行假设下，另一进程的插队次数上界为 **1**。

</details>

### Example
**Setting Turn to Itself**

把“让对方先进入”改成“让自己先进入”，其余条件不变，是否仍然正确？

```c
/* Pi 的错误改法 */
flag[i] = true;
turn = i;
while (flag[j] && turn == j)
    ;
```

```c
/* Pj 的对称错误改法 */
flag[j] = true;
turn = j;
while (flag[i] && turn == i)
    ;
```

**结论：不能这样修改；可以构造破坏互斥的执行序列。**

<details>
<summary>代码推演：两个进程怎样都进入临界区？</summary>

初始两个 `flag` 都为 `false`。

```text
1. Pi：flag[i] = true
2. Pi：turn = i
3. Pi：检查到 flag[j] == false，通过 while，进入临界区
4. Pj：flag[j] = true
5. Pj：turn = j
6. Pj：检查 flag[i] && turn == i
        = true && false
        = false
   Pj 也通过 while，进入临界区
```

此时 $P_i$ 尚未退出，而 $P_j$ 已经进入，**互斥失效**。

</details>

## Synchronization Hardware

### Disabling Interrupts

单处理器上的思路：**在短小的受保护操作期间关闭中断，操作完成后恢复中断**，避免由中断引起的抢占使这些操作交错执行。

```text
保存并屏蔽相关中断 → 执行短小的受保护操作 → 恢复中断状态
```

适用边界很重要：

- 从**单处理器**情形讨论，受保护代码本身还不能在中间主动放弃执行。
- 多处理器上，只关闭当前 CPU 的中断，其他 CPU 仍可能访问同一共享数据。
- 长时间关闭中断会影响系统响应；把它扩展到多个 CPU 的协调也会带来较大代价。

因此，需要进一步考虑由硬件提供的原子读改写指令。

### TestAndSet Instruction

`TestAndSet` 的语义：**读出旧值，把目标设置为 `true`，返回旧值**，并把整个动作作为不可分割的操作完成。

```c
bool TestAndSet(bool *target)
{
    bool old = *target;
    *target = true;
    return old;
}
```

**这段 C 代码用于描述指令效果。** 几条普通 C 语句本身不会自动合成原子操作；算法依赖的是硬件或底层机制提供的原子保证。

使用共享变量 `lock`，初始为 `false`：

```c
bool lock = false;

while (true) {
    while (TestAndSet(&lock))
        ;

    /* critical section */

    lock = false;

    /* remainder section */
}
```

**第一次成功者**读到旧值 `false`，同时将 `lock` 置为 `true`，因返回值为假而通过循环。

**后来者**读到旧值 `true`，留在循环中等待。持有者退出时写入 `false`，之后才可能有另一个进程取得锁。

### Swap Instruction

另一种原子操作是 `Swap`，交换两个位置的值：

```c
void Swap(bool *a, bool *b)
{
    bool temp = *a;
    *a = *b;
    *b = temp;
}
```

同样，这只是语义描述，使用时必须保证整个交换具有原子性。

共享 `lock` 初始为 `false`；**每个进程有自己的局部变量 `key`**：

```c
while (true) {
    key = true;

    while (key == true)
        Swap(&lock, &key);

    /* critical section */

    lock = false;

    /* remainder section */
}
```

```text
锁空闲：lock = false，key = true
    交换后 lock = true，key = false → 当前进程通过循环

锁已占用：lock = true，key = true
    交换后仍都为 true → 当前进程继续等待
```

注意按代码跟踪时，**未取得锁的其他进程，其 `key` 保持为 `true`**。`key = false` 才表示这个进程的循环可以结束。

### Busy Waiting and Resource Multiplicity

以上简单实现都包含**忙等待（Busy Waiting）**：进程反复检查条件，在等待期间仍消耗 CPU 执行机会。这样的循环等待也称自旋。

**原子指令可以保证谁成功取得锁，却不自动保证每个等待者都能在有限次竞争后取得锁。**

若有多个独立可分配的资源实例，应允许相应数量的任务使用它们。一个布尔锁只表达“空闲／占用”，缺少资源数量信息。

**多个独立资源实例可以同时被使用；同一个需要互斥保护的临界资源，仍须满足互斥要求。**

## Semaphores

### Definition and Atomic Operations

**信号量（Semaphore）**具有一个整数值，除初始化外，通过两个标准原子操作访问：

**`wait(S)`／P 操作**：申请一个许可。没有可用许可时等待；成功取得后消耗一个许可。

**`signal(S)`／V 操作**：增加一个许可；在阻塞实现中，如有等待者，还需要唤醒相应进程。

用忙等待形式描述其基本语义：

```c
wait(S) {
    while (S <= 0)
        ;
    S--;
}

signal(S) {
    S++;
}
```

**检查是否可用与成功扣减必须受到原子性保护。** 不能让两个进程都看到同一个可用许可，然后都成功通过。

这段伪代码也不表示在整个等待期间独占底层保护：等待者必须允许别的进程执行 `signal()`，否则条件无法改变。

### Binary and Counting Semaphores

**二元信号量（Binary Semaphore）** 的抽象许可值只有 0、1，可以用来实现互斥。把它命名为 `mutex`：

```c
semaphore mutex = 1;

wait(mutex);
/* critical section */
signal(mutex);
```

初始为 1，允许第一个进程进入；它取得许可后，其余进程需要等待，直到许可被释放。

**计数信号量（Counting Semaphore）**用于表示多个可用许可，初始值通常设为可用资源实例数。

<details>
<summary>例子：有 5 块可独立分配的硬盘，信号量应怎样设置？</summary>

设置 `S = 5`。每个进程成功执行一次 `wait(S)` 后，取得一个资源实例。

五个许可都被占用后，第六个申请者等待。有进程用完后执行 `signal(S)`，便释放一个许可，使一个等待者有机会继续。

信号量控制“还能分配多少个”；程序仍需另外记录具体分配了哪一块硬盘。

</details>

### Enforcing Execution Order

信号量还可以跨进程使用，保证先后关系。例题要求：**$P_1$ 的语句 $S_1$ 完成后，$P_2$ 才能执行语句 $S_2$。**

```c
semaphore S = 0;
```

```c
/* P1 */
S1;
signal(S);
```

```c
/* P2 */
wait(S);
S2;
```

**初始值必须为 0。** 在 $S_1$ 完成并发出许可前，$P_2$ 无法越过 `wait(S)`。

<details>
<summary>例题解答：P1 先运行、P2 先运行，分别会怎样？初值为 1 行不行？</summary>

**P2 先到。** 它执行 `wait(S)` 时没有许可，因此等待。P1 完成 S1 并执行 `signal(S)` 后，P2 才可能继续执行 S2。

**P1 先到。** 它完成 S1 后发出许可。P2 随后执行 `wait(S)` 可以取得这个许可，因此也满足 S1 先于 S2。

**若初值改为 1。** P2 一开始就能通过 `wait(S)`，可能在 S1 尚未执行时完成 S2，先后约束失效。

这里保证的是两个指定语句的次序，不要求整个 P1 结束后才启动整个 P2。

</details>

P、V 操作通常成对出现。应追踪**一个许可由谁产生、由谁消耗**：互斥场景常在同一执行者中申请和释放；先后同步则可以由不同进程分别执行。

### Implementation Without Busy Waiting

让等待者反复自旋会浪费 CPU。阻塞式实现为每个信号量附带一个等待队列：

```c
typedef struct {
    int value;
    struct process *list;        // 等待该信号量的 PCB 队列
} semaphore;
```

类比 I/O 等待：等待硬盘或打印机的进程有对应队列，**等待一个信号量的进程，也可以进入该信号量自己的队列**。

```text
申请失败：Running → 该信号量的 Waiting Queue
释放许可：从 Waiting Queue 选出一个 → Ready Queue
再次获得 CPU：Ready → Running，继续执行
```

**唤醒只表示重新就绪，不保证立刻得到 CPU。** 是否立即运行，还要看调度器的选择。

#### Wait and Signal

阻塞式实现如下。将省略的字段归属补成 `S->value`、`S->list`，但仍属于算法伪代码：

```c
wait(semaphore *S) {
    S->value--;

    if (S->value < 0) {
        add_current_process_to(S->list);
        block();
    }
}
```

```c
signal(semaphore *S) {
    S->value++;

    if (S->value <= 0) {
        P = remove_one_process_from(S->list);
        wakeup(P);
    }
}
```

这里的细节不能与前面的忙等待版本混用：

**`wait` 先减，再检查 `< 0`。** 从 1 减到 0，表示刚好取得最后一个许可，可以继续；从 0 减到 −1，才表示当前申请者需要阻塞。

**`signal` 先加，再检查 `<= 0`。** 加后仍不大于 0，表示加之前存在未满足的申请，需要唤醒一个等待者。

在这个实现中，负值的绝对值表示等待队列中的进程数。不能把它解释为“有负数个真实资源”。

<details>
<summary>按实现推演：初值 1，三个进程先后申请，会出现哪些 value？</summary>

假设后续按 P1、P2 的顺序唤醒，且持有者最终都会释放：

```text
初始：             value = 1
P0 执行 wait：     1 →  0，取得许可
P1 执行 wait：     0 → -1，阻塞
P2 执行 wait：    -1 → -2，阻塞

P0 执行 signal：  -2 → -1，唤醒 P1
P1 执行 signal：  -1 →  0，唤醒 P2
P2 执行 signal：   0 →  1，无等待者需要唤醒
```

为什么 `signal` 的条件包含等号？因为 **−1 加到 0 时仍有一个等待者需要被唤醒**。写成 `< 0` 就会漏掉它。

被唤醒的进程恢复并完成原来的 `wait` 调用，不应在这套伪代码中再额外执行一次申请并重复扣减。

</details>

### Protecting the Semaphore Implementation

**信号量解决应用层的同步问题，但 `wait`／`signal` 自身仍然需要同步保护。**

至少要保护对 `value`、等待队列的操作，并协调“入队—阻塞”和“出队—唤醒”的交接，避免检查后尚未睡下就错过唤醒。

实现内部也可能需要忙等待，但应尽量限制在短小的内部操作中，避免让应用为了等待一个长临界区而持续自旋。

## Deadlock and Starvation

### Deadlock

**死锁（Deadlock）**：一组进程中的每个进程，都在等待只能由组内其他等待进程产生的事件，使这一组进程无法继续前进。

例题中，信号量 `S`、`Q` 初始都为 1：

```c
/* P0 */
wait(S);
wait(Q);
/* 使用资源 */
signal(S);
signal(Q);
```

```c
/* P1 */
wait(Q);
wait(S);
/* 使用资源 */
signal(Q);
signal(S);
```

<details>
<summary>例题解答：一种导致死锁的执行顺序</summary>

```text
P0：取得 S
P1：取得 Q
P0：申请 Q，等待 P1 释放
P1：申请 S，等待 P0 释放
```

两个进程都停在第二次 `wait`，后面的 `signal` 无法到达。即使代码中写了释放操作，也无法自动解除这个局面。

**由此例推导**：若两者都按先 S、后 Q 的同一顺序申请，就不会出现这个“各持一个、互等另一个”的交错。更一般的死锁处理留到后续章节。

</details>

### Starvation

**饥饿（Starvation）**表示某个进程无限期得不到所需的服务或许可，例如在信号量等待队列中长期未被选中。

死锁强调一组进程之间相互等待、共同无法前进；饥饿可以发生在系统仍有其他进程持续前进的时候。

公平的等待队列组织有助于避免反复插队，但不能从“使用了信号量”这一点直接推出有界等待。

## Classic Problems of Synchronization

两个经典问题：**有界缓冲区问题**与**读者—写者问题**。

### Bounded-Buffer Problem

#### Shared Data and Initial Values

有 $N$ 个缓冲位置，每个位置容纳一个元素。生产者不能向满缓冲区继续放入，消费者不能从空缓冲区取出，同时还需要保护共享缓冲区的更新。

标准方案使用三个信号量：

| 信号量 | 初始值 | 作用 |
| --- | ---: | --- |
| `mutex` | 1 | 互斥保护缓冲区及相应索引的修改 |
| `empty` | $N$ | 可供生产者申请的空位置许可 |
| `full` | 0 | 可供消费者申请的已有元素许可 |

```c
semaphore mutex = 1;
semaphore empty = N;
semaphore full = 0;

int in = 0;
int out = 0;
item buffer[N];
```

**`mutex` 解决“能否同时修改”；`empty`、`full` 解决“当前是否具备生产／取出条件”。** 两类职责不能合并成一句“给 buffer 上锁”。

#### Producer

下面把“add the item to the buffer”展开成前面环形缓冲区的写入方式：

```c
while (true) {
    nextProduced = produce_item();

    wait(empty);                // 先取得一个空位置许可
    wait(mutex);                // 再进入缓冲区修改区域

    buffer[in] = nextProduced;
    in = (in + 1) % N;

    signal(mutex);
    signal(full);               // 一个新元素可供消费者取出
}
```

次序是：**准备数据 → 等空位 → 互斥写入 → 释放互斥 → 发布新元素许可。**

#### Consumer

```c
while (true) {
    wait(full);                 // 先取得一个已有元素许可
    wait(mutex);

    nextConsumed = buffer[out];
    out = (out + 1) % N;

    signal(mutex);
    signal(empty);              // 归还一个空位置许可

    consume_item(nextConsumed);
}
```

次序是：**等元素 → 互斥取出 → 释放互斥 → 归还空位 → 处理取出的数据。**

两者构成交叉配合：

```text
生产者 wait(empty)  ←──────── 消费者 signal(empty)
生产者 signal(full) ────────→ 消费者 wait(full)
```

生产和消费的主要计算放在 `mutex` 外面。只要资源条件允许，它们就可以与其他任务重叠执行；必须串行保护的是共享缓冲区的关键更新。

#### Example

1. **Why Two Counting Semaphores?**

缓冲区内“空位置数＋已有元素数＝$N$”，为什么不能只使用一个 `count`？

<details>
<summary>计数值之外，还需要两种等待与通知关系</summary>

两个信号量各自表达一种**可以等待的条件**：

```text
empty：没有空位时，生产者等待；消费者取出后提供许可
full：没有元素时，消费者等待；生产者放入后提供许可
```

普通整数 `count` 只记录数值，没有自动阻塞和唤醒的能力。直接读写它还会回到本章最开始的竞争问题。

即使给 `count` 加互斥保护，还要继续设计“条件不满足时怎样等待”“谁负责通知”，并防止等待者持锁使对方无法改变条件。它不能直接替代标准方案中的两个信号量。

</details>

2. **Can the Two Wait Operations Be Swapped?**

<details>
<summary>根据代码推演：先 wait(mutex)，再 wait(empty)，可能怎样出错？</summary>

考虑缓冲区已满，生产者错误地执行：

```c
wait(mutex);
wait(empty);
```

它先取得 `mutex`，随后因没有空位置而阻塞，但仍持有 `mutex`。

消费者本来可以取走一个元素并释放空位，却需要先取得 `mutex`，于是也被阻挡：

```text
生产者持有 mutex，等待消费者提供空位
消费者需要 mutex，才能取出数据并提供空位
```

出现相互等待。

所以标准方案采用：**先等待资源条件，再申请保护实际修改的互斥许可。** 消费者也相应先 `wait(full)`，再 `wait(mutex)`。

</details>

#### Correctness and Concurrency

初始 `full = 0`，让消费者在没有数据时等待；初始 `empty = N`，允许生产者利用全部空位；`mutex = 1` 保证修改时只有一个进入者。

要保留合理并发度。**仅给所有操作套一个大锁，仍需另外解决空／满条件；若把等待也放在持锁区域，还可能产生死锁。** 不能单凭“只用了一个锁”就认定方案正确。

在满、空之间的中间状态，生产者和消费者都可能具备继续工作的条件。把数据生成与后续处理放在临界区外，能避免不必要的串行等待。

### Readers-Writers Problem

#### Access Rules

多个进程共享同一数据集，其中读者只读取，写者可以修改。访问规则是：

| 同时访问的组合 | 是否允许 |
| --- | --- |
| 读者与读者 | 允许 |
| 写者与读者 | 不允许 |
| 写者与写者 | 不允许 |

**读者可并发，写者要独占。** 这比“所有人共用一个互斥锁把整个访问过程串行化”保留了更多并发机会。

#### Shared Data

沿用变量名：

```c
semaphore mutex = 1;
semaphore wrt = 1;
int readcount = 0;
```

**`mutex`**：保护 `readcount` 的更新及首尾读者的判断。

**`wrt`**：协调写者之间，以及写者与一组读者之间的独占关系。这个许可既由写者使用，也由首尾读者使用。

**`readcount`**：登记加入本轮读者组的数量，是受保护的普通整数。它没有独立等待队列；本题的等待和通知由信号量完成。

#### Writer

```c
while (true) {
    wait(wrt);

    /* writing is performed */

    signal(wrt);
}
```

一个写者取得 `wrt` 后，其他写者以及尚未获准开始读取的读者组都不能进入数据访问阶段。

#### Reader

```c
while (true) {
    wait(mutex);
    readcount++;

    if (readcount == 1)
        wait(wrt);              // 首位读者代表整组申请访问权

    signal(mutex);

    /* reading is performed */

    wait(mutex);
    readcount--;

    if (readcount == 0)
        signal(wrt);            // 最后一位离开的读者释放访问权

    signal(mutex);
}
```

两个边界：

**首位读者进入时**，把 `readcount` 从 0 改为 1，并申请 `wrt`。取得许可后，整个读者组可以读取，写者被排除在外。

**最后一位读者离开时**，把 `readcount` 从 1 改为 0，释放 `wrt`，让等待的数据访问者有机会继续。

中间加入和离开的读者只更新计数，无需每人再申请一次 `wrt`。**`mutex` 没有覆盖实际 reading 阶段，所以多个读者能够同时读取。**

#### Example

**Two Readers and One Writer**

<details>
<summary>按算法推演：R1、R2 读数据，W 等待写入</summary>

```text
R1 进入：readcount 由 0 变 1，取得 wrt，开始读取
R2 进入：readcount 由 1 变 2，不再申请 wrt，也开始读取
W 申请：等待 wrt，暂时无法写入

R1 离开：readcount 由 2 变 1，不释放 wrt
R2 离开：readcount 由 1 变 0，释放 wrt
W 有机会取得访问权，开始写入
```

R1、R2 可以在读取阶段重叠。R1 离开时不能释放写入许可，因为 R2 仍在读取。

**谁先进入与谁最后离开可以是不同进程。** 第一位读者和最后一位读者分别替整个读者组取得、释放许可，这正是该方案的关键。

</details>

#### Why Readcount Also Needs Protection

`readcount++`、`readcount--` 同样是共享变量的读改写操作。如果不保护，多个读者可能丢失更新，进而错误判断“我是第一个”或“我是最后一个”。

即使真正的数据访问都是只读，**管理这些读者的计数仍然在被修改**，所以还需要 `mutex`。

<details>
<summary>第一位读者持有 mutex，等待 wrt，会不会必然死锁？</summary>

若已有写者在写，首位读者会在持有 `mutex` 的情况下等待 `wrt`。其他读者暂时卡在 `mutex`。

这不必然形成死锁，因为正在执行的写者完成后释放 `wrt`，**不需要先取得 `mutex`**。首位读者取得 `wrt` 后，继续执行并释放 `mutex`，其余读者才能完成登记。

一个写者在写、多个读者等候时，可能有一个读者等在 `wrt` 上，其余读者等在 `mutex` 上。

这也说明，首位读者执行 `readcount++` 后可能仍未真正开始读取。`readcount = 1` 不能单独证明数据读取已经发生。

</details>

#### Fairness Limitation

这一写法具有读者优先的特点。已有读者活动时，新的读者可以加入；等待中的写者可能一直等不到 `readcount` 归零，因此存在写者饥饿的可能。

所以，此算法实现了本题的访问互斥规则，但不能据此保证每个写者都有界等待。公平版本及其他变体不在本次讲授范围内。

## Solving Synchronization Problems

信号量题需要同时检查**结果正确性**和**并发程度**。写解法时可以按下面的次序组织：

1. **列清共享对象与约束**：谁修改哪些变量？哪些访问必须互斥？哪些语句有先后依赖？是否还存在空／满条件？
2. **给每个信号量写明含义和初值**：互斥许可常从 1 开始；等待尚未发生的事件从 0 开始；资源计数根据初始可用数量设置。
3. **确定最小且完整的保护范围**：把相关读改写和边界判断保护起来，无关计算尽量留在外面。
4. **用交错执行检查错误**：特别检查初始为空、初始为满、双方同时申请、首位／末位参与者，以及持有一个许可再等待另一个的情况。

最后再确认：**许可由谁产生、谁消耗；等待者是否阻塞了改变条件的人；唤醒后是否仍需等待 CPU；是否可能长期让某一方得不到机会。**
