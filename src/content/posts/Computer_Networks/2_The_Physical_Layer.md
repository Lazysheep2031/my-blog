---
title: The Physical Layer
published: 2026-09-21
description: 物理层基础：傅里叶分析、带限信号、码间干扰、奈奎斯特与香农公式，以及本次讲到的有线传输介质与光纤基础
tags: [计算机网络]
category: 笔记
draft: false
---

## The Physical Layer

**物理层（Physical Layer）** 是协议模型的最低层，规定比特如何表示为物理信号，以及这些信号如何通过信道传送。

```text
发送端比特 → 电压／电流／光脉冲等信号 → 物理信道 → 接收信号 → 恢复比特
```

## The theoretical basis for data communication

### Fourier Series

**傅里叶级数（Fourier Series）** 把一个满足相应条件的周期信号，写成不同频率的正弦、余弦或复指数信号的加权和。

#### Signals, Periods, and Frequencies

周期信号满足：

$$
g(t)=g(t+nT_0),\qquad n\in\mathbb Z
$$

其中 $T_0$ 是**基本周期**，对应的**基频（Fundamental Frequency）** 为：

$$
f_0=\frac{1}{T_0}
$$

第 $n$ 次 **谐波（Harmonic）** 的频率为 $nf_0$。
例如，若 $T_0=8$ 个时间单位，则 $f_0=1/8$；谐波频率依次为 $1/8,2/8,3/8,\ldots$。

#### Complex Form and Projection

复指数形式为：

$$
g(t)=\sum_{n=-\infty}^{+\infty}a_ne^{j2\pi nf_0t}
$$

$$
a_n=\frac{1}{T_0}\int_0^{T_0}g(t)e^{-j2\pi nf_0t}\,dt
$$

这里 $j^2=-1$，$a_n$ 是第 $n$ 个频率成分的系数，通常可以是复数。**知道周期及全部系数，就可以按展开式重构信号。**

<details>
<summary>为什么乘上一个基函数后积分，就能提取相应系数？</summary>

将级数两边乘以 $e^{-j2\pi kf_0t}$，在一个周期内积分：

$$
\frac{1}{T_0}\int_0^{T_0}g(t)e^{-j2\pi kf_0t}\,dt
=
\sum_n a_n\frac{1}{T_0}\int_0^{T_0}e^{j2\pi(n-k)f_0t}\,dt
$$

利用 $f_0T_0=1$，右边的积分满足：

$$
\frac{1}{T_0}\int_0^{T_0}e^{j2\pi(n-k)f_0t}\,dt
=
\begin{cases}
1,&n=k,\\
0,&n\ne k.
\end{cases}
$$

因此只剩 $a_k$

</details>

#### Real Form and Fourier Coefficients

对于实信号，正、负频率的系数满足：

$$
a_{-n}=a_n^*
$$

令 $a_n=A_n-jB_n$，把正负频率配对，可写成：

$$
\boxed{
g(t)=C+2\sum_{n=1}^{\infty}A_n\cos(2\pi nf_0t)
+2\sum_{n=1}^{\infty}B_n\sin(2\pi nf_0t)
}
$$

$$
A_n=\frac{1}{T_0}\int_0^{T_0}g(t)\cos(2\pi nf_0t)\,dt
$$

$$
B_n=\frac{1}{T_0}\int_0^{T_0}g(t)\sin(2\pi nf_0t)\,dt,
\qquad
C=\frac{1}{T_0}\int_0^{T_0}g(t)\,dt
$$

**$C$ 是信号的平均值，也是频率为 0 的直流分量（DC Component）。** 
$C>0$ 时波形整体上移，$C<0$ 时整体下移；正弦、余弦成分负责描述相对于平均值的变化。


<details>
<summary>展开：实数形式与正交积分的推导</summary>

由 $a_n=A_n-jB_n$ 和共轭关系，配对的两项为：

$$
\begin{aligned}
a_ne^{j\theta}+a_{-n}e^{-j\theta}
&=(A_n-jB_n)(\cos\theta+j\sin\theta)\\
&\quad +(A_n+jB_n)(\cos\theta-j\sin\theta)\\
&=2A_n\cos\theta+2B_n\sin\theta,
\end{aligned}
$$

其中 $\theta=2\pi nf_0t$。

对正整数 $n,k$，在一个完整周期内：

$$
\int_0^{T_0}\sin(2\pi nf_0t)\sin(2\pi kf_0t)\,dt
=
\begin{cases}
0,&n\ne k,\\
T_0/2,&n=k.
\end{cases}
$$

余弦与余弦满足相同关系；正弦与余弦的乘积积分为 0。正弦、余弦自身在完整周期内的积分也为 0。

例如，两边乘 $\sin(2\pi kf_0t)$ 再积分，直流项、余弦项以及其他正弦项全部消失，仅留下：

$$
\int_0^{T_0}g(t)\sin(2\pi kf_0t)\,dt
=2B_k\cdot\frac{T_0}{2}=T_0B_k.
$$

于是得到 $B_k$ 的公式。求 $A_k$ 时改乘余弦即可。

</details>

#### Example: The Bit Pattern 01100010

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921153435.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**用 8 个等长时间区间发送 `01100010`。**

把每位的时间归一化为 1，则一个周期 $T_0=8$，$f_0=1/8$。在 $[0,8)$ 内，波形为：

$$
g(t)=
\begin{cases}
1,&1\le t<3\text{ 或 }6\le t<7,\\
0,&\text{其余时刻}.
\end{cases}
$$

**它的直流分量是 $3/8$**，因为 8 个时间单位中有 3 个单位处于高电平。

<details>
<summary>求 C、Aₙ 与 Bₙ</summary>

只有 $[1,3)$ 和 $[6,7)$ 对积分有贡献：

$$
C=\frac18\left(\int_1^3 1\,dt+\int_6^7 1\,dt\right)
=\frac{2+1}{8}=\frac38.
$$

余弦系数为：

$$
\begin{aligned}
A_n
&=\frac18\left[\int_1^3\cos\left(\frac{\pi nt}{4}\right)dt
+\int_6^7\cos\left(\frac{\pi nt}{4}\right)dt\right]\\
&=\frac{1}{2\pi n}\left[
\sin\frac{3\pi n}{4}-\sin\frac{\pi n}{4}
+\sin\frac{7\pi n}{4}-\sin\frac{6\pi n}{4}
\right].
\end{aligned}
$$

按相同方法，对正弦积分，得到：

$$
B_n=\frac{1}{2\pi n}\left[
\cos\frac{\pi n}{4}-\cos\frac{3\pi n}{4}
+\cos\frac{6\pi n}{4}-\cos\frac{7\pi n}{4}
\right].
$$

</details>

#### Reconstruction from Harmonics


$$
g_N(t)=C+2\sum_{n=1}^{N}\left[A_n\cos(2\pi nf_0t)+B_n\sin(2\pi nf_0t)\right]
$$

谐波数较少时，重构波形比较圆滑、粗略；谐波数增加后，波形更接近原始矩形脉冲。**快速的边沿变化需要较丰富的高频成分。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921153706.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Example

**Finding Frequencies in Noise**

**原始信号由 100 Hz 和 260 Hz 两个成分组成。**

$$
x(t)=\cos(2\pi\cdot100t)+\sin(2\pi\cdot260t)
$$

加上较强的随机噪声后，时域曲线显得杂乱；做傅里叶分析，仍能在 **100 Hz、260 Hz 附近看到明显谱峰**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921153804.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />


### Bandwidth-limited Signals

#### Attenuation and Distortion

实际信道传输信号时会有能量损失，即**衰减（Attenuation）**。更关键的问题是，信道对不同频率成分的影响往往不同。

| 情况 | 对接收波形的影响 |
| --- | --- |
| 理想比较：各频率成分按同一比例衰减 | 波形形状保持，整体幅度变小 |
| 不同频率成分衰减程度不同 | 各成分的相对比例改变，重构后的波形失真 |
| 高频成分被强烈衰减 | 原本陡峭的边沿难以保持，波形变得平滑或展宽 |

#### Bandwidth and Cutoff Frequency

**带宽（Bandwidth）** 是一个频率范围的宽度，单位为 **Hz**。

信道：**能够通过且未被强烈衰减的频率范围的宽度**。若范围为 $[f_{\mathrm{low}},f_{\mathrm{high}}]$，则：

$$
\boxed{B=f_{\mathrm{high}}-f_{\mathrm{low}}}
$$

对于低通信道近似，信号从 0 到**截止频率（Cutoff Frequency）** $f_c$ 基本通过，更高的频率被明显衰减，因此 $B=f_c$。

#### Periodic and Non-periodic Spectra

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921175144.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

| 信号 | 频谱 | 原因或含义 |
| --- | --- | --- |
| 周期复合信号 | 一根根离散谱线 | 傅里叶级数的频率为基频的整数倍 |
| 非周期复合信号 | 连续频谱 | 本页用连续频率成分描述非周期信号 |

两幅图的频率范围都从 1000 Hz 到 5000 Hz，所以：

$$
B=5000-1000=4000\ \text{Hz}.
$$

**频谱是否连续，与带宽如何计算是两个问题。**

#### Baseband and Passband Signals

**基带信号（Baseband Signal）** 的频率范围从零附近延伸至某个最高频率；
**带通信号（Passband Signal）** 占据较高的一段频率范围。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921175234.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

频谱搬移：

$$
s(t)=x(t)\cos(2\pi f_ct).
$$

这里 $f_c$ 表示**载波频率（Carrier Frequency）**；前面讨论低通信道时的 $f_c$ 表示截止频率。

**调幅（Amplitude Modulation）**：信号频率 200 Hz，载波频率 4000 Hz，高频载波的幅度随低频信号变化。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921175345.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**调频（Frequency Modulation）**：调制信号频率 500 Hz，载波频率 50000 Hz，波形的疏密随信号变化，即瞬时频率变化。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921175444.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>频谱搬移与解调</summary>

把载波写为复指数的和：

$$
\cos(2\pi f_ct)=\frac12e^{j2\pi f_ct}+\frac12e^{-j2\pi f_ct}.
$$

于是，两个频谱副本可写成：

$$
S(f)=\frac12X(f-f_c)+\frac12X(f+f_c).
$$

它说明原频谱被移到 $+f_c$、$-f_c$ 附近，并各带有 $1/2$ 系数。

对于这里的乘法调制例子，接收端再次乘以同频同相的载波：

$$
\begin{aligned}
s(t)\cos(2\pi f_ct)
&=x(t)\cos^2(2\pi f_ct)\\
&=\frac12x(t)+\frac12x(t)\cos(4\pi f_ct).
\end{aligned}
$$

在低频项与高频项能够分离的前提下，再用低通滤波器去掉高频项，就能取得与原信号成比例的 $x(t)/2$，随后作幅度恢复。

</details>

#### Bandwidth and Data Rate

模拟带宽 ：可使用的频率范围有多宽 (Hz)
网络中所说的数字带宽 ：信道能够支持的最大数据传输速率 (bit/s)

<details>
<summary>带宽固定，发送更快为什么更难保留波形？</summary>

继续使用 `01100010` 这个 8 位模式。若比特率为 $R_b$，则：

$$
T_0=\frac8{R_b},\qquad f_0=\frac{R_b}{8}.
$$

在近似为 3000 Hz 截止的电话信道上，能够通过的最高谐波阶数约为：

$$
n_{\max}\approx\left\lfloor\frac{3000}{f_0}\right\rfloor
=\left\lfloor\frac{24000}{R_b}\right\rfloor.
$$

| 比特率 $R_b$ | 基频 $f_0$ | 约能通过到第几次谐波 |
| --- | --- | --- |
| 2400 bit/s | 300 Hz | 10 |
| 4800 bit/s | 600 Hz | 5 |
| 9600 bit/s | 1200 Hz | 2 |
| 19200 bit/s | 2400 Hz | 1 |
| 38400 bit/s | 4800 Hz | 0 |

**同一模式发送得越快，其频率成分整体越高；在固定带宽内保留的谐波越少，矩形波形越难保持。**

</details>

### The Maximum Data Rate of a Channel

**信道容量（Channel Capacity）** 是在给定条件下，一条信道能够支持的最大数据传输速率。

