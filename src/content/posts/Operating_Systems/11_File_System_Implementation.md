---
title: File-System Implementation
published: 2026-11-23
description: 文件系统结构、目录实现、文件分配与空闲空间管理、缓存与恢复，以及 NFS、WAFL 和 inode 计算
tags: [操作系统]
category: 笔记
draft: false
---

## File-System Structure

### Files and Disk Blocks

**文件是逻辑上的存储单位，磁盘块是文件系统分配和读写空间的基本单位。** 文件系统需要把文件中的位置转换成磁盘上的块号，并记录哪些块已经分配、哪些块仍然空闲。

磁盘上的几个基本概念：

- **磁道（Track）**：盘面上的同心圆。
- **扇区（Sector）**：磁道上的一段，是磁盘的基本存储单位。
- **柱面（Cylinder）**：不同盘面上半径相同的一组磁道。
- **块（Block）**：文件系统管理的单位，可以由多个扇区组成。例如，一个 4 KB 块可以包含 8 个 512 B 扇区。

### Layered File System

文件系统按层组织，从文件名、目录和权限逐步落实到设备读写。

| 层次 | 主要工作 |
| --- | --- |
| **逻辑文件系统（Logical File System）** | 管理目录与文件元数据，检查权限，维护文件控制块 |
| **文件组织模块（File-Organization Module）** | 将文件逻辑块号转换成物理块号，分配和回收磁盘空间 |
| **基本文件系统（Basic File System）** | 发出读取、写入物理块的通用请求，管理相应缓冲 |
| **I/O 控制（I/O Control）** | 通过设备驱动与中断处理程序完成设备操作 |
| **设备（Devices）** | 实际保存和传输数据 |

应用程序通过文件接口提出请求，各层分别处理命名、地址映射和硬件操作。底层设备改变时，上层的文件接口可以保持一致。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145607.png"  style="width: 220px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### File Control Block

**文件控制块（File Control Block，FCB）** 保存管理一个文件所需的信息，主要包括：

- 文件权限。
- 创建、访问、修改时间。
- 所有者、所属组、访问控制表。
- 文件大小。
- 文件数据块的位置或指向数据块的指针。

UFS 用 **inode** 表示这类结构，NTFS 使用主文件表中的记录。目录项将文件名与对应的文件信息关联起来；在 UNIX 风格的结构中，目录项保存文件名和 inode 号，inode 保存属性与数据块地址。

**找文件名依靠目录，找文件内容依靠 inode 中的块地址。**

## File-System Implementation

### On-Disk Structures

磁盘上需要长期保存以下信息：

1. **引导控制块（Boot Control Block）**：保存从该卷引导系统所需的信息。
2. **卷控制块（Volume Control Block）**：记录卷的块数、块大小、空闲块和空闲 FCB 等信息。UNIX 文件系统中通常称为超级块。
3. **目录结构**：记录文件名及其对应的文件信息。
4. **每个文件的 FCB**：保存文件属性和数据位置。

### In-Memory Structures

文件系统运行时，会把常用信息保存在内存中：

- **挂载表**：记录已经挂载的卷及挂载位置。
- **目录缓存**：保存近期查找过的目录信息。
- **系统级打开文件表**：保存已打开文件的相关信息，避免反复从磁盘读取元数据。
- **进程级打开文件表**：记录本进程的文件描述符及其关联的系统表项。
- **数据缓存**：保存近期使用的文件数据。

磁盘保存持久状态，内存中的这些结构加快运行时的访问。

### Example

**打开一个文件，再读取它的数据。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145648.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>open() 与 read() 分别经过哪些结构？</summary>

**打开文件：**

1. 按路径逐级查找目录，取得文件对应的 FCB，并检查访问权限。绝对路径从根目录开始，相对路径从当前目录开始。
2. 将需要的文件信息放入内存中的打开文件结构；已有可共享信息时直接复用。
3. 在进程的打开文件表中建立表项，返回文件描述符。

**读取文件：**

1. 用文件描述符找到进程的打开文件表项。
2. 沿关联关系取得文件信息和当前读写位置。
3. 将文件偏移转换成物理块地址。
4. 缓存命中时直接取数据；未命中时从磁盘读入。
5. 把数据交给进程，并更新读写位置。

`open()` 读取必要的元数据，文件数据在读取时按需载入。打开后，后续读写可以直接通过文件描述符找到文件，无需每次重新解析完整路径。

例如，当前文件偏移为 $100$，成功读取接下来的 $10$ B，就读取偏移 $100$ 到 $109$ 的内容，并把当前位置更新为 $110$。

关闭文件时，系统释放对应的打开状态，并按写回策略保存修改过的信息。

</details>

### Virtual File Systems

**虚拟文件系统（Virtual File System，VFS）** 为不同文件系统提供统一接口。应用使用相同的 `open()`、`read()`、`write()`、`close()`，具体操作由相应文件系统实现。

VFS 可以用 **vnode** 等统一对象表示文件，并通过对象关联的操作调用具体实现。这与面向对象中的接口和多态类似：调用方式一致，内部处理方式可以不同。

- 本地文件：交给本地文件系统，再访问设备。
- 远程文件：交给网络文件系统，将请求发送到服务器。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145714.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

## Directory Implementation

### Linear List

目录可以实现为**目录项的线性表**，每项保存文件名和指向文件信息的指针。

查找文件时逐项比较文件名；创建文件时先确认没有重名项，再插入新目录项；删除文件时移除或标记对应项。

