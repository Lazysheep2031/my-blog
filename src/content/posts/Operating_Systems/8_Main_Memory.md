---
title: Main Memory
published: 2026-10-29
description: 地址绑定与重定位、交换、连续内存分配、分页与 TLB、多级和反向页表、分段，以及 Pentium 和 Linux 的内存管理
tags: [操作系统]
category: 笔记
draft: false
---

## Background

### Main Memory and Memory Hierarchy

**主存管理** 要解决三个问题：内存如何分配，程序地址如何转换，以及不同进程之间如何隔离。

程序保存在磁盘上，执行所需的指令和数据必须进入主存或寄存器，CPU 才能使用它们。寄存器访问快，主存访问需要更多时钟周期，因此在二者之间设置高速缓存。

```text
CPU 寄存器 → Cache → 主存 → 磁盘
             速度逐渐降低，容量通常逐渐增大
```

主存中同时存在操作系统和多个进程，需要硬件检查每次访问的合法性；不必让操作系统逐条执行软件检查。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106211501.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

内存计算统一按字节编址，使用二进制容量：$1\text{ KiB}=2^{10}\text{ B}$，$1\text{ MiB}=2^{20}\text{ B}$，$1\text{ GiB}=2^{30}\text{ B}$。

### Memory Hardware

存储器需要用可以区分的物理状态表示信息，例如磁化状态、电路状态、电荷或材料相态。

**磁芯存储器** 用磁芯保存信息。早期存储装置体积很大，容量却很小；一个保存 4K 个 32-bit 字的装置，其数据容量只有：

$$
4096\times32\text{ bit}=131072\text{ bit}=16\text{ KiB}.
$$

**半导体存储器** 包括 ROM、EPROM、RAM 等。EPROM 芯片、U 盘中的存储芯片和 DRAM 内存条，属于不同用途的存储器。

**相变存储器（Phase-Change Memory）与 3D XPoint** 是探索速度、容量和非易失性之间取舍的例子。


### Base and Limit Registers

在最简单的连续分配模型中，一个进程占据一整块连续物理内存。

**基址寄存器（Base Register）** 保存起始物理地址；**界限寄存器（Limit Register）** 保存可访问区域的长度。

设基址为 $B$，长度为 $L$，合法物理地址满足：

$$
B\le PA<B+L.
$$

**Limit 表示长度，结束边界是 Base + Limit。** 修改这些寄存器属于特权操作，由操作系统完成。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106211611.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

**Base = 300040，Limit = 120900，进程可以访问哪些物理地址？**

<details>
<summary>地址范围与边界检查</summary>

$$
300040\le PA<300040+120900=420940.
$$

合法范围为 **300040～420939**。地址 420940 已经越界。

</details>

如果进程通过 `new` 申请更多空间，而相邻区域已被其他进程占用，就很难直接扩大原来的连续区域。这也是后面引入分页的原因。

### Address Binding

**地址绑定（Address Binding）** 将一种地址表示映射为另一种地址表示。

例如，源代码中的变量名 `count` 可以先变为“模块起点后第 14 个字节”，再绑定到具体地址 74014。

绑定可以发生在三个阶段：

**编译时绑定（Compile Time）**：编译时已经知道程序的驻留位置，可以生成绝对地址代码。起始位置改变时，需要重新编译。固定装入位置的早期启动代码可以帮助理解这种方式。

**装入时绑定（Load Time）**：编译时不知道最终位置，先生成可重定位代码，装入内存时确定地址。更换装入位置时，重新装入并完成重定位。

**执行时绑定（Execution Time）**：运行期间仍允许改变物理位置，每次访问时由硬件完成地址映射，需要 MMU 等硬件支持。

### Multistep Processing of a User Program

```text
源程序
  ↓ 编译／汇编
目标模块
  ↓ 与其他目标模块、库进行链接
可执行文件
  ↓ 装入
内存中的程序
  ↓ 执行
```

编译器把源程序转换为目标代码；链接器组合模块并处理符号引用；装入器建立运行所需的内存映像。

**链接解决模块之间如何连接，装入解决程序如何进入执行环境。** 动态链接还允许将部分链接工作留到运行阶段。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106211648.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Logical vs. Physical Address Space

**逻辑地址（Logical Address，也称虚拟地址）**：CPU 执行程序时产生的地址。

**物理地址（Physical Address）**：内存单元实际使用的地址。

一个程序能够产生的逻辑地址组成逻辑地址空间，对应的物理地址组成物理地址空间。

在编译时或装入时完成物理地址绑定的简单模型中，两者相同；执行时绑定则允许逻辑地址与物理地址不同。程序使用逻辑地址，硬件负责完成映射。

### Memory-Management Unit

**内存管理单元（Memory-Management Unit，MMU）** 完成运行时地址转换。

最简单的动态重定位方式是给逻辑地址加上重定位寄存器中的基址：

$$
PA=B+LA.
$$

若同时使用长度 $L$ 保护地址空间，则先检查：

$$
0\le LA<L.
$$

合法后再加基址；越界则陷入操作系统。