#### Four Related Concepts

1. 数据率(Data rate (bps)) ：每秒传输的比特数，单位 bit/s，比特率越高，每比特持续时间越短。
2. 带宽(Bandwidth) ：信道可用的频率范围宽度，单位 Hz ，既受介质性质限制，也可受发射端主动限制。
3. 噪声(Noise) ：叠加到接收信号上的非期望扰动 ，会影响对信号取值的区分。
4. 误码率(Error rate) ：比特被判错的比例，例如发送 1、收到 0 ；与信号强度、噪声及传输方式有关。


区分三个量：

$$
\text{比特率 }R_b\ (\text{bit/s}),\qquad
\text{码元率 }R_s\ (\text{symbol/s}),\qquad
\text{频率带宽 }B\ (\text{Hz}).
$$

**码元（Symbol）** 是一次信号取值；一个码元可以表示一个或多个比特。

$$
R_b=R_s\times\text{每码元的比特数}.
$$

#### Inter-Symbol Interference

**码间干扰（Inter-Symbol Interference，ISI）** 指其他码元的波形影响了当前码元采样时刻的接收值。

从理想矩形脉冲出发：

$$
g(t)=
\begin{cases}
1,&-T/2\le t\le T/2,\\
0,&\text{其他时刻}.
\end{cases}
$$

其傅里叶变换为：

$$
G(f)=\frac{\sin(\pi fT)}{\pi f}
=T\operatorname{sinc}(fT),
\qquad
\operatorname{sinc}(x)=\frac{\sin(\pi x)}{\pi x}.
$$

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921180813.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

这个矩形脉冲只在有限时间内非零，但频谱一直延伸到无穷远：**低频主瓣包含大量能量，高频旁瓣虽然逐渐减弱，却没有在某个有限频率之后全部消失。**

由这个公式还能看出，第一对零点在 $f=\pm1/T$，因此：

$$
\boxed{\text{时间域脉冲越窄，频域主瓣越宽}}
$$

<details>
<summary>为什么矩形脉冲的频谱是 sinc 形？</summary>

$$
\begin{aligned}
G(f)
&=\int_{-\infty}^{\infty}g(t)e^{-j2\pi ft}\,dt\\
&=\int_{-T/2}^{T/2}e^{-j2\pi ft}\,dt\\
&=\frac{e^{j\pi fT}-e^{-j\pi fT}}{j2\pi f}\\
&=\frac{\sin(\pi fT)}{\pi f}.
\end{aligned}
$$

$f=0$ 时按极限取 $G(0)=T$，也就是矩形脉冲的面积。

使用幅度 $A$、宽度 $\tau$，因此公式相应为：

$$
S(f)=A\tau\,\frac{\sin(\pi\tau f)}{\pi\tau f}.
$$

</details>

**矩形脉冲经过带限信道后会发生什么？**

```text
理想矩形脉冲
    ↓ 原频谱含有无限延伸的旁瓣
带限信道只保留一部分频率成分
    ↓ 重新组成时域波形
边沿变缓、出现延伸到相邻码元区间的拖尾
    ↓
若拖尾在相邻码元的采样时刻不为零，就形成码间干扰
```

原本时间上局限的矩形脉冲经过带宽限制后，波形会在时间上展宽。

**时限与带限。** 时限信号只在有限时间区间内非零；带限信号只在有限频率区间内含有非零频率成分。

**要避免 ISI，需要控制相邻码元采样时刻的贡献。波形在时间上有重叠，并不自动意味着采样时发生干扰。**

#### Nyquist Bandwidth

**奈奎斯特准则的核心问题：在带宽有限、无噪声的理想信道中，怎样尽可能快地发送码元，同时保证采样时无 ISI？**

用以下模型表示码元序列：

$$
s(t)=\sum_{n}a_ng(t-nT_s).
$$

这里 $a_n$ 是第 $n$ 个码元的取值，$g(t)$ 是承载它的基本脉冲，$T_s$ 是相邻码元的间隔。此处的 $a_n$ 与前面傅里叶级数系数属于不同上下文。

**$g(t-nT_s)$ 是脉冲平移；若码元取值任意变化，整个 $s(t)$ 不必是周期信号。**

对**单边带宽为 $B$ 的理想低通信道**，取：

$$
g(t)=\frac{\sin(2\pi Bt)}{2\pi Bt}
=\operatorname{sinc}(2Bt),
\qquad
T_s=\frac{1}{2B}.
$$

则它在码元采样点满足：

$$
g(nT_s)=
\begin{cases}
1,&n=0,\\
0,&n\ne0.
\end{cases}
$$

**当前脉冲在自己的中心取 1，其他脉冲在这个采样点取 0。** 因此，尽管各 sinc 脉冲的尾巴在时间轴上相互重叠，采样值仍可以只包含当前码元。

由此得到最重要的码元率上限：

$$
\boxed{R_{s,\max}=2B\quad\text{symbol/s}}
$$

<details>
<summary> sinc 脉冲为什么能在采样点实现零 ISI？</summary>

第一步，检查脉冲自身在采样点的值。因为 $T_s=1/(2B)$：

$$
g(nT_s)=\frac{\sin(2\pi BnT_s)}{2\pi BnT_s}
=\frac{\sin(n\pi)}{n\pi}.
$$

$n\ne0$ 为整数时，分子为 0、分母非零，所以结果为 0。

$n=0$ 时按连续延拓定义：

$$
g(0)=\lim_{t\to0}\frac{\sin(2\pi Bt)}{2\pi Bt}=1.
$$

**转写校对：** 记录中“0 除以 0 等于 1”的口头说法应由上面的极限表达；$0/0$ 本身没有定义。

第二步，在接收时刻 $t=kT_s$ 代入整个信号：

$$
\begin{aligned}
s(kT_s)
&=\sum_n a_ng((k-n)T_s)\\
&=a_kg(0)+\sum_{n\ne k}a_n\cdot0\\
&=a_k.
\end{aligned}
$$

第三步，检查它没有使用超出信道范围的频率。：

$$
G(f)=\frac{1}{2B}\operatorname{rect}\left(\frac{f}{2B}\right)
=
\begin{cases}
1/(2B),&|f|\le B,\\
0,&\text{其他频率}.
\end{cases}
$$

因此，这个脉冲同时满足本例的两个要求：**频谱限制在信道内，且相邻采样时刻的脉冲值为零。**

</details>

**从码元率到比特率。** 若每个码元有 $V$ 种可区分取值，那么每码元可表示 $\log_2V$ bit：

$$
\boxed{C_{\mathrm{Nyquist}}=2B\log_2V\quad\text{bit/s}}
$$

| 码元取值数 $V$ | 2 | 4 | 8 | 16 | 64 | 256 |
| --- | --- | --- | --- | --- | --- | --- |
| 每码元比特数 $\log_2V$ | 1 | 2 | 3 | 4 | 6 | 8 |

二元信号 $V=2$ 时，$C=2B$ bit/s。四元信号 $V=4$ 时，每个码元表示 2 bit，因而 $C=4B$ bit/s。

**保持带宽不变，持续增加 $V$ 能不能提高数据率？**

公式上可以，但接收端需要区分更多取值。
两种电平容易区分；改成 4、8、16 种电平后，判决负担增加，噪声及其他损伤会限制实际可用的级数。

> 有限带宽先限制理想无 ISI 的码元率；只有给定有限的 $V$，才得到相应的有限比特率上限。

**无噪声的 3 kHz 信道，使用二元信号，最大数据率是多少？**

<details>
<summary>展开解答</summary>

$$
B=3000\ \text{Hz},\qquad V=2.
$$

$$
C=2B\log_2V=2\times3000\times1
=6000\ \text{bit/s}=6\ \text{kbit/s}.
$$

</details>

#### Shannon Capacity

**香农容量公式考虑噪声：在带限的加性白高斯噪声信道（AWGN）中，最大可靠数据率是多少？**

$$
\boxed{C_{\mathrm{Shannon}}=B\log_2(1+\mathrm{SNR})\quad\text{bit/s}}
$$

| 符号 | 含义 |
| --- | --- |
| $B$ | 信道带宽，单位 Hz |
| $S$ | 信号功率 |
| $N$ | 所考虑带宽内的噪声功率 |
| $\mathrm{SNR}=S/N$ | 线性信噪比，无量纲 |
| $C$ | 该模型下理论上的最大可靠数据率 |

$$
\mathrm{SNR}_{\mathrm{dB}}=10\log_{10}\frac{S}{N}
$$

$$
\boxed{\frac{S}{N}=10^{\mathrm{SNR}_{\mathrm{dB}}/10}}
$$

根据上式：

| 信噪比 | 线性比值 $S/N$ |
| --- | --- |
| 0 dB | 1 |
| 10 dB | 10 |
| 20 dB | 100 |
| 30 dB | 1000 |
| 40 dB | 10000 |

这里有两种不同底数：**容量公式用 $\log_2$，dB 换算用 $\log_{10}$**。
> 题目若给分贝，必须先换算。

**取带宽 1 MHz、信噪比 40 dB，求信道容量。**

<details>
<summary>展开解答</summary>

先换算信噪比：

$$
S/N=10^{40/10}=10^4=10000.
$$

再计算：

$$
\begin{aligned}
C
&=10^6\log_2(1+10000)\\
&\approx 1.3288\times10^7\ \text{bit/s}\\
&\approx13.29\ \text{Mbit/s}.
\end{aligned}
$$

</details>

#### High-SNR and Low-SNR Regimes

**高信噪比：** 当 $S/N\gg1$ 时，$1+S/N\approx S/N$，因此：

$$
C\approx B\log_2(S/N).
$$

若信噪比保持不变，容量与带宽成正比。

**低信噪比：** 假设信号功率 $P$ 固定，白噪声的单边功率谱密度为 $N_0$，则带宽为 $B$ 时：

$$
N=N_0B,\qquad \mathrm{SNR}=\frac{P}{N_0B}.
$$

当信噪比远小于 1，利用 $\ln(1+x)\approx x$，得到：

$$
\boxed{C\approx\frac{P}{N_0\ln2}}
$$

**在固定信号功率、固定白噪声谱密度的这一极限下，继续扩大带宽带来的容量收益变小。** 因为可用频率范围扩大时，接收的噪声功率也增加。

<details>
<summary>低信噪比时为什么带宽 B 会消去？</summary>

$$
\begin{aligned}
C
&=B\log_2\left(1+\frac{P}{N_0B}\right)\\
&=\frac{B}{\ln2}\ln\left(1+\frac{P}{N_0B}\right)\\
&\approx\frac{B}{\ln2}\cdot\frac{P}{N_0B}\\
&=\frac{P}{N_0\ln2}.
\end{aligned}
$$

两个前提：$P,N_0$ 固定，以及 $P/(N_0B)\ll1$。

</details>

#### Nyquist and Shannon Compared

| 比较项 | 奈奎斯特 | 香农 |
| --- | --- | --- |
| 关注问题 | 带限条件下怎样避免采样时的码间干扰 | 噪声存在时能支持多大的可靠数据率 |
| 模型 | 理想无噪声、无 ISI；给定 $V$ 种码元取值 | 带限加性白高斯噪声；给定带宽与信噪比 |
| 核心公式 | $R_s\le2B$，$R_b\le2B\log_2V$ | $R_b\le B\log_2(1+S/N)$ |
| 直接出现的额外参数 | 信号级数 $V$ | 信噪比 $S/N$ |
| 关键限制 | 提高级数增加每码元比特数，但接收判决更困难 | 信噪比不支持时，更多级数不能提供同等可靠的信息量 |

**当一道题的设定使两个上限都适用，分别计算，再取较小者：**

$$
\boxed{
R_b\le\min\left\{2B\log_2V,\ B\log_2(1+S/N)\right\}
}
$$

#### Data Rate, Noise, and Errors

**相同持续时间的噪声，在更高比特率下可能影响更多比特；噪声功率一定时，提高信号功率有利于正确接收。**

第一组关系可由比特持续时间看出：

$$
T_b=\frac1{R_b}.
$$

## Three kinds of transmission media

介质分为**有线／导引介质、无线介质、卫星通信**三个部分。