实现简单，但查找可能扫描整个目录。若目录中有 $n$ 个文件，最坏需要检查 $n$ 项，即 $O(n)$。

如果目录项按名称排序并支持随机访问，可以用二分查找加快搜索；创建和删除时需要维护次序。

### Hash Table

对文件名计算哈希值，用结果定位目录项所在的位置，从而缩短查找时间。

不同文件名可能得到相同的哈希值，即**哈希冲突（Collision）**。可以用链式溢出等方式保存同一位置上的多个目录项。

哈希表在负载合适时查找较快，但还需要处理冲突和表的扩容。**目录实现主要影响“按名字找到文件”的代价。**

## Allocation Methods

**分配方法决定一个文件的数据块怎样放到磁盘上，以及怎样找到这些块。** 常见方法有连续分配、链接分配和索引分配。

下面用 $LA$ 表示文件内的逻辑地址，块号和块内偏移从 $0$ 开始。

### Contiguous Allocation

**连续分配（Contiguous Allocation）** 为一个文件分配一组连续的磁盘块。只需要记录起始块号 $s$ 和块数 $n$。

若块大小为 $B$，则：

$$
Q=\left\lfloor\frac{LA}{B}\right\rfloor,
\qquad R=LA\bmod B
$$

$$
\text{物理块号}=s+Q,
\qquad \text{块内偏移}=R
$$

顺序访问时可以依次读取相邻块；随机访问时可以直接计算目标块地址。连续布局还能减少机械磁盘的寻道。

主要问题是：

- **外部碎片**：空闲块总量足够，也可能找不到足够长的连续区域。
- **文件增长困难**：若文件后面的块已被占用，就需要搬迁文件或另找空间。
- 预留过多空间会浪费容量，预留过少又容易不够用。

寻找连续空间可以使用首次适应、最佳适应等方法，与动态内存分配中的问题相似。

#### Example

**根据起始块号和长度确定文件位置。**

目录中的分配信息如下：

| 文件 | 起始块号 | 块数 | 占用的物理块 |
| --- | ---: | ---: | --- |
| `count` | 0 | 2 | 0–1 |
| `tr` | 14 | 3 | 14–16 |
| `mail` | 19 | 6 | 19–24 |
| `list` | 28 | 4 | 28–31 |
| `f` | 6 | 2 | 6–7 |

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145744.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>块大小为 512 B，访问 tr 中偏移 600 B 和 513 B 的数据，位置在哪里？</summary>

$$
600=1\times512+88
$$

所以 $Q=1$，$R=88$。`tr` 从物理块 $14$ 开始，目标位于：

$$
\boxed{\text{物理块 }15，\text{块内偏移 }88\text{ B}}
$$

同样地，$513=1\times512+1$，所以偏移 $513$ B 的数据位于物理块 $15$，块内偏移为 $1$ B。

</details>

若再申请一个需要 $10$ 个连续块的文件，图中空闲块总数虽足够，最长连续空闲区却不足 $10$ 块，仍然无法分配。这就是外部碎片。

### Extent-Based Systems

**扩展区（Extent）** 是一段连续的磁盘块，一个文件可以由一个或多个扩展区组成。

文件先取得一段连续空间，增长时再申请新的扩展区。每段内部保留连续访问的优势，整个文件也可以分布在不同位置。

扩展区大小也可以不同，例如，一个文件先取得包含 $4$ 块的扩展区，之后再增加包含 $1024$ 块的扩展区。

Veritas File System 使用这种分配思想。它缓解了文件增长的问题，同时需要记录各扩展区的起始位置和长度。预留的扩展区过大、尚未用满时，也会产生内部碎片。

### Linked Allocation

**链接分配（Linked Allocation）** 把文件的数据块组织成链表。块可以分散在磁盘各处，每块保存指向下一块的指针，目录记录文件的起始位置，也可以记录尾块位置以方便追加。

- 文件增长时，从空闲空间中取出一块接到链尾即可。
- 无需连续区域，因此没有外部碎片。
- 指针会占用块内空间，最后一块还可能没有填满。
- 随机访问需要沿链查找，越靠后的块越慢。
- 指针损坏可能使后续块无法找到；块分散还会增加寻道。

若每块包含 $512$ 个字（word），第一个字保存指针，剩余 $511$ words 存数据，$LA$ 以 word 为单位，则：

$$
Q=\left\lfloor\frac{LA}{511}\right\rfloor,
\qquad R=LA\bmod511
$$

从首块开始沿链找到逻辑块 $Q$，即链上的第 $Q+1$ 块。目标在物理块内的偏移为 $R+1$ words，因为第一个字已经用于保存指针。

#### Example

**文件 `jeep` 的数据块链：**

$$
9\rightarrow16\rightarrow1\rightarrow10\rightarrow25
$$

目录中记录首块 $9$、尾块 $25$。逻辑块的顺序由指针决定，物理块号无需连续。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145818.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>每块 512 words，其中 1 word 存指针，访问偏移 513 words 的数据。</summary>

$$
513=1\times511+2
$$

因此要找链上的第 $2$ 块，即物理块 $16$，块内偏移为：

$$
\boxed{2+1=3\text{ words}}
$$

访问这个位置需要先读取块 $9$ 中的后继指针，再找到块 $16$。

如果已经读到物理块 $10$，又想访问物理块 $16$，单向链不能直接向前回退。未保存此前块地址时，需要重新从首块 $9$ 出发。