```text
逻辑地址 LA → 检查 LA < Limit → 加 Base → 物理地址 PA
                    ↓ 不满足
                 地址异常
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106211728.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

**重定位寄存器为 14000，CPU 访问逻辑地址 346。**

<details>
<summary>地址转换与进程移动</summary>

$$
PA=14000+346=14346.
$$

程序内部仍然保存和使用地址 346。只有真正访存时，硬件才把它转换为 14346。

如果进程被搬到另一个物理位置，更新重定位信息即可保持原来的逻辑地址有效。

</details>

### Dynamic Loading

**动态装载（Dynamic Loading）**：子程序被调用时才装入内存，未使用的子程序不占用主存。

适合包含大量低频功能的程序，例如异常处理代码。

### Dynamic Linking

**动态链接（Dynamic Linking）**：将链接工作推迟到运行时，常用于共享库。

调用位置先保留一小段 **桩代码（Stub）**，负责找到目标库函数；解析完成后，后续调用可以直接使用得到的地址。

```text
调用库函数 → 通过桩代码定位函数 → 必要时装入库 → 执行函数
```

多个进程可以共享同一份库代码，减少可执行文件和内存中的重复副本。兼容的库更新也可以避免重新链接所有应用。

## Swapping

### Swap Out and Swap In

**交换（Swapping）** 将进程暂时移到后备存储，需要继续执行时再调回主存。

- **换出（Swap Out）**：主存 → 后备存储，释放主存空间。
- **换入（Swap In）**：后备存储 → 主存，恢复执行条件。

后备存储需要容纳内存映像，并支持直接访问这些映像。系统还要保留进程状态和恢复所需的信息。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106211911.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中的过程是：$P_1$ 换出，腾出主存；$P_2$ 换入，获得执行机会。**换出不会终止进程**，它只是暂时失去驻留在主存中的条件。

优先级调度可以使用 **Roll Out / Roll In**：先换出低优先级进程，让高优先级进程进入内存运行。

### Cost and Relocation

交换的主要开销来自数据传输。忽略定位等固定开销时：

$$
T_{\text{swap}}\approx\frac{M_{\text{out}}}{R_{\text{out}}}+\frac{M_{\text{in}}}{R_{\text{in}}}.
$$

交换量越大，传输时间越长。频繁换入换出会让大量时间花在 I/O 上。

<details>
<summary>进程换回来时，必须放回原来的物理位置吗？</summary>

取决于地址绑定方式。

已经绑定到固定物理位置的代码需要保持原有地址关系；采用执行时动态重定位，可以装入不同位置，并更新映射信息。

正在参与 I/O 的区域还需要单独处理，避免设备继续向旧位置读写。

</details>

### Swapping with Paging

整进程交换搬运的是整个内存映像。分页交换可以只换出某些页面，需要访问时再换入，减少每次搬运的数据量。

交换空间利用磁盘缓解主存压力，但磁盘访问仍明显慢于主存。**交换是在容量和性能之间作取舍，不能把交换空间看成等速增加的 RAM。**

## Contiguous Memory Allocation

### Memory Layout and Protection

**连续内存分配（Contiguous Allocation）** 要求每个进程占据一整块连续的物理地址区域。

一种典型布局是：低地址区域保存操作系统及中断向量，较高地址区域分配给用户进程。

动态重定位采用：

$$
0\le LA<L,\qquad PA=B+LA.
$$

如果检查的已经是物理地址，则等价地检查：

$$
B\le PA<B+L.
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212007.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Multiple-Partition Allocation

**空洞（Hole）** 是尚未分配的连续内存区域。进程到达时，从足够大的空洞中划出一部分；进程退出后归还空间，相邻空洞可以合并。

操作系统需要记录已分配区域和空闲区域。

#### Example

**进程 8 退出后，空闲空间如何变化？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212027.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>分配与释放过程</summary>

最初依次存放操作系统、进程 5、进程 8、进程 2。

进程 8 退出，留下空洞。进程 9 使用其中一部分，进程 10 再使用剩余部分，空洞不断缩小。

如果接下来有一个与原进程 8 同样大的进程 11，就可能无法放入剩余区域。动态创建、退出和扩展内存，会使空洞大小不断变化。

**空闲总量足够，不保证存在足够大的单个连续空洞。**

</details>

### Dynamic Storage-Allocation Problem

面对大小为 $n$ 的请求，从空闲块列表中选哪一块？

**首次适应（First-Fit）**：按搜索顺序选择第一个足够大的空洞，找到后立即停止。

**最佳适应（Best-Fit）**：选择能够容纳请求的最小空洞，使本次分配留下的空洞最小。若未按大小组织，需要搜索整个列表。

**最坏适应（Worst-Fit）**：选择最大的空洞，希望剩余部分仍足够大，可以继续使用；同样需要找到全局最大值。

最佳适应可能留下许多很小的空洞；最坏适应可能提前消耗大块空间。

<details>
<summary>First-Fit 的平均搜索次数一定是空洞数的一半吗？</summary>

不一定。平均搜索长度取决于空洞大小、排列顺序和请求大小的分布。

设有 $H$ 个空洞，使用普通线性列表时，三种算法的最坏搜索时间都是 $O(H)$。

</details>

#### Example

**连续申请多个内存块。**

空闲块按地址顺序为：

$$
300,\ 600,\ 350,\ 200,\ 750,\ 125\text{ KiB}.
$$

进程依次申请：

$$
115,\ 500,\ 358,\ 200,\ 375\text{ KiB}.
$$

分别用三种算法分配，每次成功分配后保留剩余空洞。

<details>
<summary>分配结果与剩余空间</summary>

用 1～6 表示原来的六个空闲块，后续从某块的剩余部分分配时仍沿用其编号。

| 算法 | 五次请求对应的空闲块编号 | 最终剩余大小（KiB） |
| --- | --- | --- |
| 首次适应 | 1、2、5、3、5 | 185、100、150、200、17、125 |
| 最佳适应 | 6、2、5、4、5 | 300、100、350、0、17、10 |
| 最坏适应 | 5、5、2、3、失败 | 300、242、150、200、135、125 |

例如最坏适应先从 750 中分配 115，剩 635；再从 635 中分配 500，剩 135。最后虽然空闲总量仍足够，却没有一个空洞能容纳 375。

</details>

### Fragmentation

**外部碎片（External Fragmentation）**：空闲空间分散在已分配区域之间，空闲总量足够，但缺少满足请求的连续区域。

**内部碎片（Internal Fragmentation）**：已经分配给进程的空间大于实际需求，多出来的部分位于分配块内部，不能直接再分配给其他进程。

**尚未分配的零散空洞属于外部碎片；已分配块内部的空余属于内部碎片。**

### Compaction

**紧缩（Compaction）** 通过移动内存中的内容，将分散空洞合并成一块大的连续空间。

```text
紧缩前：OS | 进程 A | 空洞 | 进程 B | 空洞 | 进程 C | 空洞
紧缩后：OS | 进程 A | 进程 B | 进程 C |        大空洞
```

移动进程会改变物理位置，因此需要执行时动态重定位。紧缩还涉及大量数据复制，成本较高。

I/O 是另一个限制：如果设备正在向某个物理位置写入，不能随意搬走对应区域。可以暂时固定参与 I/O 的内存，或让 I/O 先经过操作系统缓冲区。

紧缩主要处理外部碎片。另一条思路是允许进程使用 **不连续的物理内存**，即后面的分页。

## Paging

### Pages and Frames

**分页（Paging）** 将逻辑地址空间划分为固定大小的页（Page），将物理内存划分为相同大小的页框（Frame）。

一个逻辑页可以放到任意空闲页框中，进程的各页不必在物理内存中连续。

基本分页模型中，运行一个 $n$ 页的程序，需要找到 $n$ 个空闲页框，并建立对应的页表。页大小通常取 2 的幂，便于按位拆分地址。

### Address Translation Scheme

设逻辑地址共 $m$ 位，页大小为 $S=2^n$ 字节：

$$
LA=\underbrace{p}_{m-n\text{ 位}}\ \underbrace{d}_{n\text{ 位}}.
$$

$p$ 为页号，$d$ 为页内偏移：

$$
p=\left\lfloor\frac{LA}{S}\right\rfloor,\qquad d=LA\bmod S.
$$

页表以 $p$ 为索引，查到页框号 $f$，再形成物理地址：

$$
\boxed{PA=fS+d}.
$$

```text
逻辑地址 (p, d)
      ↓ 用 p 查页表