### Guided Transmission Media

#### Persistent Storage

**持久化存储（Persistent Storage）** 也可以承担数据转移：先把数据写入磁带、磁盘或固态存储，再把介质实际运到目的地，最后读出。

```text
写入存储介质 → 搬运／运输介质 → 在目的端读取
```

装满移动硬盘的货车在高速公路上行驶：**单次搬运的数据量可能极大，折算的平均传输速率也可能很高，但等待时间很长。**

这里的“带宽”采用数据率语境，即：

$$
\text{等效平均数据率}=\frac{\text{运送的数据量}}{\text{所用时间}}.
$$

因此，它可以适合批量迁移、归档等重视每比特成本或总数据量的任务；网页交互、视频会议、在线游戏等实时场景难以接受按小时或天计算的时延。

<details>
<summary>一箱磁带的等效传输速率</summary>

每盘磁带 800 GB，一箱 1000 盘，共：

$$
800\times1000\ \text{GB}=800\ \text{TB}=6400\ \text{Tb}.
$$

若运输耗时 24 小时：

$$
R=\frac{6400\times10^{12}}{24\times3600}
\approx 7.407\times10^{10}\ \text{bit/s}
=74.07\ \text{Gbit/s}.
$$

若只运输 1 小时：

$$
R=\frac{6400\times10^{12}}{3600}
\approx1777.78\ \text{Gbit/s}.
$$
即使一次运送很多数据，目的端也需要等介质到达后才能使用。

</details>

#### Twisted Pairs

**双绞线（Twisted Pair）** 由两根彼此绝缘的铜线螺旋绞合而成。一根网线中可以包含多对双绞线。

**为什么要绞合？** 平行导线容易辐射或受到电磁干扰；绞合有助于减小干扰和线对间的串扰。

**为什么通常传递两根线的电压差？** 设两根线上的电压为 $V_1,V_2$，接收端关注 $V_1-V_2$。根据共同扰动解释，若外界噪声对两根线近似同样影响：

$$
(V_1+n)-(V_2+n)=V_1-V_2.
$$

因此，共同的噪声分量可以在取差时抵消。

**双绞线既可传模拟信息，也可传数字信息。** 支持的速率取决于线材、长度及使用方法。

两种以太网用线方式：

| 示例 | 线对使用方法 | 接收端要求 |
| --- | --- | --- |
| 100 Mbit/s 以太网 | 四对中用两对，每个方向各一对 | 发送和接收分用线对 |
| 1 Gbit/s 以太网 | 四对全部使用，每对同时承担两个方向 | 接收端还需消除本端发送信号的影响 |

**非屏蔽双绞线（UTP）** 没有额外的金属屏蔽结构。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921181943.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

单工（Simplex）：只允许一个方向。
半双工（Half-duplex）：两个方向都允许，但同一时刻只能一个方向。
全双工（Full-duplex）：两个方向可以同时进行。


#### Coaxial Cable

**同轴电缆（Coaxial Cable）** 的结构由内到外依次为：

```text
铜芯 → 绝缘材料 → 编织网状外导体 → 塑料保护套
```

内外导体围绕同一轴线排列。其结构与屏蔽提供较好的抗干扰能力。

典型用途包括有线电视、城域网和家庭互联网接入。带宽量级可达数 GHz；这是**频率带宽**，实际能力仍与电缆质量和长度有关。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921182131.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Power Lines

**电力线通信（Power-line Communication）** 把数据信号叠加到低频电力信号上，复用已有电气布线。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921182205.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Fiber Optics

**光纤（Fiber Optics）** 用光在细玻璃纤维中传播来传递信息。应用是长距离骨干网、高速局域网和高速互联网接入。部署时还要考虑最后一公里铺设与传送比特的成本，不能只看介质的带宽潜力。

**光传输系统的三个关键组成部分：光源、传输介质、检测器。**

```text
电信号 → 光源 → 光脉冲 → 光纤 → 检测器 → 电信号
```

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260921182306.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

有光脉冲表示 1、无光脉冲表示 0：发送端把电信号转为光，接收端检测到光后产生电信号。

**全内反射。** 光到达两种介质的边界时可以发生折射和反射；满足全内反射条件时，光被限制在内部继续传播。光纤希望减少光从侧面泄漏，以便把信号送到另一端。

**波长与频率。** 讨论光纤时常用波长描述光。二者满足：

$$
\text{传播速度}=\lambda f.
$$

$c=\lambda f$。在相同传播速度下，波长越长，频率越低。

**光的衰减取决于波长。**

用输入与输出的**功率比**表示损耗时：

$$
\boxed{A_{\mathrm{dB}}=10\log_{10}\frac{P_{\mathrm{in}}}{P_{\mathrm{out}}}}
$$

若长度为 $L$ km，单位长度衰减为 $\alpha$ dB/km，则 $A_{\mathrm{dB}}=\alpha L$。这里取输入功率除以输出功率，所以有损传输的衰减量为正。

<details>
<summary>光功率减半，对应多少分贝的衰减？</summary>

$$
A=10\log_{10}2\approx3.01\ \text{dB}.
$$

功率降为原来的 $1/10$ 时，衰减为 $10$ dB；降为 $1/100$ 时，衰减为 $20$ dB。**功率比使用 $10\log_{10}$。**

</details>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928135924.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

三个光通信窗口，中心波长分别为 **0.85、1.30、1.55 μm**，均位于近红外区域。

0.85 μm 窗口衰减较大，适合较短距离；后两个窗口衰减较低，更适合长距离传输。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928135955.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**光缆结构。** 单根光纤由玻璃纤芯、玻璃包层和外部保护层组成；多根光纤又可封装在同一护套中。包层的折射率低于纤芯，满足相应入射条件时产生全内反射，将光约束在纤芯中。

**多模与单模。** 多模光纤的典型纤芯直径约为 50 μm，可以支持多个传播模式；不同模式的传播时间可能不同，使脉冲展宽。单模光纤的纤芯更细，只支持一个传播模式，避免了不同模式之间的时延差，适合更高数据率和更长距离。


**两种光源。**

| 比较项 | 发光二极管（LED） | 半导体激光器 |
| --- | --- | --- |
| 数据率与距离 | 较低、较短 | 较高、较长 |
| 适用光纤 | 多模 | 多模或单模 |
| 寿命与温度敏感性 | 寿命较长，温度影响较小 | 寿命相对较短，温度影响较大 |
| 成本 | 较低 | 较高 |

**与铜线比较。** 光纤带宽潜力大、衰减低，而且细、轻；玻璃介质不导电，因此不受电磁干扰和电涌的直接影响，也有较好的抗腐蚀能力。正常传输时光被约束在内部，较难窃听。限制是端接、熔接等工作需要专门技能，过度弯折容易造成损耗甚至断裂。**光纤介质不依赖供电，整套通信系统仍需要为两端设备及有源中继供电。**

### Wireless Transmission Media

#### The Electromagnetic Spectrum

无线通信利用电磁波在空间中传播信息。无线电、微波、红外线、可见光处于不同频段，可通过改变波的幅度、频率或相位承载信息。

在真空中 $\lambda f=c$，其中 $c\approx3\times10^8$ m/s。频率越高，波长越短。

100 MHz 对应约 3 m，1 GHz 对应约 0.3 m。实际可用的数据率还取决于**可用带宽、信噪比及传输技术**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928140146.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />


#### Spread Spectrum

多数窄带传输满足 $\Delta f/f_c\ll1$，即占用带宽相对于中心频率很小。

把频谱划成多个较窄的频带，可以安排多个通信信道。另一些系统将信号分布到更宽频带，用于增强对干扰的抵抗能力，或支持不同用户共享频谱。

**跳频扩频（Frequency Hopping Spread Spectrum，FHSS）。** 发送端按双方约定的序列不断切换载波频率；接收端必须按相同序列同步切换。任一短时间段只使用一个频段，较长时间内会跳遍多个频段。

跳频使窄带干扰通常只能影响部分时间，持续跟踪和干扰也更困难；本身不提供完整的数据保密机制。

**直接序列扩频（Direct Sequence Spread Spectrum，DSSS）。** 用变化更快的码序列与数据结合，将信息扩展到更宽频带；接收端利用对应码序列恢复数据。不同用户使用不同码序列，可以形成**码分多址（CDMA）**。

**超宽带（Ultra-Wideband，UWB）。** 以极短脉冲为例：发送一串快速脉冲，通过改变脉冲位置传递信息。时间域脉冲很窄，频谱就很宽，能量分散在很宽的频带内。

矩形脉冲宽度为 $T$ 时，频谱第一对零点位于 $\pm1/T$；$T$ 越小，主瓣越宽。

**跳频改变一段时间内所用的频率；直接序列用高速码序列扩展信号；超宽带方案用极短脉冲形成宽频谱。**

#### Radio Transmission

无线电波易于产生，合适的频段能绕过或穿过部分障碍，适用于室内和室外。

**路径损耗（Path Loss）。** 自由空间中，固定条件下接收功率随距离近似按 $1/r^2$ 减小：距离加倍，接收功率降为 $1/4$，约损失 6 dB；遇到遮挡等情况，损耗还可能更大。

与导引介质的比较：

- **均匀导引介质：** 每增加相同长度，功率按相同比例衰减。例如双绞线每 100 m 损耗 20 dB
- **自由空间无线传播：** 每将距离乘以相同比例，接收功率按相同比例减小。无线信号也可能传播到较远位置，因此用户间干扰需要管理。

**传播方式。** 较低频率的无线电波可以沿地表传播，称为地波；合适频段的无线电波也可以由电离层折返地面，称为天波，支持更远距离通信。较高频率的波更倾向于直线传播，遇到障碍物会产生反射等现象。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928140625.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Microwave Transmission

频率高于约 100 MHz 后，可用近似直线传播的模型讨论定向通信。

**抛物面天线**将能量集中到窄波束中，可提高目标方向的接收信号强度与信噪比，但两端天线必须准确对准。直线传播还会受到地球曲率限制，距离较远时需要中继站；塔越高，可覆盖的视距越远，距离大致随塔高的平方根增加。

**多径衰落（Multipath Fading）。** 同一信号可能经直达、反射、折射等路径抵达接收端。不同路径长度造成时延差和相位差；若两路信号幅度相近、相位相差约 $\pi$，叠加时会明显抵消，使接收信号减弱。因而“接收到多路同一信号”未必增强接收功率。

#### Spectrum Allocation

频谱需要协调使用，避免不同系统相互干扰。

三种频谱使用权分配方式：

1. **比较评审（Beauty Contest）：** 按申请者方案是否满足公共利益、服务要求等条件评选。
2. **抽签（Lottery）：** 在申请者之间随机选择。
3. **拍卖（Auction）：** 通过竞价分配。

**ISM 频段** 为工业、科学、医疗频段，允许符合条件的无线设备使用，无须逐台申请专用频率许可，但仍须遵守功率等要求。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928140904.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Infrared Transmission

**红外通信**适合短距离，电视遥控器是典型例子。其方向性较强，设备便宜、容易制造；不能穿透墙壁等实体障碍，所以相邻房间之间的干扰也较容易被隔开。普通红外系统无须申请无线电频谱许可。

#### Light Transmission

**自由空间光通信**可用激光连接两栋楼，无须沿途铺线，也无须申请无线电频段。双向连接可在两端各放置发射器和检测器。激光束很窄，接收端需要精确对准；雨雾、空气湍流以及温度变化都可能影响链路。

两楼互联案例：夜间调通后，白天链路失效。太阳加热楼体，引起空气对流和折射率变化，光束偏离检测器。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928140948.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Satellite

#### Communication Satellites

通信卫星可看作天空中的中继站：

**上行链路（Uplink）** 把地面信号送往卫星，卫星处理或放大后，通过**下行链路（Downlink）** 送回地面。两者常用不同频率，以避免收发信号相互干扰。卫星波束在地面覆盖的区域称为*覆盖足迹*。

轨道越高，一般覆盖范围越大、传播时延越长，维持大范围覆盖所需的卫星越少；轨道越低，链路距离较短，但卫星相对地面移动较快，需要更多卫星接续覆盖。

#### GEO, MEO, and LEO

