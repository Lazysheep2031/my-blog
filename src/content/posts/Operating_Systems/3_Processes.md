---
title: Processes
published: 2026-09-22
description: 进程概念与内存布局、进程状态与 PCB、进程调度、进程创建与终止，以及生产者—消费者和有界缓冲区
tags: [操作系统]
category: 笔记
draft: false
---

## Process Concept

### Process and Program

**进程（Process）是正在执行的程序。** 程序文件保存指令与数据；运行起来后，还需要记录执行到哪里、当前数据是什么、使用了哪些资源。

因此，理解一个进程要同时看：

- **程序代码**：要执行的指令。
- **执行状态**：程序计数器、CPU 寄存器的当前值等。
- **地址空间**：代码、全局数据、堆、栈等。
- **管理信息与资源**：进程状态、优先级、已打开的文件等。

同一个程序可以对应多个进程。例如，多个用户运行同一编辑器，程序代码可以相同，但各自的执行位置、输入数据和运行状态不同。

一个进程可以包含多个线程；线程是进程内的执行单元，多个线程共享进程的地址空间和资源，但各自有独立的执行状态。

### Process in Memory

进程的典型内存布局包含四部分：

- **代码段（Text Section）**：存放可执行指令。
- **数据段（Data Section）**：存放全局变量、静态变量等。
- **堆（Heap）**：存放运行时动态申请的内存，例如 `malloc()` 或 `new` 分配的对象。
- **栈（Stack）**：保存函数调用相关的信息，例如参数、返回地址和局部变量。

**程序计数器（Program Counter，PC）** 记录下一条待执行指令的地址，属于执行状态；它与上述四个内存区域的分类不同。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922162215.png" alt="Layout of a process in memory" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中低地址处是代码段、数据段，堆向高地址方向增长，栈向低地址方向增长。

#### Example

**Dynamic Allocation**

```cpp
class A {
public:
    const int a = 0;

    int getValue() {
        int *buffer = new int[1024];
        buffer[0] = a;
        // 使用 buffer 中的数据
        delete[] buffer;
        return 0;
    }
};
```

<details>
<summary>局部指针、动态数组、成员变量分别放在哪里？</summary>

- `getValue()` 的机器指令属于代码。
- `buffer` 是函数内的局部指针，按本章的典型布局可放在栈帧中；编译器也可能把它保存在寄存器中。
- `new int[1024]` 申请的 **1024 个整数所占空间在堆中**。指针变量和它指向的数组占用不同的存储位置。
- `delete[] buffer` 释放动态数组；函数结束时，其栈帧随调用返回而撤销。
- `a` 是对象的非静态成员，其存储位置随对象本身而定。仅凭 `const` 无法判断它一定属于某个内存段。

</details>

### Heap and Stack

**堆用于动态分配，栈用于组织函数调用。**

堆中的对象通常需要由程序显式释放，或由相应运行时回收。申请空间无法满足时会发生分配失败，例如 `malloc()` 返回空指针，普通 `new` 通常抛出异常。

每次函数调用会使用相应的**栈帧（Stack Frame）**，保存本次调用所需的信息。函数返回时撤销该栈帧。

- **压栈（Push）**：在栈顶加入数据并调整栈指针。
- **出栈（Pop）**：从栈顶取出数据并调整栈指针。
- **栈指针（Stack Pointer，SP）**：用于定位当前栈顶附近的位置，具体约定依体系结构而定。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922162741.png" alt="Stack" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

递归过深或局部对象过大可能耗尽可用栈空间，发生**栈溢出（Stack Overflow）**。动态内存需求过大可能造成**内存不足（Out of Memory）**。

#### Example

**Binary Heap**

二叉堆需要同时满足：

1. **结构性质**：是一棵完全二叉树，除最后一层外，其余各层都满；最后一层的结点从左到右排列，中间不能留空。
2. **堆序性质**：最大堆的父结点值不小于子结点；最小堆的父结点值不大于子结点。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922225404.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>三棵树，哪些满足最大堆条件？</summary>