得到页框号 f
      ↓ 保留 d
物理地址 (f, d)
```

**转换改变页号，页内偏移保持不变。** 页框号与页框起始地址也要区分：后者等于 $fS$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212214.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Example

1. **四个逻辑页分散到不同物理页框。**

页表映射为：

```text
页号：   0  1  2  3
页框号： 1  4  3  7
```

逻辑页 0、1、2、3 连续编号，分别放在物理页框 1、4、3、7。程序仍按自己的逻辑地址访问，物理布局由页表隐藏。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212232.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

2. **16 字节逻辑空间、32 字节物理内存，页面大小为 4 字节。**

逻辑地址 0～15 依次保存 `a`～`p`，页表为：

| 页号 | 页框号 | 逻辑地址范围 | 物理地址范围 |
| --- | --- | --- | --- |
| 0 | 5 | 0～3 | 20～23 |
| 1 | 6 | 4～7 | 24～27 |
| 2 | 1 | 8～11 | 4～7 |
| 3 | 2 | 12～15 | 8～11 |

计算逻辑地址 0、3、4、13 对应的物理地址。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212252.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>页号、偏移和物理地址</summary>

$S=4$，页内偏移占 2 位。逻辑页数为 4，逻辑地址共 4 位；物理页框数为 8，物理地址共 5 位。

- $LA=0$：$p=0,d=0,f=5$，$PA=5\times4+0=20$。
- $LA=3$：$p=0,d=3,f=5$，$PA=5\times4+3=23$。
- $LA=4$：$p=1,d=0,f=6$，$PA=6\times4+0=24$。
- $LA=13$：$p=3,d=1,f=2$，$PA=2\times4+1=9$。

访问同一页时只改变偏移；跨页后，物理地址可能跳到不相邻的页框。

</details>

### Free Frames

操作系统维护空闲页框列表，分配后把对应页框号写入进程页表。

#### Example

**空闲列表为 `[14, 13, 18, 20, 15]`，新进程需要四页。**

<details>
<summary>分配后的页表和空闲列表</summary>

```text
page 0 → frame 14
page 1 → frame 13
page 2 → frame 18
page 3 → frame 20