**地球静止轨道（GEO）。** 高度约 35,800 km，位于赤道平面的圆轨道，运行周期与地球自转匹配，地面看来位置基本固定，固定天线可以持续对准。

**中地球轨道（MEO）。** 高度与传播时延处于高、低轨之间；卫星在天空中的位置变化，需要跟踪。相对于静止卫星，其覆盖足迹更小，地面到卫星所需发射功率通常更低。轨道高度约 20,200 km 的 GPS 卫星用于导航用途。**GPS 卫星约每 12 小时绕地球一圈**，

**低地球轨道（LEO）。** 距地面较近，传播时延和地面终端功率需求较低，但单颗卫星很快移出视野，需要大量卫星组成星座，并在卫星之间接续服务。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928144538.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>例：GEO 的约 270 ms 时延对应怎样的传播路径？</summary>

按地面到卫星再返回另一地面的理想最短路径估计，传播距离至少约为两倍轨道高度：

$$
t\gtrsim\frac{2\times35\,800\ \text{km}}{300\,000\ \text{km/s}}
\approx0.239\ \text{s}.
$$

考虑斜向传播，地面发送端经卫星到地面接收端的**单程传输时延**约为 250–300 ms，典型值 270 ms。若接收端立即应答，端到端的往返传播时延约为 500–600 ms，还未计入处理和排队。

</details>

#### Satellite Bands

| 频段 | 下行 / 上行 | 带宽 | 限制 |
| --- | --- | --- | --- |
| L | 1.5 / 1.6 GHz | 15 MHz | 带宽小、拥挤 |
| S | 1.9 / 2.2 GHz | 70 MHz | 带宽小、拥挤 |
| C | 4 / 6 GHz | 500 MHz | 与地面微波系统相互干扰 |
| Ku | 11 / 14 GHz | 500 MHz | 雨衰 |
| Ka | 20 / 30 GHz | 3500 MHz | 雨衰、设备成本 |

**上、下行频率不同；更高频段能提供较宽频谱，同时需要处理雨衰等问题。**

#### Low-Earth Orbit Satellites

卫星分布在六组环绕地球的轨道上，相邻卫星可以建立链路。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928144701.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**两种转发方式：**

- **星间转发：** 地面终端把信号送上卫星后，经多颗卫星转发，再下传目的地。
- **地面转发：** 卫星把信号下传地面站，经地面网络送到另一地面站，再由卫星送达用户。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928145047.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Satellites vs. Fiber

卫星的优势主要体现在三个场景：

1. **快速部署：** 在已有卫星服务可用时，应急救灾等场景可以较快恢复连接。
2. **地面设施不足：** 高原、荒漠、海洋等地区铺设与维护光纤困难，卫星可以跨越地形障碍。
3. **大范围广播：** 一次下行发送可被覆盖区内许多接收站同时接收，适合电视节目等一对多分发。

## Digital modulation and multiplexing

物理信道中实际传播的是电压、光强等随时间变化的信号。

**数字调制（Digital Modulation）** 规定如何用这些信号表示比特，以及如何在接收端恢复比特；

**复用（Multiplexing）** 让多路信号共享同一条物理信道。

### Baseband Transmission

**基带传输（Baseband Transmission）** 直接用电平、脉冲等表示数据，信号的有效频带从低频延伸到由码元速率、脉冲形状等决定的上限。

线路编码主要需要兼顾三个问题：**带宽效率、时钟恢复、直流平衡**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928145511.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### NRZ and Symbol Rate

**不归零编码（NRZ）** 的基本约定是：用正电压表示 `1`，负电压表示 `0`，每个比特期间维持对应电平。接收端在规定时刻采样，根据阈值或最近电平判决。信号经过信道会衰减、失真并叠加噪声，因此接收波形通常与发送波形不同。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151115.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

“不归零”表示不要求每个比特结束时回到零电平。连续的 `0` 或 `1` 可以形成一整段不变的电平，这也带来同步困难：如果长时间没有跳变，接收端时钟发生少量漂移，就难以确定收到的是 15 个 `0` 还是 16 个 `0`。

带宽有限时，可以增加可区分的信号状态数，使一个码元携带多个比特。设码元速率为 $R_s$，每个码元携带 $k$ 个比特，则：

$$
\boxed{R_b=R_s k},\qquad \boxed{\text{Baud rate}=R_s}.
$$

若 $M=2^k$ 种状态均用于数据，则 $k=\log_2M$。

**波特率表示每秒发送多少个码元**；连续两个码元可以相同。

<details>
<summary>为什么四电平可以降低相同数据速率所需的码元速率？</summary>

用四个电平分别表示 `00、01、10、11`，每个码元携带：

$$
k=\log_2 4=2\ \text{bit/symbol}.
$$

若要发送 $R_b$ bit/s，二电平方案需要 $R_s=R_b$ baud，四电平方案只需要 $R_s=R_b/2$ baud。在相同脉冲成形条件下，所需带宽可以相应降低。

代价是：若总电压范围不变，相邻电平更接近，接收端必须区分更多状态，对噪声和判决精度的要求更高。多电平的收益仍受信噪比限制。

</details>

#### Manchester Encoding

**曼彻斯特编码（Manchester Encoding）** 在每个比特中间安排一次跳变，用跳变方向表示数据。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151103.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- `0`：低电平 → 高电平，即两个半比特电平为 `01`。
- `1`：高电平 → 低电平，即两个半比特电平为 `10`。

可把它理解为“数据与时钟异或”。时钟在一个比特周期内先低后高：与 `0` 异或保持原样，与 `1` 异或得到反相波形。

每个比特中间必有跳变，接收端可以持续校准采样节奏；即使连续发送相同数据，也保留时钟信息。每个比特的正、负电平各占一半，还能保持直流平衡。传统以太网使用这种编码。

**代价是带宽开销**：一个数据比特需要两个半比特信号单元，所需带宽约为 NRZ 的两倍。数据率为 $R_b$ 时，这些半比特信号单元的速率为 $2R_b$；有效数据率仍为 $R_b$。


#### NRZI and 4B/5B

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151051.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**反向不归零编码（NRZI）** 用“电平是否翻转”表示比特。遇到 `1` 翻转，遇到 `0` 保持不变。解码依赖电平相对于前一状态的变化，需要明确初始电平。

这种约定解决了连续 `1` 缺乏跳变的问题，但连续 `0` 仍会造成同步困难。不同系统可以采用相反的比特约定；

一种进一步限制长串 `0` 的办法是 **4B/5B 编码**：每 4 个数据比特映射成 5 个编码比特，再交给相应线路编码处理。映射如下：

| 数据 4B | 码字 5B | 数据 4B | 码字 5B |
| --- | --- | --- | --- |
| `0000` | `11110` | `1000` | `10010` |
| `0001` | `01001` | `1001` | `10011` |
| `0010` | `10100` | `1010` | `10110` |
| `0011` | `10101` | `1011` | `10111` |
| `0100` | `01010` | `1100` | `11010` |
| `0101` | `01011` | `1101` | `11011` |
| `0110` | `01110` | `1110` | `11100` |
| `0111` | `01111` | `1111` | `11101` |

合法数据码字内部及相邻码字拼接后，**连续 `0` 最多为 3 个**。

配合 `1` 时翻转”的 NRZI 约定，可以保证有足够频繁的跳变。32 种五位组合中只用 16 种表示数据，其余部分可用于空闲、帧起始等控制用途，但并非所有剩余组合都适合作为控制码。

<details>
<summary> 4B/5B 如何编码，25% 开销与 80% 效率如何计算？</summary>

以数据 `0000 0001` 为例，查表得到：

$$
\texttt{0000\ 0001}\longrightarrow\texttt{11110\ 01001}.
$$

8 个数据比特变成 10 个编码比特。因此：

$$
\text{额外开销}=\frac{5-4}{4}=25\%,\qquad
\text{有效数据占比}=\frac45=80\%.
$$

若数据率为 $R_b$，编码后的比特率为 $\frac54R_b$；若后续每个二电平码元传一个编码比特，相应码元速率也为 $\frac54R_b$。开销的分母是原始数据量，效率的分母是总发送量。

“没有连续三个 `0`”过于严格。例如：

$$
\texttt{0010\ 0001}\longrightarrow\texttt{10100\ 01001},
$$

拼接边界处恰好出现三个连续 `0`，仍是合法编码。

</details>

#### Scrambling and Balanced Signals

**扰码（Scrambling）** 在发送前将数据与伪随机序列异或，使输出更接近随机序列，减少长时间重复模式以及集中的频谱峰值。接收端使用同样的序列和对齐状态再次异或，就能恢复原数据。

<details>
<summary>为什么异或两次可以恢复数据？</summary>

设数据为 $d$、伪随机序列为 $p$，则：

$$
x=d\oplus p,\qquad x\oplus p=d\oplus(p\oplus p)=d.
$$

这种扰码不增加发送比特数，但无法绝对保证没有长串相同比特。例如 $d=p$ 时，输出全部为 `0`。它的主要作用是改善信号特性；

</details>

**平衡信号（Balanced Signals）** 的正、负部分基本抵消，平均值接近零，因而没有显著直流分量。电容耦合等连接会滤去直流分量，发送较大的直流成分会浪费能量，还可能使判决基准漂移。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151023.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**交替传号反转（AMI）** 使用三个电平：

- `0` 用零电平表示。
- 相继出现的 `1` 交替使用 $+V$、$-V$；中间即使隔着若干 `0`，下一个 `1` 仍与上一个 `1` 极性相反。

正、负脉冲数量至多相差一个，因此累计不平衡受到限制，长时间平均值趋近于零，**不要求原始数据中的 `0` 与 `1` 等概率出现**。AMI 的三个电平承担编码约束，不能直接按 $\log_2 3$ 计算每码元的有效数据量。连续 `0` 仍没有跳变，直流平衡与时钟恢复需要分别考虑。

<details>
<summary> 按规则为 10000101111 编码</summary>

令 `+、−` 表示高、低电平，`0` 表示零电平；NRZI 初始电平取低，AMI 第一个 `1` 取正电平：

```text
数据：       1  0  0  0  0  1  0  1  1  1  1
NRZ：        +  −  −  −  −  +  −  +  +  +  +
NRZI：       +  +  +  +  +  −  −  +  −  +  −
Manchester：10 01 01 01 01 10 01 10 10 10 10
AMI：        +  0  0  0  0  −  0  +  −  +  −
```

</details>

### Passband Transmission

**带通传输（Passband Transmission）** 把数据调制到指定的非零频率范围。接收端经过解调，可以重新得到对应的基带信号。

无线通信通常需要较高频率的载波。一方面，天线尺寸与波长相关，而 $\lambda=c/f$，频率过低会使合适的天线尺寸过大；另一方面，频率分配与避免干扰也要求系统在指定频段工作。有线信道同样可以使用带通传输，把多路信号放在不同频段中。

频谱搬移改变信号所处的位置；所需带宽还取决于具体调制与滤波方式。

#### ASK, FSK, and PSK

可通过载波的振幅、频率或相位承载数据：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151545.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **振幅键控（ASK）**：用不同振幅表示数据，波形中以“有载波／无载波”表示两种状态。
- **频移键控（FSK）**：用不同载波频率表示数据，波形上表现为振荡疏密不同。
- **相移键控（PSK）**：用不同相位表示数据。二进制形式 BPSK 可用 $0^\circ$、$180^\circ$，每码元携带 1 bit。
- **正交相移键控（QPSK）**：采用 $45^\circ、135^\circ、225^\circ、315^\circ$ 四种相位，每码元携带 2 bit。

例如，ASK 可写为 $s_m(t)=A_mg(t)\cos(2\pi f_ct)$：$A_m$ 决定所发送的幅度状态，$g(t)$ 为脉冲形状，$f_c$ 为载波频率。BPSK 则可以固定振幅，改变余弦中的相位项。

#### Constellation Diagrams and QAM

**星座图（Constellation Diagram）** 把每个合法码元表示为平面上的一个点：

点到原点的距离对应振幅，与横轴的夹角对应相位。

