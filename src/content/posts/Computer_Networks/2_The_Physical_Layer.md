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