剩余空闲列表：[15]
```

页框可以按空闲列表顺序分配，不要求它们在物理内存中相邻。

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212316.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Internal Fragmentation and Page Size

设进程需要 $N$ 字节、页大小为 $S$：

$$
\text{分配页数}=\left\lceil\frac NS\right\rceil,\qquad
\text{内部碎片}=\left\lceil\frac NS\right\rceil S-N.
$$

对一个连续大小的分配，未满部分位于最后一页，最多为 $S-1$ 字节。在末页占用近似均匀的估算下，平均浪费约半页。

**页小**：内部碎片较少，页表项较多。**页大**：页表较小、批量传输有利，但内部碎片可能增多。

#### Example

**页面大小为 2048 字节，进程大小为 72766 字节。**

<details>
<summary>计算页框数与内部碎片</summary>

$$
72766=35\times2048+1086.
$$

需要 36 个页框，最后一页使用 1086 字节：

$$
\text{内部碎片}=2048-1086=962\text{ B}.
$$

</details>

### Hardware Implementation of Page Table

页表较小时可以用高速寄存器实现；页表较大时，通常放在主存中。

**页表基址寄存器（PTBR）** 指向当前页表。**页表长度寄存器（PTLR）** 表示页表大小；以表项数表示时，合法页号满足 $0\le p<PTLR$。

在线性页表中，设每个页表项占 $E$ 字节：

$$
\text{PTE 地址}=PTBR+pE.
$$

**这里算出的是页表项的位置，读取表项后才得到数据所在的页框。**

进程切换时，需要恢复新进程的页表信息，才能把相同的逻辑地址解释到正确的物理位置。

若页表和数据都在主存中，一次访问需要：

```text
第一次访存：读取页表项，取得页框号
第二次访存：读取目标指令或数据
```

这就是两次访存问题。此处只考虑单级页表，不计其他缓存。

### Translation Lookaside Buffer

**快表（Translation Lookaside Buffer，TLB）** 缓存近期使用的地址映射。其基本表项包含页号和页框号，使用关联查找，可以并行比较候选项。

TLB 保存地址转换信息，数据 Cache 保存指令或数据内容，二者用途不同。

**命中**：从 TLB 直接得到页框号，访问目标数据，不必再读取主存页表。

**未命中**：查主存中的页表，取得映射后通常填入 TLB，再访问目标数据；TLB 满时需要替换表项。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212404.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>TLB Miss 是否意味着页面不在内存中？</summary>

不意味着。它只说明快表中没有所需映射；页表仍可能记录一个已经驻留的物理页框。

缺页处理还要检查页面状态，不能把一次普通的 TLB 未命中直接算成磁盘 I/O。

</details>

### Address-Space Identifiers

不同进程可能使用相同的虚拟页号，TLB 需要区分映射属于哪个地址空间。

**地址空间标识（ASID）** 与页号共同标识一条映射。带 ASID 的表项可以在进程切换后继续保留；没有相应区分机制时，切换地址空间通常需要清除旧映射。

### Effective Access Time

设 TLB 查询时间为 $t$，一次主存访问为 $m$，命中率为 $\alpha$。采用串行查询、单级页表、无缺页的模型：

$$
T_{\text{hit}}=t+m,\qquad T_{\text{miss}}=t+2m.
$$

**有效访问时间（Effective Access Time，EAT）** 是两条路径的加权平均：

$$
\begin{aligned}
EAT
&=\alpha(t+m)+(1-\alpha)(t+2m)\\
&=\boxed{t+(2-\alpha)m}.
\end{aligned}
$$

当一次主存访问为 $1\ \mu s$，TLB 查询时间记为 $\epsilon\ \mu s$：

$$
\boxed{EAT=\alpha(1+\epsilon)+(1-\alpha)(2+\epsilon)
=2+\epsilon-\alpha\quad(\mu s)}.
$$

#### Example

**$m=200\text{ ns}$，$t=20\text{ ns}$，命中率为 95%。**

<details>
<summary>按命中与未命中分别计算</summary>

$$
T_{\text{hit}}=220\text{ ns},\qquad T_{\text{miss}}=420\text{ ns}.
$$

$$
EAT=0.95\times220+0.05\times420=230\text{ ns}.
$$

不使用 TLB 时为 $2m=400\text{ ns}$。使用 TLB 后仍需要实际访问数据，命中时间不能只算查询 TLB 的 20 ns。

</details>

<details>
<summary>TLB 带来净收益，需要满足什么条件？</summary>

在上述串行模型中：

$$
t+(2-\alpha)m<2m
\quad\Longleftrightarrow\quad
\alpha>\frac tm.
$$

固定 $t,m$ 时，命中率越高，EAT 越低。

</details>

### Memory Protection

页表项除了页框号，还可以保存访问权限和有效信息。

**保护位** 限制页面能否读、写或执行。向只读页面写入，会触发保护异常。

**有效—无效位（Valid–Invalid Bit）** 在这里表示页面是否属于进程的合法逻辑地址空间：`v` 为合法页，`i` 为非法页。后续按需分页还涉及页面是否驻留，两种判断需要区分。

#### Example

**程序只使用逻辑地址 0～10468，页大小为 2 KiB，逻辑空间共 14 位。**

页表中 0～5 页为有效页，对应页框 `[2, 3, 4, 7, 8, 9]`；6、7 页无效。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212441.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>为什么页级保护不能精确限制到最后一个字节？</summary>

第 5 页的范围是：

$$
[5\times2048,\ 6\times2048-1]=[10240,12287].
$$

程序使用到 10468，但整页都标为有效，因此仅靠有效位无法区分 10469～12287 这一段末页空余空间。

第 6、7 页对应 12288～16383，访问时会因无效页表项而被拒绝。

</details>

### Shared Pages

多个进程的页表项可以指向同一物理页框，实现共享。

只读的可重入代码在执行中不修改自身，可以共享一份副本；每个进程仍保留自己的数据和运行状态。

#### Example

**三个编辑器进程共享代码，保留独立数据。**

```text
逻辑页内容： ed1  ed2  ed3  data
P1 页表：     3    4    6    1
P2 页表：     3    4    6    7
P3 页表：     3    4    6    2
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212513.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>哪些内容共享？能节省多少页框？</summary>

三个进程的前三个页表项都指向页框 3、4、6，共享一份编辑器代码。

数据页分别放在页框 1、7、2，保持独立。

不共享时需要 $3\times4=12$ 个页框；共享后需要 $3+3=6$ 个页框，节省 6 个页框。

</details>

## Structure of the Page Table

### Hierarchical Page Tables

虚拟地址空间很大时，完整线性页表本身也很大，而且很多表项根本没有对应的已使用页面。

**层次页表（Hierarchical Page Table）** 把页表拆成多个较小的表，再用上一级页表记录它们的位置。没有使用的虚拟地址区域，可以不创建对应的下级页表。

二级页表把逻辑地址拆为：

$$
LA=(p_1,p_2,d).
$$

$p_1$ 索引外层页表，得到内层页表的位置；$p_2$ 索引该内层页表，得到目标页框号；$d$ 为数据页内偏移。

```text
p1 → 外层页表 → 内层页表基址
                         ↓ 用 p2 查表
                      数据页框号 f
                         ↓ 与 d 组合
                      物理地址
```

**外层表项指向下一级页表，最内层表项才指向数据页框。** 下级页表之间不必连续存放。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212531.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

设外层页表基址为 $B_1$，两级表项大小分别为 $E_1,E_2$：

$$
A_1=B_1+p_1E_1.
$$

读取外层表项，取得内层页表基址 $B_2$；再读取：

$$
A_2=B_2+p_2E_2.
$$

得到数据页框号 $f$ 后：

$$
PA=fS+d.
$$

如果表项保存的是下级页表的页框号，需先乘页大小，才能得到它的基址。