接收信号受噪声影响后会偏离发送点，接收端通常据最近的合法点作判决。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151723.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**正交幅度调制（QAM）** 可看作同时利用振幅与相位，也可由两路相互正交的载波分量合成。横轴 $I$、纵轴 $Q$ 分别表示两路分量；矩形 QAM 在两轴上选取离散幅度，组合出所有星座点：

- QPSK：4 个点，$\log_2 4=2$ bit/码元。
- 16-QAM：每轴 4 种取值，共 $4\times4=16$ 个点，4 bit/码元。
- 64-QAM：每轴 8 种取值，共 $8\times8=64$ 个点，6 bit/码元。

按两轴分量组合更便于电路实现，因此 QAM 星座呈方形点阵。**星座点数才是用于计算 $\log_2M$ 的状态总数**。

<details>
<summary> 相同波特率下，QPSK、16-QAM 与 64-QAM 的比特率如何比较？</summary>

在不计信道编码、导频等开销，且码元速率都为 $R_s$ 的条件下：

$$
R_{\mathrm{QPSK}}=2R_s,\qquad
R_{\mathrm{16QAM}}=4R_s,\qquad
R_{\mathrm{64QAM}}=6R_s.
$$

因此比特率之比为 $1:2:3$。更密的星座可以提高相同码元速率下的比特率，但若平均发射功率固定，点间距通常变小，更容易被噪声推入相邻点的判决区域。

</details>

#### Gray Code

星座点确定后，还要决定每个点对应哪一组比特。**格雷码（Gray Code）** 让相邻点的标签尽量只相差一位，以减少符号误判造成的比特错误数。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151824.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

对方形 16-QAM，**水平或垂直方向的最近邻标签只相差 1 bit**；斜对角邻居通常相差 2 bit。噪声较小时，最近邻误判更常见，因此这种映射可以降低错误比特数。格雷码本身不负责检测或纠正错误。

<details>
<summary> 发送 1101，接收点 A、B、C、D、E 分别怎样判决？</summary>

按照图 2-24：

| 接收点 | 判决结果 | 相对 `1101` 的错误位数 |
| --- | --- | --- |
| A | `1101` | 0 |
| B | `1100` | 1 |
| C | `1001` | 1 |
| D | `1111` | 1 |
| E | `0101` | 1 |

例如，`1101 → 1001` 只改变第二位；`1101 → 1111` 只改变第三位。斜上方的 `1000` 与 `1101` 相差两位

</details>

### FDM

**频分复用（FDM）** 把可用频谱划分成多个频带，每路信号占用其中一段，各路可以同时发送。发送端将不同信号搬移到不同频段后合成，接收端选择所需频带并解调。

实际滤波器的边缘不够陡峭，邻近信号之间通常保留**保护频带（Guard Band）**，降低相互干扰；保护频带消耗可用频谱，也无法保证任意强干扰都被完全隔离。

<details>
<summary> 三路电话信号如何复用到 60–72 kHz？</summary>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928151956.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中先把三路低频话音分别搬移到不同频率位置，每路分配一个 $4\ \mathrm{kHz}$ 的频率区间：

$$
60\text{–}64\ \mathrm{kHz},\quad
64\text{–}68\ \mathrm{kHz},\quad
68\text{–}72\ \mathrm{kHz}.
$$

三路合计占用：

$$
3\times4\ \mathrm{kHz}=12\ \mathrm{kHz}.
$$

区间中包含用于隔离的频率余量，不能把每路分配的 $4\ \mathrm{kHz}$ 全部视为有效话音频谱。图左原信号标注的是 $300\text{–}3100\ \mathrm{Hz}$，按两端点之差计算为 $2800\ \mathrm{Hz}$；

</details>

### OFDM

**正交频分复用（OFDM）** 把宽信道划分为许多子载波，每个子载波独立携带一部分数据，例如使用 QAM。一条高速数据流可以拆成多条低速流，在子载波上并行发送。

**相邻子载波的频谱可以重叠，关键是它们在接收端规定的符号区间内保持正交。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928164804.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中，一个子载波在自己的中心频率处达到峰值，同时其他子载波在该中心频率处为零，因此在理想同步和正确解调条件下可以分离各路分量。重叠本身不会破坏正交性。

<details>
<summary>为什么间隔为 1/T 的子载波可以正交？</summary>

设有效符号持续时间为 $T$，子载波频率满足 $f_k-f_\ell=(k-\ell)/T$。对不同子载波，在同一个完整有效符号区间内：

$$
\frac1T\int_0^T e^{j2\pi f_kt}e^{-j2\pi f_\ell t}\,dt
=
\frac1T\int_0^T e^{j2\pi(k-\ell)t/T}\,dt
=0,\qquad k\ne\ell.
$$

因此接收端通过相关运算或傅里叶变换，可提取各子载波上的系数。矩形时间窗对应 sinc 形状的幅度谱；功率谱则与 sinc 的平方成正比。图中重叠的频谱与这些积分为零并不矛盾。

</details>

实际系统常在符号前添加**循环前缀（Cyclic Prefix）**，即复制符号末尾的一段作为保护时间，以缓解多径引起的相邻符号干扰，并在条件满足时保持有效区间中的子载波正交。它会消耗时间开销。

### TDM

**时分复用（TDM）** 把时间划分成**时隙（Time Slot）**，让各路信号按固定次序轮流使用链路。某一路在分给自己的时隙内使用整个传输频带，其他路等待各自时隙。

发送端按照约定顺序交织各路数据，接收端根据时隙位置拆分数据。因此时隙和帧边界需要同步；必要时设置保护时间，容纳少量时间偏差。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928165322.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

<details>
<summary>例：三路输入流复用后，链路速率应为多少？</summary>

设各路持续输入速率为 $R_1、R_2、R_3$，忽略帧头、保护时间等开销，要完整承载三路输入，需要：

$$
R_{\mathrm{out}}=R_1+R_2+R_3.
$$

若三路都是 $R$ bit/s，则输出为 $3R$ bit/s。复用器在每轮分别取出三路的数据，以更快的输出速率依次发送。

若加入同步位和保护时间，为保持相同有效数据吞吐量，物理链路的发送能力还需要留出对应开销。固定时隙分配中，一路暂时无数据时，其时隙可能空置；按实际需求动态分配时隙属于统计时分复用的思路。

</details>

### CDM

**码分复用（CDM）** 用不同的编码序列区分共享信道的信号；用于多个用户接入时称为 **码分多址（CDMA）**。各站可以在同一时间使用同一频带，接收端利用对应序列提取目标站的数据。

#### Chips and Spreading

把一个数据比特的时间划分为 $m$ 个更短的**码片（Chip）**。每个站拥有一个长度为 $m$ 的码片序列，通常以 $+1、-1$ 表示；典型扩频长度为 64 或 128。

设站 $A$ 的码片向量为 $\mathbf A$，则：

- 发送数据 `1`：发送 $\mathbf A$。
- 发送数据 `0`：发送 $-\mathbf A$，即所有分量符号取反。
- 不发送数据：发送零向量，表示静默。

**数据 `0` 与静默必须区分**：数据 `0` 仍然发送完整的负码片序列。

每个数据比特用 $m$ 个码片表示，因此：

$$
\boxed{R_{\mathrm{chip}}=mR_b}.
$$

增加的是码片速率，原始信息速率仍为 $R_b$。在调制、脉冲成形等条件不变时，更高的码片速率需要更宽的频带，这就是扩频的基本代价。

<details>
<summary> 1 MHz 频带由 100 个站共享</summary>

便于比较，假定频谱效率为 $1\ \mathrm{bit/(s\cdot Hz)}$，忽略保护频带等开销。

采用频分方式时，每站分得：

$$
B_{\mathrm{station}}=\frac{1\ \mathrm{MHz}}{100}=10\ \mathrm{kHz},
$$

对应 $10\ \mathrm{kbit/s}$。

采用 CDMA 示意时，每站仍发送 $10\ \mathrm{kbit/s}$ 数据，每 bit 用 100 chips 扩展：

$$
R_{\mathrm{chip}}=100\times10\ \mathrm{kbit/s}
=1\ \mathrm{Mchip/s}.
$$

这样各站都使用整个 $1\ \mathrm{MHz}$ 频带。**100 chips/bit 是扩频因子，1 Mchip/s 才是码片速率**；MHz 到数据率的换算依赖上述假设，不能普遍认为 $1\ \mathrm{Hz}=1\ \mathrm{bit/s}$。这个带宽算例也不能直接证明 100 个实际用户一定可以可靠地同时通信。

</details>

#### Orthogonality and Correlation

理想同步模型为不同站分配相互正交的码片序列。约定这里的“点积”包含归一化：

$$
\boxed{\mathbf S\cdot\mathbf T
=\frac1m\sum_{i=1}^{m}S_iT_i}.
$$

不同站满足 $\mathbf S\cdot\mathbf T=0$；每一对码片相乘得到 $+1$ 或 $-1$，相同位置与不同位置的贡献恰好抵消。对自身及相反序列，则有：

$$
\mathbf S\cdot\mathbf S=1,\qquad
\mathbf S\cdot(-\mathbf S)=-1.
$$

<details>
<summary>为什么自相关为 1，取反后为 −1？</summary>

每个码片 $S_i\in\{-1,+1\}$，所以：

$$
\mathbf S\cdot\mathbf S
=\frac1m\sum_{i=1}^mS_i^2
=\frac{m}{m}=1.
$$

取反得到：

$$
\mathbf S\cdot(-\mathbf S)
=-\frac1m\sum_{i=1}^mS_i^2=-1.
$$

若采用普通线性代数中的未归一化内积，自身内积会等于 $m$。

</details>

多个站同时发送时，其信号按码片位置线性相加。例如某位置三个站发送 $+1$、一个站发送 $-1$，接收值为 $+2$。若接收向量为：

$$
\mathbf R=a_A\mathbf A+a_B\mathbf B+a_C\mathbf C+\cdots,
\qquad a_i\in\{-1,0,+1\},
$$

接收端要恢复站 $C$，就计算 $\mathbf R\cdot\mathbf C$。利用正交性，其他站的项消失，只留下 $a_C$：

$$
\boxed{\mathbf R\cdot\mathbf C=a_C}.
$$

结果 $+1$ 表示 $C$ 发送 `1`，$-1$ 表示发送 `0`，$0$ 表示静默。这三个精确值对应无噪声、码片同步、码序列正交且幅度归一化的课堂模型。

#### Example

**Four Stations**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928165549.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

四个站采用以下码片序列：

$$
\begin{aligned}
\mathbf A&=(-1,-1,-1,+1,+1,-1,+1,+1),\\
\mathbf B&=(-1,-1,+1,-1,+1,+1,+1,-1),\\
\mathbf C&=(-1,+1,-1,+1,+1,+1,-1,-1),\\
\mathbf D&=(-1,+1,-1,-1,-1,-1,+1,-1).
\end{aligned}
$$

例如 $A$ 发送 `0` 时，发出的向量是 $(+1,+1,+1,-1,-1,+1,-1,-1)$。

<details>
<summary>展开</summary>

先检验 $A$ 与 $B$ 的正交性：

$$
\mathbf A\cdot\mathbf B
=\frac{1+1-1-1+1-1+1-1}{8}=0.
$$

其他不同站之间也满足正交条件。六组接收信号为：

$$
\begin{aligned}
\mathbf S_1&=\mathbf C\\
&=(-1,+1,-1,+1,+1,+1,-1,-1),\\[2pt]
\mathbf S_2&=\mathbf B+\mathbf C\\
&=(-2,0,0,0,+2,+2,0,-2),\\[2pt]
\mathbf S_3&=\mathbf A-\mathbf B\\
&=(0,0,-2,+2,0,-2,0,+2),\\[2pt]
\mathbf S_4&=\mathbf A-\mathbf B+\mathbf C\\
&=(-1,+1,-3,+3,+1,-1,-1,+1),\\[2pt]
\mathbf S_5&=\mathbf A+\mathbf B+\mathbf C+\mathbf D\\
&=(-4,0,-2,0,+2,0,+2,-2),\\[2pt]
\mathbf S_6&=\mathbf A+\mathbf B-\mathbf C+\mathbf D\\
&=(-2,-2,0,-2,0,-2,+4,0).
\end{aligned}
$$