</details>

### File-Allocation Table

**文件分配表（File-Allocation Table，FAT）** 把各块的后继指针集中保存到一张表中。目录项保存文件的首块号，FAT 的第 $i$ 项记录块 $i$ 的后继。

例如，文件 `test` 从块 $217$ 开始：

$$
\operatorname{FAT}[217]=618,
\qquad \operatorname{FAT}[618]=339
$$

沿表项依次找到块 $217\rightarrow618\rightarrow339$；遍历到文件结束标记时停止。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145834.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

FAT 通常按卷维护。**表被缓存在内存中后，沿链查找可以在内存里完成，不必为了取得每个后继指针而读取对应的数据块。** 数据块本身也可以全部用来存文件数据。

它仍然保留链式关系，定位靠后的块需要遍历相应表项；卷很大时，FAT 本身也会占用较多空间。MS-DOS、OS/2 使用过这种分配方式。

### Indexed Allocation

**索引分配（Indexed Allocation）** 为每个文件设置索引块，把该文件所有数据块的地址集中存放。目录项保存索引块地址，索引块的第 $i$ 项指向文件的第 $i$ 个逻辑块。

数据块可以分散存放，文件增长时追加数据块地址即可。随机访问直接按逻辑块号查索引，无需遍历前面的数据块。

代价是索引块本身占用空间。小文件可能只使用少数索引项，却仍占用一个完整索引块；大文件则需要扩展索引结构。

#### Example

**文件 `jeep` 的索引块为 19。** 其中各项依次为：

$$
\operatorname{index}[0..4]=[9,16,1,10,25]
$$

其余未使用项标为 $-1$。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145851.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>数据块大小为 512 words，访问文件内偏移 513 words 的数据。</summary>

$$
513=1\times512+1
$$

逻辑块号为 $1$，查索引第 $1$ 项得到物理块 $16$，块内偏移为 $1$ word。

数据块内无需保存后继指针，所以完整的 $512$ words 都可存放文件数据。

</details>

### Single-Level Index

若数据块大小为 $B$，索引表为 $I$：

$$
Q=\left\lfloor\frac{LA}{B}\right\rfloor,
\qquad R=LA\bmod B
$$

$$
\text{物理块号}=I[Q],
\qquad \text{块内偏移}=R
$$

这个过程与页表映射类似：先分出逻辑块号和块内偏移，再用逻辑块号查表。

#### Example

**块大小为 512 words，每个指针占 1 word，文件最大为 256K words。一个索引块是否足够？**

<details>
<summary>计算索引项数与最大文件大小</summary>

一个索引块可以保存 $512$ 个数据块地址，每个数据块保存 $512$ words：

$$
512\times512=2^{18}\text{ words}=256K\text{ words}
$$

因此一个索引块刚好足够。

</details>

### Linked Index Blocks

索引块不够用时，可以把多个索引块串起来。每块的最后一项保存下一索引块的地址，其余项指向数据块。

例如，索引块链为 $19\rightarrow30\rightarrow28\rightarrow\cdots$。块 $19$ 中的数据指针依次为 $9,16,1,10,25,27,29$，最后一项 $30$ 指向下一索引块；块 $30$ 中接着保存 $4,5,6,\ldots$ 等数据块地址，最后一项 $28$ 继续连接后续索引块。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145919.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这种方法方便继续扩展，但访问后面的索引块时仍然要沿索引链查找。

<details>
<summary>按图中每个索引块列出 7 个数据指针的布局，访问偏移 9×512 words 的位置。</summary>

每个数据块为 $512$ words，目标是逻辑块 $9$，块内偏移为 $0$。

索引块 $19$ 已覆盖逻辑块 $0$ 到 $6$；沿最后一项找到索引块 $30$ 后，目标位于它的第 $9-7=2$ 项。该项保存物理块号 $6$。

因此先读取索引块 $19$，再读取索引块 $30$，最后访问物理块 $6$ 的偏移 $0$。

</details>

若索引块和数据块均为 $512$ words，每个指针占 $1$ word，则每个索引块可指向 $511$ 个数据块，覆盖 $511\times512$ words：

$$
Q_1=\left\lfloor\frac{LA}{511\times512}\right\rfloor,
\qquad R_1=LA\bmod(511\times512)
$$

$$
Q_2=\left\lfloor\frac{R_1}{512}\right\rfloor,
\qquad R_2=R_1\bmod512
$$

- $Q_1$：需要找到索引链上的哪个索引块。
- $Q_2$：该索引块中哪个数据指针。
- $R_2$：目标数据块内的偏移。

### Multilevel Index

**多级索引（Multilevel Index）** 用上层索引块指向下层索引块，再由最下层索引指向数据块。

两级索引中，若每个索引块可容纳 $512$ 个指针，每个数据块为 $512$ words，则最多支持：

$$
512\times512=512^2\text{ 个数据块}
$$

$$
\text{最大文件大小}=512^3\text{ words}
$$

地址转换如下：

$$
Q_1=\left\lfloor\frac{LA}{512\times512}\right\rfloor,
\qquad R_1=LA\bmod(512\times512)
$$

$$
Q_2=\left\lfloor\frac{R_1}{512}\right\rfloor,
\qquad R_2=R_1\bmod512
$$

先用 $Q_1$ 查外层索引，找到一个内层索引块；再用 $Q_2$ 查内层索引，得到数据块地址；$R_2$ 是块内偏移。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145940.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