- **(a) 满足。** 结构是完全二叉树，且 `9 ≥ 8, 4`，`8 ≥ 6, 2`，`4 ≥ 3`。
- **(b) 不满足。** 结点 `8` 缺少右孩子，但更右侧的结点 `4` 已有孩子，最后一层中间留空，违反完全二叉树要求。
- **(c) 不满足。** 父结点 `6` 小于孩子 `8`，违反最大堆的堆序要求。

</details>

### Process State

进程在执行过程中会在以下状态之间转换：

| 状态 | 含义 |
| --- | --- |
| **New** | 正在创建，系统还在建立必要的结构与资源 |
| **Ready** | 已具备运行条件，等待分配 CPU |
| **Running** | 正在 CPU 上执行指令 |
| **Waiting / Blocked** | 等待某个事件，例如 I/O 完成或子进程结束 |
| **Terminated** | 执行已经结束，系统进行资源回收与后续清理 |

**Ready 缺少 CPU；Waiting 还缺少继续执行所必需的事件。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922163406.png" alt="Process State Diagram" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

六条主要转换路径：

- **New → Ready**：系统完成必要准备，允许进程进入就绪队列。
- **Ready → Running**：被调度选中并获得 CPU。
- **Running → Ready**：时间片用完或被抢占，仍具备运行条件。例如时钟中断触发系统检查时间片，并在用完时重新调度。
- **Running → Waiting**：请求需要等待的 I/O，或等待其他事件。
- **Waiting → Ready**：所等待的事件发生，例如 I/O 完成。
- **Running → Terminated**：执行完成或被终止。

<details>
<summary>I/O 完成后为什么先进入 Ready？中断一定会让当前进程进入 Waiting 吗？</summary>

I/O 完成只说明等待条件已经满足。进程还要竞争 CPU，因此先进入就绪状态，被调度后才进入运行状态。

例如，P₁ 发出阻塞式磁盘读取后进入等待，CPU 可以运行 P₂；磁盘完成后发出中断，系统把 P₁ 放回就绪队列。P₂ 是否立刻让出 CPU，由调度策略决定。

中断到来时，当前进程可能随后继续运行，也可能被抢占。**只有出现该进程需要等待的条件时，才会进入等待状态。**

</details>

### Process Control Block

**进程控制块（Process Control Block，PCB）** 是操作系统为每个进程维护的管理数据结构，通常保存在受保护的内核内存中。

七类信息：

1. **进程状态(Process State)**：新建、就绪、运行、等待等。
2. **程序计数器(Program Counter)**：恢复后应从哪里继续执行。
3. **CPU 寄存器内容(Contents of CPU registers)**：通用寄存器、栈指针、状态寄存器等，用于保存执行现场。
4. **CPU 调度信息(CPU Scheduling Information)**：优先级、调度队列中的连接信息等。
5. **内存管理信息(Memory Management Information)**：基址与界限，或页表、段表等相关信息，依内存管理方式而定。
6. **记账与统计信息(Accounting Information)**：已使用的 CPU 时间、时间限制、账号等。
7. **I/O 状态信息(I/O Status Information)**：已分配的设备、打开的文件等。

进程被切走时，其寄存器现场会保存到内核维护的相应结构中，以便之后继续执行。这里的寄存器保存区是内存中的备份；进程运行时使用的是 CPU 中的实际寄存器，无需每执行一条指令就把所有寄存器同步写回 PCB。

<div style="display: flex; justify-content: center; align-items: center; gap: 16px;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922164757.png"
       alt="PCB"
       style="width: 420px; max-width: 48%; height: auto;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922164843.png"
       alt="PCB line"
       style="width: 420px; max-width: 48%; height: auto;" />
</div>

图的上半部分是内核中的 PCB，下半部分是各进程的用户地址空间。PCB 通过地址或指针关联相应内存与资源；**代码、堆、栈的全部内容不会被塞进 PCB。**

## Process Scheduling

### Process Scheduling Queues

操作系统把进程组织到不同队列中，进程随着状态变化在队列之间移动。