这些向量逐位置相加即可得到。例如 $S_4$ 表示 $A$ 发送 `1`、$B$ 发送 `0`、$C$ 发送 `1`、$D$ 静默，故中间项是 $-\mathbf B$。

依次与 $\mathbf C$ 逐项相乘、求和，再除以 8：

$$
\begin{aligned}
\mathbf S_1\cdot\mathbf C&=\frac{1+1+1+1+1+1+1+1}{8}=1,\\
\mathbf S_2\cdot\mathbf C&=\frac{2+0+0+0+2+2+0+2}{8}=1,\\
\mathbf S_3\cdot\mathbf C&=\frac{0+0+2+2+0-2+0-2}{8}=0,\\
\mathbf S_4\cdot\mathbf C&=\frac{1+1+3+3+1-1+1-1}{8}=1,\\
\mathbf S_5\cdot\mathbf C&=\frac{4+0+2+0+2+0-2+2}{8}=1,\\
\mathbf S_6\cdot\mathbf C&=\frac{2-2+0-2+0-2-4+0}{8}=-1.
\end{aligned}
$$

因此 $C$ 的状态依次为：**发送 `1`、发送 `1`、静默、发送 `1`、发送 `1`、发送 `0`**。

也可利用正交性直接判断，例如：

$$
(\mathbf A-\mathbf B+\mathbf C)\cdot\mathbf C
=0-0+1=1.
$$

考试计算时，重点检查每站发送的是正码、负码还是静默，并在最后做归一化。

</details>

#### Practical Limitations

模型把不同用户完全分开的关键前提，是各码片在接收端对齐且码序列正交。实际异步到达、多径、噪声及接收功率差异都会削弱分离效果；

非完全正交用户的信号可能表现为额外干扰，需要适当的码设计和功率控制。

Walsh 码可构造正交序列，但固定长度为 $m$ 时，$m$ 维空间中最多容纳 $m$ 个非零且两两正交的向量。增加码片长度有助于容纳更多理想正交用户，同时会提高维持相同数据率所需的码片速率与带宽。

因此，CDMA 容量受多用户干扰限制，应理解为：**在给定扩频带宽和系统参数下，可同时可靠服务的用户数量受到干扰水平的约束**。

## Three examples of communication examples

前面的调制、编码与复用技术，会组合成实际的通信系统。

### Public Switch Telephone Network

**公共交换电话网（Public Switched Telephone Network，PSTN）** 最初服务于语音通信。

**用户如何接入、干线如何承载大量通话、交换局如何把通信送往目的地。**

#### Structure of the Telephone System

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928170103.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

电话网的结构演变：早期若让每两个用户直接相连，$n$ 个用户需要 $n(n-1)/2$ 条线路；引入集中交换局后，每个用户只需连接交换局，再由交换局接通双方。规模继续扩大时，多个交换局之间通过干线互连，形成分层网络。

电话系统的三部分分别是：

- **本地环路（Local Loop）**：用户与本地交换局之间的接入线路，常称“最后一公里”。传统上使用双绞线，数据接入可采用电话调制解调器、ADSL 或光纤。
- **干线（Trunk）**：交换局之间的高速链路，主要任务是利用复用承载大量通话或数据流。
- **交换局（Switching Office）**：根据通信目的地，把输入线路上的通信转接到适当的输出线路。远距离通信可能经过本地交换局、长途交换局和中间交换局。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928170159.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

例如，同一本地交换局下的两户通话，可在该局内接通；不同本地交换局下的用户通信，还要经过交换局之间的干线。**接入线路解决“接进来”，干线解决“大量传送”，交换解决“转到哪里”。**

#### The Local Loop: Modems, ADSL, and Fiber

##### Telephone Modems

**调制解调器（Modem）** ：发送时把比特映射为适合信道传输的信号，接收时从信号中恢复比特。

传统语音通路主要保留约 **300–3400 Hz** 的成分，带宽约为 $3100$ Hz；算上保护频带，电话系统按约 **4 kHz 一个信道**组织。

提高 modem 的比特率，仍要用到前面的关系：

$$
R_b=R_s\log_2M.
$$

在符号率受限时，可以让每个符号对应更多比特。例如，$2400$ baud、每符号 $2$ bit，对应 $4800$ bit/s。但星座点越密集，接收端越容易因噪声把一个点判成邻近点，因此可用速率同时受信道质量约束。

例子采用 $32$ 个星座点，每符号承载 $4$ 个数据比特和 $1$ 个校验比特，在 $2400$ baud 下的**用户数据率**为：

$$
2400\times4=9600\ \mathrm{bit/s}.
$$

**有纠错冗余时，$\log_2M$ 个编码比特中只有一部分是用户数据。** 

本地交换局中的 **编解码器（Codec）** 把模拟语音波形转换成数字样本，以便进入数字干线。它与 modem 的目标不同：codec 表示语音等模拟信号的采样值，modem 从用于承载数据的波形中判定比特。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928172630.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Sampling and Reconstruction

**采样（Sampling）** 把连续时间信号变成一系列离散时刻的样本。

设采样间隔为 $T_s$，采样频率为：

$$
f_s=\frac1{T_s}.
$$

每个脉冲所在的时刻取出信号值；脉冲间隔越小，采样越密。

从频域看，**时域采样会使原频谱以 $f_s$ 为间隔重复出现**。

当采样频率过低，各频谱副本发生重叠，形成**混叠（Aliasing）**。这时接收端无法仅凭这些样本区分原本不同的信号。

对最高频率为 $B$ 的理想带限信号，通常写成采样条件：

$$
\boxed{f_s>2B}.
$$

$2B$ 是奈奎斯特采样率的临界值；恰好取等号时还需注意边界频率成分等条件。实际系统通常预留余量，并在采样前限制高频成分。

- **采样足够密**：频谱副本分离，可用理想低通滤波器取出原频谱，再重构信号。
- **采样过稀**：频谱副本重叠，低通滤波也无法把已经混合的成分分开。
- **信号并非严格带限**：不能在有限采样率下无条件精确重构全部频率成分，通常先滤波，再按所保留的频带采样。


<details>
<summary> 为什么采样复制频谱，为什么 sinc 可以重构信号？</summary>

用冲激串表示采样位置：

$$
s(t)=\sum_{n=-\infty}^{\infty}\delta(t-nT_s).
$$

原信号 $x(t)$ 与它相乘，得到：

$$
x_s(t)=x(t)s(t)
=\sum_{n=-\infty}^{\infty}x(nT_s)\delta(t-nT_s).
$$

每根冲激的权重就是相应时刻的样本值。利用“时域相乘对应频域卷积”，可得：

$$
X_s(f)=\frac1{T_s}\sum_{k=-\infty}^{\infty}X(f-kf_s).
$$

因此，原频谱会出现在 $0,\pm f_s,\pm2f_s,\ldots$ 附近。若原频谱位于 $[-B,B]$，相邻副本不重叠所需的条件为 $f_s>2B$。

在理想带限、无限长精确样本等条件下，低通滤波可保留中央频谱并补偿幅度。频域矩形滤波器对应时域 sinc 函数，因此也可把重构理解为：给每个样本放置一个按样本值缩放、按采样位置平移的 sinc，再把它们相加。

$$
x(t)=\sum_{n=-\infty}^{\infty}x(nT_s)
\operatorname{sinc}\!\left(\frac{t-nT_s}{T_s}\right),
\qquad
\operatorname{sinc}(u)=\frac{\sin(\pi u)}{\pi u}.
$$

在某个采样点 $t=mT_s$，第 $m$ 项的 sinc 为 $1$，其余项为 $0$，所以重构信号恰好经过原来的样本点。

</details>

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182257.png" style="width: calc((100% - 16px) / 2); max-width: 420px; height: auto; display: block; margin: 0;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182305.png" style="width: calc((100% - 16px) / 2); max-width: 420px; height: auto; display: block; margin: 0;" />
</div>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182311.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Why 56 kbps?

**先分清三个量：每秒采多少次、每个样本多少位、这些位中多少可用于用户数据。**

电话系统采用每秒 $8000$ 次采样，每个样本 $8$ bit，因此一个未压缩数字话音信道的速率为：

$$
8000\times8=64000\ \mathrm{bit/s}=64\ \mathrm{kbps}.
$$

旧式电话系统的兼容条件解释 $56$ kbps：若每个 $8$ bit 样本只能保证 $7$ bit 用于数据，则：

$$
8000\times7=56000\ \mathrm{bit/s}=56\ \mathrm{kbps}.
$$

欧洲系统可为用户保留完整的 $8$ 位，数字通道容量可达 $64$ kbps；

56 kbps modem 的典型下行连接由 **ISP 直接数字接入电话网，用户侧保留模拟本地环路**，从而改善可达到的速率。

**下行**指 ISP 到用户，**上行**指用户到 ISP。

##### Digital Subscriber Lines

**数字用户线（Digital Subscriber Line，DSL）** 利用已经铺设的双绞线提供数据接入。

**非对称数字用户线（ADSL）** 为上行和下行分配不同容量，通常下行更大。

传统电话服务把通路限制在语音频带；双绞线本身还能传送更高频率的成分。ADSL 在进入语音交换系统之前分离数据，利用约 $1.1$ MHz 的频谱，因此能大幅超过拨号 modem 的数据率。实际可用速率仍受线路长度、衰减、串扰与线材质量限制；距离交换局越远，一般越难达到高数据率。

**ADSL 的 DMT 频带分配**

ADSL 使用**离散多音调制（Discrete MultiTone，DMT）**，属于前面介绍的 OFDM 思路：把频带分为许多正交子载波，每条子信道承载一部分数据。

典型方案把约 $1.1$ MHz 分为 $256$ 个子信道；间隔为 $4312.5$ Hz，近似写为 $4$ kHz。

- **子信道 0**：传统电话业务，称 POTS，主要使用约 $0$–$4$ kHz 的低频部分。
- **子信道 1–5**：留空，隔开语音与数据频带。
- **剩余 250 个子信道**：$256-1-5=250$；按模型，其中各有一个用于上行和下行控制，余下 $248$ 个用于用户数据。
- **上行与下行分配**：更多子信道给下行；分配比例依方案而定，“非对称”体现在两个方向的可用容量不同。

每个数据子信道还可采用 QAM。系统根据该子信道的信噪比选择每符号比特数：质量好时采用更多星座点，质量差时减少比特数，甚至停用该子信道。因此，**子信道数相同，也不代表总数据率一定相同。**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182609.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

**ADSL 如何与打电话共存？**

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182650.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

用户侧的**分离器（Splitter）** 是模拟滤波器，把同一电话线中的低频语音与较高频数据分开：低频送往电话，高频送往 ADSL modem，再通过以太网等接口连接计算机。

交换局侧同样放置分离器：语音进入 codec 和语音交换设备；约 $26$ kHz 以上的数据部分进入 **数字用户线接入复用器（Digital Subscriber Line Access Multiplexer，DSLAM）**，解调后送往 ISP。这样，电话和上网占用不同频带，可以同时进行。

图中的 **网络接口设备（Network Interface Device，NID）** 标示运营商线路与用户侧线路的分界；分离器承担实际的频带分离。

几个标准上限为：

- **ADSL / G.dmt**：下行 $8$ Mbps，上行 $1$ Mbps。
- **ADSL2**：下行 $12$ Mbps，上行 $1$ Mbps。
- **ADSL2+**：把所用频谱扩展到约 $2.2$ MHz，下行提高到 $24$ Mbps。

##### Fiber To The Home

**光纤到户（Fiber To The Home，FTTH）** 把光纤接入延伸到家庭，减少铜缆本地环路对速率的限制。更一般的 FTTx 表示光纤到达不同位置，如楼宇、路边或住户；若光纤只到楼宇或路边，最后一小段仍可使用铜缆。

采用的结构是**无源光网络（Passive Optical Network，PON）**：交换局的一根主干光纤，经分光/合光器连接多个住户。这里“无源”主要指中间的光分配网络无需有源放大、交换设备，两端设备仍需要供电。