没有缓存时，两级索引访问一个数据块需要读取两层索引和一个数据块，共 $3$ 次磁盘访问。索引块已经在内存中时，可以省去对应的读取。

### Combined Scheme in UNIX

传统 UNIX 的混合索引把直接指针和多级间接指针结合起来。一个 inode 包含：

- **12 个直接指针**：直接指向前 12 个数据块。
- **1 个一级间接指针**：指向索引块，再找到数据块。
- **1 个二级间接指针**：经过两层索引找到数据块。
- **1 个三级间接指针**：经过三层索引找到数据块。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123145951.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**小文件可以只使用直接指针，大文件再逐步使用间接索引。** 这样既减少小文件的索引开销，又能支持较大的文件。

若块大小为 $B$ 字节，每个地址占 $p$ 字节，则每个索引块能保存：

$$
n=\frac{B}{p}
$$

个地址。上述结构能够寻址的最大文件数据量为：

$$
\boxed{S_{\max}=(12+n+n^2+n^3)B}
$$

inode 已经在内存、索引块尚未缓存时，读取一个直接、一级间接、二级间接、三级间接数据块，分别需要 $1、2、3、4$ 次磁盘访问。

### Example

**一个 4 GB DVD 镜像，连同元数据共占多少磁盘空间？**

已知：

- 磁盘块为 $4096$ B，扇区为 $512$ B。
- 所有块指针为 $32$ bit，即 $4$ B。
- inode 有 $12$ 个直接指针、$1$ 个一级间接指针和 $1$ 个二级间接指针。
- inode 大小为 $256$ B；每个索引块都占用完整的磁盘块。
- 镜像大小按 $4\text{ GB}=2^{32}\text{ B}$ 计算。

<details>
<summary>展开计算</summary>

**1. 计算数据块数量。**

$$
N=\frac{2^{32}}{4096}=2^{20}=1{,}048{,}576
$$

**2. 计算每个索引块能放多少指针。**

$$
n=\frac{4096}{4}=1024
$$

**3. 依次使用直接、一级间接和二级间接指针。**

直接指针覆盖 $12$ 个数据块。

一级间接部分覆盖 $1024$ 个数据块，需要 $1$ 个索引块。

剩下交给二级间接部分的数据块数为：

$$
1{,}048{,}576-12-1024=1{,}047{,}540
$$

这些数据块需要的下层索引块数为：

$$
\left\lceil\frac{1{,}047{,}540}{1024}\right\rceil=1023
$$

还要加上指向它们的 $1$ 个二级索引根块。因此索引块总数为：

$$
1+1023+1=1025
$$

**4. 加上数据和 inode。**

$$
\begin{aligned}
S&=2^{32}+1025\times4096+256\\
 &=\boxed{4{,}299{,}165{,}952\text{ B}}
\end{aligned}
$$

也可以写成：

$$
\boxed{4\text{ GiB}+4\text{ MiB}+4\text{ KiB}+256\text{ B}}
$$

这里有 $1024$ 个直接保存数据块地址的索引块，其中已经包含独立的一级间接块；二级索引根块再单独计 $1$ 块。最后一个索引块没有用满，也仍占 $4096$ B。

</details>

### Comparison of Allocation Methods

| 方法 | 如何定位逻辑块 $i$ | 文件增长 | 主要代价 |
| --- | --- | --- | --- |
| 连续分配 | 起始块号加 $i$ | 受相邻空间限制 | 外部碎片、搬迁或预留空间 |
| 链接分配 | 从链头沿指针查找 | 方便追加 | 随机访问慢、指针空间和可靠性 |
| 索引分配 | 按 $i$ 查索引 | 在索引容量内追加，或扩展索引 | 索引块空间和索引读取 |

## Free-Space Management

### Bit Map

**位图（Bit Map / Bit Vector）** 为每个磁盘块设置一位。本章约定：

$$
\operatorname{bit}[i]=
\begin{cases}
1,&\text{块 }i\text{ 空闲}\\
0,&\text{块 }i\text{ 已占用}
\end{cases}
$$

分配时把对应位从 $1$ 改为 $0$，释放时从 $0$ 改为 $1$。需要连续空间时，可以寻找连续的多个 $1$。

若共有 $N$ 个块，需要 $N$ bit。按字节保存时，位图占用：

$$
\left\lceil\frac{N}{8}\right\rceil\text{ B}
$$

扫描时可以按机器字检查，跳过整字为 $0$ 的区域。设每个机器字有 $w$ 位，前面有 $z$ 个连续的全 $0$ 字，随后第一个 $1$ 在该字中的偏移为 $r$，则：

$$
\boxed{\text{第一个空闲块号}=wz+r}
$$

#### Example

**磁盘容量为 $2^{30}$ B，块大小为 $2^{12}$ B，需要多大的位图？**

<details>
<summary>计算位图空间</summary>

块数为：

$$
N=\frac{2^{30}}{2^{12}}=2^{18}
$$

每块用 $1$ bit，因此位图需要：

$$
\frac{2^{18}}{8}=2^{15}\text{ B}=\boxed{32\text{ KiB}}
$$

若磁盘扩大到 $1\text{ TiB}=2^{40}$ B，块大小仍为 $4$ KiB，则位图大小为：

$$
\frac{2^{40}}{2^{12}\times8}=2^{25}\text{ B}=\boxed{32\text{ MiB}}
$$

</details>

### Linked Free List