- **作业队列（Job Queue）**：表示系统中的全部进程集合。
- **就绪队列（Ready Queue）**：已在主存、具备运行条件并等待 CPU 的进程。
- **设备队列（Device Queue）**：等待某个 I/O 设备的进程；不同设备可以有不同队列。

更一般的**等待队列（Wait Queue）**还可以对应子进程结束等其他事件。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922165851.png" alt="job queue, ready queue, device queues" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

例如，图中的全部进程为 `1001–1005`，其中 `1001、1003、1005` 等待 CPU，`1002` 等待磁盘，`1004` 等待网卡。这里作业队列表示总集合，不能把这三个集合简单理解为互不相交的三份名单。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922170026.png" alt="Ready queue and I/O device queues linked through PCBs" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

队列通常通过 PCB 中的连接信息来组织。移动队列成员主要是在修改进程状态与管理结构，无需为了排队反复复制整个程序。

实际多核系统可以维护多个就绪队列，例如按 CPU 核心组织。

<details>
<summary>就绪队列与等待队列表示</summary>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922170039.png" alt="Ready queue and wait queues" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

同一类思想可以用“某设备的等待队列”，也可以用更一般的“某事件的等待队列”表达。

</details>

### Representation of Process Scheduling

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922170129.png" alt="Queueing-diagram representation of process scheduling" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

沿着一个进程的路径理解：

1. 进入就绪队列，等待 CPU。
2. 被选中后执行。
3. 若需要等待 I/O 或其他事件，进入相应等待队列；事件完成后重新进入就绪队列。
4. 若时间片用完，返回就绪队列。
5. 若程序结束，退出执行流程并由系统清理。

进程一生中可能多次重复“就绪 → 运行 → 等待 → 就绪”。

### Schedulers

**调度器（Scheduler）** 是操作系统中负责作出调度选择的程序。不同层次解决的问题不同：

| 调度器 | 主要决定 | 特点 |
| --- | --- | --- |
| **长期调度器（Long-term / Job Scheduler）** | 从待接纳作业中选择哪些进入内存参与运行 | 调用较少，控制接纳数量与进程组合 |
| **短期调度器（Short-term / CPU Scheduler）** | 从就绪进程中选择下一个使用 CPU 的进程 | 调用频繁，必须快速作出选择 |
| **中期调度器（Medium-term Scheduler）** | 暂时换出某些进程，并在适当时候换回 | 缓解内存压力，调整内存中的进程数量 |

**多道程序程度（Degree of Multiprogramming）** 指内存中参与多道运行的进程数量。长期调度决定接纳多少进程；中期调度可暂时降低这个数量。

**短期调度发生得更频繁，因此自身开销必须小**

<details>
<summary>调度器自身占用了多少时间？</summary>

假设每秒进行 10 次调度，每次运行调度代码耗时 10 μs，那么每秒用于这部分工作的时间为：

$$
10 \times 10\,\mu s = 100\,\mu s
$$

它占 1 秒的 `0.01%`。这是用于说明开销累积的假设值；同样的每次开销下，调度越频繁，总开销越大。

</details>

### Medium-Term Scheduling

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922171351.png" alt="Addition of Medium Term Scheduling" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**换出（Swap Out）**与**换入（Swap In）**：

- 内存紧张或需要调整进程组合时，将部分进程暂时移出内存中的竞争范围。
- 保存必要状态，之后在条件允许时重新装入并继续执行。

**中期调度中的换出，与时间片用完后从 Running 回到 Ready 是两类操作。** 普通抢占只让出 CPU，进程仍可留在内存中等待下一次调度。

### I/O-Bound and CPU-Bound Processes

**CPU 计算段（CPU Burst）** 是进程连续进行 CPU 计算、尚未转去等待 I/O 的一段执行。

- **I/O 密集型进程（I/O-bound）**：相对计算而言，更多时间用于 I/O，通常有**许多较短的 CPU 计算段**。例如频繁读取文件、等待网络数据后做少量处理。
- **CPU 密集型进程（CPU-bound）**：更多时间用于计算，通常有**较少但较长的 CPU 计算段**。例如长时间数值运算。