- **光线路终端（Optical Line Terminal，OLT）**：运营商侧设备，发送下行数据，并协调住户的上行发送。
- **光网络单元/终端（Optical Network Unit / Terminal，ONU / ONT）**：用户侧或靠近用户的设备；终结到户光纤的终端通常称为 ONT。
- **光分路器**：下行把同一光信号分向多个住户，上行把多个分支接入同一主干光纤。

**下行的重点是接收隔离，上行的重点是时间协调。**

下行时，OLT 的光信号经分路器到达多个住户。各终端按地址等信息选取自己的数据；由于共享分光结构本身不能保证数据只到目标住户，还需加密等机制保护通信内容。

上行时，多个住户共享合流后的光纤。若它们的信号在 OLT 处重叠，就可能产生冲突。

OLT 会分配上行时隙，并通过**测距（Ranging）** 估计不同住户的传播时延，调整发送时刻，使数据在 OLT 处按时隙依次到达。

**用户端的发送时间错开还不够，必须保证到达 OLT 的时间也错开。** 各家距离不同，传播时延也不同，这正是同步补偿的必要性。

PON 模型为下行和上行使用不同波长 $\lambda_{\mathrm{down}}$、$\lambda_{\mathrm{up}}$。同一方向再由多个住户共享，结合了波长区分与时间调度。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182759.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### Trunks and Multiplexing

干线的两个特点是：**传送数字信息，同时承载大量用户通信。** 语音先在交换局转换为数字样本，再通过高速干线复用传输。

早期模拟电话网使用 FDM，把每个约 $4$ kHz 的话音通道搬到不同频带。例如，$60$–$108$ kHz 共 $48$ kHz，可以容纳 $12$ 路话音，称为一个 group；$5$ 个 group 共 $60$ 路，构成一个 supergroup。数字化以后，可用数字电路高效地完成 TDM。

##### Digitizing Voice Signals

**脉冲编码调制（Pulse Code Modulation，PCM）** 的基本过程是：**采样、量化、编码**。

1. 按规定间隔取模拟信号的幅度。
2. 把幅度近似到有限个量化等级。
3. 用二进制数表示量化结果，通过数字网络传送。

电话系统每秒采样 $8000$ 次，所以相邻样本间隔为：

$$
\boxed{T_s=\frac1{8000}\ \mathrm{s}=125\ \mu\mathrm{s}}.
$$

每个样本编码为 $8$ bit，即 $256$ 个编码值，于是一路未压缩话音为：

$$
\boxed{R=8000\times8=64\ \mathrm{kbps}}.
$$

**$8000$ samples/s 是采样率，$125\ \mu\mathrm{s}$ 是采样间隔，$64$ kbps 是编码后的比特率。** 三者的单位不同。

即使满足采样定理，有限位数量化仍会产生误差。

##### Time Division Multiplexing

数字干线每隔 $125\ \mu\mathrm{s}$ 从各路话音取出一个样本，按照固定顺序排入一帧。接收端依靠帧同步和时隙位置，把样本还原给各条通话。

**T1：24 路话音加帧开销。** 区分数据格式 DS1 与载波 T1，其基本帧包含 $24$ 个 $8$ bit 样本和 $1$ 个额外的帧同步/控制位。

<details>
<summary> 为什么 T1 的速率是 1.544 Mbps？</summary>

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928182859.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

每帧的样本位数：

$$
24\times8=192\ \mathrm{bit}.
$$

加上一个额外位：

$$
L_{\mathrm{frame}}=192+1=193\ \mathrm{bit}.
$$

每秒 $8000$ 帧，所以总速率为：

$$
R_{T1}=193\times8000
=1\,544\,000\ \mathrm{bit/s}
=\boxed{1.544\ \mathrm{Mbps}}.
$$

其中 $24$ 路样本对应 $1.536$ Mbps，额外帧位对应 $8$ kbps。**每帧额外的 1 bit，与某些旧制式在话音样本内部借用信令位，是两种不同的开销。** 若使用只能保证每路 $7$ 个用户数据位的旧式通道，则每路可可靠承载 $56$ kbps 数据；提供完整数据通道的方案可利用全部 $8$ 位样本位置。

</details>

**E1**：每帧 $32$ 个 $8$ bit 时隙，同样每秒 $8000$ 帧，总速率为：

$$
32\times8\times8000=\boxed{2.048\ \mathrm{Mbps}}.
$$

常见话音配置使用 $30$ 路承载信息，其余用于同步、信令等，信息部分为 $30\times64=1920$ kbps。

**高阶复用会继续加入开销。** 北美层次是：$4$ 路 T1 合成 T2，$7$ 路 T2 合成 T3，$6$ 路 T3 合成 T4；速率分别为 $1.544$、$6.312$、$44.736$、$274.176$ Mbps。

例如：

$$
4\times1.544=6.176\ \mathrm{Mbps}<6.312\ \mathrm{Mbps}.
$$

差出的 $0.136$ Mbps 用于成帧、同步和恢复等。

##### SONET/SDH

**同步光网络（Synchronous Optical Network，SONET）** 与 **同步数字体系（Synchronous Digital Hierarchy，SDH）** 为光纤上的同步时分复用规定共同格式，便于不同设备与不同层次的数字业务互连。

SONET 基本信道 **STS-1** 每隔 $125\ \mu\mathrm{s}$ 发送一帧。一帧按 **9 行、90 列字节**描述，共 $810$ byte：

$$
R_{\mathrm{STS-1}}
=810\times8\times8000
=\boxed{51.84\ \mathrm{Mbps}}.
$$

这里的矩形是帧格式的排版方式，线路上仍逐比特发送。

- 前 $3$ 列为系统开销，包含段开销和线路开销。
- 其余 $87$ 列对应**同步净荷包络（Synchronous Payload Envelope，SPE）**，其中还包含路径开销。
- SPE 可从帧内不同位置开始，甚至跨越相邻两帧；开销中的指针帮助接收端定位。
- 同步系统按固定节奏连续发帧，即使暂时没有用户数据，也保持帧结构与时钟节奏。

<details>
<summary> 51.84 Mbps、50.112 Mbps 与 49.536 Mbps 分别统计什么？</summary>

STS-1 的三个数值按扣除开销的范围区分：

$$
\begin{aligned}
R_{\mathrm{gross}}&=90\times9\times8\times8000=51.84\ \mathrm{Mbps},\\
R_{\mathrm{SPE}}&=87\times9\times8\times8000=50.112\ \mathrm{Mbps},\\
R_{\mathrm{user}}&=86\times9\times8\times8000=49.536\ \mathrm{Mbps}.
\end{aligned}
$$

第一项包含所有位；第二项扣除前 $3$ 列开销；第三项进一步扣除 SPE 内 $1$ 列路径开销，尚未扣除上层协议的封装开销。题目问“线速率”“SPE 速率”“用户净速率”时，需要使用对应口径。

</details>

更高 SONET 速率按 STS-1 的整数倍组织，对应光载波记为 OC-$n$。

例如 STS-3 / OC-3 的总速率为 $3\times51.84=155.52$ Mbps，对应 SDH 的 STM-1。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183024.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Wavelength Division Multiplexing

**波分复用（Wavelength Division Multiplexing，WDM）** 把不同波长的光信号合并到同一根光纤上传送，在接收端再按波长分离。它与 FDM 使用相同的频谱划分思想，只是光通信习惯用波长或“颜色”描述信道。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183049.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

图中，$\lambda_1,\lambda_2,\lambda_3,\lambda_4$ 四个输入光信号经合波器进入同一根长途光纤，在接收端通过分光及滤波分别输出。共享光纤中的信号同时包含四个波长，各分支滤出自己需要的部分。

**WDM 与 TDM 可以叠加使用**：先用不同波长划分光通道，再在某个波长的数字比特流中按时隙复用多个用户。

#### Switching

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183201.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Circuit Switching

**电路交换（Circuit Switching）** 在传输前先建立端到端连接，并沿途预留通信所需资源；连接持续到通信结束，再释放资源。基本过程为：**建立连接、传送数据、释放连接**。

“专用路径”可以由共享物理干线上的固定频带或时隙构成：

- 采用 **FDM**，通话占据一个预分配的频带。
- 采用 **TDM**，通话占据每帧中预分配的时隙；在交换局，输入通信被接到相应输出线路及其时隙上。

建立成功后，通信按预留的容量持续通过各节点，无需在每一跳等待整个数据分组到齐再转发。代价是建立连接需要时间，而且用户暂时不发送时，预留资源通常也空着。

资源不足时，电话可能在**建立连接阶段**被阻塞；连接建立后，已有的带宽预留提供较稳定的服务。路径上的设备或链路故障则会中断经过它的电路。

##### Packet Switching

**分组交换（Packet Switching）** 把数据分成有限长度的分组，通过共享链路逐跳传送。此处采用无需预先建立专用路径的**数据报式分组交换**模型。

- 分组携带必要的首部信息，各节点按转发规则选择输出方向。
- 典型的**存储转发（Store-and-Forward）** 节点先接收完整分组，再将它发到下一跳。
- 不同分组可能经过不同路径，也可能乱序到达；具体路径由路由与转发机制决定，并非每个分组都必然换一条路。
- 共享输出链路忙时，分组需要排队；持续到达速率超过服务能力时，会形成拥塞，缓冲不足还可能丢包。

限制分组长度，可以避免一个长报文长时间独占某条链路；报文分成多个分组后，还能让不同链路同时处理不同分组，形成流水传输。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183217.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

##### Circuit Switching vs. Packet Switching

| 比较项 | 电路交换 | 数据报式分组交换 |
| --- | --- | --- |
| 传输前建立连接 | 需要 | 无需建立专用路径 |
| 资源分配 | 沿途预留频带或时隙 | 按分组实际需求共享 |
| 路径与次序 | 同一电路沿固定路径，保持次序 | 路径可能变化，可能乱序 |
| 交换方式 | 建立后连续通过预留通路 | 典型方式为逐分组存储转发 |
| 资源紧张的表现 | 建立连接时可能被阻塞 | 传输时可能排队、拥塞或丢包 |
| 用户暂时空闲 | 已预留的资源可能闲置 | 其他用户可使用空闲链路 |
| 中间设备故障 | 经过该设备的电路中断 | 可在路由恢复后绕行，仍可能丢包或中断一段时间 |

##### Statistical Multiplexing

**统计复用（Statistical Multiplexing）** 根据用户实际产生的数据按需分配链路。它利用“许多用户不会始终同时满负荷发送”这一流量特点，使共享资源能承载更多间歇活动的用户。

<details>
<summary>例题：10 个用户共享 1 Mbps，只有 1 人产生 1000 个 1000-bit 分组，需要多久发完？</summary>

**题设**：链路总速率 $1$ Mbps，共有 $10$ 个用户。其中一人突然产生 $1000$ 个分组，每个分组 $1000$ bit，其他用户全部空闲。比较每帧固定划分 $10$ 个时隙的 TDM 电路交换与分组交换。

总数据量：

$$
L=1000\times1000=10^6\ \mathrm{bit}.
$$

**电路交换**：该用户只能使用属于自己的时隙，即平均分得总容量的 $1/10$：

$$
R_{\mathrm{user}}=\frac{1\ \mathrm{Mbps}}{10}=100\ \mathrm{kbps},
$$

$$
t_{\mathrm{circuit}}=\frac{10^6}{100\times10^3}
=\boxed{10\ \mathrm{s}}.
$$

即使其他九个用户没有数据，也不会自动把他们预留的时隙都交给这个用户。

**分组交换**：其余用户空闲时，活动用户可连续使用整个 $1$ Mbps 链路：

$$
t_{\mathrm{packet}}=\frac{10^6}{10^6}
=\boxed{1\ \mathrm{s}}.
$$


</details>

<details>
<summary>例题：35 个用户各有 0.1 的活动概率，同时超过 10 人的概率是多少？</summary>

**题设**：仍考虑 $1$ Mbps 链路，每个用户活动时需要 $100$ kbps，因此链路可以同时满足 $10$ 个活动用户。现接入 $35$ 个用户，每人在所考察时刻活动的概率为 $p=0.1$。

**关键前提**：各用户的活动状态相互独立，并具有相同的活动概率。令 $X$ 为同时活动的人数，则：

$$
X\sim\operatorname{Binomial}(35,0.1).
$$