把所有空闲块串成链表，保存一个空闲链表头指针。每个空闲块记录下一空闲块的位置。

分配时取出链头，释放时把块接回链表。指针存放在空闲块内部，无需额外建立一张与所有磁盘块一一对应的位图。

这种方法便于逐块分配，但查找一段连续空闲空间通常要遍历多个块。

#### Example

一组空闲块按以下顺序连接：

2 → 3 → 4 → 5 → 8 → 9 → 10 → 11 → 12 → 13 → 17 → 18 → 25 → 26 → 27。

链头指向块 $2$。分配块 $2$ 后，链头改为 $3$；继续分配时沿链向后取块。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150021.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Grouping

**成组链接（Grouping）** 在一个块中集中保存一组空闲块地址，减少为了获取空闲地址而反复读盘的次数。

若一个组块保存 $n$ 个地址：

- 前 $n-1$ 项指向可直接分配的空闲块。
- 最后一项指向存有下一组地址的块。

把一组地址读入内存后，可以连续分配多个块。当前组用完，再读取下一组。保存组信息的块在其地址内容被取出后，也可以回收使用。

### Counting

空闲空间经常以连续区间出现，可以只记录：

$$
(\text{起始块号},\text{连续空闲块数})
$$

例如，前面空闲链中的块可以压缩为：

$$
(2,4),\ (8,6),\ (17,2),\ (25,3)
$$

其中 $(8,6)$ 表示块 $8$ 到块 $13$ 共 $6$ 块空闲。分配时缩短或拆分区间，释放时可以合并相邻区间。

### Protecting Free-Space Information

空闲链表头、位图等信息需要保存在磁盘上，也常在内存中保留副本。它们决定哪些块可以重新分配，损坏后可能导致重复分配或空间丢失。

先持久化移除文件对块 $i$ 的引用，再按以下顺序更新空闲信息：

1. 将磁盘位图中的 $\operatorname{bit}[i]$ 置为 $1$。
2. 完成块的回收操作。
3. 将内存位图中的 $\operatorname{bit}[i]$ 置为 $1$，允许分配器重新使用。

这样可以避免磁盘上仍标记占用时，内存已经把该块作为空闲块分出去。文件引用、空闲记录等多处修改还需要协调，后面的日志机制用于处理这类更新。

### Example

**三种分配方式的地址转换与读盘次数。**

逻辑块和物理块大小均为 $512$ words，文件的基本信息已在内存中。索引分配下，文件小于 $512$ 个块，一个索引块足够。

1. 连续分配、链接分配、索引分配分别怎样进行地址映射？
2. 当前刚访问完第 $10$ 个逻辑块，要访问第 $4$ 个逻辑块，各需读多少个磁盘块？这里按第 $1$ 块、第 $2$ 块……计数。

<details>
<summary>地址转换与答案</summary>

**连续分配：**

设起始物理块号为 $z$，令 $LA=512x+y$。目标为物理块 $z+x$，块内偏移 $y$。

第 $4$ 个逻辑块可以直接定位，读取目标数据块即可：**1 次**。

**链接分配：**

每块用 $1$ word 保存后继指针，实际存数据 $511$ words。令 $LA=511x+y$，沿链找到第 $x+1$ 块，物理块内偏移为 $y+1$。

单向链无法从第 $10$ 块向前回退，需要从链头依次读第 $1、2、3、4$ 块：**4 次**。

**索引分配：**

令 $LA=512x+y$，索引块第 $x$ 项给出物理块号，$y$ 是块内偏移。

先读索引块，再读目标数据块：**2 次**。这里索引块尚未缓存；若已经在内存，则只需读取数据块。

若题目把目标写成从 $0$ 开始编号的“逻辑块号 $4$”，它对应第 $5$ 块，链式读取次数随之变为 $5$ 次。

</details>

### Example

**同一个文件系统既能分配一个 4 KB 块，也能分配八个 512 B 小块，怎样利用它？空闲空间管理需要怎样修改？**

<details>
<summary>分配粒度与空闲管理</summary>

较大的文件区域使用 $4$ KB 块，可以减少分配与管理操作，并便于成批读写；小文件或文件末尾不足一整块的部分使用 $512$ B 小块，减少内部碎片。

例如，最后只剩 $1$ KB 数据时，分配两个 $512$ B 小块即可，无需独占一个 $4$ KB 块。

空闲管理需要记录每个大块内部的使用状态：

- 可以按 $512$ B 粒度维护位图，一个 $4$ KB 区域对应 $8$ 位。
- 分配小块时，检查对应的子块状态。
- 分配完整 $4$ KB 块时，检查同一大块中的 $8$ 个子块是否全部空闲。
- 子块全部释放后，可以合并为一个完整的大块。

</details>

## Efficiency and Performance

### Sources of Overhead

文件系统的效率首先取决于目录结构和分配方法：前者影响按名字找到文件的速度，后者影响定位与访问数据块的速度。

元数据的选择也会影响开销。例如，写文件时记录最后修改时间，就需要同时更新相关元数据；若每次读取都更新访问时间，读取也会产生额外写入。

块大小同样存在取舍：较大的块便于批量传输、减少索引项，较小的块可以减少小文件和文件尾部的内部碎片。

### Disk Cache

**磁盘缓存（Disk Cache / Buffer Cache）** 在主存中保存近期使用的磁盘块。

- 读取命中：直接从内存取得数据。
- 读取未命中：从磁盘读取，再放入缓存。
- 缓冲写入：修改缓存并标为脏数据，之后统一写回磁盘。