#### Example

1. **32-bit 逻辑地址，页大小为 1 KiB，采用 $12:10:10$ 的二级地址划分。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212546.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>页号拆分，以及哪些条件可以直接推出</summary>

页大小为 $2^{10}$ 字节，因此：

$$
d=10\text{ 位},\qquad \text{总页号位数}=32-10=22.
$$

本例进一步指定：

$$
\boxed{p_1:p_2:d=12:10:10}.
$$

外层有 $2^{12}$ 项，每张内层页表有 $2^{10}$ 项，共覆盖：

$$
2^{12}\times2^{10}=2^{22}\text{ 个虚拟页}.
$$

**本例没有给出页表项的字节数，不能由这个拆分推断页表项为 1 字节。**

若另加条件“每张内层页表占一页、PTE 为 4 字节”，则一张 1 KiB 表只能放 $1024/4=256=2^8$ 项，相应划分应为 $14:8:10$。这属于另一组条件。

</details>

2. **按 $4:4:12$ 划分地址，转换 `0x01ABC` 和 `0xFEED0`。**

外层第 `0` 项指向页框 `0x3` 中的页表，该表第 `1` 项指向数据页框 `0x23`。

外层第 `F` 项指向页框 `0x92` 中的页表，该表第 `E` 项指向数据页框 `0x55`。

<details>
<summary>十六进制地址转换</summary>

每个十六进制位对应 4 个二进制位，可以直接拆分：

```text
0x01ABC → p1 = 0，p2 = 1，d = 0xABC
0xFEED0 → p1 = F，p2 = E，d = 0xED0
```

偏移为 12 位，页大小为 $2^{12}=0x1000$ 字节。

第一条路径：

$$
0\to\text{页框 }0x3\text{ 中的页表}\to\text{第 1 项}\to f=0x23.
$$

$$
PA=0x23\times0x1000+0xABC=\boxed{0x23ABC}.
$$

第二条路径：

$$
F\to\text{页框 }0x92\text{ 中的页表}\to\text{第 E 项}\to f=0x55.
$$

$$
PA=0x55\times0x1000+0xED0=\boxed{0x55ED0}.
$$

`0x3`、`0x92` 是页表所在的页框号，`0x23`、`0x55` 才是目标数据所在的页框号。

</details>

<details>
<summary>若只有三个页面被使用，且分布在两张内层页表中，需要多少表项？</summary>

完整单级页表需要：

$$
2^{4+4}=256\text{ 项}.
$$

二级页表需要一张外层表和两张内层表：

$$
2^4+2\times2^4=\boxed{48\text{ 项}}.
$$

节省来自 **不创建没有用到的内层页表**。已经创建的表，即使只有少数有效项，仍然要保留整张表的空间。

</details>

### Three-Level Paging Scheme

对于 64-bit 虚拟地址和 4 KiB 页面，偏移为 12 位，虚拟页号共有 52 位。

取每张内层页表 $2^{10}$ 项，可以先划分为：

$$
42:10:12.
$$

若每项 4 字节，外层表需要：

$$
2^{42}\times4=2^{44}\text{ B}=16\text{ TiB}.
$$

继续把外层表分页，形成三级结构：

$$
\boxed{32:10:10:12}.
$$

最外层仍需要 $2^{32}\times4=2^{34}\text{ B}=16\text{ GiB}$。因此地址空间继续增大时，还需要更深的层次或其他组织方式。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212646.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Access Cost of Multilevel Paging

在所有页表均驻留、每级查表一次访存、无其他缓存的模型中，$L$ 级页表访问一次数据需要：

$$
\boxed{L+1\text{ 次主存访问}}.
$$

前 $L$ 次查页表，最后一次访问数据。二级为 3 次，三级为 4 次。

加入 TLB，查询时间为 $t$、命中率为 $\alpha$：

$$
\begin{aligned}
EAT
&=\alpha(t+m)+(1-\alpha)[t+(L+1)m]\\
&=\boxed{t+[1+L(1-\alpha)]m}.
\end{aligned}
$$

**TLB 命中可以跳过整个页表遍历。** 多级页表节省稀疏映射的空间，也增加了未命中时的转换成本。

### Hashed Page Tables

**哈希页表（Hashed Page Table）** 用虚拟页号计算哈希值，再在对应桶中寻找映射，适合较大的稀疏地址空间。

每条记录保存虚拟页号、物理页框号和指向下一条记录的指针。同一桶中的记录形成链表，用于处理哈希冲突。

```text
逻辑地址 (p, d)
      ↓ 对 p 计算哈希
找到桶 → 沿链表比较虚拟页号
                  ↓ 匹配
              取得页框号 f
                  ↓
           物理地址 (f, d)
```

**哈希值相同，只表示进入同一个桶，仍需要比较实际页号。** 链越长，查询开销越大。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212704.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中先遇到虚拟页 $q$，与目标 $p$ 不同，继续沿链查找；找到 $(p,r)$ 后，用页框号 $r$ 与偏移 $d$ 形成物理地址。

#### Example

**字符串哈希示意。**

<details>
<summary>输入、哈希值和多项式形式</summary>

三组输入输出为：

```text
Fox                              → DFCD3454
The red fox runs across the ice   → 52ED879E
The red fox walks across the ice  → 46042841
```

另一个字符串哈希表达式为：

$$
h(s)=\sum_{i=0}^{n-1}s[i]\cdot31^{n-1-i}.
$$

它按字符值和位置组合出哈希值。

在页表中，哈希的输入换成虚拟页号；多个进程共用哈希结构时，还要区分地址空间。

</details>

### Inverted Page Tables

普通页表以虚拟页号为索引，记录该页位于哪个物理页框。

**反向页表（Inverted Page Table，IPT）** 为每个物理页框保存一项，记录这个页框属于哪个进程、保存哪个虚拟页面。在这一模型中，整个系统共用一张反向页表。