同一个程序的不同阶段也可能有不同特点：读取视频流涉及 I/O，之后解码涉及计算。

调度时希望形成合适的组合：一个进程等待 I/O 时，让其他进程使用 CPU，使处理器与设备尽量同时工作。若进程都频繁等待 I/O，CPU 可能空闲；若都长期占用 CPU，I/O 设备可能利用不足。

### Context Switch

**上下文切换（Context Switch）**：保存当前进程的执行现场，再恢复另一个进程的现场，使 CPU 能从它之前停下的位置继续执行。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922165013.png" alt="Diagram showing context switch from process to process" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

从 P₀ 切换到 P₁，可以沿图理解为：

1. 因中断、系统调用等原因进入内核，保存 P₀ 的 PC、寄存器等必要现场。
2. 更新 P₀ 的状态，调度器选择 P₁。
3. 恢复 P₁ 的寄存器现场及所需的地址空间信息。
4. 从 P₁ 保存的执行位置继续运行。

可以类比为**保存当前存档，再读取下一个存档**。
保存的是继续执行所需的状态，无需每次把进程的整个代码、堆和栈复制一遍。

**调度负责接下来运行谁，上下文切换负责把执行现场切换过去。**

切换期间系统忙于管理工作，没有推进这些进程的应用计算，所以切换时间属于额外开销。开销受硬件和系统实现影响；

<details>
<summary>发生系统调用或中断，就一定发生进程切换吗？</summary>

不一定。CPU 可以进入内核处理请求，再回到原进程。

- **模式切换**：用户态与内核态之间的切换。
- **进程上下文切换**：CPU 改为执行另一个进程，需要切换相应执行现场。

例如，P₀ 查询一项很快就能取得的信息，内核处理后仍可继续运行 P₀；P₀ 请求阻塞式 I/O 后需要等待时，系统则可以切换到其他就绪进程。

</details>

## Operations on Processes

### Process Creation

**父进程（Parent Process）** 可以创建**子进程（Child Process）**，子进程又可以继续创建其他进程，从而形成**进程树（Process Tree）**。

操作系统为进程分配**进程标识符（Process Identifier，PID）**。父子进程各有自己的管理信息和执行状态；

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922173030.png" alt="A tree of processes on a typical Solaris system" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

沿父子连线可以看到进程逐级创建；不同系统的实际进程名称和树形可以不同。

创建子进程时，需要区分三个方面：

1. **资源关系**：可共享全部资源、部分资源，或不共享相关资源，具体由创建方式与系统机制决定。
2. **执行关系**：父子可以并发执行；父进程也可以等待子进程完成后再继续。
3. **地址空间**：子进程可以取得父进程地址空间的副本，也可以装入新程序。

**并发执行不要求父子一定同时占用两个 CPU**；在单核上也可以交替推进。

### fork()

在 UNIX 风格的创建方式中，**`fork()` 创建一个新的子进程**。成功后，父子进程都会从本次 `fork()` 返回的位置继续执行。

```c
pid_t pid = fork();
```

$$ \boxed{ fork()= \begin{cases} <0 & \text{创建失败}\\ 0 & \text{当前是 Child}\\ >0 & \text{当前是 Parent，返回 Child PID} \end{cases}} $$
例如，父进程的实际 PID 为 `100`，新建子进程的实际 PID 为 `101`：父进程得到 `pid = 101`，子进程得到 `pid = 0`。

**子进程中的 `pid == 0` 是接口规定的返回值，其实际 PID 仍为 `101`。**

三个性质：

- 子进程从 `fork()` 返回处继续，**不会重新从 `main()` 第一行开始**。
- 普通数据在创建时被复制，之后父子各自修改自己的副本；同名变量不会因此自动共享。
- 父子谁先执行由调度决定，程序不能依赖固定先后顺序。

地址空间复制描述的是父子可观察到的数据语义；例如 Linux 可采用写时复制来减少立即复制物理页的开销。

### exec()

**`exec` 族用新程序替换当前进程的程序映像**，包括其代码与数据等。当前进程继续存在，PID 保持不变，随后开始执行新程序。