缓存减少了磁盘访问，合并写入还能减少重复 I/O。异步写入返回时，数据可能仍在内存中，持久化还需要完成后续写回。

### Read-Ahead and Free-Behind

顺序读取大文件时，可以利用访问顺序优化缓存。

**预读（Read-Ahead）**：读取当前块时，提前把后续块放入缓存。程序继续向后读取时，更容易直接命中。

机械磁盘完成寻道和定位后，连续传输附近的数据通常比重新发起多个分散请求更高效。

**读后释放（Free-Behind）**：对已经读过、近期不会再访问的块，及时释放缓存空间，避免一次大文件扫描挤掉其他常用数据。

例如，顺序读取块 $0,1,2,3,\ldots$ 时，可以在处理块 $2$ 的同时预读后续块，并释放已经用完的块 $0$。预读准备后面的数据，读后释放回收前面用过的空间。

### RAM Disk

**内存盘（RAM Disk）** 把一段内存模拟成磁盘设备，可以在其中创建和读写文件。

它的访问速度快，但会占用主存；普通 RAM 断电后内容丢失。磁盘缓存仍有磁盘上的文件作为后备，内存盘则直接把这段内存作为文件的存储空间。

### Page Cache

**页缓存（Page Cache）** 以页为单位缓存文件内容，与虚拟内存机制配合。

文件被映射到进程地址空间后，程序可以通过内存地址访问它。访问尚未驻留的文件页时产生缺页，系统把相应文件内容读入页缓存并建立映射。

在缓存分离的结构中：

- 普通 `read()`、`write()` 使用缓冲区缓存。
- 内存映射访问使用页缓存。

同一份文件数据可能同时出现在两种缓存中，形成**重复缓存（Double Caching）**，既占用额外内存，也增加数据复制与一致性维护的开销。

### Unified Buffer Cache

**统一缓冲区缓存（Unified Buffer Cache）** 让普通文件 I/O 与内存映射共用同一份页缓存。

同一个文件区域只需维护一份内核缓存数据。普通读写通过文件接口使用它，内存映射通过页表映射访问它。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px; max-width: 856px; margin: 0 auto;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150042.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150051.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
</div>

#### Example

**同一文件既被 `read()` 读取，又被 `mmap()` 映射，会经过哪些缓存？**

<details>
<summary>分离缓存与统一缓存的访问过程</summary>

**缓存分离时：**

1. 普通读取把磁盘块读入缓冲区缓存，再把数据复制到应用缓冲区。
2. 映射访问缺页时，相应内容还要进入页缓存。
3. 同一文件内容可能同时保留在缓冲区缓存和页缓存中。

**缓存统一时：**

1. 普通读取先查页缓存；缺失时把文件页读入。
2. 把所需数据复制到应用缓冲区。
3. 映射访问相同文件页时，可以直接建立到已有缓存页的映射。

统一的是内核中的文件缓存。普通 `read()` 仍需要把返回的数据放入应用提供的缓冲区。

普通文件写入与共享映射写入使用相同的缓存页，修改后的脏页再由写回机制保存到磁盘。

</details>

## Recovery

### Consistency Checking

一次文件操作可能同时修改目录、inode、数据块和空闲空间信息。系统在操作中途崩溃时，可能只完成其中一部分。

例如，某块已经记入文件的块地址表，但空闲位图仍把它标为空闲；下次分配时，这个块可能再次交给另一个文件。

**一致性检查（Consistency Checking）** 对照目录、文件属性与磁盘块的使用情况，查找重复占用、丢失块等问题，并尝试修复。需要检查的范围较大时，恢复过程也会较慢。

### Backup and Restore

**备份（Backup）** 把数据保存到其他存储设备，在文件损坏或丢失后用于恢复。

- **完全备份**：保存全部待备份数据。
- **增量备份**：保存自上一次备份以来的变化。

恢复到某个时间点时，先还原最近的一次完全备份，再按顺序应用所需的增量备份。

一致性检查修复文件系统结构；备份用于恢复已经丢失的数据内容。

## Log-Structured File Systems

### Journaling

**日志恢复（Journaling）** 把一次操作涉及的更新组织成事务，先写日志，再把更新落实到文件系统原有结构中。

基本过程：

1. 把相关修改记录到日志。
2. 将日志及提交记录持久化，事务进入已提交状态。
3. 将修改写入目录、inode、位图等位置。
4. 更新完成后，回收对应的日志空间。

**事务提交时，原有文件系统结构可能尚未全部更新，但日志已经保存了完成更新所需的信息。**

如果这时崩溃，重新启动后重放已经提交、尚未完成的事务，就能继续完成这些修改。

### Log-Structured Layout

**日志结构文件系统（Log-Structured File System，LFS）** 将新的数据和元数据更新集中起来，按日志形式顺序追加到磁盘。

更新产生新版本，索引记录数据的最新位置；旧版本失效后，通过清理和整理回收空间。批量顺序写入可以减少分散写入带来的寻道，读取时则通过索引定位所需内容。

日志恢复关注事务怎样安全完成，日志结构布局进一步决定数据怎样组织在磁盘上。

## Log-Structured Merge Tree

### Memtable and SSTable

**日志结构合并树（Log-Structured Merge Tree，LSM Tree）** 把频繁的小更新先积累在内存中，再批量写成磁盘上的有序文件。