```text
普通页表：   虚拟页号 p → 物理页框号 f
反向页表：   物理页框号 f → (进程标识, 虚拟页号)
```

因此，反向页表项数由物理页框数决定：

$$
\boxed{N_{\text{IPT}}=\frac{\text{物理内存容量}}{\text{页大小}}}.
$$

查询时仍然从虚拟地址出发。硬件要找到与 $(PID,p)$ 匹配的表项，**该表项的下标就是页框号**。

#### Example

**64-bit 地址、4 KiB 页面，与 256 KiB 物理内存的对比。**

<details>
<summary>页表项数由什么决定？</summary>

64-bit 虚拟地址的完整线性页表需要：

$$
2^{64-12}=2^{52}\text{ 项}.
$$

如果物理内存只有 256 KiB、页框为 4 KiB，则最多有：

$$
\frac{256}{4}=64\text{ 个页框}.
$$

对应的反向页表只需要 **64 项**。它只描述物理内存中现有的驻留页面；非驻留页面的信息还需要其他结构维护。

</details>

### Inverted Index

倒排索引可以帮助理解“改变索引方向”。文档可以列出自己包含的词，倒排索引则让一个词指向包含它的文档。

例如，`blue` 和 `bright` 对应文档 1、3；`sky` 对应文档 2、3。去掉停用词后，只保留有检索价值的词及其文档列表。

这里借用的是组织数据的思路，倒排索引与反向页表各自保存的内容不同。

### Hashing an Inverted Page Table

反向页表按物理页框组织，CPU 却只知道进程标识和虚拟页号。直接遍历整张表可能很慢，因此再用哈希表缩小搜索范围，并用 TLB 缓存成功的转换结果。

```text
(PID, p) → 哈希桶 → 候选 IPT 表项 → 比较 PID 和 p
                                       ↓ 匹配
                                   表项下标 f
                                       ↓
                                  PA = fS + d
```

哈希页表和反向页表可以结合：前者描述查找方式，后者规定主要映射表按物理页框组织。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212822.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

**PID 为 0，VPN 为 `0x1`，偏移为 `0x123`。**

<details>
<summary>沿冲突链查找，取得物理页框号</summary>

哈希桶给出的首个反向页表下标是 `0x0`。

该项为 `(PID=1, VPN=0xA63)`，与请求不匹配。沿 `Next=0x18F1B` 继续查找。

下标 `0x18F1B` 处为 `(PID=0, VPN=0x1)`，匹配成功。因此：

$$
f=0x18F1B,\qquad d=0x123.
$$

得到物理地址二元组 $(0x18F1B,0x123)$。若页大小为 $S$，完整地址就是 $0x18F1B\times S+0x123$；偏移的数值本身不能确定页大小。

</details>

共享页是反向页表的一个难点：一个物理页框可能同时对应多个进程的虚拟地址，单个 $(PID,p)$ 记录无法表示所有别名，需要额外管理。

### Inverted Page Table Exercises

考虑简单的按需分页环境，无分段。进程 $P_1,P_2$ 的逻辑地址范围均为 0～99，页面大小为 5。哈希函数为：

$$
h(P_i,p)=i+p.
$$

注意输入是 **逻辑页号**。如果给出逻辑地址 $a$，应先计算：

$$
p=\left\lfloor\frac a5\right\rfloor,\qquad d=a\bmod5.
$$

给定哈希表中的记录：

| 图中槽号 | 进程 | 逻辑页 | 页框 |
| --- | --- | --- | --- |
| 3 | 空 | — | — |
| 4 | $P_2$ | 2 | 1 |
| 5 | $P_1$ | 3 | 4 |
| 18 | $P_1$ | 17 | 2 |
| 19 | $P_1$ | 18 | 3 |

反向页表的页框 0 空闲；页框 1 属于 $P_2$、可读写；页框 2、4 属于 $P_1$、可读写；页框 3 属于 $P_1$、只读。

图中 $(P_1,3)$ 放在槽 5，而直接哈希值为 $1+3=4$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106212856.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

1. **分别计算请求 `P1:30`、`P2:22` 的哈希值。冒号后表示逻辑地址。**

<details>
<summary>先求逻辑页号，再计算哈希</summary>

`P1:30`：

$$
p=\lfloor30/5\rfloor=6,\qquad h=1+6=\boxed{7}.
$$

`P2:22`：

$$
p=\lfloor22/5\rfloor=4,\qquad h=2+4=\boxed{6}.
$$

哈希值是查询入口，尚未得到物理页框号。

</details>

2. **请求 `P1:86`，求物理地址。**

<details>
<summary>完整地址转换</summary>

$$
p=\lfloor86/5\rfloor=17,\qquad d=86\bmod5=1.
$$

$$
h(P_1,17)=1+17=18.
$$

槽 18 中的 $(P_1,17)$ 映射到页框 2，因此：

$$
PA=2\times5+1=\boxed{11}.
$$

</details>

3. **$P_2$ 尝试读取逻辑地址 7，会发生什么？数据结构如何变化？**

<details>
<summary>缺页处理与恢复执行</summary>

$$
p=\lfloor7/5\rfloor=1,\qquad d=2,\qquad h=2+1=3.
$$

给定状态下，$P_2$ 的第 1 页尚未驻留，发生缺页异常。

1. 分配空闲页框 0，将所需页面装入。
2. 更新 IPT 的第 0 项，记录它保存 $(P_2,1)$。
3. 在哈希槽 3 建立 $(P_2,1)\to0$ 的映射。
4. 恢复并重新执行原来的访存指令。

更新后的物理地址为：

$$
PA=0\times5+2=\boxed{2}.
$$

进程仍使用原来的逻辑地址 7。成功处理后可以继续运行，无需自行修改访问地址。

</details>

### Hierarchical Page Table Exercises

#### Example