常见接口有 `execve()`、`execv()`、`execle()`、`execvp()`、`execlp()` 等。

```c
execlp("/bin/ls", "ls", (char *)NULL);
```

- `"/bin/ls"`：要执行的程序。
- `"ls"`：传给新程序的参数 `argv[0]`，通常写程序名。
- `(char *)NULL`：参数列表的结束标记。

**`fork()` 增加进程；`exec` 更换当前进程执行的程序。** 常见用法是在子进程中调用 `exec`，也可以直接在已有进程中调用。

#### Example

下面的 `printf()` 是否执行？

```c
execlp("/bin/ls", "ls", (char *)NULL);
printf("This is a child\n");
```

<details>
<summary>需要区分 exec 成功与失败</summary>

- **成功**：原程序映像被替换，调用不返回原程序，后面的 `printf()` 不执行。
- **失败**：返回 `-1`，原程序仍在，后面的语句可以继续执行。

</details>

### wait()

**`wait()` 用来等待子进程结束，并取得或回收相应退出信息。**

```c
int status;
pid_t child_pid = wait(&status);
```

正常取得结果时，返回值表示哪个子进程结束，`status` 接收其退出状态信息。若只需等待、无需取得状态，可以使用 `wait(NULL)`。

- 若没有已经结束、可供回收的子进程，但仍有尚未结束的子进程，父进程会阻塞等待。
- 若已有可回收的子进程，调用可以立即返回。
- **一次 `wait()` 取得一个子进程的退出信息。** 有多个子进程时，不能认为一次调用就等待了全部子进程。

父进程等待时不持续占着 CPU，其他就绪进程可以运行。子进程结束使等待条件满足后，父进程仍需得到 CPU 才能继续执行。

`wait()` 传递的是退出状态等信息，子进程打印的输出或任意计算结果不会自动成为它的返回值。

### Example

1. **fork(), exec(), and wait()**

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void)
{
    pid_t pid = fork();

    if (pid < 0) {
        perror("fork");
        return 1;
    } else if (pid == 0) {
        execlp("/bin/ls", "ls", (char *)NULL);

        // 只有 exec 失败才会到这里
        perror("execlp");
        _exit(1);
    } else {
        if (wait(NULL) < 0) {
            perror("wait");
            return 1;
        }
        printf("Child Complete\n");
    }

    return 0;
}
```

<details>
<summary>沿父进程与子进程两条路径分析</summary>

1. 开始时只有一个进程；调用 `fork()` 后，若成功，则得到父、子两条执行路径。
2. **子进程**收到 `0`，进入子分支，调用 `execlp()`。成功后，这个子进程开始运行 `ls` 并列出目录内容。
3. **父进程**收到子 PID，调用 `wait(NULL)`，等待这个例子中唯一的子进程结束。
4. 子进程结束后，父进程取得其退出记录，随后输出 `Child Complete`。

若 `exec` 失败，子进程输出错误信息，再通过 `_exit(1)` 结束。父进程使用 `wait(NULL)` 忽略了退出状态，所以 **`Child Complete` 只表示孩子已结束，并不证明 `ls` 执行成功**。

在调用成功的正常路径中，目录输出先完成，之后才出现 `Child Complete`。父子刚从 `fork()` 返回时的先后顺序仍不固定。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922230814.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

</details>


2. **Repeated fork()**

下面的程序会输出多少次 `hello`？

```c
#include <stdio.h>
#include <unistd.h>