1. 写入先进入按 key 组织的内存表 **Memtable**。
2. 表达到容量阈值后，刷写为磁盘上的有序表文件 **SSTable**。
3. 已生成的表文件保持不可变，后续更新进入新的内存表和新文件。
4. 后台通过 **合并（Compaction）** 归并有序文件，整理版本和层级。

读操作需要结合内存表与磁盘表中的信息取得所需版本。写入恢复日志可以重建尚未刷盘的内存表。

### Example

**内存表与多个磁盘表中保存不同批次的键。**

- 内存表：`key1, key2, key3, key4`。
- 磁盘表一：`key1, key2, key3, key4`。
- 磁盘表二：`key3, key4, key7, key8`。
- 磁盘表三：`key5, key6, key8, key9`。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150149.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

不同表的键可能重叠，需要结合版本判断哪个值有效。合并时，把多个有序表归并成新的有序表，并清理已经过时的记录。

### Layer-by-Layer Compaction

磁盘文件可以组织成多个层次，较深的层容纳更多数据。某层达到容量限制后，选择文件与下一层中键范围重叠的文件进行合并。

一个合并例子是：将 $C_2$ 中的 $T_{22}$ 与 $C_3$ 中的 $T_{32},T_{33}$ 合并，在 $C_3$ 中生成 $T_{35},T_{36},T_{37}$。

SSTable 内部由数据块和索引块组成，索引用于定位要读取的数据块。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150200.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

以 LevelDB 的层级示例为例，$L\ge1$ 时，第 $L$ 层容量按 $10^L$ MB 增长：第 $1$ 层为 $10$ MB，第 $2$ 层为 $100$ MB。内存表刷入的 Level 0 单独管理，再逐步向更深层合并。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150213.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

LSM 利用批量写入减少随机 I/O，代价是查询可能检查多个表，后台合并也会产生额外读写。删除可以先写入删除标记，再在合并时清理旧记录。

## Network File System

### Remote File Access

**网络文件系统（Network File System，NFS）** 让程序通过通常的文件接口访问远程服务器上的文件。客户端把文件操作转换成远程请求，服务器再通过自己的文件系统访问存储。

NFS 起源于 Sun 的系统。这里采用传统的无状态 NFS 模型，讨论挂载、远程调用和客户端缓存；NFSv4 则会维护打开文件等状态。

跨机器调用使用 **远程过程调用（Remote Procedure Call，RPC）**；**外部数据表示（External Data Representation，XDR）** 统一参数和返回值的编码，使不同机器、操作系统可以交换数据。

### Mounting

把服务器上的某个目录挂载到客户端目录树后，远程目录成为本地路径的一部分。

挂载时，需要明确指定服务器名和远程目录；挂载完成后，程序可以按普通路径访问其中的文件。

挂载点原有内容会被新挂载的目录遮住，卸载后可以再次看到原有内容。

#### Example

**客户端 U 依次挂载服务器 S1 和 S2 的目录。**

1. 将 `S1:/usr/shared` 挂载到 `U:/usr/local`。
2. 再将 `S2:/usr/dir2` 挂载到 `U:/usr/local/dir1`。

第二次挂载发生在第一次挂载得到的目录子树中，称为**级联挂载（Cascading Mounts）**。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px; max-width: 856px; margin: 0 auto;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150232.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150241.png" style="width: calc((100% - 16px) / 2); min-width: 0; height: auto; display: block; margin: 0;" />
</div>

<details>
<summary>访问这些本地路径时，实际访问哪台服务器？</summary>

第一次挂载后，访问 U 的 `/usr/local`，实际进入 S1 的 `/usr/shared`。

第二次挂载后，访问 U 的 `/usr/local/dir1`，会进一步切换到 S2 的 `/usr/dir2`。例如：

`U:/usr/local/dir1/report.txt` 对应 `S2:/usr/dir2/report.txt`。

VFS 根据挂载信息选择要访问的文件系统；NFS 客户端向相应服务器发送请求。挂载改变的是 U 看到的目录视图，S1 和 S2 的原有目录结构保持不变。

</details>

### Mount Protocol

挂载协议建立客户端对远程目录的初始访问关系：

1. 客户端发送服务器名、待挂载目录等信息。
2. 服务器检查**导出列表（Export List）**和权限，确定该目录是否允许该客户端挂载。
3. 成功后返回**文件句柄（File Handle）**，其中包含定位文件系统及目标目录所需的标识。
4. 客户端把句柄与本地挂载点关联，后续访问据此定位远程对象。

### NFS Protocol and Architecture

传统 NFS 提供目录查找、读取目录项、链接与目录操作、属性访问以及文件读写等远程过程。

**无状态**表示服务器无需为客户端保存上一次读到了哪里等打开会话状态。一次读取请求需要带上文件句柄、文件内偏移和读取长度，服务器便可独立处理。

在这一模型中，远程协议没有对应的 `open`、`close` 状态维护过程；这些接口所需的管理由客户端组织。传统 NFS 核心协议中的并发访问还需要额外的协调机制。

访问路径包含三层：

1. **UNIX 文件接口**：应用调用 `open/read/write/close`。
2. **VFS**：判断本地或远程文件，并选择具体实现。
3. **NFS 服务层**：通过 RPC 发送请求，由服务器执行并返回结果。

服务器收到请求后，还会经自己的 VFS 和本地文件系统完成存储访问。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150328.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