1. **32-bit 虚拟地址，4 KiB 页面，每个 PTE 为 4 字节。进程只使用 1024 个虚拟页，完整单级页表占多少空间？**

<details>
<summary>单级页表按虚拟页号范围计数</summary>

$$
N=\frac{2^{32}}{2^{12}}=2^{20}\text{ 项}.
$$

$$
M=2^{20}\times4=2^{22}\text{ B}=\boxed{4\text{ MiB}}.
$$

这里的完整线性页表覆盖整个虚拟地址范围，与当前实际使用 1024 页无关。

</details>

2. **沿用上题，改用二级页表，一级页表大小是每张二级页表的 4 倍。能否确定总开销？求可能的最小值和最大值。**

<details>
<summary>确定两级规模，再根据页面分布求上下界</summary>

仅知道使用了 1024 页，无法确定总开销，还要知道这些页落入多少个不同的二级页表。

设一级页表有 $A$ 项，每张二级页表有 $B$ 项。两级表项均占 4 字节：

$$
AB=2^{20},\qquad A=4B.
$$

因此：

$$
B=2^9=512,\qquad A=2^{11}=2048.
$$

地址划分为：

$$
\boxed{11:9:12}.
$$

一级页表大小：

$$
2048\times4=8192\text{ B}=8\text{ KiB}.
$$

每张二级页表大小：

$$
512\times4=2048\text{ B}=2\text{ KiB}.
$$

**最小值**：1024 个有效页集中放入两张二级页表。

$$
M_{\min}=8+2\times2=\boxed{12\text{ KiB}}.
$$

**最大值**：1024 个有效页分别落入不同的一级索引范围，创建 1024 张二级页表。

$$
M_{\max}=8+1024\times2=\boxed{2056\text{ KiB}}.
$$

这里计算表项本身的字节数；题目没有另加“每张二级表单独占满一个 4 KiB 页框”的分配要求。

</details>

3. **物理内存为 8 GiB，页大小为 8 KiB，PTE 为 4 字节。每张页表放在一页中，映射 46-bit 虚拟地址至少需要几级？**

<details>
<summary>按每一级提供的索引位数计算</summary>

页大小为 $2^{13}$ 字节，因此偏移为 13 位，虚拟页号共有：

$$
46-13=33\text{ 位}.
$$

一张页表可以放：

$$
\frac{2^{13}}{2^2}=2^{11}\text{ 项}.
$$

每一级最多提供 11 位索引，因此：

$$
L=\left\lceil\frac{33}{11}\right\rceil=\boxed{3}.
$$

地址划分为：

$$
\boxed{11:11:11:13}.
$$

也可以按覆盖范围计算：一级覆盖 $2^{24}$ 字节，二级覆盖 $2^{35}$ 字节，三级覆盖 $2^{46}$ 字节。

8 GiB 物理内存对应 $2^{33}/2^{13}=2^{20}$ 个页框；这个数决定物理页框数量，不决定虚拟地址需要几级索引。

</details>

### Page-Table Calculation Rules

设虚拟地址为 $m$ 位，页大小 $S=2^n$，每项 $E$ 字节，每张下级页表放满一页，则：

$$
\text{每表项数}=\frac SE,\qquad b=\log_2\frac SE.
$$

当 $S/E$ 为 2 的幂时，每一级索引占 $b$ 位；最顶层可以使用剩余的较少位数。所需最少层数：

$$
\boxed{L=\left\lceil\frac{m-n}{b}\right\rceil}.
$$

二级页表若外层有 $A$ 项、每张内层有 $B$ 项、实际创建 $k$ 张内层表，两级表项大小分别为 $E_1,E_2$：

$$
\boxed{M=AE_1+kBE_2}.
$$

## Segmentation

### User's View of a Program

**分段（Segmentation）** 按程序的逻辑结构组织内存。一个程序可以由主程序、函数、对象、局部与全局变量、栈、符号表、数组等段组成。

段是有逻辑意义的单位，不同段的长度可以不同；各段可以分别共享或设置访问权限。

```text
一个程序
  ├─ 主程序
  ├─ 子程序／函数
  ├─ 栈
  └─ 符号表、数组等数据
```

在纯分段模型中，**进程的不同段可以分散存放，但每个段内部占据连续物理内存**。因此仍然存在外部碎片和动态空闲块分配问题。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px; max-width: 856px; margin: 0 auto;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213004.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213016.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
</div>

### Segmentation Architecture

逻辑地址是二元组：

$$
\boxed{LA=(s,d)}.
$$

$s$ 为段号，$d$ 为段内偏移。段表每项保存：

- **Base**：该段的起始物理地址。
- **Limit**：该段的长度。

**段表基址寄存器（STBR）** 指向段表；**段表长度寄存器（STLR）** 表示段数。

首先检查段号：

$$
0\le s<STLR.
$$

再检查段内偏移：

$$
0\le d<limit[s].
$$

合法时：

$$
\boxed{PA=base[s]+d}.
$$