int main(void)
{
    int i;
    for (i = 0; i < 3; i++) {
        fork();
    }
    printf("hello\n");
    return 0;
}
```

<details>
<summary>展开推导</summary>

假设所有 `fork()` 均成功，进程都正常执行到循环后的打印语句：

- 开始有 **1** 个进程。
- 每条执行路径完成 `i = 0` 的那次分叉后，累计对应 **2** 条路径。
- 完成 `i = 1` 的分叉后，对应 **4** 条路径。
- 完成 `i = 2` 的分叉后，对应 **8** 条路径。

每个进程执行一次循环外的 `printf()`，因此：

$$
\boxed{\text{输出次数} = 2^3 = 8}
$$

新创建的进程数为 `8 - 1 = 7`；整个运行过程中的 `fork()` 调用次数为 `1 + 2 + 4 = 7`。

子进程会取得创建当时的 `i`，然后从 `fork()` 返回处继续。例如在 `i = 1` 时创建的孩子，随后执行自己的 `i++`，再判断是否进入 `i = 2` 的循环。它不会回头重做 `i = 0`。

**每个进程有自己的 `i`，不存在所有进程共用一个循环变量的情况。** 上述“轮次”用于计数，操作系统并不保证所有进程按轮次同步执行。

</details>

### Process Termination

进程完成最后的工作后，可以通过退出机制请求系统终止自己。程序常使用 `exit(status)`，或从 `main()` 返回；运行库与内核配合完成退出处理。

退出时主要发生两件事：

- 操作系统回收进程使用的内存、文件等资源。
- 保留必要的退出状态等信息，供父进程通过 `wait()` 等接口获取。

父进程也可能请求终止孩子，例如子进程超出允许的资源使用量、任务已不再需要。课件中的 `abort` 表示这类终止操作，不应直接理解成一个接受子 PID 的 C 函数调用。

**父进程退出后，孩子如何处理取决于系统与具体机制：**

- 某些系统执行**级联终止（Cascading Termination）**，连同子孙进程一起结束。
- 另一些系统允许孩子继续运行，并为其重新建立托管关系。

<details>
<summary>孤儿进程与僵尸进程</summary>

- **孤儿进程（Orphan Process）**：父进程先退出，子进程仍在运行。系统可以由其他进程接管它，子进程仍在操作系统管理之中。
- **僵尸进程（Zombie Process）**：子进程已经结束，但退出记录还没有被回收。主要执行资源已释放，系统保留 PID、退出状态等少量信息，以便父进程查询。

这说明 `wait()` 的用途包括等待、取得退出状态和回收退出记录。父进程并非必须一直存活，操作系统也不会因为父进程先退出就“找不到孩子”。

</details>

## Cooperating Processes

### Independent and Cooperating Processes

**独立进程（Independent Process）** 的执行不通过共享数据等方式影响其他进程，也不依赖其他进程提供的数据。

**协作进程（Cooperating Process）** 可以通过数据交换等方式影响其他进程，或受到其他进程执行结果的影响。

进程合作的四个主要好处：

- **信息共享**：多个进程使用同一批信息。
- **计算加速**：把可拆分的工作交给多个执行单元并行处理。实际加速需要足够的并行资源，并考虑协调开销。
- **模块化**：按功能拆分系统，各模块承担相对独立的职责。
- **使用便利**：用户可以同时进行编辑、编译、浏览等多个相关活动。

### Producer–Consumer Problem

**生产者—消费者问题（Producer–Consumer Problem）** 是进程协作的典型模型：一个进程产生数据或任务，另一个进程取走并使用它们，中间通过缓冲区衔接。

缓冲区可以采用两种模型：

- **无界缓冲区（Unbounded Buffer）**：理想化地不限制容量，生产者不因缓冲区满而等待；消费者遇到空缓冲区仍需等待。
- **有界缓冲区（Bounded Buffer）**：容量固定，满时生产者需要等待，空时消费者需要等待。

“无界”是本问题的抽象条件，现实内存仍然有限。

### Bounded Buffer

**Shared Data**：

使用长度为 `10` 的环形数组，假定共享访问按所写顺序可见。

```c
#define BUFFER_SIZE 10

typedef struct {
    int value;  // 数据项的具体内容可按任务替换
} item;