路径可以按目录分量逐级查找，客户端缓存目录查找结果、文件属性和数据块来减少远程请求。使用缓存数据前，需要按相应规则检查属性是否仍有效。

传统同步写模型要求成功回复前把修改保存到稳定存储；客户端收到这一确认后，才可以释放相应的待写缓存。

## WAFL File System

### Write-Anywhere File Layout

**WAFL（Write-Anywhere File Layout）** 用于 NetApp 的 Filer 网络存储设备，可以向外提供 NFS、CIFS 等文件服务，也可支持 HTTP、FTP 访问。

它在 Berkeley Fast File System 的基础上进行了较大修改，重点优化随机 I/O 与写入。非易失内存可以缓存写请求，再组织后续磁盘写入。

WAFL 把文件系统组织成一棵块树：根 inode 指向 inode 文件，再通过其中的 inode 找到各文件的数据。空闲块位图、空闲 inode 位图也作为文件保存。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20261123150342.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Snapshots

**快照（Snapshot）** 保留文件系统在某个时刻的视图。创建快照时，保存对应的根和引用关系，原有数据块可以由当前版本与快照共享。

之后修改某个块时，把新内容写入新的空闲块，并更新当前版本的指针；快照继续通过旧指针访问旧块。

因此，创建快照无需立即复制全部文件数据，新增空间主要来自后续修改保留下来的版本。旧块在不再被当前文件系统或任何快照引用后，可以回收。

### Example

**文件系统中有 A、B、C、D、E 五个块，创建快照后修改 D。**

> **图片占位：** `ch11.pdf` 第 65 页，截取三幅快照图，保留 `root inode`、`new snapshot` 以及 D、D′ 的指向关系。

<details>
<summary>三个阶段分别保留哪些数据？</summary>

**创建快照前：** 当前根指向 A、B、C、D、E。

**刚创建快照：** 当前版本和快照共享 A、B、C、D、E，无需复制这五个数据块。

**修改 D 后：**

- 新内容写入 D′，当前版本改为指向 D′。
- 快照仍指向旧的 D。
- A、B、C、E 没有变化，两者继续共享。

访问当前文件系统得到修改后的内容，访问快照得到创建快照时的内容。

</details>

## Exercises

### Maximum File Size

**一个类似 Pintos 的文件系统采用如下 inode 结构，最大支持多大的文件？**

块大小为 $1024$ B，块指针类型为 `uint32_t`，inode 本身占一个块。

```c
#define BLOCKSIZE 1024
typedef uint32_t block_sector_t;

struct inode_disk {
    block_sector_t direct_pointers[12];
    block_sector_t indirect_pointer;
    block_sector_t double_indirect_pointer;
    block_sector_t triple_indirect_pointer;
    /* 其他字段；整个 inode_disk 占一个 BLOCKSIZE */
};

struct indirect_block {
    block_sector_t block_nums[BLOCKSIZE / sizeof(block_sector_t)];
};
```

<details>
<summary>展开计算</summary>

`uint32_t` 占 $4$ B，所以一个索引块能存：

$$
n=\frac{1024}{4}=256
$$

个块地址。

直接、一级间接、二级间接、三级间接部分分别能指向 $12、256、256^2、256^3$ 个数据块。因此：

$$
\boxed{S_{\max}=1024(12+256+256^2+256^3)\text{ B}}
$$

$$
\boxed{S_{\max}=17{,}247{,}252{,}480\text{ B}}
$$

这里计算的是文件的数据容量。inode 和索引块占用的空间属于额外元数据，不加进文件大小。

</details>

### Disk Accesses for a 512-Byte Read

**使用上一题的 inode 结构，读取文件中连续的 512 B，最少和最多需要多少次磁盘访问？**

没有预先缓存，读取 inode 也计入访问次数；一次请求中已经读入的 inode 和各级索引块可以重复使用。

<details>
<summary>答案：最少 2 次，最多 8 次</summary>

**最少：512 B 全部位于一个直接数据块内。**

读取 inode，取得直接指针，再读取数据块：

$$
\boxed{1\text{ 次 inode}+1\text{ 次数据块}=2\text{ 次}}
$$

**最多：512 B 横跨相邻的两个数据块，并经过最深的索引路径。**

每个数据块为 $1024$ B，连续 $512$ B 最多跨两个数据块。以下两种位置都可以达到 $8$ 次。

**情况一：跨二级间接区域的最后一块与三级间接区域的第一块。**

- inode：$1$ 次。
- 前一个数据块：二级索引根、一级索引块、数据块，共 $3$ 次。
- 后一个数据块：三级索引根、二级索引块、一级索引块、数据块，共 $4$ 次。

$$
\boxed{1+3+4=8\text{ 次}}
$$

**情况二：位于三级间接区域内，跨两个不同二级索引子树的边界。**

- inode：$1$ 次。
- 两个数据块共用的三级索引根：$1$ 次。
- 两个不同的二级索引块：$2$ 次。
- 两个不同的一级索引块：$2$ 次。
- 两个数据块：$2$ 次。

$$
\boxed{1+1+2+2+2=8\text{ 次}}
$$

这已经覆盖两个数据块所能经过的最多不同索引块。请求内可以复用 inode 和共同的索引块，所以不能把两个完整访问路径重复累加。

若两个数据块只跨越同一二级索引块下的两个一级索引块，三级根和二级索引都可复用，此时为 $1+1+1+2+2=7$ 次。

**读取的数据量相同，文件中的位置不同，所需 I/O 次数也可能不同。**

</details>