恰好有 $n$ 个用户活动的概率为：

$$
P(X=n)=\binom{35}{n}(0.1)^n(0.9)^{35-n}.
$$

其中 $\binom{35}{n}$ 表示从 $35$ 人中选出活动的 $n$ 人；$(0.1)^n$ 对应这些人活动，$(0.9)^{35-n}$ 对应其他人空闲。

不超过 $10$ 人活动的概率为：

$$
\begin{aligned}
P(X\le10)
&=\sum_{n=0}^{10}\binom{35}{n}(0.1)^n(0.9)^{35-n}\\
&\approx0.9995757024\approx0.9996.
\end{aligned}
$$

超过 $10$ 人，即至少 $11$ 人活动的概率为：

$$
\boxed{
P(X\ge11)=1-P(X\le10)
\approx0.0004242976\approx0.0004
}.
$$

换算为百分比约为 **$0.0424\%$**；

电路交换若为每个已接入用户始终预留 $100$ kbps，则只能安排 $10$ 个这样的用户。分组交换在上述流量模型下能接入 $35$ 人，因为多数时刻同时活动的人数较少；其期望为：

$$
E[X]=35\times0.1=3.5.
$$

</details>

### Cellular Networks

#### Cellular Concept

**蜂窝网络（Cellular Network）** 把服务区域划分成多个小区，每个小区由基站提供无线接入。

**频率复用（Frequency Reuse）** 是扩大系统容量的关键：在传统频率规划中，相邻小区使用不同频率组，距离足够远的小区可以重复使用同一组频率，控制同频干扰。一个**小区簇（Cluster）** 包含 $N$ 个小区，合起来使用系统分配的全部频率。

如果系统有 $F$ 个可分配信道，按七个小区平均分配，则每个小区约有 $F/7$ 个；这个簇可在其他区域重复部署。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183419.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

六边形可以无缝平铺，各相邻小区中心到本小区中心的距离相同，方便分析覆盖与干扰。

方形布局的相邻中心距离有 $d$ 和 $\sqrt 2d$ 两种；正六边形布局的六个最近邻中心距离均为 $d$。实际覆盖还受地形、建筑和发射功率影响，边界通常不规则。

用户密度上升时，有两种相关手段：

- **小区分裂（Cell Splitting）**：降低发射功率，将繁忙小区分成更小的小区，增加基站，使相同频率在同一地区内复用更多次；代价是部署与切换管理增加。
- **扇区化（Sectoring）**：用定向天线分别覆盖不同方向，例如三个扇区，减少向其他方向发出的干扰。它与把区域分成更多小区是两个不同操作。

#### Mobile Generations

| 代际 | 语音业务 | 数据与整体交换方式 |
| --- | --- | --- |
| 1G | 模拟语音、电路交换 | 主要面向语音 |
| 2G | 数字语音、电路交换 | 逐步引入分组数据，电路与分组共存 |
| 3G | 电路交换语音 | 加强分组数据能力，电路与分组共存 |
| 4G | 基于 IP 的语音，如 VoLTE | 全 IP、分组交换 |
| 5G | 基于 IP 的语音，如 VoNR | 全 IP、分组交换 |

#### GSM Architecture

**全球移动通信系统（GSM）** 是 2G 的主要例子。图中的连接关系为：手机通过无线接口连接基站，基站接入基站控制器，再连接移动交换中心及 PSTN。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183503.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **SIM 卡（Subscriber Identity Module）**：保存用户身份、账户相关信息及认证所需信息，使网络能够识别用户。
- **基站控制器（BSC）**：管理一组基站的无线资源，参与切换控制。
- **移动交换中心（MSC）**：负责呼叫路由、移动业务控制，并连接固定电话网络。
- **归属位置寄存器（HLR）**：保存用户的归属资料及当前服务区域相关信息，让网络能找到被叫用户所在的位置。
- **访问位置寄存器（VLR）**：保存当前在本服务区域内活动的用户信息，支持本地呼叫与移动管理。

用户移动后，相关位置信息要及时更新；**无线连接切换与位置登记是相关但不同的过程**，不能理解为每经过一个小区就必然对所有数据库做相同更新。

#### GSM Channels and Frames

GSM 结合了**频分多址（FDMA）**和**时分多址（TDMA）**：先划分载频，再让多个用户轮流使用每个载频。上下行使用成对频率，属于频分双工。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183554.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

GSM 900 例子有 **124 对载频，每个载频间隔 200 kHz，每个 TDMA 帧有 8 个时隙**。一个连接使用一对载频上的指定时隙，上下行时隙在时间上错开。 

图示上行中心频率为 **890.2–914.8 MHz**，下行为 **935.2–959.8 MHz**，成对载频相差 **45 MHz**。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183620.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

结构分三层：

1. **一个时隙**约 $577\,\mu s$，含 148 bit 的发送突发和约 $30\,\mu s$ 的保护时间。148 bit 包括两端各 3 bit、两段各 57 bit 的信息、26 bit 的训练序列和 2 个标志位。
2. **一个 TDMA 帧**含 8 个时隙，约 $4.615$ ms；同一用户周期性使用自己的时隙。
3. **一个业务复帧**含 26 个 TDMA 帧，持续 120 ms。按图所示，第 12 帧用于控制，第 25 帧保留，其余 24 帧用于业务。

**控制通道与业务通道各有分工。** 业务通道承载语音或数据；控制通道承担广播小区信息、位置更新、注册、寻呼、接入请求和资源分配。

#### Handoff

**切换（Handoff / Handover）** 指移动过程中把正在使用的无线连接从一个小区转交给另一个小区。GSM 终端可以利用空闲时隙测量邻近基站信号，将结果报告给网络，辅助切换决策。

切换希望减少延迟、减少不必要的切换、降低掉线概率，并兼顾资源接纳造成的呼叫阻塞。**新基站信号更强，并不保证它一定有资源接纳连接。**

设原基站与候选基站对应的接收信号强度为 $S_A,S_B$，阈值为 $T$，迟滞量为 $H>0$：

- **相对信号强度**：当 $S_B>S_A$ 时切换。信号略有波动，就可能在边界来回切换。
- **相对强度＋阈值**：同时要求 $S_B>S_A$ 且 $S_A<T$，原连接仍足够好时继续保持。
- **相对强度＋迟滞（Hysteresis）**：要求 $S_B>S_A+H$，候选基站要明显更强，减少边界处反复切换的“乒乓效应”。
- **阈值＋迟滞**：同时满足 $S_A<T$ 和 $S_B>S_A+H$。
- **预测方法**：结合信号变化趋势或移动情况预测后续质量，提前安排切换。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183754.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

横轴为从 A 向 B 移动的位置，纵轴为接收信号强度。$S_A$ 下降，$S_B$ 上升；另一条较低的上升曲线可理解为 $S_B-H$。各标记含义为：

- $L_1$：两基站信号相等，使用相对强度策略时在此附近切换。
- $L_2$：候选基站比原基站强了 $H$，达到迟滞条件。
- $L_3$：原基站信号降至 $Th_2$，采用该阈值时在此切换。
- $L_4$：原基站信号降至更低的 $Th_3$，切换进一步推迟。

图中位置从左到右是 **$L_1,L_3,L_2,L_4$**。若阈值取较高的 $Th_1$，走到 $L_1$ 前原信号已经低于阈值，决策便与单纯比较相对强度基本相同。阈值过低或迟滞过大又可能使切换太晚，因此需要平衡稳定性与掉线风险。

#### CDMA and Soft Handoff

CDMA 用户通过不同码序列共享频段。实际移动终端的信号难以完全同步，码之间也不总能完全正交，因此系统容量受**多用户干扰**限制。

**功率控制（Power Control）** 用于缓解近远问题：靠近基站的终端信号过强时，残余干扰会掩盖远处终端的弱信号。基站通过反馈调节各终端发射功率，使接收功率维持在合适水平。目标与发射功率大小、距离和信道条件共同有关。

CDMA 中用户静默会减少其他用户受到的干扰；相邻小区可复用同一频段，定向扇区也能进一步降低干扰。共同使用频率还方便实现**软切换（Soft Handoff）**

**软切换** ：先与新基站建立连接，在交叠阶段同时保持新旧连接，再释放旧连接。

**硬切换（Hard Handoff）** ：先结束旧连接，再转入新连接。软切换有助于保持连续性，但仍需无线资源和网络协调，不能据此推断绝不会掉线。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183856.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

### Cable Networks

#### Community Antenna Television and HFC

早期**共用天线电视（CATV）**由高处的大天线接收电视信号，经前端放大，再通过同轴电缆分发到各家。这是从前端到住户的单向广播系统。

接入互联网后，系统需要支持双向数据。**混合光纤同轴网络（HFC）**用光纤承担较长距离的传输，通过光节点进行光电转换，再以同轴电缆连接住户。一个光节点可以连接多条同轴支路，原来的单向放大器也要升级为双向放大器。

前端加入**电缆调制解调器终端系统（CMTS）**，负责管理用户接入、上下行资源，并接入 ISP；住户侧使用 Cable Modem。运营商的最后一公里也可采用光纤或无线接入，本节重点讨论 HFC。

<div style="display: flex; justify-content: center; align-items: flex-start; gap: 16px;">
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928183954.png" style="width: calc((100% - 16px) / 2); max-width: 420px; height: auto; display: block; margin: 0;" />
  <img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928184002.png" style="width: calc((100% - 16px) / 2); max-width: 420px; height: auto; display: block; margin: 0;" />
</div>

#### Spectrum Allocation

电视节目与互联网数据通过**频分复用**共用电缆。北美频谱示例为：

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928184210.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

- **5–42 MHz**：上行数据，即住户发往前端。
- **54–550 MHz**：主要用于电视，其中 **88–108 MHz** 为 FM 广播频段。
- **550–750 MHz**：图中用于下行数据，即前端发往住户。

上下行分得的频谱不同，而且上行还面临多用户噪声汇聚，因此上下行数据率往往不对称。

#### DOCSIS and Cable Modems

**DOCSIS（Data Over Cable Service Interface Specification）** 规定 Cable Modem 与有线接入系统的接口，使不同厂商设备可以按共同规范接入。

调制方式：64-QAM、256-QAM 

DOCSIS 3.1 通过 OFDM、较宽信道和更高效率支持 Gb/s 级下行能力。

#### Resource Sharing: Nodes and Minislots

**同一同轴支路的住户共享接入容量。** 电视广播的同一节目可以同时被很多人接收；各住户下载不同文件时，就需要在共享资源中分别安排数据。

**下行只有前端一个发送者。** 它决定依次发送哪些用户的数据，因此不存在多个住户同时向下行信道发送而造成的争用；下行带宽仍由多个用户共享。

**上行有多个住户发送，需要协调发送机会。**

**微时隙（Minislot）**：

1. Modem 初始化并获取信道参数；通过测距过程校正传播延迟，使上行数据在前端按时到达。
2. 有数据要发送时，先请求所需的微时隙。
3. 前端通过下行公布授予结果，住户在指定时隙发送数据。

请求资源时仍可能发生争用。使用随机接入方式时，请求碰撞后随机退避重试；多次失败会扩大等待范围。码分方式允许有合适码序列的用户同时发送，减少同一时隙的直接碰撞，但仍依赖同步、功率控制和码分离条件。

<img src="https://lazysheep-tuchuang-1345706147.cos.ap-shanghai.myqcloud.com/blog/20260928184451.png"  style="width: 420px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />

#### ADSL vs. Cable

两者都可以在骨干部分使用光纤，主要差异在接入段：

- **介质**：ADSL 使用电话双绞线，Cable 使用同轴电缆；同轴有较大的频谱潜力，但电视等业务会占用一部分资源。
- **共享范围**：ADSL 的本地环路由住户独用；HFC 的同轴支路由多个住户共享。因此邻居的活动会直接影响 Cable 的支路竞争，ADSL 则不会因此共享同一根住户线。两者的上层汇聚网络仍可能拥塞。
- **主要限制**：ADSL 更依赖铜线长度和质量；Cable 还明显受同一共享段的活跃用户数及分配策略影响。增加光节点、缩小共享段可以缓解 HFC 接入拥塞。