item buffer[BUFFER_SIZE];
int in = 0;
int out = 0;
```

- `buffer`：保存已经生产、尚未消费的数据。
- `in`：**下一次写入的位置**，由生产者推进。
- `out`：**下一次读取的位置**，由消费者推进。

数组尾部的下一个位置回到开头：

$$
\text{next}(i) = (i + 1) \bmod \text{BUFFER\_SIZE}
$$

例如，长度为 `10` 时，位置 `9` 的下一个位置是 `(9 + 1) % 10 = 0`。

**`buffer`、`in`、`out` 都必须由双方共同访问。** 可以把两个进程各自虚拟地址空间中的相应区域映射到同一块物理内存。

**Empty and Full Conditions**：

本方案用两个下标区分状态，并始终预留一个空槽：

**空条件：**

```c
in == out
```

此时没有可供消费的数据。

**满条件：**

```c
(in + 1) % BUFFER_SIZE == out
```

$$
\boxed{\text{实际最大容量} = \text{BUFFER\_SIZE} - 1}
$$

长度为 `10` 的数组，在这一实现中最多存放 **9** 个尚未消费的数据项。

**Producer** ：

```c
while (true) {
    item next_produced = produce_item();

    while ((in + 1) % BUFFER_SIZE == out) {
        ;  // 缓冲区满，忙等
    }

    buffer[in] = next_produced;
    in = (in + 1) % BUFFER_SIZE;
}
```

执行顺序：**产生数据 → 等待有空位 → 写入当前位置 → 推进 `in`**。

必须先把数据写进 `buffer[in]`，再推进 `in`，这样消费者看到进度变化时，相应的数据才已准备好。

**Consumer** ：

```c
while (true) {
    while (in == out) {
        ;  // 缓冲区空，忙等
    }

    item next_consumed = buffer[out];
    out = (out + 1) % BUFFER_SIZE;

    consume_item(next_consumed);
}
```

执行顺序：**等待有数据 → 取出当前位置的数据 → 推进 `out` → 处理取出的数据**。

先把元素复制到 `next_consumed`，再释放这个槽位；后续处理自己的副本时，生产者已经可以重新利用该位置。

**Busy Waiting**：

两段代码中的内层空循环属于**忙等（Busy Waiting）**：条件不满足时，进程反复执行检查，消耗 CPU 时间。

**忙等与进程状态中的 Waiting 区别**：

- 忙等进程被调度到 CPU 上时，仍在执行循环指令，属于 Running；被抢占后可以回到 Ready。
- 阻塞等待时，操作系统将进程置于等待状态，暂停其执行，等待事件满足后再使其就绪。

在具有抢占调度的单核系统中，忙等进程仍可被时钟中断抢占，另一个进程仍有机会运行；其主要问题是浪费 CPU 时间。

#### Example

**Round Table**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260922174750.png" alt="Round Table: in = 0, out = 1, full with nine items" style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**当前为满状态，缓冲区中共有 9 项数据。**

<details>
<summary>为什么 in = 0、out = 1 表示满？下一步能做什么？</summary>

代入满条件：

$$
(in + 1) \bmod 10 = (0 + 1) \bmod 10 = 1 = out
$$

因此，有效元素按消费顺序位于 `1、2、…、9`；位置 `0` 是预留的空槽。

下一步：

1. 生产者暂时不能写入位置 `0`。
2. 消费者先读取 `buffer[1]`，将 `out` 更新为 `2`。
3. 这时 `(0 + 1) % 10 != 2`，生产者可以写入 `buffer[0]`，再把 `in` 更新为 `1`。
4. 此时 `in = 1、out = 2`，缓冲区再次达到满状态。

可以看到，**空槽随下标移动，并非永远浪费某个固定位置**。

</details>

<details>
<summary>从初始空状态，怎样走到这个状态？</summary>

初始为 `in = out = 0`：

1. 连续放入 9 项，写入位置 `0–8`，得到 `in = 9、out = 0`，缓冲区满。
2. 消费者取走位置 `0`，得到 `in = 9、out = 1`。
3. 生产者再写入位置 `9`，`in` 绕回 `0`，得到图中的 `in = 0、out = 1`。

这里下标大小无法直接表示数据多少，需要考虑回绕。对本方案，当前数据项数可写为：

$$
\text{count} = (in - out + N) \bmod N,\qquad N = \text{BUFFER\_SIZE}
$$

代入图中状态，得到 `(0 - 1 + 10) % 10 = 9`。

</details>