```text
(s, d) → 检查段号 → 查段表 → 检查权限和 d < limit
                                      ↓ 合法
                                base + d → 主存
                                      ↓ 非法
                                   地址异常
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213144.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Protection and Sharing

段表项可以关联有效位，以及读、写、执行权限。无效段或不允许的访问会触发异常。

代码可以按段共享，私有数据分别保留。因为各段长度不同，为段寻找连续物理区域仍需要处理首次适应等动态分配问题。

### Example

**给定五个逻辑段及段表。**

| 段号 | 内容 | Limit | Base |
| --- | --- | --- | --- |
| 0 | 子程序 | 1000 | 1400 |
| 1 | `sqrt` | 400 | 6300 |
| 2 | 主程序 | 400 | 4300 |
| 3 | 栈 | 1100 | 3200 |
| 4 | 符号表 | 1000 | 4700 |

各段在物理内存中的位置并不按段号排列。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213156.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>各段的物理地址范围</summary>

采用左闭右开区间：

```text
段 0：[1400, 2400)
段 1：[6300, 6700)
段 2：[4300, 4700)
段 3：[3200, 4300)
段 4：[4700, 5700)
```

段号只用于索引段表，不代表物理地址先后顺序。

</details>

<details>
<summary>用同一段表练习地址转换与越界判断</summary>

访问 $(2,100)$：$100<400$，因此 $PA=4300+100=4400$。

访问 $(1,500)$：$500\ge400$，越界，不能把 $6300+500$ 当作有效地址。

访问 $(3,1050)$：$1050<1100$，因此 $PA=3200+1050=4250$。

访问 $(0,1000)$：偏移恰好等于段长，仍然越界。段 0 的最后一个合法偏移为 999。

</details>

### Segmentation vs. Paging

| 比较 | 分页 | 纯分段 |
| --- | --- | --- |
| 划分依据 | 固定大小 | 程序的逻辑单位 |
| 单位大小 | 页与页框等长 | 各段长度可不同 |
| 地址格式 | 页号＋页内偏移 | 段号＋段内偏移 |
| 基本映射 | 查页框号，保留偏移 | 查基址，检查段长，再相加 |
| 主要碎片 | 内部碎片 | 外部碎片 |
| 共享与保护 | 以页为单位 | 以逻辑段为单位 |

**段适合表达逻辑结构、共享和保护；页适合固定粒度的物理内存管理。** 两者可以结合。

## Segmentation with Paging

### Segmentation on Paging

逻辑内存由段组成，每个段再划分成页。

每个进程维护段表，段表项从“段号”映射到“该段的页表基址”；页表再把段内页号映射到物理页框。

```text
段号 s → 段表 → 该段的页表
                         ↓ 段内页号 p
                       页框号 f
                         ↓ 页内偏移 d
                       物理地址
```

共享段可以让相应段表项指向共享页表。一个段的不同页可以分散在物理内存中，不再要求整个段连续。

### Example

**32-bit 逻辑地址采用 $10:12:10$ 的“段号、页号、偏移”划分。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213215.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>地址空间大小与转换过程</summary>

$$
LA=\underbrace{s}_{10\text{ 位}}\ \underbrace{p}_{12\text{ 位}}\ \underbrace{d}_{10\text{ 位}}.
$$

段号字段可表示 $2^{10}$ 个段；每段的页号字段可表示 $2^{12}$ 页；每页为 $2^{10}=1\text{ KiB}$。

因此，一个段可寻址的最大范围为：

$$
2^{12}\times2^{10}=2^{22}\text{ B}=4\text{ MiB}.
$$

转换步骤：

1. 用 $s$ 查段表，检查段和访问权限，取得该段页表基址。
2. 用 $p$ 查该段页表，取得页框号 $f$。
3. 保留 $d$，形成物理地址：

$$
\boxed{PA=f\times1024+d}.
$$

图中的物理地址为 32 位，低 10 位仍为偏移，高 22 位为物理页框号。

</details>

## The Intel Pentium

### Logical, Linear, and Physical Addresses

Pentium 支持纯分段，也支持分段后继续分页。

```text
逻辑地址 → 分段单元 → 线性地址 → 分页单元 → 物理地址
```

**逻辑地址** 由段选择子和段内偏移组成；**线性地址** 是分段转换的结果；**物理地址** 是分页转换后的实际内存地址。

这一过程中的分段单元和分页单元共同完成内存管理单元的地址转换工作。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213252.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Segment Selector and Descriptor Tables

逻辑地址为：

$$
(\underbrace{selector}_{16\text{ 位}},\underbrace{offset}_{32\text{ 位}}).
$$

16 位段选择子分为：

$$
\underbrace{index}_{13\text{ 位}}\ \underbrace{TI}_{1\text{ 位}}\ \underbrace{RPL}_{2\text{ 位}}.
$$

**Index** 选择段描述符；**TI** 区分全局描述符表 GDT 与局部描述符表 LDT；**RPL** 是请求特权级，用于保护检查。

每个段描述符占 **8 字节**，保存基址、段界限和访问权限等信息。

```text
selector → 选择 GDT／LDT → 找到段描述符
                                ↓ 检查界限与权限
                          段基址 + offset
                                ↓
                           32 位线性地址
```

段描述符可以缓存在处理器中，不必每次访存都重新从主存读取。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213305.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Pentium Paging Architecture

分页单元使用线性地址查页表。**CR3 寄存器指向当前进程的页目录**。

对于 **4 KiB 页**，32 位线性地址划分为：

$$
\boxed{10:10:12}.
$$

高 10 位索引页目录，中间 10 位索引页表，低 12 位为页内偏移。

```text
CR3 → 页目录 → 页表 → 4 KiB 数据页
       高10位   中10位     低12位偏移
```

页目录项中的 Page Size 标志可以选择 **4 MiB 大页**。使用大页时，目录项直接指向数据页，跳过内层页表，地址拆分为：

$$
\boxed{10:22}.
$$

高 10 位索引页目录，低 22 位为 4 MiB 页内偏移。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213324.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Linear Address in Linux

这里采用早期 Linux 的三级分页抽象：

```text
线性地址：global directory | middle directory | page table | offset
```

```text
全局页目录 → 中间页目录 → 页表 → 页框
                                   ↓
                               加页内偏移
```

这展示了通过多级目录逐步缩小范围的方式；实际层级由相应体系结构决定。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261106213334.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Segments in Linux

32-bit x86 的 Linux 示例使用以下段相关定义：

- `__KERNEL_CS`、`__KERNEL_DS`：内核代码段、内核数据段。
- `__USER_CS`、`__USER_DS`：用户代码段、用户数据段。
- `TSS`：任务状态段。
- `Default_LDT`：默认局部描述符表。

多个用户进程可以使用相同的用户段定义，仍通过各自的页表维持地址空间隔离。**共享段定义，不等于所有进程的数据都映射到相同物理页框。**
